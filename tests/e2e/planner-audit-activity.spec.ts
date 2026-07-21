/**
 * Hybrid A2 Phase-2 P2.1 — Plan Detail Activity panel smoke
 * Run: npx playwright test --project=chromium tests/e2e/planner-audit-activity.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLAN = "dp_e2e_audit_p21";

async function seedPlanWithAudit(page: Page): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, planId }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      localStorage.setItem(
        "wm_employer_demand_plans_v1",
        JSON.stringify([
          {
            id: planId,
            name: "Audit Trail Plan",
            companyName: "Audit Co",
            locationName: "Kochi",
            category: "Security",
            experience: "experienced",
            startDate: "2026-11-01",
            endDate: "2026-11-02",
            workingDays: [0, 1],
            slots: [
              { date: "2026-11-01", workers: 1, payPerDay: 800, slotId: `sl_${planId}_1` },
              { date: "2026-11-02", workers: 1, payPerDay: 800, slotId: `sl_${planId}_2` },
            ],
            status: "active",
            createdAt: 1,
            updatedAt: 1,
            schemaVersion: 2,
            legalEntityMlId: "ML-ENT-AUDIT",
            epochDays: 30,
            milestoneCursor: 0,
            publishStatus: "published",
          },
        ]),
      );
      localStorage.setItem(
        "wm_planner_audit_log_v1",
        JSON.stringify([
          {
            id: "pau_e2e_1",
            planId,
            at: Date.now(),
            actor: "employer",
            actorMlId: "ML-ENT-AUDIT",
            action: "published",
            summary: "Published plan “Audit Trail Plan” · 2 days · 0 legacy child posts",
            meta: { childPostCount: 0, windDownNative: true },
          },
        ]),
      );
    },
    { sessionRole: "employer", splashKey: SPLASH_KEY, planId: PLAN },
  );
}

test.describe("Planner Audit Activity — Hybrid A2 P2.1", () => {
  test("Plan detail shows Activity panel with export CTA", async ({ page }) => {
    await seedPlanWithAudit(page);
    await page.goto(`/#/employer/planner/plans/${PLAN}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("planner-detail-activity")).toBeVisible();
    await expect(page.getByTestId("planner-detail-activity-list")).toBeVisible();
    await expect(page.getByTestId("planner-detail-activity-row").first()).toContainText(
      "published",
    );
    await expect(page.getByTestId("planner-detail-activity-export")).toBeEnabled();
    await expect(page.locator("body")).not.toContainText("Something went wrong");
  });
});
