// App name: Job Mitra
// File name: employeeShiftReviewCenter.adapter.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\shared\reviewCenter\adapters\employeeShiftReviewCenter.adapter.ts

import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import { employeeProfileStorage } from "../../../employee/profile/storage/employeeProfile.storage";
import type { ShiftWorkspace } from "../../../employee/shiftJobs/storage/shiftWorkspaces.storage";

export type EmployeeShiftReviewItem = {
  workspaceId: string;
  sourceTitle: string;
  companyName: string;
  jobName: string;
  status: "completed";
};

function hasEmployeeRatedEmployer(workspace: ShiftWorkspace): boolean {
  if (workspace.rating) return true;

  const workerMlId = employeeProfileStorage.get().uniqueId?.trim() || "";
  const employerMlId = employerSettingsStorage.get().uniqueId?.trim() || "";

  if (!workerMlId || !employerMlId) return false;

  return ratingStorage.hasWorkerRatedEmployer(workerMlId, workspace.postId, employerMlId);
}

export function getEmployeeShiftReviewItems(
  workspaces: ShiftWorkspace[],
): EmployeeShiftReviewItem[] {
  return workspaces
    .filter((workspace) => workspace.status === "completed" && !hasEmployeeRatedEmployer(workspace))
    .map((workspace) => ({
      workspaceId: workspace.id,
      sourceTitle: `${workspace.companyName} - ${workspace.jobName}`,
      companyName: workspace.companyName,
      jobName: workspace.jobName,
      status: "completed" as const,
    }));
}

export function getPendingShiftReviewCount(workspaces: ShiftWorkspace[]): number {
  return getEmployeeShiftReviewItems(workspaces).length;
}
