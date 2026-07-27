// App name: Job Mitra
// Atomic bulk reject — one LS write + one summary pulse (Wave 2 SC-5)

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
import type { CareerApplication } from "../types/careerTypes";
import { getPipelineMutableCareerPost } from "./careerPostPipelineGuard";

const MAX_REJECTION_REASON_LENGTH = 300;
const MIN_ADVANCED_REJECTION_REASON_LENGTH = 5;

export type BulkRejectResult = {
  okCount: number;
  failedCount: number;
};

function requiresAdvancedReason(app: CareerApplication): boolean {
  return app.stage === "interview" || app.stage === "offered" || app.stage === "offer_accepted";
}

export async function rejectCandidatesBulk(
  postId: string,
  appIds: readonly string[],
  reason: string,
): Promise<BulkRejectResult> {
  const uniqueIds = Array.from(new Set(appIds.filter(Boolean)));
  if (uniqueIds.length === 0) return { okCount: 0, failedCount: 0 };

  const post = getPipelineMutableCareerPost(postId);
  if (!post) return { okCount: 0, failedCount: uniqueIds.length };

  const finalReason = reason.trim();
  if (finalReason.length > MAX_REJECTION_REASON_LENGTH) {
    return { okCount: 0, failedCount: uniqueIds.length };
  }

  const apps = readCareerApps();
  const priorApps = apps;
  const idSet = new Set(uniqueIds);
  const now = Date.now();
  const eligible: CareerApplication[] = [];

  for (const item of apps) {
    if (!idSet.has(item.id) || item.jobId !== postId) continue;
    if (!canTransition(item.stage, "rejected")) continue;
    if (requiresAdvancedReason(item) && finalReason.length < MIN_ADVANCED_REJECTION_REASON_LENGTH) {
      continue;
    }
    eligible.push(item);
  }

  if (eligible.length === 0) {
    return { okCount: 0, failedCount: uniqueIds.length };
  }

  const eligibleIds = new Set(eligible.map((item) => item.id));
  const next = apps.map((item) =>
    eligibleIds.has(item.id)
      ? {
          ...item,
          stage: "rejected" as const,
          rejectionReason: finalReason || undefined,
          rejectedAt: now,
          updatedAt: now,
        }
      : item,
  );

  const writeResult = writeCareerApps(next);
  if (!writeResult.ok) {
    return { okCount: 0, failedCount: uniqueIds.length };
  }

  if (isCareerApiSyncEnabled()) {
    const serverPostId = resolveCareerGatePostId(postId);
    if (!serverPostId) {
      writeCareerApps(priorApps);
      return { okCount: 0, failedCount: uniqueIds.length };
    }

    for (const app of eligible) {
      const serverAppId = resolveCareerGateApplicationId(app.id);
      if (!serverAppId) {
        writeCareerApps(priorApps);
        return { okCount: 0, failedCount: uniqueIds.length };
      }

      try {
        await careerGateApi.updateApplicationStatus(serverPostId, serverAppId, "rejected");
      } catch {
        writeCareerApps(priorApps);
        return { okCount: 0, failedCount: uniqueIds.length };
      }
    }
  }

  pushCareerActivity({
    postId,
    kind: "candidate_rejected",
    title: "Candidates rejected",
    body: `${eligible.length} candidate(s) rejected for ${post.jobTitle}.${finalReason ? ` Reason: ${finalReason}.` : ""}`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  const signature = `[CAREER_APPLICATIONS_BULK_REJECTED:${postId}:${now}]`;
  if (!hasSimilarCareerNote(signature)) {
    notifyCrossRole({
      type: "CAREER_APPLICATION_REJECTED",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      title: "Application update",
      body: `${signature} ${eligible.length} application(s) for ${post.jobTitle} at ${post.companyName} were closed.${finalReason ? ` Reason: ${finalReason}` : ""}`,
      route: ROUTE_PATHS.employeeCareerApplications,
    });
  }

  return {
    okCount: eligible.length,
    failedCount: Math.max(0, uniqueIds.length - eligible.length),
  };
}
