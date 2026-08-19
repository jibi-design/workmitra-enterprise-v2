/** Job Mitra | archiveShiftOpsGroup.ts | Close / archive Shift Ops site after reviews */

import { enqueueShiftRetry } from "../../../shared/shift/shiftRetryQueue";
import {
  getSiteMembershipTruth,
  upsertSiteMembershipTruth,
} from "../../shiftOps/storage/siteMembershipTruth.storage";
import { isShiftApiSyncEnabled, shiftGateApi } from "./shiftGateApi.service";
import { isShiftServerUuid } from "../utils/shiftIdBridge";

export async function archiveShiftOpsGroup(input: {
  siteId: string;
  workerMlId: string;
  jobPostKeys?: string[];
}): Promise<{ ok: boolean }> {
  const siteId = input.siteId.trim();
  const workerMlId = input.workerMlId.trim();
  if (siteId && workerMlId) {
    const prior = getSiteMembershipTruth(siteId, workerMlId);
    upsertSiteMembershipTruth({
      siteId,
      workerMlId,
      membershipId: prior?.membershipId ?? "local-archive",
      status: "revoked",
    });
  }

  if (!isShiftApiSyncEnabled() || !isShiftServerUuid(siteId)) {
    return { ok: Boolean(siteId) };
  }

  try {
    const result = await shiftGateApi.archiveSite(siteId, input.jobPostKeys ?? []);
    return { ok: result.archived };
  } catch {
    enqueueShiftRetry("post_complete_side_effect", { siteId, step: "archive_site" });
    return { ok: false };
  }
}
