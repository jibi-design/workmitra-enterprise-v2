/** Employer Pro — dense 3-up hiring hero metrics. */

import { Briefcase, CalendarClock, Users } from "lucide-react";
import type { EmployerDashMetrics } from "../../helpers/employerDashboard.helpers";

type Props = {
  readonly metrics: EmployerDashMetrics;
};

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function EmployerDashMetricsCards({ metrics }: Props) {
  const activePosts = metrics?.activePosts ?? 0;
  const totalApplicants = metrics?.totalApplicants ?? 0;
  const scheduled = metrics?.todayInterviews ?? 0;

  return (
    <section className="wm-erDashHero wm-stable-row" data-testid="employer-dash-hero" aria-label="Hiring metrics">
      <article className="wm-erDashHero__cell wm-erDashHero__cell--roles">
        <div className="wm-erDashHero__top">
          <div className="wm-erDashHero__icon" aria-hidden="true">
            <Briefcase size={16} strokeWidth={2.25} />
          </div>
          <span className="wm-erDashHero__badge">Active</span>
        </div>
        <div className="wm-erDashHero__label">Active roles</div>
        <div className="wm-erDashHero__value">{activePosts}</div>
        <p className="wm-erDashHero__meta">{plural(activePosts, "listing", "listings")}</p>
      </article>

      <article className="wm-erDashHero__cell wm-erDashHero__cell--apps">
        <div className="wm-erDashHero__top">
          <div className="wm-erDashHero__icon" aria-hidden="true">
            <Users size={16} strokeWidth={2.25} />
          </div>
          <span className="wm-erDashHero__badge">Received</span>
        </div>
        <div className="wm-erDashHero__label">Applicants</div>
        <div className="wm-erDashHero__value">{totalApplicants}</div>
        <p className="wm-erDashHero__meta">
          {plural(totalApplicants, "applicant", "applicants")}
        </p>
      </article>

      <article className="wm-erDashHero__cell wm-erDashHero__cell--today">
        <div className="wm-erDashHero__top">
          <div className="wm-erDashHero__icon" aria-hidden="true">
            <CalendarClock size={16} strokeWidth={2.25} />
          </div>
          <span className="wm-erDashHero__badge">Today</span>
        </div>
        <div className="wm-erDashHero__label">Scheduled</div>
        <div className="wm-erDashHero__value">{scheduled}</div>
        <p className="wm-erDashHero__meta">
          {plural(scheduled, "interview today", "interviews today")}
        </p>
      </article>
    </section>
  );
}
