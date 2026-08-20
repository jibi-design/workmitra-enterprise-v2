/** Operations tab — Shift / Career / Planner OS lanes. */

import { useMemo, useState } from "react";
import { EmployerDashMetricsCards } from "./EmployerDashMetricsCards";
import { EmployerPipelineTracker } from "./EmployerPipelineTracker";
import { EmployerCapabilityRibbon } from "./EmployerCapabilityRibbon";
import { EmployerDomainWorkflowPath } from "./EmployerDomainWorkflowPath";
import { EmployerLaneSubSections } from "./EmployerLaneSubSections";
import { overlayLanePreviewCards } from "../../helpers/employerDashboard.lanePreview.live";
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
import { useEmployerOsLiveHydrate } from "../../hooks/useEmployerOsLiveHydrate";

export function EmployerDashboardOperations() {
  const [domain, setDomain] = useState<EmployerOsDomain>("shift");
  const [filter, setFilter] = useState(EMPLOYER_OS_DEFAULT_STAGE.shift);
  const os = useEmployerOsDashboardModel();
  const live = useEmployerOsLiveHydrate();
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
  const laneCards = overlayLanePreviewCards(domain, os.laneLive);

  return (
    <>
      <EmployerCapabilityRibbon
        shift={os.shiftSnap}
        career={os.careerSnap}
        planner={os.plannerSnap}
        workspaces={os.workspaces}
        shiftStartingSoon={os.shiftStartingSoon}
        shiftUpcoming={os.shiftUpcoming}
        workspaceClockedIn={Math.max(os.extras.workspaceClockedIn, live.hrClockedIn)}
        gatePending={os.extras.gatePending}
        gateFlags={os.extras.gateFlags}
        vaultExpiring={os.extras.vaultExpiring}
        liveState={live.state}
      />

      <div className="wm-erDashFocusZone" data-testid="employer-focus-zone">
        <div className="wm-erDashFocusZone__kicker">Work this lane</div>
        <EmployerDashMetricsCards
          shift={os.shiftSnap}
          career={os.careerSnap}
          planner={os.plannerSnap}
          selected={domain}
          onSelect={selectDomain}
        />

        <EmployerDomainWorkflowPath domain={domain} />

        <EmployerPipelineTracker
          domain={domain}
          rows={rows}
          stages={stages}
          stageCounts={stageCounts}
          filter={filter}
          onFilterChange={setFilter}
        />

        <EmployerLaneSubSections domain={domain} cards={laneCards} />
      </div>
    </>
  );
}
