// App name: Job Mitra
// File name: employerShiftReviewCenter.adapter.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\adapters\employerShiftReviewCenter.adapter.ts

import { getCurrentActorId, identityBridge } from "../../../../app/identity/identity.adapter";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import type { ShiftWorkspace } from "../../../employer/shiftJobs/types/shiftWorkspaceTypes";

export type EmployerShiftReviewItem = {
  workspaceId: string;
  sourceTitle: string;
  companyName: string;
  jobName: string;
  status: "completed";
};

function hasWorkspaceRating(workspace: ShiftWorkspace): boolean {
  return (
    typeof workspace.employerRating === "number" &&
    Number.isFinite(workspace.employerRating) &&
    workspace.employerRating > 0
  );
}

function hasStoredEmployerRating(workspace: ShiftWorkspace): boolean {
  const profile = employerSettingsStorage.get();
  const employerMlId = profile.uniqueId?.trim() || "employer_local_demo";
  const actor = getCurrentActorId("employer");
  const realLegacy = profile.uniqueId?.trim();
  if (actor.source === "auth" && actor.authUserId && realLegacy) {
    identityBridge.upsert("employer", realLegacy, actor.authUserId);
  }
  const workerMlId = workspace.workerMlId?.trim() || "";

  if (!workerMlId) return false;

  return ratingStorage.hasEmployerRatedWorker(employerMlId, workspace.postId, workerMlId);
}

function hasEmployerRating(workspace: ShiftWorkspace): boolean {
  return hasWorkspaceRating(workspace) || hasStoredEmployerRating(workspace);
}

export function getEmployerShiftReviewItems(
  workspaces: ShiftWorkspace[],
): EmployerShiftReviewItem[] {
  return workspaces
    .filter((workspace) => workspace.status === "completed" && !hasEmployerRating(workspace))
    .map((workspace) => ({
      workspaceId: workspace.id,
      sourceTitle: `${workspace.companyName} - ${workspace.jobName}`,
      companyName: workspace.companyName,
      jobName: workspace.jobName,
      status: "completed" as const,
    }));
}

export function getEmployerPendingShiftReviewCount(workspaces: ShiftWorkspace[]): number {
  return getEmployerShiftReviewItems(workspaces).length;
}
