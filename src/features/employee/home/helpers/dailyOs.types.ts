/** Job Mitra | dailyOs.types.ts | Candidate Pro Daily OS view types */

import type { DailyAvailabilityStatus } from "../storage/shiftAvailabilityDaily.storage";

export type DailyOsLane = "career" | "shift" | "planner";

export type CareerFunnelStage = "applied" | "shortlisted" | "interview" | "offer";

export type CareerFunnelCounts = Record<CareerFunnelStage, number>;

export type DailyOsHeatKind = "empty" | "pulse" | "confirmed" | "rest";

export type DailyOsHeatCell = {
  readonly dateKey: string;
  readonly weekday: string;
  readonly dayNum: string;
  readonly kind: DailyOsHeatKind;
  readonly label: string;
};

export type DailyOsSparkPoint = {
  readonly dateKey: string;
  readonly weekday: string;
  readonly amount: number;
  readonly hours: number;
};

export type DailyOsActivityItem = {
  readonly id: string;
  readonly lane: DailyOsLane;
  readonly title: string;
  readonly detail: string;
  readonly at: number;
  readonly route: string;
};

export type DailyOsPlannerHours = {
  readonly scheduledHours: number;
  readonly plannedHours: number;
  readonly confirmedDays: number;
  readonly plannedDays: number;
};

export type DailyOsMatchInsight = {
  readonly strengthPercent: number;
  readonly matchPercent: number;
  readonly band: "high" | "active" | "building" | "early";
  readonly bandLabel: string;
};

export type DailyOsNextShift = {
  readonly jobName: string;
  readonly companyName: string;
  readonly dateKey: string;
};

export type DailyOsPulseStatus = DailyAvailabilityStatus | null;
