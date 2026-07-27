import type { CareerSalaryPeriod } from "../types/careerTypes";
import {
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  candidateCardStyle,
  getNoticeButtonStyle,
  getToggleButtonStyle,
  inputStyle,
  labelStyle,
  MAX_OFFER_SALARY,
} from "./CareerOfferModal.styles";

type CandidateHeaderProps = {
  candidateName: string;
  candidateWorkerId: string;
};

export function CareerOfferCandidateHeader({
  candidateName,
  candidateWorkerId,
}: CandidateHeaderProps) {
  return (
    <div style={candidateCardStyle}>
      <div style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED, letterSpacing: 0.38 }}>
        OFFER FOR
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 17,
          fontWeight: 1000,
          color: CAREER_TEXT,
          lineHeight: 1.16,
        }}
      >
        {candidateName || "Selected candidate"}
      </div>

      <div
        style={{
          marginTop: 7,
          display: "inline-flex",
          alignItems: "center",
          padding: "5px 9px",
          borderRadius: "var(--wm-radius-pill)",
          background: "rgba(29,78,216,0.08)",
          border: "1px solid rgba(29,78,216,0.12)",
          color: CAREER_BLUE_DEEP,
          fontSize: 11.5,
          fontWeight: 900,
        }}
      >
        Worker ID: {candidateWorkerId || "Not available"}
      </div>
    </div>
  );
}

type SalaryFieldsProps = {
  salaryStr: string;
  period: CareerSalaryPeriod;
  onSalaryChange: (value: string) => void;
  onPeriodChange: (period: CareerSalaryPeriod) => void;
};

export function CareerOfferSalaryFields({
  salaryStr,
  period,
  onSalaryChange,
  onPeriodChange,
}: SalaryFieldsProps) {
  return (
    <div style={{ marginTop: 14 }}>
      <label style={labelStyle}>Salary *</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8 }}>
        <input
          type="number"
          value={salaryStr}
          onChange={(event) => onSalaryChange(event.target.value)}
          placeholder="Amount"
          min={1}
          max={MAX_OFFER_SALARY}
          step={1}
          inputMode="numeric"
          style={inputStyle}
        />

        {(["monthly", "yearly"] as CareerSalaryPeriod[]).map((item) => {
          const selected = period === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPeriodChange(item)}
              style={getToggleButtonStyle(selected)}
            >
              {item === "monthly" ? "Per month" : "Per year"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type NoticePeriodProps = {
  noticeDays: 0 | 7 | 14 | 30;
  onNoticeDaysChange: (days: 0 | 7 | 14 | 30) => void;
};

export function CareerOfferNoticePeriod({ noticeDays, onNoticeDaysChange }: NoticePeriodProps) {
  return (
    <div style={{ marginTop: 14 }}>
      <label style={labelStyle}>Resignation notice period</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {([0, 7, 14, 30] as const).map((days) => {
          const selected = noticeDays === days;

          return (
            <button
              key={days}
              type="button"
              onClick={() => onNoticeDaysChange(days)}
              style={getNoticeButtonStyle(selected)}
            >
              {days === 0 ? "None" : `${days} days`}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 7,
          fontSize: 11.2,
          fontWeight: 780,
          color: CAREER_MUTED,
          lineHeight: 1.4,
        }}
      >
        Expected notice period if this employee resigns after joining.
      </div>
    </div>
  );
}
