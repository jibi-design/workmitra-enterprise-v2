// App name: Job Mitra
// File name: ShiftTimelineStepList.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\ShiftTimelineStepList.tsx

import { MUTED, getStepVisual } from "./shiftTimeline.styles";
import type { ShiftTimelineStep } from "./shiftTimeline.types";

export type ShiftTimelineStepListProps = {
  readonly steps: readonly ShiftTimelineStep[];
};

export function ShiftTimelineStepList({ steps }: ShiftTimelineStepListProps) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {steps.map((step, index) => (
        <TimelineStepRow key={step.id} step={step} isLast={index === steps.length - 1} />
      ))}
    </div>
  );
}

function TimelineStepRow({
  step,
  isLast,
}: {
  readonly step: ShiftTimelineStep;
  readonly isLast: boolean;
}) {
  const visual = getStepVisual(step.state);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "24px 1fr",
        gap: 10,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: "22px 1fr",
          justifyItems: "center",
        }}
        aria-hidden="true"
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: visual.dot,
            border: "2px solid #FFFFFF",
            boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.08)",
          }}
        />

        {!isLast && (
          <span
            style={{
              width: 2,
              minHeight: 24,
              background:
                step.state === "complete" ? "rgba(22, 163, 74, 0.34)" : "rgba(148, 163, 184, 0.22)",
            }}
          />
        )}
      </div>

      <div
        style={{
          borderRadius: 16,
          border: `1px solid ${visual.border}`,
          background: visual.background,
          padding: "10px 12px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 950, color: visual.color }}>{step.label}</div>

        <div
          style={{
            marginTop: 3,
            fontSize: 11,
            fontWeight: 750,
            color: MUTED,
            lineHeight: 1.45,
          }}
        >
          {step.helper}
        </div>
      </div>
    </div>
  );
}
