// src/shared/rating/components/RatingDisplayCard.tsx
//
// Reusable: displays a submitted rating with stars, tags, comment,
// "Edited" badge, and Edit button (within 48hr + 0 edits).
// Used in Shift workspace + Career workspace completed states.

import { useState } from "react";
import { ratingStorage } from "../ratingStorage";
import { EditedBadge } from "../../components/rating/EditedBadge";
import { EmployerRateWorkerModal } from "../../components/rating/EmployerRateWorkerModal";
import { WorkerRateEmployerModal } from "../../components/rating/WorkerRateEmployerModal";

import type { RatingDomain } from "../ratingTypes";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  jobId: string;
  jobTitle: string;
  raterMlId: string;
  targetMlId: string;
  targetName: string;
  ratingType: "employer" | "worker";
  domain: RatingDomain;
};

/* ------------------------------------------------ */
/* Star display (read-only)                         */
/* ------------------------------------------------ */
function StarRow({ count }: { count: number }) {
  return (
    <span style={{ fontSize: 18, letterSpacing: 2 }} aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= count ? "#f59e0b" : "#d1d5db" }}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function RatingDisplayCard({
  jobId,
  jobTitle,
  raterMlId,
  targetMlId,
  targetName,
  ratingType,
  domain,
}: Props) {
  const fetchRating = () =>
    ratingType === "employer"
      ? ratingStorage.getEmployerRatingForJob(raterMlId, jobId, targetMlId)
      : ratingStorage.getWorkerRatingForJob(raterMlId, jobId, targetMlId);

  const [rating, setRating] = useState(fetchRating);
  const [editOpen, setEditOpen] = useState(false);

  if (!rating) return null;

  const canEdit =
    ratingType === "employer"
      ? ratingStorage.canEditEmployerRating(raterMlId, jobId, targetMlId)
      : ratingStorage.canEditWorkerRating(raterMlId, jobId, targetMlId);

  function handleEditDone() {
    setEditOpen(false);
    setRating(fetchRating());
  }

  const dateStr = new Date(rating.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const accentColor =
    domain === "career"
      ? "var(--wm-er-accent-career, #1d4ed8)"
      : domain === "planner"
        ? "var(--wm-planner-accent, #0891b2)"
        : "var(--wm-er-accent-shift, #16a34a)";

  const cardBg =
    domain === "career"
      ? "rgba(29,78,216,0.04)"
      : domain === "planner"
        ? "rgba(8,145,178,0.05)"
        : "rgba(22,163,74,0.04)";

  const cardBorder =
    domain === "career"
      ? "1px solid rgba(29,78,216,0.15)"
      : domain === "planner"
        ? "1px solid rgba(8,145,178,0.2)"
        : "1px solid rgba(22,163,74,0.15)";

  return (
    <>
      <div
        style={{
          marginTop: 10,
          padding: "14px 16px",
          borderRadius: 14,
          background: cardBg,
          border: cardBorder,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
            Your review of {targetName}
          </div>
          <EditedBadge editedAt={rating.editedAt} />
        </div>

        {/* Stars */}
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <StarRow count={rating.stars} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
            {rating.stars}/5
          </span>
        </div>

        {/* Tags */}
        {rating.tags.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {rating.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background:
                    domain === "career"
                      ? "rgba(29,78,216,0.08)"
                      : domain === "planner"
                        ? "rgba(8,145,178,0.1)"
                        : "rgba(22,163,74,0.08)",
                  color: accentColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comment */}
        {rating.comment && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "var(--wm-er-muted)",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            &ldquo;{rating.comment}&rdquo;
          </div>
        )}

        {/* Footer: timestamp + edit button */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>Rated on {dateStr}</div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: 8,
                border: `1px solid ${accentColor}`,
                background: "transparent",
                color: accentColor,
                cursor: "pointer",
              }}
            >
              Edit review
            </button>
          )}
        </div>

        {/* Edit hint */}
        {canEdit && (
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
            You can edit this review once within 24 hours
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editOpen && ratingType === "employer" && (
        <EmployerRateWorkerModal
          isOpen
          editMode
          jobId={jobId}
          jobTitle={jobTitle}
          employerMlId={raterMlId}
          workerMlId={targetMlId}
          workerName={targetName}
          domain={domain}
          onSubmitted={handleEditDone}
          onClose={() => setEditOpen(false)}
        />
      )}
      {editOpen && ratingType === "worker" && (
        <WorkerRateEmployerModal
          isOpen
          editMode
          jobId={jobId}
          jobTitle={jobTitle}
          workerMlId={raterMlId}
          employerMlId={targetMlId}
          companyName={targetName}
          domain={domain}
          onSubmitted={handleEditDone}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
