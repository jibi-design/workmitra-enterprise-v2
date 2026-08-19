// App name: Job Mitra
// File name: employerShift.candidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.candidateActions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import { appendSelectionAuditEvent } from "../../../shared/shift/selectionAudit.storage";
import {
  readEmployeeApplications,
  writeEmployeeApplications,
} from "./employerShift.employeeBridge";
import { shiftAppIdsMatch, shiftPostIdsMatch } from "../../../shift/utils/shiftIdBridge";
import type { ApplicantStatus, EmployeeShiftApplication, ShiftPost } from "./employerShift.types";
import { uniq } from "./employerShift.utils";

function candidateIdFromApp(app: EmployeeShiftApplication, fallbackAppId: string): string {
  return app.profileSnapshot?.uniqueId?.trim().toUpperCase() || fallbackAppId;
}

function findCandidateApp(
  apps: EmployeeShiftApplication[],
  post: ShiftPost,
  appId: string,
): EmployeeShiftApplication | undefined {
  return (
    apps.find(
      (app) => shiftAppIdsMatch(app.id, appId) && shiftPostIdsMatch(app.postId, post.id),
    ) ?? apps.find((app) => shiftAppIdsMatch(app.id, appId))
  );
}

export function moveCandidateToShortlist(
  post: ShiftPost,
  appId: string,
): {
  post: ShiftPost;
  changed: boolean;
} {
  const apps = readEmployeeApplications();
  const target =
    findCandidateApp(apps, post, appId) ??
    apps.find((app) => shiftPostIdsMatch(app.postId, post.id) && canMoveCandidate(app.status));

  if (!target) return { post, changed: false };
  if (!canMoveCandidate(target.status)) return { post, changed: false };

  const appWrite = writeEmployeeApplications(
    updateApplicationStatus(apps, target.id, "shortlisted"),
  );
  if (!appWrite.ok) return { post, changed: false };

  appendSelectionAuditEvent({
    action: "shortlist",
    postId: post.id,
    candidateId: candidateIdFromApp(target, appId),
    appId,
  });

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
  const target = findCandidateApp(apps, post, appId);

  if (!target) return { post, changed: false };
  if (!canMoveCandidate(target.status)) return { post, changed: false };

  const appWrite = writeEmployeeApplications(updateApplicationStatus(apps, target.id, "waiting"));
  if (!appWrite.ok) return { post, changed: false };

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
  const target = findCandidateApp(apps, post, appId);

  if (!target) return { post, changed: false };
  if (target.status === "confirmed") return { post, changed: false };

  const appWrite = writeEmployeeApplications(updateApplicationStatus(apps, target.id, "rejected"));
  if (!appWrite.ok) return { post, changed: false };

  appendSelectionAuditEvent({
    action: "reject",
    postId: post.id,
    candidateId: candidateIdFromApp(target, appId),
    appId,
  });

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

function updateApplicationStatus(
  apps: EmployeeShiftApplication[],
  appId: string,
  status: ApplicantStatus,
): EmployeeShiftApplication[] {
  const at = Date.now();
  return apps.map((app) =>
    shiftAppIdsMatch(app.id, appId) ? { ...app, status, statusChangedAt: at } : app,
  );
}

function canMoveCandidate(status: ApplicantStatus): boolean {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}
