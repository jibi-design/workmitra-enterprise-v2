// Job Mitra | smartEarningsPredictor.service.ts | Section 6.11 / 8.10.1

import { longestConsecutiveDates } from "../helpers/plannerDayConflict.helpers";
import type {
  BuildSmartEarningsPredictorInput,
  SmartEarningsPredictorPayload,
} from "../types/employeeAvailability.types";

const DEFAULT_THRESHOLD = 5;

export const smartEarningsPredictorService = {
  build(input: BuildSmartEarningsPredictorInput): SmartEarningsPredictorPayload {
    const threshold = input.commitmentStreakThreshold ?? DEFAULT_THRESHOLD;
    const selected = new Set(input.selectedDateKeys);
    const selectableCount = Math.max(1, input.availability.summary.selectableDayCount);

    let estimatedTotal = 0;
    let optimisticTotal = 0;
    let conservativeTotal = 0;

    const dayLines = input.availability.days.map((day) => {
      const included = selected.has(day.dateKey);
      const isOpen = day.selectable && day.status === "open";
      const isConfirmed = day.status === "confirmed";

      let confidence: "selected_open" | "selected_applied" | "confirmed" | "excluded" = "excluded";
      let meterAmount = 0;

      if (isConfirmed) {
        confidence = "confirmed";
        meterAmount = day.payPerDay;
        conservativeTotal += day.payPerDay;
      } else if (included && isOpen) {
        confidence = "selected_open";
        meterAmount = day.payPerDay;
        estimatedTotal += day.payPerDay;
        optimisticTotal += day.payPerDay;
      } else if (included) {
        confidence = "selected_applied";
      }

      return {
        dateKey: day.dateKey,
        postId: day.postId,
        payPerDay: day.payPerDay,
        includedInSelection: included,
        confidence,
        meterAmount,
      };
    });

    const selectedDayCount = input.selectedDateKeys.length;
    const longest = longestConsecutiveDates(input.selectedDateKeys);
    const eligible = longest >= threshold;

    const label =
      selectedDayCount > 0
        ? `${selectedDayCount} Day${selectedDayCount !== 1 ? "s" : ""} Selected · Estimated earnings: ${estimatedTotal.toLocaleString("en-IN")}`
        : "Select days to see estimated earnings";

    return {
      planId: input.availability.planId,
      planName: input.availability.planName,
      generatedAt: input.now ?? Date.now(),
      schemaVersion: 1,
      meter: {
        selectedDayCount,
        estimatedTotal,
        currency: "INR",
        fillRatio: selectedDayCount / selectableCount,
        label,
        sublabel: selectedDayCount > 0 ? "If all selected days confirm" : undefined,
        displayAmount: estimatedTotal,
      },
      earnings: {
        estimatedTotal,
        optimisticTotal,
        conservativeTotal,
        predictedTotal: estimatedTotal,
      },
      commitmentStreak: {
        threshold,
        consecutiveDaysSelected: longest,
        longestConsecutiveInSelection: longest,
        eligible,
        teaserLabel: eligible ? "🏆 Commitment Streak eligible!" : undefined,
      },
      dayLines,
      disclaimer: "Estimated earnings — not guaranteed until employer confirms",
    };
  },
};
