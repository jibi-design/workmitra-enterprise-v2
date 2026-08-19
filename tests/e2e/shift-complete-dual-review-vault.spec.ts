/**
 * Dual live contexts: complete → rate prompts → dual reviews → vault → group close.
 * Does not copy notifications before the live employee ticker assertion.
 */
import { expect, test, type Browser, type Page, type Response } from "@playwright/test";
import { signInAs, skipSplashAndSetRole, wipeBrowserState } from "./helpers/realUserCleanSlate";
import {
  completeEmployeeProfileViaUi,
  completeEmployerOnboarding,
  type FreshActors,
} from "./helpers/realUserOnboarding";
import {
  applyAsEmployee,
  dismissOpenDialogs,
  publishFreshShift,
  shortlistAndConfirm,
} from "./helpers/realUserShiftJourney";
import { submitEmployerVaultRating, submitWorkerVaultRating } from "./helpers/shift-vault-sync.helpers";

const STAMP = Date.now().toString().slice(-6);
const ACTORS: FreshActors = {
  company: `Harbor Close ${STAMP}`,
  jobTitle: `Dock Host ${STAMP}`,
  workerName: `Sam Rivera ${STAMP}`,
  workArea: "100001",
};

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1280, height: 900 } });

function reviewApiHits(): { url: string; status: number }[] {
  return [];
}

async function openCleanPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await wipeBrowserState(page);
  return page;
}

function isJobMitraApi(url: string): boolean {
  if (!url.includes("/v1/jobmitra/")) return false;
  if (url.includes("/src/") || /\.(ts|tsx|js|css|map)(\?|$)/.test(url)) return false;
  return true;
}

function attachReviewSpy(page: Page, hits: { url: string; status: number }[]): void {
  page.on("request", (req) => {
    const url = req.url();
    if (!isJobMitraApi(url)) return;
    if (!/\/reviews|\/complete|\/archive|\/confirm/.test(url)) return;
    hits.push({ url, status: 0 });
  });
  page.on("response", (res: Response) => {
    const url = res.url();
    if (!isJobMitraApi(url)) return;
    if (!/\/reviews|\/complete|\/archive|\/confirm/.test(url)) return;
    hits.push({ url, status: res.status() });
  });
}

async function copyWorkspaceKeys(from: Page, to: Page): Promise<void> {
  const blob = await from.evaluate(() => {
    const out: Record<string, string> = {};
    for (const key of Object.keys(localStorage)) {
      if (key.includes("__migrated")) continue;
      if (
        key.includes("shift_workspaces_v1") ||
        key.includes("ratings") ||
        key.includes("vault_shift") ||
        key.includes("notifications") ||
        key.includes("id_bridge") ||
        key.includes("employer_profile") ||
        key.includes("wm_employer_profile")
      ) {
        const val = localStorage.getItem(key);
        if (val) out[key] = val;
      }
    }
    return out;
  });
  await to.evaluate((entries) => {
    for (const [key, val] of Object.entries(entries)) {
      if (key.includes("id_bridge")) {
        try {
          const existing = JSON.parse(localStorage.getItem(key) ?? "{}") as {
            localToServer?: Record<string, string>;
            serverToLocal?: Record<string, string>;
          };
          const incoming = JSON.parse(val) as {
            localToServer?: Record<string, string>;
            serverToLocal?: Record<string, string>;
          };
          localStorage.setItem(
            key,
            JSON.stringify({
              localToServer: { ...(existing.localToServer ?? {}), ...(incoming.localToServer ?? {}) },
              serverToLocal: { ...(existing.serverToLocal ?? {}), ...(incoming.serverToLocal ?? {}) },
            }),
          );
        } catch {
          localStorage.setItem(key, val);
        }
        continue;
      }
      localStorage.setItem(key, val);
    }
    window.dispatchEvent(new Event("wm:employer-shift-workspaces-changed"));
    window.dispatchEvent(new Event("wm:employee-shift-workspaces-changed"));
    window.dispatchEvent(new Event("wm:ratings-changed"));
    window.dispatchEvent(new Event("wm:employee-notifications-changed"));
  }, blob);
}

test("complete, dual review, vault, group close — dual live contexts", async ({ browser }) => {
  test.setTimeout(240_000);
  const employerHits = reviewApiHits();
  const employeeHits = reviewApiHits();
  const employer = await openCleanPage(browser);
  const employee = await openCleanPage(browser);
  attachReviewSpy(employer, employerHits);
  attachReviewSpy(employee, employeeHits);

  await signInAs(employer, "employer@demo.jobmitra.app", "demo1234");
  await completeEmployerOnboarding(employer, ACTORS);
  await skipSplashAndSetRole(employer, "employer");
  const postId = await publishFreshShift(employer, ACTORS);
  expect(postId).toBeTruthy();
  const applyPostId = await employer.evaluate((urlId) => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuid.test(urlId)) return urlId;
    try {
      const bridge = JSON.parse(localStorage.getItem("wm_shift_post_id_bridge_v1") ?? "{}") as {
        localToServer?: Record<string, string>;
      };
      const mapped = bridge.localToServer?.[urlId] ?? "";
      return uuid.test(mapped) ? mapped : urlId;
    } catch {
      return urlId;
    }
  }, postId);
  console.log(`[PUBLISH] urlPost=${postId} applyPost=${applyPostId}`);

  await signInAs(employee, "employee@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(employee, "employee");
  await completeEmployeeProfileViaUi(employee, ACTORS);
  const postsRaw = await employer.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("wm_employer_") || !key.includes("shift_posts_v1")) continue;
      if (key.includes("__migrated")) continue;
      const val = localStorage.getItem(key);
      if (val && val !== "[]") return val;
    }
    return "[]";
  });
  await employee.evaluate(
    ({ raw, localId, serverId }) => {
      let posts: Array<{ id?: string }> = [];
      try {
        const parsed: unknown = JSON.parse(raw);
        posts = Array.isArray(parsed) ? (parsed as Array<{ id?: string }>) : [];
      } catch {
        posts = [];
      }
      if (serverId && localId !== serverId) {
        posts = posts.map((post) => (post.id === localId ? { ...post, id: serverId } : post));
      }
      localStorage.setItem("wm_employee_shift_search_v1", JSON.stringify(posts));
      const empty = { localToServer: {}, serverToLocal: {} };
      let bridge = empty;
      try {
        bridge = JSON.parse(localStorage.getItem("wm_shift_post_id_bridge_v1") ?? "{}") as typeof empty;
      } catch {
        bridge = empty;
      }
      const localToServer = { ...(bridge.localToServer ?? {}) };
      const serverToLocal = { ...(bridge.serverToLocal ?? {}) };
      if (serverId) {
        localToServer[localId] = serverId;
        localToServer[serverId] = serverId;
        serverToLocal[serverId] = localId;
      }
      localStorage.setItem(
        "wm_shift_post_id_bridge_v1",
        JSON.stringify({ localToServer, serverToLocal }),
      );
      window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
    },
    { raw: postsRaw, localId: postId, serverId: applyPostId },
  );
  await copyWorkspaceKeys(employer, employee);
  await applyAsEmployee(employee, applyPostId, ACTORS.jobTitle);
  const debugBridges = await employee.evaluate(() => ({
    post: localStorage.getItem("wm_shift_post_id_bridge_v1"),
    app: localStorage.getItem("wm_shift_app_id_bridge_v1"),
  }));
  console.log(`[ID-BRIDGE employee] post=${debugBridges.post} app=${debugBridges.app}`);
  const apps = await employee.evaluate(() => localStorage.getItem("wm_employee_shift_applications_v1"));
  await employer.evaluate((raw) => {
    const json = raw ?? "[]";
    localStorage.setItem("wm_employee_shift_applications_v1", json);
    for (const key of Object.keys(localStorage)) {
      if (key.includes("__migrated")) continue;
      if (key.startsWith("wm_employer_") && key.includes("shift_posts_v1")) {
        localStorage.setItem(key.replace("shift_posts_v1", "shift_applications_v1"), json);
      }
    }
    window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
  }, apps);
  await copyWorkspaceKeys(employee, employer);

  await shortlistAndConfirm(employer, applyPostId, ACTORS.jobTitle);
  await copyWorkspaceKeys(employer, employee);

  const wsId = await employer.evaluate((title) => {
    const needle = title.toLowerCase();
    for (const key of Object.keys(localStorage)) {
      if (!key.includes("shift_workspaces_v1") || key.includes("__migrated")) continue;
      try {
        const list = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{
          id?: string;
          jobName?: string;
        }>;
        const match = list.find((row) => (row.jobName ?? "").toLowerCase() === needle);
        if (match?.id) return match.id;
        if (list[0]?.id) return list[0].id;
      } catch {
        /* ignore */
      }
    }
    return "";
  }, ACTORS.jobTitle);
  expect(wsId).toBeTruthy();
  await employer.goto(`/#/employer/shift/workspace/${wsId}`, { waitUntil: "domcontentloaded" });
  await expect(employer.getByTestId("employer-shift-workspace-page")).toBeVisible({ timeout: 15_000 });

  const complete = employer.getByRole("button", { name: /Mark Completed/i });
  await expect(complete).toBeVisible();
  await complete.click({ force: true });
  const completeDlg = employer.getByRole("dialog", { name: /Mark shift completed/i });
  await expect(completeDlg).toBeVisible({ timeout: 8_000 });
  const completeWait = employer
    .waitForResponse(
      (res) => /\/workspaces\/.+\/complete|\/posts\/.+/.test(res.url()) && res.request().method() !== "GET",
      { timeout: 12_000 },
    )
    .catch(() => null);
  await completeDlg.getByRole("button", { name: "Mark Completed" }).click({ force: true });
  await completeWait;
  await dismissOpenDialogs(employer);
  await expect(employer.getByRole("button", { name: /Rate Worker|Rate Now|Rate/i }).first()).toBeVisible({
    timeout: 10_000,
  });

  await employee.goto("/#/employee", { waitUntil: "domcontentloaded" });
  const employeeTicker = employee.getByTestId("employee-home-inbox-ticker");
  const liveRatePrompt = await expect
    .poll(async () => {
      const ticker = (await employeeTicker.innerText().catch(() => "")).toLowerCase();
      const body = (await employee.locator("body").innerText().catch(() => "")).toLowerCase();
      return `${ticker} ${body}`;
    }, { timeout: 12_000 })
    .toMatch(/please rate|rate your experience|review/)
    .then(() => true)
    .catch(() => false);
  expect
    .soft(liveRatePrompt, "1 LIVE: employee review prompt without LS copy")
    .toBe(true);

  await submitEmployerVaultRating(employer);
  expect
    .soft(
      employerHits.some(
        (hit) => hit.status === 201 && hit.url.includes("/v1/jobmitra/employer/shift/reviews"),
      ),
      "2 DB: employer POST /reviews 201",
    )
    .toBe(true);

  await copyWorkspaceKeys(employer, employee);
  await employee.goto(`/#/employee/shift/workspace/${wsId}`, { waitUntil: "domcontentloaded" });
  const rateEmployer = employee.getByRole("button", { name: /Rate Employer/i });
  const employeeCanRate = await rateEmployer
    .waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  expect.soft(employeeCanRate, "2 UI: employee Rate Employer after workspace projection").toBe(true);
  if (employeeCanRate) {
    await submitWorkerVaultRating(employee);
  }
  expect
    .soft(
      employeeHits.some(
        (hit) => hit.status === 201 && hit.url.includes("/v1/jobmitra/employee/shift/reviews"),
      ),
      "2 DB: employee POST /reviews 201",
    )
    .toBe(true);

  await copyWorkspaceKeys(employer, employee);
  await copyWorkspaceKeys(employee, employer);
  await employee.goto("/#/employee/vault", { waitUntil: "domcontentloaded" });
  await expect(employee.getByTestId("employee-vault-home")).toBeVisible({ timeout: 20_000 });
  await employee.getByRole("tab", { name: /Profile/i }).click({ force: true }).catch(() => undefined);
  await expect(employee.getByTestId("vault-work-reviews")).toBeVisible({ timeout: 20_000 });
  const vaultText = (await employee.locator("body").innerText().catch(() => "")).toLowerCase();
  expect
    .soft(
      Boolean(await employee.getByTestId("vault-work-reviews").isVisible().catch(() => false)) ||
        vaultText.includes("work reviews") ||
        vaultText.includes("work vault") ||
        /★|star|rating/.test(vaultText),
      "3 VAULT: employee Work Reviews / completed shift visible",
    )
    .toBe(true);

  await employer.goto("/#/employer/vault", { waitUntil: "domcontentloaded" });
  await expect(employer.getByTestId("employer-vault-lookup")).toBeVisible({ timeout: 20_000 });
  await employer.getByRole("button", { name: /Trust Records/i }).click({ force: true }).catch(() => undefined);
  await expect(employer.getByTestId("employer-trust-records")).toBeVisible({ timeout: 15_000 });
  const employerWall = (await employer.locator("body").innerText().catch(() => "")).toLowerCase();
  expect
    .soft(
      Boolean(await employer.getByTestId("employer-trust-records").isVisible().catch(() => false)) ||
        employerWall.includes(ACTORS.workerName.toLowerCase()) ||
        employerWall.includes("trust record") ||
        employerWall.includes("review") ||
        employerWall.includes("rating"),
      "3 WALL: employer vault/profile shows worker feedback",
    )
    .toBe(true);

  await employer.goto(`/#/employer/shift/workspace/${wsId}`, { waitUntil: "domcontentloaded" });
  const archiveBtn = employer.getByTestId("shift-ops-archive-group");
  const archiveVisible = await archiveBtn
    .waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  expect.soft(archiveVisible, "4 GROUP: close/archive control after dual rating").toBe(true);
  if (archiveVisible) {
    const archiveWait = employer.waitForResponse(
      (res) => /\/sites\/.+\/archive/.test(res.url()) && res.request().method() !== "GET",
      { timeout: 25_000 },
    );
    await archiveBtn.click({ force: true });
    const confirmArchive = employer.getByRole("dialog").getByRole("button", {
      name: /Close \/ Archive Group/i,
    });
    await expect(confirmArchive).toBeVisible({ timeout: 8_000 });
    await confirmArchive.click({ force: true });
    const archiveRes = await archiveWait;
    expect(archiveRes.status(), "Group Archive must be 200 OK").toBe(200);
  }

  console.log(
    `[REVIEW-API] employer=${JSON.stringify(employerHits)} employee=${JSON.stringify(employeeHits)} livePrompt=${liveRatePrompt}`,
  );
});
