/** Job Mitra | ShiftSearchPage.tsx | Wave B — DomainHero + stack */

import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { Section } from "../../../../shared/components/layout/EnterpriseLayout";
import { GlobalToast } from "../../../../shared/components/feedback/GlobalToast";
import { SavedSearchCard } from "../../../../shared/components/SavedSearchCard";
import { EmployeeGigProjectsPromoStrip } from "../../home/components/EmployeeGigProjectsPromoStrip";
import { useShiftSearchPageState } from "../hooks/useShiftSearchPageState";
import { RecentlyViewedSection, StarredShiftsSection } from "../components/ShiftSearchSections";
import { ShiftSearchDiscoveryGuide } from "../components/ShiftSearchDiscoveryGuide";
import { ShiftSearchFilterPanel } from "../components/ShiftSearchFilterPanel";
import { ShiftSearchResultsList } from "../components/ShiftSearchResultsList";
import { ShiftSearchSaveAlert } from "../components/ShiftSearchSaveAlert";
import { ShiftSearchSmartMatches } from "../components/ShiftSearchSmartMatches";
import { shiftApplicationsStorage } from "../storage/shiftApplications.storage";
import { resolveEmployeeShiftApplicationsTab } from "../helpers/shiftApplications.smartResume";

/**
 * Shift Search is green Shift domain only.
 * Gig mega UI lives under /employee/planner/* — outbound promo only (P-SEP-1).
 */

export function ShiftSearchPage() {
  const page = useShiftSearchPageState();
  const nav = useNavigate();
  const showSmartMatches = !page.hasFilters;
  const pipelineTab = useMemo(
    () => resolveEmployeeShiftApplicationsTab(shiftApplicationsStorage.getApps()),
    [],
  );
  const showPipelineChip = pipelineTab === "confirmed" || pipelineTab === "active";

  useEffect(() => {
    if (window.location.hash === "#gig-projects") {
      nav(ROUTE_PATHS.employeePlannerBrowse, { replace: true });
    }
  }, [nav]);

  return (
    <div
      className="wm-ee-vShift wm-stackGrid"
      data-testid="shift-search-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <DomainHero
        variant="shift"
        audience="employee"
        icon={<Search size={22} strokeWidth={2.25} />}
        title="Find Shifts"
        subtitle="Browse daily, helper, and experienced shifts tailored for you."
        description="Filter by date, experience, and category. Apply from the feed or open a shift for full details."
        trailing={<span className="wm-domainHeroBadge">Shift search</span>}
      />

      {showPipelineChip ? (
        <button
          type="button"
          className="wm-shift-surface-glass"
          data-testid="shift-search-pipeline-chip"
          onClick={() => nav(`${ROUTE_PATHS.employeeShiftApplications}?tab=${pipelineTab}`)}
          style={{ padding: "10px 12px", textAlign: "left", cursor: "pointer" }}
        >
          <div style={{ fontSize: 12, fontWeight: 950 }}>Back to your active pipeline</div>
          <div
            style={{ marginTop: 3, fontSize: 11, fontWeight: 700, color: "var(--wm-emp-muted)" }}
          >
            You have a shortlist or confirmed shift waiting. Open My Applications.
          </div>
        </button>
      ) : null}

      <div className="wm-animateIn" style={{ animationDelay: "40ms" }}>
        <Section eyebrow="Discovery" title="Location & Skills">
          <ShiftSearchDiscoveryGuide
            city={page.profileCity}
            hasSkills={page.hasProfileSkills}
            isProfileReady={page.isDiscoveryProfileReady}
            onOpenProfile={page.openProfile}
          />
        </Section>
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "70ms" }}>
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
      </div>

      <Section eyebrow="Separate app" title="Need multi-day plans?">
        <EmployeeGigProjectsPromoStrip onOpen={() => nav(ROUTE_PATHS.employeePlannerHome)} />
      </Section>

      <div className="wm-animateIn" style={{ animationDelay: "100ms" }}>
        <Section eyebrow="Opportunities" title="Available Shifts">
          <ShiftSearchResultsList
            feedStatus={page.feedStatus}
            feedErrorMessage={page.feedErrorMessage}
            discoverableCount={page.discoverablePosts.length}
            filteredPosts={page.filteredPosts}
            hasFilters={page.hasFilters}
            quickApplyEnabled={page.quickApplyEnabled}
            appliedIds={page.appliedIds}
            onOpenDetails={page.openDetails}
            onQuickApply={page.handleQuickApply}
            onClearFilters={page.clearFilters}
            onOpenProfile={page.openProfile}
            onRetryFeed={page.retryFeed}
          />

          {page.hasFilters ? (
            <ShiftSearchSaveAlert
              searchQuery={page.searchQuery}
              catFilter={page.catFilter}
              exp={page.exp}
              minPay={0}
              onToast={page.showToast}
            />
          ) : null}
        </Section>
      </div>

      {showSmartMatches ? (
        <Section eyebrow="Discovery" title="Profile Fit Score">
          <ShiftSearchSmartMatches
            matches={page.smartMatches}
            matchQuality={page.matchQuality}
            onOpenDetails={page.openDetails}
          />
        </Section>
      ) : null}

      <Section eyebrow="History" title="Recently Viewed">
        <RecentlyViewedSection cards={page.recentlyViewed} onOpen={page.openDetails} />
      </Section>

      <Section eyebrow="Favorites" title="Starred Shifts">
        <StarredShiftsSection cards={page.favoriteCards} onOpen={page.openDetails} />
      </Section>

      <GlobalToast
        message={page.toast || ""}
        tone={page.toastTone}
        visible={!!page.toast}
        onClose={() => page.showToast("")}
      />
    </div>
  );
}
