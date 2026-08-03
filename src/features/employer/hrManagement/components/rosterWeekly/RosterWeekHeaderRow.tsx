// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterWeekHeaderRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\rosterWeekly\RosterWeekHeaderRow.tsx

import {
  DAY_SHORT_LABELS,
  ROSTER_MUTED_BG,
  ROSTER_MUTED_FG,
  ROSTER_OFF_BG,
  ROSTER_TODAY_BG,
  ROSTER_TODAY_FG,
} from "../../helpers/rosterPlannerConstants";
import { formatDayNumber, fromDateKey, isToday } from "../../helpers/rosterPlannerUtils";

type Props = {
  weekDates: string[];
  getAssignmentCount: (dateKey: string) => number;
  isOffDay: (dateKey: string) => boolean;
};

export function RosterWeekHeaderRow({ weekDates, getAssignmentCount, isOffDay }: Props) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}
    >
      {weekDates.map((dateKey) => {
        const date = fromDateKey(dateKey);
        const dayIndex = date.getDay();
        const today = isToday(dateKey);
        const offDay = isOffDay(dateKey);
        const dayCount = getAssignmentCount(dateKey);

        return (
          <div
            key={dateKey}
            style={{
              textAlign: "center",
              padding: "8px 4px 6px",
              borderRadius: 10,
              background: today ? ROSTER_TODAY_BG : offDay ? ROSTER_OFF_BG : ROSTER_MUTED_BG,
              color: today ? ROSTER_TODAY_FG : offDay ? ROSTER_MUTED_FG : "var(--wm-er-text)",
              border: today ? `1px solid ${ROSTER_TODAY_FG}` : "1px solid transparent",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              {DAY_SHORT_LABELS[dayIndex]}
            </div>

            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>
              {formatDayNumber(dateKey)}
            </div>

            {dayCount > 0 && (
              <div
                style={{
                  marginTop: 3,
                  fontSize: 9,
                  fontWeight: 800,
                  color: today ? "rgba(255,255,255,0.8)" : "#b45309",
                }}
              >
                {dayCount} staff
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
