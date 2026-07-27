/** Job Mitra | useEmployerBatchApprovalState.ts | Hybrid A2 S4 Batch Approval Engine */

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import {
  approvePlannerApplicationBatch,
  getBatchCapacitySoftWarn,
  listPlannerApplicationBatches,
  rejectPlannerApplicationBatch,
  type PlannerApplicationBatch,
} from "../services/plannerBatchApproval.service";
import { shortlistPlannerApplicationBatch } from "../services/plannerBatchShortlist.service";
import {
  approveAllShortlistedBatches,
  movePlannerBatchToWaiting,
} from "../services/plannerWaitingList.service";
import { computePlanFillMetrics } from "../../../shared/planner/services/plannerFillMetrics.helpers";
import { readEmployeeApplications } from "../../../shared/planner/ports/plannerLegacyShiftBridge";

const APPS_CHANGED = "wm:employee-shift-applications-changed";
const PLANS_CHANGED = "wm:employer-demand-plans-changed";
const POSTS_CHANGED = "wm:employer-shift-posts-changed";

export type BatchFilter = "all" | "pending" | "shortlisted" | "approved" | "rejected";

function subscribeBatchSources(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(APPS_CHANGED, handler);
  window.addEventListener(PLANS_CHANGED, handler);
  window.addEventListener(POSTS_CHANGED, handler);
  return () => {
    window.removeEventListener(APPS_CHANGED, handler);
    window.removeEventListener(PLANS_CHANGED, handler);
    window.removeEventListener(POSTS_CHANGED, handler);
  };
}

function buildBatchesCacheKey(plansLen: number, batches: PlannerApplicationBatch[]): string {
  return `${plansLen}:${batches.map((b) => `${b.planApplyBatchId}:${b.reviewStatus}:${b.pendingCount}`).join("|")}`;
}

function matchesFilter(batch: PlannerApplicationBatch, filter: BatchFilter): boolean {
  if (filter === "all") return true;
  if (filter === "pending") {
    return batch.reviewStatus === "pending" || batch.reviewStatus === "partial";
  }
  if (filter === "shortlisted") {
    return batch.applications.some((a) => a.status === "shortlisted");
  }
  if (filter === "approved") return batch.reviewStatus === "confirmed";
  if (filter === "rejected") return batch.reviewStatus === "rejected";
  return true;
}

export function useEmployerBatchApprovalState() {
  const nav = useNavigate();
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<BatchFilter>("pending");
  const [confirm, setConfirm] = useState<ConfirmData | null>(null);
  const confirmResolverRef = useRef<((ok: boolean) => void) | null>(null);
  // P0-3 — per-hook cache (never module-global shared across mounts)
  const batchesCacheRef = useRef<{ key: string; list: PlannerApplicationBatch[] }>({
    key: "",
    list: [],
  });

  const getBatchesSnapshot = useCallback((): PlannerApplicationBatch[] => {
    const plans = demandPlannerStorage.getAll();
    const batches = listPlannerApplicationBatches();
    const key = buildBatchesCacheKey(plans.length, batches);
    if (key === batchesCacheRef.current.key && batchesCacheRef.current.key !== "") {
      return batchesCacheRef.current.list;
    }
    batchesCacheRef.current = { key, list: batches };
    return batchesCacheRef.current.list;
  }, []);

  const invalidateBatchesCache = useCallback(() => {
    batchesCacheRef.current = { key: "", list: [] };
  }, []);

  const askConfirm = useCallback((data: ConfirmData): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirm(data);
    });
  }, []);

  const resolveConfirm = useCallback((ok: boolean) => {
    const resolver = confirmResolverRef.current;
    confirmResolverRef.current = null;
    setConfirm(null);
    resolver?.(ok);
  }, []);

  const batches = useSyncExternalStore(
    subscribeBatchSources,
    getBatchesSnapshot,
    getBatchesSnapshot,
  );

  const visible = useMemo(() => batches.filter((b) => matchesFilter(b, filter)), [batches, filter]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  const approveBatch = useCallback(
    async (batchId: string) => {
      const softWarn = getBatchCapacitySoftWarn(batchId);
      let softCapacityOverride = false;
      if (softWarn?.needsConfirm) {
        const ok = await askConfirm({
          title: "Soft capacity warning",
          message: softWarn.message,
          tone: "warn",
          confirmLabel: "Approve anyway",
          cancelLabel: "Keep reviewing",
        });
        if (!ok) return;
        softCapacityOverride = true;
      }

      setBusyBatchId(batchId);
      try {
        const result = await approvePlannerApplicationBatch(batchId, { softCapacityOverride });
        invalidateBatchesCache();
        window.dispatchEvent(new Event(APPS_CHANGED));
        if (result.ok) {
          showToast(`Batch approved · ${result.processed} day(s) confirmed`);
          nav(ROUTE_PATHS.employerPlannerRoster);
          return;
        }
        if (result.reason === "nothing_pending") {
          showToast("Nothing left to approve in this batch.");
          return;
        }
        if (result.processed > 0) {
          showToast(`Partial approve · ${result.processed} ok, ${result.failed} failed`);
          nav(ROUTE_PATHS.employerPlannerRoster);
          return;
        }
        showToast("Could not approve this batch. Try again.");
      } finally {
        setBusyBatchId(null);
      }
    },
    [askConfirm, invalidateBatchesCache, nav, showToast],
  );

  const rejectBatch = useCallback(
    (batchId: string) => {
      setBusyBatchId(batchId);
      try {
        const result = rejectPlannerApplicationBatch(batchId);
        invalidateBatchesCache();
        window.dispatchEvent(new Event(APPS_CHANGED));
        if (result.ok) {
          showToast(`Batch rejected · ${result.processed} day(s)`);
          return;
        }
        if (result.reason === "nothing_pending") {
          showToast("Nothing left to reject in this batch.");
          return;
        }
        showToast("Could not reject this batch.");
      } finally {
        setBusyBatchId(null);
      }
    },
    [invalidateBatchesCache, showToast],
  );

  const shortlistBatch = useCallback(
    (batchId: string) => {
      setBusyBatchId(batchId);
      try {
        const result = shortlistPlannerApplicationBatch(batchId);
        invalidateBatchesCache();
        window.dispatchEvent(new Event(APPS_CHANGED));
        if (result.ok) {
          showToast(`Shortlisted · ${result.processed} day(s)`);
          return;
        }
        showToast("Nothing to shortlist in this batch.");
      } finally {
        setBusyBatchId(null);
      }
    },
    [invalidateBatchesCache, showToast],
  );

  const moveToWaiting = useCallback(
    (batchId: string) => {
      setBusyBatchId(batchId);
      try {
        const result = movePlannerBatchToWaiting(batchId);
        invalidateBatchesCache();
        window.dispatchEvent(new Event(APPS_CHANGED));
        showToast(
          result.ok
            ? `Moved to waiting · ${result.processed} day(s)`
            : "Nothing movable to waiting list.",
        );
      } finally {
        setBusyBatchId(null);
      }
    },
    [invalidateBatchesCache, showToast],
  );

  const approveAllShortlisted = useCallback(async () => {
    setBusyBatchId("approve-all-shortlisted");
    try {
      const softOk = await askConfirm({
        title: "Approve all shortlisted?",
        message: "Approve all shortlisted batches? Soft capacity overrides may apply.",
        tone: "warn",
        confirmLabel: "Approve all",
        cancelLabel: "Cancel",
      });
      if (!softOk) return;
      const result = await approveAllShortlistedBatches();
      invalidateBatchesCache();
      window.dispatchEvent(new Event(APPS_CHANGED));
      showToast(
        result.ok
          ? `Approved shortlisted · ${result.processed} day(s) across ${result.batches} batch(es)`
          : "No shortlisted batches to approve.",
      );
      if (result.ok) nav(ROUTE_PATHS.employerPlannerRoster);
    } finally {
      setBusyBatchId(null);
    }
  }, [askConfirm, invalidateBatchesCache, nav, showToast]);

  const assignBatchToRoleGroup = useCallback(
    (batchId: string, roleGroupId: string) => {
      const batch = batches.find((b) => b.planApplyBatchId === batchId);
      if (!batch || !batch.workerMlId || !roleGroupId) return;
      const ok = demandPlannerStorage.assignWorkerToRoleGroup(
        batch.planId,
        roleGroupId,
        batch.workerMlId,
      );
      showToast(ok ? "Assigned to role group" : "Could not assign role group");
    },
    [batches, showToast],
  );

  const fillByPlan = useMemo(() => {
    const map = new Map<string, { confirmed: number; needed: number; pct: number }>();
    for (const batch of batches) {
      if (map.has(batch.planId)) continue;
      const plan = demandPlannerStorage.getById(batch.planId);
      if (!plan) continue;
      map.set(batch.planId, computePlanFillMetrics(plan, readEmployeeApplications()));
    }
    return map;
  }, [batches]);

  return {
    batches: visible,
    totalBatches: batches.length,
    pendingCount: batches.filter(
      (b) => b.reviewStatus === "pending" || b.reviewStatus === "partial",
    ).length,
    shortlistedCount: batches.filter((b) => b.applications.some((a) => a.status === "shortlisted"))
      .length,
    filter,
    setFilter,
    busyBatchId,
    toast,
    clearToast: () => setToast(""),
    approveBatch,
    rejectBatch,
    shortlistBatch,
    moveToWaiting,
    approveAllShortlisted,
    assignBatchToRoleGroup,
    fillByPlan,
    confirm,
    resolveConfirm,
  };
}
