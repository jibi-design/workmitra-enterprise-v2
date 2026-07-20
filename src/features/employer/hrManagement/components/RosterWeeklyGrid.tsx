// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterWeeklyGrid.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\RosterWeeklyGrid.tsx

import { useMemo, useState } from "react";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";
import { detectConflicts } from "../helpers/rosterPlannerUtils";
import type { RosterAssignment } from "../types/rosterPlanner.types";
import { RosterDayCell } from "./rosterWeekly/RosterDayCell";
import { RosterWeekHeaderRow } from "./rosterWeekly/RosterWeekHeaderRow";
import type { RosterSiteGroup } from "./rosterWeekly/RosterSiteGroupCard";

type Props = {
  weekDates: string[];
  assignments: RosterAssignment[];
  onAddClick: (date: string) => void;
  onAssignmentClick: (assignment: RosterAssignment) => void;
};

function groupBySite(list: RosterAssignment[]): RosterSiteGroup[] {
  const map = new Map<string, RosterAssignment[]>();

  for (const assignment of list) {
    const key = assignment.site.trim().toLowerCase();
    const existing = map.get(key) ?? [];

    existing.push(assignment);
    map.set(key, existing);
  }

  return Array.from(map.values()).map((groupAssignments) => {
    const first = groupAssignments[0];

    return {
      site: first.site,
      shiftLabel: `${first.shiftStart}–${first.shiftEnd}`,
      assignments: groupAssignments.sort((a, b) => a.employeeName.localeCompare(b.employeeName)),
    };
  });
}

export function RosterWeeklyGrid({ weekDates, assignments, onAddClick, onAssignmentClick }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const byDate = new Map<string, RosterAssignment[]>();

  for (const assignment of assignments) {
    const list = byDate.get(assignment.date) ?? [];
    list.push(assignment);
    byDate.set(assignment.date, list);
  }

  const conflictEmployees = useMemo(() => {
    const conflicts = detectConflicts(assignments);
    const map = new Map<string, Set<string>>();

    for (const conflict of conflicts) {
      if (!map.has(conflict.date)) {
        map.set(conflict.date, new Set());
      }

      map.get(conflict.date)?.add(conflict.hrCandidateId);
    }

    return map;
  }, [assignments]);

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ minWidth: 640 }}>
        <RosterWeekHeaderRow
          weekDates={weekDates}
          getAssignmentCount={(dateKey) => (byDate.get(dateKey) ?? []).length}
          isOffDay={(dateKey) => companyConfigStorage.isOffDay(dateKey)}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {weekDates.map((dateKey) => {
            const dayAssignments = byDate.get(dateKey) ?? [];
            const siteGroups = groupBySite(dayAssignments);

            return (
              <RosterDayCell
                key={dateKey}
                dateKey={dateKey}
                siteGroups={siteGroups}
                isOffDay={companyConfigStorage.isOffDay(dateKey)}
                dayConflicts={conflictEmployees.get(dateKey)}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                onAddClick={onAddClick}
                onAssignmentClick={onAssignmentClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
