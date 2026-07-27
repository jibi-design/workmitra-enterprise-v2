// App name: Job Mitra
// File name: CareerResultFormModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\careerResult\CareerResultFormModal.tsx

import { CenterModal } from "../../../../../shared/components/CenterModal";
import { ResultButton } from "./CareerResultFormModal.parts";
import {
  CAREER_MUTED,
  FAIL_RED,
  feedbackTextareaStyle,
  helperStyle,
  labelStyle,
  MAX_RESULT_FEEDBACK_LENGTH,
  PASS_GREEN,
  closeButtonStyle,
  RESULT_MODAL_INTERACTIONS,
  roundStyle,
  shellStyle,
  titleStyle,
} from "./CareerResultFormModal.styles";

type CareerResult = "passed" | "failed";

type Props = {
  open: boolean;
  roundLabel: string;
  candidateName: string;
  result: CareerResult | null;
  feedback: string;
  canSubmit: boolean;
  onResultChange: (result: CareerResult) => void;
  onFeedbackChange: (feedback: string) => void;
  onSubmitClick: () => void;
  onClose: () => void;
};

export function CareerResultFormModal({
  open,
  roundLabel,
  candidateName,
  result,
  feedback,
  canSubmit,
  onResultChange,
  onFeedbackChange,
  onSubmitClick,
  onClose,
}: Props) {
  return (
    <CenterModal open={open} onBackdropClose={() => {}} ariaLabel="Update Interview Result">
      <div className="wm-premium-modal" style={shellStyle}>
        <style>{RESULT_MODAL_INTERACTIONS}</style>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div>
            <div style={titleStyle}>Update Result</div>
            <div style={roundStyle}>
              {roundLabel} — {candidateName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="wm-cancel-btn"
            style={closeButtonStyle}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ marginTop: 28 }}>
          <label style={labelStyle}>
            Result <span style={{ color: "#ef4444" }}>*</span>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ResultButton
              label="Passed"
              selected={result === "passed"}
              color={PASS_GREEN}
              onClick={() => onResultChange("passed")}
            />
            <ResultButton
              label="Not Passed"
              selected={result === "failed"}
              color={FAIL_RED}
              onClick={() => onResultChange("failed")}
            />
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label style={labelStyle}>Feedback (Optional)</label>
          <textarea
            className="wm-result-input"
            value={feedback}
            onChange={(event) => onFeedbackChange(event.target.value)}
            maxLength={MAX_RESULT_FEEDBACK_LENGTH}
            placeholder="Add performance notes or observations..."
            rows={4}
            style={feedbackTextareaStyle}
          />
        </div>

        <div
          style={{
            marginTop: 6,
            textAlign: "right",
            fontSize: 12,
            fontWeight: 800,
            color: CAREER_MUTED,
          }}
        >
          {feedback.length}/{MAX_RESULT_FEEDBACK_LENGTH}
        </div>

        {!canSubmit && (
          <div style={helperStyle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Select Passed or Not Passed to enable publishing.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
          <button
            className="wm-cancel-btn"
            type="button"
            onClick={onClose}
            style={{
              fontSize: 14,
              fontWeight: 800,
              minHeight: 52,
              padding: "0 24px",
              borderRadius: "var(--wm-radius-chip)",
              background: "transparent",
              border: "none",
              color: CAREER_MUTED,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            className="wm-submit-btn"
            type="button"
            onClick={onSubmitClick}
            disabled={!canSubmit}
            style={{
              fontSize: 14,
              fontWeight: 900,
              minHeight: 52,
              padding: "0 32px",
              borderRadius: "var(--wm-radius-chip)",
              background: canSubmit
                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 51%, #1e3a8a 100%)"
                : "#cbd5e1",
              border: "none",
              color: canSubmit ? "#ffffff" : "#94a3b8",
              opacity: canSubmit ? 1 : 0.6,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 8px 24px rgba(37,99,235,0.25)" : "none",
            }}
          >
            Publish Result
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
