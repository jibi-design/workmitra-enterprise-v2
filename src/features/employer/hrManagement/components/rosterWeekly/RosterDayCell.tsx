// App: Job Mitra / WorkMitra_Enterprise_v2
// File: RosterDayCell.tsx — Wave 3 P2-1 scoped site-group cap

import { useState } from "react";
import { isToday } from "../../helpers/rosterPlannerUtils";
import {
  ROSTER_OFF_BG,
  ROSTER_SURFACE,
  ROSTER_TODAY_BG,
  ROSTER_TODAY_BORDER,
  ROSTER_TODAY_FG,
} from "../../helpers/rosterPlannerConstants";
import type { RosterAssignment } from "../../types/rosterPlanner.types";
import { RosterSiteGroupCard, type RosterSiteGroup } from "./RosterSiteGroupCard";

/** Cap DOM nodes per day under dense multi-site weeks (P2-1). */
const SITE_SHOW_LIMIT = 4;

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
  const [showAllSites, setShowAllSites] = useState(false);
  const visibleGroups = showAllSites ? siteGroups : siteGroups.slice(0, SITE_SHOW_LIMIT);
  const hiddenSiteCount = Math.max(0, siteGroups.length - SITE_SHOW_LIMIT);

  return (
    <div
      style={{
        minHeight: 90,
        padding: 5,
        borderRadius: 10,
        border: today
          ? `2px solid ${ROSTER_TODAY_BORDER}`
          : hasConflict
            ? "2px solid var(--wm-red-600)"
            : "1px solid var(--wm-er-border)",
        background: today ? ROSTER_TODAY_BG : isOffDay ? ROSTER_OFF_BG : ROSTER_SURFACE,
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
            background: "var(--wm-red-50)",
            fontSize: 9,
            fontWeight: 800,
            color: "var(--wm-red-600)",
            textAlign: "center",
          }}
        >
          Conflict
        </div>
      )}

      {visibleGroups.map((group) => {
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

      {hiddenSiteCount > 0 && !showAllSites ? (
        <button
          type="button"
          className="wm-outlineBtn wm-press-card"
          aria-label={`Show ${hiddenSiteCount} more sites`}
          onClick={() => setShowAllSites(true)}
          style={{ minHeight: 32, fontSize: 10, fontWeight: 800 }}
        >
          +{hiddenSiteCount} more sites
        </button>
      ) : null}

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
            color: ROSTER_TODAY_FG,
            background: "none",
            border: "1px dashed var(--wm-er-border)",
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
