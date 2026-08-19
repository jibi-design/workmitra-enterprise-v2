/** Candidate Pro Daily OS — compact Recent Activity timeline. */

import { Activity } from "lucide-react";
import { DailyOsBentoBody } from "./DailyOsBentoBody";
import { formatRelativeDay } from "../../helpers/candidateDashboard.helpers";
import { resolveDailyOsViewState } from "../../helpers/dailyOs.viewState.helpers";
import type { DailyOsActivityItem } from "../../helpers/dailyOs.types";

type Props = {
  readonly items: readonly DailyOsActivityItem[];
  readonly ready: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
  readonly onOpenItem: (route: string) => void;
};

export function DailyOsActivityStream({ items, ready, error, onRetry, onOpenItem }: Props) {
  const state = resolveDailyOsViewState({ ready, error, isEmpty: items.length === 0 });

  return (
    <section
      className="wm-dashWidget wm-dailyOsBento wm-dailyOsActivity"
      data-testid="daily-os-activity"
      data-state={state}
      aria-label="Recent activity"
    >
      <div className="wm-dailyOsBento__head">
        <span className="wm-dailyOsHero__icon wm-dailyOsHero__icon--mixed" aria-hidden="true">
          <Activity size={16} strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="wm-dashWidget__title">Recent activity</h2>
          <p className="wm-dashWidget__sub">Career · Shift · Planner</p>
        </div>
      </div>

      <DailyOsBentoBody
        state={state}
        domain="shift"
        emptyTitle="No recent activity yet"
        emptySub="Career, Shift, and Planner updates will land here."
        errorText={error}
        onRetry={onRetry}
      >
        <ol className="wm-dailyOsTimeline">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`wm-dailyOsTimeline__row wm-dailyOsTimeline__row--${item.lane}`}
                onClick={() => onOpenItem(item.route)}
              >
                <span className="wm-dailyOsTimeline__dot" aria-hidden="true" />
                <div className="wm-dailyOsTimeline__copy">
                  <div className="wm-dailyOsTimeline__title">{item.title}</div>
                  <div className="wm-dailyOsTimeline__detail">{item.detail}</div>
                </div>
                <time className="wm-dailyOsTimeline__when">{formatRelativeDay(item.at)}</time>
              </button>
            </li>
          ))}
        </ol>
      </DailyOsBentoBody>
    </section>
  );
}
