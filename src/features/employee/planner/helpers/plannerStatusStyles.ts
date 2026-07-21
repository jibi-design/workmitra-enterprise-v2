// Job Mitra | plannerStatusStyles.ts | Gig Projects status colors — teal only, never shift green

import type {
  ShiftApplicationStatus,
  StatusStyle,
} from "../../../shared/planner/ports/plannerLegacyShiftBridge";

const PLANNER_TEAL = "var(--wm-planner-accent-strong, #0e7490)";
const PLANNER_TEAL_SOFT = "rgba(8, 145, 178, 0.1)";
const PLANNER_TEAL_WASH = "rgba(8, 145, 178, 0.06)";

/** Status chips inside Gig / Planner surfaces — no shift green (#16a34a). */
const PLANNER_STATUS_STYLES: Record<ShiftApplicationStatus, StatusStyle> = {
  applied: {
    color: PLANNER_TEAL,
    bgTint: PLANNER_TEAL_WASH,
    badgeBg: PLANNER_TEAL_SOFT,
  },
  shortlisted: {
    color: "#a16207",
    bgTint: "rgba(161,98,7,0.04)",
    badgeBg: "rgba(161,98,7,0.1)",
  },
  waiting: {
    color: "#a16207",
    bgTint: "rgba(161,98,7,0.04)",
    badgeBg: "rgba(161,98,7,0.1)",
  },
  confirmed: {
    color: "#1d4ed8",
    bgTint: "rgba(29,78,216,0.04)",
    badgeBg: "rgba(29,78,216,0.1)",
  },
  rejected: {
    color: "#dc2626",
    bgTint: "rgba(220,38,38,0.04)",
    badgeBg: "rgba(220,38,38,0.1)",
  },
  withdrawn: {
    color: "#94a3b8",
    bgTint: "rgba(148,163,184,0.04)",
    badgeBg: "rgba(148,163,184,0.1)",
  },
  replaced: {
    color: "#94a3b8",
    bgTint: "rgba(148,163,184,0.04)",
    badgeBg: "rgba(148,163,184,0.1)",
  },
  exited: {
    color: "#94a3b8",
    bgTint: "rgba(148,163,184,0.04)",
    badgeBg: "rgba(148,163,184,0.1)",
  },
};

const PLANNER_FALLBACK: StatusStyle = {
  color: "#94a3b8",
  bgTint: "transparent",
  badgeBg: "rgba(148,163,184,0.1)",
};

export function getPlannerStatusStyle(status: ShiftApplicationStatus): StatusStyle {
  return PLANNER_STATUS_STYLES[status] ?? PLANNER_FALLBACK;
}
