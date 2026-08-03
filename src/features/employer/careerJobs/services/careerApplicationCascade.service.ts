// App name: Job Mitra
// Cascade-reject open applications when a post closes or fills (Wave 1 SC-2)
// B-P0-5: AUTH dual-write via careerGateApi.updateApplicationStatus + LS rollback

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
import type { CareerApplication, CareerApplicationStage } from "../types/careerTypes";

const OPEN_STAGES = new Set<CareerApplicationStage>([
  "applied",
  "shortlisted",
  "interview",
  "offered",
  "offer_accepted",
]);

export type CascadeRejectResult = {
  rejectedCount: number;
  /** False when AUTH dual-write failed and LS cascade was rolled back. */
  ok: boolean;
  reason?: "storage_error" | "api_error";
};

export async function cascadeRejectOpenCareerApplications(params: {
  postId: string;
  jobTitle: string;
  companyName: string;
  reason: string;
  excludeAppId?: string;
}): Promise<CascadeRejectResult> {
  const { postId, jobTitle, companyName, reason, excludeAppId } = params;
  const apps = readCareerApps();
  const priorApps = apps;
  const now = Date.now();
  const rejectedApps: CareerApplication[] = [];

  const next = apps.map((app) => {
    if (app.jobId !== postId) return app;
    if (excludeAppId && app.id === excludeAppId) return app;
    if (!OPEN_STAGES.has(app.stage)) return app;

    const updated: CareerApplication = {
      ...app,
      stage: "rejected",
      rejectionReason: reason,
      rejectedAt: now,
      updatedAt: now,
    };
    rejectedApps.push(updated);
    return updated;
  });

  if (rejectedApps.length === 0) {
    return { rejectedCount: 0, ok: true };
  }

  const writeResult = writeCareerApps(next);
  if (!writeResult.ok) {
    return { rejectedCount: 0, ok: false, reason: "storage_error" };
  }

  if (isCareerApiSyncEnabled()) {
    const serverPostId = resolveCareerGatePostId(postId);
    if (!serverPostId) {
      writeCareerApps(priorApps);
      return { rejectedCount: 0, ok: false, reason: "api_error" };
    }

    for (const app of rejectedApps) {
      const serverAppId = resolveCareerGateApplicationId(app.id);
      if (!serverAppId) {
        writeCareerApps(priorApps);
        return { rejectedCount: 0, ok: false, reason: "api_error" };
      }

      try {
        await careerGateApi.updateApplicationStatus(serverPostId, serverAppId, "rejected");
      } catch {
        writeCareerApps(priorApps);
        return { rejectedCount: 0, ok: false, reason: "api_error" };
      }
    }
  }

  const rejectedCount = rejectedApps.length;

  pushCareerActivity({
    postId,
    kind: "candidate_rejected",
    title: "Open applications closed",
    body: `${rejectedCount} open application(s) closed for ${jobTitle}. Reason: ${reason}`,
    route: ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", postId),
  });

  // One summary pulse — never N synchronous notifyCrossRole/LS writes (SC-2).
  const signature = `[CAREER_APPLICATIONS_CLOSED:${postId}:${now}]`;
  if (!hasSimilarCareerNote(signature)) {
    notifyCrossRole({
      type: "CAREER_APPLICATION_REJECTED",
      domain: "career",
      affectedUserRole: "employee",
      postId,
      title: "Application update",
      body: `${signature} ${rejectedCount} application(s) for ${jobTitle} at ${companyName} were closed. ${reason}`,
      route: ROUTE_PATHS.employeeCareerApplications,
    });
  }

  return { rejectedCount, ok: true };
}
