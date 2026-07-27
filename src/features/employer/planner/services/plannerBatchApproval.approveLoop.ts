/** Job Mitra | plannerBatchApproval.approveLoop.ts — fail-fast confirm under batch lock */

import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import {
  employerShiftStorage,
  type EmployeeShiftApplication,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import {
  confirmPlannerApplicationNative,
  hasRealShiftPost,
} from "../../../shared/planner/services/plannerNativeApplication.helpers";
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";

type BatchApproveContext = {
  planId: string;
  workerName: string;
  workerMlId: string;
  applications: EmployeeShiftApplication[];
};

const PENDING: ReadonlySet<string> = new Set(["applied", "shortlisted", "waiting"]);

export async function runApproveConfirmLoop(params: {
  planApplyBatchId: string;
  batch: BatchApproveContext;
  softCapacityOverride: boolean;
  softWarnNeedsConfirm: boolean;
  membershipId: string;
  livePending: EmployeeShiftApplication[];
}): Promise<{ processed: number; failed: number }> {
  const {
    planApplyBatchId,
    batch,
    softCapacityOverride,
    softWarnNeedsConfirm,
    membershipId,
    livePending,
  } = params;

  let processed = 0;
  let failed = 0;

  for (const app of livePending) {
    try {
      let ok = false;
      if (hasRealShiftPost(app.postId)) {
        const workspaceId = await employerShiftStorage.confirmCandidate(app.postId, app.id);
        ok = Boolean(workspaceId);
      } else {
        ok = confirmPlannerApplicationNative(app.id);
      }
      if (ok) {
        processed += 1;
      } else {
        failed += 1;
        break;
      }
    } catch {
      failed += 1;
      break;
    }
  }

  if (processed > 0) {
    const plan = demandPlannerStorage.getById(batch.planId);
    plannerPublicIndex.refreshOpenCounts(batch.planId);
    appendPlannerAudit({
      planId: batch.planId,
      actor: "employer",
      actorMlId: plan?.legalEntityMlId,
      siteManagerId: plan?.siteManagerId,
      action: "batch_approved",
      summary:
        failed > 0
          ? `Batch partial · ${processed} ok, ${failed} failed · ${batch.workerName} (retry remaining)`
          : `Batch approved · ${processed} day(s) · ${batch.workerName}`,
      meta: {
        planApplyBatchId,
        processed,
        failed,
        workerMlId: batch.workerMlId,
        nativePath: batch.applications.some((a) => !hasRealShiftPost(a.postId)),
        softCapacityOverride: Boolean(softCapacityOverride && softWarnNeedsConfirm),
        soMembershipId: membershipId,
        healHint: failed > 0 ? "re_approve_remaining_pending" : "none",
      },
    });
  }

  return { processed, failed };
}

export function filterPendingApps(apps: EmployeeShiftApplication[]): EmployeeShiftApplication[] {
  return apps.filter((a) => PENDING.has(a.status));
}
