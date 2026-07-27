// App name: Job Mitra
// Atomic bulk shortlist — one LS read/write (Wave 1 SC-1)

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import {
  careerGateApi,
  isCareerApiSyncEnabled,
  resolveCareerGateApplicationId,
} from "../../../career/services/careerGateApi.service";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { pushCareerActivity } from "../helpers/careerNotifications";
import { canTransition } from "../helpers/careerValidation";
import type { CareerApplication } from "../types/careerTypes";
import { getPipelineMutableCareerPost } from "./careerPostPipelineGuard";

export type BulkShortlistResult = {
  okCount: number;
  failedCount: number;
};

export async function shortlistCandidatesBulk(
  postId: string,
  appIds: readonly string[],
): Promise<BulkShortlistResult> {
  const uniqueIds = Array.from(new Set(appIds.filter(Boolean)));
  if (uniqueIds.length === 0) return { okCount: 0, failedCount: 0 };

  const post = getPipelineMutableCareerPost(postId);
  if (!post) return { okCount: 0, failedCount: uniqueIds.length };

  const apps = readCareerApps();
  const priorApps = apps;
  const idSet = new Set(uniqueIds);
  const now = Date.now();
  const eligible: CareerApplication[] = [];

  const next = apps.map((item) => {
    if (!idSet.has(item.id) || item.jobId !== postId) return item;
    if (!canTransition(item.stage, "shortlisted")) return item;
    eligible.push(item);
    return { ...item, stage: "shortlisted" as const, updatedAt: now };
  });

  if (eligible.length === 0) {
    return { okCount: 0, failedCount: uniqueIds.length };
  }

  const writeResult = writeCareerApps(next);
  if (!writeResult.ok) {
    return { okCount: 0, failedCount: uniqueIds.length };
  }

  if (isCareerApiSyncEnabled()) {
    for (const app of eligible) {
      const serverAppId = resolveCareerGateApplicationId(app.id);
      if (!serverAppId) {
        writeCareerApps(priorApps);
        return { okCount: 0, failedCount: uniqueIds.length };
      }

      try {
        await careerGateApi.shortlistApplication(serverAppId);
      } catch {
        writeCareerApps(priorApps);
        return { okCount: 0, failedCount: uniqueIds.length };
      }
    }
  }

  pushCareerActivity({
    postId,
    kind: "candidate_shortlisted",
    title: "Candidates shortlisted",
    body: `${eligible.length} candidate(s) shortlisted for ${post.jobTitle}.`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  for (const app of eligible) {
    notifyCrossRole({
      type: "CAREER_EMPLOYEE_SHORTLISTED",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      appId: app.id,
      severity: "urgent",
      title: "Shortlisted",
      body: `Your application for ${post.jobTitle} at ${post.companyName} has been shortlisted.`,
      route: ROUTE_PATHS.employeeCareerApplications,
    });
  }

  return {
    okCount: eligible.length,
    failedCount: Math.max(0, uniqueIds.length - eligible.length),
  };
}
