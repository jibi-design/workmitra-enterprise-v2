// App name: Job Mitra
// Reverse pipeline moves (shortlist↔applied, interview↔shortlist) with dual-write

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  resolveCareerGateApplicationId,
  resolveCareerGatePostId,
} from "../../../career/services/careerGateApi.service";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition } from "../helpers/careerValidation";
import { getPipelineMutableCareerPost } from "./careerPostPipelineGuard";

export async function removeCandidateFromShortlist(
  postId: string,
  appId: string,
): Promise<boolean> {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || !canTransition(app.stage, "applied")) return false;

  const post = getPipelineMutableCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const priorApps = apps;

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId ? { ...item, stage: "applied" as const, updatedAt: now } : item,
    ),
  );

  if (!writeResult.ok) return false;

  if (isCareerApiSyncEnabled()) {
    const serverAppId = resolveCareerGateApplicationId(appId);
    const serverPostId = resolveCareerGatePostId(postId);
    if (!serverAppId || !serverPostId) {
      writeCareerApps(priorApps);
      return false;
    }

    try {
      await careerGateApi.updateApplicationStatus(serverPostId, serverAppId, "pending");
    } catch {
      writeCareerApps(priorApps);
      return false;
    }
  }

  pushCareerActivity({
    postId,
    kind: "candidate_unshortlisted",
    title: "Candidate removed from shortlist",
    body: `${app.employeeName} moved back to Applied for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  return true;
}

export async function moveInterviewCandidateToShortlist(
  postId: string,
  appId: string,
): Promise<boolean> {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || !canTransition(app.stage, "shortlisted")) return false;

  const post = getPipelineMutableCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const priorApps = apps;

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

  if (isCareerApiSyncEnabled()) {
    const serverAppId = resolveCareerGateApplicationId(appId);
    if (!serverAppId) {
      writeCareerApps(priorApps);
      return false;
    }

    try {
      await careerGateApi.shortlistApplication(serverAppId);
    } catch {
      writeCareerApps(priorApps);
      return false;
    }
  }

  pushCareerActivity({
    postId,
    kind: "candidate_returned_to_shortlist",
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
