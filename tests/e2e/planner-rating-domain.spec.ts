/**
 * Hybrid A2 Section 6 — planner RatingDomain isolation smoke
 * Run: npx playwright test --project=chromium tests/e2e/planner-rating-domain.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const WORKER = "ML-E2E-PLAN-RATE";
const ENTITY = "ML-ENT-E2E-RATE";
const PLAN = "dp_e2e_rate_s6";

async function seedPlannerRating(page: Page): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, worker, entity, planId }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      localStorage.setItem(
        "wm_employee_profile_v1",
        JSON.stringify({ uniqueId: worker, fullName: "E2E Rate Worker", skills: [] }),
      );
      localStorage.setItem(
        "wm_ratings_employer_to_worker_v1",
        JSON.stringify([
          {
            id: "er_shift_1",
            domain: "shift",
            employerMlId: "ML-SHIFT",
            workerMlId: worker,
            jobId: "shift_job",
            stars: 3,
            tags: [],
            hireAgain: true,
            createdAt: Date.now(),
            editedAt: null,
            editCount: 0,
          },
          {
            id: "er_plan_1",
            domain: "planner",
            employerMlId: entity,
            workerMlId: worker,
            jobId: `plan_${planId}_e0`,
            stars: 5,
            tags: ["Reliable"],
            hireAgain: true,
            createdAt: Date.now(),
            editedAt: null,
            editCount: 0,
            meta: {
              rosterPlanId: planId,
              epochIndex: 0,
              siteManagerId: "ML-SITE-ONLY",
            },
          },
        ]),
      );
      localStorage.setItem(
        "wm_vault_planner_history_v1",
        JSON.stringify([
          {
            id: "vph_rate_1",
            planId,
            assignmentId: `${planId}_${worker}`,
            employeeMlId: worker,
            employeeName: "E2E Rate Worker",
            employerMlId: entity,
            companyName: "E2E Agency",
            planName: "E2E Plan",
            epochIndex: 0,
            epochStart: Date.now() - 1,
            epochEnd: Date.now(),
            daysScheduled: 20,
            daysCompleted: 19,
            attendanceRate: 95,
            reliabilityScore: 92,
            employerRating: 5,
            vaultFinalized: true,
            finalizedAt: Date.now(),
            completedAt: Date.now(),
          },
        ]),
      );
    },
    {
      sessionRole: "employee",
      splashKey: SPLASH_KEY,
      worker: WORKER,
      entity: ENTITY,
      planId: PLAN,
    },
  );
}

test.describe("Planner Rating Domain — Hybrid A2 S6", () => {
  test("Vault shows planner review; ledger keeps planner vs shift domains", async ({ page }) => {
    test.setTimeout(90_000);
    await seedPlannerRating(page);
    await page.goto("/#/employee/vault", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.getByTestId("vault-planner-review")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("E2E Agency").first()).toBeVisible();
    await expect(page.getByText("Gig Projects").first()).toBeVisible();

    const probe = await page.evaluate(() => {
      const ratings = JSON.parse(
        localStorage.getItem("wm_ratings_employer_to_worker_v1") ?? "[]",
      ) as Array<{ domain: string; stars: number }>;
      const shift = ratings.filter((r) => r.domain === "shift");
      const planner = ratings.filter((r) => r.domain === "planner");
      const shiftAvg =
        shift.length === 0
          ? 0
          : Math.round((shift.reduce((s, r) => s + r.stars, 0) / shift.length) * 10) / 10;
      const plannerAvg =
        planner.length === 0
          ? 0
          : Math.round((planner.reduce((s, r) => s + r.stars, 0) / planner.length) * 10) / 10;
      return {
        shiftCount: shift.length,
        plannerCount: planner.length,
        shiftAvg,
        plannerAvg,
        plannerHasMeta: Boolean(
          (
            JSON.parse(localStorage.getItem("wm_ratings_employer_to_worker_v1") ?? "[]") as Array<{
              meta?: { siteManagerId?: string };
            }>
          ).find((r) => r.meta?.siteManagerId === "ML-SITE-ONLY"),
        ),
      };
    });

    expect(probe.shiftCount).toBe(1);
    expect(probe.plannerCount).toBe(1);
    expect(probe.shiftAvg).toBe(3);
    expect(probe.plannerAvg).toBe(5);
    expect(probe.plannerHasMeta).toBe(true);
  });
});
