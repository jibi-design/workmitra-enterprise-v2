// src/features/employer/hrManagement/helpers/rosterPlannerConstants.ts
//
// Shared constants for Team Calendar / Roster Planner (Root Map Section 7.4.15).
// Site color palette for visual distinction in grid cells.
// Wave-3: --wm-* tokens only (no raw hex in palette).

// ─────────────────────────────────────────────────────────────────────────────
// Site Color Palette (auto-assigned by site name hash)
// ─────────────────────────────────────────────────────────────────────────────

const SITE_COLORS: { bg: string; color: string }[] = [
  { bg: "var(--wm-blue-50)", color: "var(--wm-ocean-600)" },
  { bg: "var(--wm-green-50)", color: "var(--wm-green-700)" },
  { bg: "var(--wm-amber-50)", color: "var(--wm-amber-600)" },
  { bg: "var(--wm-red-50)", color: "var(--wm-red-600)" },
  { bg: "var(--wm-purple-50)", color: "var(--wm-purple-600)" },
  { bg: "var(--wm-cyan-50)", color: "var(--wm-cyan-600)" },
  { bg: "var(--wm-purple-50)", color: "var(--wm-purple-700)" },
  { bg: "var(--wm-amber-50)", color: "var(--wm-amber-700)" },
];

export function getSiteColor(site: string): { bg: string; color: string } {
  if (!site.trim()) return SITE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < site.length; i++) {
    hash = (hash * 31 + site.charCodeAt(i)) | 0;
  }
  return SITE_COLORS[Math.abs(hash) % SITE_COLORS.length];
}

/** Wave-3 shared roster accent tokens for today / surface */
export const ROSTER_TODAY_BORDER = "var(--wm-ocean-600)";
export const ROSTER_TODAY_BG = "var(--wm-blue-50)";
export const ROSTER_TODAY_FG = "var(--wm-ocean-600)";
export const ROSTER_SURFACE = "var(--wm-career-bg, #fff)";
export const ROSTER_MUTED_BG = "var(--wm-neutral-100)";
export const ROSTER_OFF_BG = "var(--wm-neutral-100)";
export const ROSTER_MUTED_FG = "var(--wm-neutral-400)";

// ─────────────────────────────────────────────────────────────────────────────
// Day Abbreviations (for grid headers)
// ─────────────────────────────────────────────────────────────────────────────

export const DAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const DAY_FULL_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
