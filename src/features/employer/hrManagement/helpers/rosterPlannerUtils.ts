// src/features/employer/hrManagement/helpers/rosterPlannerUtils.ts
//
// Utility functions for Team Calendar / Roster Planner (Root Map Section 7.4.15).
// Date range generation, conflict detection, formatting helpers.

import type { RosterAssignment, RosterConflict } from "../types/rosterPlanner.types";

// ─────────────────────────────────────────────────────────────────────────────
// Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format Date to YYYY-MM-DD */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD to Date object */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format date for display: "19 Mar 2026" */
export function formatDateShort(key: string): string {
  return fromDateKey(key).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Format date for grid header: "19" or "Mon 19" */
export function formatDayNumber(key: string): string {
  return String(fromDateKey(key).getDate());
}

// ─────────────────────────────────────────────────────────────────────────────
// Week Range
// ─────────────────────────────────────────────────────────────────────────────

/** Get 7 date keys starting from Monday of the week containing `refDate` */
export function getWeekDates(refDate: Date): string[] {
  const d = new Date(refDate);
  const day = d.getDay();
  // Shift to Monday (day 0 = Sunday → go back 6)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(toDateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Navigate week: offset = -1 (prev) or +1 (next) */
export function shiftWeek(refDate: Date, offset: number): Date {
  const d = new Date(refDate);
  d.setDate(d.getDate() + offset * 7);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Month Range
// ─────────────────────────────────────────────────────────────────────────────

/** Get all date keys for a calendar month grid (includes padding days) */
export function getMonthCalendarDates(year: number, month: number): string[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pad start to Monday
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const start = new Date(firstDay);
  start.setDate(start.getDate() - startPad);

  // Generate 6 weeks (42 days) max
  const dates: string[] = [];
  const d = new Date(start);
  const totalDays = startPad + lastDay.getDate();
  const rows = Math.ceil(totalDays / 7);

  for (let i = 0; i < rows * 7; i++) {
    dates.push(toDateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Navigate month: offset = -1 (prev) or +1 (next) */
export function shiftMonth(year: number, month: number, offset: number): { year: number; month: number } {
  const d = new Date(year, month + offset, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Conflict Detection
// ─────────────────────────────────────────────────────────────────────────────

/** Detect conflicts: same employee assigned to 2+ different sites on same day */
export function detectConflicts(assignments: RosterAssignment[]): RosterConflict[] {
  // Group by employee + date
  const map = new Map<string, RosterAssignment[]>();

  for (const a of assignments) {
    const key = `${a.hrCandidateId}::${a.date}`;
    const list = map.get(key) ?? [];
    list.push(a);
    map.set(key, list);
  }

  const conflicts: RosterConflict[] = [];

  for (const [, list] of map) {
    if (list.length < 2) continue;
    // Check if different sites
    const uniqueSites = new Set(list.map((a) => a.site.toLowerCase().trim()));
    if (uniqueSites.size > 1) {
      conflicts.push({
        employeeName: list[0].employeeName,
        hrCandidateId: list[0].hrCandidateId,
        date: list[0].date,
        assignments: list,
      });
    }
  }

  return conflicts.sort((a, b) => a.date.localeCompare(b.date));
}

// ─────────────────────────────────────────────────────────────────────────────
// Today helper
// ─────────────────────────────────────────────────────────────────────────────

export function todayKey(): string {
  return toDateKey(new Date());
}

export function isToday(key: string): boolean {
  return key === todayKey();
}