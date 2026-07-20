// Job Mitra | plannerCancel.service.ts | P1 atomic plan cancel (Section 6.8)

import {
  markEmployeeWorkspaceCancelled,
  readEmployeeApplications,
  writeEmployeeApplications,
} from "../../shiftJobs/storage/employerShift.employeeBridge";
import {
  getEmployerShiftPosts,
  updateEmployerShiftPost,
} from "../../shiftJobs/storage/employerShift.postActions";
import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.types";
import { plannerEmployeeNotifications } from "../../../employee/planner/services/plannerEmployeeNotifications.service";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";
import { plannerDiarySyncService } from "../../../employee/planner/services/plannerDiarySync.service";

const PENDING: EmployeeShiftApplication["status"][] = ["applied", "shortlisted", "waiting"];

export type PlannerCancelResult =
  | {
      ok: true;
      closedPostIds: string[];
      closedApplicationIds: string[];
      cancelledConfirmedApplicationIds: string[];
    }
  | { ok: false; reason: "not_found" | "not_active" };

function isPlannerPlanPost(
  postId: string,
  planId: string,
  posts: ReturnType<typeof getEmployerShiftPosts>,
): boolean {
  const post = posts.find((item) => item.id === postId);
  return Boolean(post && post.source === "planner" && post.planId === planId);
}

export function cancelActivePlan(planId: string, reason?: string): PlannerCancelResult {
  const plan = demandPlannerStorage.getById(planId);
  if (!plan) return { ok: false, reason: "not_found" };
  if (plan.status !== "active") return { ok: false, reason: "not_active" };

  demandPlannerStorage.cancel(planId, reason);
  plannerPublicIndex.cancel(planId);
  plannerDiarySyncService.markPlanCancelled(planId);

  const posts = getEmployerShiftPosts();
  const postIds = new Set(
    plan.slots.map((s) => s.postId).filter((id): id is string => Boolean(id)),
  );

  const closedPostIds: string[] = [];

  for (const postId of postIds) {
    const post = posts.find((p) => p.id === postId);
    if (!post || post.source !== "planner") continue;

    const filled = post.confirmedIds.length >= post.vacancies && post.vacancies > 0;
    if (filled) continue;

    updateEmployerShiftPost(postId, { status: "cancelled" });
    closedPostIds.push(postId);
  }

  const apps = readEmployeeApplications();
  const closedApplicationIds: string[] = [];
  const cancelledConfirmedApplicationIds: string[] = [];
  const now = Date.now();

  const nextApps = apps.map((app) => {
    if (!postIds.has(app.postId) || !PENDING.includes(app.status)) return app;

    const post = posts.find((p) => p.id === app.postId);
    if (!post || post.source !== "planner" || post.planId !== planId) return app;

    if (post.confirmedIds.includes(app.id)) return app;

    closedApplicationIds.push(app.id);
    return {
      ...app,
      status: "rejected" as const,
      notes: { ...app.notes, planClosed: "plan_cancelled" },
      replacedAt: now,
    };
  });

  if (closedApplicationIds.length > 0) {
    writeEmployeeApplications(nextApps);

    try {
      plannerEmployeeNotifications.planCancelled(plan.name, planId);
    } catch (error) {
      console.warn("[plannerCancel] Plan cancelled notification failed for pending applications", {
        planId,
        closedApplicationCount: closedApplicationIds.length,
        error,
      });
      // TODO: enqueue to wm_retry_queue_v1 when retry infrastructure exists.
    }
  }

  for (const app of apps) {
    if (!postIds.has(app.postId)) continue;
    if (!isPlannerPlanPost(app.postId, planId, posts)) continue;

    const post = posts.find((item) => item.id === app.postId);
    if (!post) continue;

    const isConfirmed = app.status === "confirmed" || post.confirmedIds.includes(app.id);
    if (!isConfirmed) continue;

    const workspaceResult = markEmployeeWorkspaceCancelled(app.postId, app.id);
    if (!workspaceResult.ok) {
      console.warn("[plannerCancel] Failed to mark confirmed worker workspace cancelled", {
        planId,
        postId: app.postId,
        appId: app.id,
        reason: workspaceResult.reason,
      });
      // TODO: enqueue to wm_retry_queue_v1 when retry infrastructure exists.
      continue;
    }

    try {
      plannerEmployeeNotifications.planCancelledConfirmedWorker(
        plan.name,
        post.jobName,
        planId,
        app.postId,
        app.id,
      );
    } catch (error) {
      console.warn("[plannerCancel] Confirmed worker cancellation notification failed", {
        planId,
        postId: app.postId,
        appId: app.id,
        error,
      });
      // TODO: enqueue to wm_retry_queue_v1 when retry infrastructure exists.
    }

    cancelledConfirmedApplicationIds.push(app.id);
  }

  return {
    ok: true,
    closedPostIds,
    closedApplicationIds,
    cancelledConfirmedApplicationIds,
  };
}
