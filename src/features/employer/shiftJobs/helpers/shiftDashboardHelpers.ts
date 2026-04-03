// src/features/employer/shiftJobs/helpers/shiftDashboardHelpers.ts
//
// Types and pure helpers for EmployerShiftPostDashboardPage.

export type DashboardTab = "applied" | "shortlisted" | "backup" | "selected" | "rejected";

export const TAB_LABELS: Record<DashboardTab, string> = {
  applied:     "Applied",
  shortlisted: "Shortlisted",
  backup:      "Backup",
  selected:    "Selected",
  rejected:    "Rejected",
};

export function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}