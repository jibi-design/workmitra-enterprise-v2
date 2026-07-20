// App name: Job Mitra
// File name: CareerApplyForm.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerApplyForm.tsx

import type { CSSProperties } from "react";
import { INPUT_STYLE, LABEL_STYLE, NOTICE_OPTIONS } from "../helpers/careerPostDetailHelpers";

type CareerApplyFormProps = {
  coverNote: string;
  expectedSalary: string;
  noticePeriod: string;
  employeePhone: string;
  employeeEmail: string;
  contactConfirmed: boolean;
  canSubmit: boolean;
  submitBlockReason: string;
  onCoverNoteChange: (value: string) => void;
  onExpectedSalaryChange: (value: string) => void;
  onNoticePeriodChange: (value: string) => void;
  onEmployeePhoneChange: (value: string) => void;
  onEmployeeEmailChange: (value: string) => void;
  onContactConfirmedChange: (value: boolean) => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#64748b";

const CUSTOM_LABEL_STYLE: CSSProperties = {
  ...LABEL_STYLE,
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: 800,
  color: "#475569",
};

const CUSTOM_INPUT_STYLE: CSSProperties = {
  ...INPUT_STYLE,
  width: "100%",
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(0,0,0,0.08)",
  backgroundColor: "rgba(255,255,255,0.6)",
  fontSize: "14px",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
};

export function CareerApplyForm({
  coverNote,
  expectedSalary,
  noticePeriod,
  employeePhone,
  employeeEmail,
  contactConfirmed,
  canSubmit,
  submitBlockReason,
  onCoverNoteChange,
  onExpectedSalaryChange,
  onNoticePeriodChange,
  onEmployeePhoneChange,
  onEmployeeEmailChange,
  onContactConfirmedChange,
}: CareerApplyFormProps) {
  const hasContactDetails = employeePhone.trim().length > 0 || employeeEmail.trim().length > 0;

  return (
    <section
      className="wm-apply-widget"
      style={{
        marginTop: 16,
        padding: 24,
        borderRadius: 24,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
        boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900, color: CAREER_TEXT, lineHeight: 1.2 }}>
        Apply for this position
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 13,
          color: CAREER_MUTED,
          lineHeight: 1.5,
          fontWeight: 600,
        }}
      >
        Add a short note and confirm your availability before submitting.
      </div>

      <div style={{ marginTop: 20, marginBottom: 16 }}>
        <label style={CUSTOM_LABEL_STYLE}>Cover note *</label>
        <textarea
          value={coverNote}
          onChange={(event) => onCoverNoteChange(event.target.value)}
          placeholder="Briefly explain why this role fits your experience..."
          maxLength={600}
          className="wm-apply-input"
          style={{ ...CUSTOM_INPUT_STYLE, minHeight: 100, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={CUSTOM_LABEL_STYLE}>Phone number</label>
        <input
          type="tel"
          value={employeePhone}
          onChange={(event) => onEmployeePhoneChange(event.target.value)}
          placeholder="Enter your phone number"
          className="wm-apply-input"
          style={CUSTOM_INPUT_STYLE}
        />
        <div
          style={{
            fontSize: 12,
            color: CAREER_MUTED,
            marginTop: 6,
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          Used for interview and contact coordination through Job Mitra.
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={CUSTOM_LABEL_STYLE}>Email address</label>
        <input
          type="email"
          value={employeeEmail}
          onChange={(event) => onEmployeeEmailChange(event.target.value)}
          placeholder="Enter your email address"
          className="wm-apply-input"
          style={CUSTOM_INPUT_STYLE}
        />
        <div
          style={{
            fontSize: 12,
            color: CAREER_MUTED,
            marginTop: 6,
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          Used for interview and contact coordination through Job Mitra.
        </div>
      </div>

      <label
        style={{
          marginBottom: 16,
          padding: "14px",
          borderRadius: "16px",
          border:
            hasContactDetails && !contactConfirmed
              ? "1px solid rgba(217,119,6,0.3)"
              : "1px solid rgba(0,0,0,0.05)",
          background:
            hasContactDetails && !contactConfirmed
              ? "linear-gradient(135deg, rgba(254,243,199,0.3), rgba(255,255,255,0.9))"
              : "rgba(255,255,255,0.5)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
        }}
      >
        <input
          type="checkbox"
          checked={contactConfirmed}
          onChange={(event) => event.target && onContactConfirmedChange(event.target.checked)}
          style={{
            marginTop: 2,
            width: 18,
            height: 18,
            accentColor: CAREER_BLUE,
            flexShrink: 0,
            cursor: "pointer",
          }}
        />

        <span style={{ fontSize: 13, color: CAREER_TEXT, lineHeight: 1.5, fontWeight: 700 }}>
          I confirm these contact details are mine and can be used for interview/contact
          coordination through Job Mitra.
        </span>
      </label>

      <div style={{ marginBottom: 16 }}>
        <label style={CUSTOM_LABEL_STYLE}>Expected salary (optional)</label>
        <input
          type="number"
          min="0"
          max="999999999"
          step="1"
          inputMode="numeric"
          value={expectedSalary}
          onChange={(event) => onExpectedSalaryChange(event.target.value)}
          placeholder="Enter expected salary"
          className="wm-apply-input"
          style={CUSTOM_INPUT_STYLE}
        />
        <div
          style={{
            fontSize: 12,
            color: CAREER_MUTED,
            marginTop: 6,
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          Optional. Enter a number only. Use the employer’s listed pay period as reference.
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={CUSTOM_LABEL_STYLE}>When can you join?</label>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "nowrap",
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {NOTICE_OPTIONS.map((option) => {
            const active = noticePeriod === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onNoticePeriodChange(option)}
                className="wm-notice-btn"
                style={{
                  fontSize: "13px",
                  fontWeight: active ? 900 : 700,
                  padding: "10px 18px",
                  borderRadius: "14px",
                  border: active ? `1px solid ${CAREER_BLUE}` : "1px solid rgba(0,0,0,0.06)",
                  background: active
                    ? "linear-gradient(135deg, rgba(239,246,255,0.9), rgba(255,255,255,0.9))"
                    : "rgba(255,255,255,0.8)",
                  color: active ? CAREER_BLUE : CAREER_MUTED,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  boxShadow: active
                    ? "0 4px 12px rgba(37,99,235,0.1)"
                    : "0 2px 6px rgba(0,0,0,0.01)",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {!canSubmit && submitBlockReason && (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(217,119,6,0.25)",
            background: "linear-gradient(135deg, rgba(254,243,199,0.3), rgba(255,255,255,0.9))",
            color: "#92400e",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900 }}>Complete required items to submit</div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700 }}>{submitBlockReason}</div>
        </div>
      )}

      <div
        style={{
          padding: "12px 16px",
          borderRadius: "14px",
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.1)",
          fontSize: 12.5,
          color: "#1e40af",
          fontWeight: 700,
          lineHeight: 1.5,
        }}
      >
        Your profile information and confirmed contact details will be included with this
        application for hiring coordination.
      </div>
    </section>
  );
}
