// App name: Job Mitra
// File name: CareerCreateDescriptionSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCreateDescriptionSection.tsx

import type { CSSProperties } from "react";
import type { StepRequirementsData } from "../types/careerCreateStepRequirements.types";
import {
  CareerCreateRequirementSectionHead,
  IconDescription,
} from "./CareerCreateRequirementSectionHead";

type CareerCreateDescriptionSectionProps = {
  data: StepRequirementsData;
  responsibilityCount: number;
  onChange: (updates: Partial<StepRequirementsData>) => void;
};

const PREMIUM_CARD_STYLE: CSSProperties = {
  marginTop: 16,
  padding: 20,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};

const PREMIUM_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 110,
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "rgba(255, 255, 255, 0.8)",
  padding: "12px 14px",
  color: "var(--wm-er-text, #0f172a)",
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
  outline: "none",
  transition: "all var(--wm-motion-fast) var(--wm-motion-spring)",
  fontFamily: "inherit",
  resize: "vertical",
};

const PREMIUM_LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-muted, #475569)",
  marginBottom: 6,
  display: "block",
};

export function CareerCreateDescriptionSection({
  data,
  responsibilityCount,
  onChange,
}: CareerCreateDescriptionSectionProps) {
  const descCharCount = data.description.length;

  return (
    <section style={PREMIUM_CARD_STYLE}>
      <CareerCreateRequirementSectionHead
        icon={<IconDescription />}
        title="Job Description"
        sub="Describe the role and key responsibilities"
      />

      <div>
        <label style={PREMIUM_LABEL_STYLE}>Description</label>
        <textarea
          style={PREMIUM_INPUT_STYLE}
          value={data.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Describe the role, team, day-to-day work, growth opportunities..."
          maxLength={2000}
        />

        <div
          style={{
            textAlign: "right",
            fontSize: 11.5,
            fontWeight: 700,
            marginTop: 6,
            color: descCharCount > 1800 ? "#dc2626" : "var(--wm-er-muted, #475569)",
          }}
        >
          {descCharCount}/2000
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={PREMIUM_LABEL_STYLE}>Key Responsibilities (one per line)</label>
        <textarea
          style={PREMIUM_INPUT_STYLE}
          value={data.responsibilities}
          onChange={(event) => onChange({ responsibilities: event.target.value })}
          placeholder={
            "e.g.\nManage daily reports\nCoordinate with team leads\nPrepare monthly presentations"
          }
          maxLength={2000}
        />

        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "var(--wm-er-muted, #475569)",
            fontWeight: 600,
          }}
        >
          {responsibilityCount} {responsibilityCount === 1 ? "item" : "items"} (max 15)
        </div>
      </div>
    </section>
  );
}
