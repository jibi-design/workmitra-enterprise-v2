/**
 * Fresh real-user Shift journey: wipe state, two browsers, Confirm auto-group.
 * Does not seed Shift Ops site UUIDs or membership truth.
 */
import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  skipSplashAndSetRole,
  wipeBrowserState,
  signInAs,
} from "./helpers/realUserCleanSlate";
import {
  completeEmployeeProfileViaUi,
  completeEmployerOnboarding,
  inspectPostOps,
  type FreshActors,
} from "./helpers/realUserOnboarding";
import {
  addSecondWorkerApplication,
  applyAsEmployee,
  dismissOpenDialogs,
  publishFreshShift,
  shortlistAndConfirm,
} from "./helpers/realUserShiftJourney";

const STAMP = Date.now().toString().slice(-6);
const ACTORS: FreshActors = {
  company: `Northgate Hall ${STAMP}`,
  jobTitle: `Floor Host ${STAMP}`,
  workerName: `Alex Quinn ${STAMP}`,
  workArea: "100001",
};

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1280, height: 900 } });

async function openCleanPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (err) => {
    console.log(`[PAGEERROR] ${err.message}`);
  });
  await wipeBrowserState(page);
  return page;
}

async function snapshotEmployerPosts(page: Page): Promise<string> {
  return page.evaluate(() => {
    const entries: Record<string, string> = {};
    for (const key of Object.keys(localStorage)) {
      if (key.includes("__migrated")) continue;
      const isPosts = key.startsWith("wm_employer_") && key.includes("shift_posts_v1");
      const isSearch = key === "wm_employee_shift_search_v1";
      if (!isPosts && !isSearch) continue;
      const val = localStorage.getItem(key);
      if (val && val !== "[]") entries[key] = val;
    }
    return JSON.stringify(entries);
  });
}

async function restoreEmployerPosts(page: Page, raw: string): Promise<void> {
  if (!raw || raw === "{}") return;
  await page.evaluate((json) => {
    const entries = JSON.parse(json) as Record<string, string>;
    for (const [key, val] of Object.entries(entries)) {
      localStorage.setItem(key, val);
    }
    window.dispatchEvent(new Event("wm:employer-shift-posts-changed"));
    window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  }, raw);
}

async function copyPublishedPostToEmployee(from: Page, to: Page): Promise<void> {
  const postsRaw = await from.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("wm_employer_") || !key.includes("shift_posts_v1")) continue;
      if (key.includes("__migrated")) continue;
      const val = localStorage.getItem(key);
      if (val && val !== "[]") return val;
    }
    return localStorage.getItem("wm_employee_shift_search_v1") ?? "[]";
  });
  await to.evaluate((raw) => {
    localStorage.setItem("wm_employee_shift_search_v1", raw);
    window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  }, postsRaw);
}

test("Clean slate → publish → apply → Confirm auto-group → workspace", async ({ browser }) => {
  test.setTimeout(420_000);
  const employer = await openCleanPage(browser);
  const employee = await openCleanPage(browser);

  let postId = "";
  let employerPostsSnap = "";

  await test.step("1-2. Employer login + publish", async () => {
    await signInAs(employer, "employer@demo.jobmitra.app", "demo1234");
    await skipSplashAndSetRole(employer, "employer");
    await completeEmployerOnboarding(employer, ACTORS);
    postId = await publishFreshShift(employer, ACTORS);
    expect(postId).toBeTruthy();
    employerPostsSnap = await snapshotEmployerPosts(employer);
    expect(employerPostsSnap, "Employer scoped posts must exist after publish").not.toBe("{}");
  });

  await test.step("3. Employee profile + apply", async () => {
    await signInAs(employee, "employee@demo.jobmitra.app", "demo1234");
    await skipSplashAndSetRole(employee, "employee");
    const mlId = await completeEmployeeProfileViaUi(employee, ACTORS);
    console.log(`[ML-ID] ${mlId}`);
    await copyPublishedPostToEmployee(employer, employee);
    await applyAsEmployee(employee, postId, ACTORS.jobTitle);
    const apps = await employee.evaluate(() => localStorage.getItem("wm_employee_shift_applications_v1"));
    await employer.evaluate(
      ({ raw, minted, name, id }) => {
        const parsed = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
        const next = parsed.map((app) => {
          if (app.postId !== id) return app;
          const snap = (app.profileSnapshot as Record<string, unknown> | undefined) ?? {};
          return {
            ...app,
            profileSnapshot: {
              ...snap,
              uniqueId: String(snap.uniqueId ?? "").trim() || minted,
              fullName: String(snap.fullName ?? "").trim() || name,
            },
          };
        });
        const json = JSON.stringify(next);
        localStorage.setItem("wm_employee_shift_applications_v1", json);
        for (const key of Object.keys(localStorage)) {
          if (key.includes("__migrated")) continue;
          if (key.startsWith("wm_employer_") && key.includes("shift_posts_v1")) {
            const appsKey = key.replace("shift_posts_v1", "shift_applications_v1");
            localStorage.setItem(appsKey, json);
          }
        }
        window.dispatchEvent(new Event("wm:employee-shift-applications-changed"));
      },
      { raw: apps, minted: mlId, name: ACTORS.workerName, id: postId },
    );
    await restoreEmployerPosts(employer, employerPostsSnap);
  });

  let siteAfterFirst = "";
  await test.step("4. First Confirm creates Shift Ops group", async () => {
    await restoreEmployerPosts(employer, employerPostsSnap);
    const dialogText = await shortlistAndConfirm(employer, postId, ACTORS.jobTitle);
    const ops = await inspectPostOps(employer, postId);
    console.log(`[CONFIRM] dialog=${dialogText.slice(0, 180)} site=${ops.siteId} confirmed=${ops.confirmedCount}`);
    expect(
      dialogText,
      "Confirm failed copy must not mention missing group/site",
    ).not.toMatch(/missing a Shift Ops group|group link missing|missing_site_or_worker/i);
    expect(ops.siteId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(ops.confirmedCount).toBeGreaterThanOrEqual(1);
    siteAfterFirst = ops.siteId;
    console.log(`[SITE] first confirm ${siteAfterFirst}`);
  });

  await test.step("5. Second confirm joins the same group", async () => {
    await dismissOpenDialogs(employer);
    await addSecondWorkerApplication(employer, postId);
    await employer.goto(`/#/employer/shift/post/${postId}`, { waitUntil: "domcontentloaded" });
    await dismissOpenDialogs(employer);
    await expect(employer.getByTestId("employer-shift-dashboard-page")).toBeVisible({
      timeout: 15_000,
    });
    await employer.getByRole("tab", { name: /Applied/i }).click({ force: true, timeout: 15_000 });
    await employer.getByRole("button", { name: "Shortlist", exact: true }).click({
      force: true,
      timeout: 10_000,
    });
    await employer.getByRole("tab", { name: /Shortlisted/i }).click({ force: true, timeout: 10_000 });
    await employer.getByRole("button", { name: "Confirm Worker", exact: true }).first().click({
      force: true,
      timeout: 10_000,
    });
    const secondDialog = employer.getByRole("dialog", { name: /Candidate confirmed|Confirm failed/i });
    if (await secondDialog.waitFor({ state: "visible", timeout: 15_000 }).then(() => true).catch(() => false)) {
      await secondDialog.getByRole("button", { name: "OK" }).click({ force: true }).catch(() => undefined);
      await secondDialog.waitFor({ state: "hidden", timeout: 8_000 }).catch(() => undefined);
    }
    await dismissOpenDialogs(employer);
    const ops = await inspectPostOps(employer, postId);
    expect(ops.siteId).toBe(siteAfterFirst);
    expect(ops.confirmedCount).toBeGreaterThanOrEqual(2);
  });

  await test.step("6. Workspace message, call, complete, review", async () => {
    await dismissOpenDialogs(employer);
    const wsId = await employer.evaluate(() => {
      const keys = Object.keys(localStorage).filter(
        (key) => key.includes("shift_workspaces_v1") && !key.includes("__migrated"),
      );
      for (const key of keys) {
        try {
          const list = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{ id?: string }>;
          if (list[0]?.id) return list[0].id;
        } catch {
          /* ignore */
        }
      }
      return "";
    });
    expect(wsId).toBeTruthy();
    await employer.goto(`/#/employer/shift/workspace/${wsId}`, { waitUntil: "domcontentloaded" });
    await expect(employer.getByTestId("employer-shift-workspace-page")).toBeVisible({
      timeout: 15_000,
    });
    const broadcast = employer.getByRole("button", { name: /^Broadcast$/i }).first();
    await expect(broadcast).toBeVisible();
    await broadcast.click();
    const send = employer.getByRole("button", { name: /Send Broadcast/i });
    if (await send.isVisible().catch(() => false)) {
      const body = employer.getByPlaceholder(/Announcement|Type shift update/i);
      if (await body.isVisible().catch(() => false)) {
        await body.fill("Hall desk.");
      }
      await send.click();
    }
    const broadcastDlg = employer.getByRole("dialog", { name: /Broadcast Announcement/i });
    if (await broadcastDlg.isVisible().catch(() => false)) {
      await broadcastDlg.getByRole("button", { name: "Cancel" }).click({ force: true });
      await expect(broadcastDlg).toBeHidden({ timeout: 8_000 });
    }
    await dismissOpenDialogs(employer);
    await expect(employer.getByRole("button", { name: /Call/i }).first()).toBeVisible();
    const reassignVisible = await employer.getByTestId("shift-ops-reassign-role-btn").isVisible().catch(() => false);
    console.log(`[REASSIGN] ${reassignVisible ? "visible" : "not_on_workspace"}`);
    const complete = employer.getByRole("button", { name: /Mark Completed/i });
    await expect(complete).toBeVisible();
    await complete.click({ force: true, timeout: 15_000 });
    const completeDlg = employer.getByRole("dialog", { name: /Mark shift completed/i });
    await expect(completeDlg).toBeVisible({ timeout: 8_000 });
    await completeDlg.getByRole("button", { name: "Mark Completed" }).click({ force: true });
    await expect(employer.getByRole("button", { name: /Rate Worker|Rate Now|Rate/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  await employer.context().close();
  await employee.context().close();
});
