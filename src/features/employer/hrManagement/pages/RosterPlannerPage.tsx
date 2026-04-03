// src/features/employer/hrManagement/pages/RosterPlannerPage.tsx
//
// Team Calendar / Roster Planner page (Root Map Section 7.4.15).
// Weekly (default) + Monthly views. Assign staff to sites/shifts per day.
// Conflict detection: same person, 2 sites, same day.

import { useState, useMemo, useCallback } from "react";
import { useRosterForRange } from "../helpers/rosterPlannerHooks";
import { rosterPlannerStorage } from "../storage/rosterPlanner.storage";
import type { RosterAssignment, RosterViewMode } from "../types/rosterPlanner.types";
import {
  getWeekDates,
  shiftWeek,
  getMonthCalendarDates,
  shiftMonth,
  formatDateShort,
  detectConflicts,
} from "../helpers/rosterPlannerUtils";
import { RosterWeeklyGrid } from "../components/RosterWeeklyGrid";
import { RosterMonthlyGrid } from "../components/RosterMonthlyGrid";
import { RosterConflictBanner } from "../components/RosterConflictBanner";
import { RosterAssignModal } from "../components/RosterAssignModal";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

// ─────────────────────────────────────────────────────────────────────────────
// View Tabs
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_TABS: { key: RosterViewMode; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RosterPlannerPage() {
  const [view, setView] = useState<RosterViewMode>("weekly");
  const [refDate, setRefDate] = useState(new Date());
  const [monthYear, setMonthYear] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [assignDate, setAssignDate] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<RosterAssignment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);
  const monthCalDates = useMemo(
    () => getMonthCalendarDates(monthYear.year, monthYear.month),
    [monthYear.year, monthYear.month],
  );

  const startDate = view === "weekly" ? weekDates[0] : monthCalDates[0];
  const endDate = view === "weekly" ? weekDates[6] : monthCalDates[monthCalDates.length - 1];

  const assignments = useRosterForRange(startDate, endDate);
  const conflicts = useMemo(() => detectConflicts(assignments), [assignments]);

  const handlePrev = useCallback(() => {
    if (view === "weekly") {
      setRefDate((d) => shiftWeek(d, -1));
    } else {
      setMonthYear((my) => shiftMonth(my.year, my.month, -1));
    }
  }, [view]);

  const handleNext = useCallback(() => {
    if (view === "weekly") {
      setRefDate((d) => shiftWeek(d, 1));
    } else {
      setMonthYear((my) => shiftMonth(my.year, my.month, 1));
    }
  }, [view]);

  const handleToday = useCallback(() => {
    setRefDate(new Date());
    setMonthYear({ year: new Date().getFullYear(), month: new Date().getMonth() });
  }, []);

  const navTitle = view === "weekly"
    ? `${formatDateShort(weekDates[0])} &ndash; ${formatDateShort(weekDates[6])}`
    : new Date(monthYear.year, monthYear.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const handleAddClick = (date: string) => setAssignDate(date);
  const handleAssignmentClick = (a: RosterAssignment) => setSelectedAssignment(a);
  const handleDayClick = (date: string) => {
    setRefDate(new Date(date + "T00:00:00"));
    setView("weekly");
  };
  const handleAssignSuccess = () => {
    setSuccessMsg("Staff assigned successfully!");
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleDeleteAssignment = () => {
    if (!selectedAssignment) return;
    setDeleteConfirm({
      title: "Remove Assignment",
      message: `Remove ${selectedAssignment.employeeName} from ${selectedAssignment.site} on ${formatDateShort(selectedAssignment.date)}?`,
      tone: "danger", confirmLabel: "Remove", cancelLabel: "Keep",
    });
  };

  const handleDeleteConfirm = () => {
    if (selectedAssignment) {
      rosterPlannerStorage.deleteAssignment(selectedAssignment.id);
      setSelectedAssignment(null);
      setDeleteConfirm(null);
      setSuccessMsg("Assignment removed.");
      setTimeout(() => setSuccessMsg(""), 2500);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: 16, background: "#fff", borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)", marginBottom: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(180,83,9,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>
            &#128197;
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--wm-er-text)" }}>Team Calendar</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
              Assign staff to sites and shifts
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{
          display: "flex", gap: 0, borderRadius: 8, overflow: "hidden",
          border: "1px solid var(--wm-er-border, #e5e7eb)", marginBottom: 10,
        }}>
          {VIEW_TABS.map((t) => {
            const isActive = view === t.key;
            return (
              <button key={t.key} type="button" onClick={() => setView(t.key)} style={{
                flex: 1, padding: "8px 0", fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#fff" : "var(--wm-er-muted)",
                background: isActive ? "#b45309" : "transparent",
                border: "none", cursor: "pointer",
              }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button type="button" onClick={handlePrev} style={{
            background: "none", border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 14, color: "var(--wm-er-text)",
          }}>&#8592;</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-er-text)" }}>{navTitle}</div>
            <button type="button" onClick={handleToday} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-console, #0369a1)", padding: 0, marginTop: 2,
            }}>Today</button>
          </div>
          <button type="button" onClick={handleNext} style={{
            background: "none", border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 14, color: "var(--wm-er-text)",
          }}>&#8594;</button>
        </div>

        {successMsg && (
          <div style={{
            marginTop: 10, padding: "8px 14px", borderRadius: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            fontSize: 12, fontWeight: 700, color: "#15803d",
          }}>{successMsg}</div>
        )}
      </div>

      <RosterConflictBanner conflicts={conflicts} />

      <div style={{ padding: 12, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
        {view === "weekly" ? (
          <RosterWeeklyGrid
            weekDates={weekDates}
            assignments={assignments}
            onAddClick={handleAddClick}
            onAssignmentClick={handleAssignmentClick}
          />
        ) : (
          <RosterMonthlyGrid
            calendarDates={monthCalDates}
            currentMonth={monthYear.month}
            assignments={assignments}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {assignDate && (
        <RosterAssignModal
          open={!!assignDate}
          date={assignDate}
          onClose={() => setAssignDate(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {selectedAssignment && !deleteConfirm && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
          onClick={() => setSelectedAssignment(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14, padding: 20,
              maxWidth: 360, width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--wm-er-text)", marginBottom: 8 }}>
              {selectedAssignment.employeeName}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 12 }}>
              <span>&#128197; {formatDateShort(selectedAssignment.date)}</span>
              <span>&#128205; {selectedAssignment.site}</span>
              <span>&#128336; {selectedAssignment.shiftStart} &ndash; {selectedAssignment.shiftEnd}</span>
              {selectedAssignment.note && <span>&#128221; {selectedAssignment.note}</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={handleDeleteAssignment} style={{
                padding: "7px 14px", fontSize: 12, fontWeight: 700,
                color: "#dc2626", background: "none",
                border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer",
              }}>Remove</button>
              <div style={{ flex: 1 }} />
              <button className="wm-outlineBtn" type="button" onClick={() => setSelectedAssignment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        confirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteConfirm(null); setSelectedAssignment(null); }}
      />
    </div>
  );
}