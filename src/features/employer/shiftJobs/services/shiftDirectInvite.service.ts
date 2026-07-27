// App name: Job Mitra
// Favorite Worker Direct Invite Loop — send, accept, workspace merge (silent UX).

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeeNotificationPort } from "../../../../shared/notifications/employeeNotificationPort";
import { employerNotificationsStorage } from "../../notifications/storage/employerNotifications.storage";
import { confirmDirectInviteCandidate } from "../storage/employerShift.candidateActions";
import { broadcastToEmployeeWorkspace } from "../storage/employerShift.employeeBridge";
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

  shiftDirectInviteStorage.createPending({
    postId: post.id,
    workerMlId,
    workerName,
    companyName: post.companyName,
    jobName: post.jobName,
  });

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
    .getAll()
    .find((item) => item.id === input.inviteId && item.status === "pending");

  if (!invite) {
    return { ok: false, reason: "This invite is no longer available." };
  }

  const workerMlId = input.workerMlId.trim().toUpperCase();
  if (invite.workerMlId !== workerMlId) {
    return { ok: false, reason: "This invite was sent to a different worker profile." };
  }

  // SC-2 — same per-post lock + live re-read as employer confirm
  return withShiftConfirmLock(invite.postId, async () => {
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
    const hadGroupBefore = Boolean(findWorkspaceIdForPostAndWorker(livePost.id));

    const result = confirmDirectInviteCandidate(livePost, {
      workerMlId,
      workerName: input.workerName.trim() || invite.workerName,
      city: input.city,
      experience: input.experience,
      skills: input.skills,
      languages: input.languages,
    });

    if (result.ok) {
      updateEmployerShiftPost(livePost.id, result.post);
    } else {
      const reason =
        result.reason === "vacancy_full"
          ? "All confirmed slots are already filled for this shift."
          : result.reason === "already_confirmed"
            ? "You are already confirmed for this shift."
            : "Unable to accept this invite right now.";

      return { ok: false, reason };
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
