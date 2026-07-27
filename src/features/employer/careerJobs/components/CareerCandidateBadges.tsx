// App name: Job Mitra
// File name: CareerCandidateBadges.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCandidateBadges.tsx

import { useState } from "react";

export function CareerStageBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 9.8,
        fontWeight: 900,
        padding: "3px 8px",
        borderRadius: "var(--wm-radius-pill)",
        background: `${color}12`,
        color,
        border: `1px solid ${color}33`,
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}

export function CareerScreeningAnswerPanel({
  answers,
  totalQuestions,
}: {
  answers: {
    id: string;
    label: string;
    answer: "yes" | "no";
  }[];
  totalQuestions: number;
}) {
  const [open, setOpen] = useState(false);

  if (totalQuestions <= 0) return null;

  const answeredCount = answers.length;
  const yesCount = answers.filter((item) => item.answer === "yes").length;
  const noCount = answers.filter((item) => item.answer === "no").length;
  const hasAnswers = answeredCount > 0;

  return (
    <div
      style={{
        marginTop: 8,
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(148,163,184,0.13)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => hasAnswers && setOpen((value) => !value)}
        aria-expanded={open}
        disabled={!hasAnswers}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          cursor: hasAnswers ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 950,
            color: "var(--wm-er-muted, #64748b)",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          Screening answers
        </span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 950,
            color: hasAnswers
              ? "var(--wm-er-accent-career, #1d4ed8)"
              : "var(--wm-er-muted, #64748b)",
            whiteSpace: "nowrap",
          }}
        >
          {answeredCount} / {totalQuestions} answered
          {hasAnswers ? ` · ${open ? "Hide" : "View"}` : ""}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 10px 9px", display: "grid", gap: 6 }}>
          <div
            style={{
              fontSize: 10.8,
              fontWeight: 850,
              color: "var(--wm-er-muted, #64748b)",
              lineHeight: 1.35,
            }}
          >
            Summary: {yesCount} yes / {noCount} no
          </div>

          {answers.map((item, index) => {
            const isYes = item.answer === "yes";

            return (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "start",
                  padding: "7px 8px",
                  borderRadius: "var(--wm-radius-button)",
                  background: "rgba(248,250,252,0.88)",
                  border: "1px solid rgba(148,163,184,0.11)",
                }}
              >
                <div
                  style={{
                    fontSize: 11.2,
                    fontWeight: 800,
                    color: "var(--wm-er-text, #1e293b)",
                    lineHeight: 1.35,
                  }}
                >
                  {index + 1}. {item.label}
                </div>

                <span
                  style={{
                    fontSize: 10.2,
                    fontWeight: 950,
                    padding: "3px 8px",
                    borderRadius: "var(--wm-radius-pill)",
                    background: isYes ? "rgba(29,78,216,0.08)" : "rgba(220,38,38,0.08)",
                    color: isYes ? "var(--wm-er-accent-career, #1d4ed8)" : "#dc2626",
                    border: `1px solid ${isYes ? "rgba(29,78,216,0.18)" : "rgba(220,38,38,0.18)"}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isYes ? "Yes" : "No"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CareerScreeningPill({ label, answer }: { label: string; answer: "yes" | "no" }) {
  const isYes = answer === "yes";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 800,
        padding: "3px 9px",
        borderRadius: "var(--wm-radius-pill)",
        background: isYes ? "rgba(29,78,216,0.08)" : "rgba(220,38,38,0.08)",
        color: isYes ? "var(--wm-er-accent-career, #1d4ed8)" : "#dc2626",
        border: `1px solid ${isYes ? "rgba(29,78,216,0.2)" : "rgba(220,38,38,0.2)"}`,
      }}
    >
      <span style={{ fontSize: 9 }}>{isYes ? "Yes" : "No"}</span>
      {label}
    </span>
  );
}
