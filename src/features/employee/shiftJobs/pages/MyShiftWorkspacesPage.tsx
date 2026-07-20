// App name: Job Mitra
// File name: MyShiftWorkspacesPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\pages\MyShiftWorkspacesPage.tsx

import { MyShiftWorkspacesHeader } from "../components/MyShiftWorkspacesHeader";
import { MyShiftWorkspacesList } from "../components/MyShiftWorkspacesList";
import { MyShiftWorkspacesSearch } from "../components/MyShiftWorkspacesSearch";
import { MyShiftWorkspacesTabs } from "../components/MyShiftWorkspacesTabs";
import { useMyShiftWorkspacesState } from "../hooks/useMyShiftWorkspacesState";

export function MyShiftWorkspacesPage() {
  const {
    tab,
    query,
    counts,
    filteredWorkspaces,
    setTab,
    setQuery,
    openFindShifts,
    openWorkspace,
  } = useMyShiftWorkspacesState();

  return (
    <div className="wm-ee-vShift">
      <MyShiftWorkspacesHeader onFindShifts={openFindShifts} />

      <MyShiftWorkspacesSearch query={query} onQueryChange={setQuery} />

      <MyShiftWorkspacesTabs tab={tab} counts={counts} onTabChange={setTab} domain="shift" />

      <MyShiftWorkspacesList
        tab={tab}
        workspaces={filteredWorkspaces}
        onOpenWorkspace={openWorkspace}
        domain="shift"
      />
    </div>
  );
}
