// App name: Job Mitra
// File name: careerInterviewService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerInterviewService.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import { mergeServerApplicationIntoLsCache } from "../../../career/services/careerDbTruth.service";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  mustRollbackCareerLocalWrite,
  resolveCareerGateApplicationId,
  resolveCareerGatePostId,
} from "../../../career/services/careerGateApi.service";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { hasSimilarCareerNote, pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition } from "../helpers/careerValidation";
import type { InterviewScheduleInput, RoundResult, RoundResultStatus } from "../types/careerTypes";
import { getCareerPost } from "./careerPostService";

const MIN_INTERVIEW_SCHEDULE_BUFFER_MS = 30 * 60 * 1000;
const MAX_INTERVIEW_FEEDBACK_LENGTH = 500;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidInterviewSchedule(details: InterviewScheduleInput): boolean {
  const dateValue = details.scheduledDate.trim();
  const timeValue = details.scheduledTime.trim();

  if (!dateValue || !timeValue) return false;

  const selectedDateTime = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(selectedDateTime.getTime())) return false;

  if (selectedDateTime.getTime() < Date.now() + MIN_INTERVIEW_SCHEDULE_BUFFER_MS) return false;

  if (details.mode === "in-person" && (details.location?.trim().length ?? 0) < 3) return false;
  if (details.mode === "phone" && (details.location?.trim().length ?? 0) < 3) return false;
  if (details.mode === "video" && !isValidHttpUrl(details.meetingLink?.trim() ?? "")) return false;

  return true;
}

function getScheduledRoundDateTimeMs(round: RoundResult): number | null {
  const dateValue = round.scheduledDate?.trim();
  const timeValue = round.scheduledTime?.trim();

  if (!dateValue || !timeValue) return null;

  const scheduledDateTime = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(scheduledDateTime.getTime())) return null;

  return scheduledDateTime.getTime();
}

function canRecordScheduledRound(round: RoundResult): boolean {
  const scheduledAt = getScheduledRoundDateTimeMs(round);

  return scheduledAt !== null && scheduledAt <= Date.now();
}

async function syncInterviewServerStatus(params: {
  postId: string;
  appId: string;
  priorApps: ReturnType<typeof readCareerApps>;
  serverStatus: "interview_scheduled" | "rejected";
}): Promise<boolean> {
  if (!isCareerApiSyncEnabled()) return true;

  const serverPostId = resolveCareerGatePostId(params.postId);
  const serverAppId = resolveCareerGateApplicationId(params.appId);

  if (!serverPostId || !serverAppId) {
    if (mustRollbackCareerLocalWrite(serverPostId) || mustRollbackCareerLocalWrite(serverAppId)) {
      writeCareerApps(params.priorApps);
      return false;
    }
    return true;
  }

  try {
    const dto = await careerGateApi.updateApplicationStatus(
      serverPostId,
      serverAppId,
      params.serverStatus,
    );
    mergeServerApplicationIntoLsCache(dto, params.appId);
    return true;
  } catch {
    writeCareerApps(params.priorApps);
    return false;
  }
}

export async function scheduleInterview(
  postId: string,
  appId: string,
  roundNumber: number,
  details: InterviewScheduleInput,
): Promise<boolean> {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app) return false;
  // C-INT-2: use canTransition for first move into interview; re-schedule stays on interview.
  if (app.stage === "interview") {
    /* already interviewing — additional round OK */
  } else if (!canTransition(app.stage, "interview")) {
    return false;
  }
  if (!isValidInterviewSchedule(details)) return false;

  const post = getCareerPost(postId);
  if (!post || post.status !== "active") return false;
  if (roundNumber < 1 || roundNumber > post.interviewRounds) return false;

  const roundConfig = post.roundConfigs.find((round) => round.round === roundNumber);
  const roundLabel = roundConfig?.label ?? `Round ${roundNumber}`;

  const newResult: RoundResult = {
    round: roundNumber,
    label: roundLabel,
    status: "scheduled",
    feedback: "",
    interviewMode: details.mode,
    scheduledDate: details.scheduledDate,
    scheduledTime: details.scheduledTime,
    location: details.location,
    meetingLink: details.meetingLink,
  };

  const now = Date.now();
  const priorApps = apps;

  const updatedResults = [
    ...app.roundResults.filter((round) => round.round !== roundNumber),
    newResult,
  ].sort((a, b) => a.round - b.round);

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId
        ? {
            ...item,
            stage: "interview" as const,
            currentRound: roundNumber,
            roundResults: updatedResults,
            updatedAt: now,
          }
        : item,
    ),
  );

  if (!writeResult.ok) return false;

  const synced = await syncInterviewServerStatus({
    postId,
    appId,
    priorApps,
    serverStatus: "interview_scheduled",
  });
  if (!synced) return false;

  pushCareerActivity({
    postId,
    kind: "interview_scheduled",
    title: `${roundLabel} scheduled`,
    body: `${app.employeeName} - ${details.scheduledDate} at ${details.scheduledTime}. Mode: ${details.mode}.`,
    route: ROUTE_PATHS.employerCareerCandidateDetail
      .replace(":postId", postId)
      .replace(":appId", appId),
  });

  notifyCrossRole({
    type: "CAREER_INTERVIEW_INVITE",
    domain: "career",
    affectedUserRole: "employee",
    postId,
    appId,
    severity: "urgent",
    title: "Interview scheduled",
    body: `${roundLabel} for ${post.jobTitle} at ${post.companyName}. Date: ${details.scheduledDate}, Time: ${details.scheduledTime}. Mode: ${details.mode}.${details.location ? ` Location: ${details.location}.` : ""}`,
    route: ROUTE_PATHS.employeeCareerApplications,
  });

  return true;
}

export async function recordInterviewResult(
  postId: string,
  appId: string,
  roundNumber: number,
  result: "passed" | "failed",
  feedback: string,
): Promise<boolean> {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || app.stage !== "interview") return false;

  const safeFeedback = feedback.trim();
  if (safeFeedback.length > MAX_INTERVIEW_FEEDBACK_LENGTH) return false;

  const scheduledRound = app.roundResults.find(
    (round) => round.round === roundNumber && round.status === "scheduled",
  );

  if (!scheduledRound || !canRecordScheduledRound(scheduledRound)) return false;

  const post = getCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const priorApps = apps;

  const updatedResults = app.roundResults.map((round) =>
    round.round === roundNumber
      ? {
          ...round,
          status: result as RoundResultStatus,
          feedback: safeFeedback,
          completedAt: now,
        }
      : round,
  );

  const isLastRound = roundNumber === post.interviewRounds;
  const shouldAutoReject = result === "failed" && isLastRound;

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId
        ? {
            ...item,
            roundResults: updatedResults,
            updatedAt: now,
            ...(shouldAutoReject
              ? {
                  stage: "rejected" as const,
                  rejectedAt: now,
                  rejectionReason: safeFeedback || "Did not pass final interview round",
                }
              : {}),
          }
        : item,
    ),
  );

  if (!writeResult.ok) return false;

  if (shouldAutoReject) {
    const synced = await syncInterviewServerStatus({
      postId,
      appId,
      priorApps,
      serverStatus: "rejected",
    });
    if (!synced) return false;
  }

  const roundConfig = post.roundConfigs.find((round) => round.round === roundNumber);
  const roundLabel = roundConfig?.label ?? `Round ${roundNumber}`;

  pushCareerActivity({
    postId,
    kind: result === "passed" ? "interview_passed" : "interview_failed",
    title: `${roundLabel}: ${result === "passed" ? "Passed" : "Not passed"}`,
    body: `${app.employeeName}.${feedback ? ` Feedback: ${feedback}` : ""}`,
    route: ROUTE_PATHS.employerCareerCandidateDetail
      .replace(":postId", postId)
      .replace(":appId", appId),
  });

  if (result === "passed") {
    const allPreviousPassed = updatedResults
      .filter((round) => round.round < roundNumber)
      .every((round) => round.status === "passed");

    const clearedSignature = `[CAREER_INTERVIEW_CLEAR:${postId}:${appId}]`;
    const isCleared = isLastRound && allPreviousPassed;

    if (isCleared) {
      if (!hasSimilarCareerNote(clearedSignature)) {
        notifyCrossRole({
          type: "CAREER_INTERVIEW_UPDATE",
          domain: "career",
          affectedUserRole: "employee",
          postId,
          appId,
          title: "You cleared the interview!",
          body: `${clearedSignature} You made it through interviews for ${post.jobTitle} at ${post.companyName}. An offer should follow soon.`,
          route: ROUTE_PATHS.employeeCareerApplications,
        });
      }
    } else {
      notifyCrossRole({
        type: "CAREER_INTERVIEW_UPDATE",
        domain: "career",
        affectedUserRole: "employee",
        postId,
        appId,
        title: "Interview result",
        body: `You passed ${roundLabel} for ${post.jobTitle} at ${post.companyName}. Next round details will follow.`,
        route: ROUTE_PATHS.employeeCareerApplications,
      });
    }
  } else {
    notifyCrossRole({
      type: "CAREER_INTERVIEW_UPDATE",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      appId,
      title: "Interview result",
      body: `${roundLabel} for ${post.jobTitle} at ${post.companyName}: Unfortunately, you did not pass this round.${safeFeedback ? ` Feedback: ${safeFeedback}` : ""}`,
      route: ROUTE_PATHS.employeeCareerApplications,
    });

    if (shouldAutoReject) {
      notifyCrossRole({
        type: "CAREER_APPLICATION_REJECTED",
        domain: "career",
        affectedUserRole: "employee",
        postId,
        appId,
        title: "Application closed",
        body: `Your application for ${post.jobTitle} at ${post.companyName} was not successful after the interview process.`,
        route: ROUTE_PATHS.employeeCareerApplications,
      });
    }
  }

  return true;
}
