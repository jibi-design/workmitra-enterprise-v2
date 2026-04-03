// src/features/employee/workVault/components/VaultPerformanceCard.tsx

import { useState } from "react";
import type { VaultPerformanceRecord } from "../types/vaultProfileTypes";
import { VAULT_ACCENT } from "../constants/vaultConstants";

/* ------------------------------------------------ */
/* Rating bar                                       */
/* ------------------------------------------------ */
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-emp-muted)", width: 12, textAlign: "right" }}>
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
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Metric box                                       */
/* ------------------------------------------------ */
function MetricBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 16, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-emp-muted)", marginTop: 1 }}>
        {label}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Tips logic                                       */
/* ------------------------------------------------ */
function getTips(rating: number | null, totalReviews: number): { primary: string[]; secondary: string[] } {
  const primary: string[] = [];
  const secondary: string[] = [];

  if (totalReviews === 0 || rating === null) {
    primary.push("Complete your first shift or assignment, then ask your employer to rate your work on WorkMitra.");
    primary.push("Every rating builds your professional reputation and opens more opportunities.");
  } else if (rating < 3) {
    primary.push("Ask your employer to update your rating after your next successful assignment.");
    primary.push("More ratings from different employers will balance your overall score.");
    secondary.push("Be punctual and communicate clearly with your employer.");
    secondary.push("Complete all assigned tasks before your shift ends.");
  } else if (rating < 4) {
    primary.push("You are doing well! Ask employers to rate you after every completed job.");
    primary.push("Consistent ratings from multiple employers strengthen your profile.");
    secondary.push("Offer to help beyond your assigned tasks when possible.");
  } else {
    primary.push("Excellent rating! Keep asking employers to rate you after every job to maintain it.");
    primary.push("Your high rating makes you a top candidate. Employers notice this first.");
  }

  secondary.push("Higher ratings help you get shortlisted faster for new jobs.");
  secondary.push("Employers check your rating and reviews before scheduling interviews.");

  return { primary, secondary };
}

/* ------------------------------------------------ */
/* Tips card (employee-only)                        */
/* ------------------------------------------------ */
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill={VAULT_ACCENT}
              d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z"
            />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 900, color: VAULT_ACCENT }}>
            Tips to boost your rating
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            color: VAULT_ACCENT,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            lineHeight: 1,
          }}
        >
          {"\u25BE"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 12px" }}>
          <div style={{ display: "grid", gap: 6 }}>
            {primary.map((tip, i) => (
              <div key={`p-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, color: VAULT_ACCENT, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>
                  {"\u2605"}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text)", lineHeight: 1.5 }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
          {secondary.length > 0 && (
            <div style={{ display: "grid", gap: 5, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${VAULT_ACCENT}12` }}>
              {secondary.map((tip, i) => (
                <div key={`s-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 8, color: "var(--wm-emp-muted)", flexShrink: 0, marginTop: 3 }}>
                    {"\u25CF"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--wm-emp-muted)", lineHeight: 1.5 }}>
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Main component                                   */
/* ------------------------------------------------ */
type Props = {
  data: VaultPerformanceRecord;
  showTips?: boolean;
};

export function VaultPerformanceCard({ data, showTips = false }: Props) {
  const bd = data.ratingBreakdown;
  const ratingDisplay = data.overallRating?.toFixed(1) ?? "0.0";
  const reviewsDisplay = `${data.totalReviews} review${data.totalReviews !== 1 ? "s" : ""}`;
  const attendanceDisplay = data.attendanceRate !== null ? `${data.attendanceRate}%` : "0%";
  const reliabilityDisplay = data.reliabilityScore !== null ? `${data.reliabilityScore}%` : "0%";

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
        {/* Rating section — always visible */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b" }}>
              {ratingDisplay}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--wm-emp-muted)" }}>
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

        {/* Attendance + Reliability — always visible */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--wm-emp-border, rgba(15, 23, 42, 0.08))",
          }}
        >
          <MetricBox value={attendanceDisplay} label="Attendance" color="#16a34a" />
          <MetricBox value={reliabilityDisplay} label="Reliability" color="#3730a3" />
        </div>
      </div>

      {/* Tips — employee view only */}
      {showTips && <TipsSection rating={data.overallRating} totalReviews={data.totalReviews} />}
    </div>
  );
}