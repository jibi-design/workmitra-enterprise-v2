// App name: Job Mitra
// Shift retry queue drain — focus / online heal path (Wave-2: real replay only, no soft-ack)

import {
  appendShiftRetryDeadLetter,
  drainShiftRetryQueue,
  isShiftRetryOpReplayable,
  type ShiftRetryQueueItem,
} from "./shiftRetryQueue";

let installed = false;
let draining = false;

async function replayPlanEnroll(
  context: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const postId = context.postId?.trim() ?? "";
  const appId = context.appId?.trim() ?? "";
  if (!postId || !appId) return { ok: false, error: "missing_post_or_app" };

  const { getEmployerShiftPost } =
    await import("../../features/employer/shiftJobs/storage/employerShift.postActions.crud");
  const { readEmployeeApplications } =
    await import("../../features/employer/shiftJobs/storage/employerShift.employeeBridge");
  const { enrollConfirmedWorkerInPlanGroup } =
    await import("../../features/shared/planner/ports/plannerShiftJobsBridge");

  const post = getEmployerShiftPost(postId);
  const app = readEmployeeApplications().find((a) => a.id === appId && a.postId === postId);
  if (!post || !app) return { ok: false, error: "post_or_app_missing" };

  const result = enrollConfirmedWorkerInPlanGroup(post, app);
  if (!result.ok && result.reason === "storage_error") {
    return { ok: false, error: "plan_enroll_storage_error" };
  }
  // skipped (non-planner / missing workspace) is a successful no-op replay
  return { ok: true };
}

async function replayRatingPoints(
  context: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const workerMlId = context.workerMlId?.trim() ?? "";
  const jobId = context.jobId?.trim() ?? "";
  if (!workerMlId || !jobId) return { ok: false, error: "missing_worker_or_job" };

  const { workerPointsStorage, WorkerPointsStorageWriteError } =
    await import("../rating/workerPointsStorage");
  try {
    workerPointsStorage.applyEvent(workerMlId, "shift_complete", jobId);
    return { ok: true };
  } catch (error) {
    if (error instanceof WorkerPointsStorageWriteError) {
      return { ok: false, error: "points_storage_error" };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "rating_points_error",
    };
  }
}

async function replayPlannerWorkspaceCancel(
  context: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const postId = context.postId?.trim() ?? "";
  const appId = context.appId?.trim() ?? "";
  if (!postId || !appId) return { ok: false, error: "missing_post_or_app" };

  const { markEmployeeWorkspaceCancelled } =
    await import("../../features/employer/shiftJobs/storage/employerShift.employeeBridge");
  const result = markEmployeeWorkspaceCancelled(postId, appId);
  if (!result.ok) return { ok: false, error: result.reason };
  return { ok: true };
}

async function replayPlannerCancelNotify(
  context: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const step = context.step?.trim() ?? "";
  const planId = context.planId?.trim() ?? "";
  const planName = context.planName?.trim() || "Plan";
  if (!planId) return { ok: false, error: "missing_planId" };

  const { plannerEmployeeNotifications } =
    await import("../../features/shared/planner/plannerEmployeeBridge");

  try {
    if (step === "plan_cancelled_pending") {
      plannerEmployeeNotifications.planCancelled(planName, planId);
      return { ok: true };
    }
    if (step === "plan_cancelled_confirmed_worker") {
      const postId = context.postId?.trim() ?? "";
      const appId = context.appId?.trim() ?? "";
      const jobName = context.jobName?.trim() || "Shift";
      if (!postId || !appId) return { ok: false, error: "missing_post_or_app" };
      plannerEmployeeNotifications.planCancelledConfirmedWorker(
        planName,
        jobName,
        planId,
        postId,
        appId,
      );
      return { ok: true };
    }
    return { ok: false, error: `unknown_cancel_notify_step:${step || "none"}` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "planner_cancel_notify_error",
    };
  }
}

async function replayPlannerCrewBroadcast(
  context: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const postId = context.postId?.trim() ?? "";
  const title = context.title?.trim() || "Project update";
  const body = context.body?.trim() ?? "";
  if (!postId) {
    // missing_post steps were audit-only; abandon cleanly to dead letter via handler fail→eventually DL
    if (context.step === "missing_post") {
      return { ok: false, error: "missing_post_unrecoverable" };
    }
    return { ok: false, error: "missing_postId" };
  }

  const { broadcastToEmployeeWorkspace } =
    await import("../../features/employer/shiftJobs/storage/employerShift.employeeBridge");
  try {
    broadcastToEmployeeWorkspace(postId, title, body);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "crew_broadcast_error",
    };
  }
}

async function handleShiftRetryItem(
  item: ShiftRetryQueueItem,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, error: "offline" };
  }

  if (!isShiftRetryOpReplayable(item.op)) {
    appendShiftRetryDeadLetter(item, "non_replayable_on_drain");
    // Count as handled removal — drainShiftRetryQueue also dead-letters non-replayable;
    // returning ok would double-count. Return fail with sentinel that drain treats...
    // Actually drain already dead-letters non-replayable before calling handler.
    // This branch is defensive only.
    return { ok: false, error: "non_replayable_op" };
  }

  switch (item.op) {
    case "site_membership_provision": {
      const { drainSiteMembershipProvisionItem } =
        await import("../../features/shiftOps/services/membershipBridge.service");
      return drainSiteMembershipProvisionItem(item.context);
    }
    case "rating_points":
      return replayRatingPoints(item.context);
    case "plan_enroll":
      return replayPlanEnroll(item.context);
    case "planner_workspace_cancel":
      return replayPlannerWorkspaceCancel(item.context);
    case "planner_cancel_notify":
      return replayPlannerCancelNotify(item.context);
    case "planner_crew_broadcast": {
      const result = await replayPlannerCrewBroadcast(item.context);
      // Unrecoverable missing post — abandon to dead letter immediately
      if (!result.ok && result.error === "missing_post_unrecoverable") {
        appendShiftRetryDeadLetter(item, "missing_post_unrecoverable");
        return { ok: true }; // remove from live queue; already in DL
      }
      return result;
    }
    default:
      appendShiftRetryDeadLetter(item, `unhandled_op:${item.op}`);
      return { ok: true };
  }
}

export async function runShiftRetryQueueDrain(): Promise<void> {
  if (draining) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  draining = true;
  try {
    await drainShiftRetryQueue(handleShiftRetryItem);
  } finally {
    draining = false;
  }
}

/** Idempotent install — call once from app bootstrap. */
export function installShiftRetryQueueDrain(): () => void {
  if (typeof window === "undefined" || installed) {
    return () => undefined;
  }
  installed = true;

  const onFocus = () => {
    void runShiftRetryQueueDrain();
  };
  const onOnline = () => {
    void runShiftRetryQueueDrain();
  };
  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      void runShiftRetryQueueDrain();
    }
  };

  window.addEventListener("focus", onFocus);
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisibility);
  void runShiftRetryQueueDrain();

  return () => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisibility);
    installed = false;
  };
}
