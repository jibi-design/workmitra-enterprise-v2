// App name: Job Mitra
// File name: careerInterviewRsvpService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\services\careerInterviewRsvpService.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { queuePulseEventForAffectedUser } from "../../../pulse/pulseEventBridge";
import { pushCareerActivity } from "../../../employer/careerJobs/helpers/careerNotifications";
import {
  readCareerApps,
  writeCareerApps,
} from "../../../employer/careerJobs/helpers/careerNormalizers";
import type {
  CareerApplication,
  RoundResult,
} from "../../../employer/careerJobs/types/careerTypes";
import { getCareerPost } from "../../../employer/careerJobs/services/careerPostService";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

function getCurrentEmployeeId(): string {
  return employeeProfileStorage.get().uniqueId ?? "employee_demo";
}

function findPendingScheduledRound(app: CareerApplication): RoundResult | null {
  const scheduled = app.roundResults
    .filter((round) => round.status === "scheduled")
    .sort((a, b) => a.round - b.round);

  for (const round of scheduled) {
    if (!round.rsvpStatus || round.rsvpStatus === "pending") {
      return round;
    }
  }

  return null;
}

function updateRoundRsvp(
  app: CareerApplication,
  roundNumber: number,
  rsvpStatus: "accepted" | "declined",
  now: number,
): CareerApplication {
  return {
    ...app,
    updatedAt: now,
    roundResults: app.roundResults.map((round) =>
      round.round === roundNumber ? { ...round, rsvpStatus, rsvpAt: now } : round,
    ),
  };
}

function notifyEmployerInterviewRsvp(
  postId: string,
  appId: string,
  accepted: boolean,
  employeeName: string,
  roundLabel: string,
  jobTitle: string,
): void {
  const pulseType = accepted ? "CAREER_INTERVIEW_ACCEPTED" : "CAREER_INTERVIEW_DECLINED";
  const activityTitle = accepted ? "Interview accepted" : "Interview declined";
  const activityBody = accepted
    ? `${employeeName} accepted ${roundLabel} for ${jobTitle}.`
    : `${employeeName} declined ${roundLabel} for ${jobTitle}.`;

  queuePulseEventForAffectedUser({
    type: pulseType,
    domain: "career",
    affectedUserRole: "employer",
    targetId: postId,
    postId,
    appId,
    severity: accepted ? "warning" : "urgent",
  });

  pushCareerActivity({
    postId,
    kind: accepted ? "interview_passed" : "interview_failed",
    title: activityTitle,
    body: activityBody,
    route: ROUTE_PATHS.employerCareerCandidateDetail
      .replace(":postId", postId)
      .replace(":appId", appId),
  });
}

export function acceptInterview(jobId: string): boolean {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readCareerApps();
  const app = apps.find(
    (item) =>
      item.jobId === jobId && item.employeeId === currentEmployeeId && item.stage === "interview",
  );

  if (!app) return false;

  const pendingRound = findPendingScheduledRound(app);
  if (!pendingRound) return false;

  const post = getCareerPost(jobId);
  if (!post) return false;

  const now = Date.now();
  const updatedApp = updateRoundRsvp(app, pendingRound.round, "accepted", now);

  writeCareerApps(apps.map((item) => (item.id === app.id ? updatedApp : item)));

  notifyEmployerInterviewRsvp(
    jobId,
    app.id,
    true,
    app.employeeName,
    pendingRound.label,
    post.jobTitle,
  );

  return true;
}

export function declineInterview(jobId: string): boolean {
  const currentEmployeeId = getCurrentEmployeeId();
  const apps = readCareerApps();
  const app = apps.find(
    (item) =>
      item.jobId === jobId && item.employeeId === currentEmployeeId && item.stage === "interview",
  );

  if (!app) return false;

  const pendingRound = findPendingScheduledRound(app);
  if (!pendingRound) return false;

  const post = getCareerPost(jobId);
  if (!post) return false;

  const now = Date.now();
  const withRsvp = updateRoundRsvp(app, pendingRound.round, "declined", now);

  const updatedApp: CareerApplication = {
    ...withRsvp,
    stage: "withdrawn",
    withdrawnAt: now,
    updatedAt: now,
  };

  writeCareerApps(apps.map((item) => (item.id === app.id ? updatedApp : item)));

  notifyEmployerInterviewRsvp(
    jobId,
    app.id,
    false,
    app.employeeName,
    pendingRound.label,
    post.jobTitle,
  );

  return true;
}
