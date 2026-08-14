// App name: Job Mitra
// File name: EmployeeCareerSearchPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerSearchPage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EmployeeCareerSearchHeader } from "../components/EmployeeCareerSearchHeader";
import { EmployeeCareerSearchNotice } from "../components/EmployeeCareerSearchNotice";
import type { CareerSearchMainTab } from "../components/EmployeeCareerSearchTabBar";
import { EmployeeCareerSearchTabBar } from "../components/EmployeeCareerSearchTabBar";
import { EmployeeCareerSearchTabContent } from "../components/EmployeeCareerSearchTabContent";
import { EmployeeCareerSearchWorkspace } from "../components/EmployeeCareerSearchWorkspace";
import { useEmployeeCareerSearchPageState } from "../hooks/useEmployeeCareerSearchPageState";
import { computeTabCounts, getAppsSnapshot } from "../helpers/careerApplicationHelpers";
import { resolveEmployeeCareerApplicationsTab } from "../helpers/careerApplications.smartResume";

export function EmployeeCareerSearchPage() {
  const state = useEmployeeCareerSearchPageState();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState<CareerSearchMainTab>("search");
  const [showFilters, setShowFilters] = useState(false);
  const pipelineTab = useMemo(
    () => resolveEmployeeCareerApplicationsTab(computeTabCounts(getAppsSnapshot())),
    [],
  );
  const showPipelineChip = pipelineTab === "offers" || pipelineTab === "interview";

  const hasSearchText = state.query.trim().length > 0 || state.locationQuery.trim().length > 0;

  return (
    <div className="wm-ee-vCareer wm-stackGrid" style={{ paddingBottom: 40, paddingTop: 10 }}>
      <EmployeeCareerSearchHeader />

      {showPipelineChip ? (
        <button
          type="button"
          className="wm-er-card"
          data-testid="career-search-pipeline-chip"
          onClick={() => nav(`${ROUTE_PATHS.employeeCareerApplications}?tab=${pipelineTab}`)}
          style={{ padding: "10px 12px", textAlign: "left", cursor: "pointer" }}
        >
          <div style={{ fontSize: 12, fontWeight: 950 }}>
            Back to your active offer or interview
          </div>
          <div style={{ marginTop: 3, fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)" }}>
            A hiring step is waiting. Open My Applications instead of starting a new search.
          </div>
        </button>
      ) : null}

      <EmployeeCareerSearchWorkspace
        state={state}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((value) => !value)}
        hasSearchText={hasSearchText}
      />

      <EmployeeCareerSearchTabBar activeTab={activeTab} onChange={setActiveTab} />

      <section style={{ padding: "0 4px" }}>
        <EmployeeCareerSearchTabContent
          activeTab={activeTab}
          state={state}
          hasSearchText={hasSearchText}
        />
      </section>

      <EmployeeCareerSearchNotice notice={state.notice} />
    </div>
  );
}
