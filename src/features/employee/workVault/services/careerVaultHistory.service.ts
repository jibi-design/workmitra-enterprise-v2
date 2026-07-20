// App name: Job Mitra
// File name: careerVaultHistory.service.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\services\careerVaultHistory.service.ts

import type { EmploymentRecord } from "../../../../shared/employment/employmentTypes";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import {
  finalizeVaultCareerHistory,
  updateVaultCareerHistoryRatings,
  upsertVaultCareerHistoryOnClosure,
  type VaultCareerHistoryEntry,
} from "../storage/vaultCareerHistory.storage";

export function recordCareerClosureInVault(
  record: EmploymentRecord,
  exitType: VaultCareerHistoryEntry["exitType"],
): VaultCareerHistoryEntry | null {
  const careerPostId = record.careerPostId?.trim();
  if (!careerPostId) return null;

  const completedAt = record.completedAt ?? Date.now();
  const employeeWmId = record.employeeWmId?.trim() || record.employeeId?.trim() || "";

  if (!employeeWmId) return null;

  const entry = upsertVaultCareerHistoryOnClosure({
    careerPostId,
    employmentId: record.id,
    employeeWmId,
    employeeName: record.employeeName,
    companyName: record.companyName,
    jobTitle: record.jobTitle,
    joinedAt: record.joinedAt ?? undefined,
    completedAt,
    exitType,
  });

  syncVaultCareerRatingsForPost(careerPostId, record);
  return entry;
}

export function syncVaultCareerRatingsForPost(
  careerPostId: string,
  record: EmploymentRecord,
): void {
  const workerWmId = record.employeeWmId?.trim() || record.employeeId?.trim() || "";
  const employerWmId = record.employerWmId?.trim() ?? "";

  if (!workerWmId || !employerWmId) return;

  const workerRating = ratingStorage.getWorkerRatingForJob(
    workerWmId,
    careerPostId,
    employerWmId,
  )?.stars;
  const employerRating = ratingStorage.getEmployerRatingForJob(
    employerWmId,
    careerPostId,
    workerWmId,
  )?.stars;

  updateVaultCareerHistoryRatings(careerPostId, {
    employeeRating: workerRating,
    employerRating: employerRating,
  });

  const hasWorkerRating = typeof workerRating === "number" && workerRating > 0;
  const hasEmployerRating = typeof employerRating === "number" && employerRating > 0;

  if (hasWorkerRating || hasEmployerRating) {
    finalizeVaultCareerHistory(careerPostId);
  }
}
