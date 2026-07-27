import {
  confirmCandidate,
  moveCandidateToShortlist,
  moveCandidateToWaiting,
  rejectCandidate,
  replaceConfirmedCandidate,
} from "./employerShift.candidateActions";
import {
  broadcastToEmployeeWorkspace,
  readEmployeeApplications,
  readEmployeeWorkspaces,
  restoreEmployeeWorkspaces,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import { plannerPublicIndex } from "../../../shared/planner/ports/plannerShiftJobsBridge";
import { pushEmployerActivity } from "./employerShift.activityStorage";
import {
  canSyncShiftConfirmIds,
  isShiftConfirmApiEnabled,
  shiftConfirmApi,
} from "../services/shiftConfirmApi.service";
import type { EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import { getEmployerShiftPost, updateEmployerShiftPost } from "./employerShift.postActions.crud";
import { withShiftConfirmLock } from "./employerShift.confirmLock";
import {
  getSiteMembershipTruth,
  provisionSiteMembership,
  resolveShiftOpsSiteIdForPost,
} from "../../../shared/shiftOps/shiftJobsMembershipBridge";

export function shortlistEmployerShiftCandidate(postId: string, appId: string): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = moveCandidateToShortlist(post, appId);
  if (!result.changed) return post;

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "move_shortlist",
    title: "Candidate moved to shortlist",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export function waitlistEmployerShiftCandidate(postId: string, appId: string): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = moveCandidateToWaiting(post, appId);
  if (!result.changed) return post;

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "move_waiting",
    title: "Candidate moved to waiting list",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export function rejectEmployerShiftCandidate(postId: string, appId: string): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = rejectCandidate(post, appId);
  if (!result.changed) return post;

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "candidate_rejected",
    title: "Candidate rejected",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export async function confirmEmployerShiftCandidate(
  postId: string,
  appId: string,
): Promise<{ post: ShiftPost; workspaceId: string | null } | null> {
  // SC-1 — serialize per-post; re-read after membership await for vacancy integrity
  return withShiftConfirmLock(postId, async () => {
    const post = getEmployerShiftPost(postId);
    if (!post) return null;

    const priorApplications = readEmployeeApplications();
    const priorWorkspaces = readEmployeeWorkspaces();
    const priorPost = post;

    const preApps = readEmployeeApplications();
    const targetApp = preApps.find((item) => item.id === appId && item.postId === postId);
    const workerMlId = targetApp?.profileSnapshot?.uniqueId?.trim() ?? "";
    const siteId = resolveShiftOpsSiteIdForPost(post);
    if (!siteId || !workerMlId) {
      return { post, workspaceId: null };
    }

    const existingMembership = getSiteMembershipTruth(siteId, workerMlId);
    if (!existingMembership?.membershipId) {
      const provision = await provisionSiteMembership({
        siteId,
        workerMlId,
        planId: post.planId?.trim() || undefined,
        context: "confirm_employer_shift_candidate",
      });
      if (!provision.ok) {
        return { post, workspaceId: null };
      }
    }

    const livePost = getEmployerShiftPost(postId) ?? post;
    const result = confirmCandidate(livePost, appId);
    if (!result.ok) return { post: livePost, workspaceId: null };

    const updated = updateEmployerShiftPost(postId, result.post);
    if (!updated) return null;

    if (isShiftConfirmApiEnabled()) {
      if (!canSyncShiftConfirmIds(postId, appId)) {
        writeEmployeeApplications(priorApplications);
        restoreEmployeeWorkspaces(priorWorkspaces);
        updateEmployerShiftPost(postId, priorPost);
        return { post: priorPost, workspaceId: null };
      }

      try {
        await shiftConfirmApi.confirm(postId, appId, workerMlId);
      } catch {
        writeEmployeeApplications(priorApplications);
        restoreEmployeeWorkspaces(priorWorkspaces);
        updateEmployerShiftPost(postId, priorPost);
        return { post: priorPost, workspaceId: null };
      }
    }

    pushEmployerActivity({
      postId,
      kind: "confirmed",
      title: "Candidate confirmed",
      body: appId,
      route: `/employer/shift/post/${postId}/candidate/${appId}`,
    });

    if (updated.planId) {
      plannerPublicIndex.refreshOpenCounts(updated.planId);
    }

    return { post: updated, workspaceId: result.workspaceId };
  });
}

export function replaceEmployerShiftCandidate(
  postId: string,
  appId: string,
  reason: EmployeeShiftApplication["replacedReason"] = "other",
): ShiftPost | null {
  const post = getEmployerShiftPost(postId);
  if (!post) return null;

  const result = replaceConfirmedCandidate(post, appId, reason);
  if (!result.ok) {
    return result.reason === "not_found" || result.reason === "not_confirmed" ? post : null;
  }

  const updated = updateEmployerShiftPost(postId, result.post);

  pushEmployerActivity({
    postId,
    kind: "replaced",
    title: "Confirmed candidate replaced",
    body: appId,
    route: `/employer/shift/post/${postId}/candidate/${appId}`,
  });

  return updated;
}

export function broadcastEmployerShiftWorkspace(postId: string, title: string, body: string): void {
  broadcastToEmployeeWorkspace(postId, title, body);

  pushEmployerActivity({
    postId,
    kind: "confirmed",
    title: "Workspace broadcast sent",
    body: title,
    route: `/employer/shift/workspace/${postId}`,
  });
}
