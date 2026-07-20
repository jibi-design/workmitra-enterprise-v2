/** Job Mitra | ShiftSearchPage.tsx | src/features/employee/shiftJobs/pages/ShiftSearchPage.tsx */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useShiftSearchPageState } from "../hooks/useShiftSearchPageState";
import { PlannerMegaProjectSection } from "../../planner/components/PlannerMegaProjectSection";
import { PlannerProfileGateModal } from "../../planner/components/PlannerProfileGateModal";
import { isProfileComplete } from "../helpers/shiftSearchHelpers";

// Layout Engine Imports
import { Section, PageHeader } from "../../../../shared/components/layout/EnterpriseLayout";
import { GlobalToast } from "../../../../shared/components/feedback/GlobalToast";

// Feature Components
import { SavedSearchCard } from "../../../../shared/components/SavedSearchCard";
import { RecentlyViewedSection, StarredShiftsSection } from "../components/ShiftSearchSections";
import { ShiftSearchDiscoveryGuide } from "../components/ShiftSearchDiscoveryGuide";
import { ShiftSearchFilterPanel } from "../components/ShiftSearchFilterPanel";
import { ShiftSearchResultsList } from "../components/ShiftSearchResultsList";
import { ShiftSearchSaveAlert } from "../components/ShiftSearchSaveAlert";
import { ShiftSearchSmartMatches } from "../components/ShiftSearchSmartMatches";

/**
 * ARCHITECTURE NOTE:
 * Migrated to the Unified Page Engine.
 * Implements 'Targeted Resolution' for the Shift Pulse system.
 */

export function ShiftSearchPage() {
  const page = useShiftSearchPageState();
  const nav = useNavigate();
  const showSmartMatches = !page.hasFilters;
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [gigToast, setGigToast] = useState("");

  useEffect(() => {
    if (window.location.hash === "#gig-projects") {
      nav(ROUTE_PATHS.employeeShiftProjects, { replace: true });
    }
  }, [nav]);

  return (
    <>
      {/* 2. EXECUTIVE PAGE HEADER */}
      <PageHeader
        title="Find Shifts"
        subtitle="Browse daily, helper, and experienced shifts tailored for you."
      />

      {/* 3. DISCOVERY & PROFILE GUIDANCE */}
      <Section eyebrow="Discovery" title="Location & Skills">
        <div className="wm-ee-vShift">
          <ShiftSearchDiscoveryGuide
            city={page.profileCity}
            hasSkills={page.hasProfileSkills}
            isProfileReady={page.isDiscoveryProfileReady}
            onOpenProfile={page.openProfile}
          />
        </div>
      </Section>

      {/* 4. SEARCH & FILTER CONTROLS */}
      <Section eyebrow="Search" title="Filter Work">
        <ShiftSearchFilterPanel
          searchQuery={page.searchQuery}
          setSearchQuery={page.setSearchQuery}
          timeOpt={page.timeOpt}
          setTimeOpt={page.setTimeOpt}
          exp={page.exp}
          setExp={page.setExp}
          categories={page.categories}
          catFilter={page.catFilter}
          setCatFilter={page.setCatFilter}
          dur={page.dur}
          setDur={page.setDur}
          hasFilters={page.hasFilters}
          onClearFilters={page.clearFilters}
        />
        <SavedSearchCard />
      </Section>

      <Section eyebrow="Gig Projects" title="Multi-Day Project Plans">
        <div className="wm-planner-gigSection wm-ee-vPlanner wm-planner-page" id="gig-projects">
          <div className="wm-planner-gigSectionHead">
            <div className="wm-planner-gigSectionEyebrow">Agency mode</div>
            <div className="wm-planner-gigSectionTitle">Mega Project Cards</div>
          </div>
          <PlannerMegaProjectSection
            onToast={setGigToast}
            onNeedProfile={() => setProfileGateOpen(true)}
            isProfileComplete={isProfileComplete()}
          />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="wm-planner-btnGhost"
              onClick={() => nav(ROUTE_PATHS.employeeShiftProjects)}
            >
              Browse all Gig Projects →
            </button>
          </div>
        </div>
      </Section>

      <Section eyebrow="Opportunities" title="Available Shifts">
        <ShiftSearchResultsList
          discoverableCount={page.discoverablePosts.length}
          filteredPosts={page.filteredPosts}
          hasFilters={page.hasFilters}
          quickApplyEnabled={page.quickApplyEnabled}
          appliedIds={page.appliedIds}
          onOpenDetails={page.openDetails}
          onQuickApply={page.handleQuickApply}
          onClearFilters={page.clearFilters}
          onOpenProfile={page.openProfile}
        />

        {page.hasFilters && (
          <ShiftSearchSaveAlert
            searchQuery={page.searchQuery}
            catFilter={page.catFilter}
            exp={page.exp}
            minPay={0}
            onToast={page.showToast}
          />
        )}
      </Section>

      {/* 6. INTELLIGENCE (Smart Matches) */}
      {showSmartMatches && (
        <Section eyebrow="Intelligence" title="Smart Matches">
          <ShiftSearchSmartMatches
            matches={page.smartMatches}
            matchQuality={page.matchQuality}
            onOpenDetails={page.openDetails}
          />
        </Section>
      )}

      {/* 7. HISTORY & SAVED */}
      <Section eyebrow="History" title="Recently Viewed">
        <RecentlyViewedSection cards={page.recentlyViewed} onOpen={page.openDetails} />
      </Section>

      <Section eyebrow="Favorites" title="Starred Shifts">
        <StarredShiftsSection cards={page.favoriteCards} onOpen={page.openDetails} />
      </Section>

      {/* 8. GLOBAL FEEDBACK SYSTEM */}
      <GlobalToast
        message={page.toast || gigToast || ""}
        tone="success"
        visible={!!(page.toast || gigToast)}
        onClose={() => {
          page.showToast("");
          setGigToast("");
        }}
      />

      <PlannerProfileGateModal open={profileGateOpen} onClose={() => setProfileGateOpen(false)} />
    </>
  );
}
