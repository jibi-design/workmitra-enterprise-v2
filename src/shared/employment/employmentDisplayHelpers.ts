// src/shared/employment/employmentDisplayHelpers.ts
// Session 17: Display helpers for employment lifecycle UI.

import type { EmploymentRecord, EmploymentStatus, StatusBadgeConfig, TimelineEntry } from "./employmentTypes";
import { STATUS_BADGE_MAP, TERMINATED_BADGE, FORCE_COMPLETED_BADGE, FORCE_COMPLETE_GRACE_DAYS, EMPLOYEE_RESIGN_REASONS, EMPLOYER_TERMINATE_REASONS } from "./employmentTypes";

/* ── Date Formatters ── */

/** Epoch ms → "Mar 15, 2026" */
export function formatDate(epoch: number | null): string {
  if (!epoch) return "—";
  return new Date(epoch).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Epoch ms → "Mar 15, 2026 at 2:30 PM" */
export function formatDateTime(epoch: number | null): string {
  if (!epoch) return "—";
  const d = new Date(epoch);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} at ${time}`;
}

/** Epoch ms → "2026-04-15" (for date input fields) */
export function toInputDate(epoch: number): string {
  const d = new Date(epoch);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "2026-04-15" → epoch ms (start of day) */
export function fromInputDate(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

/* ── Status Badge Helper ── */

/** Returns the correct badge config, handling terminated override. */
export function getStatusBadge(record: EmploymentRecord): StatusBadgeConfig {
  if (record.status === "completed" && record.exitType === "terminated") {
    return TERMINATED_BADGE;
  }
  if (record.status === "completed" && record.forceCompleted) {
    return FORCE_COMPLETED_BADGE;
  }
  return STATUS_BADGE_MAP[record.status];
}

/** Returns a short status label for lists/cards. */
export function getStatusLabel(record: EmploymentRecord): string {
  if (record.status === "completed" && record.exitType === "terminated") {
    return "Terminated";
  }
  if (record.status === "completed" && record.forceCompleted) {
    return "Completed (unconfirmed)";
  }
  return STATUS_BADGE_MAP[record.status].label;
}

/* ── Force Complete Eligibility ── */

/** Employee can force-complete if notice expired + 7 days and employer hasn't responded. */
export function canForceComplete(record: EmploymentRecord): boolean {
  if (record.status !== "notice" && record.status !== "resigned") return false;
  const GRACE_MS = FORCE_COMPLETE_GRACE_DAYS * 86_400_000;
  if (record.lastWorkingDay) return Date.now() >= record.lastWorkingDay + GRACE_MS;
  if (record.resignedAt) return Date.now() >= record.resignedAt + GRACE_MS;
  return false;
}

/** Days until force-complete becomes available. 0 = available now. */
export function getDaysUntilForceComplete(record: EmploymentRecord): number {
  if (record.status !== "notice" && record.status !== "resigned") return -1;
  const GRACE_MS = FORCE_COMPLETE_GRACE_DAYS * 86_400_000;
  const base = record.lastWorkingDay ?? record.resignedAt;
  if (!base) return -1;
  const eligibleAt = base + GRACE_MS;
  const remaining = Math.ceil((eligibleAt - Date.now()) / 86_400_000);
  return Math.max(0, remaining);
}

/* ── Notice Period Countdown ── */

/** Days remaining in notice period. 0 if expired or no notice. */
export function getNoticeDaysRemaining(record: EmploymentRecord): number {
  if (record.status !== "notice" || !record.lastWorkingDay) return 0;
  const remaining = Math.ceil((record.lastWorkingDay - Date.now()) / 86_400_000);
  return Math.max(0, remaining);
}

/** Display text for notice countdown: "14 days remaining" or "Notice period ended". */
export function getNoticeCountdownText(record: EmploymentRecord): string {
  const days = getNoticeDaysRemaining(record);
  if (record.status !== "notice") return "";
  if (days <= 0) return "Notice period ended";
  return `${days} day${days > 1 ? "s" : ""} remaining`;
}

/** Check if notice period has expired (employer should confirm). */
export function isNoticeExpired(record: EmploymentRecord): boolean {
  if (record.status !== "notice" || !record.lastWorkingDay) return false;
  return Date.now() >= record.lastWorkingDay;
}

/* ── Exit Reason Label ── */

/** Converts exit reason code to human-readable label. */
export function getExitReasonLabel(record: EmploymentRecord): string {
  if (!record.exitReason) return "";

  if (record.exitType === "resigned") {
    const found = EMPLOYEE_RESIGN_REASONS.find((r) => r.value === record.exitReason);
    return found?.label ?? String(record.exitReason);
  }
  if (record.exitType === "terminated") {
    const found = EMPLOYER_TERMINATE_REASONS.find((r) => r.value === record.exitReason);
    return found?.label ?? String(record.exitReason);
  }
  return "";
}

/* ── Timeline Display ── */

/** Actor label for timeline display. */
function getActorLabel(actor: TimelineEntry["actor"]): string {
  if (actor === "employee") return "Employee";
  if (actor === "employer") return "Employer";
  return "System";
}

/** Format a timeline entry for display. */
export function formatTimelineEntry(entry: TimelineEntry): {
  label: string;
  date: string;
  actor: string;
  note: string;
  statusKey: string;
} {
  return {
    label: entry.status === "withdrawn" ? "Withdrawal" : STATUS_BADGE_MAP[entry.status as EmploymentStatus]?.label ?? entry.status,
    date: formatDateTime(entry.timestamp),
    actor: getActorLabel(entry.actor),
    note: entry.note,
    statusKey: entry.status,
  };
}

/* ── Duplicate Employment Warning ── */

/** Warning message when employee already has active employment. */
export function getDuplicateWarning(companyName: string): string {
  return `You are currently employed at ${companyName}. Accepting this offer will not end your current job. Make sure to resign properly before joining elsewhere.`;
}

/* ── Can Withdraw Check ── */

/** Employee can withdraw resignation only if employer hasn't confirmed yet. */
export function canWithdrawResignation(record: EmploymentRecord): boolean {
  return record.status === "notice" || record.status === "resigned";
}

/* ── Action Availability ── */

/** What actions are available for the employer on this record. */
export function getEmployerActions(record: EmploymentRecord): {
  canMarkJoined: boolean;
  canConfirmResign: boolean;
  canTerminate: boolean;
  isNoticeExpired: boolean;
} {
  return {
    canMarkJoined: record.status === "selected",
    canConfirmResign: record.status === "notice" || record.status === "resigned",
    canTerminate: record.status === "working",
    isNoticeExpired: isNoticeExpired(record),
  };
}

/** What actions are available for the employee on this record. */
export function getEmployeeActions(record: EmploymentRecord): {
  canResign: boolean;
  canWithdraw: boolean;
  canForceComplete: boolean;
} {
  return {
    canResign: record.status === "working",
    canWithdraw: canWithdrawResignation(record),
    canForceComplete: canForceComplete(record),
  };
}