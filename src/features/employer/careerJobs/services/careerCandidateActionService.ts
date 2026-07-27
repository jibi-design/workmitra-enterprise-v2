// App name: Job Mitra
// File name: careerCandidateActionService.ts
// Shortlist / reject with dual-write rollback (Wave 1–2)

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  resolveCareerGateApplicationId,
  resolveCareerGatePostId,
} from "../../../career/services/careerGateApi.service";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { hasSimilarCareerNote, pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition } from "../helpers/careerValidation";
import type { CareerApplicationStage } from "../types/careerTypes";
import { getPipelineMutableCareerPost } from "./careerPostPipelineGuard";

export {
  moveInterviewCandidateToShortlist,
  removeCandidateFromShortlist,
} from "./careerCandidateReverseActions.service";

export { shortlistCandidatesBulk } from "./careerCandidateBulkShortlist.service";
export { rejectCandidatesBulk } from "./careerCandidateBulkReject.service";

const MAX_REJECTION_REASON_LENGTH = 300;
const MIN_ADVANCED_REJECTION_REASON_LENGTH = 5;

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

export async function shortlistCandidate(postId: string, appId: string): Promise<boolean> {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || !canTransition(app.stage, "shortlisted")) return false;

  const post = getPipelineMutableCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const priorApps = apps;

  const writeResult = writeCareerApps(
    apps.map((item) =>
      item.id === appId ? { ...item, stage: "shortlisted" as const, updatedAt: now } : item,
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

export async function rejectCandidate(
  postId: string,
  appId: string,
  reason: string,
): Promise<boolean> {
  const apps = readCareerApps();
  const app = apps.find((item) => item.id === appId && item.jobId === postId);
  if (!app || !canTransition(app.stage, "rejected")) return false;
  if (!isValidRejectionReason(app.stage, reason)) return false;

  const post = getPipelineMutableCareerPost(postId);
  if (!post) return false;

  const now = Date.now();
  const finalReason = reason.trim();
  const priorApps = apps;

  const priorStage = app.stage;

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

  if (isCareerApiSyncEnabled()) {
    const serverAppId = resolveCareerGateApplicationId(appId);
    const serverPostId = resolveCareerGatePostId(postId);
    if (!serverAppId || !serverPostId) {
      writeCareerApps(priorApps);
      return false;
    }

    try {
      await careerGateApi.updateApplicationStatus(serverPostId, serverAppId, "rejected");
    } catch {
      writeCareerApps(priorApps);
      return false;
    }
  }

  const activityKind = priorStage === "offer_accepted" ? "offer_revoked" : "candidate_rejected";

  pushCareerActivity({
    postId,
    kind: activityKind,
    title: priorStage === "offer_accepted" ? "Offer revoked" : "Candidate rejected",
    body: `${app.employeeName} ${priorStage === "offer_accepted" ? "had an accepted offer revoked" : "rejected"}.${finalReason ? ` Reason: ${finalReason}.` : ""}`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  const signature = `[CAREER_APPLICATION_REJECTED:${postId}:${appId}]`;
  if (!hasSimilarCareerNote(signature)) {
    notifyCrossRole({
      type: "CAREER_APPLICATION_REJECTED",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      appId,
      title: "Application update",
      body: `${signature} Your application for ${post.jobTitle} at ${post.companyName} was not successful.${finalReason ? ` Reason: ${finalReason}` : ""}`,
      route: ROUTE_PATHS.employeeCareerApplications,
    });
  }

  return true;
}
