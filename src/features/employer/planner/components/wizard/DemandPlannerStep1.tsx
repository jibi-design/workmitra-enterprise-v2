// Job Mitra | DemandPlannerStep1.tsx | Step 1 — Role & Team

import type { ExperienceLabel } from "../../storage/demandPlannerStorage";
import type { Step1Data } from "./DemandPlannerStep1.types";

export type { Step1Data } from "./DemandPlannerStep1.types";

type Props = {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  onNext: () => void;
  errors: string[];
};

export function DemandPlannerStep1({ data, onChange, onNext, errors }: Props) {
  function set<K extends keyof Step1Data>(key: K, val: Step1Data[K]) {
    onChange({ ...data, [key]: val });
  }

  const canNext = data.name.trim().length >= 2 && data.defaultWorkers > 0;

  return (
    <div>
      <div className="wm-planner-stepTitle">Step 1 of 3 — Role &amp; Team</div>

      <div className="wm-field">
        <div className="wm-label">Plan Title *</div>
        <input
          className="wm-input"
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Crew plan July"
          maxLength={80}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Company Name</div>
        <input
          className="wm-input"
          value={data.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          placeholder="Company name"
          maxLength={100}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Industry / Category</div>
        <select
          className="wm-input"
          value={data.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {[
            "Construction",
            "Kitchen / Restaurant",
            "Catering",
            "Cleaning",
            "Delivery",
            "Driving",
            "Events",
            "Healthcare",
            "Manufacturing",
            "Office",
            "Retail",
            "Security",
            "Warehouse",
            "Agency",
            "Other",
          ].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <div className="wm-field">
          <div className="wm-label">Workers per day (default) *</div>
          <input
            className="wm-input"
            type="number"
            min={1}
            max={99}
            value={data.defaultWorkers}
            onChange={(e) => set("defaultWorkers", Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div className="wm-field">
          <div className="wm-label">Backup candidates</div>
          <input
            className="wm-input"
            type="number"
            min={0}
            max={10}
            value={data.waitingBuffer}
            onChange={(e) => set("waitingBuffer", Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Experience Required</div>
        <select
          className="wm-input"
          value={data.experience}
          onChange={(e) => set("experience", e.target.value as ExperienceLabel)}
        >
          <option value="fresher_ok">No experience needed</option>
          <option value="helper">Some experience helpful</option>
          <option value="experienced">Experienced only</option>
        </select>
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Description</div>
        <textarea
          className="wm-input"
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What should workers know about this project?"
          maxLength={300}
          rows={2}
          style={{ paddingTop: 10, fontFamily: "inherit", resize: "vertical" }}
        />
      </div>

      {errors.length > 0 && (
        <div className="wm-planner-errorBox">
          {errors.map((e) => (
            <div key={e}>— {e}</div>
          ))}
        </div>
      )}

      <div className="wm-planner-stepActions">
        <button
          type="button"
          className="wm-planner-btnPrimary"
          onClick={onNext}
          disabled={!canNext}
        >
          Next: Schedule &amp; Pay →
        </button>
      </div>
    </div>
  );
}
