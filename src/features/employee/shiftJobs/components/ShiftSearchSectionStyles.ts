// App name: Job Mitra
// File name: ShiftSearchSectionStyles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchSectionStyles.ts

import type { CSSProperties } from "react";

export const SHIFT_SEARCH_GREEN = "#16a34a";

export const shiftSearchScrollContainerStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  paddingBottom: 4,
  scrollbarWidth: "none",
  scrollBehavior: "smooth",
};

export const shiftSearchMiniCardStyle: CSSProperties = {
  width: "100%",
  minWidth: 292,
  maxWidth: 340,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid var(--wm-er-border)",
  borderLeft: `4px solid ${SHIFT_SEARCH_GREEN}`,
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
  cursor: "pointer",
  textAlign: "left",
  flexShrink: 0,
};

export const shiftSearchSectionWrapStyle: CSSProperties = {
  marginTop: 14,
  padding: "12px 16px",
  borderRadius: 18,
  background: "rgba(22, 163, 74, 0.03)",
  border: "1px solid rgba(22, 163, 74, 0.12)",
};

export const shiftSearchArrowButtonBaseStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  border: "none",
  cursor: "pointer",
  color: SHIFT_SEARCH_GREEN,
  padding: 0,
};

export const shiftSearchFadeRightStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: 40,
  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.9))",
  pointerEvents: "none",
  zIndex: 1,
  borderRadius: "0 12px 12px 0",
};

export const shiftSearchFadeLeftStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: 40,
  background: "linear-gradient(to left, transparent, rgba(255,255,255,0.9))",
  pointerEvents: "none",
  zIndex: 1,
  borderRadius: "12px 0 0 12px",
};

export const shiftSearchAppliedBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 22,
  padding: "0 8px",
  borderRadius: 999,
  background: "rgba(22,163,74,0.1)",
  color: SHIFT_SEARCH_GREEN,
  fontSize: 10,
  fontWeight: 800,
  border: "1px solid rgba(22,163,74,0.12)",
};
