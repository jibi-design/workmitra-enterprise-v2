// App name: Job Mitra
// File name: CareerCreateRequirementsSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateRequirementsSection.tsx

import type { CSSProperties } from "react";
import {
  careerCreateDateInputToEpoch,
  getTodayDateInputValue,
  toCareerCreateDateInputValue,
} from "../helpers/careerCreateStepRequirements.helpers";
import type {
  CareerNoticePeriodValue,
  StepRequirementsData,
} from "../types/careerCreateStepRequirements.types";
import {
  CareerCreateRequirementSectionHead,
  IconRequirements,
} from "./CareerCreateRequirementSectionHead";

type CareerCreateRequirementsSectionProps = {
  data: StepRequirementsData;
  qualificationCount: number;
  skillCount: number;
  onChange: (updates: Partial<StepRequirementsData>) => void;
};

const PREMIUM_CARD_STYLE: CSSProperties = {
  marginTop: 16,
  padding: 20,
  borderRadius: 24,
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

const PREMIUM_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "rgba(255, 255, 255, 0.8)",
  padding: "0 14px",
  color: "var(--wm-er-text, #0f172a)",
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
  outline: "none",
  transition: "all var(--wm-motion-fast) var(--wm-motion-spring)",
  fontFamily: "inherit",
};

const PREMIUM_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-muted, #475569)",
  marginBottom: 6,
  display: "block",
};

export function CareerCreateRequirementsSection({
  data,
  qualificationCount,
  skillCount,
  onChange,
}: CareerCreateRequirementsSectionProps) {
  return (
    <section style={PREMIUM_CARD_STYLE}>
      <CareerCreateRequirementSectionHead
        icon={<IconRequirements />}
        title="Requirements & Employment Terms"
        sub="Experience, notice period, qualifications, and skills needed"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={PREMIUM_LABEL_STYLE}>
            Min Experience (years) <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            style={PREMIUM_INPUT_STYLE}
            value={data.experienceMin}
            onChange={(event) => onChange({ experienceMin: event.target.value.replace(/\D/g, "") })}
            inputMode="numeric"
            placeholder="e.g. 0"
            maxLength={2}
          />
        </div>

        <div>
          <label style={PREMIUM_LABEL_STYLE}>Max Experience (years)</label>
          <input
            style={PREMIUM_INPUT_STYLE}
            value={data.experienceMax}
            onChange={(event) => onChange({ experienceMax: event.target.value.replace(/\D/g, "") })}
            inputMode="numeric"
            placeholder="e.g. 5"
            maxLength={2}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>Notice Period After Resignation</label>
        <select
          style={PREMIUM_INPUT_STYLE}
          value={data.noticePeriodDays}
          onChange={(event) =>
            onChange({
              noticePeriodDays: event.target.value as CareerNoticePeriodValue,
              noticePeriodCustomDays:
                event.target.value === "custom" ? data.noticePeriodCustomDays : "",
            })
          }
        >
          <option value="0">No notice period</option>
          <option value="7">7 days</option>
          <option value="15">15 days</option>
          <option value="30">30 days</option>
          <option value="45">45 days</option>
          <option value="60">60 days</option>
          <option value="custom">Custom</option>
        </select>

        {data.noticePeriodDays === "custom" && (
          <input
            style={{ ...PREMIUM_INPUT_STYLE, marginTop: 10 }}
            value={data.noticePeriodCustomDays}
            onChange={(event) =>
              onChange({ noticePeriodCustomDays: event.target.value.replace(/\D/g, "") })
            }
            inputMode="numeric"
            placeholder="Enter custom days"
            maxLength={3}
          />
        )}

        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "var(--wm-er-muted, #475569)",
            fontWeight: 500,
          }}
        >
          This tells employees how much notice is expected after resignation.
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>Qualifications (one per line)</label>
        <textarea
          style={{
            ...PREMIUM_INPUT_STYLE,
            minHeight: 120,
            padding: "12px 14px",
            resize: "vertical",
            overflowY: "auto",
          }}
          value={data.qualifications}
          onChange={(event) => onChange({ qualifications: event.target.value })}
          placeholder={"e.g.\nBachelor's Degree\nRelevant certification"}
          maxLength={1000}
        />
        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "var(--wm-er-muted, #475569)",
            fontWeight: 600,
          }}
        >
          {qualificationCount} {qualificationCount === 1 ? "item" : "items"} (max 15)
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>Skills Required (one per line)</label>
        <textarea
          style={{
            ...PREMIUM_INPUT_STYLE,
            minHeight: 120,
            padding: "12px 14px",
            resize: "vertical",
            overflowY: "auto",
          }}
          value={data.skills}
          onChange={(event) => onChange({ skills: event.target.value })}
          placeholder={"e.g.\nExcel\nProject Management\nCommunication"}
          maxLength={1500}
        />
        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "var(--wm-er-muted, #475569)",
            fontWeight: 600,
          }}
        >
          {skillCount} {skillCount === 1 ? "item" : "items"} (max 20)
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>Application Deadline</label>
        <input
          style={PREMIUM_INPUT_STYLE}
          type="date"
          value={toCareerCreateDateInputValue(data.closingDate)}
          min={getTodayDateInputValue()}
          onChange={(event) =>
            onChange({ closingDate: careerCreateDateInputToEpoch(event.target.value) })
          }
        />
        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "var(--wm-er-muted, #475569)",
            fontWeight: 500,
          }}
        >
          Applications will not be accepted after this date.
        </div>
      </div>
    </section>
  );
}
