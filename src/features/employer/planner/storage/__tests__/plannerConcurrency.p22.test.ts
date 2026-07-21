/** Hybrid A2 Phase-2 P2.2 — optimistic updatePlan + concurrency locks */

import { beforeEach, describe, expect, it } from "vitest";
import { demandPlannerStorage } from "../demandPlannerStorage";
import {
  PLANNER_BATCH_ACTION_LOCK_KEY,
  PLANNER_BATCH_APPLIED_KEY,
  __resetPlannerTabIdCacheForTests,
  acquirePublishLock,
  claimBatchActionLock,
  hasSeenApplyBatchId,
  markApplyBatchIdSeen,
  releaseBatchActionLock,
  releasePublishLock,
} from "../../../../shared/planner/services/plannerConcurrency.service";

function seedDraft(id = "dp_p22"): string {
  localStorage.setItem(
    "wm_employer_demand_plans_v1",
    JSON.stringify([
      {
        id,
        name: "Concurrency Draft",
        companyName: "Lock Co",
        locationName: "Kochi",
        category: "Security",
        experience: "experienced",
        startDate: "2026-12-01",
        endDate: "2026-12-02",
        workingDays: [1, 2],
        slots: [{ date: "2026-12-01", workers: 1, payPerDay: 700, slotId: `sl_${id}_1` }],
        status: "draft",
        createdAt: 100,
        updatedAt: 100,
        schemaVersion: 2,
        legalEntityMlId: "ML-P22",
        epochDays: 30,
        milestoneCursor: 0,
        publishStatus: "idle",
      },
    ]),
  );
  return id;
}

describe("Hybrid A2 P2.2 — optimistic updatePlan", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    __resetPlannerTabIdCacheForTests();
  });

  it("rejects stale expectedUpdatedAt", () => {
    const id = seedDraft();
    const first = demandPlannerStorage.updatePlan(id, { name: "A" }, { expectedUpdatedAt: 100 });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const stale = demandPlannerStorage.updatePlan(id, { name: "B" }, { expectedUpdatedAt: 100 });
    expect(stale.ok).toBe(false);
    if (stale.ok) return;
    expect(stale.reason).toBe("stale");
    expect(stale.currentUpdatedAt).toBe(first.plan.updatedAt);
    expect(demandPlannerStorage.getById(id)?.name).toBe("A");
  });

  it("accepts matching expectedUpdatedAt", () => {
    const id = seedDraft();
    const ok = demandPlannerStorage.updatePlan(id, { name: "Fresh" }, { expectedUpdatedAt: 100 });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.plan.name).toBe("Fresh");
    expect(ok.plan.updatedAt).toBeGreaterThan(100);
  });
});

describe("Hybrid A2 P2.2 — publish + batch locks", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    __resetPlannerTabIdCacheForTests();
  });

  it("blocks second tab from acquiring publish lock", () => {
    sessionStorage.setItem("wm_planner_tab_id_v1", "tab_a");
    __resetPlannerTabIdCacheForTests();
    const first = acquirePublishLock("dp_lock");
    expect(first.ok).toBe(true);

    sessionStorage.setItem("wm_planner_tab_id_v1", "tab_b");
    __resetPlannerTabIdCacheForTests();
    const second = acquirePublishLock("dp_lock");
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.reason).toBe("locked");

    if (first.ok) releasePublishLock("dp_lock", first.token);
    const after = acquirePublishLock("dp_lock");
    expect(after.ok).toBe(true);
  });

  it("claimBatchActionLock rejects foreign holder", () => {
    localStorage.setItem(
      PLANNER_BATCH_ACTION_LOCK_KEY,
      JSON.stringify([
        {
          planApplyBatchId: "pb_1",
          action: "approve",
          token: "tok_other",
          holderTabId: "tab_other",
          expiresAt: Date.now() + 60_000,
        },
      ]),
    );
    const claim = claimBatchActionLock("pb_1", "approve");
    expect(claim.ok).toBe(false);
    if (claim.ok) return;
    expect(claim.reason).toBe("locked");
  });

  it("markApplyBatchIdSeen dedupes", () => {
    expect(hasSeenApplyBatchId("pb_seen")).toBe(false);
    markApplyBatchIdSeen("pb_seen");
    expect(hasSeenApplyBatchId("pb_seen")).toBe(true);
    const raw = JSON.parse(localStorage.getItem(PLANNER_BATCH_APPLIED_KEY) ?? "[]") as string[];
    expect(raw[0]).toBe("pb_seen");
  });

  it("same tab can re-claim batch lock and release", () => {
    const a = claimBatchActionLock("pb_same", "apply");
    expect(a.ok).toBe(true);
    const b = claimBatchActionLock("pb_same", "apply");
    expect(b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.token).toBe(b.token);
      releaseBatchActionLock("pb_same", "apply", a.token);
    }
    const after = claimBatchActionLock("pb_same", "apply");
    expect(after.ok).toBe(true);
  });
});
