// App name: Job Mitra
// File name: shiftPostDetail.styles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\shiftPostDetail.styles.ts

import type { CSSProperties } from "react";

export const SHIFT_GREEN = "var(--wm-er-accent-shift, #16a34a)";

export const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  borderRadius: 20,
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
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
