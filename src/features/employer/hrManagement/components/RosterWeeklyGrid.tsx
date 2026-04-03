// src/features/employer/hrManagement/components/RosterWeeklyGrid.tsx
//
// Weekly grid for Roster Planner (Root Map Section 7.4.15) — ENHANCED.
// Site-grouped cards: "Site A (3) · 09:00-18:00" with tap-to-expand.
// Staff count badge per day, conflict icons, today column highlight,
// empty cell hint, readable font sizes.

import { useState, useMemo } from "react";
import type { RosterAssignment } from "../types/rosterPlanner.types";
import { getSiteColor, DAY_SHORT_LABELS } from "../helpers/rosterPlannerConstants";
import { formatDayNumber, isToday, fromDateKey, detectConflicts } from "../helpers/rosterPlannerUtils";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  weekDates: string[];
  assignments: RosterAssignment[];
  onAddClick: (date: string) => void;
  onAssignmentClick: (assignment: RosterAssignment) => void;
};

type SiteGroup = {
  site: string;
  shiftLabel: string;
  assignments: RosterAssignment[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function groupBySite(list: RosterAssignment[]): SiteGroup[] {
  const map = new Map<string, RosterAssignment[]>();
  for (const a of list) {
    const key = a.site.trim().toLowerCase();
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  return Array.from(map.values()).map((arr) => {
    const first = arr[0];
    return {
      site: first.site,
      shiftLabel: `${first.shiftStart}–${first.shiftEnd}`,
      assignments: arr.sort((a, b) => a.employeeName.localeCompare(b.employeeName)),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RosterWeeklyGrid({ weekDates, assignments, onAddClick, onAssignmentClick }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Group by date
  const byDate = new Map<string, RosterAssignment[]>();
  for (const a of assignments) {
    const list = byDate.get(a.date) ?? [];
    list.push(a);
    byDate.set(a.date, list);
  }

  // Per-day conflict detection
  const conflictEmployees = useMemo(() => {
    const conflicts = detectConflicts(assignments);
    const map = new Map<string, Set<string>>(); // date → set of hrCandidateIds
    for (const c of conflicts) {
      if (!map.has(c.date)) map.set(c.date, new Set());
      map.get(c.date)!.add(c.hrCandidateId);
    }
    return map;
  }, [assignments]);

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ minWidth: 640 }}>
        {/* Header Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {weekDates.map((dateKey) => {
            const d = fromDateKey(dateKey);
            const dayIdx = d.getDay();
            const today = isToday(dateKey);
            const isOff = companyConfigStorage.isOffDay(dateKey);
            const dayCount = (byDate.get(dateKey) ?? []).length;

            return (
              <div
                key={dateKey}
                style={{
                  textAlign: "center",
                  padding: "8px 4px 6px",
                  borderRadius: 10,
                  background: today ? "#0369a1" : isOff ? "#f3f4f6" : "#f9fafb",
                  color: today ? "#fff" : isOff ? "#9ca3af" : "var(--wm-er-text)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                  {DAY_SHORT_LABELS[dayIdx]}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>
                  {formatDayNumber(dateKey)}
                </div>
                {dayCount > 0 && (
                  <div style={{
                    marginTop: 3,
                    fontSize: 9,
                    fontWeight: 800,
                    color: today ? "rgba(255,255,255,0.8)" : "#b45309",
                  }}>
                    {dayCount} staff
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Assignment Cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {weekDates.map((dateKey) => {
            const dayAssignments = byDate.get(dateKey) ?? [];
            const isOff = companyConfigStorage.isOffDay(dateKey);
            const today = isToday(dateKey);
            const siteGroups = groupBySite(dayAssignments);
            const dayConflicts = conflictEmployees.get(dateKey);
            const hasConflict = dayConflicts && dayConflicts.size > 0;

            return (
              <div
                key={dateKey}
                style={{
                  minHeight: 90,
                  padding: 5,
                  borderRadius: 10,
                  border: today
                    ? "2px solid #0369a1"
                    : hasConflict
                      ? "2px solid #dc2626"
                      : "1px solid var(--wm-er-border, #e5e7eb)",
                  background: today ? "#eff6ff" : isOff ? "#fafafa" : "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {/* Conflict Warning */}
                {hasConflict && (
                  <div style={{
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "#fef2f2",
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#dc2626",
                    textAlign: "center",
                  }}>
                    ⚠️ Conflict
                  </div>
                )}

                {/* Site Group Cards */}
                {siteGroups.map((group) => {
                  const sc = getSiteColor(group.site);
                  const expandKey = `${dateKey}::${group.site}`;
                  const isExpanded = expanded.has(expandKey);
                  const staffCount = group.assignments.length;
                  // Check if any employee in this group has conflict
                  const groupHasConflict = dayConflicts
                    ? group.assignments.some((a) => dayConflicts.has(a.hrCandidateId))
                    : false;

                  return (
                    <div
                      key={group.site}
                      style={{
                        borderRadius: 7,
                        overflow: "hidden",
                        border: groupHasConflict ? "1px solid #fecaca" : "none",
                      }}
                    >
                      {/* Site Card Header */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(expandKey)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          background: sc.bg,
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: sc.color }}>
                            {group.site} ({staffCount})
                          </div>
                          <div style={{ fontSize: 10, color: sc.color, opacity: 0.7 }}>
                            {isExpanded ? "▲" : "▼"}
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: sc.color, opacity: 0.7, marginTop: 1 }}>
                          {group.shiftLabel}
                        </div>
                      </button>

                      {/* Expanded Names */}
                      {isExpanded && (
                        <div style={{ background: sc.bg, borderTop: `1px solid ${sc.color}20` }}>
                          {group.assignments.map((a) => {
                            const empConflict = dayConflicts?.has(a.hrCandidateId) ?? false;
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => onAssignmentClick(a)}
                                style={{
                                  width: "100%",
                                  padding: "5px 8px",
                                  background: empConflict ? "#fef2f2" : "none",
                                  border: "none",
                                  borderBottom: `1px solid ${sc.color}10`,
                                  cursor: "pointer",
                                  textAlign: "left",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                {empConflict && (
                                  <span style={{ fontSize: 10, flexShrink: 0 }}>🔴</span>
                                )}
                                <span style={{ fontSize: 11, color: sc.color, fontWeight: 600 }}>
                                  {a.employeeName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty Cell Hint + Add Button */}
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
                    <span style={{ fontSize: 16, opacity: 0.3 }}>+</span>
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
                    + Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
