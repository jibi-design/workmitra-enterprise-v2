// App name: Job Mitra
// File name: employerShift.candidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.candidateActions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  enrollConfirmedWorkerInPlanGroup,
  fmtPlanDate,
  unenrollWorkerFromPlanGroup,
} from "../../../shared/planner/ports/plannerShiftJobsBridge";
import { plannerEmployeeNotifications } from "../../../shared/planner/plannerEmployeeBridge";
import { plannerDiarySyncService } from "../../../shared/planner/plannerEmployeeBridge";
import {
  createOrUpdateEmployeeWorkspace,
  readEmployeeApplications,
  readEmployeeWorkspaces,
  restoreEmployeeWorkspaces,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import { getEmployerShiftPost } from "./employerShift.postActions.crud";
import type { ApplicantStatus, EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import type { ConfirmCandidateSagaResult } from "./employerShift.candidateConfirm.types";
import { uniq } from "./employerShift.utils";
import { enqueueShiftRetry } from "../../../../shared/shift/shiftRetryQueue";

export function confirmCandidate(post: ShiftPost, appId: string): ConfirmCandidateSagaResult {
  // Re-read for vacancy integrity if caller passed a stale snapshot
  const livePost = getEmployerShiftPost(post.id) ?? post;
  const apps = readEmployeeApplications();
  const target = apps.find((app) => app.id === appId && app.postId === livePost.id);
  const vacancyLimit = getSafeVacancyLimit(livePost.vacancies);

  if (!target) return { ok: false, reason: "not_found" };

  if (target.status === "confirmed" || livePost.confirmedIds.includes(appId)) {
    return { ok: false, reason: "already_confirmed" };
  }

  if (!canConfirmCandidate(target.status)) {
    return { ok: false, reason: "not_confirmable" };
  }

  if (vacancyLimit <= 0 || livePost.confirmedIds.length >= vacancyLimit) {
    return { ok: false, reason: "vacancy_full" };
  }

  // Capture pre-mutation state for compensation
  const priorApplications = apps;
  const priorWorkspaces = readEmployeeWorkspaces();

  const resolvedWorkerMlId = target.profileSnapshot?.uniqueId?.trim() || undefined;
  const enrichedTarget: EmployeeShiftApplication = resolvedWorkerMlId
    ? { ...target, profileSnapshot: { ...target.profileSnapshot, uniqueId: resolvedWorkerMlId } }
    : target;

  // Step 1 — Application status write. TIER: CRITICAL.
  const appWrite = writeEmployeeApplications(updateApplicationStatus(apps, appId, "confirmed"));
  if (!appWrite.ok) return { ok: false, reason: "application_write_error" };

  // Step 2 — Workspace create/update. TIER: CRITICAL. Compensation: revert Step 1.
  const wsResult = createOrUpdateEmployeeWorkspace(livePost, enrichedTarget);
  if (!wsResult.ok) {
    writeEmployeeApplications(priorApplications);
    if (wsResult.reason === "missing_muid") {
      return { ok: false, reason: "missing_muid" };
    }
    return { ok: false, reason: "workspace_error" };
  }
  const workspaceId = wsResult.workspaceId;

  // Step 3 — Plan group enrollment. TIER: IMPORTANT. Compensation: revert Steps 1+2.
  const planResult = enrollConfirmedWorkerInPlanGroup(livePost, enrichedTarget);
  if (!planResult.ok && planResult.reason === "storage_error") {
    enqueueShiftRetry("plan_enroll", { postId: livePost.id, appId });
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    return { ok: false, reason: "plan_error" };
  }

  // Step 4 — Diary sync. TIER: CRITICAL. Compensation: revert Steps 1+2+3.
  const diaryResult = plannerDiarySyncService.upsertConfirmedDay(livePost, enrichedTarget);
  if (!diaryResult.ok) {
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    unenrollWorkerFromPlanGroup(livePost, enrichedTarget);
    return { ok: false, reason: "diary_error" };
  }

  // Step 5 — Notification. TIER: IMPORTANT. No compensation needed; fire-and-retry.
  try {
    if (livePost.source === "planner" && livePost.planId) {
      const dateLabel = livePost.planSlotDate
        ? fmtPlanDate(livePost.planSlotDate)
        : livePost.jobName;
      const workspaceRoute = ROUTE_PATHS.employeePlannerWorkspace.replace(
        ":workspaceId",
        workspaceId,
      );
      plannerEmployeeNotifications.confirmedDay(livePost.jobName, dateLabel, workspaceRoute);
    } else {
      const workspaceRoute = ROUTE_PATHS.employeeShiftWorkspace.replace(
        ":workspaceId",
        workspaceId,
      );
      notifyCrossRole({
        type: "SHIFT_EMPLOYEE_SELECTED",
        domain: "shift",
        affectedUserRole: "employee",
        postId: livePost.id,
        appId,
        severity: "urgent",
        title: "You are selected",
        body: `${livePost.companyName} confirmed you for ${livePost.jobName}. Your workspace is ready.`,
        route: workspaceRoute,
      });
    }
  } catch {
    // TIER: IMPORTANT — notification failed; saga result is still ok.
    enqueueShiftRetry("notify_cross_role", {
      postId: livePost.id,
      appId,
      step: "confirm_selected",
    });
  }

  // P0: formal Shift Ops membership MUST be provisioned by caller BEFORE this saga.
  // Do not best-effort provision here (orphan confirmed workspaces forbidden).

  return {
    ok: true,
    workspaceId,
    post: {
      ...livePost,
      confirmedIds: uniq([...livePost.confirmedIds, appId]),
      shortlistIds: livePost.shortlistIds.filter((id) => id !== appId),
      waitingIds: livePost.waitingIds.filter((id) => id !== appId),
      rejectedIds: livePost.rejectedIds.filter((id) => id !== appId),
    },
  };
}

function updateApplicationStatus(
  apps: EmployeeShiftApplication[],
  appId: string,
  status: ApplicantStatus,
): EmployeeShiftApplication[] {
  return apps.map((app) => (app.id === appId ? { ...app, status } : app));
}

function canConfirmCandidate(status: ApplicantStatus): boolean {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}

function getSafeVacancyLimit(vacancies: number): number {
  if (!Number.isFinite(vacancies)) {
    return 0;
  }

  return Math.max(0, Math.floor(vacancies));
}
