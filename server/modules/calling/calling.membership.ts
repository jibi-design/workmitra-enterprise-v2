/**
 * Wave-5: calling workspace membership + session ML binding.
 */

import type { AuthUser } from "../auth/types.js";
import { employerShiftRepository, isShiftUuid } from "../employer/shift/shift.repository.js";

export type CallMembershipResult =
  | { ok: true; initiatorMl: string; receiverMl: string; workspaceId: string }
  | { ok: false; code: string; message: string; httpStatus: number };

function normalizeMl(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Bind initiator to session identity; verify workspace parties before token/FCM.
 */
export async function resolveAuthorizedCallParties(params: {
  workspaceId: string;
  sessionUser: AuthUser;
  requestedReceiverMl: string;
}): Promise<CallMembershipResult> {
  const workspaceId = params.workspaceId.trim();
  if (!workspaceId) {
    return {
      ok: false,
      code: "CALL_INVALID_INPUT",
      message: "workspaceId is required",
      httpStatus: 400,
    };
  }

  const sessionMl = normalizeMl(params.sessionUser.id);
  const receiverMl = normalizeMl(params.requestedReceiverMl);
  if (!receiverMl) {
    return {
      ok: false,
      code: "CALL_INVALID_INPUT",
      message: "receiverMl is required",
      httpStatus: 400,
    };
  }
  if (sessionMl === receiverMl) {
    return {
      ok: false,
      code: "CALL_SAME_PARTY",
      message: "initiator and receiver must differ",
      httpStatus: 400,
    };
  }

  // Prefer shift_workspaces UUID membership when available
  if (isShiftUuid(workspaceId)) {
    try {
      const workspace = await employerShiftRepository.findWorkspaceById(workspaceId);
      if (!workspace || workspace.status === "cancelled") {
        return {
          ok: false,
          code: "CALL_WORKSPACE_NOT_FOUND",
          message: "Workspace not found or not callable",
          httpStatus: 404,
        };
      }
      const post = await employerShiftRepository.findPostById(workspace.post_id);
      if (!post) {
        return {
          ok: false,
          code: "CALL_WORKSPACE_NOT_FOUND",
          message: "Workspace post not found",
          httpStatus: 404,
        };
      }

      const employerMl = normalizeMl(post.employer_id);
      const workerMl = normalizeMl(workspace.worker_wm_id);
      const parties = new Set([employerMl, workerMl]);

      if (!parties.has(sessionMl)) {
        return {
          ok: false,
          code: "CALL_NOT_MEMBER",
          message: "Authenticated user is not a party on this workspace",
          httpStatus: 403,
        };
      }
      if (!parties.has(receiverMl)) {
        return {
          ok: false,
          code: "CALL_RECEIVER_NOT_MEMBER",
          message: "receiverMl is not a party on this workspace",
          httpStatus: 403,
        };
      }
      if (receiverMl === sessionMl) {
        return {
          ok: false,
          code: "CALL_SAME_PARTY",
          message: "initiator and receiver must differ",
          httpStatus: 400,
        };
      }

      return {
        ok: true,
        initiatorMl: sessionMl,
        receiverMl,
        workspaceId: workspace.id,
      };
    } catch (err) {
      console.warn(
        "[calling.membership] workspace lookup failed:",
        err instanceof Error ? err.message : "unknown",
      );
      return {
        ok: false,
        code: "CALL_WORKSPACE_LOOKUP_FAILED",
        message: "Unable to verify workspace membership",
        httpStatus: 503,
      };
    }
  }

  return {
    ok: false,
    code: "CALL_WORKSPACE_INVALID",
    message: "workspaceId must be a server workspace UUID with verified membership",
    httpStatus: 400,
  };
}

export async function assertAnswerParty(params: {
  sessionUser: AuthUser;
  callReceiverMl: string;
  claimedPartyMl: string;
}): Promise<CallMembershipResult | { ok: true; partyMl: string }> {
  const sessionMl = normalizeMl(params.sessionUser.id);
  const receiverMl = normalizeMl(params.callReceiverMl);
  const claimed = normalizeMl(params.claimedPartyMl);

  if (sessionMl !== receiverMl) {
    return {
      ok: false,
      code: "CALL_NOT_RECEIVER",
      message: "Only the authenticated receiver may answer this call",
      httpStatus: 403,
    };
  }
  if (claimed && claimed !== sessionMl) {
    return {
      ok: false,
      code: "CALL_PARTY_MISMATCH",
      message: "partyMl must match authenticated session identity",
      httpStatus: 403,
    };
  }
  return { ok: true, partyMl: sessionMl };
}
