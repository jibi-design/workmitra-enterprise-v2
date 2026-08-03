import type {
  ShiftApplicationStatusTimelineProps,
  ShiftTimelineAction,
} from "./shiftTimeline.types";

export function createTimelineActions({
  status,
  workspaceMapsUrl,
  attendanceConfirmedAt,
  onOpenDetails,
  onOpenWorkspace,
  onWithdraw,
  onConfirmAttendance,
  onFindMoreShifts,
  onViewReplacementReason,
}: ShiftApplicationStatusTimelineProps): readonly ShiftTimelineAction[] {
  if (status === "applied") {
    return [
      {
        id: "review-application",
        label: "Review application",
        helper: "Open this application and check the shift details again.",
        variant: "primary",
        onClick: onOpenDetails,
        disabled: !onOpenDetails,
      },
      {
        id: "withdraw-application",
        label: "Withdraw",
        helper: "Withdraw if you are no longer available.",
        variant: "danger",
        onClick: onWithdraw,
        disabled: !onWithdraw,
      },
    ];
  }

  if (status === "shortlisted") {
    return [
      {
        id: "review-shortlist",
        label: "Review shortlist",
        helper: "Check the role, timing, and employer details.",
        variant: "primary",
        onClick: onOpenDetails,
        disabled: !onOpenDetails,
      },
      {
        id: "withdraw-shortlist",
        label: "Withdraw",
        helper: "Withdraw if you cannot attend this shift.",
        variant: "danger",
        onClick: onWithdraw,
        disabled: !onWithdraw,
      },
    ];
  }

  if (status === "waiting") {
    return [
      {
        id: "review-backup",
        label: "Review backup status",
        helper: "Stay ready in case the employer confirms you.",
        variant: "primary",
        onClick: onOpenDetails,
        disabled: !onOpenDetails,
      },
      {
        id: "leave-backup-list",
        label: "Leave backup list",
        helper: "Withdraw if you cannot stay available for this shift.",
        variant: "danger",
        onClick: onWithdraw,
        disabled: !onWithdraw,
      },
      {
        id: "find-more-shifts",
        label: "Find more shifts",
        helper: "Do not wait idle. Apply to other suitable shifts too.",
        variant: "secondary",
        onClick: onFindMoreShifts,
        disabled: !onFindMoreShifts,
      },
    ];
  }

  if (status === "confirmed") {
    const attendanceAction: ShiftTimelineAction =
      attendanceConfirmedAt === undefined
        ? {
            id: "confirm-attendance",
            label: "Confirm attendance intent",
            helper:
              "Attendance Intent / Check-in Signal only — not a legal timecard, QR punch-in, or payroll.",
            variant: "success",
            onClick: onConfirmAttendance,
            disabled: !onConfirmAttendance,
          }
        : {
            id: "attendance-confirmed",
            label: "Attendance intent saved",
            helper:
              "Check-in signal recorded (plan to attend) — not live punch-in or a legal timecard.",
            variant: "muted",
            disabled: true,
          };

    return [
      attendanceAction,
      {
        id: "open-workspace",
        label: "Open workspace",
        helper: "View shift workspace, checklist, and updates.",
        variant: "primary",
        onClick: onOpenWorkspace,
        disabled: !onOpenWorkspace,
      },
      {
        id: "navigate-workspace",
        label: "Navigate to workspace",
        helper: "Open the shift location in maps when available.",
        variant: "secondary",
        href: workspaceMapsUrl,
        external: true,
        disabled: !workspaceMapsUrl,
        ariaLabel: "Navigate to shift workspace location",
      },
      {
        id: "cancel-confirmation",
        label: "Cancel confirmation",
        helper: "Release your slot if you cannot attend. Employer is notified.",
        variant: "danger",
        onClick: onWithdraw,
        disabled: !onWithdraw,
      },
    ];
  }

  if (status === "replaced") {
    return [
      {
        id: "view-replacement-reason",
        label: "View reason",
        helper: "Review why this assignment was replaced.",
        variant: "primary",
        onClick: onViewReplacementReason,
        disabled: !onViewReplacementReason,
      },
      {
        id: "find-replacement-shift",
        label: "Find new shifts",
        helper: "Continue applying to suitable shifts.",
        variant: "secondary",
        onClick: onFindMoreShifts,
        disabled: !onFindMoreShifts,
      },
    ];
  }

  if (status === "rejected" || status === "withdrawn" || status === "exited") {
    return [
      {
        id: "find-more-shifts",
        label: "Find more shifts",
        helper: "Continue with other available opportunities.",
        variant: "primary",
        onClick: onFindMoreShifts,
        disabled: !onFindMoreShifts,
      },
    ];
  }

  return [
    {
      id: "review-details",
      label: "Review details",
      helper: "Open this shift application for more information.",
      variant: "secondary",
      onClick: onOpenDetails,
      disabled: !onOpenDetails,
    },
  ];
}
