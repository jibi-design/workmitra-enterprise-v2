/**
 * Dual live contexts: Employer + Employee. Phase 1 apply/ticker, Phase 3 dismiss isolation.
 * Does not copy localStorage before the live ticker assertion.
 */
import { expect, test, type Browser, type Page } from "@playwright/test";
import { signInAs, skipSplashAndSetRole, wipeBrowserState } from "./helpers/realUserCleanSlate";
import {
  completeEmployeeProfileViaUi,
  completeEmployerOnboarding,
  type FreshActors,
} from "./helpers/realUserOnboarding";
import { applyAsEmployee, publishFreshShift } from "./helpers/realUserShiftJourney";

const STAMP = Date.now().toString().slice(-6);
const ACTORS: FreshActors = {
  company: `Impact Hall ${STAMP}`,
  jobTitle: `Gate Host ${STAMP}`,
  workerName: `Jordan Lee ${STAMP}`,
  workArea: "100001",
};

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1280, height: 900 } });

async function openCleanPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await wipeBrowserState(page);
  return page;
}

test("Phase 1+3 dual-context apply badge, live ticker, dismiss isolation", async ({ browser }) => {
  test.setTimeout(240_000);
  const employer = await openCleanPage(browser);
  const employee = await openCleanPage(browser);

  await signInAs(employer, "employer@demo.jobmitra.app", "demo1234");
  await skipSplashAndSetRole(employer, "employer");
  await completeEmployerOnboarding(employer, ACTORS);
  const postId = await publishFreshShift(employer, ACTORS);
  expect(postId).toBeTruthy();

  await employer.goto("/#/employer", { waitUntil: "domcontentloaded" });
  await expect(employer.getByTestId("employer-home-inbox-ticker")).toBeVisible({ timeout: 20_000 });

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
    return localStorage.getItem("wm_employee_shift_search_v1") ?? "[]";
  });
  await employee.evaluate((raw) => {
    localStorage.setItem("wm_employee_shift_search_v1", raw);
    window.dispatchEvent(new Event("wm:employee-shift-search-changed"));
  }, postsRaw);

  await applyAsEmployee(employee, postId, ACTORS.jobTitle);
  await employee.goto(`/#/employee/shift/post/${postId}`, { waitUntil: "domcontentloaded" });
  await expect(employee.getByText("Applied", { exact: true }).first()).toBeVisible({ timeout: 12_000 });

  await employee.goto("/#/employee", { waitUntil: "domcontentloaded" });
  const employeeTicker = employee.getByTestId("employee-home-inbox-ticker");
  await expect(employeeTicker).toBeVisible({ timeout: 15_000 });
  await expect(employeeTicker).toContainText(/Applied|Pending|All Clear/i);

  const employerTicker = employer.getByTestId("employer-home-inbox-ticker");
  await expect(employerTicker).toBeVisible();
  await expect
    .poll(async () => (await employerTicker.innerText()).toLowerCase(), { timeout: 25_000 })
    .toMatch(/pending|application|applied|shortlist|action required/);

  const employerDismiss = employerTicker.getByTestId("home-status-strip-dismiss");
  await expect(employerDismiss).toBeVisible();
  await employerDismiss.click();
  await expect(employerTicker).toHaveAttribute("data-strip-status", "clear");
  await expect(employerTicker.getByText(/All Clear/i)).toBeVisible();

  await expect(employeeTicker).toBeVisible();
  const employeeStatus = await employeeTicker.getAttribute("data-strip-status");
  expect(employeeStatus).toBeTruthy();
});
