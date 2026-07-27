// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterWeeklyGrid.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\RosterWeeklyGrid.tsx

import { useMemo, useState } from "react";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";
import type { RosterAssignment, RosterConflict } from "../types/rosterPlanner.types";
import { RosterDayCell } from "./rosterWeekly/RosterDayCell";
import { RosterWeekHeaderRow } from "./rosterWeekly/RosterWeekHeaderRow";
import type { RosterSiteGroup } from "./rosterWeekly/RosterSiteGroupCard";

type Props = {
  weekDates: string[];
  assignments: RosterAssignment[];
  /** Precomputed by page — avoid dual detectConflicts (P1-1) */
  conflicts?: RosterConflict[];
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

export function RosterWeeklyGrid({
  weekDates,
  assignments,
  conflicts = [],
  onAddClick,
  onAssignmentClick,
}: Props) {
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

  const byDate = useMemo(() => {
    const map = new Map<string, RosterAssignment[]>();
    for (const assignment of assignments) {
      const list = map.get(assignment.date) ?? [];
      list.push(assignment);
      map.set(assignment.date, list);
    }
    return map;
  }, [assignments]);

  const conflictEmployees = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const conflict of conflicts) {
      if (!map.has(conflict.date)) {
        map.set(conflict.date, new Set());
      }
      map.get(conflict.date)?.add(conflict.hrCandidateId);
    }
    return map;
  }, [conflicts]);

  const offDayByDate = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const dateKey of weekDates) {
      map.set(dateKey, companyConfigStorage.isOffDay(dateKey));
    }
    return map;
  }, [weekDates]);

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ minWidth: 640 }}>
        <RosterWeekHeaderRow
          weekDates={weekDates}
          getAssignmentCount={(dateKey) => (byDate.get(dateKey) ?? []).length}
          isOffDay={(dateKey) => offDayByDate.get(dateKey) ?? false}
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
                isOffDay={offDayByDate.get(dateKey) ?? false}
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
