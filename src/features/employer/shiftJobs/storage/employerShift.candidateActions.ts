// App name: Job Mitra
// File name: employerShift.candidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.candidateActions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  enrollConfirmedWorkerInPlanGroup,
  unenrollWorkerFromPlanGroup,
} from "../../planner/services/planBroadcast.service";
import { fmtPlanDate } from "../../planner/helpers/plannerDateFormat.helpers";
import { plannerEmployeeNotifications } from "../../../employee/planner/services/plannerEmployeeNotifications.service";
import { plannerDiarySyncService } from "../../../employee/planner/services/plannerDiarySync.service";
import {
  createOrUpdateEmployeeWorkspace,
  markEmployeeWorkspaceReplaced,
  readEmployeeApplications,
  readEmployeeWorkspaces,
  restoreEmployeeWorkspaces,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import type { ApplicantStatus, EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import { uniq } from "./employerShift.utils";

export function moveCandidateToShortlist(
  post: ShiftPost,
  appId: string,
): {
  post: ShiftPost;
  changed: boolean;
} {
  const apps = readEmployeeApplications();
  const target = apps.find((app) => app.id === appId && app.postId === post.id);

  if (!target) return { post, changed: false };
  if (!canMoveCandidate(target.status)) return { post, changed: false };

  writeEmployeeApplications(updateApplicationStatus(apps, appId, "shortlisted"));

  notifyCrossRole({
    type: "SHIFT_EMPLOYEE_SHORTLISTED",
    domain: "shift",
    affectedUserRole: "employee",
    postId: post.id,
    appId,
    severity: "urgent",
    title: "You are shortlisted",
    body: `${post.companyName} shortlisted you for ${post.jobName}.`,
    route: `/employee/shift/post/${post.id}`,
  });

  return {
    post: {
      ...post,
      shortlistIds: uniq([...post.shortlistIds, appId]),
      waitingIds: post.waitingIds.filter((id) => id !== appId),
      rejectedIds: post.rejectedIds.filter((id) => id !== appId),
    },
    changed: true,
  };
}

export function moveCandidateToWaiting(
  post: ShiftPost,
  appId: string,
): {
  post: ShiftPost;
  changed: boolean;
} {
  const apps = readEmployeeApplications();
  const target = apps.find((app) => app.id === appId && app.postId === post.id);

  if (!target) return { post, changed: false };
  if (!canMoveCandidate(target.status)) return { post, changed: false };

  writeEmployeeApplications(updateApplicationStatus(apps, appId, "waiting"));

  notifyCrossRole({
    type: "SHIFT_EMPLOYEE_WAITLISTED",
    domain: "shift",
    affectedUserRole: "employee",
    postId: post.id,
    appId,
    severity: "warning",
    title: "You are on the waiting list",
    body: `${post.companyName} added you to the waiting list for ${post.jobName}.`,
    route: `/employee/shift/post/${post.id}`,
  });

  return {
    post: {
      ...post,
      waitingIds: uniq([...post.waitingIds, appId]),
      shortlistIds: post.shortlistIds.filter((id) => id !== appId),
      rejectedIds: post.rejectedIds.filter((id) => id !== appId),
    },
    changed: true,
  };
}

export function rejectCandidate(
  post: ShiftPost,
  appId: string,
): {
  post: ShiftPost;
  changed: boolean;
} {
  const apps = readEmployeeApplications();
  const target = apps.find((app) => app.id === appId && app.postId === post.id);

  if (!target) return { post, changed: false };
  if (target.status === "confirmed") return { post, changed: false };

  writeEmployeeApplications(updateApplicationStatus(apps, appId, "rejected"));

  notifyCrossRole({
    type: "SHIFT_APPLICATION_REJECTED",
    domain: "shift",
    affectedUserRole: "employee",
    postId: post.id,
    appId,
    title: "Application update",
    body: `${post.companyName} did not select you for ${post.jobName}.`,
    route: ROUTE_PATHS.employeeShiftApplications,
  });

  return {
    post: {
      ...post,
      rejectedIds: uniq([...post.rejectedIds, appId]),
      shortlistIds: post.shortlistIds.filter((id) => id !== appId),
      waitingIds: post.waitingIds.filter((id) => id !== appId),
    },
    changed: true,
  };
}

// ── Saga result types ────────────────────────────────────────────────────────

export type ConfirmCandidateSagaResult =
  | { ok: true; post: ShiftPost; workspaceId: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "not_confirmable"
        | "already_confirmed"
        | "vacancy_full"
        | "application_write_error"
        | "workspace_error"
        | "missing_muid"
        | "plan_error"
        | "diary_error";
    };

export type ConfirmDirectInviteSagaResult =
  | { ok: true; post: ShiftPost; appId: string; workspaceId: string }
  | {
      ok: false;
      reason:
        | "vacancy_full"
        | "already_confirmed"
        | "application_write_error"
        | "workspace_error"
        | "missing_muid"
        | "plan_error"
        | "diary_error";
    };

export type ReplaceCandidateSagaResult =
  | { ok: true; post: ShiftPost }
  | {
      ok: false;
      reason: "not_found" | "not_confirmed" | "application_write_error" | "workspace_write_error";
    };

export function confirmDirectInviteCandidate(
  post: ShiftPost,
  params: {
    workerWmId: string;
    workerName: string;
    city?: string;
    experience?: string;
    skills?: string[];
    languages?: string[];
  },
): ConfirmDirectInviteSagaResult {
  // Pre-flight — no mutations
  const apps = readEmployeeApplications();
  const vacancyLimit = getSafeVacancyLimit(post.vacancies);

  if (vacancyLimit <= 0 || post.confirmedIds.length >= vacancyLimit) {
    return { ok: false, reason: "vacancy_full" };
  }

  const workerWmId = params.workerWmId.trim().toUpperCase();
  const existing = apps.find(
    (app) =>
      app.postId === post.id &&
      app.profileSnapshot?.uniqueId?.trim().toUpperCase() === workerWmId &&
      app.status !== "withdrawn",
  );

  if (existing && (existing.status === "confirmed" || post.confirmedIds.includes(existing.id))) {
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
        uniqueId: workerWmId,
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
      postId: post.id,
      createdAt: now,
      status: "confirmed",
      profileSnapshot: {
        uniqueId: workerWmId,
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
  const wsResult = createOrUpdateEmployeeWorkspace(post, application);
  if (!wsResult.ok) {
    writeEmployeeApplications(priorApplications);
    if (wsResult.reason === "missing_muid") {
      return { ok: false, reason: "missing_muid" };
    }
    return { ok: false, reason: "workspace_error" };
  }
  const workspaceId = wsResult.workspaceId;

  // Step 3 — Plan group enrollment. TIER: IMPORTANT. Compensation: revert Steps 1+2.
  const planResult = enrollConfirmedWorkerInPlanGroup(post, application);
  if (!planResult.ok && planResult.reason === "storage_error") {
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    return { ok: false, reason: "plan_error" };
  }

  // Step 4 — Diary sync. TIER: CRITICAL. Compensation: revert Steps 1+2+3.
  const diaryResult = plannerDiarySyncService.upsertConfirmedDay(post, application);
  if (!diaryResult.ok) {
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    unenrollWorkerFromPlanGroup(post, application);
    return { ok: false, reason: "diary_error" };
  }

  // Step 5 — Notification. TIER: IMPORTANT. GAP-015 fix: directInvite path was missing this.
  try {
    const workspaceRoute = ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", workspaceId);
    notifyCrossRole({
      type: "SHIFT_EMPLOYEE_SELECTED",
      domain: "shift",
      affectedUserRole: "employee",
      postId: post.id,
      appId,
      severity: "urgent",
      title: "You are selected",
      body: `${post.companyName} confirmed you for ${post.jobName}. Your workspace is ready.`,
      route: workspaceRoute,
    });
  } catch {
    // TIER: IMPORTANT — notification failed; saga result is still ok.
    // TODO: enqueue to wm_retry_queue_v1 when retry infrastructure is ready.
  }

  return {
    ok: true,
    appId,
    workspaceId,
    post: {
      ...post,
      confirmedIds: uniq([...post.confirmedIds, appId]),
      shortlistIds: post.shortlistIds.filter((id) => id !== appId),
      waitingIds: post.waitingIds.filter((id) => id !== appId),
      rejectedIds: post.rejectedIds.filter((id) => id !== appId),
    },
  };
}

export function confirmCandidate(post: ShiftPost, appId: string): ConfirmCandidateSagaResult {
  // Pre-flight — no mutations
  const apps = readEmployeeApplications();
  const target = apps.find((app) => app.id === appId && app.postId === post.id);
  const vacancyLimit = getSafeVacancyLimit(post.vacancies);

  if (!target) return { ok: false, reason: "not_found" };

  if (target.status === "confirmed" || post.confirmedIds.includes(appId)) {
    return { ok: false, reason: "already_confirmed" };
  }

  if (!canConfirmCandidate(target.status)) {
    return { ok: false, reason: "not_confirmable" };
  }

  if (vacancyLimit <= 0 || post.confirmedIds.length >= vacancyLimit) {
    return { ok: false, reason: "vacancy_full" };
  }

  // Capture pre-mutation state for compensation
  const priorApplications = apps;
  const priorWorkspaces = readEmployeeWorkspaces();

  const resolvedWorkerWmId = target.profileSnapshot?.uniqueId?.trim() || undefined;
  const enrichedTarget: EmployeeShiftApplication = resolvedWorkerWmId
    ? { ...target, profileSnapshot: { ...target.profileSnapshot, uniqueId: resolvedWorkerWmId } }
    : target;

  // Step 1 — Application status write. TIER: CRITICAL.
  const appWrite = writeEmployeeApplications(updateApplicationStatus(apps, appId, "confirmed"));
  if (!appWrite.ok) return { ok: false, reason: "application_write_error" };

  // Step 2 — Workspace create/update. TIER: CRITICAL. Compensation: revert Step 1.
  const wsResult = createOrUpdateEmployeeWorkspace(post, enrichedTarget);
  if (!wsResult.ok) {
    writeEmployeeApplications(priorApplications);
    if (wsResult.reason === "missing_muid") {
      return { ok: false, reason: "missing_muid" };
    }
    return { ok: false, reason: "workspace_error" };
  }
  const workspaceId = wsResult.workspaceId;

  // Step 3 — Plan group enrollment. TIER: IMPORTANT. Compensation: revert Steps 1+2.
  const planResult = enrollConfirmedWorkerInPlanGroup(post, enrichedTarget);
  if (!planResult.ok && planResult.reason === "storage_error") {
    // TIER: IMPORTANT — enqueue to wm_retry_queue_v1 when retry infrastructure is ready.
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    return { ok: false, reason: "plan_error" };
  }

  // Step 4 — Diary sync. TIER: CRITICAL. Compensation: revert Steps 1+2+3.
  const diaryResult = plannerDiarySyncService.upsertConfirmedDay(post, enrichedTarget);
  if (!diaryResult.ok) {
    writeEmployeeApplications(priorApplications);
    restoreEmployeeWorkspaces(priorWorkspaces);
    unenrollWorkerFromPlanGroup(post, enrichedTarget);
    return { ok: false, reason: "diary_error" };
  }

  // Step 5 — Notification. TIER: IMPORTANT. No compensation needed; fire-and-retry.
  try {
    if (post.source === "planner" && post.planId) {
      const dateLabel = post.planSlotDate ? fmtPlanDate(post.planSlotDate) : post.jobName;
      const workspaceRoute = ROUTE_PATHS.employeePlannerWorkspace.replace(
        ":workspaceId",
        workspaceId,
      );
      plannerEmployeeNotifications.confirmedDay(post.jobName, dateLabel, workspaceRoute);
    } else {
      const workspaceRoute = ROUTE_PATHS.employeeShiftWorkspace.replace(
        ":workspaceId",
        workspaceId,
      );
      notifyCrossRole({
        type: "SHIFT_EMPLOYEE_SELECTED",
        domain: "shift",
        affectedUserRole: "employee",
        postId: post.id,
        appId,
        severity: "urgent",
        title: "You are selected",
        body: `${post.companyName} confirmed you for ${post.jobName}. Your workspace is ready.`,
        route: workspaceRoute,
      });
    }
  } catch {
    // TIER: IMPORTANT — notification failed; saga result is still ok.
    // TODO: enqueue to wm_retry_queue_v1 when retry infrastructure is ready.
  }

  return {
    ok: true,
    workspaceId,
    post: {
      ...post,
      confirmedIds: uniq([...post.confirmedIds, appId]),
      shortlistIds: post.shortlistIds.filter((id) => id !== appId),
      waitingIds: post.waitingIds.filter((id) => id !== appId),
      rejectedIds: post.rejectedIds.filter((id) => id !== appId),
    },
  };
}

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
    // TIER: IMPORTANT — TODO: enqueue to wm_retry_queue_v1.
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
    // TIER: IMPORTANT — TODO: enqueue to wm_retry_queue_v1.
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

function updateApplicationStatus(
  apps: EmployeeShiftApplication[],
  appId: string,
  status: ApplicantStatus,
): EmployeeShiftApplication[] {
  return apps.map((app) => (app.id === appId ? { ...app, status } : app));
}

function canMoveCandidate(status: ApplicantStatus): boolean {
  return status === "applied" || status === "shortlisted" || status === "waiting";
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
