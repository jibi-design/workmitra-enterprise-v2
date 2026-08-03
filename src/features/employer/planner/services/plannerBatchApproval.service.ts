/**
 * Job Mitra | plannerBatchApproval.service.ts
 * Hybrid A2 S4 — Employer Batch Approval Engine (planApplyBatchId).
 * Hybrid A2 S8 — native confirm/reject when dual-write ShiftPost is absent.
 *
 * Confirms/rejects all day applications in a batch without per-day Shift confirm screens.
 */

import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import { plannerPublicIndex } from "../../../shared/planner/plannerPublic";
import {
  employerShiftStorage,
  readEmployeeApplications,
  type EmployeeShiftApplication,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import {
  hasRealShiftPost,
  rejectPlannerApplicationNative,
} from "../../../shared/planner/services/plannerNativeApplication.helpers";
import { appendPlannerAudit } from "../storage/plannerAuditLog.storage";
import {
  claimBatchActionLock,
  releaseBatchActionLock,
} from "../../../shared/planner/services/plannerConcurrency.service";
import {
  probeAppsCapacitySoftWarn,
  type CapacitySoftWarn,
} from "../helpers/plannerBatchCapacity.helpers";
import {
  isSoSiteUuid,
  provisionSiteMembership,
} from "../../../shared/planner/ports/plannerMembershipBridge";
import { filterPendingApps, runApproveConfirmLoop } from "./plannerBatchApproval.approveLoop";

export type { CapacitySoftWarn };

export type PlannerBatchReviewStatus = "pending" | "partial" | "confirmed" | "rejected" | "closed";

export type PlannerApplicationBatch = {
  planApplyBatchId: string;
  planId: string;
  planName: string;
  companyName: string;
  workerName: string;
  workerMlId: string;
  dayCount: number;
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  reviewStatus: PlannerBatchReviewStatus;
  createdAt: number;
  applications: EmployeeShiftApplication[];
};

const PENDING: ReadonlySet<string> = new Set(["applied", "shortlisted", "waiting"]);

function isPlannerApp(app: EmployeeShiftApplication): boolean {
  return Boolean(app.planId || app.planApplyBatchId);
}

function batchKey(app: EmployeeShiftApplication): string {
  if (app.planApplyBatchId?.trim()) return app.planApplyBatchId.trim();
  const worker = app.profileSnapshot?.uniqueId?.trim() || "unknown";
  return `plan_${app.planId ?? "unknown"}_${worker}`;
}

function resolveReviewStatus(apps: EmployeeShiftApplication[]): PlannerBatchReviewStatus {
  const pending = apps.filter((a) => PENDING.has(a.status)).length;
  const confirmed = apps.filter((a) => a.status === "confirmed").length;
  const rejected = apps.filter(
    (a) => a.status === "rejected" || a.status === "withdrawn" || a.status === "replaced",
  ).length;

  if (pending > 0 && (confirmed > 0 || rejected > 0)) return "partial";
  if (pending > 0) return "pending";
  if (confirmed === apps.length) return "confirmed";
  if (rejected === apps.length) return "rejected";
  return "closed";
}

export function listPlannerApplicationBatches(): PlannerApplicationBatch[] {
  const employerPlanIds = new Set(demandPlannerStorage.getAll().map((p) => p.id));
  const apps = readEmployeeApplications().filter(
    (app) => isPlannerApp(app) && app.planId && employerPlanIds.has(app.planId),
  );

  const byBatch = new Map<string, EmployeeShiftApplication[]>();
  for (const app of apps) {
    const key = batchKey(app);
    const list = byBatch.get(key) ?? [];
    list.push(app);
    byBatch.set(key, list);
  }

  const batches: PlannerApplicationBatch[] = [];

  for (const [planApplyBatchId, applications] of byBatch) {
    const sorted = [...applications].sort((a, b) => a.createdAt - b.createdAt);
    const planId = sorted[0]?.planId ?? "";
    const plan = demandPlannerStorage.getById(planId);
    const indexEntry = plannerPublicIndex.getByPlanId(planId);
    const pendingCount = sorted.filter((a) => PENDING.has(a.status)).length;
    const confirmedCount = sorted.filter((a) => a.status === "confirmed").length;
    const rejectedCount = sorted.filter(
      (a) => a.status === "rejected" || a.status === "withdrawn" || a.status === "replaced",
    ).length;

    batches.push({
      planApplyBatchId,
      planId,
      planName: plan?.name ?? indexEntry?.planName ?? "Project Plan",
      companyName: plan?.companyName ?? indexEntry?.companyName ?? "Employer",
      workerName: sorted[0]?.profileSnapshot?.fullName?.trim() || "Worker",
      workerMlId: sorted[0]?.profileSnapshot?.uniqueId?.trim() || "",
      dayCount: sorted.length,
      pendingCount,
      confirmedCount,
      rejectedCount,
      reviewStatus: resolveReviewStatus(sorted),
      createdAt: Math.max(...sorted.map((a) => a.createdAt)),
      applications: sorted,
    });
  }

  return batches.sort((a, b) => b.createdAt - a.createdAt);
}

export type BatchActionResult = {
  ok: boolean;
  processed: number;
  failed: number;
  reason?: string;
};

export function getBatchCapacitySoftWarn(planApplyBatchId: string): CapacitySoftWarn | null {
  const batch = listPlannerApplicationBatches().find(
    (b) => b.planApplyBatchId === planApplyBatchId,
  );
  if (!batch) return null;
  const plan = demandPlannerStorage.getById(batch.planId);
  if (!plan) return null;
  const pending = batch.applications.filter((a) => PENDING.has(a.status));
  return probeAppsCapacitySoftWarn(plan, pending);
}

export async function approvePlannerApplicationBatch(
  planApplyBatchId: string,
  options?: { softCapacityOverride?: boolean },
): Promise<BatchActionResult> {
  const batch = listPlannerApplicationBatches().find(
    (b) => b.planApplyBatchId === planApplyBatchId,
  );
  if (!batch) return { ok: false, processed: 0, failed: 0, reason: "not_found" };

  const pending = batch.applications.filter((a) => PENDING.has(a.status));
  if (pending.length === 0) {
    return { ok: false, processed: 0, failed: 0, reason: "nothing_pending" };
  }

  const plan = demandPlannerStorage.getById(batch.planId);
  const softWarn = plan ? probeAppsCapacitySoftWarn(plan, pending) : null;
  // Wave-3: hard-cap — soft override can no longer overfill native confirms
  if (softWarn?.hardBlocked) {
    return { ok: false, processed: 0, failed: 0, reason: "capacity_full" };
  }
  if (softWarn?.needsConfirm && options?.softCapacityOverride) {
    appendPlannerAudit({
      planId: batch.planId,
      actor: "employer",
      actorMlId: plan?.legalEntityMlId,
      siteManagerId: plan?.siteManagerId,
      action: "capacity_soft_override",
      summary: softWarn.message,
      meta: {
        planApplyBatchId,
        confirmed: softWarn.confirmed,
        allowed: softWarn.allowed,
        slotDate: softWarn.slotDate,
      },
    });
  }

  const claim = claimBatchActionLock(planApplyBatchId, "approve");
  if (!claim.ok) {
    return { ok: false, processed: 0, failed: 0, reason: "locked" };
  }

  let processed = 0;
  let failed = 0;

  try {
    const siteId = plan?.siteId?.trim() ?? "";
    const workerMlId = batch.workerMlId.trim();
    if (!siteId || !isSoSiteUuid(siteId) || !workerMlId) {
      return { ok: false, processed: 0, failed: 0, reason: "site_membership_required" };
    }

    const provision = await provisionSiteMembership({
      siteId,
      workerMlId,
      planId: batch.planId,
      context: "planner_batch_approve",
    });
    if (!provision.ok) {
      return { ok: false, processed: 0, failed: 0, reason: "site_membership_provision_failed" };
    }

    const liveBatch = listPlannerApplicationBatches().find(
      (b) => b.planApplyBatchId === planApplyBatchId,
    );
    const livePending = filterPendingApps(liveBatch?.applications ?? []);
    if (livePending.length === 0) {
      return { ok: false, processed: 0, failed: 0, reason: "nothing_pending" };
    }

    const loop = await runApproveConfirmLoop({
      planApplyBatchId,
      batch,
      softCapacityOverride: Boolean(options?.softCapacityOverride),
      softWarnNeedsConfirm: Boolean(softWarn?.needsConfirm),
      membershipId: provision.membershipId,
      livePending,
    });
    processed = loop.processed;
    failed = loop.failed;

    return {
      ok: failed === 0 && processed > 0,
      processed,
      failed,
      reason: failed > 0 ? "partial_failure" : undefined,
    };
  } finally {
    releaseBatchActionLock(planApplyBatchId, "approve", claim.token);
  }
}

export function rejectPlannerApplicationBatch(planApplyBatchId: string): BatchActionResult {
  const batch = listPlannerApplicationBatches().find(
    (b) => b.planApplyBatchId === planApplyBatchId,
  );
  if (!batch) return { ok: false, processed: 0, failed: 0, reason: "not_found" };

  const pending = batch.applications.filter((a) => PENDING.has(a.status));
  if (pending.length === 0) {
    return { ok: false, processed: 0, failed: 0, reason: "nothing_pending" };
  }

  const claim = claimBatchActionLock(planApplyBatchId, "reject");
  if (!claim.ok) {
    return { ok: false, processed: 0, failed: 0, reason: "locked" };
  }

  try {
    let processed = 0;
    for (const app of pending) {
      if (hasRealShiftPost(app.postId)) {
        employerShiftStorage.rejectCandidate(app.postId, app.id);
        processed += 1;
      } else if (rejectPlannerApplicationNative(app.id)) {
        processed += 1;
      }
    }

    if (processed > 0) {
      plannerPublicIndex.refreshOpenCounts(batch.planId);
      const plan = demandPlannerStorage.getById(batch.planId);
      appendPlannerAudit({
        planId: batch.planId,
        actor: "employer",
        actorMlId: plan?.legalEntityMlId,
        siteManagerId: plan?.siteManagerId,
        action: "batch_rejected",
        summary: `Batch rejected · ${processed} day(s) · ${batch.workerName}`,
        meta: {
          planApplyBatchId,
          processed,
          workerMlId: batch.workerMlId,
        },
      });
    }

    return { ok: processed > 0, processed, failed: 0 };
  } finally {
    releaseBatchActionLock(planApplyBatchId, "reject", claim.token);
  }
}
