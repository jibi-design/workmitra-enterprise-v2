// Employee-safe read surface for employer shift post data + direct invite storage.
// Do not import employer/shiftJobs/* directly from employee features.
//
// Reader/action functions use thin wrappers (Rollup reexport-chunk safe).
// Const storage objects stay as live `export { x } from` (ESM TDZ-safe).

import {
  getEmployerShiftPosts as getEmployerShiftPostsImpl,
  readEmployeeApplications as readEmployeeApplicationsImpl,
  writeEmployeeApplications as writeEmployeeApplicationsImpl,
} from "./shiftEmployerPublic.readers";
import { broadcastToEmployeeWorkspace as broadcastToEmployeeWorkspaceImpl } from "../../employer/shiftJobs/storage/employerShift.employeeBridge";
import {
  acceptShiftDirectInvite as acceptShiftDirectInviteImpl,
  declineShiftDirectInvite as declineShiftDirectInviteImpl,
  sendShiftDirectInvite as sendShiftDirectInviteImpl,
} from "../../employer/shiftJobs/services/shiftDirectInvite.service";
import { findWorkspaceIdForPostAndWorker as findWorkspaceIdForPostAndWorkerImpl } from "../../employer/shiftJobs/helpers/directInviteWorkspace.helpers";

export function getEmployerShiftPosts(
  ...args: Parameters<typeof getEmployerShiftPostsImpl>
): ReturnType<typeof getEmployerShiftPostsImpl> {
  return getEmployerShiftPostsImpl(...args);
}

export function readEmployeeApplications(
  ...args: Parameters<typeof readEmployeeApplicationsImpl>
): ReturnType<typeof readEmployeeApplicationsImpl> {
  return readEmployeeApplicationsImpl(...args);
}

export function writeEmployeeApplications(
  ...args: Parameters<typeof writeEmployeeApplicationsImpl>
): ReturnType<typeof writeEmployeeApplicationsImpl> {
  return writeEmployeeApplicationsImpl(...args);
}

export function broadcastToEmployeeWorkspace(
  ...args: Parameters<typeof broadcastToEmployeeWorkspaceImpl>
): ReturnType<typeof broadcastToEmployeeWorkspaceImpl> {
  return broadcastToEmployeeWorkspaceImpl(...args);
}

export function acceptShiftDirectInvite(
  ...args: Parameters<typeof acceptShiftDirectInviteImpl>
): ReturnType<typeof acceptShiftDirectInviteImpl> {
  return acceptShiftDirectInviteImpl(...args);
}

export function declineShiftDirectInvite(
  ...args: Parameters<typeof declineShiftDirectInviteImpl>
): ReturnType<typeof declineShiftDirectInviteImpl> {
  return declineShiftDirectInviteImpl(...args);
}

export function sendShiftDirectInvite(
  ...args: Parameters<typeof sendShiftDirectInviteImpl>
): ReturnType<typeof sendShiftDirectInviteImpl> {
  return sendShiftDirectInviteImpl(...args);
}

export function findWorkspaceIdForPostAndWorker(
  ...args: Parameters<typeof findWorkspaceIdForPostAndWorkerImpl>
): ReturnType<typeof findWorkspaceIdForPostAndWorkerImpl> {
  return findWorkspaceIdForPostAndWorkerImpl(...args);
}

export { shiftDirectInviteStorage } from "../../employer/shiftJobs/storage/shiftDirectInvite.storage";
export type {
  ShiftDirectInvite,
  ShiftDirectInviteStatus,
} from "../../employer/shiftJobs/storage/shiftDirectInvite.storage";
export type {
  AcceptShiftDirectInviteInput,
  SendShiftDirectInviteInput,
} from "../../employer/shiftJobs/services/shiftDirectInvite.service";
export type {
  ShiftPost,
  EmployeeShiftApplication,
} from "../../employer/shiftJobs/storage/employerShift.types";
export type { ShiftWorkspace } from "../../employer/shiftJobs/types/shiftWorkspaceTypes";
