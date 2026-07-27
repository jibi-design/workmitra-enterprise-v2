// App name: Job Mitra | MyShiftWorkspacesPage.tsx — Step 3 primitives

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
    <div
      className="wm-ee-vShift wm-stackGrid"
      data-testid="my-shift-workspaces-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <MyShiftWorkspacesHeader onFindShifts={openFindShifts} />

      <div className="wm-animateIn" style={{ animationDelay: "60ms" }}>
        <MyShiftWorkspacesSearch query={query} onQueryChange={setQuery} />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "90ms" }}>
        <MyShiftWorkspacesTabs tab={tab} counts={counts} onTabChange={setTab} domain="shift" />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "120ms" }}>
        <MyShiftWorkspacesList
          tab={tab}
          workspaces={filteredWorkspaces}
          onOpenWorkspace={openWorkspace}
          domain="shift"
        />
      </div>
    </div>
  );
}
