// src/features/employer/careerJobs/components/CareerResultModal.tsx
//
// Modal for recording an interview round result (passed / failed).
// Includes optional feedback textarea.
// Warning confirmation before submitting result.
// Uses shared CenterModal shell.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  roundLabel: string;
  candidateName: string;
  onClose: () => void;
  onSubmit: (result: "passed" | "failed", feedback: string) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CareerResultModal({ open, roundLabel, candidateName, onClose, onSubmit }: Props) {
  const [result, setResult] = useState<"passed" | "failed" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit = result !== null;

  function handleSubmitClick() {
    if (!result) return;
    setShowConfirm(true);
  }

  function handleConfirmedSubmit() {
    if (!result) return;
    onSubmit(result, feedback.trim());
    resetAndClose();
  }

  function resetAndClose() {
    setResult(null);
    setFeedback("");
    setShowConfirm(false);
    onClose();
  }

  const confirmTitle =
    result === "passed"
      ? "Confirm: Mark as Passed?"
      : "Confirm: Mark as Not Passed?";

  const confirmMessage =
    result === "passed"
      ? `Are you sure "${candidateName}" passed ${roundLabel}? This action will advance the candidate in the pipeline and cannot be easily undone.`
      : `Are you sure "${candidateName}" did not pass ${roundLabel}? This may end the candidate's progress in the interview pipeline.`;

  const confirmColor =
    result === "passed" ? "#16a34a" : "var(--wm-error, #dc2626)";

  return (
    <>
      {/* ── Main Result Modal ── */}
      <CenterModal open={open && !showConfirm} onBackdropClose={resetAndClose} ariaLabel="Update Interview Result">
        <div style={{ padding: 20 }}>
          {/* Header */}
          <div style={{ fontSize: 15, fontWeight: 1000, color: "var(--wm-er-accent-career)", marginBottom: 4 }}>
            Update Interview Result
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 16 }}>
            {roundLabel} — {candidateName}
          </div>

          {/* Result Selection */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 8 }}>
              Result *
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setResult("passed")}
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 900,
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: result === "passed"
                    ? "2px solid #16a34a"
                    : "1.5px solid var(--wm-er-border)",
                  background: result === "passed"
                    ? "rgba(22,163,74,0.06)"
                    : "var(--wm-er-bg)",
                  color: result === "passed" ? "#16a34a" : "var(--wm-er-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Passed
              </button>
              <button
                type="button"
                onClick={() => setResult("failed")}
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 900,
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: result === "failed"
                    ? "2px solid var(--wm-error, #dc2626)"
                    : "1.5px solid var(--wm-er-border)",
                  background: result === "failed"
                    ? "rgba(220,38,38,0.06)"
                    : "var(--wm-er-bg)",
                  color: result === "failed"
                    ? "var(--wm-error, #dc2626)"
                    : "var(--wm-er-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Not Passed
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 4 }}>
              Feedback (optional)
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Performance notes, observations..."
              rows={3}
              style={{
                width: "100%",
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1.5px solid var(--wm-er-border)",
                background: "var(--wm-er-bg)",
                color: "var(--wm-er-text)",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
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
              onClick={handleSubmitClick}
              disabled={!canSubmit}
              style={{
                fontSize: 13,
                padding: "8px 20px",
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              Save Result
            </button>
          </div>
        </div>
      </CenterModal>

      {/* ── Warning Confirmation Modal ── */}
      <CenterModal
        open={showConfirm}
        onBackdropClose={() => setShowConfirm(false)}
        ariaLabel="Confirm Interview Result"
      >
        <div style={{ padding: 20 }}>
          {/* Warning Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: confirmColor + "12",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 22 }}>
              {result === "passed" ? "\u2714" : "\u26A0"}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 1000,
              color: confirmColor,
              marginBottom: 8,
            }}
          >
            {confirmTitle}
          </div>

          {/* Message */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--wm-er-muted)",
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            {confirmMessage}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              className="wm-outlineBtn"
              type="button"
              onClick={() => setShowConfirm(false)}
              style={{ fontSize: 13, height: 38, padding: "0 16px" }}
            >
              Go Back
            </button>
            <button
              className="wm-primarybtn"
              type="button"
              onClick={handleConfirmedSubmit}
              style={{
                fontSize: 13,
                padding: "8px 20px",
                background: confirmColor,
              }}
            >
              Yes, Confirm
            </button>
          </div>
        </div>
      </CenterModal>
    </>
  );
}