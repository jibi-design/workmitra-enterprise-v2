// src/features/employee/employment/helpers/workDiaryConstants.ts
//
// Shared constants for Work Diary (Root Map Section 5.5.A).

import type { WorkDayStatus } from "./workDiary.types";

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Labels
// ─────────────────────────────────────────────────────────────────────────────

export const WD_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const WD_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Status Visual Config
// Root Map: "✅ Green = Worked, 🔴 Red = Leave/Off, ⬜ Grey = Weekend/Holiday"
// ─────────────────────────────────────────────────────────────────────────────

export type WorkDayStatusConfig = {
  label: string;
  icon: string;
  color: string;
  bg: string;
};

export const WD_STATUS_CONFIG: Record<WorkDayStatus, WorkDayStatusConfig> = {
  worked: { label: "Worked",    icon: "✅", color: "#15803d", bg: "#dcfce7" },
  leave:  { label: "Leave/Off", icon: "🔴", color: "#dc2626", bg: "#fee2e2" },
  off:    { label: "Off",       icon: "⬜", color: "#6b7280", bg: "#f3f4f6" },
};

export const WD_STATUS_LIST: readonly WorkDayStatus[] = [
  "worked", "leave", "off",
] as const;