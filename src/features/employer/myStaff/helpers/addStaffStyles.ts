// src/features/employer/myStaff/helpers/addStaffStyles.ts

import type { CSSProperties } from "react";

export const INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--wm-er-border, rgba(0,0,0,0.12))",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  background: "var(--wm-er-card, #fff)",
  outline: "none",
  boxSizing: "border-box" as const,
};

export const LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  marginBottom: 4,
  display: "block",
};

export const CANCEL_BTN_STYLE: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1.5px solid rgba(0,0,0,0.12)",
  background: "transparent",
  fontWeight: 800,
  fontSize: 13,
  color: "var(--wm-er-text)",
  cursor: "pointer",
};

export function nextBtnStyle(enabled: boolean): CSSProperties {
  return {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: enabled ? "var(--wm-er-accent-career, #3730a3)" : "#e5e7eb",
    color: enabled ? "#fff" : "#9ca3af",
    fontWeight: 900,
    fontSize: 13,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}

export function chipBtnStyle(isSelected: boolean): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 800,
    padding: "5px 12px",
    borderRadius: 999,
    border: isSelected ? "1.5px solid var(--wm-er-accent-career, #3730a3)" : "1px solid var(--wm-er-border)",
    background: isSelected ? "rgba(55,48,163,0.08)" : "transparent",
    color: isSelected ? "var(--wm-er-accent-career, #3730a3)" : "var(--wm-er-muted)",
    cursor: "pointer",
  };
}