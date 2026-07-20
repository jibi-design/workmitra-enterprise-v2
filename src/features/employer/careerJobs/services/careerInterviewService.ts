// App name: Job Mitra
// File name: careerInterviewService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerInterviewService.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { pushCareerActivity } from "../helpers/careerNotifications";
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

export function scheduleInterview(
  postId: string,
  appId: string,
  roundNumber: number,
  details: InterviewScheduleInput,
): boolean {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app) return false;
  if (app.stage !== "shortlisted" && app.stage !== "interview") return false;
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

  const updatedResults = [
    ...app.roundResults.filter((round) => round.round !== roundNumber),
    newResult,
  ].sort((a, b) => a.round - b.round);

  writeCareerApps(
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

export function recordInterviewResult(
  postId: string,
  appId: string,
  roundNumber: number,
  result: "passed" | "failed",
  feedback: string,
): boolean {
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

  writeCareerApps(
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

    notifyCrossRole({
      type: "CAREER_INTERVIEW_UPDATE",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      appId,
      title: "Interview result",
      body: `You passed ${roundLabel} for ${post.jobTitle} at ${post.companyName}.${isLastRound ? " All rounds completed!" : " Next round details will follow."}`,
      route: ROUTE_PATHS.employeeCareerApplications,
    });

    if (isLastRound && allPreviousPassed) {
      notifyCrossRole({
        type: "CAREER_INTERVIEW_UPDATE",
        domain: "career",
        affectedUserRole: "employee",
        postId,
        appId,
        title: "You cleared the interview!",
        body: `Congratulations! You cleared all interviews for ${post.jobTitle} at ${post.companyName}. Your employer will send you an offer soon.`,
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
