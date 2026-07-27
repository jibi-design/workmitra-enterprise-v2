// src/features/employee/careerJobs/helpers/careerPostDetailHelpers.ts
import type { CSSProperties } from "react";

export const NOTICE_OPTIONS = ["Immediate", "15 days", "30 days", "60 days"] as const;

export const LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-career-text, #111827)",
  marginBottom: 4,
  display: "block",
};

export const INPUT_STYLE: CSSProperties = {
  width: "100%",
  fontSize: 14,
  fontWeight: 600,
  padding: "10px 12px",
  borderRadius: "var(--wm-radius-10)",
  border: "1.5px solid var(--wm-career-border, rgba(15,23,42,0.10))",
  background: "var(--wm-career-bg, #fff)",
  color: "var(--wm-career-text, #111827)",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
