// App name: Job Mitra
// File name: CareerResultFormModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\careerResult\CareerResultFormModal.tsx

import type { CSSProperties } from "react";
import { CenterModal } from "../../../../../shared/components/CenterModal";

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

const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const CAREER_BORDER = "var(--wm-er-border, rgba(203, 213, 225, 0.6))";
const CAREER_BG = "var(--wm-er-bg, rgba(241, 245, 249, 0.5))";
const PASS_GREEN = "#16a34a";
const FAIL_RED = "var(--wm-error, #dc2626)";
const MAX_RESULT_FEEDBACK_LENGTH = 500;

const RESULT_MODAL_INTERACTIONS = `
  .wm-result-input {
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
  }
  .wm-result-input:focus {
    border-color: #2563eb !important;
    background-color: #ffffff !important;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.12), inset 0 0 0 1px #2563eb !important;
  }

  .wm-result-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-result-btn:active {
    transform: scale(0.96);
  }
  .wm-result-btn:hover:not(.selected) {
    background: #ffffff !important;
    border-color: #94a3b8 !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  }

  .wm-submit-btn {
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
    background-size: 200% auto !important;
  }
  .wm-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25) !important;
    background-position: right center !important;
  }
  .wm-submit-btn:active:not(:disabled) {
    transform: scale(0.96) !important;
  }

  .wm-cancel-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring) !important;
  }
  .wm-cancel-btn:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
  }
  .wm-cancel-btn:active {
    transform: scale(0.96) !important;
  }
`;

// FIXED: Removed background, box-shadow and borders to merge with CenterModal
const shellStyle: CSSProperties = {
  padding: "16px 20px",
  width: "100%",
  maxWidth: 480,
  boxSizing: "border-box",
  background: "transparent", // Ensures no double layer
  boxShadow: "none",
  border: "none",
};

const titleStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  color: CAREER_TEXT,
  lineHeight: 1.2,
  letterSpacing: "-0.5px",
};

const roundStyle: CSSProperties = {
  marginTop: 10,
  display: "inline-block",
  padding: "6px 14px",
  borderRadius: 12,
  background: "rgba(37,99,235,0.08)",
  border: "1px solid rgba(37,99,235,0.15)",
  color: CAREER_BLUE_DEEP,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.5,
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: CAREER_MUTED,
  marginBottom: 8,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const helperStyle: CSSProperties = {
  marginTop: 16,
  padding: "14px 18px",
  borderRadius: 16,
  background: "rgba(239,246,255,0.6)",
  border: "1px solid rgba(219,234,254,0.8)",
  color: "#1e40af",
  fontSize: 13,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  gap: 10,
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
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              border: "none",
              background: "rgba(15,23,42,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: CAREER_MUTED,
            }}
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
            style={{
              width: "100%",
              fontSize: 14,
              fontWeight: 700,
              padding: "16px 18px",
              borderRadius: 20,
              border: `1px solid ${CAREER_BORDER}`,
              background: CAREER_BG,
              color: CAREER_TEXT,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
              outline: "none",
            }}
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
              borderRadius: 18,
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
              borderRadius: 18,
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

function ResultButton({
  label,
  selected,
  color,
  onClick,
}: {
  label: string;
  selected: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`wm-result-btn ${selected ? "selected" : ""}`}
      type="button"
      onClick={onClick}
      style={{
        minHeight: 56,
        fontSize: 14,
        fontWeight: 900,
        padding: "12px 16px",
        borderRadius: 18,
        border: selected ? `2px solid ${color}` : `1px solid ${CAREER_BORDER}`,
        background: selected ? `${color}12` : "rgba(241, 245, 249, 0.5)",
        color: selected ? color : CAREER_MUTED,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {selected && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      {label}
    </button>
  );
}
