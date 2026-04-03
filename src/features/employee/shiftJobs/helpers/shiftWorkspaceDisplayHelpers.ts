// src/features/employee/shiftJobs/helpers/shiftWorkspaceDisplayHelpers.ts
//
// Pure display helpers for ShiftWorkspacePage.
// No React components, no side effects. Formatters, labels, styles.

import type { CSSProperties } from "react";

import type {
  ShiftWorkspace,
  ShiftWorkspaceStatus,
} from "../storage/shiftWorkspaces.storage";

/* ── Types ─────────────────────────────────────── */

export type BadgeTone = "neutral" | "good" | "bad" | "warn";

type ExitReason = NonNullable<ShiftWorkspace["exitReason"]>;
type ReplacedReason = NonNullable<ShiftWorkspace["replacedReason"]>;
type UpdateKind = ShiftWorkspace["updates"][number]["kind"];

/* ── Date / text formatters ────────────────────── */

export function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

export function fmtDateRange(startAt: number, endAt: number): string {
  try {
    const s = new Date(startAt);
    const e = new Date(endAt);
    const sameDay = s.toDateString() === e.toDateString();
    const sTxt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const eTxt = e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return sameDay ? sTxt : `${sTxt} — ${eTxt}`;
  } catch { return "Date"; }
}

export function clampText(raw: string, max: number): string {
  const t = raw.trim();
  return !t ? "" : t.length > max ? t.slice(0, max) : t;
}

export function exitReasonLabel(r: ExitReason): string {
  if (r === "emergency") return "Emergency";
  if (r === "sick") return "Sick";
  if (r === "travel") return "Travel";
  return "Other";
}

function replacedReasonLabel(r: ReplacedReason): string {
  if (r === "no_show") return "No show";
  if (r === "schedule_change") return "Schedule change";
  if (r === "quality_issue") return "Quality issue";
  return "Other";
}

/* ── Status helpers ────────────────────────────── */

export function isReadOnlyStatus(status: ShiftWorkspaceStatus): boolean {
  return status === "left" || status === "replaced" || status === "completed";
}

export function statusBadgeLabel(status: ShiftWorkspaceStatus): string {
  if (status === "replaced") return "REPLACED";
  if (status === "left") return "LEFT";
  if (status === "completed") return "COMPLETED";
  if (status === "upcoming") return "UPCOMING";
  return "ACTIVE";
}

export function statusTone(status: ShiftWorkspaceStatus): BadgeTone {
  if (status === "active") return "good";
  if (status === "upcoming") return "neutral";
  if (status === "completed") return "neutral";
  if (status === "replaced") return "warn";
  return "bad";
}

/* ── Badge / explanation styles ────────────────── */

export function badgeStyle(tone: BadgeTone): CSSProperties {
  if (tone === "good") return { border: "1px solid rgba(15,118,110,0.35)", background: "rgba(15,118,110,0.10)", color: "#115e59" };
  if (tone === "warn") return { border: "1px solid rgba(217,119,6,0.30)", background: "rgba(217,119,6,0.10)", color: "#92400e" };
  if (tone === "bad") return { border: "1px solid rgba(220,38,38,0.30)", background: "rgba(220,38,38,0.10)", color: "#991b1b" };
  return { border: "1px solid rgba(17,24,39,0.10)", background: "rgba(17,24,39,0.04)", color: "var(--wm-er-muted)" };
}

export function explanationBorderColor(tone: BadgeTone): string {
  if (tone === "good") return "rgba(15,118,110,0.18)";
  if (tone === "warn") return "rgba(217,119,6,0.22)";
  if (tone === "bad") return "rgba(220,38,38,0.18)";
  return "var(--wm-er-divider)";
}

export function explanationBgColor(tone: BadgeTone): string {
  if (tone === "good") return "rgba(15,118,110,0.04)";
  if (tone === "warn") return "rgba(217,119,6,0.05)";
  if (tone === "bad") return "rgba(220,38,38,0.04)";
  return "transparent";
}

/* ── Status explanation builder ────────────────── */

export function buildStatusExplanation(ws: ShiftWorkspace): {
  title: string; body: string; tone: BadgeTone;
} | null {
  if (ws.status === "replaced") {
    const parts: string[] = ["Employer replaced your assignment."];
    if (ws.replacedAt) parts.push(`When: ${fmtTime(ws.replacedAt)}.`);
    if (ws.replacedReason) parts.push(`Reason: ${replacedReasonLabel(ws.replacedReason)}.`);
    parts.push("This workspace is now read-only.");
    return { title: "Replaced by Employer", body: parts.join(" "), tone: "warn" };
  }
  if (ws.status === "left") {
    const parts: string[] = ["You left this workspace."];
    if (ws.exitedAt) parts.push(`When: ${fmtTime(ws.exitedAt)}.`);
    if (ws.exitReason) parts.push(`Reason: ${exitReasonLabel(ws.exitReason)}.`);
    parts.push("This workspace is now read-only.");
    return { title: "Left", body: parts.join(" "), tone: "bad" };
  }
  if (ws.status === "completed") {
    return { title: "Completed", body: "This job is completed. This workspace is read-only.", tone: "neutral" };
  }
  if (ws.status === "upcoming") {
    return { title: "Upcoming", body: `This job starts on ${fmtDateRange(ws.startAt, ws.endAt)}. Employer updates will appear here.`, tone: "neutral" };
  }
  return null;
}

/* ── Update display helpers ────────────────────── */

export function updateKindLabel(kind: UpdateKind): string {
  if (kind === "broadcast") return "ANNOUNCEMENT";
  if (kind === "direct") return "DIRECT";
  return "SYSTEM";
}

export function updateKindTone(kind: UpdateKind): BadgeTone {
  if (kind === "direct") return "good";
  return "neutral";
}

export function detectSenderTag(
  u: ShiftWorkspace["updates"][number],
): { text: string; tone: BadgeTone } | null {
  const t = (u.title ?? "").toLowerCase();
  const b = (u.body ?? "").toLowerCase();
  if (u.kind === "direct" && (t.includes("reply (employee)") || b.includes("reply (employee)"))) return { text: "YOU", tone: "neutral" };
  if (u.kind === "direct" && (t.includes("reply (employer)") || b.includes("reply (employer)"))) return { text: "EMPLOYER", tone: "good" };
  if (u.kind === "broadcast") return { text: "EMPLOYER", tone: "neutral" };
  if (u.kind === "system") return { text: "SYSTEM", tone: "neutral" };
  if (u.kind === "direct") return { text: "DIRECT", tone: "good" };
  return null;
}

export function updateRowStyle(u: ShiftWorkspace["updates"][number]): {
  border: string; bg: string;
} {
  if (u.kind === "broadcast") return { border: "1px solid var(--wm-er-divider)", bg: "rgba(15,118,110,0.04)" };
  if (u.kind === "direct") return { border: "1px solid rgba(15,118,110,0.22)", bg: "rgba(15,118,110,0.06)" };
  return { border: "1px solid var(--wm-er-divider)", bg: "rgba(17,24,39,0.02)" };
}