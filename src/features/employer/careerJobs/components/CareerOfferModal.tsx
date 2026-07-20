// App name: Job Mitra
// File name: CareerOfferModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerOfferModal.tsx

import { useState } from "react";
import type { CSSProperties } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { CareerOfferInput, CareerSalaryPeriod } from "../types/careerTypes";

type Props = {
  open: boolean;
  jobTitle: string;
  candidateName: string;
  candidateWorkerId: string;
  onClose: () => void;
  onSubmit: (data: CareerOfferInput) => void;
};

const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const CAREER_BORDER = "var(--wm-er-border, rgba(148,163,184,0.22))";
const CAREER_BG = "var(--wm-er-bg, #f8fafc)";
const MAX_OFFER_SALARY = 999_999_999;

const shellStyle: CSSProperties = {
  padding: 18,
  borderRadius: 24,
  background:
    "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.08), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
};

const titleStyle: CSSProperties = {
  fontSize: 17,
  fontWeight: 1000,
  color: CAREER_TEXT,
  lineHeight: 1.15,
};

const helperStyle: CSSProperties = {
  marginTop: 7,
  padding: "9px 10px",
  borderRadius: 15,
  background: "rgba(29,78,216,0.055)",
  border: "1px solid rgba(29,78,216,0.1)",
  color: CAREER_BLUE_DEEP,
  fontSize: 11.5,
  fontWeight: 820,
  lineHeight: 1.42,
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 950,
  color: CAREER_MUTED,
  marginBottom: 6,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.34,
};

const inputStyle: CSSProperties = {
  width: "100%",
  fontSize: 14,
  fontWeight: 800,
  padding: "11px 12px",
  borderRadius: 14,
  border: `1.5px solid ${CAREER_BORDER}`,
  background: CAREER_BG,
  color: CAREER_TEXT,
  boxSizing: "border-box",
  fontFamily: "inherit",
  outline: "none",
};

function getTodayInputValue(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 10);
}

function getDateOnlyMs(value: string): number | null {
  if (!value.trim()) return null;

  const date = new Date(`${value}T00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return date.getTime();
}

function getOfferValidationMessage(
  roleValue: string,
  salaryValue: string,
  startDateValue: string,
  todayValue: string,
): string {
  const role = roleValue.trim();
  const salaryText = salaryValue.trim();
  const salary = Number(salaryText);
  const startDateMs = getDateOnlyMs(startDateValue);
  const todayMs = getDateOnlyMs(todayValue);

  if (role.length < 2) return "Enter a valid job title for this offer.";
  if (!salaryText) return "Enter the offered salary.";
  if (
    !Number.isFinite(salary) ||
    !Number.isInteger(salary) ||
    salary <= 0 ||
    salary > MAX_OFFER_SALARY
  ) {
    return "Salary must be a whole number between 1 and 999,999,999.";
  }
  if (startDateMs === null || todayMs === null) return "Select a valid expected start date.";
  if (startDateMs < todayMs) return "Expected start date cannot be before today.";

  return "";
}

export function CareerOfferModal({
  open,
  jobTitle,
  candidateName,
  candidateWorkerId,
  onClose,
  onSubmit,
}: Props) {
  const [role, setRole] = useState(jobTitle);
  const [salaryStr, setSalary] = useState("");
  const [period, setPeriod] = useState<CareerSalaryPeriod>("monthly");
  const [startDate, setStart] = useState("");
  const [message, setMessage] = useState("");
  const [noticeDays, setNoticeDays] = useState<0 | 7 | 14 | 30>(0);

  const [todayInputValue] = useState(() => getTodayInputValue());

  const salary = Number(salaryStr);
  const validationMessage = getOfferValidationMessage(role, salaryStr, startDate, todayInputValue);
  const canSubmit = validationMessage.length === 0;

  function handleSubmit() {
    if (!canSubmit) return;

    onSubmit({
      jobTitle: role.trim(),
      salary: Math.floor(salary),
      salaryPeriod: period,
      startDate: startDate.trim(),
      noticePeriodDays: noticeDays,
      message: message.trim() || undefined,
    });

    resetAndClose();
  }

  function resetAndClose() {
    setRole(jobTitle);
    setSalary("");
    setPeriod("monthly");
    setStart("");
    setMessage("");
    setNoticeDays(0);
    onClose();
  }

  return (
    <CenterModal open={open} onBackdropClose={() => {}} ariaLabel="Send Job Offer">
      <div style={shellStyle}>
        <div style={titleStyle}>Send Job Offer</div>

        <div style={helperStyle}>
          Save this offer in the local hiring pipeline. No external email, SMS, or phone message is
          sent.
        </div>

        <div
          style={{
            marginTop: 10,
            padding: "12px 13px",
            borderRadius: 18,
            background:
              "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.1), transparent 35%), linear-gradient(135deg, rgba(255,255,255,0.94), rgba(239,246,255,0.78))",
            border: "1px solid rgba(29,78,216,0.16)",
            boxShadow: "0 10px 20px rgba(15,23,42,0.045)",
          }}
        >
          <div
            style={{ fontSize: 10.5, fontWeight: 950, color: CAREER_MUTED, letterSpacing: 0.38 }}
          >
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
              borderRadius: 999,
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

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Job title *</label>
          <input
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Job title for this offer"
            maxLength={100}
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Salary *</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8 }}>
            <input
              type="number"
              value={salaryStr}
              onChange={(event) => setSalary(event.target.value)}
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
                  onClick={() => setPeriod(item)}
                  style={{
                    minHeight: 42,
                    padding: "0 12px",
                    borderRadius: 14,
                    cursor: "pointer",
                    fontSize: 11.5,
                    fontWeight: 950,
                    border: selected
                      ? "1.5px solid rgba(29,78,216,0.36)"
                      : `1.5px solid ${CAREER_BORDER}`,
                    background: selected ? "rgba(29,78,216,0.08)" : "rgba(255,255,255,0.76)",
                    color: selected ? CAREER_BLUE_DEEP : CAREER_MUTED,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item === "monthly" ? "Per month" : "Per year"}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Expected start date *</label>
          <input
            type="date"
            value={startDate}
            min={todayInputValue}
            onChange={(event) => setStart(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Resignation notice period</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {([0, 7, 14, 30] as const).map((days) => {
              const selected = noticeDays === days;

              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => setNoticeDays(days)}
                  style={{
                    minHeight: 38,
                    borderRadius: 14,
                    cursor: "pointer",
                    fontSize: 11.5,
                    fontWeight: 950,
                    border: selected
                      ? "1.5px solid rgba(29,78,216,0.36)"
                      : `1.5px solid ${CAREER_BORDER}`,
                    background: selected ? "rgba(29,78,216,0.08)" : "rgba(255,255,255,0.76)",
                    color: selected ? CAREER_BLUE_DEEP : CAREER_MUTED,
                  }}
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

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Message to candidate optional</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add offer notes or joining details"
            maxLength={300}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", paddingTop: 10 }}
          />

          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              color: CAREER_MUTED,
              marginTop: 4,
              fontWeight: 800,
            }}
          >
            {message.length}/300
          </div>
        </div>

        {!canSubmit && (
          <div style={helperStyle}>
            {validationMessage ||
              "Enter job title, valid salary, and expected start date to enable Send Offer."}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 10, marginTop: 16 }}>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={resetAndClose}
            style={{ fontSize: 13, minHeight: 42, padding: "0 14px", borderRadius: 14 }}
          >
            Cancel
          </button>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              fontSize: 13,
              minHeight: 42,
              padding: "0 16px",
              borderRadius: 14,
              opacity: canSubmit ? 1 : 0.45,
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? undefined : "rgba(148,163,184,0.28)",
              color: canSubmit ? undefined : "rgba(71,85,105,0.72)",
              boxShadow: canSubmit ? undefined : "none",
            }}
          >
            Send Offer
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
