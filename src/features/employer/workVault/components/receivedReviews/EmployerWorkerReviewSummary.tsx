// App name: Job Mitra
// File name: EmployerWorkerReviewSummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\receivedReviews\EmployerWorkerReviewSummary.tsx

import type { EmployerWorkerReviewSummary as Summary } from "../../types/employerVaultReview.types";

type EmployerWorkerReviewSummaryProps = {
  summary: Summary;
};

const VAULT_PURPLE = "#7c3aed";
const SHIFT_GREEN = "#16a34a";

export function EmployerWorkerReviewSummary({ summary }: EmployerWorkerReviewSummaryProps) {
  const ratingPercent = Math.max(0, Math.min(100, (summary.averageStars / 5) * 100));
  const workAgainPercent =
    summary.workAgainTotal > 0
      ? Math.round((summary.workAgainCount / summary.workAgainTotal) * 100)
      : 0;

  return (
    <section
      style={{
        padding: 14,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(124,58,237,0.16)",
        background:
          "radial-gradient(circle at top right, rgba(124,58,237,0.13), transparent 34%), linear-gradient(135deg, rgba(124,58,237,0.09), rgba(255,255,255,0.99) 52%, rgba(240,253,244,0.62))",
        boxShadow: "0 14px 32px rgba(15,23,42,0.055)",
        display: "grid",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
            Employer Rating Summary
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
            Based on local completed shift work and local worker reviews only.
          </div>
        </div>

        <div
          style={{
            minWidth: 74,
            padding: "10px 10px",
            borderRadius: "var(--wm-radius-employee-card)",
            textAlign: "center",
            background: "rgba(255,255,255,0.86)",
            border: "1px solid rgba(124,58,237,0.16)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 950, color: VAULT_PURPLE, lineHeight: 1 }}>
            {summary.averageStars > 0 ? summary.averageStars : "0"}
          </div>

          <div style={{ marginTop: 4, fontSize: 10, fontWeight: 900, color: "var(--wm-er-muted)" }}>
            out of 5
          </div>
        </div>
      </div>

      <VisualMeter
        label="Rating strength"
        value={`${Math.round(ratingPercent)}%`}
        percent={ratingPercent}
        accent={VAULT_PURPLE}
      />

      <VisualMeter
        label="Workers would work again"
        value={`${workAgainPercent}%`}
        percent={workAgainPercent}
        accent={SHIFT_GREEN}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        <SummaryTile label="Reviews" value={String(summary.totalReviews)} accent={VAULT_PURPLE} />
        <SummaryTile
          label="Positive"
          value={`${summary.workAgainCount}/${summary.workAgainTotal}`}
          accent={SHIFT_GREEN}
        />
        <SummaryTile label="Signals" value={String(summary.topTags.length)} accent={VAULT_PURPLE} />
      </div>

      {summary.topTags.length > 0 && (
        <div
          style={{
            padding: "10px 11px",
            borderRadius: "var(--wm-radius-chip)",
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
            Top worker feedback
          </div>

          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {summary.topTags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--wm-radius-pill)",
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.14)",
                  color: VAULT_PURPLE,
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

function VisualMeter({
  label,
  value,
  percent,
  accent,
}: {
  label: string;
  value: string;
  percent: number;
  accent: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 950,
            color: "var(--wm-er-muted)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 11, fontWeight: 950, color: accent }}>{value}</div>
      </div>

      <div
        style={{
          marginTop: 6,
          height: 8,
          borderRadius: "var(--wm-radius-pill)",
          background: "rgba(226,232,240,0.9)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "var(--wm-radius-pill)",
            background: accent,
          }}
        />
      </div>
    </div>
  );
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        padding: "9px 8px",
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(255,255,255,0.9)",
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

      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 950, color: accent, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
}
