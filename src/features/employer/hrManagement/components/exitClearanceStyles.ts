// src/features/employer/hrManagement/components/exitClearanceStyles.ts

import type { CSSProperties } from "react";

export const EXIT_INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 600,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  color: "var(--wm-er-text)",
  background: "#fff",
  boxSizing: "border-box" as const,
};

export function genClearanceId(): string {
  return "clr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}