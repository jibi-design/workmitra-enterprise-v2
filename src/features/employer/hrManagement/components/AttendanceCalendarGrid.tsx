// src/features/employer/hrManagement/components/AttendanceCalendarGrid.tsx
//
// Monthly calendar grid for Employer Attendance Log.
// Renders day cells with status colors + detail indicator dots.
// Tap a date → triggers onCellTap callback (parent handles popover/modal).

import type { AttendanceDayEntry } from "../types/attendanceLog.types";
import type { CalendarDay } from "../helpers/attendanceCalendarUtils";
import { ATT_DAY_NAMES, ATT_STATUS_CONFIG } from "../helpers/attendanceConstants";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CalendarGridProps = {
  /** Weeks array from buildCalendarGrid() */
  weeks: CalendarDay[][];
  /** Map of dateKey → entry (for status coloring) */
  entryMap: Map<string, AttendanceDayEntry>;
  /** Today's date key (YYYY-MM-DD) for highlight */
  todayKey: string;
  /** Called when a current-month cell is tapped */
  onCellTap: (dateKey: string) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Cell
// ─────────────────────────────────────────────────────────────────────────────

function CalendarCell({
  day,
  entry,
  isToday,
  onTap,
}: {
  day: CalendarDay;
  entry?: AttendanceDayEntry;
  isToday: boolean;
  onTap: () => void;
}) {
  const cfg = entry ? ATT_STATUS_CONFIG[entry.status] : null;
  const hasDetail = !!(entry && (entry.signInTime || entry.note || entry.location));

  return (
    <button
      type="button"
      onClick={day.isCurrentMonth ? onTap : undefined}
      disabled={!day.isCurrentMonth}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1",
        border: isToday
          ? "2px solid var(--wm-er-accent-console, #0369a1)"
          : "1px solid var(--wm-er-border, #e5e7eb)",
        borderRadius: 8,
        background: !day.isCurrentMonth ? "#fafafa" : cfg ? cfg.bg : "#fff",
        cursor: day.isCurrentMonth ? "pointer" : "default",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        opacity: day.isCurrentMonth ? 1 : 0.35,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: isToday ? 900 : 600,
          color: day.isCurrentMonth ? "var(--wm-er-text)" : "var(--wm-er-muted)",
        }}
      >
        {day.dayNum}
      </span>

      {cfg && <span style={{ fontSize: 10 }}>{cfg.icon}</span>}

      {hasDetail && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 3,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--wm-er-accent-console, #0369a1)",
          }}
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Grid
// ─────────────────────────────────────────────────────────────────────────────

export function AttendanceCalendarGrid({ weeks, entryMap, todayKey, onCellTap }: CalendarGridProps) {
  return (
    <div>
      {/* Day Names Header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {ATT_DAY_NAMES.map((name) => (
          <div
            key={name}
            style={{
              textAlign: "center",
              fontSize: 10,
              fontWeight: 800,
              color: "var(--wm-er-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              padding: "4px 0",
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Weeks Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {week.map((day) => (
              <CalendarCell
                key={day.dateKey}
                day={day}
                entry={entryMap.get(day.dateKey)}
                isToday={day.dateKey === todayKey}
                onTap={() => onCellTap(day.dateKey)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
