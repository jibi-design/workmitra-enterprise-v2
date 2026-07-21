/**
 * Job Mitra | plannerLegacyShiftBridge.ts
 * Hybrid A2 S3 transitional anti-corruption surface.
 *
 * Planner feature code must import Shift dual-write helpers ONLY from here
 * (or from plannerExecutionPort). Soft-wrap UI pages remain temporarily exempt until S4/S7.
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
export {
  getEmployerShiftPosts,
  updateEmployerShiftPost,
} from "../../../employer/shiftJobs/storage/employerShift.postActions";
export {
  readEmployeeApplications,
  writeEmployeeApplications,
  markEmployeeWorkspaceCancelled,
  broadcastToEmployeeWorkspace,
  readEmployeeWorkspaces,
} from "../../../employer/shiftJobs/storage/employerShift.employeeBridge";
export { findWorkspaceIdForPostAndWorker } from "../../../employer/shiftJobs/helpers/directInviteWorkspace.helpers";
export { countApplicationsForPost } from "../../../employer/shiftJobs/helpers/shiftHomeHelpers";
export { getAutoFillData } from "../../../employer/shiftJobs/helpers/shiftCreateHelpers";
export { availabilityStorage } from "../../shift/availability.reader";

export {
  getEmployerShiftPosts as getEmployerShiftPostsPublic,
  readEmployeeApplications as readEmployeeApplicationsPublic,
  findWorkspaceIdForPostAndWorker as findWorkspaceIdForPostAndWorkerPublic,
} from "../../shift/shiftEmployerPublic";
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
