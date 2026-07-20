// App name: Job Mitra
// File name: shiftTimeline.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\shiftTimeline.types.ts

import type { CSSProperties } from "react";

import type { ShiftApplicationStatus } from "../../types/shiftApplicationTypes";

export type { ShiftApplicationStatus } from "../../types/shiftApplicationTypes";

export type ShiftPaymentStage = "not_available" | "pending" | "processing" | "paid" | "failed";

export type ShiftTimelineActionVariant = "primary" | "secondary" | "success" | "danger" | "muted";

export type ShiftReplacementReason = "no_show" | "schedule_change" | "quality_issue" | "other";

export type TimelineStepState = "complete" | "active" | "pending" | "terminal" | "blocked";

export type ShiftTimelineStep = {
  readonly id: string;
  readonly label: string;
  readonly helper: string;
  readonly state: TimelineStepState;
};

export type ShiftTimelineAction = {
  readonly id: string;
  readonly label: string;
  readonly helper: string;
  readonly variant: ShiftTimelineActionVariant;
  readonly onClick?: () => void;
  readonly href?: string;
  readonly external?: boolean;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
};

export type ShiftApplicationStatusTimelineProps = {
  readonly status: ShiftApplicationStatus;
  readonly paymentStage?: ShiftPaymentStage;
  readonly shiftTitle?: string;
  readonly employerName?: string;
  readonly locationName?: string;
  readonly startAt?: number;
  readonly endAt?: number;
  readonly workspaceMapsUrl?: string;
  readonly replacementReason?: ShiftReplacementReason;
  readonly attendanceConfirmedAt?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onOpenDetails?: () => void;
  readonly onOpenWorkspace?: () => void;
  readonly onWithdraw?: () => void;
  readonly onConfirmAttendance?: () => void;
  readonly onFindMoreShifts?: () => void;
  readonly onViewReplacementReason?: () => void;
};
