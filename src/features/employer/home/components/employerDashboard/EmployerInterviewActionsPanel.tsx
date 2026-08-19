/** Employer Pro — interview schedule + quick contact actions. */

import { Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import type { EmployerInterviewRow } from "../../helpers/employerDashboard.helpers";

type Props = {
  readonly interviews: readonly EmployerInterviewRow[];
};

export function EmployerInterviewActionsPanel({ interviews }: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget" data-testid="employer-interview-actions">
      <div className="wm-dashWidget__kicker">Interviews</div>
      <h2 className="wm-dashWidget__title">Schedule &amp; contact</h2>
      <p className="wm-dashWidget__sub">Upcoming interviews with quick candidate contact.</p>

      {interviews.length === 0 ? (
        <div className="wm-erDashEmpty">No scheduled interviews right now.</div>
      ) : (
        <ul className="wm-erDashInterviewList">
          {interviews.map((item) => (
            <li key={`${item.appId}-${item.roundLabel}-${item.scheduledDate}`} className="wm-erDashInterviewList__item">
              <div className="wm-erDashInterviewList__copy">
                <div className="wm-erDashInterviewList__title">{item.candidateName}</div>
                <div className="wm-erDashInterviewList__meta">
                  {item.jobTitle} · {item.roundLabel} · {item.scheduledDate}
                  {item.scheduledTime ? ` ${item.scheduledTime}` : ""} · {item.mode}
                </div>
              </div>
              <div className="wm-erDashInterviewList__actions">
                {item.phone ? (
                  <a
                    className="wm-outlineBtn wm-erDashContactBtn"
                    href={`tel:${item.phone.replace(/\s+/g, "")}`}
                    aria-label={`Call ${item.candidateName}`}
                  >
                    <Phone size={14} />
                  </a>
                ) : null}
                {item.email ? (
                  <a
                    className="wm-outlineBtn wm-erDashContactBtn"
                    href={`mailto:${item.email}`}
                    aria-label={`Email ${item.candidateName}`}
                  >
                    <Mail size={14} />
                  </a>
                ) : null}
                <button
                  type="button"
                  className="wm-outlineBtn"
                  style={{ fontSize: 12, padding: "6px 10px" }}
                  onClick={() =>
                    nav(
                      ROUTE_PATHS.employerCareerCandidateDetail
                        .replace(":postId", item.jobId)
                        .replace(":appId", item.appId),
                    )
                  }
                >
                  Open
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
