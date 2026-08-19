/** Employer Pro — Applied → Hired visual stepper. Filters the list below. */

import {
  EMPLOYER_PIPELINE_STEPPER_STAGES,
  type EmployerPipelineFilter,
  type EmployerPipelineStageCounts,
  type EmployerPipelineStepperStage,
} from "../../helpers/employerDashboard.helpers";

type Props = {
  readonly counts: EmployerPipelineStageCounts;
  readonly filter: EmployerPipelineFilter;
  readonly onSelect: (stage: EmployerPipelineStepperStage) => void;
};

export function EmployerPipelineStepper({ counts, filter, onSelect }: Props) {
  const currentIndex = EMPLOYER_PIPELINE_STEPPER_STAGES.findIndex((stage) => stage === filter);

  return (
    <ol className="wm-erDashStepper" aria-label="Applicant pipeline stages">
      {EMPLOYER_PIPELINE_STEPPER_STAGES.map((stage, index) => {
        const value = counts[stage];
        const reached = currentIndex >= 0 && index <= currentIndex;
        const isCurrent = filter === stage;
        return (
          <li
            key={stage}
            className={`wm-erDashStepper__step${reached ? " isReached" : ""}${
              isCurrent ? " isCurrent" : ""
            }`}
          >
            <button
              type="button"
              className="wm-erDashStepper__btn"
              aria-pressed={isCurrent}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => onSelect(stage)}
            >
              <span className="wm-erDashStepper__node" aria-hidden="true">
                {value}
              </span>
              <span className="wm-erDashStepper__name">{stage}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
