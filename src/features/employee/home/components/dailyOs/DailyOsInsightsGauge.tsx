/** Candidate Pro Daily OS — profile strength + match gauge. */

import { Gauge } from "lucide-react";
import { DailyOsBentoBody } from "./DailyOsBentoBody";
import { computeMatchInsight, gaugeArcPath } from "../../helpers/dailyOs.insights.helpers";
import { resolveDailyOsViewState } from "../../helpers/dailyOs.viewState.helpers";

type Props = {
  readonly strengthPercent: number;
  readonly matchScores: readonly number[];
  readonly ready: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
  readonly onOpenProfile: () => void;
};

export function DailyOsInsightsGauge({
  strengthPercent,
  matchScores,
  ready,
  error,
  onRetry,
  onOpenProfile,
}: Props) {
  const insight = computeMatchInsight(strengthPercent, matchScores);
  const track = gaugeArcPath(100);
  const value = insight.strengthPercent > 0 ? gaugeArcPath(insight.strengthPercent) : "";
  const isEmpty = insight.strengthPercent === 0 && insight.matchPercent === 0;
  const state = resolveDailyOsViewState({ ready, error, isEmpty });

  return (
    <section
      className="wm-dashWidget wm-dailyOsBento wm-dailyOsBento--career"
      data-testid="daily-os-insights"
      data-state={state}
      aria-label="Candidate strength"
    >
      <div className="wm-dailyOsBento__head">
        <span className="wm-dailyOsHero__icon wm-dailyOsHero__icon--career" aria-hidden="true">
          <Gauge size={16} strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="wm-dashWidget__title">Candidate strength</h2>
          <p className="wm-dashWidget__sub">{insight.bandLabel}</p>
        </div>
      </div>

      <DailyOsBentoBody
        state={state}
        domain="career"
        emptyTitle="Profile still empty"
        emptySub="Open Profile to add your basics."
        errorText={error}
        onRetry={onRetry}
      >
        <button type="button" className="wm-dailyOsGauge wm-dailyOsBento--tap" onClick={onOpenProfile}>
          <svg className="wm-dailyOsGauge__svg" viewBox="0 0 88 56" role="img" aria-label={`${insight.strengthPercent} percent profile strength`}>
            <path d={track} className="wm-dailyOsGauge__track" fill="none" strokeWidth="8" />
            {value ? <path d={value} className="wm-dailyOsGauge__value" fill="none" strokeWidth="8" /> : null}
          </svg>
          <div className="wm-dailyOsGauge__readout">
            <strong>{insight.strengthPercent}%</strong>
            <span>Profile · match {insight.matchPercent}%</span>
          </div>
        </button>
      </DailyOsBentoBody>
    </section>
  );
}
