// src/features/employee/employment/helpers/employeeHRSubscription.ts
//
// Reactive subscription for employee to read HR Management data.
// Phase-0: direct localStorage read (same as employer side).
// Backend phase: will be replaced with API calls.

import { useSyncExternalStore } from "react";
import { hrManagementStorage } from "../../../employer/hrManagement/storage/hrManagement.storage";
import type { HRCandidateRecord } from "../../../employer/hrManagement/types/hrManagement.types";

// ─────────────────────────────────────────────────────────────────────────────
// Stable snapshot cache
// ─────────────────────────────────────────────────────────────────────────────

let cachedRaw = "";
let cachedRecords: HRCandidateRecord[] = [];

function getSnapshot(): HRCandidateRecord[] {
  const raw = localStorage.getItem("wm_hr_management_v1") ?? "";
  if (raw === cachedRaw) return cachedRecords;
  cachedRaw = raw;
  cachedRecords = hrManagementStorage.getAll();
  return cachedRecords;
}

function subscribe(cb: () => void): () => void {
  return hrManagementStorage.subscribe(cb);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Get all HR records (employee reads employer's HR data) */
export function useEmployeeHRRecords(): HRCandidateRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Get pending offer for this employee (status = "offered") */
export function useEmployeePendingOffer(employeeUniqueId: string): HRCandidateRecord | null {
  const all = useEmployeeHRRecords();
  return all.find(
    (r) => r.employeeUniqueId === employeeUniqueId && r.status === "offered",
  ) ?? null;
}