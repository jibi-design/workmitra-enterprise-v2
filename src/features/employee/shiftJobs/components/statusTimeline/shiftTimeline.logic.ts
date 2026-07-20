// App name: Job Mitra
// File name: shiftTimeline.logic.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\shiftTimeline.logic.ts

import type {
  ShiftApplicationStatus,
  ShiftApplicationStatusTimelineProps,
  ShiftTimelineAction,
  ShiftTimelineStep,
  TimelineStepState,
} from "./shiftTimeline.types";

export function formatDateTime(value: number | undefined): string {
  if (value === undefined) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createTimelineSteps(status: ShiftApplicationStatus): readonly ShiftTimelineStep[] {
  if (status === "withdrawn") {
    return [
      {
        id: "applied",
        label: "Applied",
        helper: "Application was submitted.",
        state: "complete",
      },
      {
        id: "withdrawn",
        label: "Withdrawn",
        helper: "You withdrew before final confirmation.",
        state: "terminal",
      },
    ];
  }

  if (status === "rejected") {
    return [
      {
        id: "applied",
        label: "Applied",
        helper: "Application was submitted.",
        state: "complete",
      },
      {
        id: "rejected",
        label: "Not selected",
        helper: "Employer selected another worker.",
        state: "blocked",
      },
    ];
  }

  if (status === "replaced") {
    return [
      {
        id: "applied",
        label: "Applied",
        helper: "Application was submitted.",
        state: "complete",
      },
      {
        id: "confirmed",
        label: "Confirmed",
        helper: "You were previously confirmed.",
        state: "complete",
      },
      {
        id: "replaced",
        label: "Replaced",
        helper: "Employer replaced this shift assignment.",
        state: "terminal",
      },
    ];
  }

  if (status === "exited") {
    return [
      {
        id: "applied",
        label: "Applied",
        helper: "Application was submitted.",
        state: "complete",
      },
      {
        id: "confirmed",
        label: "Confirmed",
        helper: "You were confirmed for this shift.",
        state: "complete",
      },
      {
        id: "exited",
        label: "Exited",
        helper: "You exited this shift workflow.",
        state: "terminal",
      },
    ];
  }

  const flowOrder: readonly ShiftApplicationStatus[] = [
    "applied",
    "shortlisted",
    "waiting",
    "confirmed",
  ];

  const currentIndex = flowOrder.indexOf(status);

  return [
    {
      id: "applied",
      label: "Applied",
      helper: "Application sent to employer.",
      state: resolveFlowStepState(currentIndex, 0),
    },
    {
      id: "shortlisted",
      label: "Shortlisted",
      helper: "Employer marked you as a strong candidate.",
      state: resolveFlowStepState(currentIndex, 1),
    },
    {
      id: "waiting",
      label: "Backup",
      helper: "Backup list if a selected worker drops out.",
      state: resolveFlowStepState(currentIndex, 2),
    },
    {
      id: "confirmed",
      label: "Confirmed",
      helper: "Workspace and shift preparation become available.",
      state: resolveFlowStepState(currentIndex, 3),
    },
  ];
}

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
            label: "I will attend",
            helper: "Confirm that you are available and will attend this shift.",
            variant: "success",
            onClick: onConfirmAttendance,
            disabled: !onConfirmAttendance,
          }
        : {
            id: "attendance-confirmed",
            label: "Attendance confirmed",
            helper: "You have confirmed that you will attend this shift.",
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

function resolveFlowStepState(currentIndex: number, stepIndex: number): TimelineStepState {
  if (currentIndex > stepIndex) {
    return "complete";
  }

  if (currentIndex === stepIndex) {
    return "active";
  }

  return "pending";
}
