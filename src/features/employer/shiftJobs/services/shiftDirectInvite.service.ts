// App name: Job Mitra
// Favorite Worker Direct Invite Loop — send, accept, workspace merge (silent UX).

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeeNotificationPort } from "../../../../shared/notifications/employeeNotificationPort";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { employerNotificationsStorage } from "../../notifications/storage/employerNotifications.storage";
import { confirmDirectInviteCandidate } from "../storage/employerShift.candidateActions";
import {
  broadcastToEmployeeWorkspace,
  readEmployeeApplications,
  readEmployeeWorkspaces,
  restoreEmployeeWorkspaces,
  writeEmployeeApplications,
} from "../storage/employerShift.employeeBridge";
import {
  getEmployerShiftPost,
  updateEmployerShiftPost,
} from "../storage/employerShift.postActions";
import { withShiftConfirmLock } from "../storage/employerShift.confirmLock";
import { shiftDirectInviteStorage } from "../storage/shiftDirectInvite.storage";
import { findWorkspaceIdForPostAndWorker } from "../helpers/directInviteWorkspace.helpers";
import {
  getSiteMembershipTruth,
  provisionSiteMembership,
  resolveShiftOpsSiteIdForPost,
} from "../../../shared/shiftOps/shiftJobsMembershipBridge";
import {
  isShiftServerUuid,
  shiftAppIdBridge,
  shiftPostIdBridge,
} from "../../../shift/utils/shiftIdBridge";
import { shiftGateApi } from "../../../shift/services/shiftGateApi.service";
import { appendSelectionAuditEvent } from "../../../shared/shift/selectionAudit.storage";

export type SendShiftDirectInviteInput = {
  postId: string;
  workerMlId: string;
  workerName: string;
};

export type AcceptShiftDirectInviteInput = {
  inviteId: string;
  workerMlId: string;
  workerName: string;
  city?: string;
  experience?: string;
  skills?: string[];
  languages?: string[];
};

export type ShiftDirectInviteResult =
  { ok: true; appId: string; workspaceId: string | null } | { ok: false; reason: string };

export function sendShiftDirectInvite(input: SendShiftDirectInviteInput): boolean {
  const post = getEmployerShiftPost(input.postId);
  if (!post || post.status !== "active") return false;
  if (post.isHiddenFromSearch && post.source !== "planner") return false;

  const workerMlId = input.workerMlId.trim().toUpperCase();
  const workerName = input.workerName.trim();
  if (!workerMlId || !workerName) return false;

  const local = shiftDirectInviteStorage.createPending({
    postId: post.id,
    workerMlId,
    workerName,
    companyName: post.companyName,
    jobName: post.jobName,
  });

  appendSelectionAuditEvent({
    action: "direct_invite",
    postId: post.id,
    candidateId: workerMlId,
    inviteId: local.id,
  });

  // Wave-5: AUTH on requires server invite id/token before accept can succeed
  if (AUTH_BACKEND_ENABLED) {
    const serverPostId =
      shiftPostIdBridge.resolveServerId(post.id) ?? (isShiftServerUuid(post.id) ? post.id : null);
    if (serverPostId) {
      void shiftGateApi
        .createDirectInvite(serverPostId, workerMlId)
        .then((serverInvite) => {
          const all = shiftDirectInviteStorage.getAll().map((item) =>
            item.id === local.id
              ? {
                  ...item,
                  id: serverInvite.id,
                  serverInviteToken: serverInvite.token,
                }
              : item,
          );
          shiftDirectInviteStorage.replaceAllForActiveEmployer(all);
        })
        .catch(() => {
          /* leave local pending; accept will fail closed until invite is re-sent */
        });
    }
  }

  employeeNotificationPort.pushShift(
    "You are invited to a shift",
    `${post.companyName} invited you to: ${post.jobName} · ${post.locationName}. Tap to accept your direct invite.`,
    ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", post.id),
  );

  return true;
}

export async function acceptShiftDirectInvite(
  input: AcceptShiftDirectInviteInput,
): Promise<ShiftDirectInviteResult> {
  const invite = shiftDirectInviteStorage
    .getAllForWorker()
    .find((item) => item.id === input.inviteId && item.status === "pending");

  if (!invite) {
    return { ok: false, reason: "This invite is no longer available." };
  }

  const workerMlId = input.workerMlId.trim().toUpperCase();
  if (invite.workerMlId !== workerMlId) {
    return { ok: false, reason: "This invite was sent to a different worker profile." };
  }

  // SC-2 — same per-post lock + live re-read as employer confirm
  try {
    return await withShiftConfirmLock(invite.postId, async () => {
      const post = getEmployerShiftPost(invite.postId);
      if (!post) {
        return { ok: false, reason: "This shift post is no longer available." };
      }

      const siteId = resolveShiftOpsSiteIdForPost(post);
      if (!siteId) {
        return {
          ok: false,
          reason: "This shift is not linked to an active Shift Ops group yet.",
        };
      }

      const existingMembership = getSiteMembershipTruth(siteId, workerMlId);
      if (!existingMembership?.membershipId) {
        const provision = await provisionSiteMembership({
          siteId,
          workerMlId,
          planId: post.planId?.trim() || undefined,
          context: "accept_direct_invite",
        });
        if (!provision.ok) {
          return {
            ok: false,
            reason: "Unable to join the formal Shift Ops group. Try again after group setup.",
          };
        }
      }

      const livePost = getEmployerShiftPost(invite.postId) ?? post;
      const priorApplications = readEmployeeApplications();
      const priorWorkspaces = readEmployeeWorkspaces();
      const priorPost = livePost;
      const hadGroupBefore = Boolean(findWorkspaceIdForPostAndWorker(livePost.id));

      const result = confirmDirectInviteCandidate(livePost, {
        workerMlId,
        workerName: input.workerName.trim() || invite.workerName,
        city: input.city,
        experience: input.experience,
        skills: input.skills,
        languages: input.languages,
      });

      if (!result.ok) {
        const reason =
          result.reason === "vacancy_full"
            ? "All confirmed slots are already filled for this shift."
            : result.reason === "already_confirmed"
              ? "You are already confirmed for this shift."
              : "Unable to accept this invite right now.";

        return { ok: false, reason };
      }

      updateEmployerShiftPost(livePost.id, result.post);

      // Wave-1 AUTH on: server vacancy-locked direct-accept (same CAS as employer confirm)
      if (AUTH_BACKEND_ENABLED) {
        const serverPostId =
          shiftPostIdBridge.resolveServerId(livePost.id) ??
          (isShiftServerUuid(livePost.id) ? livePost.id : null);

        if (!serverPostId) {
          writeEmployeeApplications(priorApplications);
          restoreEmployeeWorkspaces(priorWorkspaces);
          updateEmployerShiftPost(priorPost.id, priorPost);
          return {
            ok: false,
            reason:
              "This shift is not synced to the server yet, so invite accept cannot be confirmed safely.",
          };
        }

        // Wave-5.1 R2: server invite_token is mandatory
        if (!invite.serverInviteToken?.trim()) {
          writeEmployeeApplications(priorApplications);
          restoreEmployeeWorkspaces(priorWorkspaces);
          updateEmployerShiftPost(priorPost.id, priorPost);
          return {
            ok: false,
            reason:
              "This invite is missing a server token. Ask the employer to re-send the direct invite.",
          };
        }

        try {
          const server = await shiftGateApi.acceptDirectInvite(serverPostId, {
            invite_id: invite.id,
            invite_token: invite.serverInviteToken,
            details: {
              full_name: input.workerName.trim() || invite.workerName,
              city: input.city,
              experience: input.experience,
              skills: input.skills,
              languages: input.languages,
            },
          });
          shiftAppIdBridge.upsert(result.appId, server.application.id);
          shiftPostIdBridge.upsert(livePost.id, serverPostId);
        } catch {
          writeEmployeeApplications(priorApplications);
          restoreEmployeeWorkspaces(priorWorkspaces);
          updateEmployerShiftPost(priorPost.id, priorPost);
          return {
            ok: false,
            reason:
              "Server could not confirm this invite (vacancy may be full). Local changes were rolled back.",
          };
        }
      }

      shiftDirectInviteStorage.markAccepted(invite.id, result.appId);

      if (hadGroupBefore && livePost.source !== "planner") {
        broadcastToEmployeeWorkspace(
          livePost.id,
          "New member joined",
          `${input.workerName.trim() || invite.workerName} joined the shift group.`,
        );
      }

      const workspaceId = findWorkspaceIdForPostAndWorker(livePost.id, workerMlId);

      employerNotificationsStorage.pushShift(
        `${invite.workerName} accepted your invite!`,
        "Added to workspace.",
        workspaceId
          ? ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", workspaceId)
          : ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", livePost.id),
      );

      employeeNotificationPort.pushShift(
        "You are confirmed",
        `${livePost.companyName} confirmed you for ${livePost.jobName}. Your workspace is ready.`,
        workspaceId
          ? ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspaceId)
          : ROUTE_PATHS.employeeShiftWorkspaces,
      );

      return { ok: true, appId: result.appId, workspaceId };
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SHIFT_CONFIRM_LOCKED") {
      return {
        ok: false,
        reason: "Another tab is confirming this shift. Try again in a moment.",
      };
    }
    throw err;
  }
}

export function declineShiftDirectInvite(inviteId: string, workerMlId: string): boolean {
  const invite = shiftDirectInviteStorage
    .getAll()
    .find((item) => item.id === inviteId && item.status === "pending");

  if (!invite) return false;

  const key = workerMlId.trim().toUpperCase();
  if (invite.workerMlId !== key) return false;

  shiftDirectInviteStorage.markDeclined(invite.id);
  return true;
}
