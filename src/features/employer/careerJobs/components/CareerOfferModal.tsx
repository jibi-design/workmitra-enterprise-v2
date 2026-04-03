// src/features/employer/careerJobs/components/CareerOfferModal.tsx
//
// Modal for sending a basic job offer to a candidate.
// Fields: Job Title (pre-filled), Salary, Salary Period, Start Date, Message.
// Career domain: Royal Blue --wm-er-accent-career.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { CareerOfferInput, CareerSalaryPeriod } from "../types/careerTypes";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  open: boolean;
  jobTitle: string;
  onClose: () => void;
  onSubmit: (data: CareerOfferInput) => void;
};

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700,
  color: "var(--wm-er-text)", marginBottom: 4, display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%", fontSize: 14, fontWeight: 600,
  padding: "10px 12px", borderRadius: 10,
  border: "1.5px solid var(--wm-er-border)",
  background: "var(--wm-er-bg)", color: "var(--wm-er-text)",
  boxSizing: "border-box", fontFamily: "inherit",
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function CareerOfferModal({ open, jobTitle, onClose, onSubmit }: Props) {
  const [role, setRole]         = useState(jobTitle);
  const [salaryStr, setSalary]  = useState("");
  const [period, setPeriod]     = useState<CareerSalaryPeriod>("monthly");
  const [startDate, setStart]   = useState("");
 const [message, setMessage]   = useState("");
  const [noticeDays, setNoticeDays] = useState<0 | 7 | 14 | 30>(0);

  const salary = Number(salaryStr) || 0;
  const canSubmit = role.trim().length > 0 && salary > 0 && startDate.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
   onSubmit({
      jobTitle:     role.trim(),
      salary,
      salaryPeriod: period,
      startDate:    startDate.trim(),
      noticePeriodDays: noticeDays,
      message:      message.trim() || undefined,
    });
    resetAndClose();
  }

  function resetAndClose() {
    setRole(jobTitle);
    setSalary("");
    setPeriod("monthly");
    setStart("");
    setMessage("");
    onClose();
  }

  return (
    <CenterModal open={open} onBackdropClose={resetAndClose} ariaLabel="Send Job Offer">
      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-accent-career)", marginBottom: 4 }}>
          Send Job Offer
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 16 }}>
          The candidate will receive this offer and can accept or decline.
        </div>

        {/* Job Title */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Job Title *</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Job title for this offer"
            maxLength={100}
            style={inputStyle}
          />
        </div>

        {/* Salary */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Salary *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              value={salaryStr}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Amount"
              min={0}
              style={{ ...inputStyle, flex: 1 }}
            />
            {/* Period toggle */}
            {(["monthly", "yearly"] as CareerSalaryPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                style={{
                  padding: "0 14px", borderRadius: 10, cursor: "pointer",
                  fontSize: 12, fontWeight: period === p ? 700 : 600,
                  border: period === p
                    ? "1.5px solid var(--wm-er-accent-career)"
                    : "1.5px solid var(--wm-er-border)",
                  background: period === p ? "var(--wm-er-career-wash)" : "var(--wm-er-bg)",
                  color: period === p ? "var(--wm-er-accent-career)" : "var(--wm-er-muted)",
                  transition: "all 0.15s", whiteSpace: "nowrap",
                }}
              >
                {p === "monthly" ? "Per month" : "Per year"}
              </button>
            ))}
          </div>
        </div>

        {/* Start Date */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Expected Start Date *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Notice Period */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Notice period</label>
          <div style={{ display: "flex", gap: 8 }}>
            {([0, 7, 14, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setNoticeDays(d)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                  fontSize: 12, fontWeight: noticeDays === d ? 700 : 600,
                  border: noticeDays === d
                    ? "1.5px solid var(--wm-er-accent-career)"
                    : "1.5px solid var(--wm-er-border)",
                  background: noticeDays === d ? "var(--wm-er-career-wash)" : "var(--wm-er-bg)",
                  color: noticeDays === d ? "var(--wm-er-accent-career)" : "var(--wm-er-muted)",
                  transition: "all 0.15s",
                }}
              >
                {d === 0 ? "None" : `${d} days`}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
            Employee must serve this notice period if they resign.
          </div>
        </div>

        {/* Optional Message */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Message to Candidate (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal note or any additional details..."
            maxLength={300}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", paddingTop: 10 }}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
            {message.length}/300
          </div>
        </div>

        {/* Validation hint */}
        {!canSubmit && (salaryStr.length > 0 || startDate.length > 0) && (
          <div style={{
            marginBottom: 12, padding: "8px 12px", borderRadius: 8,
            background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)",
            fontSize: 11, color: "var(--wm-error, #dc2626)",
          }}>
            {salary <= 0 ? "Please enter a valid salary amount." : ""}
            {startDate.trim().length === 0 ? " Please select a start date." : ""}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={resetAndClose}
            style={{ fontSize: 13, height: 38, padding: "0 16px" }}
          >
            Cancel
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ fontSize: 13, padding: "8px 20px", opacity: canSubmit ? 1 : 0.5 }}
          >
            Send Offer
          </button>
        </div>
      </div>
    </CenterModal>
  );
}