// App name: Job Mitra
// File name: CareerApplyForm.tsx — facade

import { CAREER_MUTED, CAREER_TEXT } from "./CareerApplyForm.styles";
import { CareerApplyContactFields, CareerApplySalaryNoticeFields } from "./CareerApplyForm.parts";

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

export function CareerApplyForm(props: CareerApplyFormProps) {
  return (
    <section
      className="wm-apply-widget"
      style={{
        marginTop: 16,
        padding: 24,
        borderRadius: "var(--wm-radius-employer-card)",
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

      <CareerApplyContactFields
        coverNote={props.coverNote}
        employeePhone={props.employeePhone}
        employeeEmail={props.employeeEmail}
        contactConfirmed={props.contactConfirmed}
        onCoverNoteChange={props.onCoverNoteChange}
        onEmployeePhoneChange={props.onEmployeePhoneChange}
        onEmployeeEmailChange={props.onEmployeeEmailChange}
        onContactConfirmedChange={props.onContactConfirmedChange}
      />

      <CareerApplySalaryNoticeFields
        expectedSalary={props.expectedSalary}
        noticePeriod={props.noticePeriod}
        canSubmit={props.canSubmit}
        submitBlockReason={props.submitBlockReason}
        onExpectedSalaryChange={props.onExpectedSalaryChange}
        onNoticePeriodChange={props.onNoticePeriodChange}
      />

      <div
        style={{
          padding: "12px 16px",
          borderRadius: "var(--wm-radius-chip)",
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
