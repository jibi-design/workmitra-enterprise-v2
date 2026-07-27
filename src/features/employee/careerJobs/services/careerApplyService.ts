// Employee-side career application service — public facade.
// Apply, withdraw, duplicate check, profile snapshot.

export type { CareerApplyInput, AcceptCareerOfferResult } from "./careerApply/careerApply.types";

export {
  hasExistingApplication,
  getMyApplicationForJob,
  applyToCareerJob,
  acceptCareerOffer,
  declineCareerOffer,
  withdrawCareerApplication,
  canShowCareerWithdraw,
  isCareerWithdrawOnlineBlocked,
} from "./careerApply/careerApply.actions";
