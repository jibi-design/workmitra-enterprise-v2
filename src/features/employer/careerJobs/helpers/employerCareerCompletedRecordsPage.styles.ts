// App name: Job Mitra
// File name: employerCareerCompletedRecordsPage.styles.ts

import type { CSSProperties } from "react";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export const COMPLETED_PAGE_STYLE: CSSProperties = {
  display: "grid",
  gap: "var(--wm-stack-gap)",
  paddingBottom: 30,
};

/** @deprecated Wave 2 — use DomainHero via EmployerCareerCompletedRecordsHeader */
export const COMPLETED_HERO_STYLE: CSSProperties = {
  padding: "var(--wm-card-padding)",
  borderRadius: "var(--wm-radius-employer-card)",
};

export const COMPLETED_EYEBROW_STYLE: CSSProperties = {
  fontSize: 10.2,
  fontWeight: 950,
  color: CAREER_BLUE,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};

export const COMPLETED_TITLE_STYLE: CSSProperties = {
  marginTop: 6,
  fontSize: 22,
  fontWeight: 950,
  color: CAREER_TEXT,
  lineHeight: 1.1,
};

export const COMPLETED_SUBTITLE_STYLE: CSSProperties = {
  marginTop: 7,
  fontSize: 12.3,
  color: CAREER_MUTED,
  lineHeight: 1.5,
  fontWeight: 720,
};

export const COMPLETED_FILTER_CARD_STYLE: CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 12,
  borderRadius: "var(--wm-radius-employee-card)",
  border: "1px solid rgba(29,78,216,0.12)",
  background: "rgba(255,255,255,0.92)",
};

export const COMPLETED_FILTER_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

export const COMPLETED_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 40,
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#fff",
  padding: "0 11px",
  color: CAREER_TEXT,
  fontSize: 12,
  fontWeight: 750,
  outline: "none",
};

export const COMPLETED_EMPTY_STATE_STYLE: CSSProperties = {
  padding: 17,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px dashed rgba(29,78,216,0.2)",
  background:
    "radial-gradient(circle at 92% 0%, rgba(29,78,216,0.09), transparent 34%), linear-gradient(145deg, rgba(255,255,255,0.94), rgba(248,250,252,0.9))",
  textAlign: "center",
  boxShadow: "0 12px 28px rgba(15,23,42,0.045)",
};

export const COMPLETED_EMPTY_ICON_STYLE: CSSProperties = {
  width: 42,
  height: 42,
  margin: "0 auto",
  borderRadius: "var(--wm-radius-chip)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(29,78,216,0.08)",
  border: "1px solid rgba(29,78,216,0.12)",
  color: CAREER_BLUE,
  fontSize: 20,
  fontWeight: 950,
};

export const COMPLETED_EMPTY_TITLE_STYLE: CSSProperties = {
  marginTop: 11,
  fontSize: 15,
  fontWeight: 950,
  color: CAREER_TEXT,
};

export const COMPLETED_EMPTY_TEXT_STYLE: CSSProperties = {
  margin: "6px auto 0",
  maxWidth: 360,
  fontSize: 12,
  fontWeight: 720,
  color: CAREER_MUTED,
  lineHeight: 1.55,
};

export const COMPLETED_EMPTY_GUIDE_GRID_STYLE: CSSProperties = {
  marginTop: "var(--wm-space-12)",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

export const COMPLETED_EMPTY_GUIDE_CHIP_STYLE: CSSProperties = {
  padding: "9px 10px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(29,78,216,0.09)",
  textAlign: "left",
};

export const COMPLETED_EMPTY_GUIDE_TITLE_STYLE: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 950,
  color: CAREER_BLUE_DEEP,
};

export const COMPLETED_EMPTY_GUIDE_TEXT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 10.8,
  fontWeight: 720,
  color: CAREER_MUTED,
  lineHeight: 1.4,
};

export const COMPLETED_RECORD_ROW_STYLE: CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(29,78,216,0.11)",
  background: "linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
  boxShadow: "0 8px 20px rgba(15,23,42,0.045)",
  textAlign: "left",
  cursor: "pointer",
};

export const COMPLETED_ROW_TOP_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "var(--wm-space-10)",
};

export const COMPLETED_ROW_BOTTOM_STYLE: CSSProperties = {
  marginTop: 9,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--wm-space-10)",
};

export const COMPLETED_RECORD_TITLE_STYLE: CSSProperties = {
  fontSize: 14.5,
  fontWeight: 950,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};

export const COMPLETED_RECORD_META_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 11.6,
  color: CAREER_MUTED,
  lineHeight: 1.35,
  fontWeight: 760,
};

export const COMPLETED_DEPARTMENT_META_STYLE: CSSProperties = {
  marginTop: 5,
  width: "fit-content",
  maxWidth: "100%",
  padding: "4px 8px",
  borderRadius: "var(--wm-radius-pill)",
  background: "rgba(29,78,216,0.065)",
  color: CAREER_BLUE_DEEP,
  fontSize: 10.4,
  fontWeight: 950,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const COMPLETED_EXIT_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  padding: "5px 9px",
  borderRadius: "var(--wm-radius-pill)",
  fontSize: 10.2,
  fontWeight: 950,
  whiteSpace: "nowrap",
  color: "rgba(15,23,42,0.62)",
  background: "rgba(15,23,42,0.055)",
};

export const COMPLETED_FEEDBACK_BADGE_STYLE: CSSProperties = {
  minWidth: 0,
  padding: "5px 8px",
  borderRadius: "var(--wm-radius-pill)",
  fontSize: 10.5,
  fontWeight: 950,
  whiteSpace: "nowrap",
};

export const COMPLETED_OPEN_TEXT_STYLE: CSSProperties = {
  color: CAREER_BLUE_DEEP,
  fontSize: 11,
  fontWeight: 950,
  whiteSpace: "nowrap",
};
