// src/features/employer/myStaff/components/AcceptResignationModal.tsx
//
// Accept resignation flow:
// Step 1: Last working date → Step 2: Rate employee (mandatory) → Step 3: Done
// Steps 2 & 3: backdrop click and Cancel are disabled — rating cannot be skipped.

import { useState } from "react";

type Props = {
  employeeName: string;
  jobTitle: string;
  onComplete: (exitedAt: number, rating: number, comment: string) => void;
  onClose: () => void;
};

function formatDateInput(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ------------------------------------------------ */
/* Shared styles                                    */
/* ------------------------------------------------ */
const OVERLAY: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 16, zIndex: 50,
};

const CARD: React.CSSProperties = {
  width: "100%", maxWidth: 420,
  background: "#fff", borderRadius: 16,
  padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const TITLE: React.CSSProperties = {
  fontWeight: 700, fontSize: 16,
  color: "#16a34a", marginBottom: 4,
};

const SUB: React.CSSProperties = {
  fontSize: 13, color: "var(--wm-er-muted)", marginBottom: 16,
};

const BTN_ROW: React.CSSProperties = {
  marginTop: 18, display: "flex",
  justifyContent: "flex-end", gap: 10,
};

const CANCEL_BTN: React.CSSProperties = {
  padding: "10px 18px", borderRadius: 10,
  border: "1.5px solid rgba(0,0,0,0.12)",
  background: "transparent",
  fontWeight: 600, fontSize: 13,
  color: "var(--wm-er-text)", cursor: "pointer",
};

function nextBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    padding: "10px 18px", borderRadius: 10, border: "none",
    background: enabled ? "#16a34a" : "#e5e7eb",
    color: enabled ? "#fff" : "#9ca3af",
    fontWeight: 600, fontSize: 13,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", marginBottom: 12 }}>
      Step {step} of 3
    </div>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function AcceptResignationModal({
  employeeName, jobTitle, onComplete, onClose,
}: Props) {
  const [step, setStep]       = useState(1);
  const [nowMs]               = useState(() => Date.now());
  const [dateStr, setDateStr] = useState(() => formatDateInput(Date.now()));
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");

  const todayStr   = formatDateInput(nowMs);
  const parsedDate = new Date(dateStr + "T00:00:00").getTime();
  const dateValid  = !Number.isNaN(parsedDate);

  /* ── Step 1: Date (can cancel here) ── */
  if (step === 1) {
    return (
      <div role="dialog" aria-modal="true" style={OVERLAY} onClick={onClose}>
        <div style={CARD} onClick={(e) => e.stopPropagation()}>
          <StepIndicator step={1} />
          <div style={TITLE}>Accept Resignation</div>
          <div style={SUB}>{employeeName} — {jobTitle}</div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>
            Actual last working date:
          </div>
          <input
            type="date"
            value={dateStr}
            max={todayStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.12)",
              fontSize: 14, fontWeight: 700,
              color: "var(--wm-er-text)", background: "#f8fafc",
              outline: "none", boxSizing: "border-box",
            }}
          />

          <div style={BTN_ROW}>
            <button type="button" onClick={onClose} style={CANCEL_BTN}>Cancel</button>
            <button
              type="button"
              onClick={() => { if (dateValid) setStep(2); }}
              disabled={!dateValid}
              style={nextBtnStyle(dateValid)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2: Rating — MANDATORY, cannot dismiss ── */
  if (step === 2) {
    return (
      <div role="dialog" aria-modal="true" style={OVERLAY}>
        {/* No onClick on overlay — backdrop cannot dismiss rating step */}
        <div style={CARD}>
          <StepIndicator step={2} />
          <div style={{ ...TITLE, color: "var(--wm-er-text)" }}>Rate Employee</div>
          <div style={SUB}>{employeeName} — {jobTitle}</div>

          <div style={{
            fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5,
            marginBottom: 12, padding: "8px 12px",
            background: "rgba(217,119,6,0.05)",
            border: "1px solid rgba(217,119,6,0.18)",
            borderRadius: 8,
          }}>
            Rating is mandatory to approve this resignation. Your rating will be
            permanently linked to this employee's verified work history.
          </div>

          {/* Stars */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  fontSize: 28, background: "none", border: "none",
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

          {/* Rating required hint */}
          {rating === 0 && (
            <div style={{
              fontSize: 11, color: "#92400e", fontWeight: 600,
              marginBottom: 10,
            }}>
              Select a star rating to continue.
            </div>
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment (optional)"
            maxLength={500}
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.12)",
              fontSize: 13, fontWeight: 600,
              color: "var(--wm-er-text)", background: "#f8fafc",
              outline: "none", resize: "vertical", boxSizing: "border-box",
            }}
          />

          <div style={BTN_ROW}>
            <button type="button" onClick={() => setStep(1)} style={CANCEL_BTN}>Back</button>
            <button
              type="button"
              onClick={() => { if (rating > 0) setStep(3); }}
              disabled={rating === 0}
              style={nextBtnStyle(rating > 0)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 3: Done — cannot dismiss, must tap Done ── */
  return (
    <div role="dialog" aria-modal="true" style={OVERLAY}>
      {/* No onClick on overlay — must tap Done */}
      <div style={CARD}>
        <StepIndicator step={3} />
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#16a34a" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
          </svg>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#16a34a", marginTop: 10 }}>
            Resignation Accepted
          </div>
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.5 }}>
            {employeeName}&apos;s resignation has been processed.
            Their verified work history has been updated.
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => onComplete(parsedDate, rating, comment.trim())}
            style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: "#16a34a", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}