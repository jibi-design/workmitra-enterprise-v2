// Job Mitra | planBroadcast.service.ts | BCC crew broadcast — no worker-to-worker visibility

import {
  findWorkspaceIdForPostAndWorker,
  broadcastToEmployeeWorkspace,
  readEmployeeWorkspaces,
  type ShiftPost,
  type EmployeeShiftApplication,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { planBroadcastGroupStorage } from "../storage/planBroadcastGroup.storage";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { plannerEmployeeNotifications } from "../../../shared/planner/plannerEmployeeBridge";

/**
 * BCC MODEL:
 * - Employer broadcast fans out to each member's per-day workspace only.
 * - Workers never see other crew members or a shared group chat.
 * - Worker replies use existing workspace "direct" channel → employer only.
 */
export function ensurePlanBroadcastGroup(
  planId: string,
  planName: string,
  companyName: string,
): void {
  planBroadcastGroupStorage.ensureGroup(planId, planName, companyName);
}

export function enrollWorkspaceInPlanGroup(
  planId: string,
  workspaceId: string,
  workerMlId: string,
): void {
  planBroadcastGroupStorage.enrollWorkspace(planId, workspaceId, workerMlId);
}

export type PlanEnrollResult = { ok: true } | { ok: false; reason: "skipped" | "storage_error" };

export function enrollConfirmedWorkerInPlanGroup(
  post: ShiftPost,
  application: EmployeeShiftApplication,
): PlanEnrollResult {
  const planId = post.planId;
  if (!planId || post.source !== "planner") return { ok: true };

  const workerMlId = application.profileSnapshot?.uniqueId?.trim();
  const workspaceId = findWorkspaceIdForPostAndWorker(post.id, workerMlId) ?? undefined;

  if (!workspaceId || !workerMlId) return { ok: false, reason: "skipped" };

  planBroadcastGroupStorage.ensureGroup(planId, post.jobName, post.companyName);
  const enrolled = planBroadcastGroupStorage.enrollWorkspace(planId, workspaceId, workerMlId);
  return enrolled ? { ok: true } : { ok: false, reason: "storage_error" };
}

export function unenrollWorkerFromPlanGroup(
  post: ShiftPost,
  application: EmployeeShiftApplication,
): void {
  const planId = post.planId;
  if (!planId || post.source !== "planner") return;

  const workerMlId = application.profileSnapshot?.uniqueId?.trim();
  const workspaceId = findWorkspaceIdForPostAndWorker(post.id, workerMlId) ?? undefined;

  if (!workspaceId || !workerMlId) return;

  planBroadcastGroupStorage.unenrollWorkspace(planId, workspaceId, workerMlId);
}

export type PlanBroadcastResult = { ok: true; delivered: number } | { ok: false; reason: string };

export function broadcastToPlanCrew(
  planId: string,
  title: string,
  body: string,
): PlanBroadcastResult {
  const group = planBroadcastGroupStorage.getByPlanId(planId);
  if (!group) return { ok: false, reason: "no_group" };

  if (group.memberWorkspaceIds.length === 0) {
    return { ok: false, reason: "no_members" };
  }

  const workspaceById = new Map(
    readEmployeeWorkspaces().map((workspace) => [workspace.id, workspace]),
  );

  const posts = new Map<string, string>();
  for (const workspaceId of group.memberWorkspaceIds) {
    const workspace = workspaceById.get(workspaceId);
    if (!workspace?.postId) {
      console.warn("[planBroadcast] Crew broadcast skipped — workspace or postId missing", {
        planId,
        workspaceId,
      });
      // TODO: enqueue to wm_retry_queue_v1 when retry infrastructure exists.
      continue;
    }

    posts.set(workspaceId, workspace.postId);
  }

  let delivered = 0;
  for (const [workspaceId, postId] of posts) {
    try {
      broadcastToEmployeeWorkspace(postId, title, body);
      delivered += 1;
    } catch (error) {
      console.warn("[planBroadcast] Crew broadcast delivery failed", {
        planId,
        workspaceId,
        postId,
        error,
      });
      // TODO: enqueue to wm_retry_queue_v1 with workspaceId context when retry infrastructure exists.
    }
  }

  if (delivered === 0) {
    return { ok: false, reason: "delivery_failed" };
  }

  plannerEmployeeNotifications.crewBroadcast(group.planName, ROUTE_PATHS.employeePlannerWorkspaces);

  return { ok: true, delivered };
}
