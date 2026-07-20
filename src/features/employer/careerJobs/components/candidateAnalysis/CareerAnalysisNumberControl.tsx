// App name: Job Mitra
// File name: CareerAnalysisNumberControl.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateAnalysis\CareerAnalysisNumberControl.tsx

import { useEffect, useState } from "react";
import { CAREER_ANALYSIS_MUTED, CAREER_ANALYSIS_TEXT } from "./careerAnalysisTheme";

type CareerAnalysisNumberControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  helper: string;
  onChange: (value: number) => void;
};

export function CareerAnalysisNumberControl({
  label,
  value,
  min,
  max,
  helper,
  onChange,
}: CareerAnalysisNumberControlProps) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  function commitValue(rawValue: string) {
    const trimmedValue = rawValue.trim();

    if (!trimmedValue) {
      setDraftValue(String(value));
      return;
    }

    const parsedValue = Number(trimmedValue);

    if (!Number.isFinite(parsedValue)) {
      setDraftValue(String(value));
      return;
    }

    const roundedValue = Math.floor(parsedValue);
    const clampedValue = Math.max(min, Math.min(max, roundedValue));

    setDraftValue(String(clampedValue));
    onChange(clampedValue);
  }

  return (
    <label
      style={{
        display: "grid",
        gap: 5,
        padding: "8px 9px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.84)",
        border: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <span
        style={{
          fontSize: 9.3,
          fontWeight: 950,
          color: CAREER_ANALYSIS_MUTED,
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </span>

      <input
        type="text"
        inputMode="numeric"
        value={draftValue}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/[^\d]/g, "");
          setDraftValue(nextValue);
        }}
        onBlur={(event) => commitValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitValue(event.currentTarget.value);
            event.currentTarget.blur();
          }
        }}
        style={{
          width: "100%",
          minHeight: 34,
          borderRadius: 11,
          border: "1px solid rgba(148,163,184,0.22)",
          padding: "0 9px",
          fontSize: 13,
          fontWeight: 900,
          color: CAREER_ANALYSIS_TEXT,
          background: "rgba(255,255,255,0.94)",
        }}
      />

      <span
        style={{ fontSize: 9.8, fontWeight: 760, color: CAREER_ANALYSIS_MUTED, lineHeight: 1.25 }}
      >
        {helper}
      </span>
    </label>
  );
}
