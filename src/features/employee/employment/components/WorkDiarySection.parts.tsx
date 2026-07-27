import { WD_STATUS_CONFIG, WD_STATUS_LIST } from "../helpers/workDiaryConstants";
import { workDiaryStorage, type WorkDiaryCycleMode } from "../storage/workDiary.storage";
import {
  CONSOLE_BLUE,
  CYCLE_BADGE_STYLE,
  CYCLE_PANEL_STYLE,
  getCycleToggleStyle,
  LEGEND_ROW_STYLE,
  MUTED,
  MONTH_BUTTON_STYLE,
  NAV_BUTTON_STYLE,
  START_DAY_SELECT_STYLE,
  TEXT,
} from "./WorkDiarySection.styles";

type CycleSetting = ReturnType<typeof workDiaryStorage.getCycleSetting>;

type WorkDiaryCyclePanelProps = {
  employmentId: string;
  readOnly: boolean;
  cycleSetting: CycleSetting;
  onCycleModeChange: (mode: WorkDiaryCycleMode) => void;
  onStartDayChange: (value: string) => void;
};

export function WorkDiaryCyclePanel({
  employmentId,
  readOnly,
  cycleSetting,
  onCycleModeChange,
  onStartDayChange,
}: WorkDiaryCyclePanelProps) {
  return (
    <div style={CYCLE_PANEL_STYLE}>
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

        <span style={CYCLE_BADGE_STYLE}>{workDiaryStorage.getCurrentCycleLabel(employmentId)}</span>
      </div>

      {!readOnly && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => onCycleModeChange("calendar_month")}
              style={getCycleToggleStyle(cycleSetting.mode === "calendar_month")}
            >
              Calendar month
            </button>

            <button
              type="button"
              onClick={() => onCycleModeChange("custom_start_day")}
              style={getCycleToggleStyle(cycleSetting.mode === "custom_start_day")}
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
                onChange={(event) => onStartDayChange(event.target.value)}
                style={START_DAY_SELECT_STYLE}
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
  );
}

type WorkDiaryMonthNavProps = {
  viewYear: number;
  viewMonth: number;
  onBack: () => void;
  onForward: () => void;
  onToday: () => void;
  monthNames: readonly string[];
};

export function WorkDiaryMonthNav({
  viewYear,
  viewMonth,
  onBack,
  onForward,
  onToday,
  monthNames,
}: WorkDiaryMonthNavProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "14px 0 12px",
      }}
    >
      <button type="button" onClick={onBack} style={NAV_BUTTON_STYLE}>
        Previous
      </button>

      <button type="button" onClick={onToday} style={MONTH_BUTTON_STYLE}>
        {monthNames[viewMonth - 1]} {viewYear}
      </button>

      <button type="button" onClick={onForward} style={NAV_BUTTON_STYLE}>
        Next
      </button>
    </div>
  );
}

export function WorkDiaryLegend() {
  return (
    <div style={LEGEND_ROW_STYLE}>
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
  );
}

export { CONSOLE_BLUE, TEXT, MUTED };
