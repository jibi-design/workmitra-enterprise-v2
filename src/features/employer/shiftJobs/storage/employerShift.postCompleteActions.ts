// App name: Job Mitra
// File name: employerShift.postCompleteActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.postCompleteActions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  finalizeVaultShiftHistoryForPost,
  recordShiftCompletedInVault,
} from "../../../shared/workVault/vaultPublic";
import { notifyCrossRole } from "../../../pulse/pulseEventBridge";
import { notifyShiftBothPleaseRate } from "../services/shiftCompletionNotifications";
import type { ShiftWorkspace, ShiftWorkspaceUpdate } from "../types/shiftWorkspaceTypes";
import { wsId } from "../types/shiftWorkspaceTypes";
import { getEmpPostsKey } from "./employerShift.keys";
import { readEmployerPosts, syncToEmployeeSearch } from "./employerShift.postStorage";
import { notifyEmployerShiftPostsChanged, safeWrite } from "./employerShift.utils";
import { getWorkspacesSnapshot, saveWorkspaces } from "./shiftWorkspaceStorage";
import { enqueueShiftRetry } from "../../../../shared/shift/shiftRetryQueue";
import { syncCompletedShiftToServer } from "../../../shift/services/syncCompletedShiftToServer";

export type CompletePostSagaResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "already_completed" | "post_write_error" | "vault_finalize_error";
    };

export type MarkShiftWorkspaceCompletedResult =
  | { ok: true; postCompleted: boolean }
  | {
      ok: false;
      reason: "not_found" | "already_completed" | "terminal_status" | "workspace_write_error";
    };

function areAllPostWorkspacesCompleted(postId: string, workspaces: ShiftWorkspace[]): boolean {
  const postWorkspaces = workspaces.filter((workspace) => workspace.postId === postId);

  return (
    postWorkspaces.length > 0 &&
    postWorkspaces.every((workspace) => workspace.status === "completed")
  );
}

export function markShiftWorkspaceCompleted(
  workspaceId: string,
): MarkShiftWorkspaceCompletedResult {
  const priorWorkspaces = getWorkspacesSnapshot();
  const workspace = priorWorkspaces.find((item) => item.id === workspaceId);

  if (!workspace) return { ok: false, reason: "not_found" };
  if (workspace.status === "completed") return { ok: false, reason: "already_completed" };
  if (
    workspace.status === "left" ||
    workspace.status === "replaced" ||
    workspace.status === "cancelled"
  ) {
    return { ok: false, reason: "terminal_status" };
  }

  const now = Date.now();
  const update: ShiftWorkspaceUpdate = {
    id: wsId("u"),
    createdAt: now,
    kind: "system",
    title: "Marked completed",
    body: "Employer marked this assignment as completed.",
  };

  const nextWorkspaces = priorWorkspaces.map((item) =>
    item.id !== workspaceId
      ? item
      : {
          ...item,
          status: "completed" as const,
          updates: [update, ...item.updates].slice(0, 50),
          lastActivityAt: now,
          unreadCount: Math.max(0, item.unreadCount) + 1,
        },
  );

  try {
    saveWorkspaces(nextWorkspaces);
  } catch {
    return { ok: false, reason: "workspace_write_error" };
  }

  const completedWorkspace = nextWorkspaces.find((item) => item.id === workspaceId);
  if (!completedWorkspace) {
    return { ok: false, reason: "workspace_write_error" };
  }

  recordShiftCompletedInVault(completedWorkspace, now);

  notifyShiftBothPleaseRate({
    employeeName: completedWorkspace.workerName?.trim() || "Worker",
    companyName: completedWorkspace.companyName,
    jobName: completedWorkspace.jobName,
    workspaceId: completedWorkspace.id,
  });

  let postCompleted = false;

  if (areAllPostWorkspacesCompleted(completedWorkspace.postId, nextWorkspaces)) {
    // Workspaces already received please-rate on mark-complete — do not re-fire in saga.
    const postResult = completePostSaga(completedWorkspace.postId, {
      notifyPleaseRate: false,
    });
    postCompleted = postResult.ok;
  }

  void syncCompletedShiftToServer(completedWorkspace, postCompleted);

  return { ok: true, postCompleted };
}

export function completePostSaga(
  postId: string,
  options?: { readonly notifyPleaseRate?: boolean },
): CompletePostSagaResult {
  const notifyPleaseRate = options?.notifyPleaseRate !== false;
  const priorPosts = readEmployerPosts();
  const target = priorPosts.find((post) => post.id === postId);

  if (!target) return { ok: false, reason: "not_found" };
  if (target.status === "completed") return { ok: false, reason: "already_completed" };

  const nextPosts = priorPosts.map((post) =>
    post.id === postId ? { ...post, status: "completed" as const } : post,
  );

  // Step 1 — CRITICAL: mark post completed.
  const postWrite = safeWrite(getEmpPostsKey(), nextPosts);
  if (!postWrite.ok) return { ok: false, reason: "post_write_error" };
  notifyEmployerShiftPostsChanged();

  // Step 2 — ADVISORY: sync employee search index.
  try {
    syncToEmployeeSearch(nextPosts);
  } catch {
    // ADVISORY — continue.
  }

  const workspaces = getWorkspacesSnapshot().filter((workspace) => workspace.postId === postId);

  // Step 3 — CRITICAL: finalize verified work history in vault BEFORE please-rate.
  // Vault failure rolls posts back; notifications must not fire until vault succeeds
  // (otherwise please-rate / workspace alerts would orphan after rollback).
  const vaultResult = finalizeVaultShiftHistoryForPost(postId, workspaces);
  if (!vaultResult.ok) {
    safeWrite(getEmpPostsKey(), priorPosts);
    notifyEmployerShiftPostsChanged();

    try {
      syncToEmployeeSearch(priorPosts);
    } catch {
      // ADVISORY rollback — best effort.
    }

    return { ok: false, reason: "vault_finalize_error" };
  }

  // Step 4 — IMPORTANT: rating notifications only after vault success.
  // Skipped when caller already notified (markShiftWorkspaceCompleted path).
  if (notifyPleaseRate) {
    for (const workspace of workspaces) {
      if (workspace.status !== "completed") continue;

      try {
        notifyShiftBothPleaseRate({
          employeeName: workspace.workerName?.trim() || "Worker",
          companyName: workspace.companyName,
          jobName: workspace.jobName,
          workspaceId: workspace.id,
        });
      } catch {
        enqueueShiftRetry("post_complete_side_effect", {
          postId,
          workspaceId: workspace.id,
          step: "please_rate",
        });
      }
    }
  }

  // Step 5 — IMPORTANT: pulse on full success.
  try {
    const postDashboardRoute = ROUTE_PATHS.employerShiftPostDashboard.replace(":postId", postId);

    notifyCrossRole({
      type: "SHIFT_POST_COMPLETED",
      domain: "shift",
      affectedUserRole: "employer",
      postId,
      severity: "success",
      title: "Shift completed",
      body: `${target.jobName} is marked complete. Work history records are finalized.`,
      route: postDashboardRoute,
    });
  } catch {
    enqueueShiftRetry("post_complete_side_effect", { postId, step: "completed_pulse" });
  }

  return { ok: true };
}
