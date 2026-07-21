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
      <PlannerApplicationsHeader onBrowseProjects={openDiscover} />
      <PlannerApplicationsKpiTiles kpi={kpi} />
      <PlannerApplicationsTabs tab={tab} counts={counts} onChange={setTab} />
      <PlannerApplicationsList
        applications={filteredApplications}
        postMap={postMap}
        onBrowseProjects={openDiscover}
        onOpenApplication={openApplication}
      />
      <div style={{ height: 32 }} />
    </div>
  );
}
