// App name: Job Mitra
// File name: ShiftApplicationStatusTimeline.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\ShiftApplicationStatusTimeline.tsx

import { DESIGN_TOKENS } from "../../../../../app/theme/designTokens";

import { ShiftTimelineActions } from "./ShiftTimelineActions";
import { ShiftTimelineHeader } from "./ShiftTimelineHeader";
import { ShiftTimelinePaymentPanel } from "./ShiftTimelinePaymentPanel";
import { ShiftTimelineStepList } from "./ShiftTimelineStepList";
import { createTimelineActions, createTimelineSteps } from "./shiftTimeline.logic";
import { BORDER_SOFT } from "./shiftTimeline.styles";
import type { ShiftApplicationStatusTimelineProps } from "./shiftTimeline.types";

export function ShiftApplicationStatusTimeline({
  status,
  paymentStage = "not_available",
  shiftTitle,
  employerName,
  locationName,
  startAt,
  endAt,
  workspaceMapsUrl,
  replacementReason,
  attendanceConfirmedAt,
  className,
  style,
  onOpenDetails,
  onOpenWorkspace,
  onWithdraw,
  onConfirmAttendance,
  onFindMoreShifts,
  onViewReplacementReason,
}: ShiftApplicationStatusTimelineProps) {
  const timelineSteps = createTimelineSteps(status);
  const timelineActions = createTimelineActions({
    status,
    paymentStage,
    shiftTitle,
    employerName,
    locationName,
    startAt,
    endAt,
    workspaceMapsUrl,
    replacementReason,
    attendanceConfirmedAt,
    className,
    style,
    onOpenDetails,
    onOpenWorkspace,
    onWithdraw,
    onConfirmAttendance,
    onFindMoreShifts,
    onViewReplacementReason,
  });

  return (
    <section
      className={className}
      style={{
        borderRadius: DESIGN_TOKENS.geometry.radiusCard,
        border: `1px solid ${BORDER_SOFT}`,
        background:
          "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 52%, rgba(240,253,244,0.54))",
        boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
        padding: 16,
        display: "grid",
        gap: 14,
        ...style,
      }}
      aria-label="Shift application status timeline"
    >
      <ShiftTimelineHeader
        status={status}
        shiftTitle={shiftTitle}
        employerName={employerName}
        locationName={locationName}
        startAt={startAt}
        endAt={endAt}
        replacementReason={replacementReason}
      />

      <ShiftTimelineStepList steps={timelineSteps} />

      <ShiftTimelinePaymentPanel paymentStage={paymentStage} />

      <ShiftTimelineActions actions={timelineActions} />
    </section>
  );
}
