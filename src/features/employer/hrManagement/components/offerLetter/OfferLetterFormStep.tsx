// App: Job Mitra / WorkMitra_Enterprise_v2
// File: OfferLetterFormStep.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\offerLetter\OfferLetterFormStep.tsx

import type { CSSProperties } from "react";
import type { HRCandidateRecord } from "../../types/hrManagement.types";

export type OfferLetterSalaryFrequency = "monthly" | "weekly" | "hourly" | "annual";

type FrequencyOption = {
  value: OfferLetterSalaryFrequency;
  label: string;
};

type Props = {
  record: HRCandidateRecord;
  salaryAmount: string;
  salaryFrequency: OfferLetterSalaryFrequency;
  joiningDateStr: string;
  workSchedule: string;
  additionalTerms: string;
  frequencyOptions: FrequencyOption[];
  isValid: boolean;
  onSalaryAmountChange: (value: string) => void;
  onSalaryFrequencyChange: (value: OfferLetterSalaryFrequency) => void;
  onJoiningDateChange: (value: string) => void;
  onWorkScheduleChange: (value: string) => void;
  onAdditionalTermsChange: (value: string) => void;
  onCancel: () => void;
  onPreview: () => void;
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  marginBottom: 4,
  display: "block",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const hintStyle: CSSProperties = {
  fontSize: 11,
  color: "var(--wm-er-muted)",
  marginTop: 3,
};

export function OfferLetterFormStep({
  record,
  salaryAmount,
  salaryFrequency,
  joiningDateStr,
  workSchedule,
  additionalTerms,
  frequencyOptions,
  isValid,
  onSalaryAmountChange,
  onSalaryFrequencyChange,
  onJoiningDateChange,
  onWorkScheduleChange,
  onAdditionalTermsChange,
  onCancel,
  onPreview,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          background: "rgba(124, 58, 237, 0.04)",
          border: "1px solid rgba(124, 58, 237, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--wm-er-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Candidate
        </div>

        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginTop: 2 }}>
          {record.employeeName}
        </div>

        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
          {record.jobTitle}
          {record.department ? ` · ${record.department}` : ""}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Salary Amount *</label>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            inputMode="numeric"
            value={salaryAmount}
            onChange={(event) => onSalaryAmountChange(event.target.value)}
            placeholder="e.g. 3500"
            style={{ ...inputStyle, flex: 1 }}
          />

          <select
            value={salaryFrequency}
            onChange={(event) =>
              onSalaryFrequencyChange(event.target.value as OfferLetterSalaryFrequency)
            }
            style={{ ...inputStyle, flex: "0 0 120px" }}
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={hintStyle}>
          Enter the amount without currency symbol. The candidate will see this value.
        </div>
      </div>

      <div>
        <label style={labelStyle}>Joining Date *</label>

        <input
          type="date"
          value={joiningDateStr}
          onChange={(event) => onJoiningDateChange(event.target.value)}
          style={inputStyle}
        />

        <div style={hintStyle}>When should the candidate start working?</div>
      </div>

      <div>
        <label style={labelStyle}>Work Schedule</label>

        <input
          type="text"
          value={workSchedule}
          onChange={(event) => onWorkScheduleChange(event.target.value)}
          placeholder="e.g. Monday to Friday, 9:00 AM - 5:00 PM"
          style={inputStyle}
        />

        <div style={hintStyle}>Describe the expected working hours and days.</div>
      </div>

      <div>
        <label style={labelStyle}>Additional Terms (optional)</label>

        <textarea
          value={additionalTerms}
          onChange={(event) => onAdditionalTermsChange(event.target.value)}
          placeholder="e.g. 30-day probation period, health benefits after 3 months..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <div style={hintStyle}>Any extra conditions or benefits to include in the offer.</div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <button className="wm-outlineBtn" type="button" onClick={onCancel}>
          Cancel
        </button>

        <button
          className="wm-primarybtn"
          type="button"
          disabled={!isValid}
          onClick={onPreview}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          Preview Offer
        </button>
      </div>
    </div>
  );
}
