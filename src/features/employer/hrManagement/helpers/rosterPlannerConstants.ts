// src/features/employer/hrManagement/helpers/rosterPlannerConstants.ts
//
// Shared constants for Team Calendar / Roster Planner (Root Map Section 7.4.15).
// Site color palette for visual distinction in grid cells.

// ─────────────────────────────────────────────────────────────────────────────
// Site Color Palette (auto-assigned by site name hash)
// ─────────────────────────────────────────────────────────────────────────────

const SITE_COLORS: { bg: string; color: string }[] = [
  { bg: "#eff6ff", color: "#0369a1" },
  { bg: "#f0fdf4", color: "#15803d" },
  { bg: "#fffbeb", color: "#d97706" },
  { bg: "#fef2f2", color: "#dc2626" },
  { bg: "#f5f3ff", color: "#7c3aed" },
  { bg: "#ecfeff", color: "#0891b2" },
  { bg: "#fdf4ff", color: "#a21caf" },
  { bg: "#fff7ed", color: "#c2410c" },
];

export function getSiteColor(site: string): { bg: string; color: string } {
  if (!site.trim()) return SITE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < site.length; i++) {
    hash = (hash * 31 + site.charCodeAt(i)) | 0;
  }
  return SITE_COLORS[Math.abs(hash) % SITE_COLORS.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Day Abbreviations (for grid headers)
// ─────────────────────────────────────────────────────────────────────────────

export const DAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const DAY_FULL_LABELS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;
