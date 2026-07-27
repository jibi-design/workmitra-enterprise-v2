// App name: Job Mitra
// File name: WorkDiarySection.tsx

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { buildDiaryCalendarGrid } from "../helpers/workDiaryCalendarUtils";
import { WD_MONTH_NAMES } from "../helpers/workDiaryConstants";
import { useWorkDiaryEntries } from "../helpers/workDiaryHooks";
import { workDiaryStorage, type WorkDiaryCycleMode } from "../storage/workDiary.storage";
import { WorkDiaryCalendarGrid } from "./WorkDiaryCalendarGrid";
import { WorkDiaryDayEntry } from "./WorkDiaryDayEntry";
import { WorkDiaryPunchCard } from "./WorkDiaryPunchCard";
import { WorkDiarySummary } from "./WorkDiarySummary";
import { WorkDiaryCyclePanel, WorkDiaryLegend, WorkDiaryMonthNav } from "./WorkDiarySection.parts";
import { HEADER_SUBTITLE_STYLE, HEADER_TITLE_STYLE } from "./WorkDiarySection.styles";

type Props = {
  employmentId: string;
  jobTitle: string;
  companyName: string;
  activeEmployments: EmploymentRecord[];
  readOnly?: boolean;
};

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
        <div style={HEADER_TITLE_STYLE}>{readOnly ? "Work Diary History" : "Work Diary"}</div>
        <div style={HEADER_SUBTITLE_STYLE}>
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

      <div style={{ marginTop: readOnly ? 0 : 12 }}>
        <WorkDiaryCyclePanel
          employmentId={employmentId}
          readOnly={readOnly}
          cycleSetting={cycleSetting}
          onCycleModeChange={handleCycleModeChange}
          onStartDayChange={handleStartDayChange}
        />
      </div>

      <WorkDiaryMonthNav
        viewYear={viewYear}
        viewMonth={viewMonth}
        onBack={goBack}
        onForward={goForward}
        onToday={goToday}
        monthNames={WD_MONTH_NAMES}
      />

      <WorkDiaryCalendarGrid
        weeks={weeks}
        entryMap={entryMap}
        todayKey={todayKey}
        onCellTap={(dateKey) => setSelectedDate(dateKey)}
      />

      <WorkDiaryLegend />

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
