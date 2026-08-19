// src/features/employee/shiftJobs/helpers/shiftApplicationHelpers.ts
//
// Display helpers for My Applications page.
// Status colors, tab logic, KPI counts, time formatting.

import type {
  ShiftApplicationStatus,
  ShiftApplicationData,
  ExperienceLabel,
  ApplicationTab,
} from "../../shiftJobs/types/shiftApplicationTypes";

/* ------------------------------------------------ */
/* Status classification                            */
/* ------------------------------------------------ */
export type WithdrawableShiftApplicationStatus = Extract<
  ShiftApplicationStatus,
  "applied" | "shortlisted" | "waiting"
>;

export function isActiveStatus(s: ShiftApplicationStatus): boolean {
  return s === "applied" || s === "shortlisted" || s === "waiting";
}

export function isClosedStatus(s: ShiftApplicationStatus): boolean {
  return s === "rejected" || s === "withdrawn" || s === "replaced" || s === "exited";
}

export function isWithdrawableStatus(
  s: ShiftApplicationStatus,
): s is WithdrawableShiftApplicationStatus {
  return s === "applied" || s === "shortlisted" || s === "waiting";
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
  let applied = 0;
  let shortlisted = 0;
  let confirmed = 0;

  for (const application of apps) {
    if (application.status === "applied") {
      applied += 1;
    } else if (application.status === "shortlisted") {
      shortlisted += 1;
    } else if (application.status === "confirmed") {
      confirmed += 1;
    }
  }

  return { applied, shortlisted, confirmed };
}

export type TabCounts = { all: number; active: number; confirmed: number; closed: number };

export function computeTabCounts(apps: ShiftApplicationData[]): TabCounts {
  let active = 0;
  let confirmed = 0;
  let closed = 0;

  for (const application of apps) {
    if (isActiveStatus(application.status)) {
      active += 1;
    } else if (application.status === "confirmed") {
      confirmed += 1;
    } else if (isClosedStatus(application.status)) {
      closed += 1;
    }
  }

  return { active, confirmed, closed, all: apps.length };
}

/* ------------------------------------------------ */
/* Status display                                   */
/* ------------------------------------------------ */
export function statusLabel(s: ShiftApplicationStatus): string {
  const map: Record<ShiftApplicationStatus, string> = {
    applied: "Applied",
    shortlisted: "Shortlisted",
    waiting: "Backup",
    confirmed: "Confirmed",
    rejected: "Not selected",
    withdrawn: "Withdrawn",
    replaced: "Replaced",
    exited: "Exited",
  };

  return map[s];
}

/* ------------------------------------------------ */
/* Status colors                                    */
/* ------------------------------------------------ */
export type StatusStyle = { color: string; bgTint: string; badgeBg: string };

const STATUS_STYLES: Record<ShiftApplicationStatus, StatusStyle> = {
  applied: {
    color: "#16a34a",
    bgTint: "rgba(22,163,74,0.04)",
    badgeBg: "rgba(22,163,74,0.1)",
  },
  shortlisted: {
    color: "#a16207",
    bgTint: "rgba(161,98,7,0.04)",
    badgeBg: "rgba(161,98,7,0.1)",
  },
  waiting: {
    color: "#a16207",
    bgTint: "rgba(161,98,7,0.04)",
    badgeBg: "rgba(161,98,7,0.1)",
  },
  confirmed: {
    color: "#ffffff",
    bgTint: "rgba(22,163,74,0.08)",
    badgeBg: "#16a34a",
  },
  rejected: {
    color: "#64748b",
    bgTint: "rgba(100,116,139,0.04)",
    badgeBg: "rgba(100,116,139,0.12)",
  },
  withdrawn: {
    color: "#64748b",
    bgTint: "rgba(100,116,139,0.04)",
    badgeBg: "rgba(100,116,139,0.12)",
  },
  replaced: {
    color: "#64748b",
    bgTint: "rgba(100,116,139,0.04)",
    badgeBg: "rgba(100,116,139,0.12)",
  },
  exited: {
    color: "#64748b",
    bgTint: "rgba(100,116,139,0.04)",
    badgeBg: "rgba(100,116,139,0.12)",
  },
};

const FALLBACK_STYLE: StatusStyle = {
  color: "#94a3b8",
  bgTint: "transparent",
  badgeBg: "rgba(148,163,184,0.1)",
};

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
    const start = new Date(startAt);
    const end = new Date(endAt);
    const startText = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    if (start.toDateString() === end.toDateString()) {
      return startText;
    }

    const endText = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${startText} – ${endText}`;
  } catch {
    return "";
  }
}

export function fmtTimestamp(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function formatPay(payPerDay: number): string {
  return payPerDay > 0 ? `${payPerDay}/day` : "";
}

export function getWithdrawConfirmTitle(application: ShiftApplicationData): string {
  if (application.status === "shortlisted") {
    return "Withdraw from shortlist?";
  }

  if (application.status === "waiting") {
    return "Leave backup list?";
  }

  return "Withdraw this application?";
}

export function getWithdrawConfirmMessage(application: ShiftApplicationData): string {
  if (application.status === "shortlisted") {
    return "You are currently shortlisted. Withdraw only if you are no longer available for this shift.";
  }

  if (application.status === "waiting") {
    return "You are currently on the backup list. Withdraw only if you do not want to stay available for this shift.";
  }

  return "Employer will no longer review this application after withdrawal.";
}
