import type { CSSProperties } from "react";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const TEXT = "var(--wm-er-text, #1e293b)";
const MUTED = "var(--wm-er-muted, #64748b)";

export const CARD_STYLE: CSSProperties = {
  padding: 16,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(29,78,216,0.14)",
  background:
    "radial-gradient(circle at 94% 0%, rgba(29,78,216,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
  boxShadow: "0 12px 26px rgba(15,23,42,0.055)",
};
export const HEADER_ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};
export const EYEBROW_STYLE: CSSProperties = {
  fontSize: 10,
  fontWeight: 950,
  letterSpacing: 0.55,
  color: CAREER_BLUE,
  textTransform: "uppercase",
};
export const TITLE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 14.5,
  fontWeight: 950,
  color: TEXT,
};
export const SUBTITLE_STYLE: CSSProperties = {
  marginTop: 5,
  fontSize: 11.7,
  fontWeight: 720,
  lineHeight: 1.45,
  color: MUTED,
};
export const STATUS_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  maxWidth: 140,
  padding: "5px 9px",
  borderRadius: "var(--wm-radius-pill)",
  background: "rgba(29,78,216,0.08)",
  color: CAREER_BLUE_DEEP,
  border: "1px solid rgba(29,78,216,0.14)",
  fontSize: 10.5,
  fontWeight: 950,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
export const INFO_GRID_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};
export const INFO_BOX_STYLE: CSSProperties = {
  padding: "9px 10px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(29,78,216,0.08)",
};
export const INFO_LABEL_STYLE: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 900,
  color: MUTED,
};
export const INFO_VALUE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 950,
  color: TEXT,
  lineHeight: 1.25,
};
export const HISTORY_NOTE_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "9px 10px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(29,78,216,0.055)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11.2,
  fontWeight: 830,
  lineHeight: 1.4,
};
export const ACTION_PANEL_STYLE: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gap: 8,
};
export const ACTION_TITLE_STYLE: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 950,
  color: TEXT,
};
export const INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 39,
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(148,163,184,0.24)",
  background: "#fff",
  padding: "0 11px",
  color: TEXT,
  fontSize: 12,
  fontWeight: 760,
  outline: "none",
};
export const PRIMARY_BUTTON_STYLE: CSSProperties = {
  minHeight: 39,
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(29,78,216,0.16)",
  background: CAREER_BLUE,
  color: "#fff",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
};
export const SECONDARY_BUTTON_STYLE: CSSProperties = {
  ...PRIMARY_BUTTON_STYLE,
  background: "rgba(255,255,255,0.86)",
  color: CAREER_BLUE_DEEP,
};
export const DIVIDER_STYLE: CSSProperties = {
  height: 1,
  background: "rgba(148,163,184,0.16)",
  margin: "2px 0",
};
export const MESSAGE_STYLE: CSSProperties = {
  padding: "8px 9px",
  borderRadius: "var(--wm-radius-button)",
  background: "rgba(29,78,216,0.06)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11,
  fontWeight: 850,
};
export const LOCKED_NOTE_STYLE: CSSProperties = {
  marginTop: 12,
  padding: "10px 11px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(15,23,42,0.045)",
  color: MUTED,
  fontSize: 11.4,
  fontWeight: 760,
  lineHeight: 1.45,
};
