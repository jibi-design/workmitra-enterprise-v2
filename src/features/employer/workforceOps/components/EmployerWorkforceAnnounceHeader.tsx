// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceHeader.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\EmployerWorkforceAnnounceHeader.tsx

import type { CSSProperties } from "react";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  step: Step;
  stepLabels: Record<Step, string>;
  onBack: () => void;
};

const backBtnStyle: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: AMBER,
  padding: 4,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
};

export function EmployerWorkforceAnnounceHeader({ step, stepLabels, onBack }: Props) {
  return (
    <div className="wm-pageHead" style={{ gap: 12 }}>
      <button type="button" onClick={onBack} style={backBtnStyle}>
        <IconBack />
      </button>

      <div style={{ flex: 1 }}>
        <div className="wm-pageTitle">New Announcement</div>
        <div className="wm-pageSub">{stepLabels[step]}</div>
      </div>
    </div>
  );
}
