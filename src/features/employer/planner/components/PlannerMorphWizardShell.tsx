// Job Mitra | PlannerMorphWizardShell.tsx | Container morph between wizard steps

import type { ReactNode } from "react";

type Props = {
  step: number;
  children: ReactNode;
};

export function PlannerMorphWizardShell({ step, children }: Props) {
  return (
    <div className="wm-planner-morphShell" data-step={String(step)}>
      <div key={step} className="wm-planner-morphPanel">
        {children}
      </div>
    </div>
  );
}
