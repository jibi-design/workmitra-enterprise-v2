// App name: Job Mitra
// File name: shiftTimeline.styles.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\shiftTimeline.styles.ts

import type { CSSProperties } from "react";

import type {
  ShiftApplicationStatus,
  ShiftTimelineActionVariant,
  TimelineStepState,
} from "./shiftTimeline.types";

export const TEXT_DARK = "#0F172A";
export const MUTED = "#64748B";
export const GREEN = "#16A34A";
export const GREEN_DARK = "#166534";
export const BLUE = "#2563EB";
export const BLUE_DARK = "#1E3A8A";
export const AMBER = "#D97706";
export const AMBER_DARK = "#92400E";
export const RED = "#DC2626";
export const RED_DARK = "#991B1B";
export const BORDER_SOFT = "rgba(148, 163, 184, 0.22)";

export function getStepVisual(state: TimelineStepState): {
  readonly background: string;
  readonly border: string;
  readonly dot: string;
  readonly color: string;
} {
  if (state === "complete") {
    return {
      background: "rgba(240, 253, 244, 0.78)",
      border: "rgba(22, 163, 74, 0.26)",
      dot: GREEN,
      color: GREEN_DARK,
    };
  }

  if (state === "active") {
    return {
      background: "rgba(239, 246, 255, 0.88)",
      border: "rgba(37, 99, 235, 0.3)",
      dot: BLUE,
      color: BLUE_DARK,
    };
  }

  if (state === "terminal") {
    return {
      background: "rgba(255, 251, 235, 0.88)",
      border: "rgba(217, 119, 6, 0.32)",
      dot: AMBER,
      color: AMBER_DARK,
    };
  }

  if (state === "blocked") {
    return {
      background: "rgba(254, 242, 242, 0.88)",
      border: "rgba(220, 38, 38, 0.28)",
      dot: RED,
      color: RED_DARK,
    };
  }

  return {
    background: "rgba(248, 250, 252, 0.9)",
    border: "rgba(148, 163, 184, 0.22)",
    dot: "#CBD5E1",
    color: MUTED,
  };
}

export function getBadgeVisual(status: ShiftApplicationStatus): {
  readonly background: string;
  readonly border: string;
  readonly color: string;
} {
  if (status === "confirmed") {
    return {
      background: "rgba(22, 163, 74, 0.1)",
      border: "rgba(22, 163, 74, 0.22)",
      color: GREEN_DARK,
    };
  }

  if (status === "shortlisted" || status === "waiting") {
    return {
      background: "rgba(255, 251, 235, 0.9)",
      border: "rgba(217, 119, 6, 0.24)",
      color: AMBER_DARK,
    };
  }

  if (status === "rejected" || status === "replaced") {
    return {
      background: "rgba(254, 242, 242, 0.9)",
      border: "rgba(220, 38, 38, 0.22)",
      color: RED_DARK,
    };
  }

  if (status === "withdrawn" || status === "exited") {
    return {
      background: "rgba(248, 250, 252, 0.95)",
      border: "rgba(148, 163, 184, 0.24)",
      color: MUTED,
    };
  }

  return {
    background: "rgba(239, 246, 255, 0.92)",
    border: "rgba(37, 99, 235, 0.22)",
    color: BLUE_DARK,
  };
}

export function getActionStyle(
  variant: ShiftTimelineActionVariant,
  disabled: boolean,
): CSSProperties {
  if (disabled) {
    return {
      background: "rgba(148, 163, 184, 0.16)",
      border: "1px solid rgba(148, 163, 184, 0.22)",
      color: "#94A3B8",
      cursor: "not-allowed",
    };
  }

  if (variant === "primary") {
    return {
      background: BLUE,
      border: "1px solid rgba(37, 99, 235, 0.18)",
      color: "#FFFFFF",
      cursor: "pointer",
    };
  }

  if (variant === "success") {
    return {
      background: GREEN,
      border: "1px solid rgba(22, 163, 74, 0.18)",
      color: "#FFFFFF",
      cursor: "pointer",
    };
  }

  if (variant === "danger") {
    return {
      background: "#FFFFFF",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      color: RED,
      cursor: "pointer",
    };
  }

  if (variant === "muted") {
    return {
      background: "rgba(248, 250, 252, 0.94)",
      border: "1px solid rgba(148, 163, 184, 0.22)",
      color: MUTED,
      cursor: "pointer",
    };
  }

  return {
    background: "#FFFFFF",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    color: TEXT_DARK,
    cursor: "pointer",
  };
}
