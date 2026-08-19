/** Candidate Pro — AI-style job recommendations with match %. */

import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { CandidateRecommendation } from "../../helpers/candidateDashboard.helpers";

type Props = {
  readonly items: readonly CandidateRecommendation[];
  readonly compact?: boolean;
};

export function CandidateRecommendationsPanel({ items, compact = false }: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget" data-testid="candidate-recommendations">
      <div className="wm-dashWidget__kicker">
        <Sparkles size={12} aria-hidden="true" /> Match engine
      </div>
      <h2 className="wm-dashWidget__title">Recommended careers</h2>
      <p className="wm-dashWidget__sub">
        Ranked from your profile skills and preferences (local match score).
      </p>

      {items.length === 0 ? (
        <div className="wm-candEmpty">
          No open roles to recommend.{" "}
          <button
            type="button"
            className="wm-linkBtn"
            onClick={() => nav(ROUTE_PATHS.employeeCareerSearch)}
          >
            Search careers
          </button>
        </div>
      ) : (
        <ul className="wm-candRecoList">
          {items.map((item) => (
            <li key={item.postId} className="wm-candRecoList__item">
              <div className="wm-candRecoList__copy">
                <div className="wm-candRecoList__title">{item.title}</div>
                <div className="wm-candRecoList__meta">
                  {compact ? item.company : `${item.company} · ${item.location}`}
                </div>
              </div>
              <span className="wm-candMatchBadge" aria-label={`${item.matchPercent} percent match`}>
                {item.matchPercent}% match
              </span>
              <button
                type="button"
                className="wm-primarybtn wm-candRecoList__apply"
                onClick={() =>
                  nav(ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", item.postId))
                }
              >
                Quick apply
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
