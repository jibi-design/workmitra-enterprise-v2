import type {
  ShiftApplicationStatus,
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

function resolveFlowStepState(currentIndex: number, stepIndex: number): TimelineStepState {
  if (currentIndex > stepIndex) {
    return "complete";
  }

  if (currentIndex === stepIndex) {
    return "active";
  }

  return "pending";
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
