import type { CSSProperties } from "react";

export const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
export const CAREER_BLUE_DEEP = "#1e40af";
export const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
export const CAREER_MUTED = "var(--wm-er-muted, #475569)";

export const CARD_STYLE: CSSProperties = {
  padding: 18,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
  display: "grid",
  gap: "var(--wm-space-14)",
};
export const EYEBROW_STYLE: CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "var(--wm-radius-button)",
  background: "rgba(37, 99, 235, 0.08)",
  border: "1px solid rgba(37, 99, 235, 0.12)",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: CAREER_BLUE_DEEP,
};
export const TITLE_STYLE: CSSProperties = {
  marginTop: 8,
  fontSize: 17,
  fontWeight: 800,
  color: CAREER_TEXT,
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
};
export const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 500,
  color: CAREER_MUTED,
  lineHeight: 1.45,
};
export const COUNT_BADGE_STYLE: CSSProperties = {
  padding: "6px 12px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(37, 99, 235, 0.08)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11.5,
  fontWeight: 800,
  whiteSpace: "nowrap",
  flexShrink: 0,
  border: "1px solid rgba(37, 99, 235, 0.1)",
  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
};
export const SUMMARY_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--wm-space-10)",
};
export const FILTER_PANEL_STYLE: CSSProperties = {
  display: "grid",
  gap: "var(--wm-space-10)",
  padding: 14,
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
};
export const FILTER_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--wm-space-10)",
};
export const INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 42,
  borderRadius: "var(--wm-radius-button)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "#fff",
  padding: "0 12px",
  color: CAREER_TEXT,
  fontSize: 12.5,
  fontWeight: 600,
  outline: "none",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.01)",
  transition: "border-color 0.2s",
};
export const CLEAR_BUTTON_STYLE: CSSProperties = {
  minHeight: 40,
  borderRadius: "var(--wm-radius-button)",
  border: "1px solid rgba(37, 99, 235, 0.15)",
  background: "rgba(37, 99, 235, 0.05)",
  color: CAREER_BLUE_DEEP,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform 0.1s var(--wm-motion-spring)",
};
export const EMPTY_STYLE: CSSProperties = {
  padding: "20px 16px",
  borderRadius: "var(--wm-radius-employee-card)",
  border: "1px dashed rgba(37, 99, 235, 0.2)",
  background: "rgba(37, 99, 235, 0.02)",
  textAlign: "center",
};
export const FILTER_EMPTY_STYLE: CSSProperties = { ...EMPTY_STYLE, padding: "16px" };
export const EMPTY_TITLE_STYLE: CSSProperties = {
  fontSize: 14.5,
  fontWeight: 800,
  color: CAREER_TEXT,
};
export const EMPTY_TEXT_STYLE: CSSProperties = {
  margin: "6px auto 0",
  maxWidth: 320,
  fontSize: 12,
  color: CAREER_MUTED,
  lineHeight: 1.45,
  fontWeight: 500,
};
export const EMPTY_GUIDE_GRID_STYLE: CSSProperties = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--wm-space-10)",
};
export const EMPTY_GUIDE_CHIP_STYLE: CSSProperties = {
  padding: "12px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(255,255,255,0.9)",
  textAlign: "left",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
};
export const EMPTY_GUIDE_TITLE_STYLE: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 800,
  color: CAREER_BLUE_DEEP,
};
export const EMPTY_GUIDE_TEXT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 11.5,
  fontWeight: 500,
  color: CAREER_MUTED,
  lineHeight: 1.35,
};
export const STAFF_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: "var(--wm-radius-employee-card)",
  cursor: "pointer",
  textAlign: "left",
  transition: "transform 0.1s var(--wm-motion-spring), box-shadow 0.2s ease",
};
export const STAFF_NAME_STYLE: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};
export const STAFF_META_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12.5,
  color: CAREER_MUTED,
  lineHeight: 1.4,
  fontWeight: 500,
};
export const DEPARTMENT_META_STYLE: CSSProperties = {
  marginTop: 8,
  width: "fit-content",
  maxWidth: "100%",
  padding: "4px 10px",
  borderRadius: "var(--wm-radius-10)",
  background: "rgba(37, 99, 235, 0.06)",
  border: "1px solid rgba(37, 99, 235, 0.08)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11,
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
export const STATUS_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
  border: "1px solid transparent",
};
export const JOINED_STYLE: CSSProperties = {
  marginTop: 10,
  fontSize: 12,
  color: CAREER_MUTED,
  fontWeight: 600,
};
export const FOOTER_ROW_STYLE: CSSProperties = {
  marginTop: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "var(--wm-space-10)",
};
export const ACTION_TEXT_STYLE: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 800,
  color: CAREER_BLUE_DEEP,
};
export const ARROW_STYLE: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(37, 99, 235, 0.08)",
  color: CAREER_BLUE_DEEP,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  fontWeight: 800,
};
