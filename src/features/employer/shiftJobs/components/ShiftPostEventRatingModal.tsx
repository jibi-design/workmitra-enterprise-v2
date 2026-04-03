// src/features/employer/shiftJobs/components/ShiftPostEventRatingModal.tsx
//
// Post-shift rating modal — rate a single worker after shift completion.
// MANDATORY: No skip option. Rating must be submitted to close shift.
// Stores rating in the workspace object for aggregation.

import { useState, useCallback } from "react";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  isOpen: boolean;
  workspaceName: string;
  workerName: string;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  width: "100%",
  maxWidth: 400,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
};

/* ------------------------------------------------ */
/* Rating label helper                              */
/* ------------------------------------------------ */
const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftPostEventRatingModal({
  isOpen,
  workspaceName,
  workerName,
  onSubmit,
  onClose,
}: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleStarClick = useCallback((value: number) => {
    setRating((prev) => (prev === value ? 0 : value));
    setError("");
  }, []);

  const handleSubmit = useCallback(() => {
    if (rating === 0) {
      setError("Please select a star rating to continue.");
      return;
    }
    onSubmit(rating, comment.trim());
  }, [rating, comment, onSubmit]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 18px 12px",
          borderBottom: "1px solid var(--wm-er-border)",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Rate Worker
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {workspaceName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--wm-er-muted)", padding: 4, fontSize: 18, lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 18px", display: "grid", gap: 14 }}>

          {/* Mandatory notice */}
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(22,163,74,0.06)",
            border: "1px solid rgba(22,163,74,0.18)",
            fontSize: 12, fontWeight: 600,
            color: "var(--wm-er-accent-shift, #16a34a)",
            lineHeight: 1.5,
          }}>
            Rating is required to close this shift. Your honest feedback helps this worker
            get better opportunities.
          </div>

          {/* Worker info */}
          <div style={{
            padding: "12px 14px", borderRadius: 10,
            border: "1px solid var(--wm-er-border)",
            background: "var(--wm-er-card)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>
              {workerName}
            </div>
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
              How did this worker perform?
            </div>

            {/* Star buttons */}
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleStarClick(v)}
                  aria-label={`${v} star`}
                  style={{
                    width: 42, height: 42, borderRadius: 10,
                    border: rating >= v
                      ? "2px solid var(--wm-er-accent-shift, #16a34a)"
                      : "1px solid var(--wm-er-border)",
                    background: rating >= v
                      ? "var(--wm-er-accent-shift, #16a34a)"
                      : "#fff",
                    color: rating >= v ? "#fff" : "var(--wm-er-muted)",
                    fontSize: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  &#9733;
                </button>
              ))}
            </div>

            {/* Rating label */}
            {rating > 0 && (
              <div style={{
                marginTop: 6, fontSize: 12, fontWeight: 600,
                color: "var(--wm-er-accent-shift, #16a34a)",
              }}>
                {RATING_LABELS[rating]}
              </div>
            )}

            {/* Comment */}
            <input
              type="text"
              className="wm-input"
              placeholder="Optional comment (max 100 characters)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: "100%", fontSize: 12, marginTop: 10 }}
              maxLength={100}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "8px 12px", borderRadius: 8,
              background: "rgba(220,38,38,0.06)",
              fontSize: 12, color: "var(--wm-error)", fontWeight: 600,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer — Submit only, no skip */}
        <div style={{
          padding: "12px 18px 16px",
          borderTop: "1px solid var(--wm-er-border)",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            style={{
              padding: "10px 24px", borderRadius: "var(--wm-radius-10)", border: "none",
              background: rating > 0
                ? "var(--wm-er-accent-shift, #16a34a)"
                : "#d1d5db",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: rating > 0 ? "pointer" : "not-allowed",
            }}
          >
            Submit Rating
          </button>
        </div>

      </div>
    </div>
  );
}