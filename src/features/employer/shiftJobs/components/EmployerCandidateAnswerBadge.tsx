// App name: Job Mitra
// File name: EmployerCandidateAnswerBadge.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerCandidateAnswerBadge.tsx

import type { AnswerState } from "../helpers/employerCandidateDetail.helpers";

export function EmployerCandidateAnswerBadge({ answer }: { answer: AnswerState | undefined }) {
  if (!answer) {
    return <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No answer</span>;
  }

  const map: Record<AnswerState, { label: string; bg: string; color: string }> = {
    meets: {
      label: "Meets",
      bg: "rgba(22,163,74,0.10)",
      color: "#16a34a",
    },
    not_sure: {
      label: "Not sure",
      bg: "rgba(217,119,6,0.10)",
      color: "#d97706",
    },
    dont_meet: {
      label: "Don't meet",
      bg: "rgba(220,38,38,0.10)",
      color: "#dc2626",
    },
  };

  const style = map[answer];

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 900,
        padding: "3px 10px",
        borderRadius: 999,
        background: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  );
}
