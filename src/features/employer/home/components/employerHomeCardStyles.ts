// App name: Job Mitra
// File name: employerHomeCardStyles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\home\components\employerHomeCardStyles.ts

import type { CSSProperties } from "react";

export const ZERO_TEXT = "var(--wm-zero-text, #94a3b8)";

export const ZERO_CHIP: CSSProperties = {
  color: ZERO_TEXT,
  background: "var(--wm-zero-bg, rgba(100,116,139,0.06))",
};

export const ACTION_BTN: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  minWidth: 100,
  padding: "8px 16px",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 8,
  whiteSpace: "nowrap",
  textAlign: "center",
};

export const HR_ACCENT = "var(--wm-er-accent-hr, #7c3aed)";
export const CONSOLE_ACCENT = "var(--wm-er-accent-console, #0369a1)";
export const VAULT_ACCENT = "var(--wm-er-accent-hr, #7c3aed)";
export const INSIGHTS_ACCENT = "var(--wm-insights-accent, #64748b)";

export const ROW_BASE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  borderTop: "1px solid rgba(0,0,0,0.06)",
};

export const ROW_LABEL: CSSProperties = {
  flex: 1,
  fontSize: 13,
  color: "var(--wm-er-muted)",
  fontWeight: 500,
};

export function dotStyle(color: string): CSSProperties {
  return {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    marginRight: 10,
  };
}

export function valStyle(isZero: boolean): CSSProperties {
  return {
    fontSize: 14,
    fontWeight: 600,
    color: isZero ? ZERO_TEXT : "var(--wm-er-text)",
  };
}
