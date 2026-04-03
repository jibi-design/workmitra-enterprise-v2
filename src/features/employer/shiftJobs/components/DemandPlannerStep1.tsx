// src/features/employer/shiftJobs/components/DemandPlannerStep1.tsx
//
// Demand Planner — Step 1: Plan Details.
// Name, company, location, category, experience, date range, working days.

import { DAY_LABELS } from "../storage/demandPlannerStorage";
import type { WorkingDay } from "../storage/demandPlannerStorage";
import type { ExperienceLabel } from "../storage/employerShift.storage";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
export type Step1Data = {
  name: string;
  companyName: string;
  locationName: string;
  category: string;
  experience: ExperienceLabel;
  startDate: string;
  endDate: string;
  workingDays: WorkingDay[];
  description: string;
};

type Props = {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  onNext: () => void;
  errors: string[];
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function DemandPlannerStep1({ data, onChange, onNext, errors }: Props) {
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

  const canNext = data.name.trim().length >= 2 &&
    data.locationName.trim().length >= 2 &&
    data.startDate && data.endDate &&
    data.endDate >= data.startDate &&
    data.workingDays.length > 0;

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-accent-shift)", marginBottom: 16 }}>
        Step 1 of 3 &mdash; Plan Details
      </div>

      {/* Plan Name */}
      <div className="wm-field">
        <div className="wm-label">Plan Name <span style={{ color: "var(--wm-error)" }}>*</span></div>
        <input className="wm-input" value={data.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. April Warehouse Plan" maxLength={80} />
      </div>

      {/* Company */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Company Name</div>
        <input className="wm-input" value={data.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          placeholder="Company name" maxLength={100} />
      </div>

      {/* Location */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Work Location <span style={{ color: "var(--wm-error)" }}>*</span></div>
        <input className="wm-input" value={data.locationName}
          onChange={(e) => set("locationName", e.target.value)}
          placeholder="City / area / address" maxLength={120} />
      </div>

      {/* Category */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Industry / Category</div>
        <select className="wm-input" value={data.category}
          onChange={(e) => set("category", e.target.value)}>
          {["Construction","Kitchen / Restaurant","Catering","Cleaning","Delivery","Driving","Events",
            "Healthcare","Manufacturing","Office","Retail","Security","Warehouse","Agency","Other"
          ].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Experience */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Experience Required</div>
        <select className="wm-input" value={data.experience}
          onChange={(e) => set("experience", e.target.value as ExperienceLabel)}>
          <option value="fresher_ok">No experience needed</option>
          <option value="helper">Some experience helpful</option>
          <option value="experienced">Experienced only</option>
        </select>
      </div>

      {/* Date Range */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <div className="wm-field">
          <div className="wm-label">Start Date <span style={{ color: "var(--wm-error)" }}>*</span></div>
          <input className="wm-input" type="date"
            value={data.startDate} min={today}
            onChange={(e) => set("startDate", e.target.value)} />
        </div>
        <div className="wm-field">
          <div className="wm-label">End Date <span style={{ color: "var(--wm-error)" }}>*</span></div>
          <input className="wm-input" type="date"
            value={data.endDate} min={data.startDate || today}
            onChange={(e) => set("endDate", e.target.value)} />
        </div>
      </div>

      {/* Working Days */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Working Days <span style={{ color: "var(--wm-error)" }}>*</span></div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(DAY_LABELS as readonly string[]).map((label, idx) => {
            const day = idx as WorkingDay;
            const isOn = data.workingDays.includes(day);
            return (
              <button key={day} type="button"
                onClick={() => toggleDay(day)}
                style={{
                  width: 42, height: 42, borderRadius: 10, cursor: "pointer",
                  fontWeight: 700, fontSize: 12,
                  border: isOn ? "2px solid var(--wm-er-accent-shift)" : "1.5px solid var(--wm-er-border)",
                  background: isOn ? "rgba(22,163,74,0.10)" : "var(--wm-er-surface)",
                  color: isOn ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
                  transition: "all 0.15s",
                }}
                aria-pressed={isOn}
              >
                {label}
              </button>
            );
          })}
        </div>
        {data.workingDays.length > 0 && (
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            {data.workingDays.map((d) => DAY_LABELS[d]).join(", ")} selected
          </div>
        )}
      </div>

      {/* Description */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Notes (optional)</div>
        <textarea className="wm-input" value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Any additional information about this plan..."
          maxLength={300} rows={2}
          style={{ paddingTop: 10, fontFamily: "inherit", resize: "vertical" }} />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)" }}>
          {errors.map((e) => <div key={e} style={{ fontSize: 12, color: "var(--wm-error, #dc2626)" }}>&mdash; {e}</div>)}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <button type="button" onClick={onNext} disabled={!canNext}
          style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: canNext ? "var(--wm-er-accent-shift, #16a34a)" : "#d1d5db",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: canNext ? "pointer" : "not-allowed",
          }}>
          Next: Fill Calendar &rarr;
        </button>
      </div>
    </div>
  );
}