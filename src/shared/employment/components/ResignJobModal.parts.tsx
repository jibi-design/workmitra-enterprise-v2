import type { EmployeeResignReason } from "../employmentTypes";
import { EMPLOYEE_RESIGN_REASONS } from "../employmentTypes";
import {
  MAX_RESIGN_NOTES_LENGTH,
  RESIGN_BORDER,
  RESIGN_CARD,
  RESIGN_ERROR,
  RESIGN_MUTED,
  RESIGN_TEXT,
  RESIGN_WARNING,
  formatResignDateLabel,
} from "./ResignJobModal.styles";

type ResignFormFieldsProps = {
  reason: EmployeeResignReason | "";
  notes: string;
  onReasonChange: (reason: EmployeeResignReason) => void;
  onNotesChange: (notes: string) => void;
};

export function ResignFormFields({
  reason,
  notes,
  onReasonChange,
  onNotesChange,
}: ResignFormFieldsProps) {
  return (
    <>
      <div style={{ marginTop: 16 }}>
        <label
          htmlFor="wm-resign-reason"
          style={{
            display: "block",
            fontSize: 12.2,
            fontWeight: 900,
            color: RESIGN_TEXT,
            marginBottom: 7,
          }}
        >
          Reason for leaving <span style={{ color: RESIGN_ERROR }}>*</span>
        </label>

        <select
          id="wm-resign-reason"
          data-testid="career-resign-reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value as EmployeeResignReason)}
          style={{
            width: "100%",
            height: 48,
            padding: "0 13px",
            borderRadius: 14,
            border: `1px solid ${reason ? "rgba(29,78,216,0.24)" : RESIGN_BORDER}`,
            fontSize: 13.5,
            fontWeight: 750,
            color: reason ? RESIGN_TEXT : "#94a3b8",
            background: RESIGN_CARD,
            outline: "none",
            boxShadow: reason ? "0 0 0 3px rgba(29,78,216,0.06)" : "none",
          }}
        >
          <option value="" disabled>
            Select a reason
          </option>
          {EMPLOYEE_RESIGN_REASONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 14 }}>
        <label
          htmlFor="wm-resign-notes"
          style={{
            display: "block",
            fontSize: 12.2,
            fontWeight: 900,
            color: RESIGN_TEXT,
            marginBottom: 7,
          }}
        >
          Additional notes{" "}
          <span style={{ fontSize: 11.2, fontWeight: 700, color: RESIGN_MUTED }}>(optional)</span>
        </label>

        <textarea
          id="wm-resign-notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value.slice(0, MAX_RESIGN_NOTES_LENGTH))}
          maxLength={MAX_RESIGN_NOTES_LENGTH}
          placeholder="Add any useful information for your employer"
          rows={4}
          style={{
            width: "100%",
            padding: "12px 13px",
            borderRadius: 15,
            border: `1px solid ${RESIGN_BORDER}`,
            fontSize: 13.4,
            fontWeight: 700,
            color: RESIGN_TEXT,
            background: RESIGN_CARD,
            resize: "vertical",
            lineHeight: 1.45,
            outline: "none",
          }}
        />

        <div
          style={{
            marginTop: 4,
            fontSize: 11.2,
            color: RESIGN_MUTED,
            textAlign: "right",
            fontWeight: 800,
          }}
        >
          {notes.length}/{MAX_RESIGN_NOTES_LENGTH}
        </div>
      </div>
    </>
  );
}

type ResignNoticeSummaryProps = {
  noticePeriodDays: number;
  lastWorkingDate: number;
};

export function ResignNoticeSummary({
  noticePeriodDays,
  lastWorkingDate,
}: ResignNoticeSummaryProps) {
  const noticeText =
    noticePeriodDays > 0
      ? `Your notice period is ${noticePeriodDays} day${noticePeriodDays === 1 ? "" : "s"}. You should continue working until the last working date unless both sides agree to close earlier.`
      : "Your employer will be notified and must confirm your resignation.";

  return (
    <>
      <div
        style={{
          marginTop: 14,
          padding: "11px 12px",
          borderRadius: 15,
          background: "rgba(180,83,9,0.07)",
          border: "1px solid rgba(180,83,9,0.18)",
          color: "#92400e",
          fontSize: 12.4,
          lineHeight: 1.5,
          fontWeight: 800,
        }}
      >
        {noticeText}
      </div>

      {noticePeriodDays > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <div
            style={{
              padding: "10px 11px",
              borderRadius: 14,
              background: "rgba(217,119,6,0.08)",
              border: "1px solid rgba(217,119,6,0.14)",
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 950, color: RESIGN_MUTED }}>
              Notice period
            </div>
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: RESIGN_WARNING }}>
              {noticePeriodDays} day{noticePeriodDays === 1 ? "" : "s"}
            </div>
          </div>

          <div
            style={{
              padding: "10px 11px",
              borderRadius: 14,
              background: "rgba(15,23,42,0.035)",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 950, color: RESIGN_MUTED }}>
              Expected last working date
            </div>
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 950, color: RESIGN_TEXT }}>
              {formatResignDateLabel(lastWorkingDate)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
