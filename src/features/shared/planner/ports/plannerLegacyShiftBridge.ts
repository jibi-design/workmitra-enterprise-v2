/**
 * Job Mitra | plannerLegacyShiftBridge.ts
 * Hybrid A2 transitional anti-corruption surface.
 *
 * P-SEP-3: UI fill metrics must NOT use employerShiftStorage.getPosts().
 * Prefer plannerFillMetrics.helpers / planner roster projections.
 * Remaining bridge exports are for apply/confirm/batch until native apps store lands.
 *
 * Planner feature code must import Shift dual-write helpers ONLY from here
 * (or from plannerExecutionPort). Soft-wrap UI pages remain temporarily exempt until retired.
 *
 * Const/object SoT bindings stay as live `export { x } from` (ESM TDZ-safe).
 */

export type { ExperienceLabel } from "../../../employer/shiftJobs/storage/employerShift.types";
export type {
  ShiftPost,
  EmployeeShiftApplication,
} from "../../../employer/shiftJobs/storage/employerShift.types";
export type {
  ShiftApplicationData,
  ShiftApplicationStatus,
  ShiftPostData,
} from "../../../employee/shiftJobs/types/shiftApplicationTypes";
export type { ShiftWorkspace } from "../../../employee/shiftJobs/types/shiftWorkspace.types";
export type { StatusStyle } from "../../../employee/shiftJobs/helpers/shiftApplicationHelpers";

export { employerShiftStorage } from "../../../employer/shiftJobs/storage/employerShift.storage";
export { updateEmployerShiftPost } from "../../../employer/shiftJobs/storage/employerShift.postActions";
export {
  markEmployeeWorkspaceCancelled,
  broadcastToEmployeeWorkspace,
  readEmployeeWorkspaces,
} from "../../../employer/shiftJobs/storage/employerShift.employeeBridge";
export { findWorkspaceIdForPostAndWorker } from "../../../employer/shiftJobs/helpers/directInviteWorkspace.helpers";
export { countApplicationsForPost } from "../../../employer/shiftJobs/helpers/shiftHomeHelpers";
export { getAutoFillData } from "../../../employer/shiftJobs/helpers/shiftCreateHelpers";
export { availabilityStorage } from "../../shift/availability.reader";
export { fetchWorkersRadarCount, fetchWorkersRadarCountsByDates } from "../../../employer/shiftJobs/services/workersRadarApi.service";

import {
  getEmployerShiftPosts as getEmployerShiftPostsImpl,
  readEmployeeApplications as readEmployeeApplicationsImpl,
  writeEmployeeApplications as writeEmployeeApplicationsImpl,
  findWorkspaceIdForPostAndWorker as findWorkspaceIdForPostAndWorkerPublicImpl,
} from "../../shift/shiftEmployerPublic";

/** Dual-context-safe: employee sessions use marketplace/worker projections. */
export function getEmployerShiftPosts(
  ...args: Parameters<typeof getEmployerShiftPostsImpl>
): ReturnType<typeof getEmployerShiftPostsImpl> {
  return getEmployerShiftPostsImpl(...args);
}
export const getEmployerShiftPostsPublic = getEmployerShiftPosts;

export function readEmployeeApplications(
  ...args: Parameters<typeof readEmployeeApplicationsImpl>
): ReturnType<typeof readEmployeeApplicationsImpl> {
  return readEmployeeApplicationsImpl(...args);
}
export const readEmployeeApplicationsPublic = readEmployeeApplications;

export function writeEmployeeApplications(
  ...args: Parameters<typeof writeEmployeeApplicationsImpl>
): ReturnType<typeof writeEmployeeApplicationsImpl> {
  return writeEmployeeApplicationsImpl(...args);
}

export function findWorkspaceIdForPostAndWorkerPublic(
  ...args: Parameters<typeof findWorkspaceIdForPostAndWorkerPublicImpl>
): ReturnType<typeof findWorkspaceIdForPostAndWorkerPublicImpl> {
  return findWorkspaceIdForPostAndWorkerPublicImpl(...args);
}

export type {
  ShiftPost as ShiftPostPublic,
  EmployeeShiftApplication as EmployeeShiftApplicationPublic,
} from "../../shift/shiftEmployerPublic";

export {
  multiApplyGroup,
  isProfileComplete,
  isAlreadyApplied,
} from "../../../employee/shiftJobs/helpers/shiftSearchHelpers";
export {
  fmtTimestamp,
  statusLabel,
  computeKpi,
  computeTabCounts,
  tabMatch,
  isWithdrawableStatus,
} from "../../../employee/shiftJobs/helpers/shiftApplicationHelpers";
export type {
  KpiCounts,
  TabCounts,
} from "../../../employee/shiftJobs/helpers/shiftApplicationHelpers";
export type { ApplicationTab } from "../../../employee/shiftJobs/types/shiftApplicationTypes";
export { shiftApplicationsStorage } from "../../../employee/shiftJobs/storage/shiftApplications.storage";
export { shiftWorkspacesStorage } from "../../../employee/shiftJobs/storage/shiftWorkspaces.storage";
export { personalCalendarShiftStorage } from "../../../employee/shiftJobs/storage/personalCalendarShift.storage";
