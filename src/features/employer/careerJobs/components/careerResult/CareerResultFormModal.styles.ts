import type { CSSProperties } from "react";

export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
export const CAREER_BORDER = "var(--wm-er-border, rgba(203, 213, 225, 0.6))";
export const CAREER_BG = "var(--wm-er-bg, rgba(241, 245, 249, 0.5))";
export const PASS_GREEN = "var(--wm-career-success, #16a34a)";
export const FAIL_RED = "var(--wm-error, #dc2626)";
export const MAX_RESULT_FEEDBACK_LENGTH = 500;

export const RESULT_MODAL_INTERACTIONS = `
  .wm-result-input {
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
  }
  .wm-result-input:focus {
    border-color: #2563eb !important;
    background-color: #ffffff !important;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.12), inset 0 0 0 1px #2563eb !important;
  }

  .wm-result-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-result-btn:active {
    transform: scale(0.96);
  }
  .wm-result-btn:hover:not(.selected) {
    background: #ffffff !important;
    border-color: #94a3b8 !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  }

  .wm-submit-btn {
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
    background-size: 200% auto !important;
  }
  .wm-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25) !important;
    background-position: right center !important;
  }
  .wm-submit-btn:active:not(:disabled) {
    transform: scale(0.96) !important;
  }

  .wm-cancel-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-cancel-btn:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
  }
  .wm-cancel-btn:active {
    transform: scale(0.96) !important;
  }
`;

export const shellStyle: CSSProperties = {
  padding: "16px 20px",
  width: "100%",
  maxWidth: 480,
  boxSizing: "border-box",
  background: "transparent",
  boxShadow: "none",
  border: "none",
};

export const titleStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  color: CAREER_TEXT,
  lineHeight: 1.2,
  letterSpacing: "-0.5px",
};

export const roundStyle: CSSProperties = {
  marginTop: 10,
  display: "inline-block",
  padding: "6px 14px",
  borderRadius: "var(--wm-radius-button)",
  background: "rgba(37,99,235,0.08)",
  border: "1px solid rgba(37,99,235,0.15)",
  color: CAREER_BLUE_DEEP,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.5,
};

export const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: CAREER_MUTED,
  marginBottom: 8,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

export const helperStyle: CSSProperties = {
  marginTop: 16,
  padding: "14px 18px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(239,246,255,0.6)",
  border: "1px solid rgba(219,234,254,0.8)",
  color: "#1e40af",
  fontSize: 13,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

export const feedbackTextareaStyle: CSSProperties = {
  width: "100%",
  fontSize: 14,
  fontWeight: 700,
  padding: "16px 18px",
  borderRadius: "var(--wm-radius-employee-card)",
  border: `1px solid ${CAREER_BORDER}`,
  background: CAREER_BG,
  color: CAREER_TEXT,
  resize: "vertical",
  boxSizing: "border-box",
  fontFamily: "inherit",
  outline: "none",
};

export const closeButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "var(--wm-radius-chip)",
  border: "none",
  background: "rgba(15,23,42,0.04)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: CAREER_MUTED,
};

export function getResultButtonStyle(selected: boolean, color: string): CSSProperties {
  return {
    minHeight: 56,
    fontSize: 14,
    fontWeight: 900,
    padding: "12px 16px",
    borderRadius: "var(--wm-radius-chip)",
    border: selected ? `2px solid ${color}` : `1px solid ${CAREER_BORDER}`,
    background: selected ? `${color}12` : "rgba(241, 245, 249, 0.5)",
    color: selected ? color : CAREER_MUTED,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };
}
