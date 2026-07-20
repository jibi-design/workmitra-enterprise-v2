// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceStepper.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnounceStepper.tsx

import type { CSSProperties } from "react";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  step: Step;
  progress: number;
  onStepClick: (step: Step) => void;
};

const progressBarBg: CSSProperties = {
  height: 4,
  borderRadius: 2,
  background: "var(--wm-er-border)",
  overflow: "hidden",
};

const stepIndicatorStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  marginBottom: 4,
};

export function EmployerWorkforceAnnounceStepper({ step, progress, onStepClick }: Props) {
  return (
    <>
      <div style={progressBarBg}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: AMBER,
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={stepIndicatorStyle}>
        {([1, 2, 3, 4, 5] as Step[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => item < step && onStepClick(item)}
            disabled={item > step}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              border: "none",
              background:
                item === step ? AMBER : item < step ? "rgba(180,83,9,0.15)" : "var(--wm-er-border)",
              color: item === step ? "#fff" : item < step ? AMBER : "var(--wm-er-muted)",
              fontSize: 12,
              fontWeight: 900,
              cursor: item < step ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item < step ? "✓" : item}
          </button>
        ))}

        <span style={{ fontSize: 12, color: "var(--wm-er-muted)", marginLeft: 4 }}>
          Step {step} of 5
        </span>
      </div>
    </>
  );
}
