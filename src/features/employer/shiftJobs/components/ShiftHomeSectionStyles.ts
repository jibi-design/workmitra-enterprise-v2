// App name: Job Mitra
// File name: ShiftHomeSectionStyles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftHomeSectionStyles.ts

import type { CSSProperties } from "react";

export const shiftHomeActionIconWrap: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: "var(--wm-radius-chip)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, rgba(22,163,74,0.14), rgba(22,163,74,0.06))",
  color: "var(--wm-er-accent-shift)",
  boxShadow: "inset 0 0 0 1px rgba(22,163,74,0.12)",
};

export const shiftHomeSectionTitle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "var(--wm-er-text)",
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 8,
  letterSpacing: 0.1,
};

export const shiftHomeRecentPostButton: CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.96))",
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
};

export const shiftHomeAnalyzedPostButton: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.96))",
  cursor: "pointer",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  boxShadow: "0 8px 20px rgba(15,23,42,0.035)",
};

export const shiftHomeActionButtonBase: CSSProperties = {
  flex: "1 1 0",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 7,
  padding: "15px 8px",
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.96))",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  boxShadow: "0 10px 22px rgba(15,23,42,0.045)",
};
