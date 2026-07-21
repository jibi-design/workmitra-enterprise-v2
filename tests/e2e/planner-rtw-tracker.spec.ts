/**
 * Hybrid A2 Phase-2 P2.5 — RTW roster badge smoke
 * Run: npx playwright test --project=chromium tests/e2e/planner-rtw-tracker.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLAN = "dp_e2e_p25_rtw";
const WORKER = "ML-E2E-RTW";

function expiryInDays(days: number): string {
  const t = new Date();
  t.setDate(t.getDate() + days);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function seedRtwRoster(page: Page): Promise<void> {
  const expiresOn = expiryInDays(7);
  await page.addInitScript(
    ({ sessionRole, splashKey, planId, worker, expiresOn }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      localStorage.setItem("wm:pulse-nav-enabled", "true");
      localStorage.setItem(
        "wm_employer_demand_plans_v1",
        JSON.stringify([
          {
            id: planId,
            name: "P25 RTW Plan",
            companyName: "RTW Co",
            locationName: "Kochi",
            category: "Security",
            experience: "experienced",
            startDate: "2026-07-01",
            endDate: "2026-07-31",
            workingDays: [1, 2, 3, 4, 5],
            slots: [{ date: "2026-07-15", workers: 1, payPerDay: 800, slotId: `sl_${planId}_1` }],
            status: "active",
            createdAt: 1,
            updatedAt: 1,
            schemaVersion: 2,
            legalEntityMlId: "ML-P25",
            epochDays: 30,
            milestoneCursor: 0,
            publishStatus: "published",
          },
        ]),
      );
      localStorage.setItem(
        "wm_employee_shift_applications_v1",
        JSON.stringify([
          {
            id: "app_e2e_rtw",
            postId: `sl_${planId}_1`,
            createdAt: 1,
            status: "confirmed",
            planId,
            profileSnapshot: { uniqueId: worker, fullName: "E2E RTW Worker" },
            selectedDates: ["2026-07-15"],
            mustHaveAnswers: {},
            goodToHaveAnswers: {},
            notes: {},
          },
        ]),
      );
      localStorage.setItem("wm_employer_shift_posts_v1", "[]");
      localStorage.setItem(
        "wm_planner_rtw_tracker_v1",
        JSON.stringify({
          warnDaysBefore: 30,
          records: [
            {
              workerMlId: worker,
              workerName: "E2E RTW Worker",
              expiresOn,
              documentKind: "visa",
              updatedAt: Date.now(),
            },
          ],
        }),
      );
      localStorage.setItem("wm_planner_rtw_fired_v1", "{}");
      localStorage.setItem("wm_planner_audit_log_v1", "[]");
    },
    { sessionRole: "employer", splashKey: SPLASH_KEY, planId: PLAN, worker: WORKER, expiresOn },
  );
}

test.describe("Planner RTW Tracker — Hybrid A2 P2.5", () => {
  test("roster detail shows RTW badge and settings", async ({ page }) => {
    await seedRtwRoster(page);
    await page.goto(`/#/employer/planner/roster/${PLAN}`, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("planner-employer-roster-detail")).toBeVisible();
    await expect(page.getByTestId("planner-roster-rtw-settings")).toBeVisible();
    await expect(page.getByTestId("planner-roster-rtw-warn-days")).toHaveValue("30");

    const card = page.getByTestId("planner-roster-worker-card").first();
    await expect(card).toHaveAttribute("data-rtw", "1");
    await expect(page.getByTestId("planner-roster-rtw-badge")).toContainText("RTW");

    const audit = await page.evaluate(() => {
      const raw = localStorage.getItem("wm_planner_audit_log_v1");
      if (!raw) return [];
      try {
        return (JSON.parse(raw) as Array<{ action: string }>).filter(
          (e) => e.action === "rtw_flagged",
        );
      } catch {
        return [];
      }
    });
    expect(audit.length).toBeGreaterThanOrEqual(1);
    await expect(page.locator("body")).not.toContainText("Something went wrong");
  });
});
