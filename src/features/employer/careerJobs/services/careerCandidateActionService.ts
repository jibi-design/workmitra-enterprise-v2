// App name: Job Mitra
// File name: careerCandidateActionService.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\services\careerCandidateActionService.ts

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition } from "../helpers/careerValidation";
import type { CareerApplicationStage } from "../types/careerTypes";
import { getCareerPost } from "./careerPostService";

const MAX_REJECTION_REASON_LENGTH = 300;
const MIN_ADVANCED_REJECTION_REASON_LENGTH = 5;

function getActiveCareerPost(postId: string) {
  const post = getCareerPost(postId);

  if (!post || post.status !== "active") return null;

  return post;
}

function requiresRejectionReason(stage: CareerApplicationStage): boolean {
  return stage === "interview" || stage === "offered" || stage === "offer_accepted";
}

function isValidRejectionReason(stage: CareerApplicationStage, reason: string): boolean {
  const trimmed = reason.trim();

  if (trimmed.length > MAX_REJECTION_REASON_LENGTH) return false;

  if (requiresRejectionReason(stage) && trimmed.length < MIN_ADVANCED_REJECTION_REASON_LENGTH) {
    return false;
  }

  return true;
}

export function shortlistCandidate(postId: string, appId: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || !canTransition(app.stage, "shortlisted")) return false;

  const post = getActiveCareerPost(postId);
  if (!post) return false;

  const now = Date.now();

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId ? { ...item, stage: "shortlisted" as const, updatedAt: now } : item,
    ),
  );

  if (!writeResult.ok) return false;

  pushCareerActivity({
    postId,
    kind: "candidate_shortlisted",
    title: "Candidate shortlisted",
    body: `${app.employeeName} shortlisted for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerCandidateDetail
      .replace(":postId", postId)
      .replace(":appId", appId),
  });

  notifyCrossRole({
    type: "CAREER_EMPLOYEE_SHORTLISTED",
    domain: "career",
    affectedUserRole: "employee",
    postId,
    appId,
    severity: "urgent",
    title: "Shortlisted",
    body: `Your application for ${post.jobTitle} at ${post.companyName} has been shortlisted.`,
    route: ROUTE_PATHS.employeeCareerApplications,
  });

  return true;
}

export function removeCandidateFromShortlist(postId: string, appId: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || app.stage !== "shortlisted") return false;

  const post = getActiveCareerPost(postId);
  if (!post) return false;

  const now = Date.now();

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId ? { ...item, stage: "applied" as const, updatedAt: now } : item,
    ),
  );

  if (!writeResult.ok) return false;

  pushCareerActivity({
    postId,
    kind: "candidate_shortlisted",
    title: "Candidate removed from shortlist",
    body: `${app.employeeName} moved back to Applied for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}

export function moveInterviewCandidateToShortlist(postId: string, appId: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || app.stage !== "interview") return false;

  const post = getActiveCareerPost(postId);
  if (!post) return false;

  const now = Date.now();

  const updatedRoundResults = app.roundResults.map((round) =>
    round.status === "scheduled" || round.status === "pending"
      ? {
          ...round,
          status: "cancelled" as const,
          feedback: round.feedback || "Moved back to Shortlist by employer.",
          completedAt: now,
        }
      : round,
  );

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId
        ? {
            ...item,
            stage: "shortlisted" as const,
            currentRound: 0,
            roundResults: updatedRoundResults,
            updatedAt: now,
          }
        : item,
    ),
  );

  if (!writeResult.ok) return false;

  pushCareerActivity({
    postId,
    kind: "candidate_shortlisted",
    title: "Candidate moved back to Shortlist",
    body: `${app.employeeName} moved back from Interview to Shortlist for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  notifyCrossRole({
    type: "CAREER_INTERVIEW_UPDATE",
    domain: "career",
    affectedUserRole: "employee",
    postId,
    appId,
    title: "Interview update",
    body: `Your interview for ${post.jobTitle} at ${post.companyName} was moved back to shortlist review. The employer may schedule again later.`,
    route: ROUTE_PATHS.employeeCareerApplications,
  });

  return true;
}

export function rejectCandidate(postId: string, appId: string, reason: string): boolean {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || !canTransition(app.stage, "rejected")) return false;
  if (!isValidRejectionReason(app.stage, reason)) return false;

  const post = getActiveCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const finalReason = reason.trim();

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId
        ? {
            ...item,
            stage: "rejected" as const,
            rejectionReason: finalReason || undefined,
            rejectedAt: now,
            updatedAt: now,
          }
        : item,
    ),
  );

  if (!writeResult.ok) return false;

  pushCareerActivity({
    postId,
    kind: "candidate_rejected",
    title: "Candidate rejected",
    body: `${app.employeeName} rejected.${finalReason ? ` Reason: ${finalReason}.` : ""}`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  notifyCrossRole({
    type: "CAREER_APPLICATION_REJECTED",
    domain: "career",
    affectedUserRole: "employee",
    postId,
    appId,
    title: "Application update",
    body: `Your application for ${post.jobTitle} at ${post.companyName} was not successful.${finalReason ? ` Reason: ${finalReason}` : ""}`,
    route: ROUTE_PATHS.employeeCareerApplications,
  });

  return true;
}
