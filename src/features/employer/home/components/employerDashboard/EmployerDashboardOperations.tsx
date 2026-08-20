/** Operations tab — Shift / Career / Planner OS lanes. */

import { useMemo, useState } from "react";
import { ROUTE_PATHS } from "../../../../../app/router/routePaths";
import { EmployerActiveJobsWidget } from "./EmployerActiveJobsWidget";
import { EmployerDashMetricsCards } from "./EmployerDashMetricsCards";
import { EmployerDomainOpenList } from "./EmployerDomainOpenList";
import { EmployerInterviewActionsPanel } from "./EmployerInterviewActionsPanel";
import { EmployerMatchPanel } from "./EmployerMatchPanel";
import { EmployerPipelineTracker } from "./EmployerPipelineTracker";
import { EmployerOsWorkspaceStrip } from "./EmployerOsWorkspaceStrip";
import { careerPipelineToOsRows, CAREER_OS_STAGES } from "../../helpers/employerDashboard.osCareer";
import { PLANNER_OS_STAGES } from "../../helpers/employerDashboard.osPlanner";
import { SHIFT_OS_STAGES } from "../../helpers/employerDashboard.osShift";
import {
  countOsStages,
  EMPLOYER_OS_DEFAULT_STAGE,
  filterOsRows,
  type EmployerOsDomain,
} from "../../helpers/employerDashboard.osTypes";
import { useEmployerDashboardModel } from "../../hooks/useEmployerDashboardModel";
import { useEmployerOsDashboardModel } from "../../hooks/useEmployerOsDashboardModel";

export function EmployerDashboardOperations() {
  const [domain, setDomain] = useState<EmployerOsDomain>("shift");
  const [filter, setFilter] = useState(EMPLOYER_OS_DEFAULT_STAGE.shift);
  const os = useEmployerOsDashboardModel();
  const career = useEmployerDashboardModel("all");

  function selectDomain(next: EmployerOsDomain) {
    setDomain(next);
    setFilter(EMPLOYER_OS_DEFAULT_STAGE[next]);
  }

  const stages =
    domain === "shift"
      ? SHIFT_OS_STAGES
      : domain === "planner"
        ? PLANNER_OS_STAGES
        : CAREER_OS_STAGES;

  const sourceRows = useMemo(() => {
    if (domain === "shift") return os.shiftRows;
    if (domain === "planner") return os.plannerRows;
    return careerPipelineToOsRows(career.pipeline);
  }, [domain, os.shiftRows, os.plannerRows, career.pipeline]);

  const stageCounts = countOsStages(sourceRows, stages);
  const rows = filterOsRows(sourceRows, filter);

  return (
    <>
      <EmployerOsWorkspaceStrip strip={os.workspaces} />
      <EmployerDashMetricsCards
        shift={os.shiftSnap}
        career={os.careerSnap}
        planner={os.plannerSnap}
        selected={domain}
        onSelect={selectDomain}
      />

      <EmployerPipelineTracker
        domain={domain}
        rows={rows}
        stages={stages}
        stageCounts={stageCounts}
        filter={filter}
        onFilterChange={setFilter}
      />

      {domain === "career" ? (
        <>
          <div className="wm-erDashBento" data-testid="employer-jobs-matches-bento">
            <EmployerActiveJobsWidget jobs={career.activeJobs} />
            <EmployerMatchPanel items={career.matches} />
          </div>
          <EmployerInterviewActionsPanel interviews={career.interviews} />
        </>
      ) : null}

      {domain === "shift" ? (
        <div className="wm-erDashBento" data-testid="employer-shift-open-bento">
          <EmployerDomainOpenList
            kicker="Shift Jobs"
            title="Upcoming & open shifts"
            sub="Soonest start first. Upcoming posts are marked."
            empty="No open Shift posts yet."
            ctaLabel="Post a shift"
            ctaHref={ROUTE_PATHS.employerShiftCreate}
            rows={os.shiftOpen}
            testId="employer-shift-open-list"
          />
        </div>
      ) : null}

      {domain === "planner" ? (
        <div className="wm-erDashBento" data-testid="employer-planner-open-bento">
          <EmployerDomainOpenList
            kicker="Planner"
            title="Open plans"
            sub="Draft and active demand plans."
            empty="No open plans yet."
            ctaLabel="Create a plan"
            ctaHref={ROUTE_PATHS.employerPlannerNew}
            rows={os.plannerOpen}
            testId="employer-planner-open-list"
          />
        </div>
      ) : null}
    </>
  );
}
