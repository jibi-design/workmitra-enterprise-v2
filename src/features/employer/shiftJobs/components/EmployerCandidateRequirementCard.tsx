// App name: Job Mitra
// File name: EmployerCandidateRequirementCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerCandidateRequirementCard.tsx

import type { AnswerState } from "../helpers/employerCandidateDetail.helpers";
import { EmployerCandidateAnswerBadge } from "./EmployerCandidateAnswerBadge";

type EmployerCandidateRequirementCardProps = {
  title: string;
  emptyText: string;
  items: string[];
  answers: Record<string, AnswerState>;
  notes: Record<string, string>;
  isLast?: boolean;
};

export function EmployerCandidateRequirementCard({
  title,
  emptyText,
  items,
  answers,
  notes,
  isLast = false,
}: EmployerCandidateRequirementCardProps) {
  return (
    <div style={{ marginTop: 12, marginBottom: isLast ? 24 : 0 }} className="wm-ee-card">
      <div
        style={{
          fontWeight: 1000,
          fontSize: 14,
          color: "var(--wm-er-text)",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>{emptyText}</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => {
            const answer = answers[item];
            const note = notes?.[item];

            return (
              <div
                key={item}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--wm-radius-10)",
                  background: "var(--wm-er-surface)",
                  border: "1px solid var(--wm-er-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>
                    {item}
                  </div>

                  <EmployerCandidateAnswerBadge answer={answer} />
                </div>

                {note && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: "var(--wm-er-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{note}&rdquo;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
