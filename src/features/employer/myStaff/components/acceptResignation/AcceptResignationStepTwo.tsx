// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AcceptResignationStepTwo.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\acceptResignation\AcceptResignationStepTwo.tsx

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
  rating: number;
  comment: string;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function AcceptResignationStepTwo({
  employeeName,
  jobTitle,
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onBack,
  onNext,
}: Props) {
  return (
    <div role="dialog" aria-modal="true" style={OVERLAY}>
      <div style={CARD}>
        <StepIndicator step={2} />

        <div style={{ ...TITLE, color: "var(--wm-er-text)" }}>Employment Feedback</div>

        <div style={SUB}>
          {employeeName} - {jobTitle}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--wm-er-muted)",
            lineHeight: 1.5,
            marginBottom: 12,
            padding: "9px 12px",
            background: "rgba(29,78,216,0.05)",
            border: "1px solid rgba(29,78,216,0.14)",
            borderRadius: "var(--wm-radius-10)",
          }}
        >
          Optional feedback for this completed employment record. This helps maintain a fair work
          record. You can skip this and add feedback later.
        </div>

        <div style={{ fontSize: 12, fontWeight: 850, color: "var(--wm-er-text)", marginBottom: 8 }}>
          Optional star rating
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              style={{
                fontSize: 28,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: star <= rating ? "#f59e0b" : "#d1d5db",
                padding: 2,
              }}
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Optional private note"
          maxLength={500}
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            border: "1.5px solid rgba(0,0,0,0.12)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--wm-er-text)",
            background: "#f8fafc",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div style={BTN_ROW}>
          <button type="button" onClick={onBack} style={CANCEL_BTN}>
            Back
          </button>

          <button type="button" onClick={onNext} style={nextBtnStyle(true)}>
            {rating > 0 || comment.trim() ? "Continue with feedback" : "Skip for now"}
          </button>
        </div>
      </div>
    </div>
  );
}
