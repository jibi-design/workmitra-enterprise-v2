// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CandidateActionButtonStyles.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateActions\CandidateActionButtonStyles.ts

export const OUTLINE_BUTTON_STYLE = {
  fontSize: 12,
  height: 32,
  padding: "0 12px",
} as const;

export const DANGER_OUTLINE_BUTTON_STYLE = {
  ...OUTLINE_BUTTON_STYLE,
  color: "var(--wm-error)",
} as const;

export const PRIMARY_BUTTON_STYLE = {
  fontSize: 12,
  padding: "6px 12px",
} as const;
