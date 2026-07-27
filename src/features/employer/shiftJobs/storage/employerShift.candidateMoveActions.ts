// App name: Job Mitra
// File name: employerShift.candidateActions.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.candidateActions.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  readEmployeeApplications,
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

  const appWrite = writeEmployeeApplications(updateApplicationStatus(apps, appId, "shortlisted"));
  if (!appWrite.ok) return { post, changed: false };

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

  const appWrite = writeEmployeeApplications(updateApplicationStatus(apps, appId, "waiting"));
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
  const target = apps.find((app) => app.id === appId && app.postId === post.id);

  if (!target) return { post, changed: false };
  if (target.status === "confirmed") return { post, changed: false };

  const appWrite = writeEmployeeApplications(updateApplicationStatus(apps, appId, "rejected"));
  if (!appWrite.ok) return { post, changed: false };

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
  return apps.map((app) => (app.id === appId ? { ...app, status, statusChangedAt: at } : app));
}

function canMoveCandidate(status: ApplicantStatus): boolean {
  return status === "applied" || status === "shortlisted" || status === "waiting";
}
