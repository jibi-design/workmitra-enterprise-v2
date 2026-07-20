// Job Mitra | plannerDiarySync.service.ts | Section 6.10.4

import type { ShiftPost } from "../../../employer/shiftJobs/storage/employerShift.types";
import type { EmployeeShiftApplication } from "../../../employer/shiftJobs/storage/employerShift.types";
import { findWorkspaceIdForPostAndWorker } from "../../../employer/shiftJobs/helpers/directInviteWorkspace.helpers";
import { readPlannerPublicPlanName } from "../../../employer/planner/storage/plannerPublicIndex.read";
import { personalCalendarShiftStorage } from "../../shiftJobs/storage/personalCalendarShift.storage";

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

    const workerWmId = application.profileSnapshot?.uniqueId?.trim();
    if (!workerWmId) return { ok: true };

    const planName = readPlannerPublicPlanName(post.planId) ?? post.jobName;
    const workspaceId = findWorkspaceIdForPostAndWorker(post.id, workerWmId) ?? undefined;

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
