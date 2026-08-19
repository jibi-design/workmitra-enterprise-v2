/**
 * Job Mitra | shiftJobsMembershipBridge.ts
 * One-way bridge: employer ShiftJobs → ShiftOps site membership (SEP-SJO-1 / P0).
 */

export {
  isSoSiteUuid,
  provisionLocalSiteMembership,
  provisionSiteMembership,
  provisionSiteMembershipBestEffort,
} from "../../shiftOps/services/membershipBridge.service";

export { ensureShiftOpsSiteForPost } from "../../shiftOps/services/ensureSiteForShiftPost.service";

export {
  canCommunicateInShiftOpsGroup,
  shiftOpsCommsBlockedReason,
} from "../../shiftOps/helpers/shiftOpsCommsGate.helpers";

export {
  getSiteMembershipTruth,
  subscribeSiteMembershipTruth,
  upsertSiteMembershipTruth,
} from "../../shiftOps/storage/siteMembershipTruth.storage";

export {
  resolveShiftOpsSiteIdForPost,
  resolveShiftOpsSiteIdFromPlanId,
} from "./resolveShiftOpsSiteId";
