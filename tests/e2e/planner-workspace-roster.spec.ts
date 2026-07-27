/**
 * Hybrid A2 Section 7 — native workspace hub + roster console smoke
 * Run: npx playwright test --project=chromium tests/e2e/planner-workspace-roster.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const E2E_WORKER = "ML-E2E-PLAN-S7";

async function initRole(page: Page, role: "employee" | "employer"): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, worker }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      if (sessionRole === "employee") {
        localStorage.setItem(
          "wm_employee_profile_v1",
          JSON.stringify({ uniqueId: worker, fullName: "E2E S7 Worker", skills: [] }),
        );
      }
    },
    { sessionRole: role, splashKey: SPLASH_KEY, worker: E2E_WORKER },
  );
}

test.describe("Planner Workspace + Roster — Hybrid A2 S7", () => {
  test("Employee hub check-in stays on /planner/workspace", async ({ page }) => {
    test.setTimeout(90_000);
    await initRole(page, "employee");
    await page.goto("/#/employee/planner/workspace", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("planner-employee-workspace-hub")).toBeVisible();
    await expect(page.getByTestId("planner-employee-workspace-hub-back")).toBeVisible();
    await expect(page.getByTestId("planner-execution-checkin-panel")).toBeVisible();
    await page.getByTestId("planner-checkin-plan-id").fill("e2e-s7-plan");
    await page.getByTestId("planner-checkin-submit").click();
    await expect(page.getByTestId("planner-checkin-result")).toHaveAttribute("data-ok", "true");
    await expect(page).toHaveURL(/\/employee\/planner\/workspace\/?$/);
  });

  test("Workspaces compat path redirects to hub", async ({ page }) => {
    await initRole(page, "employee");
    await page.goto("/#/employee/planner/workspaces", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/employee\/planner\/workspace\/?$/);
    await expect(page.getByTestId("planner-employee-workspace-hub")).toBeVisible();
  });

  test("Employer roster console loads with Back CTA", async ({ page }) => {
    await initRole(page, "employer");
    await page.goto("/#/employer/planner/roster", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("planner-employer-roster")).toBeVisible();
    await expect(page.getByTestId("planner-employer-roster-back")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await page.goto("/#/employer/planner/roster/e2e-plan-s7", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("planner-employer-roster-detail")).toBeVisible();
    await expect(page.getByTestId("planner-employer-roster-detail")).toHaveAttribute(
      "data-plan-found",
      "0",
    );
    await expect(page.getByTestId("planner-employer-roster-detail-missing")).toBeVisible();
    await expect(page.getByTestId("planner-employer-roster-detail-back")).toBeVisible();
  });
});
