// src/features/employer/hrManagement/components/OfferLetterModal.tsx
//
// 2-step modal: Step 1 = Fill offer details, Step 2 = Preview & confirm.
// Template-based — employer fills a simple form, app generates preview.
// No currency symbols (global release rule).

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { HRCandidateRecord } from "../types/hrManagement.types";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
  onSend: (data: {
    salaryAmount: string;
    salaryFrequency: "monthly" | "weekly" | "hourly" | "annual";
    joiningDate: number;
    workSchedule: string;
    additionalTerms: string;
  }) => void;
};

type SalaryFrequency = "monthly" | "weekly" | "hourly" | "annual";

const FREQUENCY_OPTIONS: { value: SalaryFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "hourly", label: "Hourly" },
  { value: "annual", label: "Annual" },
];

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  marginBottom: 4,
  display: "block",
};

const inputStyle: React.CSSProperties = {
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

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--wm-er-muted)",
  marginTop: 3,
};

function formatDateForInput(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OfferLetterModal({ open, onClose, record, onSend }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  /* Form state */
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryFrequency, setSalaryFrequency] = useState<SalaryFrequency>("monthly");
  const [joiningDateStr, setJoiningDateStr] = useState(() => {
    const future = Date.now() + 7 * 86400000;
    return formatDateForInput(future);
  });
  const [workSchedule, setWorkSchedule] = useState("Monday to Friday, 9:00 AM - 5:00 PM");
  const [additionalTerms, setAdditionalTerms] = useState("");

  const joiningDateTs = new Date(joiningDateStr + "T00:00:00").getTime();
  const isValid = salaryAmount.trim().length > 0 && joiningDateStr.length > 0;

  const handleSend = () => {
    onSend({
      salaryAmount: salaryAmount.trim(),
      salaryFrequency,
      joiningDate: joiningDateTs,
      workSchedule: workSchedule.trim(),
      additionalTerms: additionalTerms.trim(),
    });
  };

  /* Reset on close */
  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Send Offer Letter" maxWidth={480}>
      <div style={{ padding: 20 }}>
        {/* Modal Header */}
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
          {step === 1 ? "Prepare Offer Letter" : "Review & Send"}
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
          {step === 1
            ? "Fill in the offer details. The candidate will receive this in-app."
            : "Review the offer letter before sending. This cannot be changed after sending."}
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: "var(--wm-er-accent-hr)",
            }}
          />
          <div
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: step === 2 ? "var(--wm-er-accent-hr)" : "var(--wm-er-border, #e5e7eb)",
            }}
          />
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Pre-filled info */}
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: "rgba(124, 58, 237, 0.04)",
                border: "1px solid rgba(124, 58, 237, 0.1)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Candidate
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-er-text)", marginTop: 2 }}>
                {record.employeeName}
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
                {record.jobTitle}{record.department ? ` · ${record.department}` : ""}
              </div>
            </div>

            {/* Salary */}
            <div>
              <label style={labelStyle}>Salary Amount *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  placeholder="e.g. 3500"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <select
                  value={salaryFrequency}
                  onChange={(e) => setSalaryFrequency(e.target.value as SalaryFrequency)}
                  style={{ ...inputStyle, flex: "0 0 120px" }}
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={hintStyle}>Enter the amount without currency symbol. The candidate will see this value.</div>
            </div>

            {/* Joining Date */}
            <div>
              <label style={labelStyle}>Joining Date *</label>
              <input
                type="date"
                value={joiningDateStr}
                onChange={(e) => setJoiningDateStr(e.target.value)}
                style={inputStyle}
              />
              <div style={hintStyle}>When should the candidate start working?</div>
            </div>

            {/* Work Schedule */}
            <div>
              <label style={labelStyle}>Work Schedule</label>
              <input
                type="text"
                value={workSchedule}
                onChange={(e) => setWorkSchedule(e.target.value)}
                placeholder="e.g. Monday to Friday, 9:00 AM - 5:00 PM"
                style={inputStyle}
              />
              <div style={hintStyle}>Describe the expected working hours and days.</div>
            </div>

            {/* Additional Terms */}
            <div>
              <label style={labelStyle}>Additional Terms (optional)</label>
              <textarea
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                placeholder="e.g. 30-day probation period, health benefits after 3 months..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <div style={hintStyle}>Any extra conditions or benefits to include in the offer.</div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button className="wm-outlineBtn" type="button" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="wm-primarybtn"
                type="button"
                disabled={!isValid}
                onClick={() => setStep(2)}
                style={{ opacity: isValid ? 1 : 0.5 }}
              >
                Preview Offer →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            {/* Preview Card */}
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: "2px solid var(--wm-er-accent-hr)",
                background: "#fff",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "var(--wm-er-accent-hr)", textTransform: "uppercase", letterSpacing: 1 }}>
                  Offer Letter
                </div>
              </div>

              <div style={{ fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.8 }}>
                <div><strong>To:</strong> {record.employeeName}</div>
                <div><strong>Position:</strong> {record.jobTitle}</div>
                {record.department && <div><strong>Department:</strong> {record.department}</div>}
                {record.location && <div><strong>Location:</strong> {record.location}</div>}
                <div style={{ marginTop: 10 }}><strong>Salary:</strong> {salaryAmount} ({salaryFrequency})</div>
                <div><strong>Joining Date:</strong> {formatDateDisplay(joiningDateTs)}</div>
                <div><strong>Work Schedule:</strong> {workSchedule || "—"}</div>
                {additionalTerms && (
                  <div style={{ marginTop: 10 }}>
                    <strong>Additional Terms:</strong>
                    <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{additionalTerms}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div
              style={{
                marginTop: 14,
                padding: 10,
                borderRadius: 8,
                background: "rgba(217, 119, 6, 0.06)",
                border: "1px solid rgba(217, 119, 6, 0.15)",
                fontSize: 11,
                color: "#92400e",
                lineHeight: 1.5,
                fontWeight: 700,
              }}
            >
              ⚠ Once sent, this offer letter cannot be edited. The candidate will be notified immediately and can accept or reject it.
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button className="wm-outlineBtn" type="button" onClick={() => setStep(1)}>
                ← Edit
              </button>
              <button
                className="wm-primarybtn"
                type="button"
                onClick={handleSend}
              >
                Send Offer Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </CenterModal>
  );
}
