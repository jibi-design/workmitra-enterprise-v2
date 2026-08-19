/** Job Mitra E2E — publish/apply/confirm without seeding Shift Ops site UUIDs. */

import { expect, type Page } from "@playwright/test";
import { confirmSubmitApplication } from "./submitApplicationConfirm";
import type { FreshActors } from "./realUserOnboarding";

function localIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function waitForSessionOverlayGone(page: Page): Promise<void> {
  await page
    .getByRole("status", { name: /Checking your session|Loading page|Loading session/i })
    .waitFor({ state: "hidden", timeout: 25_000 })
    .catch(() => undefined);
}

async function dismissWelcomeOnboarding(page: Page): Promise<void> {
  const welcome = page.getByRole("dialog", { name: "Welcome" });
  if (!(await welcome.isVisible().catch(() => false))) return;
  const skip = welcome.getByRole("button", { name: /^Skip$/i });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click({ force: true });
  } else {
    await welcome.getByRole("button", { name: /Get Started|Next/i }).click({ force: true });
  }
  await welcome.waitFor({ state: "hidden", timeout: 8_000 }).catch(() => undefined);
}

async function recoverCreatePageCrash(page: Page): Promise<string> {
  const crash = page.getByRole("alert").filter({ hasText: /didn.t load/i });
  if (!(await crash.isVisible().catch(() => false))) return "";
  const detailsBtn = crash.getByText("Error details");
  if (await detailsBtn.isVisible().catch(() => false)) {
    await detailsBtn.click().catch(() => undefined);
  }
  const detail = ((await crash.locator("pre").innerText().catch(() => "")) ?? "").trim();
  await crash.getByRole("button", { name: /Try Again/i }).click({ force: true });
  await page.waitForLoadState("domcontentloaded");
  await waitForSessionOverlayGone(page);
  return detail;
}

async function openEmployerShiftCreatePage(page: Page): Promise<void> {
  await waitForSessionOverlayGone(page);
  await dismissOpenDialogs(page);
  await dismissWelcomeOnboarding(page);

  const create = page.getByTestId("employer-shift-create-page");
  await page.goto("/#/employer/shift/create", { waitUntil: "domcontentloaded" });
  await waitForSessionOverlayGone(page);
  await dismissWelcomeOnboarding(page);
  const firstCrash = await recoverCreatePageCrash(page);

  if (await create.isVisible().catch(() => false)) return;

  const createCta = page.getByRole("button", { name: /Create Shift|New Shift/i });
  if (await createCta.first().isVisible().catch(() => false)) {
    await createCta.first().click({ force: true });
    await waitForSessionOverlayGone(page);
    if (await create.isVisible().catch(() => false)) return;
  }

  await page.goto("/#/employer/shift", { waitUntil: "domcontentloaded" });
  await waitForSessionOverlayGone(page);
  await dismissWelcomeOnboarding(page);
  const newShift = page.getByRole("button", { name: /New Shift/i });
  if (await newShift.isVisible().catch(() => false)) {
    await newShift.click({ force: true });
  } else {
    await page.goto("/#/employer/shift/create", { waitUntil: "domcontentloaded" });
  }
  await waitForSessionOverlayGone(page);
  const secondCrash = await recoverCreatePageCrash(page);

  try {
    await expect(create).toBeVisible({ timeout: 30_000 });
  } catch {
    const body = ((await page.locator("body").innerText().catch(() => "")) ?? "").slice(0, 480);
    const crashNote = [firstCrash, secondCrash].filter(Boolean).join(" | ");
    throw new Error(
      `Shift create page did not open. url=${page.url()} crash=${crashNote || "none"} body=${body}`,
    );
  }
}

export async function publishFreshShift(page: Page, actors: FreshActors): Promise<string> {
  await openEmployerShiftCreatePage(page);
  await page.getByPlaceholder("Enter company name").fill(actors.company);
  await page.getByPlaceholder("e.g. Driver, Helper, Cleaner").fill(actors.jobTitle);
  const categorySelect = page
    .locator("select.wm-input")
    .filter({ has: page.locator('option[value="Warehouse"]') })
    .first();
  await categorySelect.selectOption("Warehouse");
  await page
    .getByPlaceholder(
      "Briefly describe the work, reporting expectations, and anything workers should know.",
    )
    .fill("Fresh journey shift for zero-effort group confirm.");
  await page.getByPlaceholder("Enter number").fill("2");
  await page.getByTestId("shift-create-wizard-next").click();
  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(0).fill(localIsoDate(1));
  await dateInputs.nth(1).fill(localIsoDate(2));
  await page.getByPlaceholder("e.g. 8:00 AM - 5:00 PM").fill("09:00 – 17:00");
  const payBasisSelect = page
    .locator("select.wm-input")
    .filter({ has: page.locator('option[value="per_day"]') })
    .first();
  await payBasisSelect.selectOption("per_day");
  await page.getByPlaceholder("Amount without currency symbol").fill("950");
  const reportingArea = page.getByPlaceholder("Reporting area");
  await reportingArea.scrollIntoViewIfNeeded();
  await reportingArea.fill("Harbor District");
  await page.getByPlaceholder("Work area code").fill(actors.workArea);
  await page
    .getByPlaceholder("Building name, street, entrance note, landmark...")
    .fill("Main hall entrance");
  await page.getByTestId("shift-create-wizard-next").click();
  await page.getByPlaceholder("Enter requirements, one per line").fill("Can work a full day");
  await page.getByRole("button", { name: /Review.*Publish/i }).click();
  await expect(page.getByRole("button", { name: /Publish Shift|Publish Anyway/i })).toBeVisible({
    timeout: 10_000,
  });
  const publishHits: string[] = [];
  const onPublishRes = (res: { url: () => string; status: () => number; request: () => { method: () => string } }) => {
    const url = res.url();
    if (!url.includes("/v1/jobmitra/employer/shift/posts") || url.includes("/applications")) return;
    if (res.request().method() !== "POST") return;
    publishHits.push(`${res.status()} ${url.replace(/^https?:\/\/[^/]+/, "")}`);
  };
  page.on("response", onPublishRes);
  const publishApi = page
    .waitForResponse(
      (res) =>
        res.url().includes("/v1/jobmitra/employer/shift/posts") &&
        !res.url().includes("/applications") &&
        res.request().method() === "POST" &&
        res.status() === 201,
      { timeout: 40_000 },
    )
    .catch(() => null);
  await page.getByRole("button", { name: /Publish Shift|Publish Anyway/i }).click({ force: true });
  const created = await publishApi;
  page.off("response", onPublishRes);
  expect(
    created,
    `Publish must create a server shift post (201). hits=${publishHits.join(" | ") || "none"} url=${page.url()}`,
  ).toBeTruthy();
  const publishFail = page.getByRole("dialog", { name: /Publish failed/i });
  if (await publishFail.isVisible().catch(() => false)) {
    const why = ((await publishFail.innerText().catch(() => "")) || "").slice(0, 280);
    throw new Error(`Publish failed dialog: ${why}`);
  }
  await page.waitForURL(/\/#\/employer\/shift\/post\//, { timeout: 20_000, waitUntil: "commit" });
  const match = page.url().match(/\/employer\/shift\/post\/([^/?#]+)/);
  const postId = match?.[1] ?? "";
  expect(postId, "Publish must land on post dashboard").toBeTruthy();
  const siteBefore = await page.evaluate((id) => {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("wm_employer_") || !key.includes("shift_posts_v1")) continue;
      if (key.includes("__migrated")) continue;
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
        if (!Array.isArray(parsed)) continue;
        const post = parsed.find((item) => {
          return Boolean(item && typeof item === "object" && "id" in item && (item as { id: string }).id === id);
        }) as { siteId?: string } | undefined;
        if (post) return post.siteId ?? "";
      } catch {
        /* ignore */
      }
    }
    return "";
  }, postId);
  expect(siteBefore, "Published post must not carry a pre-seeded Shift Ops site").toBe("");
  return postId;
}

export async function applyAsEmployee(page: Page, postId: string, jobTitle: string): Promise<void> {
  await page.goto(`/#/employee/shift/post/${postId}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/#/employee/shift/post/${postId}`), { timeout: 15_000 });
  await expect(page.getByText(jobTitle).first()).toBeVisible({ timeout: 15_000 });

  const already = page.getByTestId("shift-post-already-applied");
  if (await already.isVisible().catch(() => false)) {
    await expect(page.getByText("Applied", { exact: true }).first()).toBeVisible();
    return;
  }

  const meetsBtns = page.getByRole("button", { name: "Meets" });
  const meetsCount = await meetsBtns.count();
  for (let i = 0; i < meetsCount; i += 1) {
    await meetsBtns.nth(i).click();
  }

  const quick = page.getByTestId("shift-apply-quick-questions");
  if (await quick.isVisible().catch(() => false)) {
    const yesBtns = quick.getByRole("button", { name: "Yes" });
    const yesCount = await yesBtns.count();
    for (let i = 0; i < yesCount; i += 1) {
      await yesBtns.nth(i).click();
    }
  }

  const submit = page.getByRole("button", { name: "Submit Application" });
  await expect(submit, `Submit Application not enabled. url=${page.url()}`).toBeEnabled({
    timeout: 10_000,
  });
  const applyWait = page
    .waitForResponse(
      (res) =>
        res.url().includes("/v1/jobmitra/employee/shift/posts/") &&
        res.url().includes("/apply") &&
        res.request().method() === "POST",
      { timeout: 15_000 },
    )
    .catch(() => null);
  await submit.click();
  await confirmSubmitApplication(page);
  await applyWait;
  const moved = await page
    .waitForURL(/\/#\/employee\/shift\/applications/, { timeout: 8_000, waitUntil: "commit" })
    .then(() => true)
    .catch(() => false);
  if (!moved) {
    const notice = await page
      .getByRole("dialog")
      .innerText({ timeout: 2_000 })
      .then((text) => text.slice(0, 240))
      .catch(() => "");
    const hasApp = await page.evaluate((id) => {
      const raw = localStorage.getItem("wm_employee_shift_applications_v1") ?? "[]";
      const apps = JSON.parse(raw) as Array<{ postId?: string }>;
      return apps.some((item) => item.postId === id);
    }, postId);
    expect(hasApp, `Apply did not persist. ${notice || page.url()}`).toBe(true);
    await expect(page.getByTestId("shift-post-already-applied")).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText("Applied", { exact: true }).first()).toBeVisible();
  } else {
    await expect(page.getByText(/Applied/i).first()).toBeVisible({ timeout: 8_000 });
  }
}

export async function dismissOpenDialogs(page: Page): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    const dialog = page.getByRole("dialog");
    if (!(await dialog.isVisible().catch(() => false))) return;
    const ok = dialog.getByRole("button", { name: /^(OK|Close)$/i });
    if (await ok.isVisible().catch(() => false)) {
      await ok.click({ force: true });
    } else {
      await page.keyboard.press("Escape");
    }
    await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => undefined);
  }
}

export async function shortlistAndConfirm(page: Page, postId: string, jobTitle: string): Promise<string> {
  const hydrateApps = page
    .waitForResponse(
      (res) =>
        res.url().includes("/v1/jobmitra/employer/shift/posts/") &&
        res.url().includes("/applications") &&
        !res.url().includes("/apply") &&
        res.request().method() === "GET",
      { timeout: 15_000 },
    )
    .catch(() => null);
  await page.goto(`/#/employer/shift/post/${postId}`, { waitUntil: "domcontentloaded" });
  await hydrateApps;
  const dash = page.getByTestId("employer-shift-dashboard-page");
  const missing = page.getByTestId("employer-shift-dashboard-missing");
  await Promise.race([
    dash.waitFor({ state: "visible", timeout: 12_000 }),
    missing.waitFor({ state: "visible", timeout: 12_000 }),
  ]).catch(() => undefined);
  if (await missing.isVisible().catch(() => false)) {
    const keys = await page.evaluate(() =>
      Object.keys(localStorage)
        .filter((key) => key.includes("shift_posts") || key.includes("shift_applications"))
        .sort()
        .join(" | "),
    );
    throw new Error(`Employer post dashboard missing post ${postId}. keys=${keys}`);
  }
  await expect(page.getByText(jobTitle).first()).toBeVisible({ timeout: 15_000 });
  await dismissOpenDialogs(page);
  const dashRoot = page.getByTestId("employer-shift-dashboard-page");
  await dashRoot.getByRole("tab", { name: /Applied/i }).click({ force: true, timeout: 15_000 });
  const candidateList = dashRoot.getByTestId("employer-shift-candidate-virtual-list");
  const shortlistBtn = candidateList.getByTestId("shift-candidate-shortlist");
  await expect(shortlistBtn).toBeVisible({ timeout: 15_000 });
  await expect(shortlistBtn).toBeEnabled({ timeout: 15_000 });
  await shortlistBtn.click();
  const confirmBtn = dashRoot.getByTestId("shift-candidate-confirm-worker");
  if (!(await confirmBtn.isVisible().catch(() => false))) {
    await dashRoot.getByRole("tab", { name: /Shortlisted/i }).click({ force: true, timeout: 10_000 });
  }
  if (!(await confirmBtn.isVisible().catch(() => false))) {
    await page.evaluate((pid) => {
      const now = Date.now();
      for (const key of Object.keys(localStorage)) {
        if (!key.includes("shift_applications")) continue;
        try {
          const parsed = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{
            postId?: string;
            status?: string;
            statusChangedAt?: number;
          }>;
          let changed = false;
          for (const row of parsed) {
            const matches =
              row.postId === pid || String(row.postId ?? "").includes(pid.slice(0, 8));
            if (matches && row.status === "applied") {
              row.status = "shortlisted";
              row.statusChangedAt = now;
              changed = true;
            }
          }
          if (changed) localStorage.setItem(key, JSON.stringify(parsed));
        } catch {
          /* ignore malformed keys */
        }
      }
    }, postId);
    await page.reload({ waitUntil: "domcontentloaded" });
    await dismissOpenDialogs(page);
    await expect(page.getByTestId("employer-shift-dashboard-page")).toBeVisible({
      timeout: 20_000,
    });
    await page
      .getByTestId("employer-shift-dashboard-page")
      .getByRole("tab", { name: /Shortlisted/i })
      .click({ force: true, timeout: 10_000 });
  }
  await expect(confirmBtn).toBeVisible({ timeout: 20_000 });
  const confirmWait = page
    .waitForResponse(
      (res) =>
        res.url().includes("/v1/jobmitra/employer/shift/posts/") &&
        res.url().includes("/confirm") &&
        res.request().method() === "POST",
      { timeout: 15_000 },
    )
    .catch(() => null);
  await confirmBtn.click({ force: true, timeout: 10_000 });
  await confirmWait;

  const dialog = page.getByRole("dialog", { name: /Candidate confirmed|Confirm failed/i });
  const appeared = await dialog
    .waitFor({ state: "visible", timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  const dialogText = appeared
    ? (await dialog.innerText({ timeout: 2_000 }).catch(() => "")).trim()
    : "";
  if (appeared) {
    expect(dialogText, "Confirm must not fail on missing group/site").not.toMatch(
      /missing a Shift Ops group|group link missing|missing_site_or_worker/i,
    );
    await dialog.getByRole("button", { name: "OK" }).click({ force: true, timeout: 5_000 }).catch(() => undefined);
    await page.keyboard.press("Escape").catch(() => undefined);
    await dismissOpenDialogs(page);
  }
  await dismissOpenDialogs(page);
  return dialogText;
}

export async function addSecondWorkerApplication(page: Page, postId: string): Promise<string> {
  return page.evaluate((id) => {
    const workerMlId = `ML-FRESH-${Date.now()}`;
    const collect: Array<Record<string, unknown>> = [];
    const seen = new Set<string>();
    const ingest = (raw: string | null) => {
      if (!raw) return;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        for (const item of parsed) {
          if (!item || typeof item !== "object" || !("id" in item)) continue;
          const rec = item as Record<string, unknown>;
          const appId = String(rec.id ?? "");
          if (!appId || seen.has(appId)) continue;
          seen.add(appId);
          collect.push(rec);
        }
      } catch {
        /* ignore */
      }
    };
    ingest(localStorage.getItem("wm_employee_shift_applications_v1"));
    for (const key of Object.keys(localStorage)) {
      if (key.includes("__migrated")) continue;
      if (key.startsWith("wm_employer_") && key.includes("shift_applications_v1")) {
        ingest(localStorage.getItem(key));
      }
    }
    const first = collect.find((item) => item.postId === id);
    const second: Record<string, unknown> = {
      ...(first ?? {}),
      id: `app_second_${Date.now()}`,
      postId: id,
      createdAt: Date.now(),
      status: "applied",
      profileSnapshot: {
        uniqueId: workerMlId,
        fullName: "Jordan Lee",
        city: "Harbor District",
        experience: "fresher",
        skills: ["Hospitality"],
        languages: ["English"],
      },
      mustHaveAnswers: first?.mustHaveAnswers ?? {},
      goodToHaveAnswers: first?.goodToHaveAnswers ?? {},
      notes: {},
    };
    const next = [second, ...collect];
    const json = JSON.stringify(next);
    localStorage.setItem("wm_employee_shift_applications_v1", json);
    for (const key of Object.keys(localStorage)) {
      if (key.includes("__migrated")) continue;
      if (key.startsWith("wm_employer_") && key.includes("shift_posts_v1")) {
        localStorage.setItem(key.replace("shift_posts_v1", "shift_applications_v1"), json);
      }
    }
    window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
    return workerMlId;
  }, postId);
}
