// App name: Job Mitra
// Cascade-reject open applications when a post closes or fills (Wave 1 SC-2)

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../../features/pulse/pulseEventBridge";
import { readCareerApps, writeCareerApps } from "../helpers/careerNormalizers";
import { hasSimilarCareerNote, pushCareerActivity } from "../helpers/careerNotifications";
import type { CareerApplicationStage } from "../types/careerTypes";

const OPEN_STAGES = new Set<CareerApplicationStage>([
  "applied",
  "shortlisted",
  "interview",
  "offered",
  "offer_accepted",
]);

export function cascadeRejectOpenCareerApplications(params: {
  postId: string;
  jobTitle: string;
  companyName: string;
  reason: string;
  excludeAppId?: string;
}): number {
  const { postId, jobTitle, companyName, reason, excludeAppId } = params;
  const apps = readCareerApps();
  const now = Date.now();
  let rejectedCount = 0;

  const next = apps.map((app) => {
    if (app.jobId !== postId) return app;
    if (excludeAppId && app.id === excludeAppId) return app;
    if (!OPEN_STAGES.has(app.stage)) return app;

    rejectedCount += 1;
    return {
      ...app,
      stage: "rejected" as const,
      rejectionReason: reason,
      rejectedAt: now,
      updatedAt: now,
    };
  });

  if (rejectedCount === 0) return 0;

  const writeResult = writeCareerApps(next);
  if (!writeResult.ok) return 0;

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

  return rejectedCount;
}
