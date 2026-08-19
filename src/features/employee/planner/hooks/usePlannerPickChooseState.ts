// Job Mitra | usePlannerPickChooseState.ts
// Wave 1 P0-4 — stable batchId + apply lock + dedupe

import { useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type { PlannerPublicIndexEntry } from "../../../shared/planner/plannerPublic";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employeeAvailabilityService } from "../services/employeeAvailability.service";
import { smartEarningsPredictorService } from "../services/smartEarningsPredictor.service";
import { multiApplyGroup } from "../../../shared/planner/ports/plannerLegacyShiftBridge";
import { plannerCommitmentStreakService } from "../services/plannerCommitmentStreak.service";
import { plannerEmployeeNotifications } from "../services/plannerEmployeeNotifications.service";
import { useSoftAuth } from "../../../../shared/guest/useSoftAuth";
import {
  applicationsContainBatchId,
  claimBatchActionLock,
  hasSeenApplyBatchId,
  markApplyBatchIdSeen,
  releaseBatchActionLock,
} from "../../../shared/planner/services/plannerConcurrency.service";

type Args = {
  entry: PlannerPublicIndexEntry;
  onApplied: (count: number) => void;
  onNeedProfile: () => void;
  isProfileComplete: boolean;
};

function buildStableApplyBatchId(
  planId: string,
  workerMlId: string,
  selectedDates: string[],
): string {
  const worker = workerMlId.trim().toUpperCase() || "anon";
  const dates = [...selectedDates].sort().join(".");
  return `pb_${planId.trim()}_${worker}_${dates}`;
}

export function usePlannerPickChooseState({
  entry,
  onApplied,
  onNeedProfile,
  isProfileComplete,
}: Args) {
  const loc = useLocation();
  const { requireAuthForAction } = useSoftAuth();
  const workerMlId = employeeProfileStorage.get().uniqueId ?? "local-worker";
  const [selectionByPlan, setSelectionByPlan] = useState<Record<string, string[]>>({});
  const planDateKeys = selectionByPlan[entry.planId];
  const submitInFlightRef = useRef(false);

  const availability = useMemo(
    () =>
      employeeAvailabilityService.build({
        workerMlId,
        planId: entry.planId,
        indexEntry: entry,
        initialSelectedDateKeys: planDateKeys ?? [],
      }),
    [workerMlId, entry, planDateKeys],
  );

  const predictor = useMemo(
    () =>
      smartEarningsPredictorService.build({
        availability,
        selectedDateKeys: availability.selectedDateKeys,
      }),
    [availability],
  );

  const selectedOpenDays = availability.days.filter(
    (d) => availability.selectedDateKeys.includes(d.dateKey) && d.selectable,
  );

  function updateSelectedDateKeys(updater: (prev: string[]) => string[]) {
    setSelectionByPlan((prev) => ({
      ...prev,
      [entry.planId]: updater(prev[entry.planId] ?? []),
    }));
  }

  function toggleDay(dateKey: string) {
    updateSelectedDateKeys((prev) => {
      const day = availability.days.find((d) => d.dateKey === dateKey);
      if (!day?.selectable) return prev;

      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);

      return [...next].sort();
    });
  }

  function selectAllOpen() {
    updateSelectedDateKeys(() =>
      availability.days.filter((day) => day.selectable).map((day) => day.dateKey),
    );
  }

  function submit() {
    if (submitInFlightRef.current) return;
    if (
      !requireAuthForAction({
        action: "apply_planner",
        targetId: entry.planId,
        returnPath: `${loc.pathname}${loc.search}`,
        roleHint: "employee",
      })
    ) {
      return;
    }
    if (!isProfileComplete) {
      onNeedProfile();
      return;
    }

    const postIds = selectedOpenDays
      .map((d) => d.applyTargetId ?? d.postId ?? d.slotId)
      .filter((id): id is string => Boolean(id));
    if (postIds.length === 0) return;

    const selectedDates = selectedOpenDays.map((d) => d.dateKey);
    const batchId = buildStableApplyBatchId(entry.planId, workerMlId, selectedDates);

    // P0-4 — same plan+worker+dates must not create a second batch
    if (hasSeenApplyBatchId(batchId) || applicationsContainBatchId(batchId)) {
      onApplied(0);
      return;
    }

    const claim = claimBatchActionLock(batchId, "apply");
    if (!claim.ok) return;

    submitInFlightRef.current = true;
    try {
      if (hasSeenApplyBatchId(batchId) || applicationsContainBatchId(batchId)) {
        onApplied(0);
        return;
      }

      const count = multiApplyGroup(postIds, {
        planId: entry.planId,
        planApplyBatchId: batchId,
        selectedDates,
      });

      if (count > 0) {
        markApplyBatchIdSeen(batchId);
        plannerCommitmentStreakService.recordFromApply(
          workerMlId,
          entry.planId,
          batchId,
          selectedDates,
        );
        plannerEmployeeNotifications.batchApplied(entry.planName, count, entry.planId);
        onApplied(count);
      }
    } finally {
      releaseBatchActionLock(batchId, "apply", claim.token);
      submitInFlightRef.current = false;
    }
  }

  return {
    availability,
    predictor,
    selectedOpenDays,
    toggleDay,
    selectAllOpen,
    submit,
  };
}
