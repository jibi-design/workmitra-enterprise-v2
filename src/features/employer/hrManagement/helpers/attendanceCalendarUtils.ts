// src/features/employer/hrManagement/helpers/attendanceCalendarUtils.ts
//
// Pure utility — builds the calendar grid for a given month.
// No React dependency — pure logic only.
// Used by AttendanceCalendarGrid component.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CalendarDay = {
  /** Date key in YYYY-MM-DD format */
  dateKey: string;
  /** Day number (1–31) */
  dayNum: number;
  /** Whether this day belongs to the currently viewed month */
  isCurrentMonth: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Grid Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a calendar grid (array of weeks) for the given year/month.
 * Week starts on Monday. Pads with previous/next month days to fill rows.
 *
 * @param year  Full year (e.g. 2026)
 * @param month Month number 1–12
 * @returns     Array of weeks, each week is an array of 7 CalendarDay objects
 */
export function buildCalendarGrid(year: number, month: number): CalendarDay[][] {
  const firstDay = new Date(year, month - 1, 1);

  // getDay(): 0=Sun — convert to Mon=0 based week
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  // ── Previous month padding ──
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    days.push({
      dateKey: formatDateKey(y, m, d),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // ── Current month ──
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      dateKey: formatDateKey(year, month, d),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // ── Next month padding (fill last row to 7) ──
  const remainder = days.length % 7;
  if (remainder > 0) {
    const fill = 7 - remainder;
    for (let d = 1; d <= fill; d++) {
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      days.push({
        dateKey: formatDateKey(y, m, d),
        dayNum: d,
        isCurrentMonth: false,
      });
    }
  }

  // ── Split into weeks ──
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format a date key as YYYY-MM-DD */
function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Parse a YYYY-MM-DD date key into a display string (e.g. "17 Mar 2026") */
export function formatDateKeyDisplay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Parse a YYYY-MM-DD date key into a long display string (e.g. "Monday, 17 Mar 2026") */
export function formatDateKeyLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
