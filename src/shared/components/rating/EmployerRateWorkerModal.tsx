// src/shared/components/rating/EmployerRateWorkerModal.tsx
//
// Employer rates Worker modal — MANDATORY after shift completion.
// Stars + Tags + Comment + "Hire again?" Yes/No.
// Edit mode: pre-populates, 1 edit within 48hr, no points re-award.

import { useState, useCallback } from "react";
import { StarRating } from "./StarRating";
import { RatingTagSelector } from "./RatingTagSelector";
import { EMPLOYER_WORKER_TAGS } from "../../rating/ratingTags";
import { ratingStorage } from "../../rating/ratingStorage";
import { favoritesStorage } from "../../../features/employer/shiftJobs/storage/favoritesStorage";
import { workerPointsStorage } from "../../rating/workerPointsStorage";
import type { EmployerWorkerTag } from "../../rating/ratingTypes";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
  employerWmId: string;
  workerWmId: string;
  workerName: string;
  domain: "shift" | "career";
  /** When true, pre-populates from existing rating for edit */
  editMode?: boolean;
  onSubmitted: () => void;
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerRateWorkerModal({
  isOpen, jobId, jobTitle, employerWmId, workerWmId,
  workerName, domain, editMode, onSubmitted, onClose,
}: Props) {
  const existing = editMode
    ? ratingStorage.getEmployerRatingForJob(employerWmId, jobId, workerWmId)
    : null;

  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [tags, setTags] = useState<EmployerWorkerTag[]>(existing?.tags ?? []);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [hireAgain, setHireAgain] = useState<boolean | null>(existing?.hireAgain ?? null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const handleStarsChange = useCallback((v: 1 | 2 | 3 | 4 | 5) => {
    setStars(v); setError("");
  }, []);

  const handleSubmit = useCallback(() => {
    if (stars === 0) { setError("Please select a star rating."); return; }
    if (hireAgain === null) { setError("Please answer: Would you hire this worker again?"); return; }
    setSubmitting(true);

    if (editMode) {
      const result = ratingStorage.editEmployerRating(employerWmId, jobId, workerWmId, {
        stars: stars as 1 | 2 | 3 | 4 | 5, tags,
        comment: comment.trim() || undefined, hireAgain,
      });
      setSubmitting(false);
      if (!result.success) { setError(result.reason); return; }
      setEditSuccess(true);
      setTimeout(() => onSubmitted(), 1500);
      return;
    }

    ratingStorage.saveEmployerRating({
      domain, employerWmId, workerWmId, jobId,
      stars: stars as 1 | 2 | 3 | 4 | 5, tags,
      comment: comment.trim() || undefined, hireAgain,
    });

    if (stars === 5) workerPointsStorage.applyEvent(workerWmId, "rating_5star", jobId);
    else if (stars === 4) workerPointsStorage.applyEvent(workerWmId, "rating_4star", jobId);
    else if (stars <= 2) workerPointsStorage.applyEvent(workerWmId, "rating_1or2star", jobId);
    if (tags.includes("Reliable")) workerPointsStorage.applyEvent(workerWmId, "tag_reliable", jobId);
    if (hireAgain) {
      workerPointsStorage.applyEvent(workerWmId, "hire_again", jobId);
      favoritesStorage.addFromRating({ workerWmId, workerName, jobTitle, stars: stars as number });
    }

    setSubmitting(false);
    onSubmitted();
  }, [stars, tags, comment, hireAgain, domain, employerWmId, workerWmId, jobId, jobTitle, workerName, editMode, onSubmitted]);

  if (!isOpen) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 400, maxHeight: "90vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--wm-er-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
              {editMode ? "Edit Review" : "Rate Worker"}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>{jobTitle}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wm-er-muted)", fontSize: 18, padding: 4, lineHeight: 1 }}>&times;</button>
        </div>

        {/* Edit success state */}
        {editSuccess ? (
          <div style={{ padding: "32px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)" }}>Review updated</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 6 }}>No further edits allowed.</div>
          </div>
        ) : (
          <>
            {/* Body */}
            <div style={{ padding: "16px 18px", display: "grid", gap: 16 }}>
              {/* Notice */}
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.18)", fontSize: 12, fontWeight: 600, lineHeight: 1.5, color: "var(--wm-er-accent-shift, #16a34a)" }}>
                {editMode
                  ? "Edit your review. This is your only edit — make it count."
                  : "Rating is required to close this shift. Honest feedback builds a stronger workforce."}
              </div>

              {/* Worker name */}
              <div style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--wm-er-border)", background: "var(--wm-er-card)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>{workerName}</div>
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                  {editMode ? "Update your rating below" : "How did this worker perform?"}
                </div>
              </div>

              {/* Stars */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)", marginBottom: 8 }}>
                  Star Rating <span style={{ color: "var(--wm-error)" }}>*</span>
                </div>
                <StarRating value={stars} onChange={handleStarsChange} />
              </div>

              {/* Tags */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)", marginBottom: 8 }}>What stood out? (optional)</div>
                <RatingTagSelector tags={EMPLOYER_WORKER_TAGS} selected={tags} onChange={setTags} />
              </div>

              {/* Comment */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)", marginBottom: 6 }}>Comment (optional, max 100 chars)</div>
                <input type="text" className="wm-input" placeholder="Brief comment about this worker..." value={comment} onChange={(e) => setComment(e.target.value)} maxLength={100} style={{ width: "100%", fontSize: 12 }} />
              </div>

              {/* Hire again */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)", marginBottom: 8 }}>
                  Would you hire this worker again? <span style={{ color: "var(--wm-error)" }}>*</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => setHireAgain(true)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: hireAgain === true ? "2px solid var(--wm-er-accent-shift, #16a34a)" : "1px solid var(--wm-er-border)", background: hireAgain === true ? "rgba(22,163,74,0.08)" : "#fff", color: hireAgain === true ? "var(--wm-er-accent-shift, #16a34a)" : "var(--wm-er-muted)", cursor: "pointer" }}>&#10003; Yes</button>
                  <button type="button" onClick={() => setHireAgain(false)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: hireAgain === false ? "2px solid #ef4444" : "1px solid var(--wm-er-border)", background: hireAgain === false ? "rgba(239,68,68,0.06)" : "#fff", color: hireAgain === false ? "#ef4444" : "var(--wm-er-muted)", cursor: "pointer" }}>&#10005; No</button>
                </div>
              </div>

              {error && (
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(220,38,38,0.06)", fontSize: 12, color: "var(--wm-error)", fontWeight: 600 }}>{error}</div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 18px 16px", borderTop: "1px solid var(--wm-er-border)" }}>
              {!editMode && (
                <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 10, textAlign: "center" }}>
                  You can edit this review once within 48 hours
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={handleSubmit} disabled={submitting || stars === 0} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: stars > 0 && hireAgain !== null ? "var(--wm-er-accent-shift, #16a34a)" : "#d1d5db", color: "#fff", fontSize: 13, fontWeight: 600, cursor: stars > 0 ? "pointer" : "not-allowed" }}>
                  {submitting ? "Saving..." : editMode ? "Update Review" : "Submit Rating"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}