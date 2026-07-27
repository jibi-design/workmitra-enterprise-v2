// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterSiteGroupCard.tsx — Wave 3 P2-1 worker list cap when expanded

import { useState } from "react";
import { getSiteColor } from "../../helpers/rosterPlannerConstants";
import type { RosterAssignment } from "../../types/rosterPlanner.types";

export type RosterSiteGroup = {
  site: string;
  shiftLabel: string;
  assignments: RosterAssignment[];
};

/** Cap expanded worker rows to limit DOM under 100+ staff sites (P2-1). */
const WORKER_SHOW_LIMIT = 12;

type Props = {
  dateKey: string;
  group: RosterSiteGroup;
  isExpanded: boolean;
  dayConflicts?: Set<string>;
  onToggleExpand: (key: string) => void;
  onAssignmentClick: (assignment: RosterAssignment) => void;
};

export function RosterSiteGroupCard({
  dateKey,
  group,
  isExpanded,
  dayConflicts,
  onToggleExpand,
  onAssignmentClick,
}: Props) {
  const siteColor = getSiteColor(group.site);
  const expandKey = `${dateKey}::${group.site}`;
  const staffCount = group.assignments.length;
  const groupHasConflict = dayConflicts
    ? group.assignments.some((assignment) => dayConflicts.has(assignment.hrCandidateId))
    : false;
  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const visibleWorkers = showAllWorkers
    ? group.assignments
    : group.assignments.slice(0, WORKER_SHOW_LIMIT);
  const hiddenWorkers = Math.max(0, group.assignments.length - WORKER_SHOW_LIMIT);

  return (
    <div
      style={{
        borderRadius: 7,
        overflow: "hidden",
        border: groupHasConflict ? "1px solid #fecaca" : "none",
      }}
    >
      <button
        type="button"
        onClick={() => onToggleExpand(expandKey)}
        style={{
          width: "100%",
          padding: "6px 8px",
          background: siteColor.bg,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: siteColor.color }}>
            {group.site} ({staffCount})
          </div>

          <div style={{ fontSize: 9, color: siteColor.color, opacity: 0.75, fontWeight: 800 }}>
            {isExpanded ? "Collapse" : "Expand"}
          </div>
        </div>

        <div style={{ fontSize: 10, color: siteColor.color, opacity: 0.7, marginTop: 1 }}>
          {group.shiftLabel}
        </div>
      </button>

      {isExpanded && (
        <div
          style={{
            background: siteColor.bg,
            borderTop: `1px solid ${siteColor.color}20`,
            maxHeight: 220,
            overflowY: "auto",
            contain: "paint layout",
          }}
        >
          {visibleWorkers.map((assignment) => {
            const employeeHasConflict = dayConflicts?.has(assignment.hrCandidateId) ?? false;

            return (
              <button
                key={assignment.id}
                type="button"
                onClick={() => onAssignmentClick(assignment)}
                style={{
                  width: "100%",
                  padding: "5px 8px",
                  background: employeeHasConflict ? "#fef2f2" : "none",
                  border: "none",
                  borderBottom: `1px solid ${siteColor.color}10`,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {employeeHasConflict && (
                  <span style={{ fontSize: 9, flexShrink: 0, color: "#dc2626", fontWeight: 900 }}>
                    Conflict
                  </span>
                )}

                <span style={{ fontSize: 11, color: siteColor.color, fontWeight: 600 }}>
                  {assignment.employeeName}
                </span>
              </button>
            );
          })}

          {hiddenWorkers > 0 && !showAllWorkers ? (
            <button
              type="button"
              className="wm-outlineBtn"
              aria-label={`Show ${hiddenWorkers} more workers`}
              onClick={() => setShowAllWorkers(true)}
              style={{
                width: "100%",
                minHeight: 32,
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 0,
              }}
            >
              Show {hiddenWorkers} more
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
