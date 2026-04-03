// src/features/employee/employment/components/EmployeePerformanceReviewSection.tsx
//
// Performance reviews list with acknowledge/dispute actions.

import { useState } from "react";
import { usePerformanceReviews } from "../../../employer/hrManagement/helpers/performanceReviewSubscription";
import { performanceReviewStorage } from "../../../employer/hrManagement/storage/performanceReview.storage";
import { REVIEW_TYPE_LABELS, RATING_LABELS, RATING_COLORS } from "../../../employer/hrManagement/types/performanceReview.types";
import type { ReviewRating } from "../../../employer/hrManagement/types/performanceReview.types";

type Props = {
  hrCandidateId: string;
};

function EmpRevBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: 8, borderRadius: 6, background: "#fff" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--wm-emp-muted, var(--wm-er-muted))", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: color || "var(--wm-emp-text, var(--wm-er-text))", marginTop: 2, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

function fmtDate(ts: number): string {
  return ts
    ? new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
}

export function EmployeePerformanceReviewSection({ hrCandidateId }: Props) {
  const reviews = usePerformanceReviews(hrCandidateId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  if (reviews.length === 0) return null;

  const avgRating = performanceReviewStorage.getAverageRating(hrCandidateId);

  const handleAcknowledge = (id: string) => {
    performanceReviewStorage.acknowledgeReview(id);
  };

  const handleDispute = (id: string) => {
    if (!disputeReason.trim()) return;
    performanceReviewStorage.disputeReview(id, disputeReason.trim());
    setDisputeId(null);
    setDisputeReason("");
  };

  return (
    <div className="wm-ee-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
          Performance Reviews
        </div>
        {avgRating !== null && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
            Avg: {avgRating}/5
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.map((rev) => {
          const isExpanded = expandedId === rev.id;
          const rColor = RATING_COLORS[rev.rating as ReviewRating];
          const statusBadge = rev.status === "acknowledged"
            ? { label: "Acknowledged", bg: "rgba(22,163,74,0.08)", color: "#16a34a" }
            : rev.status === "disputed"
              ? { label: "Disputed", bg: "rgba(220,38,38,0.08)", color: "#dc2626" }
              : { label: "New", bg: "rgba(59,130,246,0.08)", color: "#3b82f6" };

          return (
            <div
              key={rev.id}
              style={{
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${rev.status === "sent" ? "rgba(59,130,246,0.3)" : "var(--wm-er-border, #e5e7eb)"}`,
                background: rev.status === "sent" ? "rgba(59,130,246,0.03)" : "var(--wm-emp-surface, #f8fafc)",
              }}
            >
              <div
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedId(isExpanded ? null : rev.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-emp-text, var(--wm-er-text))" }}>
                      {REVIEW_TYPE_LABELS[rev.reviewType]}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--wm-emp-muted, var(--wm-er-muted))", marginTop: 2 }}>
                      {fmtDate(rev.periodFrom)} — {fmtDate(rev.periodTo)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 1 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} style={{ fontSize: 12, color: s <= rev.rating ? rColor : "#e5e7eb" }}>★</span>
                      ))}
                    </div>
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
                <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "var(--wm-emp-muted, var(--wm-er-muted))" }}>
                  {isExpanded ? "Collapse" : "Tap to view details"}
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <EmpRevBlock label="Rating" value={`${rev.rating}/5 — ${RATING_LABELS[rev.rating as ReviewRating]}`} color={rColor} />
                  <EmpRevBlock label="Strengths" value={rev.strengths} />
                  {rev.improvements && <EmpRevBlock label="Areas for Improvement" value={rev.improvements} />}
                  {rev.goalsNextPeriod && <EmpRevBlock label="Goals for Next Period" value={rev.goalsNextPeriod} />}
                  <EmpRevBlock label="Overall Comments" value={rev.overallComments} />
                  {rev.disputeReason && <EmpRevBlock label="Your Dispute Reason" value={rev.disputeReason} color="#dc2626" />}

                  {rev.status === "sent" && disputeId !== rev.id && (
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(rev.id)}
                        style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                      >
                        Acknowledge
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisputeId(rev.id)}
                        style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dc2626", background: "rgba(220,38,38,0.06)", color: "#dc2626", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                      >
                        Raise Dispute
                      </button>
                    </div>
                  )}

                  {disputeId === rev.id && (
                    <div style={{ marginTop: 4 }}>
                      <textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Explain why you disagree with this review..."
                        rows={3}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(220,38,38,0.3)", fontSize: 12, fontWeight: 600, color: "var(--wm-emp-text, var(--wm-er-text))", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => { setDisputeId(null); setDisputeReason(""); }}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--wm-er-border, #e5e7eb)", background: "#fff", color: "var(--wm-emp-text, var(--wm-er-text))", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDispute(rev.id)}
                          disabled={!disputeReason.trim()}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", background: disputeReason.trim() ? "#dc2626" : "#e5e7eb", color: disputeReason.trim() ? "#fff" : "#9ca3af", fontWeight: 800, fontSize: 12, cursor: disputeReason.trim() ? "pointer" : "not-allowed" }}
                        >
                          Submit Dispute
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}