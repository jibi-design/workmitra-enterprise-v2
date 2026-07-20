// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkFeedbackSummaryCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\employmentFeedback\WorkFeedbackSummaryCard.tsx

import {
  getCareerEmploymentFeedbackTagLabel,
  type CareerEmploymentFeedbackTag,
} from "./careerEmploymentFeedback.storage";

type FeedbackDisplayMode = "protectedRecord" | "publicReference";

type Props = {
  title?: string;
  subtitle?: string;
  tags: readonly CareerEmploymentFeedbackTag[];
  companyName?: string;
  jobTitle?: string;
  givenTo?: string;
  recordedAt?: number;
  displayMode?: FeedbackDisplayMode;
};

const CAREER = "var(--wm-er-accent-career, #4f46e5)";
const TEXT = "var(--wm-er-text, #111827)";
const MUTED = "var(--wm-er-muted, #64748b)";

function getDefaultSubtitle(displayMode: FeedbackDisplayMode): string {
  if (displayMode === "protectedRecord") {
    return "Approved structured work feedback from this completed Career employment record.";
  }

  return "Approved structured feedback from completed Career employment records. Private employer notes are not shown.";
}

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

export function WorkFeedbackSummaryCard({
  title = "Approved Work Feedback From Employer",
  subtitle,
  tags,
  companyName,
  jobTitle,
  givenTo,
  recordedAt,
  displayMode = "publicReference",
}: Props) {
  if (tags.length === 0) return null;

  const finalSubtitle = subtitle ?? getDefaultSubtitle(displayMode);
  const showProtectedProof = displayMode === "protectedRecord";

  return (
    <section
      className="wm-ee-card"
      style={{
        borderLeft: `4px solid ${CAREER}`,
        background:
          "radial-gradient(circle at 96% 0%, rgba(79,70,229,0.08), transparent 34%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.96))",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 950, color: TEXT }}>{title}</div>

      <div style={{ marginTop: 5, fontSize: 11.8, color: MUTED, lineHeight: 1.5, fontWeight: 720 }}>
        {finalSubtitle}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 7, flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(79,70,229,0.08)",
              border: "1px solid rgba(79,70,229,0.12)",
              color: CAREER,
              fontSize: 11.4,
              fontWeight: 900,
            }}
          >
            {getCareerEmploymentFeedbackTagLabel(tag)}
          </span>
        ))}
      </div>

      {showProtectedProof && (
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
          <ProofRow label="Given by" value={companyName || "Employer record"} />
          <ProofRow label="Given to" value={givenTo || "Employee ID not available"} />
          <ProofRow label="Career job" value={jobTitle || "Not recorded"} />
          <ProofRow label="Recorded at" value={formatDateTime(recordedAt)} />
          <ProofRow label="Record status" value="Protected work feedback" />
        </div>
      )}

      {displayMode === "publicReference" && (
        <div
          style={{ marginTop: 10, fontSize: 10.8, color: MUTED, lineHeight: 1.45, fontWeight: 720 }}
        >
          Private employer notes are not shown in public/reference views.
        </div>
      )}
    </section>
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
      <span style={{ fontSize: 10.8, color: MUTED, fontWeight: 800 }}>{label}</span>
      <span
        style={{
          maxWidth: "58%",
          textAlign: "right",
          fontSize: 10.9,
          color: TEXT,
          fontWeight: 900,
          overflowWrap: "anywhere",
        }}
      >
        {value || "Not recorded"}
      </span>
    </div>
  );
}
