// App name: Job Mitra
// File name: shiftVaultHistory.service.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\services\shiftVaultHistory.service.ts

import type { ShiftWorkspace } from "../../../shared/shift/shiftEmployerPublic";
import { readEmployeeApplications } from "../../../shared/shift/shiftEmployerPublic";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../../../shared/employerProfile/employerSettingsPublic";
import { employeeNotificationsStorage } from "../../notifications/storage/employeeNotifications.storage";
import {
  finalizeVaultShiftHistory,
  updateVaultShiftHistoryRatings,
  upsertVaultShiftHistoryOnComplete,
  VAULT_SHIFT_HISTORY_MAX,
} from "../storage/vaultShiftHistory.storage";

function resolveWorkerMlId(workspace: ShiftWorkspace): string {
  const direct = workspace.workerMlId?.trim();
  if (direct) return direct;

  const appId = workspace.appId?.trim();
  if (!appId) return "";

  const application = readEmployeeApplications().find((app) => app.id === appId);
  return application?.profileSnapshot?.uniqueId?.trim() ?? "";
}

export function recordShiftCompletedInVault(
  workspace: ShiftWorkspace,
  completedAt = Date.now(),
): void {
  const workerMlId = resolveWorkerMlId(workspace);
  if (!workerMlId) return;

  const result = upsertVaultShiftHistoryOnComplete({
    workspaceId: workspace.id,
    postId: workspace.postId,
    workerMlId,
    workerName: workspace.workerName?.trim() || "Worker",
    companyName: workspace.companyName,
    jobTitle: workspace.jobName,
    startAt: workspace.startAt,
    endAt: workspace.endAt,
    completedAt,
  });

  if (result && result.trimmedOldest > 0) {
    employeeNotificationsStorage.pushShift(
      "Shift history limit reached",
      `Kept the latest ${VAULT_SHIFT_HISTORY_MAX} completed shifts on this device. ${result.trimmedOldest} older record(s) were removed.`,
    );
  }
}

export function syncVaultShiftRatings(workspace: ShiftWorkspace): void {
  const workerMlId = resolveWorkerMlId(workspace);
  if (!workerMlId) return;

  const employerMlId = employerSettingsStorage.get().uniqueId?.trim() ?? "";

  const workerRating =
    workspace.rating ??
    ratingStorage.getWorkerRatingForJob(workerMlId, workspace.postId, employerMlId)?.stars;

  const employerRating =
    workspace.employerRating ??
    ratingStorage.getEmployerRatingForJob(employerMlId, workspace.postId, workerMlId)?.stars;

  updateVaultShiftHistoryRatings(workspace.id, {
    workerRating,
    employerRating,
  });

  if (
    (typeof workerRating === "number" && workerRating > 0) ||
    (typeof employerRating === "number" && employerRating > 0)
  ) {
    finalizeVaultShiftHistory(workspace.id);
  }
}

export type VaultFinalizePostResult =
  { ok: true } | { ok: false; reason: "storage_error"; workspaceId: string };

export function finalizeVaultShiftHistoryForPost(
  postId: string,
  workspaces: ShiftWorkspace[],
): VaultFinalizePostResult {
  for (const workspace of workspaces) {
    if (workspace.postId !== postId || workspace.status !== "completed") continue;

    syncVaultShiftRatings(workspace);

    const finalizeResult = finalizeVaultShiftHistory(workspace.id);
    if (!finalizeResult.ok) {
      return { ok: false, reason: "storage_error", workspaceId: workspace.id };
    }
  }

  return { ok: true };
}
