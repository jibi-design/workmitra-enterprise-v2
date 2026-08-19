/** Candidate Pro Daily OS — compact 3-up metric cards (always horizontal). */

import { Bell, CalendarClock, Wallet } from "lucide-react";
import { formatShiftWhen } from "../../helpers/dailyOs.helpers";
import type { DailyOsNextShift } from "../../helpers/dailyOs.types";

type Props = {
  readonly todayKey: string;
  readonly nextShift: DailyOsNextShift | null;
  readonly criticalCount: number;
  readonly criticalLabel: string | null;
  readonly earningsTotal: number;
  readonly earningsShifts: number;
  readonly onOpenCritical: () => void;
};

function formatPayAmount(amount: number): string {
  return Math.round(amount).toLocaleString("en-GB");
}

export function DailyOsHeroBar({
  todayKey,
  nextShift,
  criticalCount,
  criticalLabel,
  earningsTotal,
  earningsShifts,
  onOpenCritical,
}: Props) {
  const when = nextShift ? formatShiftWhen(nextShift.dateKey, todayKey) : "—";

  return (
    <section className="wm-dailyOsHero wm-stable-row" data-testid="daily-os-hero" aria-label="Today at a glance">
      <article className="wm-dailyOsHero__cell wm-dailyOsHero__cell--shift">
        <div className="wm-dailyOsHero__icon" aria-hidden="true">
          <CalendarClock size={16} strokeWidth={2.25} />
        </div>
        <div className="wm-dailyOsHero__label">Next shift</div>
        <div className="wm-dailyOsHero__value">{when}</div>
        <p className="wm-dailyOsHero__meta">
          {nextShift ? `${nextShift.jobName} · ${nextShift.companyName}` : "No confirmed shift"}
        </p>
      </article>

      <button
        type="button"
        className="wm-dailyOsHero__cell wm-dailyOsHero__cell--career wm-dailyOsHero__cell--tap"
        data-testid="daily-os-critical"
        onClick={onOpenCritical}
      >
        <div className="wm-dailyOsHero__icon wm-dailyOsHero__icon--career" aria-hidden="true">
          <Bell size={16} strokeWidth={2.25} />
        </div>
        <div className="wm-dailyOsHero__label">Critical</div>
        <div className="wm-dailyOsHero__value">{criticalCount}</div>
        <p className="wm-dailyOsHero__meta">
          {criticalLabel ?? (criticalCount === 0 ? "All clear" : "Action required")}
        </p>
      </button>

      <article className="wm-dailyOsHero__cell wm-dailyOsHero__cell--shift">
        <div className="wm-dailyOsHero__icon" aria-hidden="true">
          <Wallet size={16} strokeWidth={2.25} />
        </div>
        <div className="wm-dailyOsHero__label">Earnings</div>
        <div className="wm-dailyOsHero__value">{formatPayAmount(earningsTotal)}</div>
        <p className="wm-dailyOsHero__meta">
          {earningsShifts} shift{earningsShifts === 1 ? "" : "s"} · estimate
        </p>
      </article>
    </section>
  );
}
