// Job Mitra | EmployeePlannerWorkspacesPage.tsx | Gig project workspaces only

import { MyShiftWorkspacesHeader } from "../../shiftJobs/components/MyShiftWorkspacesHeader";
import { MyShiftWorkspacesList } from "../../shiftJobs/components/MyShiftWorkspacesList";
import { MyShiftWorkspacesSearch } from "../../shiftJobs/components/MyShiftWorkspacesSearch";
import { MyShiftWorkspacesTabs } from "../../shiftJobs/components/MyShiftWorkspacesTabs";
import { useMyShiftWorkspacesState } from "../../shiftJobs/hooks/useMyShiftWorkspacesState";

export function EmployeePlannerWorkspacesPage() {
  const {
    tab,
    query,
    counts,
    filteredWorkspaces,
    setTab,
    setQuery,
    openFindShifts,
    openWorkspace,
  } = useMyShiftWorkspacesState("planner");

  return (
    <div className="wm-ee-vPlanner wm-planner-page">
      <MyShiftWorkspacesHeader domain="planner" onFindShifts={openFindShifts} />

      <MyShiftWorkspacesSearch query={query} onQueryChange={setQuery} />

      <MyShiftWorkspacesTabs tab={tab} counts={counts} onTabChange={setTab} domain="planner" />

      <MyShiftWorkspacesList
        tab={tab}
        workspaces={filteredWorkspaces}
        onOpenWorkspace={openWorkspace}
        domain="planner"
      />
    </div>
  );
}
