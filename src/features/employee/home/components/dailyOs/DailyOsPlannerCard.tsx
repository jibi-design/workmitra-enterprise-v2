/** Candidate Pro Daily OS — Planner weekly hours vs planned demand. */

import { CalendarRange } from "lucide-react";
import { DailyOsBentoBody } from "./DailyOsBentoBody";
import { resolveDailyOsViewState } from "../../helpers/dailyOs.viewState.helpers";
import type { DailyOsPlannerHours } from "../../helpers/dailyOs.types";

type Props = {
  readonly hours: DailyOsPlannerHours;
  readonly ready: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
};

function formatHours(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function DailyOsPlannerCard({ hours, ready, error, onRetry }: Props) {
  const target = Math.max(hours.plannedHours, hours.scheduledHours);
  const fill = target > 0 ? Math.round((hours.scheduledHours / target) * 100) : 0;
  const isEmpty = hours.plannedHours === 0 && hours.scheduledHours === 0;
  const state = resolveDailyOsViewState({ ready, error, isEmpty });

  return (
    <section
      className="wm-dashWidget wm-dailyOsBento wm-dailyOsBento--planner"
      data-testid="daily-os-planner"
      data-state={state}
      aria-label="Planner and availability"
    >
      <div className="wm-dailyOsBento__head">
        <span className="wm-dailyOsHero__icon wm-dailyOsHero__icon--planner" aria-hidden="true">
          <CalendarRange size={16} strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="wm-dashWidget__title">Planner & availability</h2>
          <p className="wm-dashWidget__sub">This week · demand days only</p>
        </div>
      </div>

      <DailyOsBentoBody
        state={state}
        domain="planner"
        emptyTitle="No planner hours this week"
        emptySub="Demand days you apply to will show here."
        errorText={error}
        onRetry={onRetry}
      >
        <div className="wm-dailyOsPlanner__value">
          {formatHours(hours.scheduledHours)}
          <span> / {formatHours(hours.plannedHours)} hrs planned</span>
        </div>
        <div className="wm-dailyOsPlanner__track" aria-hidden="true">
          <div className="wm-dailyOsPlanner__fill" style={{ width: `${fill}%` }} />
        </div>
        <p className="wm-dashWidget__sub">
          {hours.confirmedDays} confirmed · {hours.plannedDays} demand day
          {hours.plannedDays === 1 ? "" : "s"}
        </p>
      </DailyOsBentoBody>
    </section>
  );
}
