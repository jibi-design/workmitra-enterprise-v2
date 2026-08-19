/** Job Mitra | EmployeePlannerApplicationsPage.tsx | Native planner applications (Hybrid A2 S4) */

import { PlannerApplicationsHeader } from "../components/PlannerApplicationsHeader";
import { PlannerApplicationsKpiTiles } from "../components/PlannerApplicationsKpiTiles";
import { PlannerApplicationsList } from "../components/PlannerApplicationsList";
import { PlannerApplicationsTabs } from "../components/PlannerApplicationsTabs";
import { usePlannerApplicationsState } from "../hooks/usePlannerApplicationsState";

export function EmployeePlannerApplicationsPage() {
  const { tab, kpi, counts, postMap, filteredApplications, setTab, openDiscover, openApplication } =
    usePlannerApplicationsState();

  return (
    <div className="wm-ee-vPlanner wm-planner-page" data-testid="planner-employee-applications">
      <PlannerApplicationsHeader />
      <PlannerApplicationsKpiTiles kpi={kpi} />
      <PlannerApplicationsTabs tab={tab} counts={counts} onChange={setTab} />
      <PlannerApplicationsList
        applications={filteredApplications}
        postMap={postMap}
        pipelineHint={
          filteredApplications.length === 0 && counts.all > 0
            ? "Invites or later-stage applications are in another tab — switch Active or Confirmed."
            : null
        }
        onBrowseProjects={openDiscover}
        onOpenApplication={openApplication}
      />
      <div style={{ height: 32 }} />
    </div>
  );
}
