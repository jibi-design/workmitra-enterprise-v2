// Facade — EmployerRateWorkerModal.tsx

import { useState, useCallback } from "react";
import { ratingStorage } from "../../rating/ratingStorage";
import { submitEmployerShiftRatingSaga } from "../../rating/submitEmployerShiftRatingSaga";
import { submitPlannerEmployerRating } from "../../rating/submitPlannerRatingSaga";
import type { EmployerWorkerTag, RatingDomain, RatingPlannerMeta } from "../../rating/ratingTypes";
import { EmployerRateWorkerModalForm } from "./EmployerRateWorkerModal.form";

type Props = {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
  employerMlId: string;
  workerMlId: string;
  workerName: string;
  domain: RatingDomain;
  /** Required when domain === "planner". */
  plannerMeta?: RatingPlannerMeta;
  editMode?: boolean;
  onSubmitted: () => void;
  onClose: () => void;
};

export function EmployerRateWorkerModal({
  isOpen,
  jobId,
  jobTitle,
  employerMlId,
  workerMlId,
  workerName,
  domain,
  plannerMeta,
  editMode,
  onSubmitted,
  onClose,
}: Props) {
  const existing = editMode
    ? ratingStorage.getEmployerRatingForJob(employerMlId, jobId, workerMlId)
    : null;

  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [tags, setTags] = useState<EmployerWorkerTag[]>(existing?.tags ?? []);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [hireAgain, setHireAgain] = useState<boolean | null>(existing?.hireAgain ?? null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const handleStarsChange = useCallback((v: 1 | 2 | 3 | 4 | 5) => {
    setStars(v);
    setError("");
  }, []);

  const handleSubmit = useCallback(() => {
    if (stars === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (hireAgain === null) {
      setError("Please answer: Would you hire this worker again?");
      return;
    }
    setSubmitting(true);

    if (editMode) {
      const result = ratingStorage.editEmployerRating(employerMlId, jobId, workerMlId, {
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags,
        comment: comment.trim() || undefined,
        hireAgain,
      });
      setSubmitting(false);
      if (!result.success) {
        setError(result.reason);
        return;
      }
      setEditSuccess(true);
      setTimeout(() => onSubmitted(), 1500);
      return;
    }

    if (domain === "planner") {
      if (!plannerMeta) {
        setSubmitting(false);
        setError("Planner rating requires plan entity metadata.");
        return;
      }
      const plannerResult = submitPlannerEmployerRating({
        employerMlId,
        workerMlId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags,
        comment: comment.trim() || undefined,
        hireAgain,
        meta: plannerMeta,
      });
      setSubmitting(false);
      if (!plannerResult.ok) {
        setError(
          plannerResult.reason === "site_manager_as_subject"
            ? "Site manager cannot be the reputation subject. Rate the legal entity."
            : plannerResult.reason === "already_rated"
              ? "Already rated for this plan epoch."
              : "Unable to save planner rating.",
        );
        return;
      }
      onSubmitted();
      return;
    }

    if (domain !== "shift") {
      ratingStorage.saveEmployerRating({
        domain,
        employerMlId,
        workerMlId,
        jobId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags,
        comment: comment.trim() || undefined,
        hireAgain,
      });
      setSubmitting(false);
      onSubmitted();
      return;
    }

    const sagaResult = submitEmployerShiftRatingSaga({
      domain: "shift",
      employerMlId,
      workerMlId,
      jobId,
      stars: stars as 1 | 2 | 3 | 4 | 5,
      tags,
      comment: comment.trim() || undefined,
      hireAgain,
      workerName,
      jobTitle,
    });

    setSubmitting(false);

    if (!sagaResult.ok) {
      if (sagaResult.reason === "already_rated") {
        setError("You already rated this worker for this shift.");
        return;
      }

      setError("Could not save rating. Please try again.");
      return;
    }

    if (!sagaResult.pointsApplied) {
      setError("Rating saved, but worker points could not be updated. Please try again.");
      return;
    }

    onSubmitted();
  }, [
    stars,
    tags,
    comment,
    hireAgain,
    domain,
    plannerMeta,
    employerMlId,
    workerMlId,
    jobId,
    jobTitle,
    workerName,
    editMode,
    onSubmitted,
  ]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        /* Above BottomNav (z-index: 1000) — match .wm-modal-backdrop */
        zIndex: 9000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 18px 12px",
            borderBottom: "1px solid var(--wm-er-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
              {editMode ? "Edit Review" : "Rate Worker"}
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {jobTitle}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--wm-er-muted)",
              fontSize: 18,
              padding: 4,
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {editSuccess ? (
          <div style={{ padding: "32px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Review updated
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 6 }}>
              No further edits allowed.
            </div>
          </div>
        ) : (
          <EmployerRateWorkerModalForm
            editMode={editMode}
            workerName={workerName}
            stars={stars}
            tags={tags}
            comment={comment}
            hireAgain={hireAgain}
            error={error}
            submitting={submitting}
            onStarsChange={handleStarsChange}
            onTagsChange={setTags}
            onCommentChange={setComment}
            onHireAgainChange={setHireAgain}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
