// Job Mitra | employeeAvailability.types.ts | Section 6.11

export type DateKey = string;

export type PlannerDayConflict = {
  dateKey: DateKey;
  postId: string;
  conflictType: "confirmed_shift" | "active_application" | "active_workspace";
  conflictLabel: string;
  blockingPostId?: string;
};

export type EmployeeAvailabilityDayStatus =
  | "open"
  | "full"
  | "applied"
  | "shortlisted"
  | "waiting"
  | "confirmed"
  | "conflict"
  | "cancelled"
  | "past"
  | "unavailable";

export type EmployeeAvailabilityDay = {
  dateKey: DateKey;
  postId?: string;
  payPerDay: number;
  status: EmployeeAvailabilityDayStatus;
  selectable: boolean;
  vacanciesTotal?: number;
  vacanciesRemaining?: number;
  conflict?: PlannerDayConflict;
  applicationId?: string;
  applicationStatus?: string;
  badges?: Array<"full" | "applied" | "confirmed" | "conflict" | "selected">;
};

export type EmployeeAvailabilitySummary = {
  totalDayCount: number;
  openDayCount: number;
  selectableDayCount: number;
  conflictDayCount: number;
  appliedDayCount: number;
  confirmedDayCount: number;
  fullDayCount: number;
};

export type EmployeeAvailability = {
  workerWmId: string;
  planId: string;
  planName: string;
  companyName: string;
  locationName: string;
  generatedAt: number;
  schemaVersion: 1;
  dateRange: { start: DateKey; end: DateKey };
  days: EmployeeAvailabilityDay[];
  summary: EmployeeAvailabilitySummary;
  selectedDateKeys: DateKey[];
};

export type BuildEmployeeAvailabilityInput = {
  workerWmId: string;
  planId: string;
  indexEntry: {
    planName: string;
    companyName: string;
    locationName: string;
    slotDates: DateKey[];
    postIdsByDate: Record<DateKey, string>;
    payMin: number;
    payMax: number;
    status: "active" | "cancelled";
  };
  initialSelectedDateKeys?: DateKey[];
  now?: number;
};

export type SmartEarningsConfidence =
  "selected_open" | "selected_applied" | "confirmed" | "excluded";

export type SmartEarningsDayLine = {
  dateKey: DateKey;
  postId?: string;
  payPerDay: number;
  includedInSelection: boolean;
  confidence: SmartEarningsConfidence;
  meterAmount: number;
  confirmProbability?: number;
};

export type SmartEarningsMeter = {
  selectedDayCount: number;
  estimatedTotal: number;
  currency: "INR";
  fillRatio: number;
  label: string;
  sublabel?: string;
  displayAmount: number;
};

export type SmartEarningsCommitmentStreak = {
  threshold: number;
  consecutiveDaysSelected: number;
  longestConsecutiveInSelection: number;
  eligible: boolean;
  teaserLabel?: string;
};

export type SmartEarningsPredictorPayload = {
  planId: string;
  planName: string;
  generatedAt: number;
  schemaVersion: 1;
  meter: SmartEarningsMeter;
  earnings: {
    estimatedTotal: number;
    optimisticTotal: number;
    conservativeTotal: number;
    predictedTotal?: number;
  };
  commitmentStreak: SmartEarningsCommitmentStreak;
  dayLines: SmartEarningsDayLine[];
  disclaimer: string;
};

export type BuildSmartEarningsPredictorInput = {
  availability: EmployeeAvailability;
  selectedDateKeys: DateKey[];
  commitmentStreakThreshold?: number;
  now?: number;
};
