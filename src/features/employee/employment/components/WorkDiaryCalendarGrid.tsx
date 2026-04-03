// src/features/employee/employment/components/WorkDiaryCalendarGrid.tsx
//
// Monthly calendar grid for Work Diary.
// Root Map markers: ✅ Worked, 🔴 Leave/Off, ⬜ Off, 📷 photos, 📝 notes.

import type { WorkDiaryEntry } from "../helpers/workDiary.types";
import type { DiaryCalendarDay } from "../helpers/workDiaryCalendarUtils";
import { WD_DAY_NAMES, WD_STATUS_CONFIG } from "../helpers/workDiaryConstants";

type Props = {
  weeks: DiaryCalendarDay[][];
  entryMap: Map<string, WorkDiaryEntry>;
  todayKey: string;
  onCellTap: (dateKey: string) => void;
};

function CalendarCell({
  day, entry, isToday, onTap,
}: {
  day: DiaryCalendarDay;
  entry?: WorkDiaryEntry;
  isToday: boolean;
  onTap: () => void;
}) {
  const cfg = entry ? WD_STATUS_CONFIG[entry.status] : null;
  const hasNotes = !!(entry?.notes);
  const hasPhotos = !!(entry && entry.photoCount > 0);

  return (
    <button
      type="button"
      onClick={day.isCurrentMonth ? onTap : undefined}
      disabled={!day.isCurrentMonth}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1",
        border: isToday
          ? "2px solid var(--wm-emp-accent, #2563eb)"
          : "1px solid var(--wm-emp-border, var(--wm-er-border, #e5e7eb))",
        borderRadius: 8,
        background: !day.isCurrentMonth ? "#fafafa" : cfg ? cfg.bg : "#fff",
        cursor: day.isCurrentMonth ? "pointer" : "default",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        opacity: day.isCurrentMonth ? 1 : 0.35,
      }}
    >
      <span style={{
        fontSize: 12,
        fontWeight: isToday ? 900 : 600,
        color: day.isCurrentMonth ? "var(--wm-emp-text, var(--wm-er-text))" : "var(--wm-emp-muted, var(--wm-er-muted))",
      }}>
        {day.dayNum}
      </span>
      {cfg && <span style={{ fontSize: 10 }}>{cfg.icon}</span>}
      {/* Indicator dots for notes/photos */}
      {(hasNotes || hasPhotos) && (
        <div style={{ position: "absolute", top: 2, right: 2, display: "flex", gap: 1 }}>
          {hasNotes && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#2563eb" }} />}
          {hasPhotos && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#d97706" }} />}
        </div>
      )}
    </button>
  );
}

export function WorkDiaryCalendarGrid({ weeks, entryMap, todayKey, onCellTap }: Props) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {WD_DAY_NAMES.map((name) => (
          <div key={name} style={{
            textAlign: "center", fontSize: 10, fontWeight: 800,
            color: "var(--wm-emp-muted, var(--wm-er-muted))",
            textTransform: "uppercase", letterSpacing: 0.5, padding: "4px 0",
          }}>
            {name}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {week.map((day) => (
              <CalendarCell
                key={day.dateKey}
                day={day}
                entry={entryMap.get(day.dateKey)}
                isToday={day.dateKey === todayKey}
                onTap={() => onCellTap(day.dateKey)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}