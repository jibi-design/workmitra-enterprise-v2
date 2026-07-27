/**
 * Job Mitra | plannerComplete.service.ts
 * Mark plan completed — localStorage-first saga (A5). Vault closure + review + pulse (A1/A2).
 */

import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { notifyCrossRole } from "../../../pulse/pulseEventBridge";
import { reviewCenterStorage } from "../../../shared/reviewCenter/storage/reviewCenter.storage";
import { readEmployeeApplications } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { recordPlannerPlanCompletedInVault } from "../../../shared/planner/plannerVault";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { plannerPublicIndex } from "../storage/plannerPublicIndex.storage";
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";

export type MarkPlanCompletedResult =
  { ok: true; closedWorkers: number } | { ok: false; reason: string; step: number };

export function markPlanCompletedSaga(planId: string): MarkPlanCompletedResult {
  const id = planId.trim();
  const plan = demandPlannerStorage.getById(id);
  if (!plan) return { ok: false, reason: "not_found", step: 1 };
  if (plan.status !== "active") return { ok: false, reason: "not_active", step: 1 };

  const priorStatus = plan.status;
  const priorCompletedAt = plan.completedAt;

  // Step 1 — CRITICAL: local plan status
  const updated = demandPlannerStorage.updatePlan(id, {
    status: "completed",
    completedAt: Date.now(),
  });
  if (!updated.ok) return { ok: false, reason: updated.reason, step: 1 };

  // Remove from employee discovery (index only supports active|cancelled)
  try {
    plannerPublicIndex.cancel(id);
  } catch {
    /* TIER: ADVISORY */ console.warn("[PlannerComplete] public index cancel failed", id);
  }

  // Step 2 — CRITICAL: vault plan-closure for confirmed workers
  let closedWorkers = 0;
  try {
    const confirmed = readEmployeeApplications().filter(
      (a) => a.planId === id && a.status === "confirmed",
    );
    const workerIds = new Set(
      confirmed
        .map((a) => a.profileSnapshot?.uniqueId?.trim())
        .filter((ml): ml is string => Boolean(ml)),
    );
    for (const workerMlId of workerIds) {
      const entry = recordPlannerPlanCompletedInVault({ planId: id, employeeMlId: workerMlId });
      if (entry) closedWorkers += 1;
    }
  } catch {
    demandPlannerStorage.updatePlan(id, {
      status: priorStatus,
      completedAt: priorCompletedAt,
    });
    return { ok: false, reason: "vault_closure_failed", step: 2 };
  }

  appendPlannerAudit({
    planId: id,
    actor: "employer",
    actorMlId: plan.legalEntityMlId,
    siteManagerId: plan.siteManagerId,
    action: "plan_completed",
    summary: `Plan marked completed · ${closedWorkers} vault closure(s)`,
    meta: { closedWorkers },
  });

  // Step 3 — IMPORTANT: employer pulse (existing notifyCrossRole API)
  try {
    notifyCrossRole({
      type: "SYSTEM_ALERT",
      domain: "system",
      affectedUserRole: "employer",
      targetId: id,
      severity: "success",
      title: "Plan completed",
      body: `${plan.name} is marked complete. Review requests were queued for confirmed workers.`,
      route: ROUTE_PATHS.employerPlannerDetail.replace(":planId", id),
    });
  } catch {
    /* TIER: IMPORTANT */ console.warn("[PlannerComplete] pulse failed", id);
  }

  // Step 4 — IMPORTANT: Review Center (planner domain) — match shift createRequest pattern
  try {
    const workers = new Set(
      readEmployeeApplications()
        .filter((a) => a.planId === id && a.status === "confirmed")
        .map((a) => a.profileSnapshot?.uniqueId?.trim())
        .filter((ml): ml is string => Boolean(ml)),
    );
    for (const workerMlId of workers) {
      reviewCenterStorage.createRequest({
        domain: "planner",
        sourceId: `${id}:${workerMlId}`,
        sourceTitle: plan.name,
        fromRole: "employer",
        toRole: "employee",
        action: "employer_request_employee_review",
      });
      reviewCenterStorage.createRequest({
        domain: "planner",
        sourceId: `${id}:${workerMlId}`,
        sourceTitle: plan.name,
        fromRole: "employee",
        toRole: "employer",
        action: "employee_request_employer_rating",
      });
    }
  } catch {
    /* TIER: IMPORTANT */ console.warn("[PlannerComplete] review center failed", id);
  }

  return { ok: true, closedWorkers };
}
