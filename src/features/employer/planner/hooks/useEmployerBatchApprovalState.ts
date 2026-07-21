/** Job Mitra | useEmployerBatchApprovalState.ts | Hybrid A2 S4 Batch Approval Engine */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { demandPlannerStorage } from "../storage/demandPlannerStorage";
import {
  approvePlannerApplicationBatch,
  listPlannerApplicationBatches,
  rejectPlannerApplicationBatch,
  type PlannerApplicationBatch,
} from "../services/plannerBatchApproval.service";

const APPS_CHANGED = "wm:employee-shift-applications-changed";
const PLANS_CHANGED = "wm:employer-demand-plans-changed";
const POSTS_CHANGED = "wm:employer-shift-posts-changed";

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

let batchesCacheKey = "";
let batchesCache: PlannerApplicationBatch[] = [];

function getBatchesSnapshot(): PlannerApplicationBatch[] {
  // Force recompute when storage events fire; include plan count for cache bust.
  const plans = demandPlannerStorage.getAll();
  const batches = listPlannerApplicationBatches();
  const key = `${plans.length}:${batches.map((b) => `${b.planApplyBatchId}:${b.reviewStatus}:${b.pendingCount}`).join("|")}`;
  if (key === batchesCacheKey && batchesCacheKey !== "") return batchesCache;
  batchesCacheKey = key;
  batchesCache = batches;
  return batchesCache;
}

export function useEmployerBatchApprovalState() {
  const nav = useNavigate();
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const batches = useSyncExternalStore(
    subscribeBatchSources,
    getBatchesSnapshot,
    getBatchesSnapshot,
  );

  const visible = useMemo(() => {
    if (filter === "all") return batches;
    return batches.filter((b) => b.reviewStatus === "pending" || b.reviewStatus === "partial");
  }, [batches, filter]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  const approveBatch = useCallback(
    async (batchId: string) => {
      setBusyBatchId(batchId);
      try {
        const result = await approvePlannerApplicationBatch(batchId);
        batchesCacheKey = "";
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
    [nav, showToast],
  );

  const rejectBatch = useCallback(
    (batchId: string) => {
      setBusyBatchId(batchId);
      try {
        const result = rejectPlannerApplicationBatch(batchId);
        batchesCacheKey = "";
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
    [showToast],
  );

  return {
    batches: visible,
    totalBatches: batches.length,
    pendingCount: batches.filter(
      (b) => b.reviewStatus === "pending" || b.reviewStatus === "partial",
    ).length,
    filter,
    setFilter,
    busyBatchId,
    toast,
    clearToast: () => setToast(""),
    approveBatch,
    rejectBatch,
  };
}
