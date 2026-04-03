// src/features/employee/employment/helpers/employmentDetailHelpers.ts
//
// Pure helpers for Employment Detail page. No JSX.

import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";

/* ─────────────────────────── formatters ─────────────────────── */

export function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

export function durationText(fromMs: number, toMs: number): string {
  const days = Math.max(0, Math.floor((toMs - fromMs) / 86400000));
  if (days === 0) return "Just started";
  if (days === 1) return "1 day";
  const months = Math.floor(days / 30);
  const rem = days % 30;
  if (months > 0) {
    return `${months} month${months !== 1 ? "s" : ""} ${rem} day${rem !== 1 ? "s" : ""}`;
  }
  return `${days} days`;
}

/* ─────────────────────────── status meta ─────────────────────── */

export type StatusMeta = { label: string; color: string };

export function statusMeta(status: EmploymentRecord["status"]): StatusMeta {
  switch (status) {
    case "active":
      return { label: "Active", color: "#16a34a" };
    case "probation":
      return { label: "Probation", color: "#2563eb" };
    case "resignation_pending":
      return { label: "Resignation Pending", color: "#d97706" };
    case "notice_period":
      return { label: "Notice Period", color: "#d97706" };
    case "exited":
      return { label: "Exited", color: "#64748b" };
    default:
      return { label: String(status), color: "#64748b" };
  }
}

export function exitReasonLabel(r?: string): string {
  if (!r) return "—";
  const map: Record<string, string> = {
    resigned: "Resigned",
    terminated: "Terminated",
    layoff: "Layoff",
    contract_end: "Contract End",
    mutual_agreement: "Mutual Agreement",
  };
  return map[r] ?? r;
}