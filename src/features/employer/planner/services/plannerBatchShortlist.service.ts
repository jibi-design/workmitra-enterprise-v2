/** Job Mitra | plannerBatchShortlist.service.ts | Planner shortlist (single mutation) */

import { notifyCrossRole } from "../../../pulse/pulseEventBridge";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  readEmployeeApplications,
  writeEmployeeApplications,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";
import { listPlannerApplicationBatches } from "./plannerBatchApproval.service";

const SHORTLISTABLE = new Set(["applied", "waiting", "shortlisted"]);

export function shortlistPlannerApplicant(
  appId: string,
): { ok: true } | { ok: false; reason: string } {
  const id = appId.trim();
  if (!id) return { ok: false, reason: "not_found" };

  const apps = readEmployeeApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx < 0) return { ok: false, reason: "not_found" };

  const app = apps[idx]!;
  if (app.status === "shortlisted") return { ok: true };
  if (!SHORTLISTABLE.has(app.status)) {
    return { ok: false, reason: "not_shortlistable" };
  }

  const next = [...apps];
  next[idx] = { ...app, status: "shortlisted" };
  writeEmployeeApplications(next);

  const planId = app.planId?.trim() ?? "";
  const plan = planId ? demandPlannerStorage.getById(planId) : null;
  if (planId) {
    appendPlannerAudit({
      planId,
      actor: "employer",
      actorMlId: plan?.legalEntityMlId,
      siteManagerId: plan?.siteManagerId,
      action: "batch_shortlisted",
      summary: `Applicant shortlisted · ${app.profileSnapshot?.fullName?.trim() || "Worker"}`,
      meta: { appId: id, workerMlId: app.profileSnapshot?.uniqueId?.trim() || "" },
    });
  }

  try {
    notifyCrossRole({
      type: "SHIFT_EMPLOYEE_SHORTLISTED",
      domain: "shift",
      affectedUserRole: "employee",
      appId: id,
      postId: app.postId,
      severity: "info",
      title: "Shortlisted for project plan",
      body: plan
        ? `You were shortlisted for ${plan.name}. Wait for final approval.`
        : "You were shortlisted for a project plan.",
      route: ROUTE_PATHS.employeePlannerApplications,
    });
  } catch {
    /* TIER: IMPORTANT */ console.warn("[PlannerShortlist] notify failed", id);
  }

  return { ok: true };
}

export function shortlistPlannerApplicationBatch(planApplyBatchId: string): {
  ok: boolean;
  processed: number;
  reason?: string;
} {
  const batch = listPlannerApplicationBatches().find(
    (b) => b.planApplyBatchId === planApplyBatchId,
  );
  if (!batch) return { ok: false, processed: 0, reason: "not_found" };

  let processed = 0;
  for (const app of batch.applications) {
    if (app.status !== "applied" && app.status !== "waiting") continue;
    const result = shortlistPlannerApplicant(app.id);
    if (result.ok) processed += 1;
  }

  return {
    ok: processed > 0,
    processed,
    reason: processed === 0 ? "nothing_pending" : undefined,
  };
}
