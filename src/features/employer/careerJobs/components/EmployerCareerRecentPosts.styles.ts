import type { CSSProperties } from "react";

export const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export const POST_BUTTON_STYLE: CSSProperties = {
  width: "100%",
  padding: 13,
  borderRadius: "var(--wm-radius-employee-card)",
  border: "1px solid rgba(29,78,216,0.14)",
  background:
    "radial-gradient(circle at 96% 8%, rgba(29,78,216,0.065), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.99))",
  boxShadow: "0 12px 26px rgba(15,23,42,0.055)",
  cursor: "pointer",
  textAlign: "left",
};

export const SUMMARY_BOX_STYLE: CSSProperties = {
  minWidth: 0,
  padding: "8px 9px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(15,23,42,0.06)",
};

export const MINI_STAT_STYLE: CSSProperties = {
  minWidth: 0,
  padding: "8px 7px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(29,78,216,0.08)",
};

export const EMPTY_SECTION_STYLE: CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(29,78,216,0.16)",
  background:
    "radial-gradient(circle at 92% 4%, rgba(37,99,235,0.11), transparent 32%), linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.99), rgba(239,246,255,0.7))",
  boxShadow: "0 18px 38px rgba(15,23,42,0.075)",
};

export function getStatusBadgeStyle(postStatus: string, hasActivity: boolean): CSSProperties {
  return {
    flexShrink: 0,
    padding: "5px 9px",
    borderRadius: "var(--wm-radius-pill)",
    background:
      postStatus === "active"
        ? "linear-gradient(135deg, rgba(29,78,216,0.18), rgba(239,246,255,0.96))"
        : hasActivity
          ? "rgba(29,78,216,0.07)"
          : "rgba(15,23,42,0.055)",
    color:
      postStatus === "active"
        ? CAREER_BLUE_DEEP
        : hasActivity
          ? CAREER_BLUE_DEEP
          : "rgba(15,23,42,0.58)",
    fontSize: 10.5,
    fontWeight: 950,
    whiteSpace: "nowrap",
  };
}
