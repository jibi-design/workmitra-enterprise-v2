// Facade — WorkerRateEmployerModal.tsx

import { useState, useCallback } from "react";
import { ratingStorage } from "../../rating/ratingStorage";
import { submitShiftRatingSaga } from "../../rating/submitShiftRatingSaga";
import { submitPlannerWorkerRating } from "../../rating/submitPlannerRatingSaga";
import type { RatingDomain, RatingPlannerMeta, WorkerEmployerTag } from "../../rating/ratingTypes";
import { WorkerRateEmployerModalForm } from "./WorkerRateEmployerModal.form";
import { employmentStorage } from "../../employment/employmentStorage";
import { syncVaultCareerRatingsForPost } from "../../../features/shared/workVault/vaultPublic";

type Props = {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
  workerMlId: string;
  employerMlId: string;
  companyName: string;
  domain: RatingDomain;
  /** Required when domain === "planner". */
  plannerMeta?: RatingPlannerMeta;
  editMode?: boolean;
  workspaceId?: string;
  appId?: string;
  onSubmitted: () => void;
  onClose: () => void;
};

export function WorkerRateEmployerModal({
  isOpen,
  jobId,
  jobTitle,
  workerMlId,
  employerMlId,
  companyName,
  domain,
  plannerMeta,
  editMode,
  workspaceId,
  appId,
  onSubmitted,
  onClose,
}: Props) {
  const existing = editMode
    ? ratingStorage.getWorkerRatingForJob(workerMlId, jobId, employerMlId)
    : null;

  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [tags, setTags] = useState<WorkerEmployerTag[]>(existing?.tags ?? []);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [workAgain, setWorkAgain] = useState<boolean | null>(existing?.workAgain ?? null);
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
    if (workAgain === null) {
      setError("Please answer: Would you work here again?");
      return;
    }
    setSubmitting(true);

    if (editMode) {
      const result = ratingStorage.editWorkerRating(workerMlId, jobId, employerMlId, {
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags,
        comment: comment.trim() || undefined,
        workAgain,
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

    if (domain === "shift") {
      const sagaResult = submitShiftRatingSaga({
        domain,
        workerMlId,
        employerMlId,
        jobId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags,
        comment: comment.trim() || undefined,
        workAgain,
        workspaceId,
        appId,
      });

      if (!sagaResult.ok) {
        setSubmitting(false);
        if (sagaResult.reason === "already_rated") {
          setError("You have already submitted a rating for this work record.");
        } else {
          setError("Could not save your rating. Please try again.");
        }
        return;
      }

      void sagaResult.persist.finally(() => {
        setSubmitting(false);
        onSubmitted();
      });
      return;
    }

    if (domain === "planner") {
      if (!plannerMeta) {
        setSubmitting(false);
        setError("Planner rating requires plan entity metadata.");
        return;
      }
      const plannerResult = submitPlannerWorkerRating({
        workerMlId,
        employerMlId,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        tags,
        comment: comment.trim() || undefined,
        workAgain,
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

    ratingStorage.saveWorkerRating({
      domain,
      workerMlId,
      employerMlId,
      jobId,
      stars: stars as 1 | 2 | 3 | 4 | 5,
      tags,
      comment: comment.trim() || undefined,
      workAgain,
    });

    if (domain === "career") {
      const record = employmentStorage.getByPostId(jobId);
      if (record) syncVaultCareerRatingsForPost(jobId, record);
    }

    setSubmitting(false);
    onSubmitted();
  }, [
    stars,
    tags,
    comment,
    workAgain,
    domain,
    plannerMeta,
    workerMlId,
    employerMlId,
    jobId,
    editMode,
    onSubmitted,
    workspaceId,
    appId,
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
              {editMode ? "Edit Review" : "Rate Employer"}
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
          <WorkerRateEmployerModalForm
            editMode={editMode}
            companyName={companyName}
            stars={stars}
            tags={tags}
            comment={comment}
            workAgain={workAgain}
            error={error}
            submitting={submitting}
            onStarsChange={handleStarsChange}
            onTagsChange={setTags}
            onCommentChange={setComment}
            onWorkAgainChange={setWorkAgain}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
