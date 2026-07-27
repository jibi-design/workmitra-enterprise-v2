/** Job Mitra | hrStorageKeys.ts | src/features/employer/hrManagement/storage/hrStorageKeys.ts
 *
 * Employer-scoped HR localStorage keys.
 * Pattern: wm_hr_employer_{employerId}_{suffix}
 */

import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";

const FORBIDDEN_EMPLOYEE_IDS = new Set(["employee_demo", "employer_demo", "unknown", ""]);

export function getHrEmployerScopeId(): string {
  const raw = employerSettingsStorage.get().uniqueId?.trim() || "unknown_employer";
  return raw.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Builds wm_hr_employer_{employerId}_{suffix} */
export function hrEmployerScopedKey(suffix: string): string {
  return `wm_hr_employer_${getHrEmployerScopeId()}_${suffix}`;
}

/** Reject demo / empty ids before writing HR records. */
export function assertValidHrEmployeeUniqueId(employeeUniqueId: string): string {
  const trimmed = employeeUniqueId.trim();
  if (!trimmed || FORBIDDEN_EMPLOYEE_IDS.has(trimmed.toLowerCase())) {
    throw new Error(
      "HR requires a real employee uniqueId (ML id). Demo fallback ids are not allowed.",
    );
  }
  return trimmed;
}
