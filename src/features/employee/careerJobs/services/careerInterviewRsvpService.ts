// App name: Job Mitra
// File name: careerInterviewRsvpService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\services\careerInterviewRsvpService.ts
// P2: RSVP LS reads/writes are scope-guarded and storage-safe (no uncaught corruption).

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { queuePulseEventForAffectedUser } from "../../../pulse/pulseEventBridge";
import { pushCareerActivity, getCareerPost } from "../../../career/services/careerEmployerPublic";
import {
  readCareerAppsForEmployee,
  writeCareerAppsForEmployee,
} from "../../../career/helpers/careerStoragePublic";
import type { CareerApplication, RoundResult } from "../../../career/types/careerDomainTypes";
import { getCurrentCareerEmployeeScopeId } from "../../../shared/career/careerEmployeeScope";

/** Resolve worker scope for RSVP — never throws; null when identity/storage unsafe. */
function resolveRsvpWorkerScopeId(): string | null {
  try {
    const scopeId = getCurrentCareerEmployeeScopeId().trim();
    if (!scopeId) return null;
    if (scopeId === "unknown_worker" && AUTH_BACKEND_ENABLED) return null;
    return scopeId;
  } catch {
    return null;
  }
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
  try {
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
  } catch {
    /* RSVP persistence already succeeded — notification failure must not roll back. */
  }
}

function commitInterviewRsvp(jobId: string, accepted: boolean): boolean {
  const workerScopeId = resolveRsvpWorkerScopeId();
  if (!workerScopeId) return false;

  let apps: CareerApplication[];
  try {
    apps = readCareerAppsForEmployee(workerScopeId);
  } catch {
    return false;
  }

  const app = apps.find((item) => item.jobId === jobId && item.stage === "interview");

  if (!app) return false;

  const pendingRound = findPendingScheduledRound(app);
  if (!pendingRound) return false;

  let post;
  try {
    post = getCareerPost(jobId);
  } catch {
    return false;
  }
  if (!post) return false;

  const now = Date.now();
  const withRsvp = updateRoundRsvp(
    app,
    pendingRound.round,
    accepted ? "accepted" : "declined",
    now,
  );

  const updatedApp: CareerApplication = accepted
    ? withRsvp
    : {
        ...withRsvp,
        // Keep interview stage so employer can reschedule; RSVP declined is on the round.
        stage: "interview",
        updatedAt: now,
      };

  const nextApps = apps.map((item) => (item.id === app.id ? updatedApp : item));

  try {
    const write = writeCareerAppsForEmployee(nextApps, workerScopeId);
    if (!write.ok) return false;
  } catch {
    return false;
  }

  notifyEmployerInterviewRsvp(
    jobId,
    app.id,
    accepted,
    app.employeeName,
    pendingRound.label,
    post.jobTitle,
  );

  return true;
}

export function acceptInterview(jobId: string): boolean {
  try {
    return commitInterviewRsvp(jobId, true);
  } catch {
    return false;
  }
}

export function declineInterview(jobId: string): boolean {
  try {
    return commitInterviewRsvp(jobId, false);
  } catch {
    return false;
  }
}
