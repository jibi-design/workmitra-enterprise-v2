/** Employer Pro — active jobs management widget. */

import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { EmployerActiveJobRow } from "../../helpers/employerDashboard.helpers";

type Props = {
  readonly jobs: readonly EmployerActiveJobRow[];
};

function statusLabel(status: string): string {
  if (status === "active") return "Active";
  if (status === "draft") return "Draft";
  if (status === "paused") return "Paused";
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === "active") return "wm-erDashJobBadge wm-erDashJobBadge--active";
  if (status === "draft") return "wm-erDashJobBadge wm-erDashJobBadge--draft";
  return "wm-erDashJobBadge wm-erDashJobBadge--paused";
}

export function EmployerActiveJobsWidget({ jobs }: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget wm-erDashBentoCard" data-testid="employer-active-jobs">
      <div className="wm-dashWidget__kicker">Job board</div>
      <h2 className="wm-dashWidget__title">Active jobs</h2>
      <p className="wm-dashWidget__sub">Listings with applicant response counts.</p>

      {jobs.length === 0 ? (
        <div className="wm-erDashEmpty">Tracks: Open role listings • Applicant response counts</div>
      ) : (
        <ul className="wm-erDashJobs">
          {jobs.map((job) => (
            <li key={job.id}>
              <button
                type="button"
                className="wm-erDashJobs__row"
                onClick={() =>
                  nav(ROUTE_PATHS.employerCareerPostDashboard.replace(":postId", job.id))
                }
              >
                <div className="wm-erDashJobs__copy">
                  <div className="wm-erDashJobs__titleRow">
                    <div className="wm-erDashJobs__title">{job.title}</div>
                    <span className={statusBadgeClass(job.status)}>{statusLabel(job.status)}</span>
                  </div>
                  <div className="wm-erDashJobs__meta">
                    <span className="wm-erDashJobs__count">
                      {job.applicants} applicant{job.applicants === 1 ? "" : "s"}
                    </span>
                    <span>{job.shortlisted} shortlisted</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
