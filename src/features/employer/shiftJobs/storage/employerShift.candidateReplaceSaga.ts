// App name: Job Mitra
// File name: employerShift.candidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.candidateActions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  markEmployeeWorkspaceReplaced,
  readEmployeeApplications,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import type { EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import type { ReplaceCandidateSagaResult } from "./employerShift.candidateConfirm.types";
import { enqueueShiftRetry } from "../../../../shared/shift/shiftRetryQueue";

export function replaceConfirmedCandidate(
  post: ShiftPost,
  appId: string,
  reason: EmployeeShiftApplication["replacedReason"] = "other",
): ReplaceCandidateSagaResult {
  const apps = readEmployeeApplications();
  const target = apps.find((app) => app.id === appId && app.postId === post.id);

  if (!target) return { ok: false, reason: "not_found" };
  if (target.status !== "confirmed") return { ok: false, reason: "not_confirmed" };

  const priorApplications = apps;

  const now = Date.now();
  const next = apps.map((app) =>
    app.id === appId
      ? { ...app, status: "replaced" as const, replacedAt: now, replacedReason: reason }
      : app,
  );

  // Step 1 — Application write. TIER: CRITICAL.
  const appWrite = writeEmployeeApplications(next);
  if (!appWrite.ok) return { ok: false, reason: "application_write_error" };

  // Step 2 — Workspace mark replaced. TIER: CRITICAL. Compensation: revert Step 1.
  const wsResult = markEmployeeWorkspaceReplaced(post.id, reason);
  if (wsResult.ok === false && wsResult.reason === "storage_error") {
    writeEmployeeApplications(priorApplications);
    return { ok: false, reason: "workspace_write_error" };
  }
  // wsResult.reason === "not_found" is acceptable — workspace may not exist for all apps.

  // Step 3 — Replaced worker notification. TIER: IMPORTANT. Enqueued independently.
  try {
    notifyCrossRole({
      type: "SHIFT_ASSIGNMENT_REPLACED",
      domain: "shift",
      affectedUserRole: "employee",
      postId: post.id,
      appId,
      title: "Shift assignment replaced",
      body: `${post.companyName} replaced your assignment for ${post.jobName}.`,
      route: ROUTE_PATHS.employeeShiftApplications,
    });
  } catch {
    enqueueShiftRetry("notify_cross_role", { postId: post.id, appId, step: "replace_notify" });
  }

  // Step 4 — Backup candidate notification. TIER: IMPORTANT. Independent of Step 3.
  try {
    const nextBackupCandidate = post.waitingIds
      .map((id) =>
        apps.find((app) => app.id === id && app.postId === post.id && app.status === "waiting"),
      )
      .find((app): app is EmployeeShiftApplication => app !== undefined);

    if (nextBackupCandidate && post.settings?.notifyBackup !== false) {
      notifyCrossRole({
        type: "SHIFT_BACKUP_SLOT_OPEN",
        domain: "shift",
        affectedUserRole: "employee",
        postId: post.id,
        appId: nextBackupCandidate.id,
        title: "Backup slot may open",
        body: `${post.companyName} has released a confirmed slot for ${post.jobName}. Stay ready while the employer reviews backups.`,
        route: ROUTE_PATHS.employeeShiftApplications,
      });
    }
  } catch {
    enqueueShiftRetry("notify_cross_role", { postId: post.id, appId, step: "backup_notify" });
  }

  return {
    ok: true,
    post: {
      ...post,
      confirmedIds: post.confirmedIds.filter((id) => id !== appId),
      waitingIds: post.waitingIds.filter((id) => id !== appId),
      shortlistIds: post.shortlistIds.filter((id) => id !== appId),
    },
  };
}
