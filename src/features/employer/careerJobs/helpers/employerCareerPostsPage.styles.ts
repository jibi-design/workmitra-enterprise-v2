// App name: Job Mitra
// File name: employerCareerPostsPage.styles.ts

import type { CSSProperties } from "react";

const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export const POSTS_PREMIUM_STYLE_SHEET = `
  .wm-hover-card {
    transition: transform 0.25s var(--wm-motion-spring), box-shadow 0.25s var(--wm-motion-spring) !important;
  }
  .wm-hover-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 20px 32px -8px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-hover-card:active {
    transform: scale(0.98) !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05) !important;
    transition: transform var(--wm-motion-fast) var(--wm-motion-spring), box-shadow var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-responsive-stat-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
    gap: 8px !important;
  }
  @media (max-width: 580px) {
    .wm-responsive-stat-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

export const POSTS_PAGE_STYLE: CSSProperties = {
  display: "grid",
  gap: "var(--wm-stack-gap)",
  paddingBottom: 40,
};

/** @deprecated Wave 2 — use DomainHero via EmployerCareerPostsHeader */
export const POSTS_HERO_STYLE: CSSProperties = {
  padding: "var(--wm-card-padding)",
  borderRadius: "var(--wm-radius-employer-card)",
};

export const POSTS_EYEBROW_STYLE: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  color: CAREER_BLUE_DEEP,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};

export const POSTS_TITLE_STYLE: CSSProperties = {
  marginTop: 6,
  fontSize: 24,
  fontWeight: 900,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};

export const POSTS_SUBTITLE_STYLE: CSSProperties = {
  marginTop: 8,
  fontSize: 13,
  color: CAREER_MUTED,
  lineHeight: 1.5,
  fontWeight: 600,
};

export const POSTS_CREATE_BUTTON_STYLE: CSSProperties = {
  marginTop: 16,
  width: "100%",
  minHeight: 52,
  borderRadius: "var(--wm-radius-chip)",
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
};

export const POSTS_FILTER_CARD_STYLE: CSSProperties = {
  display: "grid",
  gap: "var(--wm-space-10)",
};

export const POSTS_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(148,163,184,0.3)",
  background: "#fff",
  padding: "0 16px",
  color: CAREER_TEXT,
  fontSize: 13,
  fontWeight: 600,
  outline: "none",
  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
};

export const POSTS_SEARCH_ICON_STYLE: CSSProperties = {
  position: "absolute",
  left: 16,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
  zIndex: 10,
};

export const POSTS_EMPTY_GUIDE_STYLE: CSSProperties = {
  marginTop: 24,
  padding: 16,
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.8)",
  textAlign: "left",
};

export const POSTS_EMPTY_GUIDE_TITLE_STYLE: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  color: CAREER_BLUE_DEEP,
};

export const POSTS_EMPTY_GUIDE_TEXT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 600,
  color: CAREER_MUTED,
  lineHeight: 1.5,
};

export const POSTS_CARD_STYLE: CSSProperties = {
  width: "100%",
  padding: 16,
  position: "relative",
};

export const POSTS_CARD_TITLE_STYLE: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: CAREER_TEXT,
  lineHeight: 1.2,
};

export const POSTS_CARD_META_STYLE: CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: CAREER_MUTED,
  fontWeight: 600,
};

export const POSTS_STATUS_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  padding: "6px 12px",
  borderRadius: "var(--wm-radius-employee-card)",
  fontSize: 10,
  fontWeight: 900,
  whiteSpace: "nowrap",
  textTransform: "uppercase",
};

export const POSTS_STAT_STYLE: CSSProperties = {
  padding: "10px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(0,0,0,0.04)",
  minWidth: 0,
};

export const POSTS_STAT_LABEL_STYLE: CSSProperties = {
  fontSize: 10,
  color: CAREER_MUTED,
  fontWeight: 800,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const POSTS_STAT_VALUE_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 16,
  color: CAREER_BLUE_DEEP,
  fontWeight: 900,
};

export const POSTS_FOOTER_STYLE: CSSProperties = {
  marginTop: 16,
  paddingTop: 12,
  borderTop: "1px solid rgba(0,0,0,0.05)",
  display: "flex",
  justifyContent: "space-between",
  color: CAREER_MUTED,
  fontSize: 11,
  fontWeight: 700,
};
