/** Employer Pro — smart candidate matching panel. */

import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { EmployerMatchCandidate } from "../../helpers/employerDashboard.helpers";

type Props = {
  readonly items: readonly EmployerMatchCandidate[];
};

export function EmployerMatchPanel({ items }: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget wm-erDashBentoCard" data-testid="employer-match-panel">
      <div className="wm-dashWidget__kicker">
        <Sparkles size={12} aria-hidden="true" /> Match engine
      </div>
      <h2 className="wm-dashWidget__title">Smart candidate matches</h2>
      <p className="wm-dashWidget__sub">
        Top applicants scored against active job skill requirements.
      </p>

      {items.length === 0 ? (
        <div className="wm-erDashEmpty">No active-role candidates to rank yet.</div>
      ) : (
        <ul className="wm-erDashMatchList">
          {items.map((item) => (
            <li key={item.appId} className="wm-erDashMatchList__item">
              <div className="wm-erDashMatchList__copy">
                <div className="wm-erDashMatchList__title">{item.candidateName}</div>
                <div className="wm-erDashMatchList__meta">{item.jobTitle}</div>
              </div>
              <span
                className="wm-erDashMatchBadge"
                aria-label={`${item.matchPercent} percent match`}
              >
                {item.matchPercent}% Match
              </span>
              <button
                type="button"
                className="wm-linkBtn wm-erDashMatchList__cta"
                onClick={() =>
                  nav(
                    ROUTE_PATHS.employerCareerCandidateDetail
                      .replace(":postId", item.jobId)
                      .replace(":appId", item.appId),
                  )
                }
              >
                Review Match
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
