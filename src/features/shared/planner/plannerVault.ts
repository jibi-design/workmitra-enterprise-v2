/**
 * Job Mitra | plannerVault.ts
 * Hybrid A2 P1.4/P1.5 — Planner vault + rating surface.
 */

export {
  VAULT_PLANNER_HISTORY_KEY,
  VAULT_PLANNER_HISTORY_CHANGED,
  getVaultPlannerHistory,
  getVaultPlannerHistoryForWorker,
  upsertVaultPlannerEpoch,
  finalizeVaultPlannerOnClosure,
  plannerVaultEpochKey,
} from "../../employee/workVault/storage/vaultPlannerHistory.storage";
export type {
  VaultPlannerHistoryEntry,
  VaultPlannerExitType,
  UpsertPlannerEpochInput,
} from "../../employee/workVault/storage/vaultPlannerHistory.storage";

export {
  recordPlannerEpochInVault,
  syncPlannerVaultRatings,
  recordPlannerOffboardInVault,
  recordPlannerPlanCompletedInVault,
} from "../../employee/workVault/services/plannerVaultHistory.service";

export {
  submitPlannerEmployerRating,
  submitPlannerWorkerRating,
} from "../../../shared/rating/submitPlannerRatingSaga";

export {
  buildPlannerRatingJobId,
  guardPlannerReputationSubject,
  isPublicReputationDomain,
} from "../../../shared/rating/plannerRating.helpers";

export type { RatingPlannerMeta, RatingDomain } from "../../../shared/rating/ratingTypes";
