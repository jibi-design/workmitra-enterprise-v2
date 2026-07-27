// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CandidateActionButtonStyles.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\candidateActions\CandidateActionButtonStyles.ts

export const OUTLINE_BUTTON_STYLE = {
  fontSize: 13,
  minHeight: 44,
  height: 44,
  padding: "0 14px",
} as const;

export const DANGER_OUTLINE_BUTTON_STYLE = {
  ...OUTLINE_BUTTON_STYLE,
  color: "var(--wm-error)",
} as const;

export const PRIMARY_BUTTON_STYLE = {
  fontSize: 13,
  minHeight: 44,
  height: 44,
  padding: "0 14px",
} as const;
