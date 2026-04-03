// src/features/employee/careerJobs/helpers/careerWorkspaceDisplayHelpers.ts
//
// Pure display helpers for EmployeeCareerWorkspacePage.
// Career domain (blue). No React components, no side effects.

import type { CSSProperties } from "react";

/* ── Types ─────────────────────────────────────── */

export type BadgeTone = "good" | "neutral" | "warn" | "bad";

/* ── Date formatters ───────────────────────────── */

export function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

/* ── Status helpers ────────────────────────────── */

export function statusTone(s: string): BadgeTone {
  if (s === "active" || s === "onboarding") return "good";
  if (s === "completed") return "neutral";
  if (s === "terminated") return "bad";
  return "neutral";
}

export function statusLabel(s: string): string {
  if (s === "onboarding") return "Onboarding";
  if (s === "active") return "Active";
  if (s === "completed") return "Completed";
  if (s === "terminated") return "Terminated";
  return s;
}

export function isRatableStatus(s: string): boolean {
  return s === "completed" || s === "terminated";
}

/* ── Badge / explanation styles ────────────────── */

export function toneBadgeStyle(tone: BadgeTone): CSSProperties {
  if (tone === "good") return { border: "1px solid rgba(22,163,74,0.30)", background: "rgba(22,163,74,0.10)", color: "#166534" };
  if (tone === "warn") return { border: "1px solid rgba(217,119,6,0.30)", background: "rgba(217,119,6,0.10)", color: "#92400e" };
  if (tone === "bad") return { border: "1px solid rgba(220,38,38,0.30)", background: "rgba(220,38,38,0.10)", color: "#991b1b" };
  return { border: "1px solid rgba(17,24,39,0.10)", background: "rgba(17,24,39,0.04)", color: "var(--wm-emp-muted, #6b7280)" };
}

export function explanationBorder(tone: BadgeTone): string {
  if (tone === "good") return "rgba(22,163,74,0.18)";
  if (tone === "warn") return "rgba(217,119,6,0.18)";
  if (tone === "bad") return "rgba(220,38,38,0.18)";
  return "var(--wm-emp-border, rgba(15,23,42,0.10))";
}

export function explanationBg(tone: BadgeTone): string {
  if (tone === "good") return "rgba(22,163,74,0.04)";
  if (tone === "warn") return "rgba(217,119,6,0.04)";
  if (tone === "bad") return "rgba(220,38,38,0.04)";
  return "transparent";
}

export function statusExplanation(status: string): {
  title: string; body: string; tone: BadgeTone;
} | null {
  if (status === "onboarding") return { title: "Onboarding", body: "Welcome! This is your onboarding workspace. Employer updates and instructions will appear here.", tone: "good" };
  if (status === "active") return { title: "Active", body: "You are actively employed in this position. Check here for employer updates.", tone: "good" };
  if (status === "completed") return { title: "Completed", body: "This position has been completed. The workspace is now read-only.", tone: "neutral" };
  if (status === "terminated") return { title: "Terminated", body: "This position has been terminated. The workspace is now read-only.", tone: "bad" };
  return null;
}

/* ── Update display helpers ────────────────────── */

export function updateKindLabel(kind: string): string {
  if (kind === "broadcast") return "ANNOUNCEMENT";
  if (kind === "direct") return "DIRECT";
  return "SYSTEM";
}

export function updateKindTone(kind: string): BadgeTone {
  if (kind === "direct") return "good";
  return "neutral";
}

export function updateRowBorder(kind: string): string {
  if (kind === "broadcast") return "1px solid rgba(29,78,216,0.12)";
  if (kind === "direct") return "1px solid rgba(29,78,216,0.22)";
  return "1px solid var(--wm-emp-border, rgba(15,23,42,0.10))";
}

export function updateRowBg(kind: string): string {
  if (kind === "broadcast") return "rgba(29,78,216,0.04)";
  if (kind === "direct") return "rgba(29,78,216,0.06)";
  return "rgba(17,24,39,0.02)";
}