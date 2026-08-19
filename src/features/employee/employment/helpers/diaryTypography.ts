/** Job Mitra | diaryTypography.ts — align diary UI to shared type scale */

import type { CSSProperties } from "react";

/** Card / section titles — matches .wm-typeCardTitle */
export const DIARY_TITLE: CSSProperties = {
  margin: 0,
  fontSize: "var(--wm-type-card-title-size)",
  fontWeight: "var(--wm-type-card-title-weight)",
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  color: "var(--wm-emp-text, var(--wm-er-text, #1e293b))",
};

/** Supporting copy — matches .wm-typeHelper */
export const DIARY_HELPER: CSSProperties = {
  margin: 0,
  fontSize: "var(--wm-type-helper-size)",
  fontWeight: "var(--wm-type-helper-weight)",
  lineHeight: 1.45,
  color: "var(--wm-type-helper-color, var(--wm-emp-muted, #64748b))",
};

/** Field labels / meta */
export const DIARY_LABEL: CSSProperties = {
  fontSize: "var(--wm-font-sm, 12px)",
  fontWeight: "var(--wm-weight-medium, 600)",
  color: "var(--wm-type-helper-color, var(--wm-emp-muted, #64748b))",
};

/** Field values / primary body */
export const DIARY_VALUE: CSSProperties = {
  fontSize: "var(--wm-font-sm, 12px)",
  fontWeight: "var(--wm-weight-bold, 700)",
  color: "var(--wm-emp-text, var(--wm-er-text, #1e293b))",
};

/** Compact chips / badges */
export const DIARY_BADGE: CSSProperties = {
  fontSize: 11,
  fontWeight: "var(--wm-weight-bold, 700)",
};

/** Secondary actions / toggles */
export const DIARY_BTN: CSSProperties = {
  fontSize: "var(--wm-font-sm, 12px)",
  fontWeight: "var(--wm-weight-bold, 700)",
};
