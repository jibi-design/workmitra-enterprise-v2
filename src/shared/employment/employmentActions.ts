// src/shared/employment/employmentActions.ts
//
// Session 17: Employment status transition actions + notification triggers.
// Phase 16: when AUTH_BACKEND_ENABLED, dual-write to DB; LS-only ids blocked.

import { employmentEmployerActions } from "./employmentActions.employer";
import { employmentEmployeeActions } from "./employmentActions.employee";

export const employmentActions = {
  markAsJoined: employmentEmployerActions.markAsJoined,
  confirmResignation: employmentEmployerActions.confirmResignation,
  terminate: employmentEmployerActions.terminate,
  resign: employmentEmployeeActions.resign,
  withdrawResignation: employmentEmployeeActions.withdrawResignation,
  forceComplete: employmentEmployeeActions.forceComplete,
} as const;
