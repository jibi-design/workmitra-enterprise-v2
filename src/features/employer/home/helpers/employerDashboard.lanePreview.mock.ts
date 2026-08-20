/** High-volume lane sub-card mock — tests/DEV harness only. Not live data. */

import type { LanePreviewCardCopy } from "./employerDashboard.lanePreview";
import type { EmployerOsDomain } from "./employerDashboard.osTypes";

export const HIGH_VOLUME_LANE_PREVIEW: Record<EmployerOsDomain, readonly LanePreviewCardCopy[]> = {
  shift: [
    {
      title: "Upcoming & open shifts",
      blurb: "Shows shifts still open, with the soonest start at the top.",
      preview: "Preview: 15 upcoming",
      testId: "employer-preview-shift-open",
    },
    {
      title: "Instant roster match",
      blurb: "Shows workers who can fill an open shift right now.",
      preview: "Preview: 52 workers",
      testId: "employer-preview-shift-roster",
    },
    {
      title: "Attendance & Gate pass readiness",
      blurb: "Shows confirmed crews who are ready to enter the site.",
      preview: "Preview: 50 gate-ready",
      testId: "employer-preview-shift-gate",
    },
  ],
  career: [
    {
      title: "Active jobs",
      blurb: "Lists the roles you have open and how many people applied.",
      preview: "Preview: 41 applicants",
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
      preview: "Preview: 8 interview slots",
      testId: "employer-preview-career-interview",
    },
  ],
  planner: [
    {
      title: "Active weekly plans",
      blurb: "Shows this week's live and draft demand plans.",
      preview: "Preview: 6 active weeks",
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
      preview: "Preview: 240 worker-days",
      testId: "employer-preview-planner-budget",
    },
  ],
};
