// src/features/employee/employment/components/EmploymentRatingSection.tsx
//
// Employer's rating of employee + employee rates employer.
// Domain: Manager Console Ocean Blue for Career employment.

import { useState } from "react";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";
import { employmentLifecycleStorage } from "../storage/employmentLifecycle.storage";
import { StarDisplay } from "./EmploymentSharedUI";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  record: EmploymentRecord;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmploymentRatingSection({ record }: Props) {
  const [pendingRating, setPendingRating] = useState(0);
  const [pendingComment, setPendingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const isExited = record.status === "exited";
  const needsEmployeeRating = isExited && typeof record.employeeRating !== "number" && !ratingSubmitted;
  const hasEmployeeRating = isExited && (typeof record.employeeRating === "number" || ratingSubmitted);

  function handleRatingSubmit() {
    if (pendingRating === 0) return;
    employmentLifecycleStorage.update(record.id, {
      employeeRating: pendingRating,
      employeeComment: pendingComment.trim() || undefined,
    });
    setRatingSubmitted(true);
  }

  return (
    <>
      {/* Employer's rating of you */}
      {isExited && typeof record.employerRating === "number" && (
        <div className="wm-ee-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text, #1e293b)", marginBottom: 8 }}>
            Employer&rsquo;s Rating
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <StarDisplay rating={record.employerRating} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text, #1e293b)" }}>
              {record.employerRating}/5
            </span>
          </div>
          {record.employerComment && (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 4, fontStyle: "italic" }}>
              &ldquo;{record.employerComment}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Rate your employer — mandatory after exit */}
      {needsEmployeeRating && (
        <div className="wm-ee-card" style={{ borderLeft: "4px solid var(--wm-er-accent-career, #1d4ed8)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-accent-career, #1d4ed8)", marginBottom: 4 }}>
            Rate Your Employer
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginBottom: 12, lineHeight: 1.5 }}>
            Your rating helps other employees make informed decisions. This cannot be changed after submission.
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setPendingRating(star)}
                aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                style={{
                  fontSize: 28, background: "none", border: "none",
                  cursor: "pointer", padding: 2,
                  color: star <= pendingRating ? "#f59e0b" : "#d1d5db",
                }}
              >
                &#9733;
              </button>
            ))}
          </div>
          <textarea
            value={pendingComment}
            onChange={(e) => setPendingComment(e.target.value)}
            placeholder="Comment (optional, max 100 characters)"
            maxLength={100}
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.12)", fontSize: 12,
              fontWeight: 600, color: "var(--wm-er-text, #1e293b)",
              background: "var(--wm-er-card, #f8fafc)",
              outline: "none", resize: "vertical", boxSizing: "border-box",
            }}
          />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleRatingSubmit}
              disabled={pendingRating === 0}
              style={{
                padding: "10px 20px", borderRadius: 10, border: "none",
                background: pendingRating > 0
                  ? "var(--wm-er-accent-career, #1d4ed8)"
                  : "#e5e7eb",
                color: pendingRating > 0 ? "#fff" : "#9ca3af",
                fontWeight: 600, fontSize: 13,
                cursor: pendingRating > 0 ? "pointer" : "not-allowed",
              }}
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {/* Rating submitted */}
      {hasEmployeeRating && (
        <div className="wm-ee-card" style={{ borderLeft: "4px solid var(--wm-er-accent-career, #1d4ed8)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--wm-er-text, #1e293b)", marginBottom: 8 }}>
            Your Rating of Employer
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <StarDisplay rating={ratingSubmitted ? pendingRating : (record.employeeRating ?? 0)} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text, #1e293b)" }}>
              {ratingSubmitted ? pendingRating : (record.employeeRating ?? 0)}/5
            </span>
          </div>
          {(ratingSubmitted ? pendingComment.trim() : record.employeeComment) && (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 4, fontStyle: "italic" }}>
              &ldquo;{ratingSubmitted ? pendingComment.trim() : record.employeeComment}&rdquo;
            </div>
          )}
          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 8 }}>
            Rating submitted &mdash; cannot be changed
          </div>
        </div>
      )}
    </>
  );
}