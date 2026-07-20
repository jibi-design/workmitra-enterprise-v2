// App name: Job Mitra
// File name: shiftTimeline.constants.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\shiftTimeline.constants.ts

import type {
  ShiftApplicationStatus,
  ShiftPaymentStage,
  ShiftReplacementReason,
} from "./shiftTimeline.types";

export const STATUS_TITLE: Record<ShiftApplicationStatus, string> = {
  applied: "Application submitted",
  shortlisted: "Shortlisted by employer",
  waiting: "Backup list / standby",
  confirmed: "Shift confirmed",
  rejected: "Not selected",
  withdrawn: "Application withdrawn",
  replaced: "Assignment replaced",
  exited: "Shift exited",
};

export const STATUS_HELPER: Record<ShiftApplicationStatus, string> = {
  applied: "Your application is waiting for employer review.",
  shortlisted: "You are shortlisted. Keep your availability open until the employer confirms.",
  waiting:
    "You are on the backup list. Stay ready, but continue applying to other suitable shifts too.",
  confirmed:
    "You are confirmed for this shift. Confirm attendance, then open your workspace and prepare before the shift starts.",
  rejected:
    "The employer did not select you for this shift. You can continue applying to other shifts.",
  withdrawn: "You withdrew this application. You can apply to other suitable shifts.",
  replaced:
    "This assignment was replaced by the employer. Review the reason and find another shift.",
  exited: "You exited this shift workflow. You can continue with other available shifts.",
};

export const REPLACEMENT_REASON_LABEL: Record<ShiftReplacementReason, string> = {
  no_show: "Marked as no-show",
  schedule_change: "Schedule changed",
  quality_issue: "Quality issue",
  other: "Employer replaced this assignment",
};

export const PAYMENT_STAGE_LABEL: Record<ShiftPaymentStage, string> = {
  not_available: "Payment tracking not active yet",
  pending: "Payment pending",
  processing: "Payment processing",
  paid: "Payment completed",
  failed: "Payment needs attention",
};

export const PAYMENT_STAGE_HELPER: Record<ShiftPaymentStage, string> = {
  not_available: "This UI is payment-ready, but payment processing is not connected in this phase.",
  pending: "Payment is expected after the shift is completed and approved.",
  processing: "Payment is currently being processed.",
  paid: "Payment is marked as completed.",
  failed: "Payment could not be completed. This needs attention.",
};

export const PAYMENT_FLOW_STAGES: readonly ShiftPaymentStage[] = ["pending", "processing", "paid"];
