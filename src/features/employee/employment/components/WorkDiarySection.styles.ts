import type { CSSProperties } from "react";

export const CONSOLE_BLUE = "var(--wm-er-accent-console, #0369a1)";
export const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
export const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";

export const HEADER_TITLE_STYLE: CSSProperties = {
  fontWeight: 950,
  fontSize: 14,
  color: TEXT,
};

export const HEADER_SUBTITLE_STYLE: CSSProperties = {
  fontSize: 11.5,
  color: MUTED,
  marginTop: 3,
  lineHeight: 1.45,
};

export const CYCLE_PANEL_STYLE: CSSProperties = {
  marginTop: 0,
  padding: 12,
  borderRadius: 17,
  border: "1px solid rgba(3,105,161,0.12)",
  background: "rgba(240,249,255,0.6)",
};

export const NAV_BUTTON_STYLE: CSSProperties = {
  minWidth: 58,
  height: 32,
  border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 900,
  color: TEXT,
};

export const MONTH_BUTTON_STYLE: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
  color: TEXT,
};

export const LEGEND_ROW_STYLE: CSSProperties = {
  marginTop: 12,
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  padding: "8px 0",
  borderTop: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
};

export function getCycleToggleStyle(selected: boolean): CSSProperties {
  return {
    padding: "9px 10px",
    borderRadius: 13,
    border: selected ? "1.5px solid rgba(3,105,161,0.35)" : "1px solid rgba(148,163,184,0.18)",
    background: selected ? "rgba(3,105,161,0.08)" : "#ffffff",
    color: selected ? CONSOLE_BLUE : TEXT,
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  };
}

export const CYCLE_BADGE_STYLE: CSSProperties = {
  flexShrink: 0,
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(3,105,161,0.08)",
  color: CONSOLE_BLUE,
  fontSize: 10.5,
  fontWeight: 950,
  whiteSpace: "nowrap",
};

export const START_DAY_SELECT_STYLE: CSSProperties = {
  width: "100%",
  height: 38,
  borderRadius: 12,
  border: "1px solid rgba(3,105,161,0.16)",
  background: "#ffffff",
  color: TEXT,
  fontSize: 13,
  fontWeight: 850,
  padding: "0 10px",
};
