/**
 * Hybrid A2 Phase-2 P2.4 — escalation triggers smoke
 * Run: npx playwright test --project=chromium tests/e2e/planner-escalation-triggers.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";
import { E2E_VERIFIED_EMPLOYER_PROFILE, ensureVerifiedEmployerProfileOnPage } from "./helpers/e2e-employer-profile";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLAN = "dp_e2e_p24_understaff";

function nearDates(): { today: string; tomorrow: string } {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  const today = `${y}-${m}-${d}`;
  const t2 = new Date(t);
  t2.setDate(t2.getDate() + 1);
  const y2 = t2.getFullYear();
  const m2 = String(t2.getMonth() + 1).padStart(2, "0");
  const d2 = String(t2.getDate()).padStart(2, "0");
  return { today, tomorrow: `${y2}-${m2}-${d2}` };
}

async function seedUnderstaffPlan(page: Page): Promise<void> {
  const { today, tomorrow } = nearDates();
  await page.addInitScript(
    ({ sessionRole, splashKey, planId, today, tomorrow, employerProfile }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      localStorage.setItem("wm:pulse-nav-enabled", "true");
      localStorage.setItem("wm_employer_profile_v1", JSON.stringify(employerProfile));
      localStorage.setItem("wm:employer-profile", JSON.stringify(employerProfile));
      localStorage.setItem("wm_employer_onboarding_complete_v1", "1");
      localStorage.setItem("wm_onboarding_complete_v1", "1");
      localStorage.setItem(
        "wm_employer_demand_plans_v1",
        JSON.stringify([
          {
            id: planId,
            name: "P24 Understaff Plan",
            companyName: "Escalation Co",
            locationName: "City A",
            category: "Security",
            experience: "experienced",
            startDate: today,
            endDate: tomorrow,
            workingDays: [0, 1, 2, 3, 4, 5, 6],
            slots: [
              {
                date: today,
                workers: 3,
                payPerDay: 900,
                slotId: `sl_${planId}_1`,
              },
              {
                date: tomorrow,
                workers: 2,
                payPerDay: 900,
                slotId: `sl_${planId}_2`,
              },
            ],
            status: "active",
            createdAt: 1,
            updatedAt: 1,
            schemaVersion: 2,
            legalEntityMlId: "ML-P24",
            epochDays: 30,
            milestoneCursor: 0,
            publishStatus: "published",
          },
        ]),
      );
      localStorage.setItem("wm_employee_shift_applications_v1", "[]");
      localStorage.setItem("wm_employer_shift_posts_v1", "[]");
      localStorage.setItem("wm_planner_escalation_fired_v1", "{}");
    },
    {
      sessionRole: "employer",
      splashKey: SPLASH_KEY,
      planId: PLAN,
      today,
      tomorrow,
      employerProfile: E2E_VERIFIED_EMPLOYER_PROFILE,
    },
  );
}

test.describe("Planner Escalation Triggers — Hybrid A2 P2.4", () => {
  test("roster marks understaff plan and employer shift bell receives copy", async ({ page }) => {
    await seedUnderstaffPlan(page);
    await page.goto("/#/employer/planner/roster", { waitUntil: "domcontentloaded" });
    await ensureVerifiedEmployerProfileOnPage(page);

    await expect(page.getByTestId("planner-employer-roster")).toBeVisible();
    const card = page.getByTestId("planner-roster-plan-card").first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-understaff", "1");
    await expect(card).toContainText("understaff risk");

    const bell = await page.evaluate(async () => {
      const { employerNotificationsStorage } =
        await import("/src/features/employer/notifications/storage/employerNotifications.storage.ts");
      return employerNotificationsStorage
        .getAll()
        .filter((n) => n.domain === "shift" && n.title.includes("Understaff"));
    });
    expect(bell.length).toBeGreaterThanOrEqual(1);
    await expect(page.locator("body")).not.toContainText("Something went wrong");
  });
});
