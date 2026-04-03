// src/features/employee/employment/helpers/workDiary.types.ts
//
// Types for Work Diary + Personal Punching System (Root Map Section 5.5.A).
// Employee's personal work log — 100% private.
// Employer CANNOT see or access — completely separate from Employer Attendance Log.

// ─────────────────────────────────────────────────────────────────────────────
// Work Day Status
// ─────────────────────────────────────────────────────────────────────────────

export type WorkDayStatus = "worked" | "leave" | "off";

// ─────────────────────────────────────────────────────────────────────────────
// Daily Entry
// ─────────────────────────────────────────────────────────────────────────────

export type WorkDiaryEntry = {
  /** Unique entry ID */
  id: string;
  /** Employment record ID (links to EmploymentRecord) */
  employmentId: string;
  /** Date key in YYYY-MM-DD format */
  dateKey: string;
  /** Work day status */
  status: WorkDayStatus;
  /** Punch In time (HH:MM format) */
  punchInTime?: string;
  /** Punch Out time (HH:MM format) */
  punchOutTime?: string;
  /** Total hours — auto-calculated */
  totalHours?: number;
  /** Location / Site name (text input) */
  location?: string;
  /** Notes (free text — what work done, issues, etc.) */
  notes?: string;
  /** Photo count for this day (metadata only — actual photos need backend) */
  photoCount: number;
  /** Whether punch is currently active (punched in but not out) */
  isPunchActive: boolean;
  /** Created timestamp */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Summary (simple counts only — NO averages, NO percentages)
// ─────────────────────────────────────────────────────────────────────────────

export type WorkDiaryMonthlySummary = {
  year: number;
  month: number;
  daysWorked: number;
  totalHours: number;
  daysLeave: number;
  daysOff: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Day Entry Form Data
// ─────────────────────────────────────────────────────────────────────────────

export type WorkDiaryFormData = {
  status: WorkDayStatus;
  punchInTime: string;
  punchOutTime: string;
  location: string;
  notes: string;
};