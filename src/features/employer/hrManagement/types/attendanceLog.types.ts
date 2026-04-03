// src/features/employer/hrManagement/types/attendanceLog.types.ts
//
// Types for Employer Attendance Log (Root Map Section 5.3.A).
// Employer-controlled attendance tracking — replaces Excel-based systems.
// NOT connected to employee's personal Work Diary — completely separate system.

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Status (per day)
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceDayStatus = "present" | "absent" | "leave" | "off";

// ─────────────────────────────────────────────────────────────────────────────
// Single Day Entry
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceDayEntry = {
  /** Unique entry ID */
  id: string;
  /** HR candidate record ID (links to HRCandidateRecord) */
  hrCandidateId: string;
  /** Date key in YYYY-MM-DD format (e.g. "2026-03-17") */
  dateKey: string;
  /** Attendance status for this day */
  status: AttendanceDayStatus;
  /** Sign In time — employer enters manually (HH:MM format, e.g. "09:00") */
  signInTime?: string;
  /** Sign Out time — employer enters manually (HH:MM format, e.g. "17:30") */
  signOutTime?: string;
  /** Total hours — auto-calculated from sign in/out (decimal, e.g. 8.5) */
  totalHours?: number;
  /** Location / Site (free text) */
  location?: string;
  /** Note (optional free text) */
  note?: string;
  /** Created timestamp */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Summary (simple counts only — NO averages, NO percentages)
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceMonthlySummary = {
  /** Year (e.g. 2026) */
  year: number;
  /** Month (1-12) */
  month: number;
  /** Days Present count */
  daysPresent: number;
  /** Days Absent count */
  daysAbsent: number;
  /** Leave days count */
  daysLeave: number;
  /** Off/Holiday days count */
  daysOff: number;
  /** Total hours worked (sum, NOT average) */
  totalHours: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Day Detail Form Data (for creating/editing entries)
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceDayFormData = {
  status: AttendanceDayStatus;
  signInTime: string;
  signOutTime: string;
  location: string;
  note: string;
};
