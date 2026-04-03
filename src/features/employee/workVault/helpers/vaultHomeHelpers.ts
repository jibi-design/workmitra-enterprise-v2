// src/features/employee/workVault/helpers/vaultHomeHelpers.ts

import type { EmploymentStatus } from "../types/vaultProfileTypes";

/* ------------------------------------------------ */
/* Status helpers                                   */
/* ------------------------------------------------ */
export function statusLabel(s: EmploymentStatus): string {
  if (s === "employed") return "Currently Employed";
  if (s === "available") return "Available for hire";
  return "Not looking";
}

export function statusColor(s: EmploymentStatus): string {
  if (s === "employed") return "#3730a3";
  if (s === "available") return "#15803d";
  return "#92400e";
}

export function statusBg(s: EmploymentStatus): string {
  if (s === "employed") return "rgba(55, 48, 163, 0.08)";
  if (s === "available") return "rgba(22, 163, 74, 0.08)";
  return "rgba(245, 158, 11, 0.08)";
}

/* ------------------------------------------------ */
/* Notice period                                    */
/* ------------------------------------------------ */
export function noticePeriodLabel(n: string): string {
  if (n === "immediate") return "Immediate";
  if (n === "2_weeks") return "2 weeks";
  if (n === "1_month") return "1 month";
  if (n === "2_months") return "2 months";
  if (n === "3_months") return "3 months";
  return n;
}

/* ------------------------------------------------ */
/* Date / time formatting                           */
/* ------------------------------------------------ */
export function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", year: "numeric" });
  } catch {
    return "Unknown";
  }
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}