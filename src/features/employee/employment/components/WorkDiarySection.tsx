// App name: Job Mitra
// File name: WorkDiarySection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\WorkDiarySection.tsx

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { buildDiaryCalendarGrid } from "../helpers/workDiaryCalendarUtils";
import { WD_MONTH_NAMES, WD_STATUS_CONFIG, WD_STATUS_LIST } from "../helpers/workDiaryConstants";
import { useWorkDiaryEntries } from "../helpers/workDiaryHooks";
import { workDiaryStorage, type WorkDiaryCycleMode } from "../storage/workDiary.storage";
import { WorkDiaryCalendarGrid } from "./WorkDiaryCalendarGrid";
import { WorkDiaryDayEntry } from "./WorkDiaryDayEntry";
import { WorkDiaryPunchCard } from "./WorkDiaryPunchCard";
import { WorkDiarySummary } from "./WorkDiarySummary";

type Props = {
  employmentId: string;
  jobTitle: string;
  companyName: string;
  activeEmployments: EmploymentRecord[];
  readOnly?: boolean;
};

const CONSOLE_BLUE = "var(--wm-er-accent-console, #0369a1)";
const TEXT = "var(--wm-emp-text, var(--wm-er-text, #1e293b))";
const MUTED = "var(--wm-emp-muted, var(--wm-er-muted, #64748b))";

export function WorkDiarySection({
  employmentId,
  jobTitle,
  companyName,
  activeEmployments,
  readOnly = false,
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [cycleSetting, setCycleSetting] = useState(() =>
    workDiaryStorage.getCycleSetting(employmentId),
  );

  const entries = useWorkDiaryEntries(employmentId, viewYear, viewMonth);
  const entryMap = new Map(entries.map((entry) => [entry.dateKey, entry]));
  const weeks = buildDiaryCalendarGrid(viewYear, viewMonth);
  const todayKey = workDiaryStorage.toDateKey(today);

  const goBack = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  };

  const goForward = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
  };

  const handleCycleModeChange = (mode: WorkDiaryCycleMode) => {
    if (readOnly) return;

    const next = {
      mode,
      startDay: mode === "custom_start_day" ? cycleSetting.startDay || 15 : 1,
    };

    workDiaryStorage.saveCycleSetting(employmentId, next);
    setCycleSetting(next);
  };

  const handleStartDayChange = (value: string) => {
    if (readOnly) return;

    const parsed = Number(value);
    const next = {
      mode: "custom_start_day" as const,
      startDay: Math.min(31, Math.max(1, Number.isFinite(parsed) ? parsed : 15)),
    };

    workDiaryStorage.saveCycleSetting(employmentId, next);
    setCycleSetting(next);
  };

  return (
    <div className="wm-ee-card">
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 950, fontSize: 14, color: TEXT }}>
          {readOnly ? "Work Diary History" : "Work Diary"}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>
          {readOnly
            ? "Saved personal work diary for this closed employment record."
            : "Your personal work log. This is separate from official employer attendance."}
        </div>
      </div>

      {!readOnly && (
        <WorkDiaryPunchCard
          employmentId={employmentId}
          jobTitle={jobTitle}
          companyName={companyName}
          activeEmployments={activeEmployments}
        />
      )}

      <div
        style={{
          marginTop: readOnly ? 0 : 12,
          padding: 12,
          borderRadius: 17,
          border: "1px solid rgba(3,105,161,0.12)",
          background: "rgba(240,249,255,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 950, fontSize: 12.5, color: TEXT }}>
              {readOnly ? "Personal Work Diary Record" : "Personal Work Diary Cycle"}
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>
              {readOnly
                ? "This is a saved reference from your personal work diary."
                : "Used only for your personal summary. This does not change official employer attendance."}
            </div>
          </div>

          <span
            style={{
              flexShrink: 0,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(3,105,161,0.08)",
              color: CONSOLE_BLUE,
              fontSize: 10.5,
              fontWeight: 950,
              whiteSpace: "nowrap",
            }}
          >
            {workDiaryStorage.getCurrentCycleLabel(employmentId)}
          </span>
        </div>

        {!readOnly && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => handleCycleModeChange("calendar_month")}
                style={{
                  padding: "9px 10px",
                  borderRadius: 13,
                  border:
                    cycleSetting.mode === "calendar_month"
                      ? "1.5px solid rgba(3,105,161,0.35)"
                      : "1px solid rgba(148,163,184,0.18)",
                  background:
                    cycleSetting.mode === "calendar_month" ? "rgba(3,105,161,0.08)" : "#ffffff",
                  color: cycleSetting.mode === "calendar_month" ? CONSOLE_BLUE : TEXT,
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Calendar month
              </button>

              <button
                type="button"
                onClick={() => handleCycleModeChange("custom_start_day")}
                style={{
                  padding: "9px 10px",
                  borderRadius: 13,
                  border:
                    cycleSetting.mode === "custom_start_day"
                      ? "1.5px solid rgba(3,105,161,0.35)"
                      : "1px solid rgba(148,163,184,0.18)",
                  background:
                    cycleSetting.mode === "custom_start_day" ? "rgba(3,105,161,0.08)" : "#ffffff",
                  color: cycleSetting.mode === "custom_start_day" ? CONSOLE_BLUE : TEXT,
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Custom start day
              </button>
            </div>

            {cycleSetting.mode === "custom_start_day" && (
              <div style={{ marginTop: 10 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    fontWeight: 850,
                    color: TEXT,
                    marginBottom: 5,
                  }}
                >
                  Cycle starts on day
                </label>

                <select
                  value={cycleSetting.startDay}
                  onChange={(event) => handleStartDayChange(event.target.value)}
                  style={{
                    width: "100%",
                    height: 38,
                    borderRadius: 12,
                    border: "1px solid rgba(3,105,161,0.16)",
                    background: "#ffffff",
                    color: TEXT,
                    fontSize: 13,
                    fontWeight: 850,
                    padding: "0 10px",
                  }}
                >
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "14px 0 12px",
        }}
      >
        <button
          type="button"
          onClick={goBack}
          style={{
            minWidth: 58,
            height: 32,
            border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 900,
            color: TEXT,
          }}
        >
          Previous
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
            color: TEXT,
          }}
        >
          {WD_MONTH_NAMES[viewMonth - 1]} {viewYear}
        </button>

        <button
          type="button"
          onClick={goForward}
          style={{
            minWidth: 58,
            height: 32,
            border: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 900,
            color: TEXT,
          }}
        >
          Next
        </button>
      </div>

      <WorkDiaryCalendarGrid
        weeks={weeks}
        entryMap={entryMap}
        todayKey={todayKey}
        onCellTap={(dateKey) => setSelectedDate(dateKey)}
      />

      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          padding: "8px 0",
          borderTop: "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
        }}
      >
        {WD_STATUS_LIST.map((status) => {
          const cfg = WD_STATUS_CONFIG[status];

          return (
            <div
              key={status}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: MUTED }}
            >
              <span style={{ fontSize: 12 }}>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>
          );
        })}

        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: MUTED }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#2563eb",
              display: "inline-block",
            }}
          />
          <span>Notes</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: MUTED }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#d97706",
              display: "inline-block",
            }}
          />
          <span>Photos</span>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <WorkDiarySummary employmentId={employmentId} year={viewYear} month={viewMonth} />
      </div>

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
            readOnly={readOnly}
            onClose={() => setSelectedDate(null)}
          />
        </CenterModal>
      )}
    </div>
  );
}
