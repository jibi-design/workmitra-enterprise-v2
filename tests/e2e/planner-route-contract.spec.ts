/**
 * Hybrid A2 Section 1 — Planner Route Contract crawl
 * Zero Dead-End: every contract path loads without ErrorBoundary; stubs have Back CTA.
 *
 * Run: npx playwright test --project=chromium tests/e2e/planner-route-contract.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import {
  PLANNER_EMPLOYEE_CRAWL_PATHS,
  PLANNER_EMPLOYER_CRAWL_PATHS,
  PLANNER_ROUTE_CONTRACT,
} from "../../src/features/shared/planner/plannerRouteContract";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const E2E_WORKER = "ML-E2E-PLAN-ROUTE";

async function initPlannerRole(page: Page, role: "employee" | "employer"): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, worker }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      if (sessionRole === "employee") {
        localStorage.setItem(
          "wm_employee_profile_v1",
          JSON.stringify({ uniqueId: worker, fullName: "E2E Route Worker", skills: [] }),
        );
      }
    },
    { sessionRole: role, splashKey: SPLASH_KEY, worker: E2E_WORKER },
  );
}

async function assertPlannerPageHealthy(page: Page): Promise<void> {
  await expect(page.locator("body")).not.toContainText("Something went wrong");
  await expect(page.locator("body")).not.toContainText("An unexpected error occurred");
}

test.describe("Planner Route Contract — Hybrid A2 S1", () => {
  test("Employee crawl paths resolve under /planner/*", async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext();
    const page = await context.newPage();
    await initPlannerRole(page, "employee");

    for (const path of PLANNER_EMPLOYEE_CRAWL_PATHS) {
      await page.goto(`/#${path}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
      await assertPlannerPageHealthy(page);
    }

    // discover aliases to browse
    await page.goto(`/#${PLANNER_ROUTE_CONTRACT.employee.discover}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(/\/employee\/planner\/browse/);
    await assertPlannerPageHealthy(page);

    // workspace hub stub has Back CTA + Execution Port check-in (stays on /planner)
    await page.goto(`/#${PLANNER_ROUTE_CONTRACT.employee.workspaceHub}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("planner-employee-workspace-hub-back")).toBeVisible();
    await expect(page.getByTestId("planner-execution-checkin-panel")).toBeVisible();
    await page.getByTestId("planner-checkin-plan-id").fill("e2e-plan-checkin");
    await page.getByTestId("planner-checkin-submit").click();
    await expect(page.getByTestId("planner-checkin-result")).toHaveAttribute("data-ok", "true");
    await expect(page).toHaveURL(/\/employee\/planner\/workspace\/?$/);

    await context.close();
  });

  test("Employer crawl paths resolve under /planner/*", async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext();
    const page = await context.newPage();
    await initPlannerRole(page, "employer");

    for (const path of PLANNER_EMPLOYER_CRAWL_PATHS) {
      await page.goto(`/#${path}`, { waitUntil: "domcontentloaded" });
      // create aliases to new
      if (path === PLANNER_ROUTE_CONTRACT.employer.create) {
        await expect(page).toHaveURL(/\/employer\/planner\/new/);
      } else {
        await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
      }
      await assertPlannerPageHealthy(page);
    }

    await page.goto(`/#${PLANNER_ROUTE_CONTRACT.employer.applications}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("planner-employer-applications-back")).toBeVisible();

    await page.goto(`/#${PLANNER_ROUTE_CONTRACT.employer.roster}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("planner-employer-roster-back")).toBeVisible();

    await page.goto(`/#/employer/planner/roster/e2e-plan-stub`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("planner-employer-roster-detail-back")).toBeVisible();

    await context.close();
  });
});
