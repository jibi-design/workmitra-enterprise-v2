// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterDayCell.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\rosterWeekly\RosterDayCell.tsx

import { isToday } from "../../helpers/rosterPlannerUtils";
import type { RosterAssignment } from "../../types/rosterPlanner.types";
import { RosterSiteGroupCard, type RosterSiteGroup } from "./RosterSiteGroupCard";

type Props = {
  dateKey: string;
  siteGroups: RosterSiteGroup[];
  isOffDay: boolean;
  dayConflicts?: Set<string>;
  expanded: Set<string>;
  onToggleExpand: (key: string) => void;
  onAddClick: (date: string) => void;
  onAssignmentClick: (assignment: RosterAssignment) => void;
};

export function RosterDayCell({
  dateKey,
  siteGroups,
  isOffDay,
  dayConflicts,
  expanded,
  onToggleExpand,
  onAddClick,
  onAssignmentClick,
}: Props) {
  const today = isToday(dateKey);
  const hasConflict = Boolean(dayConflicts && dayConflicts.size > 0);

  return (
    <div
      style={{
        minHeight: 90,
        padding: 5,
        borderRadius: 10,
        border: today
          ? "2px solid #0369a1"
          : hasConflict
            ? "2px solid #dc2626"
            : "1px solid var(--wm-er-border, #e5e7eb)",
        background: today ? "#eff6ff" : isOffDay ? "#fafafa" : "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {hasConflict && (
        <div
          style={{
            padding: "3px 6px",
            borderRadius: 4,
            background: "#fef2f2",
            fontSize: 9,
            fontWeight: 800,
            color: "#dc2626",
            textAlign: "center",
          }}
        >
          Conflict
        </div>
      )}

      {siteGroups.map((group) => {
        const expandKey = `${dateKey}::${group.site}`;

        return (
          <RosterSiteGroupCard
            key={group.site}
            dateKey={dateKey}
            group={group}
            isExpanded={expanded.has(expandKey)}
            dayConflicts={dayConflicts}
            onToggleExpand={onToggleExpand}
            onAssignmentClick={onAssignmentClick}
          />
        );
      })}

      {siteGroups.length === 0 ? (
        <button
          type="button"
          onClick={() => onAddClick(dateKey)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 0",
            background: "none",
            border: "1px dashed var(--wm-er-border, #e5e7eb)",
            borderRadius: 7,
            cursor: "pointer",
          }}
        >
          <span
            style={{ fontSize: 11, color: "var(--wm-er-muted)", opacity: 0.8, fontWeight: 800 }}
          >
            Add
          </span>

          <span style={{ fontSize: 9, color: "var(--wm-er-muted)", opacity: 0.6 }}>
            No assignments
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onAddClick(dateKey)}
          style={{
            marginTop: "auto",
            padding: "4px 0",
            fontSize: 10,
            fontWeight: 700,
            color: "#0369a1",
            background: "none",
            border: "1px dashed var(--wm-er-border, #e5e7eb)",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      )}
    </div>
  );
}
