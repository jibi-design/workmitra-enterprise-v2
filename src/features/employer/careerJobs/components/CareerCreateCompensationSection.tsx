// App name: Job Mitra
// File name: CareerCreateCompensationSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateCompensationSection.tsx

import type { CSSProperties } from "react";
import type { CareerSalaryPeriod } from "../types/careerTypes";
import type { StepRequirementsData } from "../types/careerCreateStepRequirements.types";
import {
  CareerCreateRequirementSectionHead,
  IconSalary,
} from "./CareerCreateRequirementSectionHead";

type CareerCreateCompensationSectionProps = {
  data: StepRequirementsData;
  onChange: (updates: Partial<StepRequirementsData>) => void;
};

const PREMIUM_CARD_STYLE: CSSProperties = {
  padding: 20,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

const PREMIUM_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: "var(--wm-radius-button)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "rgba(255, 255, 255, 0.8)",
  padding: "0 14px",
  color: "var(--wm-er-text, #0f172a)",
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
  outline: "none",
  transition: "all var(--wm-motion-fast) var(--wm-motion-spring)",
};

const PREMIUM_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-muted, #475569)",
  marginBottom: 6,
  display: "block",
};

export function CareerCreateCompensationSection({
  data,
  onChange,
}: CareerCreateCompensationSectionProps) {
  return (
    <section style={PREMIUM_CARD_STYLE}>
      <CareerCreateRequirementSectionHead
        icon={<IconSalary />}
        title="Compensation"
        sub="Salary range and display period"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={PREMIUM_LABEL_STYLE}>Minimum Salary</label>
          <input
            className="wm-career-input"
            style={PREMIUM_INPUT_STYLE}
            value={data.salaryMin}
            onChange={(event) => onChange({ salaryMin: event.target.value.replace(/\D/g, "") })}
            inputMode="numeric"
            placeholder="e.g. 30000"
            maxLength={10}
          />
        </div>

        <div>
          <label style={PREMIUM_LABEL_STYLE}>Maximum Salary</label>
          <input
            className="wm-career-input"
            style={PREMIUM_INPUT_STYLE}
            value={data.salaryMax}
            onChange={(event) => onChange({ salaryMax: event.target.value.replace(/\D/g, "") })}
            inputMode="numeric"
            placeholder="e.g. 50000"
            maxLength={10}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>Salary Period</label>
        <select
          className="wm-career-input"
          style={PREMIUM_INPUT_STYLE}
          value={data.salaryPeriod}
          onChange={(event) => onChange({ salaryPeriod: event.target.value as CareerSalaryPeriod })}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Annual</option>
        </select>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: "var(--wm-radius-chip)",
          background: "rgba(37, 99, 235, 0.05)",
          border: "1px solid rgba(37, 99, 235, 0.1)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--wm-er-accent-career, #2563eb)",
          lineHeight: 1.45,
        }}
      >
        Applicants will see the salary range exactly as entered here. Leave blank if you prefer "Not
        Disclosed".
      </div>
    </section>
  );
}
