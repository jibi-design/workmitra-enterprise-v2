// App name: Job Mitra | shiftPostDetail.styles.ts — shared section tokens (post-details polish)

import type { CSSProperties } from "react";

export const SHIFT_GREEN = "var(--wm-er-accent-shift, #16a34a)";

/** Prefer className `wm-shift-surface-glass wm-shift-surface-glass--shift` + SECTION_PAD. */
export const SECTION_PAD: CSSProperties = {
  padding: 16,
};

export const SECTION_TITLE_STYLE: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: SHIFT_GREEN,
  marginBottom: 8,
};

export const SECTION_TEXT_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 650,
  color: "var(--wm-er-text, #1e293b)",
  lineHeight: 1.6,
};

export const DETAIL_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
};

/** @deprecated Prefer SECTION_PAD + glass className */
export const CARD_STYLE: CSSProperties = {
  ...SECTION_PAD,
};
