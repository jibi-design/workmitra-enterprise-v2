// src/features/employer/hrManagement/components/PerformanceReviewSection.tsx
//
// Performance review section in employer HR detail page.
// Lists all reviews + create button + average rating.

import { useState } from "react";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { PerformanceReviewRecord } from "../types/performanceReview.types";
import { REVIEW_TYPE_LABELS, RATING_LABELS, RATING_COLORS } from "../types/performanceReview.types";
import { usePerformanceReviews } from "../helpers/performanceReviewSubscription";
import { performanceReviewStorage } from "../storage/performanceReview.storage";
import { PerformanceReviewModal } from "./PerformanceReviewModal";

type Props = {
  record: HRCandidateRecord;
};

export function PerformanceReviewSection({ record }: Props) {
  const [showModal, setShowModal] = useState(false);
  const reviews = usePerformanceReviews(record.id);
  const avgRating = performanceReviewStorage.getAverageRating(record.id);

  const fmtDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1px solid var(--wm-er-border, #e5e7eb)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
            Performance Reviews
          </div>
          {avgRating !== null && (
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
              Average: <strong style={{ color: "var(--wm-er-text)" }}>{avgRating}/5</strong> · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <button
          className="wm-primarybtn"
          type="button"
          onClick={() => setShowModal(true)}
          style={{ fontSize: 11, padding: "6px 14px" }}
        >
          New Review
        </button>
      </div>

      {/* Review Cards */}
      {reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} fmtDate={fmtDate} />
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--wm-er-muted)", fontSize: 13 }}>
          No performance reviews yet.
        </div>
      )}

      <PerformanceReviewModal
        open={showModal}
        onClose={() => setShowModal(false)}
        record={record}
      />
    </div>
  );
}

/* ── Review Card ── */

function ReviewCard({
  review,
  fmtDate,
}: {
  review: PerformanceReviewRecord;
  fmtDate: (ts: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const ratingColor = RATING_COLORS[review.rating];

  const statusBadge = (() => {
    switch (review.status) {
      case "acknowledged":
        return { label: "Acknowledged", bg: "rgba(22,163,74,0.08)", color: "#16a34a" };
      case "disputed":
        return { label: "Disputed", bg: "rgba(220,38,38,0.08)", color: "#dc2626" };
      default:
        return { label: "Sent", bg: "rgba(59,130,246,0.08)", color: "#3b82f6" };
    }
  })();

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
        background: "var(--wm-er-bg, #f9fafb)",
        cursor: "pointer",
      }}
      onClick={() => setExpanded((p) => !p)}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>
            {REVIEW_TYPE_LABELS[review.reviewType]}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {fmtDate(review.periodFrom)} — {fmtDate(review.periodTo)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ display: "flex", gap: 1 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{ fontSize: 12, color: s <= review.rating ? ratingColor : "#e5e7eb" }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: ratingColor }}>{review.rating}</span>
          </div>
          {/* Status */}
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 6,
              background: statusBadge.bg,
              color: statusBadge.color,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <DetailBlock label="Rating" value={`${review.rating}/5 — ${RATING_LABELS[review.rating]}`} color={ratingColor} />
          <DetailBlock label="Strengths" value={review.strengths} />
          {review.improvements && <DetailBlock label="Areas for Improvement" value={review.improvements} />}
          {review.goalsNextPeriod && <DetailBlock label="Goals for Next Period" value={review.goalsNextPeriod} />}
          <DetailBlock label="Overall Comments" value={review.overallComments} />
          {review.disputeReason && (
            <DetailBlock label="Dispute Reason" value={review.disputeReason} color="#dc2626" />
          )}
          <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
            Sent: {fmtDate(review.sentAt)}
          </div>
        </div>
      )}

      {/* Expand hint */}
      <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "var(--wm-er-muted)" }}>
        {expanded ? "▲ Collapse" : "▼ Tap to view details"}
      </div>
    </div>
  );
}

function DetailBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: 8, borderRadius: 6, background: "#fff" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-er-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: color || "var(--wm-er-text)", marginTop: 2, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}