import type { CSSProperties } from "react";

export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
export const CAREER_BORDER = "var(--wm-er-border, rgba(148,163,184,0.22))";
export const CAREER_BG = "var(--wm-er-bg, #f8fafc)";
export const MAX_OFFER_SALARY = 999_999_999;

export const shellStyle: CSSProperties = {
  padding: 18,
  borderRadius: "var(--wm-radius-employer-card)",
  background:
    "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.08), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
};

export const titleStyle: CSSProperties = {
  fontSize: 17,
  fontWeight: 1000,
  color: CAREER_TEXT,
  lineHeight: 1.15,
};

export const helperStyle: CSSProperties = {
  marginTop: 7,
  padding: "9px 10px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(29,78,216,0.055)",
  border: "1px solid rgba(29,78,216,0.1)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11.5,
  fontWeight: 820,
  lineHeight: 1.42,
};

export const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 950,
  color: CAREER_MUTED,
  marginBottom: 6,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.34,
};

export const inputStyle: CSSProperties = {
  width: "100%",
  fontSize: 14,
  fontWeight: 800,
  padding: "11px 12px",
  borderRadius: "var(--wm-radius-chip)",
  border: `1.5px solid ${CAREER_BORDER}`,
  background: CAREER_BG,
  color: CAREER_TEXT,
  boxSizing: "border-box",
  fontFamily: "inherit",
  outline: "none",
};

export const candidateCardStyle: CSSProperties = {
  marginTop: 10,
  padding: "12px 13px",
  borderRadius: "var(--wm-radius-chip)",
  background:
    "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.1), transparent 35%), linear-gradient(135deg, rgba(255,255,255,0.94), rgba(239,246,255,0.78))",
  border: "1px solid rgba(29,78,216,0.16)",
  boxShadow: "0 10px 20px rgba(15,23,42,0.045)",
};

export function getToggleButtonStyle(selected: boolean): CSSProperties {
  return {
    minHeight: 42,
    padding: "0 12px",
    borderRadius: "var(--wm-radius-chip)",
    cursor: "pointer",
    fontSize: 11.5,
    fontWeight: 950,
    border: selected ? "1.5px solid rgba(29,78,216,0.36)" : `1.5px solid ${CAREER_BORDER}`,
    background: selected ? "rgba(29,78,216,0.08)" : "rgba(255,255,255,0.76)",
    color: selected ? CAREER_BLUE_DEEP : CAREER_MUTED,
    whiteSpace: "nowrap",
  };
}

export function getNoticeButtonStyle(selected: boolean): CSSProperties {
  return {
    minHeight: 38,
    borderRadius: "var(--wm-radius-chip)",
    cursor: "pointer",
    fontSize: 11.5,
    fontWeight: 950,
    border: selected ? "1.5px solid rgba(29,78,216,0.36)" : `1.5px solid ${CAREER_BORDER}`,
    background: selected ? "rgba(29,78,216,0.08)" : "rgba(255,255,255,0.76)",
    color: selected ? CAREER_BLUE_DEEP : CAREER_MUTED,
  };
}

export function getSubmitButtonStyle(canSubmit: boolean): CSSProperties {
  return {
    fontSize: 13,
    minHeight: 42,
    padding: "0 16px",
    borderRadius: "var(--wm-radius-chip)",
    opacity: canSubmit ? 1 : 0.45,
    cursor: canSubmit ? "pointer" : "not-allowed",
    background: canSubmit ? undefined : "rgba(148,163,184,0.28)",
    color: canSubmit ? undefined : "rgba(71,85,105,0.72)",
    boxShadow: canSubmit ? undefined : "none",
  };
}
