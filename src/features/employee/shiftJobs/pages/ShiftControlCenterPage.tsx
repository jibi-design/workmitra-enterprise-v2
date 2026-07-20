// App name: Job Mitra
// File name: ShiftControlCenterPage.tsx
// Level 3.1 — 7-day calendar, direct-invite pending hub, workspace merge on accept.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PendingActionsHub } from "../../../../shared/components/PendingActionsHub";
import { useEmployeeShiftPendingActions } from "../../../../shared/pendingActions/hooks/useEmployeeShiftPendingActions";
import { useEmployeeUrgentPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployeeUrgentPendingHubItems";
import { ShiftDirectInviteSafetyModals } from "../components/ShiftDirectInviteSafetyModals";
import { ShiftToast } from "../components/ShiftPostDetailSections";
import { useEmployeeDirectInvitePendingFlow } from "../hooks/useEmployeeDirectInvitePendingFlow";
import { useShiftControlCenterState } from "../hooks/useShiftControlCenterState";
import { useShiftAvailabilityMatchPulse } from "../hooks/useShiftAvailabilityMatchPulse";
import { ShiftAvailabilityBroadcastCard } from "../components/ShiftAvailabilityBroadcastCard";
import { ShiftControlCenterActionCards } from "../components/ShiftControlCenterActionCards";
import { ShiftCalendarIcon } from "../components/ShiftControlCenterIcons";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { ShiftControlCenterPreviewPosts } from "../components/ShiftControlCenterPreviewPosts";
import { ShiftControlCenterStatsTiles } from "../components/ShiftControlCenterStatsTiles";
import { ShiftHowItWorksCard } from "../components/ShiftHowItWorksCard";
import { EmployeeGigProjectsPromoStrip } from "../../home/components/EmployeeGigProjectsPromoStrip";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";

export function ShiftControlCenterPage() {
  useShiftAvailabilityMatchPulse();
  const nav = useNavigate();

  const directInviteFlow = useEmployeeDirectInvitePendingFlow();
  const urgentPendingActions = useEmployeeUrgentPendingHubItems(nav);
  const shiftPendingActions = useEmployeeShiftPendingActions();
  const allPendingActions = useMemo(
    () => [...directInviteFlow.hubItems, ...urgentPendingActions, ...shiftPendingActions],
    [directInviteFlow.hubItems, urgentPendingActions, shiftPendingActions],
  );

  const {
    counts,
    previewPosts,
    howOpen,
    selectedDates,
    shiftReviewPendingCount,
    openSearch,
    openApplications,
    openEarnings,
    openWorkspaces,
    openReviewCenter,
    openPost,
    toggleHowOpen,
    handleToggleDay,
  } = useShiftControlCenterState();

  return (
    <div className="wm-ee-vShift wm-shiftEmployeeHomePage wm-stackGrid">
      <DomainHero
        variant="shift"
        audience="employee"
        icon={<ShiftCalendarIcon />}
        title="Shift Jobs"
        subtitle="Find shifts, track applications, manage workspaces"
        description="Search available shifts, follow application status, manage active workspaces, and keep your work records clear."
        trailing={<span className="wm-domainHeroBadge">Live shift hub</span>}
      />

      <ShiftControlCenterStatsTiles counts={counts} />

      {allPendingActions.length > 0 ? (
        <div
          className="wm-shiftEmployeePendingHubWrap wm-animateIn"
          style={{ animationDelay: "60ms" }}
        >
          <PendingActionsHub items={allPendingActions} />
        </div>
      ) : null}

      <div className="wm-animateIn" style={{ animationDelay: "120ms" }}>
        <ShiftAvailabilityBroadcastCard
          selectedDates={selectedDates}
          onToggleDay={handleToggleDay}
        />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "180ms" }}>
        <EmployeeGigProjectsPromoStrip onOpen={() => nav(ROUTE_PATHS.employeePlannerHome)} />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "240ms" }}>
        <ShiftControlCenterActionCards
          counts={counts}
          shiftReviewPendingCount={shiftReviewPendingCount}
          onOpenSearch={openSearch}
          onOpenApplications={openApplications}
          onOpenEarnings={openEarnings}
          onOpenWorkspaces={openWorkspaces}
          onOpenReviews={openReviewCenter}
        />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "300ms" }}>
        <ShiftControlCenterPreviewPosts
          posts={previewPosts}
          onBrowseAll={openSearch}
          onOpenPost={openPost}
        />
      </div>

      <div className="wm-animateIn" style={{ animationDelay: "360ms" }}>
        <ShiftHowItWorksCard open={howOpen} onToggle={toggleHowOpen} />
      </div>

      <ShiftDirectInviteSafetyModals
        modal={directInviteFlow.modal}
        isBusy={directInviteFlow.isBusy}
        onCancel={directInviteFlow.closeModal}
        onConfirm={directInviteFlow.confirmModalAction}
      />

      {directInviteFlow.toast ? <ShiftToast message={directInviteFlow.toast} /> : null}
    </div>
  );
}
