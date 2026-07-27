// App name: Job Mitra
// File name: EmployeeCareerSearchTabContent.tsx

import { EmployeeCareerSearchResults } from "./EmployeeCareerSearchResults";
import type { CareerSearchMainTab } from "./EmployeeCareerSearchTabBar";
import type { useEmployeeCareerSearchPageState } from "../hooks/useEmployeeCareerSearchPageState";

type SearchState = ReturnType<typeof useEmployeeCareerSearchPageState>;

export function EmployeeCareerSearchTabContent({
  activeTab,
  state,
  hasSearchText,
}: {
  activeTab: CareerSearchMainTab;
  state: SearchState;
  hasSearchText: boolean;
}) {
  const sharedProps = {
    savedJobIds: state.savedJobIds,
    applicationStatusByPostId: state.applicationStatusByPostId,
    onOpen: state.openDetails,
    onOpenApplications: state.openApplications,
    onToggleSaved: state.toggleSaved,
    onClearFilters: state.clearFilters,
  };

  if (activeTab === "search") {
    return (
      <EmployeeCareerSearchResults
        posts={state.visiblePosts}
        savedPosts={state.savedPosts}
        recentPosts={state.recentPosts}
        appliedPosts={state.appliedPosts}
        activeTab={state.activeTab}
        resultTitle={hasSearchText ? "Search results" : "Recommended for you"}
        hasFilters={state.hasFilters}
        query={state.query}
        {...sharedProps}
      />
    );
  }

  if (activeTab === "recent") {
    return (
      <EmployeeCareerSearchResults
        posts={state.recentPosts}
        savedPosts={[]}
        recentPosts={[]}
        appliedPosts={[]}
        activeTab="recent"
        resultTitle={`Recently viewed (${state.recentPosts.length})`}
        hasFilters={false}
        query=""
        {...sharedProps}
      />
    );
  }

  if (activeTab === "saved") {
    return (
      <EmployeeCareerSearchResults
        posts={state.savedPosts}
        savedPosts={[]}
        recentPosts={[]}
        appliedPosts={[]}
        activeTab="saved"
        resultTitle={`Saved jobs (${state.savedPosts.length})`}
        hasFilters={false}
        query=""
        {...sharedProps}
      />
    );
  }

  return (
    <EmployeeCareerSearchResults
      posts={state.appliedPosts}
      savedPosts={[]}
      recentPosts={[]}
      appliedPosts={[]}
      activeTab="applied"
      resultTitle={`Applied jobs (${state.appliedPosts.length})`}
      hasFilters={false}
      query=""
      {...sharedProps}
    />
  );
}
