// App name: Job Mitra
// File name: shiftApplications.storage.ts — facade

export type {
  WithdrawShiftApplicationResult,
  CancelConfirmedAssignmentResult,
  ConfirmShiftAttendanceResult,
} from "./shiftApplications.storage.types";

import {
  cancelConfirmedAssignment,
  confirmAttendance,
  getApps,
  getPosts,
  subscribe,
  withdrawApplication,
} from "./shiftApplications.storage.internal";

export const shiftApplicationsStorage = {
  getPosts,
  getApps,
  subscribe,
  withdrawApplication,
  cancelConfirmedAssignment,
  confirmAttendance,
} as const;
