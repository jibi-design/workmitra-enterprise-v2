// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterWeekHeaderRow.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\rosterWeekly\RosterWeekHeaderRow.tsx

import { DAY_SHORT_LABELS } from "../../helpers/rosterPlannerConstants";
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
              background: today ? "#0369a1" : offDay ? "#f3f4f6" : "#f9fafb",
              color: today ? "#fff" : offDay ? "#9ca3af" : "var(--wm-er-text)",
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
