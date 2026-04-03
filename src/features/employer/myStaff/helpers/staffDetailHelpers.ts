// src/features/employer/myStaff/helpers/staffDetailHelpers.ts

import type { StaffRecord } from "../storage/myStaff.storage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type StatusMeta = { label: string; color: string };

/* ------------------------------------------------ */
/* Date formatting                                  */
/* ------------------------------------------------ */
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

/* ------------------------------------------------ */
/* Duration text                                    */
/* ------------------------------------------------ */
export function durationText(fromMs: number, toMs: number): string {
  const days = Math.max(0, Math.floor((toMs - fromMs) / 86400000));
  const months = Math.floor(days / 30);
  const rem = days % 30;
  if (months > 0) {
    return `${months} month${months !== 1 ? "s" : ""} ${rem} day${rem !== 1 ? "s" : ""}`;
  }
  return `${days} day${days !== 1 ? "s" : ""}`;
}

/* ------------------------------------------------ */
/* Status metadata                                  */
/* ------------------------------------------------ */
export function statusMeta(status: StaffRecord["status"]): StatusMeta {
  switch (status) {
    case "active":
      return { label: "Active", color: "#16a34a" };
    case "probation":
      return { label: "Probation", color: "#0284c7" };
    case "resignation_pending":
      return { label: "Resignation Pending", color: "#d97706" };
    case "notice_period":
      return { label: "Notice Period", color: "#d97706" };
    case "exited":
      return { label: "Exited", color: "#6b7280" };
    default:
      return { label: String(status), color: "#6b7280" };
  }
}