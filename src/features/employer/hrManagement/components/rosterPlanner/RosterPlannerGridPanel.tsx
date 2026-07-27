// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterPlannerGridPanel.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\rosterPlanner\RosterPlannerGridPanel.tsx

import { RosterMonthlyGrid } from "../RosterMonthlyGrid";
import { RosterWeeklyGrid } from "../RosterWeeklyGrid";
import type {
  RosterAssignment,
  RosterConflict,
  RosterViewMode,
} from "../../types/rosterPlanner.types";

type Props = {
  view: RosterViewMode;
  weekDates: string[];
  monthCalDates: string[];
  currentMonth: number;
  assignments: RosterAssignment[];
  conflicts?: RosterConflict[];
  onAddClick: (date: string) => void;
  onAssignmentClick: (assignment: RosterAssignment) => void;
  onDayClick: (date: string) => void;
};

export function RosterPlannerGridPanel({
  view,
  weekDates,
  monthCalDates,
  currentMonth,
  assignments,
  conflicts,
  onAddClick,
  onAssignmentClick,
  onDayClick,
}: Props) {
  return (
    <div
      style={{
        padding: 12,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      {view === "weekly" ? (
        <RosterWeeklyGrid
          weekDates={weekDates}
          assignments={assignments}
          conflicts={conflicts}
          onAddClick={onAddClick}
          onAssignmentClick={onAssignmentClick}
        />
      ) : (
        <RosterMonthlyGrid
          calendarDates={monthCalDates}
          currentMonth={currentMonth}
          assignments={assignments}
          onDayClick={onDayClick}
        />
      )}
    </div>
  );
}
