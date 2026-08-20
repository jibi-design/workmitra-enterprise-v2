/** Compact open-item list for Shift posts or Planner plans. */

import { useNavigate } from "react-router-dom";
import type { EmployerOsOpenRow } from "../../helpers/employerDashboard.osTypes";

type Props = {
  readonly kicker: string;
  readonly title: string;
  readonly sub: string;
  readonly empty: string;
  readonly rows: readonly EmployerOsOpenRow[];
  readonly testId: string;
};

export function EmployerDomainOpenList({ kicker, title, sub, empty, rows, testId }: Props) {
  const nav = useNavigate();

  return (
    <section className="wm-dashWidget wm-erDashBentoCard" data-testid={testId}>
      <div className="wm-dashWidget__kicker">{kicker}</div>
      <h2 className="wm-dashWidget__title">{title}</h2>
      <p className="wm-dashWidget__sub">{sub}</p>

      {rows.length === 0 ? (
        <div className="wm-erDashEmpty">{empty}</div>
      ) : (
        <ul className="wm-erDashJobs">
          {rows.map((row) => (
            <li key={row.id}>
              <button type="button" className="wm-erDashJobs__row" onClick={() => nav(row.href)}>
                <div className="wm-erDashJobs__copy">
                  <div className="wm-erDashJobs__titleRow">
                    <div className="wm-erDashJobs__title">{row.title}</div>
                    <span
                      className={`wm-erDashJobBadge wm-erDashJobBadge--${row.badge.toLowerCase()}`}
                    >
                      {row.badge}
                    </span>
                  </div>
                  <div className="wm-erDashJobs__meta">{row.meta}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
