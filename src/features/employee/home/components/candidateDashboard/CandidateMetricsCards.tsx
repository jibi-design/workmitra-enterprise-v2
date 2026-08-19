/** Candidate Pro dashboard — Application status metric cards. */

import { Briefcase, Bookmark, CalendarClock, Star } from "lucide-react";
import type { CandidateMetrics } from "../../helpers/candidateDashboard.helpers";

type Props = {
  readonly metrics: CandidateMetrics;
};

const CARDS: Array<{
  key: keyof CandidateMetrics;
  label: string;
  Icon: typeof Briefcase;
}> = [
  { key: "applied", label: "Total Applied", Icon: Briefcase },
  { key: "shortlisted", label: "Shortlisted", Icon: Star },
  { key: "interviews", label: "Interviews Scheduled", Icon: CalendarClock },
  { key: "saved", label: "Saved Jobs", Icon: Bookmark },
];

export function CandidateMetricsCards({ metrics }: Props) {
  return (
    <section className="wm-candMetrics" aria-label="Application status">
      {CARDS.map(({ key, label, Icon }) => (
        <article key={String(key)} className="wm-candMetricCard">
          <div className="wm-candMetricCard__icon" aria-hidden="true">
            <Icon size={18} strokeWidth={2.25} />
          </div>
          <div className="wm-candMetricCard__value">{metrics[key]}</div>
          <div className="wm-candMetricCard__label">{label}</div>
        </article>
      ))}
    </section>
  );
}
