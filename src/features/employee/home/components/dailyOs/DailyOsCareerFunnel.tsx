/** Candidate Pro Daily OS — horizontal Career stepper with current-stage highlight. */

import { Briefcase } from "lucide-react";
import { DailyOsBentoBody } from "./DailyOsBentoBody";
import { resolveCurrentFunnelStage } from "../../helpers/dailyOs.helpers";
import { resolveDailyOsViewState } from "../../helpers/dailyOs.viewState.helpers";
import type { CareerFunnelCounts, CareerFunnelStage } from "../../helpers/dailyOs.types";

type Props = {
  readonly counts: CareerFunnelCounts;
  readonly ready: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
  readonly onOpenStage: (stage: CareerFunnelStage) => void;
};

const STAGES: readonly { key: CareerFunnelStage; label: string }[] = [
  { key: "applied", label: "Applications Submitted" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

export function DailyOsCareerFunnel({ counts, ready, error, onRetry, onOpenStage }: Props) {
  const current = resolveCurrentFunnelStage(counts);
  const currentIndex = current ? STAGES.findIndex((s) => s.key === current) : -1;
  const isEmpty = STAGES.every((stage) => counts[stage.key] === 0);
  const state = resolveDailyOsViewState({ ready, error, isEmpty });

  return (
    <section
      className="wm-dashWidget wm-dailyOsBento wm-dailyOsBento--career"
      data-testid="daily-os-career-funnel"
      data-state={state}
      aria-label="Career pipeline"
    >
      <div className="wm-dailyOsBento__head">
        <span className="wm-dailyOsHero__icon wm-dailyOsHero__icon--career" aria-hidden="true">
          <Briefcase size={16} strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="wm-dashWidget__title">Career pipeline</h2>
          <p className="wm-dashWidget__sub">Submitted → Shortlisted → Interview → Offer</p>
        </div>
      </div>

      <DailyOsBentoBody
        state={state}
        domain="career"
        emptyTitle="No applications yet"
        emptySub="Open Career to submit your first application."
        errorText={error}
        onRetry={onRetry}
      >
        <ol className="wm-dailyOsStepper" aria-label="Career stages">
          {STAGES.map((stage, index) => {
            const value = counts[stage.key];
            const reached = currentIndex >= 0 && index <= currentIndex;
            const isCurrent = stage.key === current;
            return (
              <li
                key={stage.key}
                className={`wm-dailyOsStepper__step${reached ? " isReached" : ""}${
                  isCurrent ? " isCurrent" : ""
                }`}
              >
                <button
                  type="button"
                  className="wm-dailyOsStepper__btn"
                  onClick={() => onOpenStage(stage.key)}
                >
                  <span className="wm-dailyOsStepper__node" aria-hidden="true">
                    {value}
                  </span>
                  <span className="wm-dailyOsStepper__name">{stage.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </DailyOsBentoBody>
    </section>
  );
}
