// src/features/employer/hrManagement/types/leaveManagement.types.ts
//
// All types for the Leave Management module.
// Part of HR Management (Phase 2).

// ─────────────────────────────────────────────────────────────────────────────
// Leave Types
// ─────────────────────────────────────────────────────────────────────────────

export type LeaveType = "annual" | "sick" | "casual" | "unpaid";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

// ─────────────────────────────────────────────────────────────────────────────
// Leave Type Labels
// ─────────────────────────────────────────────────────────────────────────────

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  casual: "Casual Leave",
  unpaid: "Unpaid Leave",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

// ─────────────────────────────────────────────────────────────────────────────
// Default Annual Allocation (per leave type)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_LEAVE_ALLOCATION: Record<LeaveType, number> = {
  annual: 20,
  sick: 10,
  casual: 5,
  unpaid: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Leave Request
// ─────────────────────────────────────────────────────────────────────────────

export type LeaveRequest = {
  id: string;
  /** Link to HR candidate record */
  hrCandidateId: string;
  /** Employee identity */
  employeeUniqueId: string;
  employeeName: string;
  /** Leave details */
  leaveType: LeaveType;
  fromDate: number;
  toDate: number;
  totalDays: number;
  reason: string;
  /** Status */
  status: LeaveStatus;
  /** Employer response */
  respondedAt?: number;
  respondedBy?: string;
  responseComment?: string;
  /** Timestamps */
  appliedAt: number;
  cancelledAt?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Leave Allocation (per employee, set by employer)
// ─────────────────────────────────────────────────────────────────────────────

export type LeaveAllocation = {
  hrCandidateId: string;
  allocations: Record<LeaveType, number>;
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Leave Balance (computed — not stored)
// ─────────────────────────────────────────────────────────────────────────────

export type LeaveBalance = {
  leaveType: LeaveType;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
};