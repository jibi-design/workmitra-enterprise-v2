/**
 * Job Mitra | plannerVaultHistory.service.ts
 * Hybrid A2 P1.4 — service façade for wm_vault_planner_history_v1
 *
 * Milestone engine (S7) calls recordPlannerEpochInVault.
 * Ratings domain (S6) calls syncPlannerVaultRatings.
 */

import {
  finalizeVaultPlannerEpoch,
  finalizeVaultPlannerOnClosure,
  updateVaultPlannerHistoryRatings,
  upsertVaultPlannerEpoch,
  type UpsertPlannerEpochInput,
  type VaultPlannerExitType,
  type VaultPlannerHistoryEntry,
} from "../storage/vaultPlannerHistory.storage";

export type RecordPlannerEpochInput = UpsertPlannerEpochInput;

export function recordPlannerEpochInVault(
  input: RecordPlannerEpochInput,
): VaultPlannerHistoryEntry | null {
  return upsertVaultPlannerEpoch(input);
}

export function syncPlannerVaultRatings(input: {
  planId: string;
  employeeMlId: string;
  epochIndex: number;
  employeeRating?: number;
  employerRating?: number;
}): VaultPlannerHistoryEntry | null {
  const updated = updateVaultPlannerHistoryRatings(
    input.planId,
    input.employeeMlId,
    input.epochIndex,
    {
      employeeRating: input.employeeRating,
      employerRating: input.employerRating,
    },
  );
  if (!updated) return null;

  const hasEmployee = typeof input.employeeRating === "number" && input.employeeRating > 0;
  const hasEmployer = typeof input.employerRating === "number" && input.employerRating > 0;
  if (hasEmployee || hasEmployer) {
    const finalized = finalizeVaultPlannerEpoch(input.planId, input.employeeMlId, input.epochIndex);
    return finalized.ok ? finalized.entry : updated;
  }

  return updated;
}

export function recordPlannerOffboardInVault(input: {
  planId: string;
  employeeMlId: string;
  exitType: VaultPlannerExitType;
}): VaultPlannerHistoryEntry | null {
  const result = finalizeVaultPlannerOnClosure(input.planId, input.employeeMlId, input.exitType);
  return result.ok ? result.entry : null;
}

export type { VaultPlannerExitType, VaultPlannerHistoryEntry };
