/** Candidate Pro Daily OS — 7-day earnings and hours trend. */

import { TrendingUp } from "lucide-react";
import { DailyOsBentoBody } from "./DailyOsBentoBody";
import { sparklinePath } from "../../helpers/dailyOs.helpers";
import { resolveDailyOsViewState } from "../../helpers/dailyOs.viewState.helpers";
import type { DailyOsSparkPoint } from "../../helpers/dailyOs.types";

type Props = {
  readonly points: readonly DailyOsSparkPoint[];
  readonly ready: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
};

export function DailyOsTrendCard({ points, ready, error, onRetry }: Props) {
  const amounts = points.map((p) => p.amount);
  const hours = points.map((p) => p.hours);
  const earnPath = sparklinePath(amounts, 220, 44);
  const hoursPath = sparklinePath(hours, 220, 44);
  const isEmpty = points.length === 0 || points.every((p) => p.amount === 0 && p.hours === 0);
  const state = resolveDailyOsViewState({ ready, error, isEmpty });

  return (
    <section
      className="wm-dashWidget wm-dailyOsBento wm-dailyOsBento--shift"
      data-testid="daily-os-trend"
      data-state={state}
      aria-label="Earnings and hours trend"
    >
      <div className="wm-dailyOsBento__head">
        <span className="wm-dailyOsHero__icon" aria-hidden="true">
          <TrendingUp size={16} strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="wm-dashWidget__title">Earnings & hours</h2>
          <p className="wm-dashWidget__sub">Last 7 days · estimate · 8h per shift day</p>
        </div>
      </div>

      <DailyOsBentoBody
        state={state}
        domain="shift"
        emptyTitle="No earnings this week"
        emptySub="Confirmed shift days will plot here as estimates."
        errorText={error}
        onRetry={onRetry}
      >
        <svg className="wm-dailyOsSpark wm-dailyOsSpark--dual" viewBox="0 0 220 44" role="img" aria-label="Seven day earnings trend">
          <path d={earnPath} fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
        <svg className="wm-dailyOsSpark wm-dailyOsSpark--hours" viewBox="0 0 220 44" role="img" aria-label="Seven day hours trend">
          <path d={hoursPath} fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
      </DailyOsBentoBody>
    </section>
  );
}
