// App name: Job Mitra
// File name: ShiftHowItWorksCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftHowItWorksCard.tsx

import { ShiftChevronIcon } from "./ShiftControlCenterIcons";

type ShiftHowItWorksCardProps = {
  open: boolean;
  onToggle: () => void;
};

const STEPS = [
  "Apply for a shift you like.",
  "You may be shortlisted or placed on the waiting list.",
  "When confirmed, a workspace is created for updates.",
];

export function ShiftHowItWorksCard({ open, onToggle }: ShiftHowItWorksCardProps) {
  return (
    <div className="wm-ee-card wm-shiftEmployeeHowCard">
      <button type="button" onClick={onToggle} className="wm-shiftEmployeeHowToggle">
        <div>
          <div className="wm-shiftEmployeeHowTitle">How it works</div>
          <div className="wm-shiftEmployeeHowSub">Simple steps from application to workspace</div>
        </div>

        <ShiftChevronIcon open={open} />
      </button>

      {open && (
        <div className="wm-shiftEmployeeHowSteps">
          {STEPS.map((text, index) => (
            <div key={text} className="wm-shiftEmployeeHowStep">
              <div className="wm-shiftEmployeeHowStepNumber">{index + 1}</div>

              <div className="wm-shiftEmployeeHowStepText">{text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
