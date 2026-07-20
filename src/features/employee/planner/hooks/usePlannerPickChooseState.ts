// Job Mitra | usePlannerPickChooseState.ts

import { useMemo, useState } from "react";
import type { PlannerPublicIndexEntry } from "../../../employer/planner/storage/plannerPublicIndex.storage";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { employeeAvailabilityService } from "../services/employeeAvailability.service";
import { smartEarningsPredictorService } from "../services/smartEarningsPredictor.service";
import { multiApplyGroup } from "../../shiftJobs/helpers/shiftSearchHelpers";
import { plannerCommitmentStreakService } from "../services/plannerCommitmentStreak.service";
import { plannerEmployeeNotifications } from "../services/plannerEmployeeNotifications.service";

type Args = {
  entry: PlannerPublicIndexEntry;
  onApplied: (count: number) => void;
  onNeedProfile: () => void;
  isProfileComplete: boolean;
};

export function usePlannerPickChooseState({
  entry,
  onApplied,
  onNeedProfile,
  isProfileComplete,
}: Args) {
  const workerWmId = employeeProfileStorage.get().uniqueId ?? "local-worker";
  const [selectionByPlan, setSelectionByPlan] = useState<Record<string, string[]>>({});
  const planDateKeys = selectionByPlan[entry.planId];

  const availability = useMemo(
    () =>
      employeeAvailabilityService.build({
        workerWmId,
        planId: entry.planId,
        indexEntry: entry,
        initialSelectedDateKeys: planDateKeys ?? [],
      }),
    [workerWmId, entry, planDateKeys],
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
    if (!isProfileComplete) {
      onNeedProfile();
      return;
    }

    const postIds = selectedOpenDays.map((d) => d.postId).filter((id): id is string => Boolean(id));
    if (postIds.length === 0) return;

    const batchId = `pb_${entry.planId}_${Date.now().toString(36)}`;
    const selectedDates = selectedOpenDays.map((d) => d.dateKey);

    const count = multiApplyGroup(postIds, {
      planId: entry.planId,
      planApplyBatchId: batchId,
      selectedDates,
    });

    if (count > 0) {
      plannerCommitmentStreakService.recordFromApply(
        workerWmId,
        entry.planId,
        batchId,
        selectedDates,
      );
      plannerEmployeeNotifications.batchApplied(entry.planName, count, entry.planId);
      onApplied(count);
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
