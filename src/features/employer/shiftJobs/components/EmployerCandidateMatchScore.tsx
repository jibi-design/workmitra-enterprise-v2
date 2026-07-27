// App name: Job Mitra
// File name: EmployerCandidateMatchScore.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerCandidateMatchScore.tsx

import type { AnswerState } from "../helpers/employerCandidateDetail.helpers";

type EmployerCandidateMatchScoreProps = {
  mustHaveAnswers: Record<string, AnswerState>;
  goodToHaveAnswers: Record<string, AnswerState>;
  mustHave: string[];
  goodToHave: string[];
};

export function EmployerCandidateMatchScore({
  mustHaveAnswers,
  goodToHaveAnswers,
  mustHave,
  goodToHave,
}: EmployerCandidateMatchScoreProps) {
  const mustTotal = mustHave.length;
  const mustMet = mustHave.filter((item) => mustHaveAnswers[item] === "meets").length;
  const goodTotal = goodToHave.length;
  const goodMet = goodToHave.filter((item) => goodToHaveAnswers[item] === "meets").length;

  if (mustTotal === 0 && goodTotal === 0) return null;

  const totalScore = mustTotal + goodTotal;
  const totalMet = mustMet + goodMet;
  const percent = totalScore > 0 ? Math.round((totalMet / totalScore) * 100) : 100;
  const color = percent >= 80 ? "#16a34a" : percent >= 50 ? "#d97706" : "#dc2626";

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "var(--wm-radius-chip)",
        background: "var(--wm-er-surface)",
        border: "1px solid var(--wm-er-border)",
        marginTop: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, color: "var(--wm-er-text)" }}>Match Score</div>

        <div style={{ fontSize: 20, fontWeight: 1000, color }}>{percent}%</div>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: "var(--wm-radius-pill)",
          background: "var(--wm-er-divider)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: color,
            borderRadius: "var(--wm-radius-pill)",
            transition: "width 0.4s",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        {mustTotal > 0 && (
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            Must-have:{" "}
            <b style={{ color: mustMet === mustTotal ? "#16a34a" : "#dc2626" }}>
              {mustMet}/{mustTotal}
            </b>
          </div>
        )}

        {goodTotal > 0 && (
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            Good-to-have:{" "}
            <b style={{ color: "#0f766e" }}>
              {goodMet}/{goodTotal}
            </b>
          </div>
        )}
      </div>
    </div>
  );
}
