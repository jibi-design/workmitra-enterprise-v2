// Job Mitra | DemandPlannerStep2Calendar.tsx | Wizard step 2 — Calendar

import { DAY_LABELS } from "../../storage/demandPlannerStorage";
import type { WorkingDay } from "../../storage/demandPlannerStorage";
import type { Step1Data } from "./DemandPlannerStep1.types";

type Props = {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
  errors: string[];
  hideActions?: boolean;
};

export function DemandPlannerStep2Calendar({
  data,
  onChange,
  onNext,
  onBack,
  errors,
  hideActions = false,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  function set<K extends keyof Step1Data>(key: K, val: Step1Data[K]) {
    onChange({ ...data, [key]: val });
  }

  function toggleDay(day: WorkingDay) {
    const has = data.workingDays.includes(day);
    const next = has
      ? data.workingDays.filter((d) => d !== day)
      : [...data.workingDays, day].sort();
    set("workingDays", next as WorkingDay[]);
  }

  const canNext =
    Boolean(data.startDate) &&
    Boolean(data.endDate) &&
    data.endDate >= data.startDate &&
    data.workingDays.length > 0;

  return (
    <div>
      {!hideActions && <div className="wm-planner-stepTitle">Step 2 of 3 — Calendar</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="wm-field">
          <div className="wm-label">Start Date *</div>
          <input
            className="wm-input"
            type="date"
            value={data.startDate}
            min={today}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </div>
        <div className="wm-field">
          <div className="wm-label">End Date *</div>
          <input
            className="wm-input"
            type="date"
            value={data.endDate}
            min={data.startDate || today}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Working Days *</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(DAY_LABELS as readonly string[]).map((label, idx) => {
            const day = idx as WorkingDay;
            const isOn = data.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className="wm-planner-calendarDay"
                data-selected={isOn ? "true" : "false"}
                aria-pressed={isOn}
                style={{ width: 42, height: 42, cursor: "pointer" }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-error, #dc2626)" }}>
          {errors.map((e) => (
            <div key={e}>— {e}</div>
          ))}
        </div>
      )}

      {!hideActions && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button type="button" className="wm-planner-btnGhost" onClick={onBack}>
            ← Back
          </button>
          <button
            type="button"
            className="wm-planner-btnPrimary"
            disabled={!canNext}
            onClick={onNext}
          >
            Next: Demand Matrix →
          </button>
        </div>
      )}
    </div>
  );
}
