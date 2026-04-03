// src/features/employee/workVault/constants/vaultFeatureFlags.ts
//
// Work Vault v2 — Feature flags for each profile section.
// Flip any flag to false → that section shows "Coming Soon" lock card.
// All ON during development. Set to basic-only before Play Store release.

export const VAULT_FEATURE_FLAGS = {
  /** Section 1: Identity & Verification */
  identity: true,

  /** Section 2: Professional Summary */
  professionalSummary: true,

  /** Section 3: Work Experience (auto from Career Jobs) */
  workExperience: true,

  /** Section 4: Work Stats (auto from all domains) */
  workStats: true,

  /** Section 5: Education & Certifications (manual) */
  education: true,

  /** Section 6: Skills Assessment */
  skillsAssessment: true,

  /** Section 7: Performance Record (auto from Shift + Workforce) */
  performanceRecord: true,

  /** Section 8: References (auto from 4+ star employers) */
  references: true,

  /** Section 9: Achievements & Milestones */
  achievements: true,

  /** Section 10: Documents (existing vault folders) */
  documents: true,

  /** Section 10: Activity & Engagement */
  activity: true,
} as const;

export type VaultFeatureKey = keyof typeof VAULT_FEATURE_FLAGS;