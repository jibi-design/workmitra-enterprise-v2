// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AcceptResignationStepOne.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\acceptResignation\AcceptResignationStepOne.tsx

import {
  BTN_ROW,
  CANCEL_BTN,
  CARD,
  nextBtnStyle,
  OVERLAY,
  SUB,
  TITLE,
} from "./acceptResignationStyles";
import { StepIndicator } from "./acceptResignationUi";

type Props = {
  employeeName: string;
  jobTitle: string;
  dateStr: string;
  todayStr: string;
  dateValid: boolean;
  onDateChange: (value: string) => void;
  onClose: () => void;
  onNext: () => void;
};

export function AcceptResignationStepOne({
  employeeName,
  jobTitle,
  dateStr,
  todayStr,
  dateValid,
  onDateChange,
  onClose,
  onNext,
}: Props) {
  return (
    <div role="dialog" aria-modal="true" style={OVERLAY} onClick={onClose}>
      <div style={CARD} onClick={(event) => event.stopPropagation()}>
        <StepIndicator step={1} />

        <div style={TITLE}>Close Employment Record</div>

        <div style={SUB}>
          {employeeName} - {jobTitle}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--wm-er-muted)",
            lineHeight: 1.5,
            marginBottom: 12,
            padding: "9px 11px",
            borderRadius: "var(--wm-radius-button)",
            background: "rgba(29,78,216,0.055)",
            border: "1px solid rgba(29,78,216,0.12)",
            fontWeight: 760,
          }}
        >
          Employment Feedback will be available after closing this record. It helps build the
          worker&apos;s future work profile, supports better hiring decisions, and gives good
          workers a stronger record. You can add it after closing the employment record.
        </div>

        <div
          style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 10 }}
        >
          Actual last working date:
        </div>

        <input
          type="date"
          value={dateStr}
          max={todayStr}
          onChange={(event) => onDateChange(event.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            border: "1.5px solid rgba(0,0,0,0.12)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--wm-er-text)",
            background: "#f8fafc",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div style={BTN_ROW}>
          <button type="button" onClick={onClose} style={CANCEL_BTN}>
            Cancel
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!dateValid}
            style={nextBtnStyle(dateValid)}
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}
