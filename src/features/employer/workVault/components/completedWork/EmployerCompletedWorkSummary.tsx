// App name: Job Mitra
// File name: EmployerCompletedWorkSummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workVault\components\completedWork\EmployerCompletedWorkSummary.tsx

import type { EmployerCompletedWorkSummary as Summary } from "../../types/employerVaultReview.types";

type EmployerCompletedWorkSummaryProps = {
  summary: Summary;
  compactTitle?: boolean;
};

const SHIFT_GREEN = "#16a34a";

export function EmployerCompletedWorkSummary({
  summary,
  compactTitle = false,
}: EmployerCompletedWorkSummaryProps) {
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
        {compactTitle ? "Completion summary" : "Completed Work History"}
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
        Completed shift groups and their review status.
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <SummaryTile label="Completed" value={String(summary.totalCompleted)} />
        <SummaryTile label="Rated" value={String(summary.employerRatedCount)} />
        <SummaryTile label="Reviews" value={String(summary.workerReviewedCount)} />
      </div>

      {summary.pendingEmployerRatingCount > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "9px 10px",
            borderRadius: 15,
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(226,232,240,0.9)",
            color: "var(--wm-er-muted)",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          {summary.pendingEmployerRatingCount} completed shift
          {summary.pendingEmployerRatingCount !== 1 ? "s" : ""} still need
          {summary.pendingEmployerRatingCount === 1 ? "s" : ""} employer rating.
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
