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
import { ApiRequestError } from "../../../../shared/services/apiService";
import type { EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import { getEmployerShiftPost, updateEmployerShiftPost } from "./employerShift.postActions.crud";
import { withShiftConfirmLock } from "./employerShift.confirmLock";
import {
  getSiteMembershipTruth,
  provisionSiteMembership,
  resolveShiftOpsSiteIdForPost,
} from "../../../shared/shiftOps/shiftJobsMembershipBridge";

/** Wave-4/5.1: timeout / already-confirmed / 5xx → heal. Narrow TypeError to network failures only (R4). */
function isConfirmHealCandidate(err: unknown): boolean {
  if (err instanceof ApiRequestError) {
    if (err.status === 409 && err.code === "ALREADY_CONFIRMED") return true;
    if (err.status === 408 || err.status === 504) return true;
    if (err.status >= 500) return true;
  }
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("fetch") ||
      msg.includes("network") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed")
    );
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("timeout") || msg.includes("network") || msg.includes("failed to fetch");
  }
  return false;
}

async function healConfirmFromServer(
  postId: string,
  appId: string,
  expectedWorkerWmId: string,
): Promise<boolean> {
  try {
    const workspace = await shiftConfirmApi.getWorkspace(postId, appId);
    if (!workspace?.id || !workspace.post_id || !workspace.app_id) return false;
    const expected = expectedWorkerWmId.trim().toUpperCase();
    if (!expected) return false;
    // Wave-5: reject heal if server workspace MUID does not match the application worker
    if (workspace.worker_wm_id.trim().toUpperCase() !== expected) return false;
    return true;
  } catch {
    return false;
  }
}

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
): Promise<
  | { ok: true; post: ShiftPost; workspaceId: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "missing_site_or_worker"
        | "membership_failed"
        | "vacancy_full"
        | "already_confirmed"
        | "not_confirmable"
        | "saga_failed"
        | "api_ids_unavailable"
        | "api_sync_failed"
        | "confirm_locked";
      post: ShiftPost | null;
    }
> {
  // SC-1 — serialize per-post; re-read after membership await for vacancy integrity
  try {
    return await withShiftConfirmLock(postId, async () => {
      const post = getEmployerShiftPost(postId);
      if (!post) return { ok: false, reason: "not_found", post: null };

      const priorApplications = readEmployeeApplications();
      const priorWorkspaces = readEmployeeWorkspaces();
      const priorPost = post;

      const preApps = readEmployeeApplications();
      const targetApp = preApps.find((item) => item.id === appId && item.postId === postId);
      const workerMlId = targetApp?.profileSnapshot?.uniqueId?.trim() ?? "";
      const siteId = resolveShiftOpsSiteIdForPost(post);
      if (!siteId || !workerMlId) {
        return { ok: false, reason: "missing_site_or_worker", post };
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
          return { ok: false, reason: "membership_failed", post };
        }
      }

      const livePost = getEmployerShiftPost(postId) ?? post;
      const result = confirmCandidate(livePost, appId);
      if (!result.ok) {
        const reason =
          result.reason === "vacancy_full" ||
          result.reason === "already_confirmed" ||
          result.reason === "not_confirmable"
            ? result.reason
            : "saga_failed";
        return { ok: false, reason, post: livePost };
      }

      const updated = updateEmployerShiftPost(postId, result.post);
      if (!updated) return { ok: false, reason: "saga_failed", post: livePost };

      if (isShiftConfirmApiEnabled()) {
        if (!canSyncShiftConfirmIds(postId, appId)) {
          writeEmployeeApplications(priorApplications);
          restoreEmployeeWorkspaces(priorWorkspaces);
          updateEmployerShiftPost(postId, priorPost);
          return { ok: false, reason: "api_ids_unavailable", post: priorPost };
        }

        try {
          await shiftConfirmApi.confirm(postId, appId, workerMlId);
        } catch (err) {
          // Wave-4/5: timeout / ALREADY_CONFIRMED / 5xx → heal (retain local confirm if server has matching workspace)
          if (
            isConfirmHealCandidate(err) &&
            (await healConfirmFromServer(postId, appId, workerMlId))
          ) {
            // keep local confirmed state
          } else {
            writeEmployeeApplications(priorApplications);
            restoreEmployeeWorkspaces(priorWorkspaces);
            updateEmployerShiftPost(postId, priorPost);
            return { ok: false, reason: "api_sync_failed", post: priorPost };
          }
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

      return { ok: true, post: updated, workspaceId: result.workspaceId };
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SHIFT_CONFIRM_LOCKED") {
      const post = getEmployerShiftPost(postId);
      return { ok: false, reason: "confirm_locked", post };
    }
    throw err;
  }
}

export async function replaceEmployerShiftCandidate(
  postId: string,
  appId: string,
  reason: EmployeeShiftApplication["replacedReason"] = "other",
): Promise<ShiftPost | null> {
  // Wave-3: same per-post lock as confirm (cross-tab + same-tab)
  try {
    return await withShiftConfirmLock(postId, async () => {
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
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SHIFT_CONFIRM_LOCKED") {
      return null;
    }
    throw err;
  }
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
