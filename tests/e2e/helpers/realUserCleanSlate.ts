/** Job Mitra E2E — wipe LS so the journey does not reuse stale site UUIDs. */

import { type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";

export async function wipeBrowserState(page: Page): Promise<void> {
  await page.addInitScript((splashKey) => {
    try {
      sessionStorage.setItem(splashKey, "1");
    } catch {
      /* ignore */
    }
  }, SPLASH_KEY);
  await page.goto("/#/login", { waitUntil: "domcontentloaded" });
  await page.evaluate((splashKey) => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(splashKey, "1");
  }, SPLASH_KEY);
  await page.goto("/#/login", { waitUntil: "domcontentloaded" });
}

export async function skipSplashAndSetRole(
  page: Page,
  role: "employer" | "employee",
): Promise<void> {
  await page.evaluate(
    ({ splashKey, roleKey, roleValue }) => {
      sessionStorage.setItem(splashKey, "1");
      sessionStorage.setItem(roleKey, roleValue);
      localStorage.setItem("wm_onboarding_complete_v1", "1");
      if (roleValue === "employer") {
        localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
      } else {
        localStorage.setItem("wm_employee_onboarding_complete_v1", "1");
      }
    },
    { splashKey: SPLASH_KEY, roleKey: "wm_role_session_v1", roleValue: role },
  );
  // Do not reload after a live login — a full goto remounts auth and can stall on
  // "Checking your session" while hydrateSession races the create-page assertion.
  const alreadyOnRoleHome = new RegExp(`/#/${role}(?:/|$)`).test(page.url());
  if (!alreadyOnRoleHome) {
    await page.goto(`/#/${role}`, { waitUntil: "domcontentloaded" });
  }
}

export async function signInAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/#/login", { waitUntil: "domcontentloaded" });
  const emailBox = page.locator('input[name="email"]');
  try {
    await emailBox.waitFor({ state: "visible", timeout: 20_000 });
  } catch {
    await page.reload({ waitUntil: "domcontentloaded" });
    await emailBox.waitFor({ state: "visible", timeout: 15_000 });
  }
  await emailBox.fill(email);
  await page.locator('input[name="password"]').fill(password);
  const signInBtn = page.getByRole("button", { name: "Sign in", exact: true });
  const rateLimited = page.getByText(/Too Many Requests|too many login/i);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await signInBtn.click({ force: true });
    const landed = page
      .waitForURL(/\/#\/(employee|employer|admin)/, { timeout: 12_000, waitUntil: "commit" })
      .then(() => "ok" as const);
    const limited = rateLimited.waitFor({ state: "visible", timeout: 12_000 }).then(() => "429" as const);
    const outcome = await Promise.race([landed, limited]).catch(() => "timeout" as const);
    if (outcome === "ok") {
      await page
        .getByRole("status", { name: /Checking your session|Loading page|Loading session/i })
        .waitFor({ state: "hidden", timeout: 20_000 })
        .catch(() => undefined);
      return;
    }
    if (outcome === "429") {
      await page.waitForTimeout(65_000);
      continue;
    }
    const alertText = ((await page.getByRole("alert").textContent().catch(() => "")) ?? "").trim();
    if (/too many/i.test(alertText)) {
      await page.waitForTimeout(65_000);
      continue;
    }
    throw new Error(`Sign-in did not open home. url=${page.url()} alert=${alertText || "none"}`);
  }

  throw new Error(`Sign-in did not open home after retries. url=${page.url()}`);
}

export async function trySelfServeRegister(
  page: Page,
  input: { fullName: string; email: string; password: string; role: "employer" | "employee" },
): Promise<{ ok: boolean; message: string }> {
  await page.goto("/#/register", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: new RegExp(`^${input.role}$`, "i") }).click();
  await page.getByLabel("Full name").fill(input.fullName);
  await page.getByLabel("Email").fill(input.email);
  await page.getByLabel("Password", { exact: true }).fill(input.password);
  await page.getByLabel("Confirm password").fill(input.password);
  await page.locator("input.wm-auth-consent__input").check();
  await page.getByRole("button", { name: "Create account" }).click();
  const alert = page.getByRole("alert");
  const alertText = await alert
    .waitFor({ state: "visible", timeout: 8_000 })
    .then(async () => (await alert.innerText()).trim())
    .catch(() => "");
  const signedIn = /\/#\/(employee|employer)/.test(page.url());
  return { ok: signedIn, message: alertText || page.url() };
}
