// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultPerformanceCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultPerformanceCard.tsx

import type { VaultPerformanceRecord } from "../types/vaultProfileTypes";
import {
  getConfidenceBody,
  getConfidenceLabel,
  getMainRatingLabel,
  MIN_REVIEWS_FOR_VISIBLE_SCORE,
} from "./VaultPerformanceCard.helpers";
import { MetricBox, RatingBar, TipsSection } from "./VaultPerformanceCard.parts";

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
