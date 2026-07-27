// src/features/shared/workVault/vaultPublic.ts
//
// Employer Work Vault public surface — re-exports types, constants, helpers,
// and services from the employee vault implementation (strict module isolation).

// ── Constants ──
export {
  VAULT_ACCENT,
  vaultAccentMix,
  OTP_CODE_LENGTH,
  OTP_VALIDITY_MS,
  SESSION_DURATION_MS,
  VAULT_STORAGE_KEYS,
} from "../../employee/workVault/constants/vaultConstants";

export { VAULT_FEATURE_FLAGS } from "../../employee/workVault/constants/vaultFeatureFlags";
export type { VaultFeatureKey } from "../../employee/workVault/constants/vaultFeatureFlags";

// ── Types ──
export type {
  FolderVisibility,
  VaultFolder,
  VaultFileType,
  VaultDocument,
  VaultOTP,
  VaultOtpPending,
  VaultSessionStatus,
  VaultSession,
  VaultAccessEntry,
} from "../../employee/workVault/types/vaultTypes";

export type {
  VaultSkillEntry,
  VaultWorkExperienceEntry,
  VaultActivityData,
  VaultEducation,
  VaultReference,
  VaultAchievement,
} from "../../employee/workVault/types/vaultProfileTypes";

export type { VaultSectionData } from "../../employee/workVault/services/vaultDataAggregator";

// ── Helpers ──
export { validateOtpFormat } from "../../employee/workVault/helpers/vaultValidation";

// ── Services ──
export { getVaultSectionData } from "../../employee/workVault/services/vaultDataAggregator";

export { getAllDocuments } from "../../employee/workVault/services/vaultDocumentService";
export { getVisibleFolders } from "../../employee/workVault/services/vaultFolderService";

export { verifyOtp, verifyOtpViaApi } from "../../employee/workVault/services/vaultOtpService";

export {
  clearStoredEmployerSessionId,
  createSession,
  createSessionFromApiResult,
  endEmployerLocalSession,
  expireOldSessions,
  getActiveSession,
  getAccessLogSorted,
  getSessionRemainingMs,
  isSessionValid,
} from "../../employee/workVault/services/vaultAccessService";

export { isVaultApiSyncEnabled } from "../../employee/workVault/services/vaultGateApi.service";

export {
  syncVaultShiftRatings,
  recordShiftCompletedInVault,
  finalizeVaultShiftHistoryForPost,
} from "../../employee/workVault/services/shiftVaultHistory.service";
export type { VaultFinalizePostResult } from "../../employee/workVault/services/shiftVaultHistory.service";

export {
  syncVaultCareerRatingsForPost,
  recordCareerClosureInVault,
} from "../../employee/workVault/services/careerVaultHistory.service";

export {
  recordPlannerEpochInVault,
  syncPlannerVaultRatings,
  recordPlannerOffboardInVault,
  recordPlannerPlanCompletedInVault,
} from "../../employee/workVault/services/plannerVaultHistory.service";
export {
  VAULT_PLANNER_HISTORY_KEY,
  getVaultPlannerHistory,
  getVaultPlannerHistoryForWorker,
} from "../../employee/workVault/storage/vaultPlannerHistory.storage";
export type {
  VaultPlannerHistoryEntry,
  VaultPlannerExitType,
} from "../../employee/workVault/storage/vaultPlannerHistory.storage";

// ── Shared UI (employer vault view only) ──
export { VaultIdentityCard } from "../../employee/workVault/components/VaultIdentityCard";
export { VaultWorkStatsCard } from "../../employee/workVault/components/VaultWorkStatsCard";
export { VaultPerformanceCard } from "../../employee/workVault/components/VaultPerformanceCard";
export { VaultProfileTab } from "../../employee/workVault/components/VaultProfileTab";
