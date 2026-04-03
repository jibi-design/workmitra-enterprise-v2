// src/features/employer/hrManagement/types/rosterPlanner.types.ts
//
// Types for Team Calendar / Roster Planner (Root Map Section 7.4.15).
// Assign staff to sites/shifts per day. Weekly + Monthly views.
// Conflict detection: same person, 2 sites, same day.

// ─────────────────────────────────────────────────────────────────────────────
// View Mode
// ─────────────────────────────────────────────────────────────────────────────

export type RosterViewMode = "weekly" | "monthly";

// ─────────────────────────────────────────────────────────────────────────────
// Roster Assignment (main entity)
// ─────────────────────────────────────────────────────────────────────────────

export type RosterAssignment = {
  /** Unique assignment ID */
  id: string;
  /** HR Candidate ID (employee) */
  hrCandidateId: string;
  /** Employee name (denormalized for quick display) */
  employeeName: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Site / Location name */
  site: string;
  /** Shift start time (HH:MM) */
  shiftStart: string;
  /** Shift end time (HH:MM) */
  shiftEnd: string;
  /** Optional note */
  note: string;
  /** Created timestamp */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Conflict (detected when same employee assigned to 2+ sites on same day)
// ─────────────────────────────────────────────────────────────────────────────

export type RosterConflict = {
  /** Employee name */
  employeeName: string;
  /** HR Candidate ID */
  hrCandidateId: string;
  /** Conflicting date */
  date: string;
  /** All assignments on that date for this employee */
  assignments: RosterAssignment[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Form Data (create / edit assignment)
// ─────────────────────────────────────────────────────────────────────────────

export type RosterAssignmentFormData = {
  hrCandidateId: string;
  employeeName: string;
  date: string;
  site: string;
  shiftStart: string;
  shiftEnd: string;
  note: string;
};