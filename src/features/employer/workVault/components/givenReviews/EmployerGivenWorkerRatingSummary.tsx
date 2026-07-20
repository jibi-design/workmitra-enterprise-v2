// App name: Job Mitra
// File name: EmployerGivenWorkerRatingSummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\givenReviews\EmployerGivenWorkerRatingSummary.tsx

import type { EmployerGivenWorkerRatingSummary as Summary } from "../../types/employerVaultReview.types";

type EmployerGivenWorkerRatingSummaryProps = {
  summary: Summary;
};

const SHIFT_GREEN = "#16a34a";

export function EmployerGivenWorkerRatingSummary({
  summary,
}: EmployerGivenWorkerRatingSummaryProps) {
  const hireAgainPercent =
    summary.hireAgainTotal > 0
      ? Math.round((summary.hireAgainCount / summary.hireAgainTotal) * 100)
      : 0;

  return (
    <section
      style={{
        padding: 14,
        borderRadius: 22,
        border: "1px solid rgba(22,163,74,0.15)",
        background:
          "linear-gradient(135deg, rgba(22,163,74,0.09), rgba(255,255,255,0.98) 54%, rgba(240,253,244,0.7))",
        boxShadow: "0 14px 32px rgba(15,23,42,0.055)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)" }}>
        Ratings Given to Workers
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          color: "var(--wm-er-muted)",
          fontWeight: 750,
          lineHeight: 1.45,
        }}
      >
        Ratings and feedback you gave after completed shift work.
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <SummaryTile label="Ratings" value={String(summary.totalRatings)} />
        <SummaryTile
          label="Average"
          value={summary.averageStars > 0 ? `${summary.averageStars}/5` : "0/5"}
        />
        <SummaryTile label="Hire again" value={`${hireAgainPercent}%`} />
      </div>

      {summary.topTags.length > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 11px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(226,232,240,0.9)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 950,
              color: "var(--wm-er-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.35,
            }}
          >
            Top worker tags
          </div>

          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {summary.topTags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: "rgba(22,163,74,0.08)",
                  border: "1px solid rgba(22,163,74,0.14)",
                  color: SHIFT_GREEN,
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 8px",
        borderRadius: 15,
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(226,232,240,0.92)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.28,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 15,
          fontWeight: 950,
          color: SHIFT_GREEN,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
