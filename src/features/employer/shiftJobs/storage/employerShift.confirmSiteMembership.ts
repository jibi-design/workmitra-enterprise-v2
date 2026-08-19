// App name: Job Mitra
// File name: employerShift.confirmSiteMembership.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\storage\employerShift.confirmSiteMembership.ts

import { buildShiftOpsGroupDisplayName } from "../helpers/shiftOpsGroupDisplayName";
import { ensureShiftOpsSiteForPost } from "../../../shiftOps/services/ensureSiteForShiftPost.service";
import {
  getSiteMembershipTruth,
  provisionLocalSiteMembership,
  provisionSiteMembership,
} from "../../../shared/shiftOps/shiftJobsMembershipBridge";
import type { ShiftPost } from "./employerShift.types";
import { getEmployerShiftPost, updateEmployerShiftPost } from "./employerShift.postActions.crud";

export type BindShiftOpsGroupResult =
  | { ok: true; siteId: string; post: ShiftPost }
  | { ok: false; reason: "site_ensure_failed" | "membership_failed"; post: ShiftPost };

export async function bindShiftOpsGroupAndWorker(input: {
  post: ShiftPost;
  workerMlId: string;
  context: string;
}): Promise<BindShiftOpsGroupResult> {
  const ensured = await ensureShiftOpsSiteForPost({
    postId: input.post.id,
    displayName: buildShiftOpsGroupDisplayName(input.post),
    existingSiteId: input.post.siteId,
    planId: input.post.planId,
    persistSiteId: (siteId) => {
      updateEmployerShiftPost(input.post.id, { siteId });
    },
  });

  if (!ensured.ok) {
    return { ok: false, reason: "site_ensure_failed", post: input.post };
  }

  const livePost =
    getEmployerShiftPost(input.post.id) ?? { ...input.post, siteId: ensured.siteId };
  const existingMembership = getSiteMembershipTruth(ensured.siteId, input.workerMlId);
  if (existingMembership?.membershipId) {
    return { ok: true, siteId: ensured.siteId, post: livePost };
  }

  const provision = import.meta.env.PROD
    ? await provisionSiteMembership({
        siteId: ensured.siteId,
        workerMlId: input.workerMlId,
        planId: livePost.planId?.trim() || undefined,
        context: input.context,
      })
    : await Promise.race([
        provisionSiteMembership({
          siteId: ensured.siteId,
          workerMlId: input.workerMlId,
          planId: livePost.planId?.trim() || undefined,
          context: input.context,
        }),
        new Promise<{ ok: false; code: string; message: string }>((resolve) => {
          window.setTimeout(
            () => resolve({ ok: false, code: "DEV_TIMEOUT", message: "membership timed out" }),
            2_500,
          );
        }),
      ]);

  if (!provision.ok) {
    if (import.meta.env.PROD) {
      return { ok: false, reason: "membership_failed", post: livePost };
    }
    const local = provisionLocalSiteMembership(ensured.siteId, input.workerMlId);
    if (!local.ok) {
      return { ok: false, reason: "membership_failed", post: livePost };
    }
  }

  return { ok: true, siteId: ensured.siteId, post: livePost };
}
