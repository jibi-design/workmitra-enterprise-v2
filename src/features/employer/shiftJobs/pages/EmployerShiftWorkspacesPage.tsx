// App name: Job Mitra
// File name: EmployerShiftWorkspacesPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\pages\EmployerShiftWorkspacesPage.tsx

import { EmployerShiftWorkspacesFilters } from "../components/EmployerShiftWorkspacesFilters";
import { EmployerShiftWorkspacesHeader } from "../components/EmployerShiftWorkspacesHeader";
import { EmployerShiftWorkspacesInfoCard } from "../components/EmployerShiftWorkspacesInfoCard";
import { EmployerShiftWorkspacesList } from "../components/EmployerShiftWorkspacesList";
import { useEmployerShiftWorkspacesState } from "../hooks/useEmployerShiftWorkspacesState";

export function EmployerShiftWorkspacesPage() {
  const state = useEmployerShiftWorkspacesState();

  return (
    <div className="wm-er-vShift">
      <EmployerShiftWorkspacesHeader mode={state.mode} onBack={state.openHome} />

      <EmployerShiftWorkspacesFilters
        query={state.query}
        filter={state.filter}
        counts={state.counts}
        onQueryChange={state.setQuery}
        onFilterChange={state.setFilter}
      />

      <EmployerShiftWorkspacesInfoCard mode={state.mode} />

      <EmployerShiftWorkspacesList
        mode={state.mode}
        allCount={state.allCount}
        workspaces={state.filteredWorkspaces}
        onOpenWorkspace={state.openWorkspace}
        onOpenPost={state.openPost}
      />
    </div>
  );
}
