// src/features/employer/hrManagement/storage/leaveManagement.storage.ts
//
// CRUD service for Leave Management.
// Handles leave requests, allocations, and balance computation.

import type {
  LeaveRequest,
  LeaveAllocation,
  LeaveType,
  LeaveBalance,
  LeaveStatus,
} from "../types/leaveManagement.types";
import { DEFAULT_LEAVE_ALLOCATION } from "../types/leaveManagement.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const REQUESTS_KEY = "wm_hr_leave_requests_v1";
const ALLOCATIONS_KEY = "wm_hr_leave_allocations_v1";
const CHANGED_EVENT = "wm:hr-leave-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function readRequests(): LeaveRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LeaveRequest[]) : [];
  } catch {
    return [];
  }
}

function writeRequests(records: LeaveRequest[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function readAllocations(): LeaveAllocation[] {
  try {
    const raw = localStorage.getItem(ALLOCATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LeaveAllocation[]) : [];
  } catch {
    return [];
  }
}

function writeAllocations(records: LeaveAllocation[]): void {
  localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(): string {
  return "lv_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function calcDays(from: number, to: number): number {
  return Math.max(1, Math.ceil((to - from) / 86400000) + 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const leaveManagementStorage = {
  // ── Leave Requests ──

  /** Get all requests (newest first) */
  getAllRequests(): LeaveRequest[] {
    return readRequests().sort((a, b) => b.appliedAt - a.appliedAt);
  },

  /** Get requests for a specific HR candidate */
  getByCandidate(hrCandidateId: string): LeaveRequest[] {
    return readRequests()
      .filter((r) => r.hrCandidateId === hrCandidateId)
      .sort((a, b) => b.appliedAt - a.appliedAt);
  },

  /** Get pending requests for a candidate */
  getPendingByCandidate(hrCandidateId: string): LeaveRequest[] {
    return readRequests()
      .filter((r) => r.hrCandidateId === hrCandidateId && r.status === "pending")
      .sort((a, b) => b.appliedAt - a.appliedAt);
  },

  /** Get all pending requests (employer view) */
  getAllPending(): LeaveRequest[] {
    return readRequests()
      .filter((r) => r.status === "pending")
      .sort((a, b) => b.appliedAt - a.appliedAt);
  },

  /** Get request by ID */
  getById(id: string): LeaveRequest | null {
    return readRequests().find((r) => r.id === id) ?? null;
  },

  /** Apply for leave (employee action) */
  applyLeave(data: {
    hrCandidateId: string;
    employeeUniqueId: string;
    employeeName: string;
    leaveType: LeaveType;
    fromDate: number;
    toDate: number;
    reason: string;
  }): string {
    const now = Date.now();
    const totalDays = calcDays(data.fromDate, data.toDate);

    const request: LeaveRequest = {
      id: genId(),
      hrCandidateId: data.hrCandidateId,
      employeeUniqueId: data.employeeUniqueId,
      employeeName: data.employeeName,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      totalDays,
      reason: data.reason.trim(),
      status: "pending",
      appliedAt: now,
    };

    const all = readRequests();
    writeRequests([request, ...all]);
    return request.id;
  },

  /** Approve leave (employer action) */
  approveLeave(id: string, comment?: string): boolean {
    const all = readRequests();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1 || all[idx].status !== "pending") return false;

    all[idx] = {
      ...all[idx],
      status: "approved" as LeaveStatus,
      respondedAt: Date.now(),
      responseComment: comment?.trim() || undefined,
    };
    writeRequests(all);
    return true;
  },

  /** Reject leave (employer action) */
  rejectLeave(id: string, comment: string): boolean {
    const all = readRequests();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1 || all[idx].status !== "pending") return false;

    all[idx] = {
      ...all[idx],
      status: "rejected" as LeaveStatus,
      respondedAt: Date.now(),
      responseComment: comment.trim() || "No reason provided",
    };
    writeRequests(all);
    return true;
  },

  /** Cancel leave (employee action — pending only) */
  cancelLeave(id: string): boolean {
    const all = readRequests();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1 || all[idx].status !== "pending") return false;

    all[idx] = {
      ...all[idx],
      status: "cancelled" as LeaveStatus,
      cancelledAt: Date.now(),
    };
    writeRequests(all);
    return true;
  },

  // ── Leave Allocations ──

  /** Get allocation for a candidate (returns defaults if not set) */
  getAllocation(hrCandidateId: string): Record<LeaveType, number> {
    const all = readAllocations();
    const found = all.find((a) => a.hrCandidateId === hrCandidateId);
    if (found) return { ...found.allocations };
    return { ...DEFAULT_LEAVE_ALLOCATION };
  },

  /** Set allocation for a candidate */
  setAllocation(hrCandidateId: string, allocations: Record<LeaveType, number>): boolean {
    const all = readAllocations();
    const idx = all.findIndex((a) => a.hrCandidateId === hrCandidateId);

    const entry: LeaveAllocation = {
      hrCandidateId,
      allocations: { ...allocations },
      updatedAt: Date.now(),
    };

    if (idx !== -1) {
      all[idx] = entry;
    } else {
      all.push(entry);
    }

    writeAllocations(all);
    return true;
  },

  // ── Leave Balance (computed) ──

  /** Calculate balance for a candidate */
  getBalance(hrCandidateId: string): LeaveBalance[] {
    const allocations = this.getAllocation(hrCandidateId);
    const requests = this.getByCandidate(hrCandidateId);

    const leaveTypes: LeaveType[] = ["annual", "sick", "casual", "unpaid"];

    return leaveTypes.map((type) => {
      const allocated = allocations[type];

      const used = requests
        .filter((r) => r.leaveType === type && r.status === "approved")
        .reduce((sum, r) => sum + r.totalDays, 0);

      const pending = requests
        .filter((r) => r.leaveType === type && r.status === "pending")
        .reduce((sum, r) => sum + r.totalDays, 0);

      const remaining = type === "unpaid" ? 999 : Math.max(0, allocated - used);

      return { leaveType: type, allocated, used, pending, remaining };
    });
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
} as const;