// App name: Job Mitra | EmployerShiftWorkspacesPage.tsx — Step 3 primitives

import { EmployerShiftWorkspacesFilters } from "../components/EmployerShiftWorkspacesFilters";
import { EmployerShiftWorkspacesHeader } from "../components/EmployerShiftWorkspacesHeader";
import { EmployerShiftWorkspacesInfoCard } from "../components/EmployerShiftWorkspacesInfoCard";
import { EmployerShiftWorkspacesList } from "../components/EmployerShiftWorkspacesList";
import { useEmployerShiftWorkspacesState } from "../hooks/useEmployerShiftWorkspacesState";

export function EmployerShiftWorkspacesPage() {
  const state = useEmployerShiftWorkspacesState();

  return (
    <div
      className="wm-er-vShift wm-stackGrid"
      data-testid="employer-shift-workspaces-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <EmployerShiftWorkspacesHeader mode={state.mode} onBack={state.openHome} />

      <div className="wm-animateIn" style={{ animationDelay: "60ms" }}>
        <EmployerShiftWorkspacesFilters
          query={state.query}
          filter={state.filter}
          counts={state.counts}
          onQueryChange={state.setQuery}
          onFilterChange={state.setFilter}
        />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "90ms" }}>
        <EmployerShiftWorkspacesInfoCard mode={state.mode} />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "120ms" }}>
        <EmployerShiftWorkspacesList
          mode={state.mode}
          allCount={state.allCount}
          workspaces={state.filteredWorkspaces}
          onOpenWorkspace={state.openWorkspace}
          onOpenPost={state.openPost}
        />
      </div>
    </div>
  );
}
