/** Employer OS — domain-specific applicant / batch tracker. */

import { useNavigate } from "react-router-dom";
import { formatRelativeDay } from "../../helpers/employerDashboard.helpers";
import type { EmployerOsDomain } from "../../helpers/employerDashboard.osTypes";
import type {
  EmployerOsStageDef,
  EmployerOsTrackerRow,
} from "../../helpers/employerDashboard.osTypes";
import { EmployerPipelineStepper } from "./EmployerPipelineStepper";

type Props = {
  readonly domain: EmployerOsDomain;
  readonly rows: readonly EmployerOsTrackerRow[];
  readonly stages: readonly EmployerOsStageDef[];
  readonly stageCounts: Record<string, number>;
  readonly filter: string;
  readonly onFilterChange: (next: string) => void;
};

const COPY: Record<
  EmployerOsDomain,
  { kicker: string; title: string; sub: string; empty: string }
> = {
  shift: {
    kicker: "Shift Jobs",
    title: "Shift applicants",
    sub: "Applied → Shortlisted → Confirmed",
    empty: "0 applicants here. Ready when workers apply.",
  },
  career: {
    kicker: "Career Jobs",
    title: "Career applicants",
    sub: "Applied → Shortlisted → Interview → Hired",
    empty: "0 applicants here. Ready when candidates apply.",
  },
  planner: {
    kicker: "Planner",
    title: "Plan applications",
    sub: "Pending → Shortlisted → Confirmed",
    empty: "0 batches here. Ready when a plan receives applies.",
  },
};

function badgeClass(stage: string): string {
  if (stage === "Shortlisted") return "wm-erDashBadge wm-erDashBadge--shortlist";
  if (stage === "Interview" || stage === "Pending")
    return "wm-erDashBadge wm-erDashBadge--interview";
  if (stage === "Hired" || stage === "Confirmed") return "wm-erDashBadge wm-erDashBadge--hired";
  if (stage === "Rejected") return "wm-erDashBadge wm-erDashBadge--rejected";
  return "wm-erDashBadge wm-erDashBadge--applied";
}

export function EmployerPipelineTracker({
  domain,
  rows,
  stages,
  stageCounts,
  filter,
  onFilterChange,
}: Props) {
  const nav = useNavigate();
  const copy = COPY[domain];

  return (
    <section className="wm-dashWidget" data-testid="employer-pipeline-tracker" data-domain={domain}>
      <div className="wm-dashWidget__kicker">{copy.kicker}</div>
      <h2 className="wm-dashWidget__title">{copy.title}</h2>
      <p className="wm-dashWidget__sub">{copy.sub}</p>

      <EmployerPipelineStepper
        stages={stages}
        counts={stageCounts}
        filter={filter}
        onSelect={onFilterChange}
      />

      {rows.length === 0 ? (
        <div className="wm-erDashEmpty">{copy.empty}</div>
      ) : (
        <ul className="wm-erDashPipeline">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="wm-erDashPipeline__row"
                onClick={() => nav(row.href)}
              >
                <div className="wm-erDashPipeline__copy">
                  <div className="wm-erDashPipeline__title">{row.title}</div>
                  <div className="wm-erDashPipeline__meta">
                    {row.subtitle} · {formatRelativeDay(row.updatedAt)}
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
