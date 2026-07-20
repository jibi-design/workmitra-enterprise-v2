// App name: Job Mitra
// File name: employeeStatusCardStyles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\helpers\employeeStatusCardStyles.ts

import type { CSSProperties } from "react";

export const EMPLOYEE_STATUS_COLORS = {
  vault: "var(--wm-vault-accent, #7c3aed)",
  insights: "var(--wm-insights-accent, #64748b)",
  shift: "var(--wm-shift-accent, #16a34a)",
  rating: "var(--wm-rating-accent, #d97706)",
  console: "var(--wm-console-accent, #0369a1)",
  workforce: "var(--wm-er-accent-workforce, #b45309)",
  zero: "var(--wm-zero-text, #94a3b8)",
  zeroBg: "var(--wm-zero-bg, #f1f5f9)",
  muted: "var(--wm-text-muted, #64748b)",
  text: "var(--wm-er-text, #1e293b)",
  border: "1px solid rgba(0,0,0,0.06)",
} as const;

export const EMPLOYEE_STATUS_BUTTON_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 100,
  padding: "8px 16px",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  whiteSpace: "nowrap",
};

export function zeroChipStyle(isZero: boolean): CSSProperties | undefined {
  if (!isZero) return undefined;

  return {
    color: EMPLOYEE_STATUS_COLORS.zero,
    background: EMPLOYEE_STATUS_COLORS.zeroBg,
  };
}

export function accentCardStyle(accent: string, wash: string): CSSProperties {
  return {
    cursor: "pointer",
    "--wm-ee-accent": accent,
    "--wm-ee-wash": wash,
  } as CSSProperties;
}

export function statusFooterStyle(color: string): CSSProperties {
  return {
    marginTop: 10,
    color,
    fontWeight: 600,
    fontSize: 12,
    textAlign: "center",
  };
}
