// Job Mitra | planBroadcast.service.ts | BCC crew broadcast — no worker-to-worker visibility
// Track T1-3 — failed deliveries enqueue to wm_retry_queue_v1

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
import { enqueueShiftRetry } from "../../../../shared/shift/shiftRetryQueue";
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";

function retryErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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

  const safeTitle = title.trim() || "Project update";
  const safeBody = body.trim();

  const posts = new Map<string, string>();
  for (const workspaceId of group.memberWorkspaceIds) {
    const workspace = workspaceById.get(workspaceId);
    if (!workspace?.postId) {
      console.warn("[planBroadcast] Crew broadcast skipped — workspace or postId missing", {
        planId,
        workspaceId,
      });
      enqueueShiftRetry(
        "planner_crew_broadcast",
        {
          domain: "planner",
          step: "missing_post",
          planId,
          workspaceId,
          title: safeTitle,
          body: safeBody,
        },
        "workspace_or_postId_missing",
      );
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
      enqueueShiftRetry(
        "planner_crew_broadcast",
        {
          domain: "planner",
          step: "delivery_failed",
          planId,
          workspaceId,
          postId,
          title: safeTitle,
          body: safeBody,
        },
        retryErrorMessage(error),
      );
    }
  }

  if (delivered === 0) {
    return { ok: false, reason: "delivery_failed" };
  }

  plannerEmployeeNotifications.crewBroadcast(group.planName, ROUTE_PATHS.employeePlannerWorkspaces);

  const plan = demandPlannerStorage.getById(planId);
  appendPlannerAudit({
    planId,
    actor: "employer",
    actorMlId: plan?.legalEntityMlId,
    siteManagerId: plan?.siteManagerId,
    action: "crew_broadcast",
    summary: `Crew broadcast · ${delivered} workspace(s) · ${safeTitle}`,
    meta: { delivered, title: safeTitle },
  });

  return { ok: true, delivered };
}

/**
 * Targeted BCC — filter crew by role group workerMlIds.
 * roleGroupId === "all" → full crew broadcast.
 */
export function broadcastToPlanCrewByRoleGroup(
  planId: string,
  roleGroupId: string,
  title: string,
  body: string,
): PlanBroadcastResult {
  if (roleGroupId === "all" || !roleGroupId.trim()) {
    return broadcastToPlanCrew(planId, title, body);
  }

  const plan = demandPlannerStorage.getById(planId);
  const group = planBroadcastGroupStorage.getByPlanId(planId);
  if (!group) return { ok: false, reason: "no_group" };

  const role = (plan?.roleGroups ?? []).find((g) => g.id === roleGroupId);
  if (!role) return { ok: false, reason: "role_group_not_found" };

  const allowed = new Set(role.workerMlIds.map((w) => w.trim().toUpperCase()).filter(Boolean));
  if (allowed.size === 0) return { ok: false, reason: "no_members" };

  const workspaceById = new Map(
    readEmployeeWorkspaces().map((workspace) => [workspace.id, workspace]),
  );

  const safeTitle = title.trim() || "Project update";
  const safeBody = body.trim();
  const posts = new Map<string, string>();

  for (let i = 0; i < group.memberWorkspaceIds.length; i += 1) {
    const workspaceId = group.memberWorkspaceIds[i]!;
    const workerMlId = (group.memberWorkerMlIds[i] ?? "").trim().toUpperCase();
    if (!allowed.has(workerMlId)) continue;
    const workspace = workspaceById.get(workspaceId);
    if (!workspace?.postId) {
      enqueueShiftRetry(
        "planner_crew_broadcast",
        {
          domain: "planner",
          step: "missing_post_role",
          planId,
          workspaceId,
          roleGroupId,
          title: safeTitle,
          body: safeBody,
        },
        "workspace_or_postId_missing",
      );
      continue;
    }
    posts.set(workspaceId, workspace.postId);
  }

  if (posts.size === 0) return { ok: false, reason: "no_members" };

  let delivered = 0;
  for (const [workspaceId, postId] of posts) {
    try {
      broadcastToEmployeeWorkspace(postId, title, body);
      delivered += 1;
    } catch (error) {
      enqueueShiftRetry(
        "planner_crew_broadcast",
        {
          domain: "planner",
          step: "delivery_failed_role",
          planId,
          workspaceId,
          postId,
          roleGroupId,
          title: safeTitle,
          body: safeBody,
        },
        retryErrorMessage(error),
      );
    }
  }

  if (delivered === 0) return { ok: false, reason: "delivery_failed" };

  plannerEmployeeNotifications.crewBroadcast(group.planName, ROUTE_PATHS.employeePlannerWorkspaces);
  appendPlannerAudit({
    planId,
    actor: "employer",
    actorMlId: plan?.legalEntityMlId,
    siteManagerId: plan?.siteManagerId,
    action: "crew_broadcast",
    summary: `Role broadcast · ${role.label} · ${delivered} workspace(s) · ${safeTitle}`,
    meta: { delivered, title: safeTitle, roleGroupId, roleLabel: role.label },
  });

  return { ok: true, delivered };
}
