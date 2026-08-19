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
  ensureConfirmServerIds,
  isShiftConfirmApiEnabled,
  shiftConfirmApi,
} from "../services/shiftConfirmApi.service";
import { hydrateEmployerPostApplicationsFromServer } from "../../../shift/services/shiftDbTruth.service";
import { adoptServerWorkspaceId } from "../../../shift/services/shiftWorkspaceAdopt";
import { syncShiftWorkspaceIdBridge } from "../../../shift/services/shiftWorkspaceBridge.sync";
import { shiftAppIdsMatch, shiftPostIdsMatch } from "../../../shift/utils/shiftIdBridge";
import type { EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import { getEmployerShiftPost, updateEmployerShiftPost } from "./employerShift.postActions.crud";
import { healConfirmFromServer, isConfirmHealCandidate } from "./employerShift.confirmHeal";
import { withShiftConfirmLock } from "./employerShift.confirmLock";
import { bindShiftOpsGroupAndWorker } from "./employerShift.confirmSiteMembership";
import { activateShiftHireMyStaff } from "../services/shiftHireMyStaffActivation.service";

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
        | "site_ensure_failed"
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
      const targetApp = preApps.find(
        (item) => shiftAppIdsMatch(item.id, appId) && shiftPostIdsMatch(item.postId, postId),
      );
      const workerMlId = targetApp?.profileSnapshot?.uniqueId?.trim() ?? "";
      if (!workerMlId) {
        return { ok: false, reason: "missing_site_or_worker", post };
      }

      const bound = await bindShiftOpsGroupAndWorker({
        post,
        workerMlId,
        context: "confirm_employer_shift_candidate",
      });
      if (!bound.ok) {
        return { ok: false, reason: bound.reason, post: bound.post };
      }

      const livePost = getEmployerShiftPost(postId) ?? bound.post;
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

      let workspaceId = result.workspaceId;
      await hydrateEmployerPostApplicationsFromServer(postId);
      if (
        isShiftConfirmApiEnabled() &&
        (await ensureConfirmServerIds(postId, appId, livePost.jobName))
      ) {
        try {
          const confirmed = await shiftConfirmApi.confirm(postId, appId);
          const serverWs = await syncShiftWorkspaceIdBridge(
            result.workspaceId,
            postId,
            appId,
            confirmed,
          );
          if (serverWs) workspaceId = adoptServerWorkspaceId(result.workspaceId, serverWs);
        } catch (err) {
          if (
            isConfirmHealCandidate(err) &&
            (await healConfirmFromServer(postId, appId, workerMlId))
          ) {
            const serverWs = await syncShiftWorkspaceIdBridge(result.workspaceId, postId, appId);
            if (serverWs) workspaceId = adoptServerWorkspaceId(result.workspaceId, serverWs);
          } else if (import.meta.env.PROD) {
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

      // Finalized confirm path only — activate My Staff after API sync/heal (or AUTH-off local).
      if (targetApp) {
        activateShiftHireMyStaff(updated, targetApp);
      }

      return { ok: true, post: updated, workspaceId };
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
