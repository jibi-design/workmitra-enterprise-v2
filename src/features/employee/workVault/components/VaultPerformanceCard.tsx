// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultPerformanceCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultPerformanceCard.tsx

import { useState } from "react";
import type { VaultPerformanceRecord } from "../types/vaultProfileTypes";
import { VAULT_ACCENT } from "../constants/vaultConstants";

const MIN_REVIEWS_FOR_VISIBLE_SCORE = 3;

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const isEarly = total < MIN_REVIEWS_FOR_VISIBLE_SCORE;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--wm-emp-muted)",
          width: 12,
          textAlign: "right",
        }}
      >
        {star}
      </span>

      <div
        style={{
          flex: 1,
          height: 5,
          borderRadius: 999,
          background: "rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: "#f59e0b",
            opacity: isEarly ? 0.5 : 1,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function MetricBox({
  value,
  label,
  color,
  isEmpty,
}: {
  value: string;
  label: string;
  color: string;
  isEmpty?: boolean;
}) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div
        style={{
          fontSize: isEmpty ? 12 : 16,
          fontWeight: 900,
          color: isEmpty ? "var(--wm-emp-muted)" : color,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-emp-muted)", marginTop: 1 }}>
        {label}
      </div>
    </div>
  );
}

function getMainRatingLabel(rating: number | null, totalReviews: number): string {
  if (totalReviews === 0 || rating === null) return "No work rating yet";
  if (totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE) return "Rating building";
  return `${rating.toFixed(1)} / 5`;
}

function getConfidenceLabel(totalReviews: number): string {
  if (totalReviews === 0) return "No rating yet";
  if (totalReviews < 3) return "Early rating";
  if (totalReviews <= 5) return "Building reputation";
  if (totalReviews <= 10) return "Trusted record";
  return "Strong work reputation";
}

function getConfidenceBody(rating: number | null, totalReviews: number): string {
  if (totalReviews === 0 || rating === null) {
    return "Completed work ratings will appear here after eligible completed assignments are reviewed.";
  }

  if (totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE) {
    return `${rating.toFixed(1)} / 5 from ${totalReviews} completed work review${
      totalReviews === 1 ? "" : "s"
    }. More completed reviews are needed before showing this as a strong reputation score.`;
  }

  if (totalReviews <= 5) {
    return `Based on ${totalReviews} completed work reviews. This rating is still building reputation.`;
  }

  if (totalReviews <= 10) {
    return `Based on ${totalReviews} completed work reviews. This is a stronger but still growing work record.`;
  }

  return `Based on ${totalReviews} completed work reviews with stronger reputation confidence.`;
}

function getTips(
  rating: number | null,
  totalReviews: number,
): { primary: string[]; secondary: string[] } {
  const primary: string[] = [];
  const secondary: string[] = [];

  if (totalReviews === 0 || rating === null) {
    primary.push("Complete your first eligible assignment and collect a completed work review.");
    primary.push("Your work reputation will start building after employers rate completed work.");
  } else if (totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE) {
    primary.push(
      "Your rating is still building. More completed work reviews are needed before it becomes a strong reputation signal.",
    );
    primary.push("Keep collecting ratings from eligible completed assignments.");
  } else if (rating < 3) {
    primary.push("More completed work reviews can help balance your rating over time.");
    primary.push("Focus on punctuality, clear communication, and completing assigned work.");
  } else if (rating < 4) {
    primary.push(
      "You are building a useful work record. Keep collecting reviews from completed work.",
    );
    primary.push(
      "Consistent positive ratings from different completed assignments strengthen your profile.",
    );
  } else {
    primary.push("Good work rating. Keep building it through repeated completed work reviews.");
    primary.push("A strong reputation needs enough positive reviews and completed work history.");
  }

  secondary.push("One review should not create or destroy your full reputation.");
  secondary.push(
    "Employers can use review count and confidence level to understand your rating fairly.",
  );

  return { primary, secondary };
}

function TipsSection({ rating, totalReviews }: { rating: number | null; totalReviews: number }) {
  const [expanded, setExpanded] = useState(false);
  const { primary, secondary } = getTips(rating, totalReviews);

  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 10,
        border: `1px solid ${VAULT_ACCENT}18`,
        background: `${VAULT_ACCENT}06`,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%",
          padding: "10px 14px",
          border: 0,
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 900, color: VAULT_ACCENT }}>
          Tips to improve your work reputation
        </span>

        <span style={{ fontSize: 11, color: VAULT_ACCENT, fontWeight: 900 }}>
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 12px" }}>
          <div style={{ display: "grid", gap: 6 }}>
            {primary.map((tip, index) => (
              <div
                key={`primary-${index}`}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--wm-emp-text)",
                  lineHeight: 1.5,
                }}
              >
                {tip}
              </div>
            ))}
          </div>

          {secondary.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: 5,
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid ${VAULT_ACCENT}12`,
              }}
            >
              {secondary.map((tip, index) => (
                <div
                  key={`secondary-${index}`}
                  style={{ fontSize: 11, color: "var(--wm-emp-muted)", lineHeight: 1.5 }}
                >
                  {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Props = {
  data: VaultPerformanceRecord;
  showTips?: boolean;
};

export function VaultPerformanceCard({ data, showTips = false }: Props) {
  const bd = data.ratingBreakdown;
  const ratingDisplay = getMainRatingLabel(data.overallRating, data.totalReviews);
  const reviewsDisplay = `${data.totalReviews} completed work review${data.totalReviews !== 1 ? "s" : ""}`;
  const confidenceLabel = getConfidenceLabel(data.totalReviews);
  const confidenceBody = getConfidenceBody(data.overallRating, data.totalReviews);

  const hasAttendanceData = data.attendanceRate !== null && data.attendanceRate > 0;
  const hasReliabilityData = data.reliabilityScore !== null && data.reliabilityScore > 0;
  const attendanceDisplay = hasAttendanceData ? `${data.attendanceRate}%` : "Not enough data";
  const reliabilityDisplay = hasReliabilityData ? `${data.reliabilityScore}%` : "Not enough data";
  const showOperationalMetrics = hasAttendanceData || hasReliabilityData;

  return (
    <div>
      <div
        style={{
          padding: "14px 16px",
          borderRadius: 12,
          background: "var(--wm-emp-bg)",
          border: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-emp-text)" }}>
            Work reputation from completed assignments
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "var(--wm-emp-muted)",
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            Based on eligible completed work ratings. Career feedback tags stay separate as approved
            work feedback.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "center", flexShrink: 0, minWidth: 98 }}>
            <div
              style={{
                fontSize: data.totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE ? 15 : 24,
                fontWeight: 950,
                color: data.totalReviews < MIN_REVIEWS_FOR_VISIBLE_SCORE ? "#b45309" : "#f59e0b",
                lineHeight: 1.12,
              }}
            >
              {ratingDisplay}
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 10,
                fontWeight: 700,
                color: "var(--wm-emp-muted)",
                lineHeight: 1.35,
              }}
            >
              {reviewsDisplay}
            </div>
          </div>

          <div style={{ flex: 1, display: "grid", gap: 4 }}>
            <RatingBar star={5} count={bd.star5} total={data.totalReviews} />
            <RatingBar star={4} count={bd.star4} total={data.totalReviews} />
            <RatingBar star={3} count={bd.star3} total={data.totalReviews} />
            <RatingBar star={2} count={bd.star2} total={data.totalReviews} />
            <RatingBar star={1} count={bd.star1} total={data.totalReviews} />
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "9px 10px",
            borderRadius: 12,
            border: "1px solid rgba(245,158,11,0.18)",
            background: "rgba(245,158,11,0.07)",
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 900, color: "#b45309" }}>{confidenceLabel}</div>

          <div
            style={{
              marginTop: 3,
              fontSize: 10.8,
              fontWeight: 700,
              color: "var(--wm-emp-muted)",
              lineHeight: 1.45,
            }}
          >
            {confidenceBody}
          </div>
        </div>

        {showOperationalMetrics && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
            }}
          >
            <MetricBox
              value={attendanceDisplay}
              label="Attendance"
              color="#16a34a"
              isEmpty={!hasAttendanceData}
            />
            <MetricBox
              value={reliabilityDisplay}
              label="Reliability"
              color="#3730a3"
              isEmpty={!hasReliabilityData}
            />
          </div>
        )}
      </div>

      {showTips && <TipsSection rating={data.overallRating} totalReviews={data.totalReviews} />}
    </div>
  );
}
