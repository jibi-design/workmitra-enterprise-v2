/** Hybrid A2 S5 — wm_vault_planner_history_v1 + aggregator gate */

import { beforeEach, describe, expect, it } from "vitest";
import {
  VAULT_PLANNER_HISTORY_KEY,
  getVaultPlannerHistory,
  getVaultPlannerHistoryForWorker,
  finalizeVaultPlannerOnClosure,
} from "../../storage/vaultPlannerHistory.storage";
import {
  recordPlannerEpochInVault,
  syncPlannerVaultRatings,
  recordPlannerOffboardInVault,
} from "../plannerVaultHistory.service";
import { getVaultSectionData } from "../vaultDataAggregator";

const WORKER = "ML-PLAN-VAULT-001";
const EMPLOYER = "ML-ENT-PLAN-001";
const PLAN = "dp_vault_s5";

function seedEpoch(epochIndex: number, extras?: { attendanceRate?: number }) {
  return recordPlannerEpochInVault({
    planId: PLAN,
    assignmentId: `${PLAN}_${WORKER}`,
    employeeMlId: WORKER,
    employeeName: "Planner Vault Worker",
    employerMlId: EMPLOYER,
    companyName: "Epoch Agency",
    planName: "Hospital Roster",
    epochIndex,
    epochStart: Date.parse("2026-08-01T00:00:00Z") + epochIndex * 30 * 86_400_000,
    epochEnd: Date.parse("2026-08-30T00:00:00Z") + epochIndex * 30 * 86_400_000,
    daysScheduled: 20,
    daysCompleted: 18,
    attendanceRate: extras?.attendanceRate ?? 90,
    reliabilityScore: 88,
    siteManagerId: "ML-SITE-MGR-1",
    siteId: "site_City A_1",
  });
}

describe("planner vault history (Hybrid A2 S5)", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "wm_employee_profile_v1",
      JSON.stringify({ uniqueId: WORKER, fullName: "Planner Vault Worker", skills: [] }),
    );
  });

  it("upserts idempotently by (planId, employeeMlId, epochIndex)", () => {
    const first = seedEpoch(0);
    expect(first).not.toBeNull();
    expect(first!.vaultFinalized).toBe(false);

    const second = seedEpoch(0, { attendanceRate: 95 });
    expect(second).not.toBeNull();
    expect(second!.id).toBe(first!.id);
    expect(second!.attendanceRate).toBe(95);

    const history = getVaultPlannerHistoryForWorker(WORKER);
    expect(history).toHaveLength(1);
    expect(localStorage.getItem(VAULT_PLANNER_HISTORY_KEY)).toContain(PLAN);
  });

  it("keeps separate epoch rows and finalizes all on offboard", () => {
    seedEpoch(0);
    seedEpoch(1);
    expect(getVaultPlannerHistory()).toHaveLength(2);

    const closed = recordPlannerOffboardInVault({
      planId: PLAN,
      employeeMlId: WORKER,
      exitType: "offboard",
    });
    expect(closed?.vaultFinalized).toBe(true);
    expect(closed?.exitType).toBe("offboard");

    const all = getVaultPlannerHistoryForWorker(WORKER);
    expect(all.every((e) => e.vaultFinalized)).toBe(true);
    expect(all.every((e) => e.exitType === "offboard")).toBe(true);
  });

  it("finalizes a single epoch when ratings sync (without diluting overall rating)", () => {
    seedEpoch(0);
    syncPlannerVaultRatings({
      planId: PLAN,
      employeeMlId: WORKER,
      epochIndex: 0,
      employerRating: 5,
      employeeRating: 4,
    });

    const entry = getVaultPlannerHistoryForWorker(WORKER)[0];
    expect(entry?.employerRating).toBe(5);
    expect(entry?.vaultFinalized).toBe(true);

    // Seed a shift rating so overallRating is computable and prove planner 5★ is excluded.
    localStorage.setItem(
      "wm_ratings_employer_to_worker_v1",
      JSON.stringify([
        {
          id: "r1",
          domain: "shift",
          workerMlId: WORKER,
          employerMlId: "ML-OTHER",
          jobId: "shift_job_1",
          stars: 3,
          tags: ["Reliable"],
          hireAgain: true,
          createdAt: Date.now(),
          editedAt: null,
          editCount: 0,
        },
      ]),
    );

    const vault = getVaultSectionData();
    expect(vault.workStats.totalPlannerEpochs).toBe(1);
    expect(vault.references.some((r) => r.source === "planner")).toBe(true);
    expect(vault.performance.overallRating).toBe(3);
    expect(vault.performance.totalReviews).toBe(1);
  });

  it("finalizeVaultPlannerOnClosure is idempotent", () => {
    seedEpoch(0);
    finalizeVaultPlannerOnClosure(PLAN, WORKER, "plan_cancelled");
    finalizeVaultPlannerOnClosure(PLAN, WORKER, "plan_cancelled");
    expect(getVaultPlannerHistoryForWorker(WORKER)).toHaveLength(1);
    expect(getVaultPlannerHistoryForWorker(WORKER)[0]?.exitType).toBe("plan_cancelled");
  });
});
