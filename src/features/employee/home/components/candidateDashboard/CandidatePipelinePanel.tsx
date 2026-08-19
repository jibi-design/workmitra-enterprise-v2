/** Candidate Pro — active application pipeline list. */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  formatRelativeDay,
  type CandidatePipelineRow,
  type CandidatePipelineStatus,
} from "../../helpers/candidateDashboard.helpers";

type Props = {
  readonly rows: readonly CandidatePipelineRow[];
};

function statusClass(status: CandidatePipelineStatus): string {
  if (status === "Shortlisted") return "wm-candBadge wm-candBadge--shortlist";
  if (status === "Interview") return "wm-candBadge wm-candBadge--interview";
  if (status === "Offer") return "wm-candBadge wm-candBadge--offer";
  if (status === "Closed") return "wm-candBadge wm-candBadge--closed";
  return "wm-candBadge wm-candBadge--review";
}

export function CandidatePipelinePanel({ rows }: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget" data-testid="candidate-pipeline">
      <div className="wm-dashWidget__kicker">Career pipeline</div>
      <h2 className="wm-dashWidget__title">Active applications</h2>
      <p className="wm-dashWidget__sub">Recent career applications with live status.</p>

      {rows.length === 0 ? (
        <div className="wm-candEmpty">
          No active applications yet.{" "}
          <button
            type="button"
            className="wm-linkBtn"
            onClick={() => nav(ROUTE_PATHS.employeeCareerSearch)}
          >
            Browse careers
          </button>
        </div>
      ) : (
        <ul className="wm-candPipeline">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="wm-candPipeline__row"
                onClick={() =>
                  nav(ROUTE_PATHS.employeeCareerPostDetails.replace(":postId", row.jobId))
                }
              >
                <div className="wm-candPipeline__copy">
                  <div className="wm-candPipeline__title">{row.title}</div>
                  <div className="wm-candPipeline__meta">
                    {row.company} · {formatRelativeDay(row.updatedAt)}
                  </div>
                </div>
                <span className={statusClass(row.status)}>{row.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="wm-outlineBtn wm-candWidgetCta"
        onClick={() => nav(ROUTE_PATHS.employeeCareerApplications)}
      >
        Open all applications
      </button>
    </section>
  );
}
