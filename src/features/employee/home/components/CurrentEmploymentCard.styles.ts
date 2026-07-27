import type { CSSProperties } from "react";

export const CAREER_BLUE = "#2563EB";
export const CAREER_BLUE_DEEP = "#1D4ED8";
export const SLATE_800 = "#1E293B";
export const SLATE_500 = "#64748B";
export const SLATE_400 = "#94A3B8";
export const SLATE_300 = "#CBD5E1";
export const SLATE_200 = "#E2E8F0";
export const SLATE_50 = "#F8FAFC";

export function getCardStyle(isActive: boolean): CSSProperties {
  return isActive
    ? {
        opacity: 1,
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(37, 99, 235, 0.06), 0 4px 14px rgba(37, 99, 235, 0.08)",
        padding: 18,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    : {
        opacity: 0.9,
        background: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(226, 232, 240, 0.6)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
        padding: 18,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      };
}

export const TITLE_STYLE: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: SLATE_800,
  letterSpacing: "-0.02em",
  lineHeight: 1.25,
};

export const OPEN_BUTTON_STYLE: CSSProperties = {
  flexShrink: 0,
  padding: "8px 14px",
  borderRadius: 10,
  border: "none",
  background: `linear-gradient(135deg, ${CAREER_BLUE} 0%, ${CAREER_BLUE_DEEP} 100%)`,
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.28)",
};

export const METRICS_ROW_STYLE: CSSProperties = {
  marginTop: 14,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

export const TAP_HINT_STYLE: CSSProperties = {
  marginTop: 12,
  fontSize: 11,
  fontWeight: 600,
  color: CAREER_BLUE,
  textAlign: "center",
};
