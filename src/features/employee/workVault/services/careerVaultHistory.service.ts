// App name: Job Mitra
// File name: careerVaultHistory.service.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\services\careerVaultHistory.service.ts

import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import {
  finalizeVaultCareerHistory,
  finalizeVaultCareerHistoryOnClosure,
  updateVaultCareerHistoryRatings,
  upsertVaultCareerHistoryOnClosure,
  type VaultCareerHistoryEntry,
} from "../storage/vaultCareerHistory.storage";

/** Minimal fields for rating key resolve (shared EmploymentRecord or profile IDs). */
export type VaultCareerRatingSource = {
  employeeMlId?: string | null;
  employeeId?: string | null;
  employerMlId?: string | null;
};

export function recordCareerClosureInVault(
  record: EmploymentRecord,
  exitType: VaultCareerHistoryEntry["exitType"],
): VaultCareerHistoryEntry | null {
  const careerPostId = record.careerPostId?.trim();
  if (!careerPostId) return null;

  const completedAt = record.completedAt ?? Date.now();
  const employeeMlId = record.employeeMlId?.trim() || record.employeeId?.trim() || "";

  if (!employeeMlId) return null;

  const entry = upsertVaultCareerHistoryOnClosure({
    careerPostId,
    employmentId: record.id,
    employeeMlId,
    employeeName: record.employeeName,
    companyName: record.companyName,
    jobTitle: record.jobTitle,
    joinedAt: record.joinedAt ?? undefined,
    completedAt,
    exitType,
  });

  syncVaultCareerRatingsForPost(careerPostId, record);
  finalizeVaultCareerHistoryOnClosure(careerPostId, employeeMlId);
  return entry;
}

export function syncVaultCareerRatingsForPost(
  careerPostId: string,
  record: VaultCareerRatingSource,
): void {
  const workerMlId = record.employeeMlId?.trim() || record.employeeId?.trim() || "";
  const employerMlId = record.employerMlId?.trim() ?? "";

  if (!workerMlId || !employerMlId) return;

  const workerRating = ratingStorage.getWorkerRatingForJob(
    workerMlId,
    careerPostId,
    employerMlId,
  )?.stars;
  const employerRating = ratingStorage.getEmployerRatingForJob(
    employerMlId,
    careerPostId,
    workerMlId,
  )?.stars;

  updateVaultCareerHistoryRatings(
    careerPostId,
    {
      employeeRating: workerRating,
      employerRating: employerRating,
    },
    workerMlId,
  );

  const hasWorkerRating = typeof workerRating === "number" && workerRating > 0;
  const hasEmployerRating = typeof employerRating === "number" && employerRating > 0;

  if (hasWorkerRating || hasEmployerRating) {
    finalizeVaultCareerHistory(careerPostId, workerMlId);
  }
}
