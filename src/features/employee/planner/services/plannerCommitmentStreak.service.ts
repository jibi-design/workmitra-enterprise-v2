// Job Mitra | plannerCommitmentStreak.service.ts | Section 6.10.3

import { longestConsecutiveDates } from "../helpers/plannerDayConflict.helpers";
import { plannerCommitmentStreakStorage } from "../storage/plannerCommitmentStreak.storage";

const THRESHOLD = 5;

export const plannerCommitmentStreakService = {
  recordFromApply(
    workerWmId: string,
    planId: string,
    planApplyBatchId: string,
    selectedDates: string[],
  ): { earned: boolean; consecutiveDays: number } {
    const consecutiveDays = longestConsecutiveDates(selectedDates);
    const earned = consecutiveDays >= THRESHOLD;
    const now = Date.now();

    plannerCommitmentStreakStorage.upsert({
      workerWmId,
      planId,
      planApplyBatchId,
      consecutiveDaysCount: consecutiveDays,
      badgeEarnedAt: earned ? now : undefined,
      schemaVersion: 1,
    });

    return { earned, consecutiveDays };
  },

  hasStreak(workerWmId: string, planId?: string, planApplyBatchId?: string): boolean {
    if (
      planApplyBatchId &&
      plannerCommitmentStreakStorage.hasStreakForBatch(workerWmId, planApplyBatchId)
    ) {
      return true;
    }
    if (planId && plannerCommitmentStreakStorage.hasStreakForPlan(workerWmId, planId)) {
      return true;
    }
    return false;
  },
};
