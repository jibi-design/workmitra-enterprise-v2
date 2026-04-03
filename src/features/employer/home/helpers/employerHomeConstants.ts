// src/features/employer/home/helpers/employerHomeConstants.ts
// Session 15: TAP_TO_MANAGE textAlign center added.

import type { CSSProperties } from "react";

/* ------------------------------------------------ */
/* Domain Colors                                    */
/* ------------------------------------------------ */
export const HOME_COLORS = {
  staff: "#16a34a",
  staffBg: "rgba(22, 163, 74, 0.08)",
  verify: "#7c3aed",
  verifyBg: "rgba(124, 58, 237, 0.08)",
  rating: "#d97706",
  ratingBg: "rgba(217, 119, 6, 0.08)",
  mutedBg: "rgba(107, 114, 128, 0.08)",
  insightsBadgeBg: "#f9fafb",
  hrEnabledBg: "rgba(124, 58, 237, 0.08)",
} as const;

/* ------------------------------------------------ */
/* Shared Styles                                    */
/* ------------------------------------------------ */
export const CARD_ICON_CONTAINER: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export const CARD_ROW_LAYOUT: CSSProperties = {
  padding: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

export const CARD_INNER_ROW: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

export const CARD_TITLE: CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  color: "var(--wm-er-text)",
};

export const CARD_SUB: CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  marginTop: 2,
};

export const CARD_CHEVRON: CSSProperties = {
  fontSize: 18,
  color: "var(--wm-er-muted)",
  flexShrink: 0,
};

export const TAP_TO_MANAGE = (color: string): CSSProperties => ({
  marginTop: 10,
  paddingBottom: 4,
  fontSize: 12,
  fontWeight: 600,
  color,
  textAlign: "center",
});