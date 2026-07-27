// App name: Job Mitra
// File name: employerShift.candidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.candidateActions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  enrollConfirmedWorkerInPlanGroup,
  unenrollWorkerFromPlanGroup,
} from "../../../shared/planner/ports/plannerShiftJobsBridge";
import { plannerDiarySyncService } from "../../../shared/planner/plannerEmployeeBridge";
import {
  createOrUpdateEmployeeWorkspace,
  readEmployeeApplications,
  readEmployeeWorkspaces,
  restoreEmployeeWorkspaces,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import { getEmployerShiftPost } from "./employerShift.postActions.crud";
import type { EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import type { ConfirmDirectInviteSagaResult } from "./employerShift.candidateConfirm.types";
import { uniq } from "./employerShift.utils";
import { enqueueShiftRetry } from "../../../../shared/shift/shiftRetryQueue";

export function confirmDirectInviteCandidate(
  post: ShiftPost,
  params: {
    workerMlId: string;
    workerName: string;
    city?: string;
    experience?: string;
    skills?: string[];
    languages?: string[];
  },
): ConfirmDirectInviteSagaResult {
  const livePost = getEmployerShiftPost(post.id) ?? post;
  // Pre-flight — no mutations
  const apps = readEmployeeApplications();
  const vacancyLimit = getSafeVacancyLimit(livePost.vacancies);

  if (vacancyLimit <= 0 || livePost.confirmedIds.length >= vacancyLimit) {
    return { ok: false, reason: "vacancy_full" };
  }

  const workerMlId = params.workerMlId.trim().toUpperCase();
  const existing = apps.find(
    (app) =>
      app.postId === livePost.id &&
      app.profileSnapshot?.uniqueId?.trim().toUpperCase() === workerMlId &&
      app.status !== "withdrawn",
  );

  if (
    existing &&
    (existing.status === "confirmed" || livePost.confirmedIds.includes(existing.id))
  ) {
    return { ok: false, reason: "already_confirmed" };
  }

  // Capture pre-mutation state for compensation
  const priorApplications = apps;
  const priorWorkspaces = readEmployeeWorkspaces();

  const now = Date.now();
  let appId: string;
  let application: EmployeeShiftApplication;

  // Step 1 — Application write. TIER: CRITICAL.
  if (existing && existing.status !== "replaced") {
    appId = existing.id;
    application = {
      ...existing,
      status: "confirmed",
      profileSnapshot: {
        ...existing.profileSnapshot,
        uniqueId: workerMlId,
        fullName: params.workerName.trim() || existing.profileSnapshot?.fullName,
        city: params.city ?? existing.profileSnapshot?.city,
        experience: params.experience ?? existing.profileSnapshot?.experience,
        skills: params.skills ?? existing.profileSnapshot?.skills,
        languages: params.languages ?? existing.profileSnapshot?.languages,
      },
    };
    const appWrite = writeEmployeeApplications(
      apps.map((app) => (app.id === appId ? application : app)),
    );
    if (!appWrite.ok) return { ok: false, reason: "application_write_error" };
  } else {
    appId = `app_${Math.random().toString(16).slice(2)}_${now.toString(16)}`;
    application = {
      id: appId,
      postId: livePost.id,
      createdAt: now,
      status: "confirmed",
      profileSnapshot: {
        uniqueId: workerMlId,
        fullName: params.workerName.trim() || undefined,
        city: params.city,
        experience: params.experience,
        skills: params.skills,
        languages: params.languages,
      },
      mustHaveAnswers: {},
      goodToHaveAnswers: {},
      notes: {},
    };
    const appWrite = writeEmployeeApplications([application, ...apps]);
    if (!appWrite.ok) return { ok: false, reason: "application_write_error" };
  }

  // Step 2 — Workspace. TIER: CRITICAL. Compensation: revert Step 1.
  const wsResult = createOrUpdateEmployeeWorkspace(livePost, application);
  if (!wsResult.ok) {
    writeEmployeeApplications(priorApplications);
    if (wsResult.reason === "missing_muid") {
      return { ok: false, reason: "missing_muid" };
    }
    return { ok: false, reason: "workspace_error" };
  }
  const workspaceId = wsResult.workspaceId;

  // Step 3 — Plan group enrollment. TIER: IMPORTANT. Compensation: revert Steps 1+2.
  const planResult = enrollConfirmedWorkerInPlanGroup(livePost, application);
  if (!planResult.ok && planResult.reason === "storage_error") {
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    return { ok: false, reason: "plan_error" };
  }

  // Step 4 — Diary sync. TIER: CRITICAL. Compensation: revert Steps 1+2+3.
  const diaryResult = plannerDiarySyncService.upsertConfirmedDay(livePost, application);
  if (!diaryResult.ok) {
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    unenrollWorkerFromPlanGroup(livePost, application);
    return { ok: false, reason: "diary_error" };
  }

  // Step 5 — Notification. TIER: IMPORTANT. GAP-015 fix: directInvite path was missing this.
  try {
    const workspaceRoute = ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspaceId);
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
  } catch {
    // TIER: IMPORTANT — notification failed; saga result is still ok.
    enqueueShiftRetry("direct_invite_side_effect", {
      postId: livePost.id,
      appId,
      step: "invite_selected_notify",
    });
  }

  return {
    ok: true,
    appId,
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

function getSafeVacancyLimit(vacancies: number): number {
  if (!Number.isFinite(vacancies)) {
    return 0;
  }

  return Math.max(0, Math.floor(vacancies));
}
