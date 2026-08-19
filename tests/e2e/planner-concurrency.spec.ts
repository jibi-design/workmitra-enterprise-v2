/**
 * Hybrid A2 Phase-2 P2.2 — dual-tab concurrency smoke (shared localStorage)
 * Run: npx playwright test --project=chromium tests/e2e/planner-concurrency.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const SPLASH_KEY = "wm_splash_intro_played_v1";
const PLAN = "dp_e2e_p22_lock";

async function seedDraft(page: Page): Promise<void> {
  await page.addInitScript(
    ({ sessionRole, splashKey, planId }) => {
      sessionStorage.setItem("wm_role_session_v1", sessionRole);
      sessionStorage.setItem(splashKey, "1");
      localStorage.setItem(
        "wm_employer_demand_plans_v1",
        JSON.stringify([
          {
            id: planId,
            name: "Concurrency Plan",
            companyName: "Lock Co",
            locationName: "City A",
            category: "Security",
            experience: "experienced",
            startDate: "2026-12-01",
            endDate: "2026-12-02",
            workingDays: [1, 2],
            slots: [{ date: "2026-12-01", workers: 2, payPerDay: 900, slotId: `sl_${planId}_1` }],
            status: "draft",
            createdAt: 1,
            updatedAt: 100,
            schemaVersion: 2,
            legalEntityMlId: "ML-P22-E2E",
            epochDays: 30,
            milestoneCursor: 0,
            publishStatus: "idle",
            draftStep: 3,
          },
        ]),
      );
    },
    { sessionRole: "employer", splashKey: SPLASH_KEY, planId: PLAN },
  );
}

test.describe("Planner Concurrency — Hybrid A2 P2.2", () => {
  test("dual tab: second tab cannot hold publish lock while first holds it", async ({
    browser,
  }) => {
    // Same context = shared localStorage; separate pages = separate sessionStorage (tab ids).
    const context = await browser.newContext();
    const pageA = await context.newPage();
    const pageB = await context.newPage();
    await seedDraft(pageA);
    await seedDraft(pageB);

    await pageA.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });
    await pageB.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });

    const lockA = await pageA.evaluate(async (planId) => {
      const mod =
        await import("/src/features/shared/planner/services/plannerConcurrency.service.ts");
      return mod.acquirePublishLock(planId) as
        { ok: true; token: string } | { ok: false; reason: string };
    }, PLAN);

    expect(lockA.ok).toBe(true);

    const lockB = await pageB.evaluate(async (planId) => {
      const mod =
        await import("/src/features/shared/planner/services/plannerConcurrency.service.ts");
      return mod.acquirePublishLock(planId) as
        { ok: true; token: string } | { ok: false; reason: string };
    }, PLAN);

    expect(lockB.ok).toBe(false);
    if (!lockB.ok) expect(lockB.reason).toBe("locked");

    if (lockA.ok) {
      await pageA.evaluate(
        async ({ planId, token }) => {
          const mod =
            await import("/src/features/shared/planner/services/plannerConcurrency.service.ts");
          mod.releasePublishLock(planId, token);
        },
        { planId: PLAN, token: lockA.token },
      );
    }

    const lockB2 = await pageB.evaluate(async (planId) => {
      const mod =
        await import("/src/features/shared/planner/services/plannerConcurrency.service.ts");
      return mod.acquirePublishLock(planId) as
        { ok: true; token: string } | { ok: false; reason: string };
    }, PLAN);
    expect(lockB2.ok).toBe(true);

    await context.close();
  });

  test("stale updatePlan rejected when expectedUpdatedAt mismatches", async ({ page }) => {
    await seedDraft(page);
    await page.goto("/#/employer/planner/home", { waitUntil: "domcontentloaded" });

    const result = await page.evaluate(async (planId) => {
      const storage =
        await import("/src/features/employer/planner/storage/demandPlannerStorage.ts");
      // Other tab wrote first
      const first = storage.demandPlannerStorage.updatePlan(planId, { name: "Other tab" });
      if (!first.ok) return { ok: false as const, stage: "first" };

      const stale = storage.demandPlannerStorage.updatePlan(
        planId,
        { name: "Stale overwrite" },
        { expectedUpdatedAt: 100 },
      );
      return {
        ok: true as const,
        staleOk: stale.ok,
        reason: stale.ok ? null : stale.reason,
        name: storage.demandPlannerStorage.getById(planId)?.name ?? null,
      };
    }, PLAN);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.staleOk).toBe(false);
    expect(result.reason).toBe("stale");
    expect(result.name).toBe("Other tab");
  });
});
