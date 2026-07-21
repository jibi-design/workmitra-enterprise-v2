// Job Mitra | plannerDiarySync.service.ts | Section 6.10.4

import type {
  ShiftPostPublic as ShiftPost,
  EmployeeShiftApplicationPublic as EmployeeShiftApplication,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { findWorkspaceIdForPostAndWorkerPublic as findWorkspaceIdForPostAndWorker } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { readPlannerPublicPlanName } from "../../../shared/planner/plannerPublic";
import { personalCalendarShiftStorage } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

function dateKeyFromPost(startAt: number): string {
  const d = new Date(startAt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DiaryUpsertResult = { ok: true } | { ok: false; reason: "storage_error" };

export const plannerDiarySyncService = {
  upsertConfirmedDay(post: ShiftPost, application: EmployeeShiftApplication): DiaryUpsertResult {
    if (post.source !== "planner" || !post.planId) return { ok: true };

    const workerMlId = application.profileSnapshot?.uniqueId?.trim();
    if (!workerMlId) return { ok: true };

    const planName = readPlannerPublicPlanName(post.planId) ?? post.jobName;
    const workspaceId = findWorkspaceIdForPostAndWorker(post.id, workerMlId) ?? undefined;

    try {
      personalCalendarShiftStorage.upsert({
        id: `pcs_${post.id}_${application.id}`,
        dateKey: post.planSlotDate ?? dateKeyFromPost(post.startAt),
        domain: "shift",
        source: "planner",
        planId: post.planId,
        planName,
        postId: post.id,
        workspaceId,
        applicationId: application.id,
        jobName: post.jobName,
        companyName: post.companyName,
        payPerDay: post.payPerDay,
        status: "confirmed",
        syncedAt: Date.now(),
        schemaVersion: 1,
      });
      return { ok: true };
    } catch {
      // TIER: CRITICAL — employee confirmed work calendar write failed.
      return { ok: false, reason: "storage_error" };
    }
  },

  markReplaced(postId: string): void {
    personalCalendarShiftStorage.markStatusByPost(postId, "replaced");
  },

  markPlanCancelled(planId: string): void {
    personalCalendarShiftStorage.markPlanCancelled(planId);
  },
};
