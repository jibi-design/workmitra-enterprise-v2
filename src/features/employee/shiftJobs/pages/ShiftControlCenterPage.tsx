// App name: Job Mitra
// File name: ShiftControlCenterPage.tsx
// Shift Jobs Home — discovery: stats + Find/Applications + Featured preview

import { ShiftDirectInviteSafetyModals } from "../components/ShiftDirectInviteSafetyModals";
import { ShiftToast } from "../components/ShiftPostDetailSections";
import { useEmployeeDirectInvitePendingFlow } from "../hooks/useEmployeeDirectInvitePendingFlow";
import { useShiftControlCenterState } from "../hooks/useShiftControlCenterState";
import { useShiftAvailabilityMatchPulse } from "../hooks/useShiftAvailabilityMatchPulse";
import { ShiftControlCenterActionCards } from "../components/ShiftControlCenterActionCards";
import { ShiftControlCenterPreviewPosts } from "../components/ShiftControlCenterPreviewPosts";
import { ShiftCalendarIcon } from "../components/ShiftControlCenterIcons";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { ShiftControlCenterStatsTiles } from "../components/ShiftControlCenterStatsTiles";

export function ShiftControlCenterPage() {
  useShiftAvailabilityMatchPulse();
  const directInviteFlow = useEmployeeDirectInvitePendingFlow();

  const { counts, previewPosts, openSearch, openApplications, openPost } =
    useShiftControlCenterState();

  return (
    <div
      className="wm-ee-vShift wm-shiftEmployeeHomePage wm-stackGrid"
      data-testid="shift-jobs-home-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <DomainHero
        variant="shift"
        audience="employee"
        icon={<ShiftCalendarIcon />}
        title="Shift Jobs Home"
        subtitle="Discover shifts and track applications"
        description="Browse open shifts, manage applications, and jump into live work from Shift Ops — all in one place."
        trailing={
          <span className="wm-domainHeroBadge" data-testid="shift-jobs-status-pill">
            Live work → Shift Ops
          </span>
        }
      />

      <ShiftControlCenterStatsTiles counts={counts} />

      <div className="wm-animateIn wm-shift-stagger--1">
        <ShiftControlCenterActionCards
          counts={counts}
          onOpenSearch={openSearch}
          onOpenApplications={openApplications}
        />
      </div>

      <div className="wm-animateIn wm-shift-stagger--2">
        <ShiftControlCenterPreviewPosts
          posts={previewPosts}
          onBrowseAll={openSearch}
          onOpenPost={openPost}
        />
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
