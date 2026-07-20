// App name: Job Mitra
// File name: EmployerDemandPlannerStepIndicator.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\EmployerDemandPlannerStepIndicator.tsx

import type { DemandPlannerStep } from "../../types/employerDemandPlanner.types";

const STEPS = ["Role & Team", "Schedule & Pay", "Review & Publish"] as const;

type EmployerDemandPlannerStepIndicatorProps = {
  step: DemandPlannerStep;
};

export function EmployerDemandPlannerStepIndicator({
  step,
}: EmployerDemandPlannerStepIndicatorProps) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
      {STEPS.map((label, index) => {
        const stepNumber = (index + 1) as DemandPlannerStep;
        const isDone = stepNumber < step;
        const isCurrent = stepNumber === step;

        return (
          <div
            key={label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            {index > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 0,
                  right: "50%",
                  height: 2,
                  background:
                    isDone || isCurrent ? "var(--wm-planner-accent)" : "var(--wm-er-border)",
                }}
              />
            )}

            {index < STEPS.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: "50%",
                  right: 0,
                  height: 2,
                  background: isDone ? "var(--wm-planner-accent)" : "var(--wm-er-border)",
                }}
              />
            )}

            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                background: isDone
                  ? "var(--wm-planner-accent)"
                  : isCurrent
                    ? "rgba(8,145,178,0.15)"
                    : "var(--wm-er-surface)",
                border: `2px solid ${
                  isCurrent || isDone ? "var(--wm-planner-accent)" : "var(--wm-er-border)"
                }`,
                color: isDone
                  ? "#fff"
                  : isCurrent
                    ? "var(--wm-planner-accent-strong)"
                    : "var(--wm-er-muted)",
              }}
            >
              {isDone ? "Done" : stepNumber}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 10,
                fontWeight: isCurrent ? 700 : 600,
                color: isCurrent ? "var(--wm-planner-accent-strong)" : "var(--wm-er-muted)",
                textAlign: "center",
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
