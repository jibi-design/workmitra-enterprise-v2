import type { CSSProperties } from "react";
import { INPUT_STYLE, LABEL_STYLE } from "../helpers/careerPostDetailHelpers";

export const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
export const CAREER_TEXT = "#0f172a";
export const CAREER_MUTED = "#64748b";

export const CUSTOM_LABEL_STYLE: CSSProperties = {
  ...LABEL_STYLE,
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: 800,
  color: "#475569",
};

export const CUSTOM_INPUT_STYLE: CSSProperties = {
  ...INPUT_STYLE,
  width: "100%",
  padding: "12px 16px",
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(0,0,0,0.08)",
  backgroundColor: "rgba(255,255,255,0.6)",
  fontSize: "14px",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
};
