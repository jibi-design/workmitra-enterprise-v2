/** Candidate Pro Daily OS — dense 7-day schedule widget with status dots. */

import { CalendarDays } from "lucide-react";
import { DailyOsBentoBody } from "./DailyOsBentoBody";
import { resolveDailyOsViewState } from "../../helpers/dailyOs.viewState.helpers";
import type { DailyOsHeatCell } from "../../helpers/dailyOs.types";

type Props = {
  readonly cells: readonly DailyOsHeatCell[];
  readonly ready: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
};

export function DailyOsShiftHeat({ cells, ready, error, onRetry }: Props) {
  const isEmpty = cells.length === 0;
  const state = resolveDailyOsViewState({ ready, error, isEmpty });

  return (
    <section
      className="wm-dashWidget wm-dailyOsBento wm-dailyOsBento--shift"
      data-testid="daily-os-shift-heat"
      data-state={state}
      aria-label="Shift week"
    >
      <div className="wm-dailyOsBento__head">
        <span className="wm-dailyOsHero__icon" aria-hidden="true">
          <CalendarDays size={16} strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="wm-dashWidget__title">Schedule</h2>
          <p className="wm-dashWidget__sub">Next 7 days · confirmed vs free</p>
        </div>
      </div>

      <DailyOsBentoBody
        state={state}
        domain="shift"
        emptyTitle="Schedule unavailable"
        emptySub="Retry to load the next seven days."
        errorText={error}
        onRetry={onRetry}
      >
        <ul className="wm-dailyOsHeat" aria-label="Seven day schedule">
          {cells.map((cell) => {
            const booked = cell.kind === "confirmed";
            return (
              <li
                key={cell.dateKey}
                className={`wm-dailyOsHeat__cell wm-dailyOsHeat__cell--${cell.kind}`}
              >
                <span className="wm-dailyOsHeat__day">{cell.weekday}</span>
                <span className="wm-dailyOsHeat__num">{cell.dayNum}</span>
                <span
                  className={`wm-dailyOsHeat__dot${booked ? " isBooked" : ""}`}
                  aria-hidden="true"
                />
                <span className="wm-dailyOsHeat__kind">{booked ? "Shift" : "Free"}</span>
              </li>
            );
          })}
        </ul>
      </DailyOsBentoBody>
    </section>
  );
}
