// App name: Job Mitra
// Favorite Worker Direct Invite Loop — send, accept, workspace merge (silent UX).

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employeeNotificationsStorage } from "../../../employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../../notifications/storage/employerNotifications.storage";
import { confirmDirectInviteCandidate } from "../storage/employerShift.candidateActions";
import { broadcastToEmployeeWorkspace } from "../storage/employerShift.employeeBridge";
import {
  getEmployerShiftPost,
  updateEmployerShiftPost,
} from "../storage/employerShift.postActions";
import { shiftDirectInviteStorage } from "../storage/shiftDirectInvite.storage";
import { findWorkspaceIdForPostAndWorker } from "../helpers/directInviteWorkspace.helpers";

export type SendShiftDirectInviteInput = {
  postId: string;
  workerWmId: string;
  workerName: string;
};

export type AcceptShiftDirectInviteInput = {
  inviteId: string;
  workerWmId: string;
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

  const workerWmId = input.workerWmId.trim().toUpperCase();
  const workerName = input.workerName.trim();
  if (!workerWmId || !workerName) return false;

  shiftDirectInviteStorage.createPending({
    postId: post.id,
    workerWmId,
    workerName,
    companyName: post.companyName,
    jobName: post.jobName,
  });

  employeeNotificationsStorage.pushShift(
    "You are invited to a shift",
    `${post.companyName} invited you to: ${post.jobName} · ${post.locationName}. Tap to accept your direct invite.`,
    ROUTE_PATHS.employeeShiftPostDetails.replace(":postId", post.id),
  );

  return true;
}

export function acceptShiftDirectInvite(
  input: AcceptShiftDirectInviteInput,
): ShiftDirectInviteResult {
  const invite = shiftDirectInviteStorage
    .getAll()
    .find((item) => item.id === input.inviteId && item.status === "pending");

  if (!invite) {
    return { ok: false, reason: "This invite is no longer available." };
  }

  const workerWmId = input.workerWmId.trim().toUpperCase();
  if (invite.workerWmId !== workerWmId) {
    return { ok: false, reason: "This invite was sent to a different worker profile." };
  }

  const post = getEmployerShiftPost(invite.postId);
  if (!post) {
    return { ok: false, reason: "This shift post is no longer available." };
  }

  const hadGroupBefore = Boolean(findWorkspaceIdForPostAndWorker(post.id));

  const result = confirmDirectInviteCandidate(post, {
    workerWmId,
    workerName: input.workerName.trim() || invite.workerName,
    city: input.city,
    experience: input.experience,
    skills: input.skills,
    languages: input.languages,
  });

  if (result.ok) {
    updateEmployerShiftPost(post.id, result.post);
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

  if (hadGroupBefore && post.source !== "planner") {
    broadcastToEmployeeWorkspace(
      post.id,
      "New member joined",
      `${input.workerName.trim() || invite.workerName} joined the shift group.`,
    );
  }

  const workspaceId = findWorkspaceIdForPostAndWorker(post.id, workerWmId);

  employerNotificationsStorage.pushShift(
    `${invite.workerName} accepted your invite!`,
    "Added to workspace.",
    workspaceId
      ? ROUTE_PATHS.employerShiftWorkspace.replace(":workspaceId", workspaceId)
      : ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", post.id),
  );

  employeeNotificationsStorage.pushShift(
    "You are confirmed",
    `${post.companyName} confirmed you for ${post.jobName}. Your workspace is ready.`,
    workspaceId
      ? ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspaceId)
      : ROUTE_PATHS.employeeShiftWorkspaces,
  );

  return { ok: true, appId: result.appId, workspaceId };
}

export function declineShiftDirectInvite(inviteId: string, workerWmId: string): boolean {
  const invite = shiftDirectInviteStorage
    .getAll()
    .find((item) => item.id === inviteId && item.status === "pending");

  if (!invite) return false;

  const key = workerWmId.trim().toUpperCase();
  if (invite.workerWmId !== key) return false;

  shiftDirectInviteStorage.markDeclined(invite.id);
  return true;
}
