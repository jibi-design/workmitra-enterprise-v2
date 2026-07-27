// App name: Job Mitra
// File name: CandidateRequirementSummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\CandidateRequirementSummary.tsx

import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

type CandidateRequirementSummaryProps = {
  app: EmployeeShiftApplication;
};

export function CandidateRequirementSummary({ app }: CandidateRequirementSummaryProps) {
  const mustHaveTotal = Object.keys(app.mustHaveAnswers).length;
  const goodToHaveTotal = Object.keys(app.goodToHaveAnswers).length;

  if (mustHaveTotal === 0 && goodToHaveTotal === 0) return null;

  const mustHaveMet = Object.values(app.mustHaveAnswers).filter(
    (value) => value === "meets",
  ).length;
  const goodToHaveMet = Object.values(app.goodToHaveAnswers).filter(
    (value) => value === "meets",
  ).length;

  return (
    <div
      style={{
        marginTop: 10,
        display: "grid",
        gridTemplateColumns: mustHaveTotal > 0 && goodToHaveTotal > 0 ? "1fr 1fr" : "1fr",
        gap: 8,
      }}
    >
      {mustHaveTotal > 0 && (
        <RequirementBox
          label="Must-have"
          value={`${mustHaveMet}/${mustHaveTotal} met`}
          strong={mustHaveMet === mustHaveTotal}
        />
      )}

      {goodToHaveTotal > 0 && (
        <RequirementBox
          label="Good-to-have"
          value={`${goodToHaveMet}/${goodToHaveTotal} met`}
          strong={goodToHaveMet > 0}
        />
      )}
    </div>
  );
}

function RequirementBox({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 9px",
        borderRadius: "var(--wm-radius-chip)",
        background: strong ? "rgba(22,163,74,0.08)" : "rgba(248,250,252,0.96)",
        border: strong ? "1px solid rgba(22,163,74,0.16)" : "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          fontWeight: 950,
          color: strong ? "var(--wm-er-accent-shift)" : "var(--wm-er-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
