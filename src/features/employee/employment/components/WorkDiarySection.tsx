// src/features/employee/employment/components/WorkDiarySection.tsx
//
// Work Diary — Parent Container (Root Map Section 5.5.A).
// Employee's personal work log — 100% private.
// Assembles: PunchCard + Calendar + DayEntry + Summary.

import { useState } from "react";
import { workDiaryStorage } from "../storage/workDiary.storage";
import { useWorkDiaryEntries } from "../helpers/workDiaryHooks";
import { buildDiaryCalendarGrid } from "../helpers/workDiaryCalendarUtils";
import { WD_MONTH_NAMES, WD_STATUS_CONFIG, WD_STATUS_LIST } from "../helpers/workDiaryConstants";
import { WorkDiaryPunchCard } from "./WorkDiaryPunchCard";
import { WorkDiaryCalendarGrid } from "./WorkDiaryCalendarGrid";
import { WorkDiaryDayEntry } from "./WorkDiaryDayEntry";
import { WorkDiarySummary } from "./WorkDiarySummary";
import { CenterModal } from "../../../../shared/components/CenterModal";

type Props = {
  employmentId: string;
};

export function WorkDiarySection({ employmentId }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const entries = useWorkDiaryEntries(employmentId, viewYear, viewMonth);
  const entryMap = new Map(entries.map((e) => [e.dateKey, e]));
  const weeks = buildDiaryCalendarGrid(viewYear, viewMonth);
  const todayKey = workDiaryStorage.toDateKey(today);

  const goBack = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
    else { setViewMonth((m) => m - 1); }
  };

  const goForward = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
    else { setViewMonth((m) => m + 1); }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
  };

  return (
    <div className="wm-ee-card">
      {/* Section Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
          Work Diary
        </div>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
          Your personal work log — only you can see this
        </div>
      </div>

      {/* Punch Card */}
      <WorkDiaryPunchCard employmentId={employmentId} />

      {/* Month Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 12px" }}>
        <button type="button" onClick={goBack} style={{
          width: 32, height: 32,
          border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
          borderRadius: 8, background: "#fff", cursor: "pointer",
          fontSize: 14, fontWeight: 700,
          color: "var(--wm-emp-text, var(--wm-er-text))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          ‹
        </button>
        <button type="button" onClick={goToday} style={{
          background: "none", border: "none", cursor: "pointer",
          fontWeight: 900, fontSize: 14,
          color: "var(--wm-emp-text, var(--wm-er-text))",
        }}>
          {WD_MONTH_NAMES[viewMonth - 1]} {viewYear}
        </button>
        <button type="button" onClick={goForward} style={{
          width: 32, height: 32,
          border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
          borderRadius: 8, background: "#fff", cursor: "pointer",
          fontSize: 14, fontWeight: 700,
          color: "var(--wm-emp-text, var(--wm-er-text))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          ›
        </button>
      </div>

      {/* Calendar */}
      <WorkDiaryCalendarGrid
        weeks={weeks}
        entryMap={entryMap}
        todayKey={todayKey}
        onCellTap={(dateKey) => setSelectedDate(dateKey)}
      />

      {/* Legend */}
      <div style={{
        marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10,
        padding: "8px 0",
        borderTop: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
      }}>
        {WD_STATUS_LIST.map((s) => {
          const cfg = WD_STATUS_CONFIG[s];
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
              <span style={{ fontSize: 12 }}>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
          <span>Notes</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d97706", display: "inline-block" }} />
          <span>Photos</span>
        </div>
      </div>

      {/* Monthly Summary */}
      <div style={{ marginTop: 12 }}>
        <WorkDiarySummary employmentId={employmentId} year={viewYear} month={viewMonth} />
      </div>

      {/* Day Entry Modal */}
      {selectedDate && (
        <CenterModal
          open={!!selectedDate}
          onBackdropClose={() => setSelectedDate(null)}
          ariaLabel="Work Diary Day Entry"
          maxWidth={380}
        >
          <WorkDiaryDayEntry
            dateKey={selectedDate}
            employmentId={employmentId}
            currentStatus={entryMap.get(selectedDate)?.status}
            onClose={() => setSelectedDate(null)}
          />
        </CenterModal>
      )}
    </div>
  );
}