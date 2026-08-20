/** Lane sub-card copy — guidance only, no create actions. */

import type { EmployerOsDomain } from "./employerDashboard.osTypes";

export type LanePreviewCardCopy = {
  readonly title: string;
  readonly blurb: string;
  readonly preview: string;
  readonly testId: string;
};

export const LANE_PREVIEW_CARDS: Record<EmployerOsDomain, readonly LanePreviewCardCopy[]> = {
  career: [
    {
      title: "Active jobs",
      blurb: "Lists the roles you have open and how many people applied.",
      preview: "Preview: 3 applicants",
      testId: "employer-preview-career-jobs",
    },
    {
      title: "Smart candidate matches",
      blurb: "Ranks people against the skills you asked for on each role.",
      preview: "Preview: 95% Match",
      testId: "employer-preview-career-match",
    },
    {
      title: "Schedule & contact",
      blurb: "Shows booked interviews and a simple way to reach the person.",
      preview: "Preview: Interview slot",
      testId: "employer-preview-career-interview",
    },
  ],
  shift: [
    {
      title: "Upcoming & open shifts",
      blurb: "Shows shifts still open, with the soonest start at the top.",
      preview: "Preview: Upcoming",
      testId: "employer-preview-shift-open",
    },
    {
      title: "Instant roster match",
      blurb: "Shows workers who can fill an open shift right now.",
      preview: "Preview: Available",
      testId: "employer-preview-shift-roster",
    },
    {
      title: "Attendance & Gate pass readiness",
      blurb: "Shows confirmed crews who are ready to enter the site.",
      preview: "Preview: Gate ready",
      testId: "employer-preview-shift-gate",
    },
  ],
  planner: [
    {
      title: "Active weekly plans",
      blurb: "Shows this week's live and draft demand plans.",
      preview: "Preview: Active week",
      testId: "employer-preview-planner-plans",
    },
    {
      title: "Unfilled shift gaps",
      blurb: "Shows plan days that still need people.",
      preview: "Preview: Slot status",
      testId: "employer-preview-planner-gaps",
    },
    {
      title: "Budget & hour tracker",
      blurb: "Shows estimated pay total and planned worker-days.",
      preview: "Preview: Budget",
      testId: "employer-preview-planner-budget",
    },
  ],
};
