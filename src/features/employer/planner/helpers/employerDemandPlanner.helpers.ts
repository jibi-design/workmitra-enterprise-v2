// App name: Job Mitra
// File name: employerDemandPlanner.helpers.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\helpers\employerDemandPlanner.helpers.ts

import { isValidPincode } from "../../../shared/location/pincode";
import type { FillStatus, FillStatusConfig } from "../types/employerDemandPlanner.types";
import type { Step1Data } from "../components/wizard/DemandPlannerStep1.types";
import type { DaySlot } from "../storage/demandPlannerStorage";

export const FILL_STATUS_CONFIG: Record<FillStatus, FillStatusConfig> = {
  filled: {
    label: "Filled",
    color: "#0e7490",
    bg: "rgba(8, 145, 178, 0.1)",
  },
  filling: {
    label: "Filling",
    color: "#92400e",
    bg: "rgba(217,119,6,0.08)",
  },
  needs_attention: {
    label: "Needs attention",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.08)",
  },
  posted: {
    label: "Posted",
    color: "#64748b",
    bg: "rgba(148,163,184,0.08)",
  },
};

export function getFillStatus(confirmed: number, workers: number): FillStatus {
  if (workers === 0) return "posted";
  if (confirmed >= workers) return "filled";
  if (confirmed > 0) return "filling";
  return "needs_attention";
}

export function validateDemandPlannerIdentity(step1: Step1Data): string[] {
  const errors: string[] = [];

  if (step1.name.trim().length < 2) errors.push("Plan title is required.");
  if (step1.defaultWorkers <= 0) errors.push("Workers per day must be at least 1.");

  return errors;
}

export function validateDemandPlannerSchedule(step1: Step1Data): string[] {
  const errors = validateDemandPlannerCalendar(step1);
  if (step1.locationName.trim().length < 2) errors.push("Reporting area is required.");
  if (!isValidPincode(step1.locationPincode)) errors.push("Work area code is required.");
  return errors;
}

export function validateDemandPlannerCalendar(step1: Step1Data): string[] {
  const errors: string[] = [];

  if (!step1.startDate) errors.push("Start date is required.");
  if (!step1.endDate) errors.push("End date is required.");
  if (step1.startDate && step1.endDate && step1.endDate < step1.startDate) {
    errors.push("End date must be after start date.");
  }
  if (step1.workingDays.length === 0) errors.push("Select at least one working day.");

  return errors;
}

/** @deprecated Use validateDemandPlannerIdentity + validateDemandPlannerCalendar */
export function validateDemandPlannerStep1(step1: Step1Data): string[] {
  return [...validateDemandPlannerIdentity(step1), ...validateDemandPlannerCalendar(step1)];
}

export function validateDemandPlannerDaySlots(slots: DaySlot[]): string[] {
  const errors: string[] = [];
  const active = slots.filter((slot) => slot.workers > 0);

  if (active.length === 0) {
    errors.push("Set workers needed for at least one day.");
    return errors;
  }

  const missingPay = active.filter((slot) => slot.payPerDay <= 0);
  if (missingPay.length > 0) {
    errors.push(
      `Set pay per day for all ${active.length} planned day${active.length !== 1 ? "s" : ""} before continuing.`,
    );
  }

  return errors;
}

export function formatDemandPlannerDate(date: string): string {
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}
