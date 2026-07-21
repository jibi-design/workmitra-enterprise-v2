/**
 * Hybrid A2 Section 5 — Planner vault history key + aggregator surface
 *
 * Run: npx playwright test --project=chromium tests/e2e/planner-vault-history.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const WORKER = "ML-E2E-PLAN-VAULT";
const PLAN = "dp_e2e_vault_s5";

async function initEmployee(page: Page): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, worker, planId }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      localStorage.setItem(
        "wm_employee_profile_v1",
        JSON.stringify({
          uniqueId: worker,
          fullName: "E2E Vault Worker",
          city: "Kochi",
          skills: ["security"],
        }),
      );
      localStorage.setItem(
        "wm_vault_planner_history_v1",
        JSON.stringify([
          {
            id: "vph_e2e_1",
            planId,
            assignmentId: `${planId}_${worker}`,
            employeeMlId: worker,
            employeeName: "E2E Vault Worker",
            employerMlId: "ML-ENT-E2E",
            companyName: "E2E Security Co",
            planName: "E2E Roster Plan",
            epochIndex: 0,
            epochStart: Date.parse("2026-07-01T00:00:00Z"),
            epochEnd: Date.parse("2026-07-30T00:00:00Z"),
            daysScheduled: 22,
            daysCompleted: 20,
            attendanceRate: 91,
            reliabilityScore: 87,
            employerRating: 5,
            vaultFinalized: true,
            finalizedAt: Date.now(),
            exitType: "offboard",
            completedAt: Date.now(),
          },
        ]),
      );
    },
    { sessionRole: "employee", splashKey: SPLASH_KEY, worker: WORKER, planId: PLAN },
  );
}

test.describe("Planner Vault History — Hybrid A2 S5", () => {
  test("Vault home shows planner epoch stats and Gig Project review", async ({ page }) => {
    test.setTimeout(90_000);
    await initEmployee(page);
    await page.goto("/#/employee/vault", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("Something went wrong");

    await expect(page.getByText("Planner epochs")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("E2E Security Co").first()).toBeVisible();
    await expect(page.getByTestId("vault-planner-review")).toBeVisible();

    const raw = await page.evaluate(() => localStorage.getItem("wm_vault_planner_history_v1"));
    expect(raw).toBeTruthy();
    expect(raw!).toContain(PLAN);
    expect(raw!).toContain('"vaultFinalized":true');
  });
});
