// src/features/employer/hrManagement/helpers/leaveSubscription.ts
//
// Reactive subscription for Leave Management data.

import { useSyncExternalStore } from "react";
import { leaveManagementStorage } from "../storage/leaveManagement.storage";
import type { LeaveRequest } from "../types/leaveManagement.types";

// ─────────────────────────────────────────────────────────────────────────────
// Stable snapshot cache
// ─────────────────────────────────────────────────────────────────────────────

let cachedRaw = "";
let cachedRequests: LeaveRequest[] = [];

function getSnapshot(): LeaveRequest[] {
  const raw = localStorage.getItem("wm_hr_leave_requests_v1") ?? "";
  if (raw === cachedRaw) return cachedRequests;
  cachedRaw = raw;
  cachedRequests = leaveManagementStorage.getAllRequests();
  return cachedRequests;
}

function subscribe(cb: () => void): () => void {
  return leaveManagementStorage.subscribe(cb);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/** All leave requests (reactive) */
export function useLeaveRequests(): LeaveRequest[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Leave requests for a specific HR candidate */
export function useCandidateLeaveRequests(hrCandidateId: string): LeaveRequest[] {
  const all = useLeaveRequests();
  return all.filter((r) => r.hrCandidateId === hrCandidateId);
}