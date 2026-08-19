import { NOTICE_OPTIONS } from "../helpers/careerPostDetailHelpers";
import { PhoneNumberField } from "../../../../shared/phone";
import { JobMitraBrandName } from "../../../../shared/components/brand/BrandName";
import {
  CAREER_BLUE,
  CAREER_MUTED,
  CAREER_TEXT,
  CUSTOM_INPUT_STYLE,
  CUSTOM_LABEL_STYLE,
} from "./CareerApplyForm.styles";

type ContactFieldsProps = {
  coverNote: string;
  employeePhone: string;
  employeeEmail: string;
  contactConfirmed: boolean;
  onCoverNoteChange: (value: string) => void;
  onEmployeePhoneChange: (value: string) => void;
  onEmployeeEmailChange: (value: string) => void;
  onContactConfirmedChange: (value: boolean) => void;
};

export function CareerApplyContactFields({
  coverNote,
  employeePhone,
  employeeEmail,
  contactConfirmed,
  onCoverNoteChange,
  onEmployeePhoneChange,
  onEmployeeEmailChange,
  onContactConfirmedChange,
}: ContactFieldsProps) {
  const hasContactDetails = employeePhone.trim().length > 0 || employeeEmail.trim().length > 0;
  const COVER_LIMIT = 600;
  const COVER_WARN_AT = 500;
  const nearLimit = coverNote.length > COVER_WARN_AT;
  const counterColor = nearLimit ? "var(--wm-amber-700)" : CAREER_MUTED;

  return (
    <>
      <div style={{ marginTop: "var(--wm-space-20)", marginBottom: "var(--wm-stack-gap)" }}>
        <label style={CUSTOM_LABEL_STYLE}>Cover note *</label>
        <textarea
          value={coverNote}
          onChange={(event) => onCoverNoteChange(event.target.value)}
          placeholder="Briefly explain why this role fits your experience..."
          maxLength={COVER_LIMIT}
          className="wm-apply-input"
          aria-describedby="career-cover-note-hint"
          style={{
            ...CUSTOM_INPUT_STYLE,
            minHeight: 100,
            resize: "vertical",
            ...(nearLimit
              ? {
                  borderColor: "var(--wm-amber-600)",
                  boxShadow: "0 0 0 1px color-mix(in srgb, var(--wm-amber-600) 35%, transparent)",
                }
              : null),
          }}
        />
        <div
          id="career-cover-note-hint"
          style={{
            marginTop: "var(--wm-space-6)",
            fontSize: 12,
            color: counterColor,
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            fontWeight: nearLimit ? 800 : 600,
          }}
        >
          <span>
            {nearLimit ? "Approaching the 600-character limit." : "Keep it clear and professional."}
          </span>
          <span>
            {coverNote.length}/{COVER_LIMIT}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "var(--wm-stack-gap)" }}>
        <label style={CUSTOM_LABEL_STYLE}>Phone number</label>
        <PhoneNumberField
          value={employeePhone}
          onChange={onEmployeePhoneChange}
          placeholder="Mobile number"
          className="wm-apply-input"
          testId="career-apply-phone"
        />
        <div
          style={{
            fontSize: 12,
            color: CAREER_MUTED,
            marginTop: "var(--wm-space-6)",
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          Used for interview and contact coordination through <JobMitraBrandName size="sm" />.
        </div>
      </div>

      <div style={{ marginBottom: "var(--wm-stack-gap)" }}>
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
            marginTop: "var(--wm-space-6)",
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          Used for interview and contact coordination through <JobMitraBrandName size="sm" />.
        </div>
      </div>

      <label
        style={{
          marginBottom: "var(--wm-stack-gap)",
          padding: "14px",
          borderRadius: "var(--wm-radius-chip)",
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
          gap: "var(--wm-space-12)",
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
          coordination through <JobMitraBrandName size="sm" />.
        </span>
      </label>
    </>
  );
}

type SalaryNoticeFieldsProps = {
  expectedSalary: string;
  noticePeriod: string;
  canSubmit: boolean;
  submitBlockReason: string;
  onExpectedSalaryChange: (value: string) => void;
  onNoticePeriodChange: (value: string) => void;
};

export function CareerApplySalaryNoticeFields({
  expectedSalary,
  noticePeriod,
  canSubmit,
  submitBlockReason,
  onExpectedSalaryChange,
  onNoticePeriodChange,
}: SalaryNoticeFieldsProps) {
  return (
    <>
      <div style={{ marginBottom: "var(--wm-stack-gap)" }}>
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
            marginTop: "var(--wm-space-6)",
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          Optional. Enter a number only. Use the employer’s listed pay period as reference.
        </div>
      </div>

      <div style={{ marginBottom: "var(--wm-space-20)" }}>
        <label style={CUSTOM_LABEL_STYLE}>When can you join?</label>
        <div
          style={{
            display: "flex",
            gap: "var(--wm-space-10)",
            flexWrap: "nowrap",
            overflowX: "auto",
            paddingBottom: "var(--wm-space-4)",
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
                  borderRadius: "var(--wm-radius-chip)",
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
            borderRadius: "var(--wm-radius-chip)",
            border: "1px solid rgba(217,119,6,0.25)",
            background: "linear-gradient(135deg, rgba(254,243,199,0.3), rgba(255,255,255,0.9))",
            color: "#92400e",
            lineHeight: 1.5,
            marginBottom: "var(--wm-stack-gap)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900 }}>Complete required items to submit</div>
          <div style={{ marginTop: "var(--wm-space-4)", fontSize: 13, fontWeight: 700 }}>
            {submitBlockReason}
          </div>
        </div>
      )}
    </>
  );
}
