// src/features/employer/hrManagement/components/AttendanceLogSection.tsx
//
// Employer Attendance Log — Parent Container (Root Map Section 5.3.A).
// Assembles: CalendarGrid + QuickMark + MonthlySummary.
// Replaces Excel-based attendance tracking.
// Employer-controlled — employee CANNOT see or edit.
// NOT connected to employee's personal Work Diary — completely separate system.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { attendanceLogStorage } from "../storage/attendanceLog.storage";
import { useAttendanceEntries } from "../helpers/attendanceHooks";
import { buildCalendarGrid } from "../helpers/attendanceCalendarUtils";
import { ATT_MONTH_NAMES, ATT_STATUS_CONFIG, ATT_STATUS_LIST } from "../helpers/attendanceConstants";
import { AttendanceCalendarGrid } from "./AttendanceCalendarGrid";
import { AttendanceQuickMark } from "./AttendanceQuickMark";
import { AttendanceMonthlySummary } from "./AttendanceMonthlySummary";
import { CenterModal } from "../../../../shared/components/CenterModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  record: HRCandidateRecord;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AttendanceLogSection({ record }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  // Quick mark popover state
  const [quickMarkDate, setQuickMarkDate] = useState<string | null>(null);

  // Subscribed data
  const entries = useAttendanceEntries(record.id, viewYear, viewMonth);
  const entryMap = new Map(entries.map((e) => [e.dateKey, e]));

  // Calendar grid
  const weeks = buildCalendarGrid(viewYear, viewMonth);
  const todayKey = attendanceLogStorage.toDateKey(today);

  // ── Month navigation ──

  const goBack = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goForward = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      {/* ── Section Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
            Attendance Log
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            Employer-verified official record
          </div>
        </div>
      </div>

      {/* ── Month Navigation ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button
          type="button"
          onClick={goBack}
          style={{
            width: 32,
            height: 32,
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--wm-er-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </button>

        <button
          type="button"
          onClick={goToday}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 900,
            fontSize: 14,
            color: "var(--wm-er-text)",
          }}
        >
          {ATT_MONTH_NAMES[viewMonth - 1]} {viewYear}
        </button>

        <button
          type="button"
          onClick={goForward}
          style={{
            width: 32,
            height: 32,
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--wm-er-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ›
        </button>
      </div>

      {/* ── Calendar Grid ── */}
      <AttendanceCalendarGrid
        weeks={weeks}
        entryMap={entryMap}
        todayKey={todayKey}
        onCellTap={(dateKey) => setQuickMarkDate(dateKey)}
      />

      {/* ── Legend ── */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          padding: "8px 0",
          borderTop: "1px solid var(--wm-er-border, #e5e7eb)",
        }}
      >
        {ATT_STATUS_LIST.map((s) => {
          const cfg = ATT_STATUS_CONFIG[s];
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
              <span style={{ fontSize: 12 }}>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--wm-er-accent-console, #0369a1)",
            }}
          />
          <span>Has details</span>
        </div>
      </div>

      {/* ── Monthly Summary ── */}
      <div style={{ marginTop: 12 }}>
        <AttendanceMonthlySummary hrCandidateId={record.id} year={viewYear} month={viewMonth} />
      </div>

      {/* ── Quick Mark Popover (modal) ── */}
      {quickMarkDate && (
        <CenterModal
          open={!!quickMarkDate}
          onBackdropClose={() => setQuickMarkDate(null)}
          ariaLabel="Quick Mark Attendance"
          maxWidth={360}
        >
          <AttendanceQuickMark
            dateKey={quickMarkDate}
            hrCandidateId={record.id}
            currentStatus={entryMap.get(quickMarkDate)?.status}
            onClose={() => setQuickMarkDate(null)}
          />
        </CenterModal>
      )}
    </div>
  );
}
