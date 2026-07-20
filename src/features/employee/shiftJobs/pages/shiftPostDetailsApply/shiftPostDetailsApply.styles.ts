// App name: Job Mitra
// File name: shiftPostDetailsApply.styles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\pages\shiftPostDetailsApply\shiftPostDetailsApply.styles.ts

import type { CSSProperties } from "react";

export const SHIFT_GREEN = "#16a34a";

export const PAGE_STYLE: CSSProperties = {
  minHeight: "100%",
  paddingBottom: 24,
};

export const HERO_STYLE: CSSProperties = {
  marginTop: 2,
  padding: "16px 16px",
  borderRadius: 22,
  border: "1px solid rgba(22,163,74,0.16)",
  background:
    "linear-gradient(135deg, rgba(22,163,74,0.13), rgba(255,255,255,0.98) 48%, rgba(240,253,244,0.86))",
  boxShadow: "0 18px 40px rgba(15,23,42,0.07)",
};

export const HERO_TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

export const HERO_IDENTITY_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

export const HERO_ICON_STYLE: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, rgba(22,163,74,0.16), rgba(22,163,74,0.07))",
  color: SHIFT_GREEN,
  boxShadow: "inset 0 0 0 1px rgba(22,163,74,0.14)",
};

export const HERO_BADGE_STYLE: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(22,163,74,0.09)",
  border: "1px solid rgba(22,163,74,0.16)",
  color: SHIFT_GREEN,
  fontSize: 11,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

export const HERO_TEXT_STYLE: CSSProperties = {
  marginTop: 12,
  fontSize: 12,
  lineHeight: 1.55,
  color: "var(--wm-er-muted)",
  maxWidth: 390,
};
