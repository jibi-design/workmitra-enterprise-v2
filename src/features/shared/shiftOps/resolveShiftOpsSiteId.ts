/**
 * Job Mitra | resolveShiftOpsSiteId.ts
 * Resolve formal Shift Ops site UUID from a Shift post / plan link.
 */

import { demandPlannerStorage } from "../../employer/planner/storage/demandPlannerStorage";
import { isSoSiteUuid } from "../../shiftOps/services/membershipBridge.service";

export function resolveShiftOpsSiteIdFromPlanId(planId?: string | null): string | null {
  const id = (planId ?? "").trim();
  if (!id) return null;
  const siteId = demandPlannerStorage.getById(id)?.siteId?.trim() ?? "";
  return isSoSiteUuid(siteId) ? siteId : null;
}

export function resolveShiftOpsSiteIdForPost(post: {
  planId?: string | null;
  siteId?: string | null;
}): string | null {
  const direct = (post.siteId ?? "").trim();
  if (isSoSiteUuid(direct)) return direct;
  return resolveShiftOpsSiteIdFromPlanId(post.planId);
}
