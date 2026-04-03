// src/features/employer/hrManagement/types/staffAvailability.types.ts
//
// Types for Staff Availability Request (Root Map Section 7.4.13).
// Two modes: Simple (urgent, all at once) + Batch (planned, priority-based).
// Employer creates request → selects employees → employees Accept/Decline.

// ─────────────────────────────────────────────────────────────────────────────
// Request Mode
// ─────────────────────────────────────────────────────────────────────────────

/** Simple = all selected employees notified at once, first N to accept win.
 *  Batch  = employees grouped in priority batches, Batch 1 first, then Batch 2 if not filled. */
export type AvailabilityMode = "simple" | "batch";

// ─────────────────────────────────────────────────────────────────────────────
// Request Status (lifecycle)
// ─────────────────────────────────────────────────────────────────────────────

/** open     = actively waiting for responses
 *  filled   = required number of employees accepted
 *  unfilled = all batches exhausted / all declined, not enough accepted
 *  cancelled = employer cancelled the request */
export type AvailabilityRequestStatus = "open" | "filled" | "unfilled" | "cancelled";

// ─────────────────────────────────────────────────────────────────────────────
// Employee Response
// ─────────────────────────────────────────────────────────────────────────────

export type AvailabilityResponseStatus = "pending" | "accepted" | "declined";

export type AvailabilityEmployeeResponse = {
  /** HR Candidate ID */
  hrCandidateId: string;
  /** Employee display name */
  employeeName: string;
  /** Current response status */
  status: AvailabilityResponseStatus;
  /** Optional note from employee (reason for decline, etc.) */
  note: string;
  /** Timestamp when responded (undefined = still pending) */
  respondedAt?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Batch (for batch mode)
// ─────────────────────────────────────────────────────────────────────────────

export type AvailabilityBatch = {
  /** Batch number (1-based) */
  batchNumber: number;
  /** Employees in this batch with their responses */
  employees: AvailabilityEmployeeResponse[];
  /** Whether this batch is currently active (receiving requests) */
  isActive: boolean;
  /** Timestamp when this batch was activated */
  activatedAt?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Request Entity
// ─────────────────────────────────────────────────────────────────────────────

export type StaffAvailabilityRequest = {
  /** Unique request ID */
  id: string;
  /** Request title (e.g., "Saturday Extra Shift") */
  title: string;
  /** Description / instructions */
  description: string;
  /** Date needed (timestamp — the work date) */
  dateNeeded: number;
  /** Time needed (e.g., "9:00 AM - 5:00 PM") */
  timeNeeded: string;
  /** Location / Site (optional) */
  location: string;
  /** Mode: simple or batch */
  mode: AvailabilityMode;
  /** How many employees needed (1–10) */
  requiredCount: number;
  /** How many have accepted so far */
  acceptedCount: number;
  /** Current request status */
  status: AvailabilityRequestStatus;

  // ── Simple Mode Fields ──
  /** All selected employees (simple mode — single flat list) */
  employees: AvailabilityEmployeeResponse[];

  // ── Batch Mode Fields ──
  /** Priority batches (batch mode only) */
  batches: AvailabilityBatch[];
  /** Currently active batch number (batch mode, 1-based) */
  activeBatchNumber: number;

  /** Created timestamp */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Create Request Form Data
// ─────────────────────────────────────────────────────────────────────────────

export type AvailabilityFormEmployee = {
  hrCandidateId: string;
  employeeName: string;
};

export type AvailabilityFormBatch = {
  batchNumber: number;
  employees: AvailabilityFormEmployee[];
};

export type StaffAvailabilityFormData = {
  title: string;
  description: string;
  dateNeeded: string;
  timeNeeded: string;
  location: string;
  mode: AvailabilityMode;
  requiredCount: number;
  /** Simple mode — flat employee list */
  selectedEmployees: AvailabilityFormEmployee[];
  /** Batch mode — employees grouped into priority batches */
  batches: AvailabilityFormBatch[];
};