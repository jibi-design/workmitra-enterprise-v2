/** Job Mitra | plannerWaitingList.service.ts | Move applicant to waiting status */

import {
  readEmployeeApplications,
  writeEmployeeApplications,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";
import { listPlannerApplicationBatches } from "./plannerBatchApproval.service";

export function movePlannerApplicantToWaiting(
  appId: string,
): { ok: true } | { ok: false; reason: string } {
  const apps = readEmployeeApplications();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx < 0) return { ok: false, reason: "not_found" };
  const app = apps[idx]!;
  if (app.status === "waiting") return { ok: true };
  if (app.status !== "applied" && app.status !== "shortlisted") {
    return { ok: false, reason: "not_movable" };
  }
  const next = [...apps];
  next[idx] = { ...app, status: "waiting" };
  writeEmployeeApplications(next);
  const planId = app.planId?.trim();
  if (planId) {
    const plan = demandPlannerStorage.getById(planId);
    appendPlannerAudit({
      planId,
      actor: "employer",
      actorMlId: plan?.legalEntityMlId,
      action: "batch_shortlisted",
      summary: `Moved to waiting list · ${app.profileSnapshot?.fullName?.trim() || "Worker"}`,
      meta: { appId, waiting: true },
    });
  }
  return { ok: true };
}

export function movePlannerBatchToWaiting(planApplyBatchId: string): {
  ok: boolean;
  processed: number;
} {
  const batch = listPlannerApplicationBatches().find(
    (b) => b.planApplyBatchId === planApplyBatchId,
  );
  if (!batch) return { ok: false, processed: 0 };
  let processed = 0;
  for (const app of batch.applications) {
    if (app.status !== "applied" && app.status !== "shortlisted") continue;
    if (movePlannerApplicantToWaiting(app.id).ok) processed += 1;
  }
  return { ok: processed > 0, processed };
}

export async function approveAllShortlistedBatches(): Promise<{
  ok: boolean;
  processed: number;
  batches: number;
}> {
  const { approvePlannerApplicationBatch } = await import("./plannerBatchApproval.service");
  const batches = listPlannerApplicationBatches().filter((b) =>
    b.applications.some((a) => a.status === "shortlisted"),
  );
  let processed = 0;
  let touched = 0;
  for (const batch of batches) {
    const result = await approvePlannerApplicationBatch(batch.planApplyBatchId, {
      softCapacityOverride: true,
    });
    if (result.processed > 0) {
      touched += 1;
      processed += result.processed;
    }
  }
  return { ok: processed > 0, processed, batches: touched };
}
