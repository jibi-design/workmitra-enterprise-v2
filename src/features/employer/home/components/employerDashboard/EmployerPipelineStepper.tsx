/** Employer Pro — stage stepper used by Shift, Career, and Planner trackers. */

import type { EmployerOsStageDef } from "../../helpers/employerDashboard.osTypes";

type Props = {
  readonly stages: readonly EmployerOsStageDef[];
  readonly counts: Record<string, number>;
  readonly filter: string;
  readonly onSelect: (stage: string) => void;
};

export function EmployerPipelineStepper({ stages, counts, filter, onSelect }: Props) {
  const currentIndex = stages.findIndex((stage) => stage.key === filter);

  return (
    <ol className="wm-erDashStepper" aria-label="Pipeline stages">
      {stages.map((stage, index) => {
        const value = counts[stage.key] ?? 0;
        const reached = currentIndex >= 0 && index <= currentIndex;
        const isCurrent = filter === stage.key;
        return (
          <li
            key={stage.key}
            className={`wm-erDashStepper__step${reached ? " isReached" : ""}${
              isCurrent ? " isCurrent" : ""
            }`}
          >
            <button
              type="button"
              className="wm-erDashStepper__btn"
              aria-pressed={isCurrent}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => onSelect(stage.key)}
            >
              <span className="wm-erDashStepper__node" aria-hidden="true">
                {value}
              </span>
              <span className="wm-erDashStepper__name">{stage.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
