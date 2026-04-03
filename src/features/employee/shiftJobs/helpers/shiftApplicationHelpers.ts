// src/features/employee/shiftJobs/helpers/shiftApplicationHelpers.ts
//
// Display helpers for My Applications page.
// Status colors, tab logic, KPI counts, time formatting.

import type {
  ShiftApplicationStatus,
  ShiftApplicationData,
  ExperienceLabel,
  ApplicationTab,
} from "../types/shiftApplicationTypes";

/* ------------------------------------------------ */
/* Status classification                            */
/* ------------------------------------------------ */
export function isActiveStatus(s: ShiftApplicationStatus): boolean {
  return s === "applied" || s === "shortlisted" || s === "waiting";
}

export function isClosedStatus(s: ShiftApplicationStatus): boolean {
  return s === "rejected" || s === "withdrawn" || s === "replaced" || s === "exited";
}

export function tabMatch(status: ShiftApplicationStatus, tab: ApplicationTab): boolean {
  if (tab === "all") return true;
  if (tab === "active") return isActiveStatus(status);
  if (tab === "confirmed") return status === "confirmed";
  return isClosedStatus(status);
}

/* ------------------------------------------------ */
/* KPI counts                                       */
/* ------------------------------------------------ */
export type KpiCounts = { applied: number; shortlisted: number; confirmed: number };

export function computeKpi(apps: ShiftApplicationData[]): KpiCounts {
  let applied = 0, shortlisted = 0, confirmed = 0;
  for (const a of apps) {
    if (a.status === "applied") applied++;
    else if (a.status === "shortlisted") shortlisted++;
    else if (a.status === "confirmed") confirmed++;
  }
  return { applied, shortlisted, confirmed };
}

export type TabCounts = { all: number; active: number; confirmed: number; closed: number };

export function computeTabCounts(apps: ShiftApplicationData[]): TabCounts {
  let active = 0, confirmed = 0, closed = 0;
  for (const a of apps) {
    if (isActiveStatus(a.status)) active++;
    else if (a.status === "confirmed") confirmed++;
    else if (isClosedStatus(a.status)) closed++;
  }
  return { active, confirmed, closed, all: apps.length };
}

/* ------------------------------------------------ */
/* Status display                                   */
/* ------------------------------------------------ */
export function statusLabel(s: ShiftApplicationStatus): string {
  const map: Record<ShiftApplicationStatus, string> = {
    applied: "Applied", shortlisted: "Shortlisted", waiting: "Waiting",
    confirmed: "Confirmed", rejected: "Rejected", withdrawn: "Withdrawn",
    replaced: "Replaced", exited: "Exited",
  };
  return map[s];
}

/* ------------------------------------------------ */
/* Status colors (border, bg tint, badge)           */
/* ------------------------------------------------ */
export type StatusStyle = { color: string; bgTint: string; badgeBg: string };

const STATUS_STYLES: Record<string, StatusStyle> = {
  applied:     { color: "#16a34a", bgTint: "rgba(22,163,74,0.04)",   badgeBg: "rgba(22,163,74,0.1)" },
  shortlisted: { color: "#a16207", bgTint: "rgba(161,98,7,0.04)",    badgeBg: "rgba(161,98,7,0.1)" },
  waiting:     { color: "#a16207", bgTint: "rgba(161,98,7,0.04)",    badgeBg: "rgba(161,98,7,0.1)" },
  confirmed:   { color: "#1d4ed8", bgTint: "rgba(29,78,216,0.04)",   badgeBg: "rgba(29,78,216,0.1)" },
  rejected:    { color: "#dc2626", bgTint: "rgba(220,38,38,0.04)",   badgeBg: "rgba(220,38,38,0.1)" },
  withdrawn:   { color: "#94a3b8", bgTint: "rgba(148,163,184,0.04)", badgeBg: "rgba(148,163,184,0.1)" },
  replaced:    { color: "#94a3b8", bgTint: "rgba(148,163,184,0.04)", badgeBg: "rgba(148,163,184,0.1)" },
  exited:      { color: "#94a3b8", bgTint: "rgba(148,163,184,0.04)", badgeBg: "rgba(148,163,184,0.1)" },
};

const FALLBACK_STYLE: StatusStyle = { color: "#94a3b8", bgTint: "transparent", badgeBg: "rgba(148,163,184,0.1)" };

export function getStatusStyle(s: ShiftApplicationStatus): StatusStyle {
  return STATUS_STYLES[s] ?? FALLBACK_STYLE;
}

/* ------------------------------------------------ */
/* Tab colors                                       */
/* ------------------------------------------------ */
export const TAB_COLORS: Record<ApplicationTab, string> = {
  all: "#1e293b",
  active: "#16a34a",
  confirmed: "#1d4ed8",
  closed: "#94a3b8",
};

/* ------------------------------------------------ */
/* Formatting helpers                               */
/* ------------------------------------------------ */
export function expLabel(x: ExperienceLabel): string {
  if (x === "helper") return "Helper";
  if (x === "fresher_ok") return "Fresher";
  return "Experienced";
}

export function fmtDateRange(startAt: number, endAt: number): string {
  try {
    const s = new Date(startAt);
    const e = new Date(endAt);
    const sTxt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (s.toDateString() === e.toDateString()) return sTxt;
    const eTxt = e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${sTxt} – ${eTxt}`;
  } catch { return ""; }
}

export function fmtTimestamp(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

export function formatPay(payPerDay: number): string {
  return payPerDay > 0 ? `${payPerDay}/day` : "";
}