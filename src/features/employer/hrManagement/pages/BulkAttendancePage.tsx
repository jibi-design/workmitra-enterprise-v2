// src/features/employer/hrManagement/pages/BulkAttendancePage.tsx
//
// Daily Attendance — Bulk Marking Page (Root Map 5.3.3).
// Slim orchestrator — delegates to split components.

import { useState, useEffect, useMemo } from "react";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";
import type { AttendanceDayStatus } from "../types/attendanceLog.types";
import {
  buildRows, filterRows, groupByDepartment, calcSummary,
  shiftDate, formatDateDisplay,
  type FilterTab,
} from "../helpers/bulkAttendanceHelpers";
import { BulkAttendanceSummaryCard } from "../components/BulkAttendanceSummaryCard";
import { BulkAttendanceFilterTabs } from "../components/BulkAttendanceFilterTabs";
import { BulkAttendanceDepartmentGroup } from "../components/BulkAttendanceDepartmentGroup";
import { BulkAttendanceUpcomingLeave } from "../components/BulkAttendanceUpcomingLeave";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

// ─────────────────────────────────────────────────────────────────────────────
// Legend Data
// ─────────────────────────────────────────────────────────────────────────────

const LEGEND: { label: string; bg: string; border: string; color: string }[] = [
  { label: "Present", bg: "#dcfce7", border: "#86efac", color: "#15803d" },
  { label: "Absent",  bg: "#fee2e2", border: "#fca5a5", color: "#dc2626" },
  { label: "Leave",   bg: "#fef3c7", border: "#fcd34d", color: "#d97706" },
  { label: "Off",     bg: "#f3f4f6", border: "#d1d5db", color: "#6b7280" },
  { label: "Not Marked", bg: "#fff", border: "#fca5a5", color: "#dc2626" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BulkAttendancePage() {
  const todayKey = attendanceLogStorage.toDateKey(new Date());

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [rows, setRows] = useState(() => buildRows(todayKey));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());
  const [markAllConfirm, setMarkAllConfirm] = useState<ConfirmData | null>(null);

  useEffect(() => {
    const refresh = () => setRows(buildRows(selectedDate));
    refresh();
    const u1 = attendanceLogStorage.subscribe(refresh);
    const u2 = hrManagementStorage.subscribe(refresh);
    return () => { u1(); u2(); };
  }, [selectedDate]);

  const summary = useMemo(() => calcSummary(rows), [rows]);
  const filteredRows = useMemo(() => filterRows(rows, searchQuery, activeFilter), [rows, searchQuery, activeFilter]);
  const groups = useMemo(() => groupByDepartment(filteredRows), [filteredRows]);

  const isOffDay = companyConfigStorage.isOffDay(selectedDate);
  const isToday = selectedDate === todayKey;

  // ── Mark ──
  const handleMark = (hrCandidateId: string, status: AttendanceDayStatus) => {
    const shiftTimes = companyConfigStorage.getShiftTimes();
    if (status === "present") {
      attendanceLogStorage.saveDayDetail(hrCandidateId, selectedDate, {
        status: "present", signInTime: shiftTimes.start, signOutTime: shiftTimes.end, location: "", note: "",
      });
    } else {
      attendanceLogStorage.quickMark(hrCandidateId, selectedDate, status);
    }
  };

  // ── Mark All ──
  const handleMarkAllRequest = () => {
    const unmarkedCount = rows.filter((r) => !r.isAutoOff && r.currentStatus === null).length;
    if (unmarkedCount === 0) return;
    setMarkAllConfirm({
      title: "Mark All Present",
      message: `This will mark ${unmarkedCount} unmarked employee${unmarkedCount > 1 ? "s" : ""} as Present with default shift timings. Already marked employees will not be changed.`,
      tone: "warn", confirmLabel: `Mark ${unmarkedCount} Present`, cancelLabel: "Cancel",
    });
  };

  const handleMarkAllConfirm = () => {
    const shiftTimes = companyConfigStorage.getShiftTimes();
    for (const row of rows) {
      if (!row.isAutoOff && row.currentStatus === null) {
        attendanceLogStorage.saveDayDetail(row.record.id, selectedDate, {
          status: "present", signInTime: shiftTimes.start, signOutTime: shiftTimes.end, location: "", note: "",
        });
      }
    }
    setMarkAllConfirm(null);
  };

  const toggleCollapse = (dept: string) => {
    setCollapsedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept); else next.add(dept);
      return next;
    });
  };

  return (
    <div>
      

      {/* Header Card */}
      <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(3, 105, 161,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#0369a1" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: "var(--wm-er-text)" }}>Daily Attendance</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>Mark all employees in one screen — one tap per person</div>
          </div>
        </div>

        {/* Date Nav */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <button type="button" onClick={() => setSelectedDate((d) => shiftDate(d, -1))} style={{
            width: 36, height: 36, border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8,
            background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--wm-er-text)" }}>{formatDateDisplay(selectedDate)}</div>
            {!isToday && (
              <button type="button" onClick={() => setSelectedDate(todayKey)} style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                color: "var(--wm-er-accent-console)", marginTop: 2, padding: 0,
              }}>Go to Today</button>
            )}
          </div>
          <button type="button" onClick={() => setSelectedDate((d) => shiftDate(d, 1))} style={{
            width: 36, height: 36, border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8,
            background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>›</button>
        </div>

        {isOffDay && (
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "#f3f4f6", border: "1px solid #d1d5db", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
            This is a weekend or company holiday — all employees auto-marked as Off.
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, padding: "8px 10px", borderRadius: 8, background: "#f9fafb", border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
          {LEGEND.map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}`, display: "inline-block" }} />
              <span style={{ color: l.color, fontWeight: 700 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Summary */}
      <div style={{ marginTop: 10 }}>
        <BulkAttendanceSummaryCard summary={summary} />
      </div>

      {/* Search + Mark All */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, role, department..."
          style={{ flex: 1, padding: "9px 12px", fontSize: 13, border: "1px solid var(--wm-er-border, #e5e7eb)", borderRadius: 8, outline: "none", background: "#fff", color: "var(--wm-er-text)", boxSizing: "border-box" }}
        />
         {!isOffDay && rows.length > 0 && (
          <button className="wm-primarybtn" type="button" onClick={handleMarkAllRequest}
            disabled={summary.notMarked === 0}
            style={{ fontSize: 11, padding: "9px 14px", whiteSpace: "nowrap", opacity: summary.notMarked > 0 ? 1 : 0.5 }}>
            Mark All Present
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ marginTop: 10 }}>
        <BulkAttendanceFilterTabs activeFilter={activeFilter} summary={summary} onChange={setActiveFilter} />
      </div>

      {/* Department Groups */}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        {groups.map((group) => (
          <BulkAttendanceDepartmentGroup
            key={group.name}
            group={group}
            isCollapsed={collapsedDepts.has(group.name)}
            onToggle={() => toggleCollapse(group.name)}
            onMark={handleMark}
          />
        ))}
        {filteredRows.length === 0 && rows.length > 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
            {searchQuery ? "No employees match your search." : "No employees match this filter."}
          </div>
        )}
        {rows.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
            No active employees found. Add employees through HR Management first.
          </div>
        )}
      </div>

      {/* Upcoming Leave */}
      <div style={{ marginTop: 14, marginBottom: 32 }}>
        <BulkAttendanceUpcomingLeave rows={rows} />
      </div>

      <ConfirmModal confirm={markAllConfirm} onConfirm={handleMarkAllConfirm} onCancel={() => setMarkAllConfirm(null)} />
    </div>
  );
}
