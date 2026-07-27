/**
 * Track T1-1 — Employer Planner finance placeholder smoke
 * Run: npx playwright test --project=chromium tests/e2e/planner-finance-placeholder.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLAN = "dp_e2e_finance_t11";

async function seedFinancePlan(page: Page): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, planId }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      localStorage.setItem(
        "wm_employer_demand_plans_v1",
        JSON.stringify([
          {
            id: planId,
            name: "Finance Snapshot Plan",
            companyName: "Finance Co",
            locationName: "Kochi",
            category: "Security",
            experience: "experienced",
            startDate: "2026-11-01",
            endDate: "2026-11-02",
            workingDays: [0, 1],
            slots: [
              { date: "2026-11-01", workers: 2, payPerDay: 1000, slotId: `sl_${planId}_1` },
              { date: "2026-11-02", workers: 1, payPerDay: 800, slotId: `sl_${planId}_2` },
            ],
            status: "active",
            createdAt: 1,
            updatedAt: 1,
            schemaVersion: 2,
            legalEntityMlId: "ML-ENT-FIN",
            epochDays: 30,
            milestoneCursor: 0,
            publishStatus: "published",
          },
        ]),
      );
    },
    { sessionRole: "employer", splashKey: SPLASH_KEY, planId: PLAN },
  );
}

test.describe("Planner Finance Placeholder — T1-1", () => {
  test("seeded plan shows snapshot KPIs and Back to Plan", async ({ page }) => {
    await seedFinancePlan(page);
    await page.goto(`/#/employer/planner/plans/${PLAN}/finance`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveURL(new RegExp(`/employer/planner/plans/${PLAN}/finance`));
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.getByTestId("planner-employer-finance")).toBeVisible();
    await expect(page.getByTestId("planner-employer-finance")).toHaveAttribute(
      "data-plan-found",
      "1",
    );
    await expect(page.getByTestId("planner-employer-finance-snapshot")).toBeVisible();
    await expect(page.getByTestId("planner-employer-finance-worker-days")).toHaveText("3");
    await expect(page.getByTestId("planner-employer-finance-est-budget")).toBeVisible();
    await expect(page.getByTestId("planner-employer-finance-ledger-gate")).toContainText("P3");
    await expect(page.getByTestId("planner-employer-finance-missing")).toHaveCount(0);

    await page.getByTestId("planner-employer-finance-back").click();
    await expect(page).toHaveURL(new RegExp(`/employer/planner/plans/${PLAN}$`));
  });

  test("missing plan shows empty state and Plans CTA (no crash)", async ({ page }) => {
    await page.addInitScript(
      ({ sessionRole, splashKey }) => {
        sessionStorage.setItem("wm_role_session_v1", sessionRole);
        sessionStorage.setItem(splashKey, "1");
        localStorage.setItem("wm_employer_demand_plans_v1", JSON.stringify([]));
      },
      { sessionRole: "employer", splashKey: SPLASH_KEY },
    );

    await page.goto(`/#/employer/planner/plans/dp_missing_finance/finance`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.getByTestId("planner-employer-finance")).toHaveAttribute(
      "data-plan-found",
      "0",
    );
    await expect(page.getByTestId("planner-employer-finance-missing")).toBeVisible();
    await expect(page.getByTestId("planner-employer-finance-snapshot")).toHaveCount(0);

    await page.getByTestId("planner-employer-finance-missing-cta").click();
    await expect(page).toHaveURL(/\/employer\/planner\/plans/);
  });
});
