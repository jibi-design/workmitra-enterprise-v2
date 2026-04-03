// src/features/employee/profile/services/profileCompletionService.ts
//
// Exposes profile completion status globally.
// Used by: Dashboard nudge, Share hint, Apply hint.
// No percentages — counts only (Master Doc rule).

import { employeeProfileStorage } from "../storage/employeeProfile.storage";
import { computeChecklist } from "../helpers/profileHelpers";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type CompletionStatus = {
  doneCount: number;
  totalCount: number;
  isComplete: boolean;
  missingLabels: string[];
};

/* ------------------------------------------------ */
/* Public API                                       */
/* ------------------------------------------------ */
export function getProfileCompletion(): CompletionStatus {
  const profile = employeeProfileStorage.get();
  const result = computeChecklist(profile);
  const missing: string[] = [];
  for (const row of result.rows) {
    if (!row.done) missing.push(row.label);
  }
  return {
    doneCount: result.doneCount,
    totalCount: result.totalCount,
    isComplete: result.doneCount >= result.totalCount,
    missingLabels: missing,
  };
}