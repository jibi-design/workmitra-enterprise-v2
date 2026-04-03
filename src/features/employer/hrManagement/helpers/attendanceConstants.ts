// src/features/employer/hrManagement/helpers/attendanceConstants.ts
//
// Shared constants for Employer Attendance Log (Root Map Section 5.3.A).
// Used by all attendance components — single source of truth.

import type { AttendanceDayStatus } from "../types/attendanceLog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Labels
// ─────────────────────────────────────────────────────────────────────────────

export const ATT_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const ATT_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Status Visual Config
// ─────────────────────────────────────────────────────────────────────────────

export type AttendanceStatusConfig = {
  label: string;
  icon: string;
  color: string;
  bg: string;
};

export const ATT_STATUS_CONFIG: Record<AttendanceDayStatus, AttendanceStatusConfig> = {
  present: { label: "Present", icon: "✅", color: "#15803d", bg: "#dcfce7" },
  absent:  { label: "Absent",  icon: "🔴", color: "#dc2626", bg: "#fee2e2" },
  leave:   { label: "Leave",   icon: "🟡", color: "#d97706", bg: "#fef3c7" },
  off:     { label: "Off",     icon: "⬜", color: "#6b7280", bg: "#f3f4f6" },
};

/** Ordered list of all statuses (for rendering loops) */
export const ATT_STATUS_LIST: readonly AttendanceDayStatus[] = [
  "present", "absent", "leave", "off",
] as const;
