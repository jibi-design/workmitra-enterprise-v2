/** Employer Pro — applicant pipeline tracker with visual stepper. */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import {
  formatRelativeDay,
  type EmployerPipelineFilter,
  type EmployerPipelineRow,
  type EmployerPipelineStage,
  type EmployerPipelineStageCounts,
} from "../../helpers/employerDashboard.helpers";
import { EmployerPipelineStepper } from "./EmployerPipelineStepper";

type Props = {
  readonly rows: readonly EmployerPipelineRow[];
  readonly stageCounts: EmployerPipelineStageCounts;
  readonly filter: EmployerPipelineFilter;
  readonly onFilterChange: (next: EmployerPipelineFilter) => void;
};

function badgeClass(stage: EmployerPipelineStage): string {
  if (stage === "Shortlisted") return "wm-erDashBadge wm-erDashBadge--shortlist";
  if (stage === "Interview") return "wm-erDashBadge wm-erDashBadge--interview";
  if (stage === "Hired") return "wm-erDashBadge wm-erDashBadge--hired";
  if (stage === "Rejected") return "wm-erDashBadge wm-erDashBadge--rejected";
  return "wm-erDashBadge wm-erDashBadge--applied";
}

export function EmployerPipelineTracker({
  rows,
  stageCounts,
  filter,
  onFilterChange,
}: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget" data-testid="employer-pipeline-tracker">
      <div className="wm-dashWidget__kicker">Hiring pipeline</div>
      <h2 className="wm-dashWidget__title">Applicant tracker</h2>
      <p className="wm-dashWidget__sub">Applied → Shortlisted → Interview → Hired</p>

      <EmployerPipelineStepper counts={stageCounts} filter={filter} onSelect={onFilterChange} />

      {rows.length === 0 ? (
        <div className="wm-erDashEmpty">No applicants in this stage yet.</div>
      ) : (
        <ul className="wm-erDashPipeline">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="wm-erDashPipeline__row"
                onClick={() =>
                  nav(
                    ROUTE_PATHS.employerCareerCandidateDetail
                      .replace(":postId", row.jobId)
                      .replace(":appId", row.id),
                  )
                }
              >
                <div className="wm-erDashPipeline__copy">
                  <div className="wm-erDashPipeline__title">{row.candidateName}</div>
                  <div className="wm-erDashPipeline__meta">
                    {row.jobTitle} · {formatRelativeDay(row.updatedAt)}
                  </div>
                </div>
                <span className={badgeClass(row.stage)}>{row.stage}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
