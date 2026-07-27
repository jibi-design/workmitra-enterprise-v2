// src/features/employee/workforceOps/services/employeeWorkforceHelpers.internal.helpers.ts

import type { EmployeeWorkforcePreferences } from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  WF_EMPLOYEE_PREFS_KEY,
  safeWrite,
  safeRead,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

export function getEmployeeUniqueId(): string {
  try {
    const raw = localStorage.getItem("wm_employee_profile_v1");
    if (!raw) return "";
    const profile = JSON.parse(raw) as Record<string, unknown>;
    return typeof profile["uniqueId"] === "string" ? profile["uniqueId"] : "";
  } catch {
    return "";
  }
}

export function readPrefs(): EmployeeWorkforcePreferences {
  try {
    const raw = safeRead(WF_EMPLOYEE_PREFS_KEY);
    if (!raw) return { preferredCompanyIds: [] };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const ids = parsed["preferredCompanyIds"];
    return {
      preferredCompanyIds: Array.isArray(ids)
        ? ids.filter((x): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return { preferredCompanyIds: [] };
  }
}

export function writePrefs(prefs: EmployeeWorkforcePreferences): void {
  safeWrite(WF_EMPLOYEE_PREFS_KEY, prefs);
}
