/** Job Mitra | shiftOps/index.ts | Phase 0–1 public exports (Shift Ops greenfield) */

export { isShiftContactRevealed, SHIFT_OPS_CONTACT_LOCKED_MESSAGE } from "./privacy";
export { getShiftOpsSupabase, isShiftOpsSupabaseConfigured } from "./lib/supabaseClient";
export { useDualVerification } from "./hooks/useDualVerification";
export { usePostApprovalRouting } from "./hooks/usePostApprovalRouting";

export { ShiftOpsInviteLandingPage } from "./pages/ShiftOpsInviteLandingPage";
export { ShiftOpsDualVerifyPage } from "./pages/ShiftOpsDualVerifyPage";
export { ShiftOpsPendingApprovalPage } from "./pages/ShiftOpsPendingApprovalPage";
export { ShiftOpsAcceptDeclinePage } from "./pages/ShiftOpsAcceptDeclinePage";
export { ShiftOpsReadyStatePage } from "./pages/ShiftOpsReadyStatePage";
export { ShiftOpsControlCenterPage } from "./pages/ShiftOpsControlCenterPage";
export { ShiftOpsManagerApprovalsPage } from "./pages/ShiftOpsManagerApprovalsPage";
export { ShiftOpsPostApprovalGate } from "./pages/ShiftOpsPostApprovalGate";
export { ShiftOpsGroupAccessCard } from "./components/ShiftOpsGroupAccessCard";
export { ShiftOpsActiveRosterCard } from "./components/ShiftOpsActiveRosterCard";
export { ShiftOpsJoinFallbackPanel } from "./components/ShiftOpsJoinFallbackPanel";

export {
  ensureSiteStaticLink,
  rotateSiteStaticLink,
  rotateSiteDailyOtp,
  joinSiteViaGroupLink,
  buildGroupJoinPath,
} from "./services/groupDailyOtp.service";

export { ensureShiftOpsAuthSession, clearShiftOpsAuthSession } from "./services/authBridge.service";
export {
  provisionSiteMembership,
  provisionSiteMembershipBestEffort,
  autoProvisionShiftOpsMembership,
  autoProvisionShiftOpsMembershipBestEffort,
  drainSiteMembershipProvisionItem,
  isSoSiteUuid,
} from "./services/membershipBridge.service";
export { ensureShiftOpsSiteForPost } from "./services/ensureSiteForShiftPost.service";

export {
  listActiveGroupRoster,
  reassignWorkerGroupAndRole,
  sendShiftOpsGroupMessage,
} from "./services/rosterReassign.service";

export {
  canCommunicateInShiftOpsGroup,
  shiftOpsCommsBlockedReason,
  SHIFT_OPS_CREW_ROLES,
  SHIFT_OPS_ZONES,
} from "./helpers/shiftOpsCommsGate.helpers";

export {
  stashPendingGroupJoin,
  peekPendingGroupJoin,
  clearPendingGroupJoin,
  peekPendingGroupJoinPath,
} from "./storage/pendingGroupJoin.storage";

export { resolvePendingGroupJoinOrchestration } from "./helpers/groupJoinDeepLink";

export type * from "./types";
