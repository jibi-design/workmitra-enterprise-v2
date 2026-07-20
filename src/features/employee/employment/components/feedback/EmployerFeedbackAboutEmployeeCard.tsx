// App name: Job Mitra
// File name: EmployerFeedbackAboutEmployeeCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\feedback\EmployerFeedbackAboutEmployeeCard.tsx

import { StarDisplay } from "../EmploymentSharedUI";

type Props = {
  rating: number;
  comment?: string;
  companyName: string;
  careerPostId: string;
  jobTitle: string;
  employeeUniqueId: string;
  recordedAt?: number;
};

function formatDateTime(timestamp?: number): string {
  if (!timestamp) return "Not recorded";

  try {
    return new Date(timestamp).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Not recorded";
  }
}

export function EmployerFeedbackAboutEmployeeCard({
  rating,
  comment,
  companyName,
  careerPostId,
  jobTitle,
  employeeUniqueId,
  recordedAt,
}: Props) {
  return (
    <div className="wm-ee-card" style={{ borderLeft: "4px solid #f59e0b" }}>
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #1e293b)" }}>
        Employer&apos;s Feedback About You
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted, #64748b)",
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        Feedback recorded by the employer for this completed Career employment record.
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <StarDisplay rating={rating} />
        <span style={{ fontSize: 13, fontWeight: 850, color: "var(--wm-er-text, #1e293b)" }}>
          {rating}/5
        </span>
      </div>

      {comment && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(15,23,42,0.04)",
            color: "var(--wm-er-muted, #64748b)",
            fontSize: 12,
            lineHeight: 1.5,
            fontWeight: 650,
            fontStyle: "italic",
          }}
        >
          &ldquo;{comment}&rdquo;
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          padding: "10px 11px",
          borderRadius: 13,
          background: "rgba(15,23,42,0.035)",
          border: "1px solid rgba(148,163,184,0.14)",
          display: "grid",
          gap: 7,
        }}
      >
        <ProofRow label="Given by" value={companyName} />
        <ProofRow label="Given to" value={employeeUniqueId} />
        <ProofRow label="Career job" value={jobTitle} />
        <ProofRow label="Career post" value={careerPostId} />
        <ProofRow label="Recorded at" value={formatDateTime(recordedAt)} />
      </div>
    </div>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 10.8, color: "var(--wm-er-muted, #64748b)", fontWeight: 800 }}>
        {label}
      </span>
      <span
        style={{
          maxWidth: "58%",
          textAlign: "right",
          fontSize: 10.9,
          color: "var(--wm-er-text, #1e293b)",
          fontWeight: 900,
          overflowWrap: "anywhere",
        }}
      >
        {value || "Not recorded"}
      </span>
    </div>
  );
}
