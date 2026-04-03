// src/features/employer/workforceOps/components/workforceStyles.ts
//
// Shared style constants for Workforce Ops Hub.
// Amber domain accent — reusable across all workforce pages.

import type { CSSProperties } from "react";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Domain Colors                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

export const AMBER = "var(--wm-er-accent-workforce)";
export const AMBER_BG = "rgba(180, 83, 9, 0.08)";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Quick Action Button                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

export const actionBtnStyle: CSSProperties = {
  flex: "1 1 0",
  minWidth: 100,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: "16px 12px",
  borderRadius: "var(--wm-radius-14)",
  border: "1px solid var(--wm-er-border)",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 800,
  color: "var(--wm-er-text)",
};

export const actionIconWrapStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: AMBER_BG,
  color: AMBER,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Section Title                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

export const sectionTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "var(--wm-er-text)",
  marginBottom: 8,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export const sectionIconWrapStyle: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 8,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: AMBER_BG,
  color: AMBER,
  flexShrink: 0,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* List Row Button                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

export const listRowBtnStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-14)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  cursor: "pointer",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Category Chip                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

export const categoryChipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "5px 12px",
  borderRadius: 999,
  background: AMBER_BG,
  color: AMBER,
  fontSize: 12,
  fontWeight: 700,
  border: "none",
  cursor: "default",
};

export const addChipBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "5px 12px",
  borderRadius: 999,
  background: "var(--wm-er-bg)",
  color: "var(--wm-er-muted)",
  fontSize: 12,
  fontWeight: 700,
  border: "1px dashed var(--wm-er-border)",
  cursor: "pointer",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Empty State                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

export const emptyStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: "32px 16px",
  textAlign: "center",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step Guide Circle                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

export const stepCircleStyle: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 999,
  background: AMBER_BG,
  color: AMBER,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 900,
  flexShrink: 0,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Staff Card                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

export const staffCardStyle: CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "var(--wm-radius-14)",
  border: "1px solid var(--wm-er-border)",
  background: "var(--wm-er-card)",
  cursor: "pointer",
  textAlign: "left",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Status Badge                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

export const statusBadgeStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Utility: Time Ago                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}