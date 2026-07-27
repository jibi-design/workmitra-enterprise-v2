// App name: Job Mitra
// File name: EmployeeCareerSearchPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerSearchPage.tsx

import { useState } from "react";
import { EmployeeCareerSearchHeader } from "../components/EmployeeCareerSearchHeader";
import { EmployeeCareerSearchNotice } from "../components/EmployeeCareerSearchNotice";
import type { CareerSearchMainTab } from "../components/EmployeeCareerSearchTabBar";
import { EmployeeCareerSearchTabBar } from "../components/EmployeeCareerSearchTabBar";
import { EmployeeCareerSearchTabContent } from "../components/EmployeeCareerSearchTabContent";
import { EmployeeCareerSearchWorkspace } from "../components/EmployeeCareerSearchWorkspace";
import { useEmployeeCareerSearchPageState } from "../hooks/useEmployeeCareerSearchPageState";

export function EmployeeCareerSearchPage() {
  const state = useEmployeeCareerSearchPageState();
  const [activeTab, setActiveTab] = useState<CareerSearchMainTab>("search");
  const [showFilters, setShowFilters] = useState(false);

  const hasSearchText = state.query.trim().length > 0 || state.locationQuery.trim().length > 0;

  return (
    <div className="wm-ee-vCareer wm-stackGrid" style={{ paddingBottom: 40, paddingTop: 10 }}>
      <EmployeeCareerSearchHeader />

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
