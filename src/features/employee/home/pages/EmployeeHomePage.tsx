/** Job Mitra | EmployeeHomePage.tsx | src/features/employee/home/pages/EmployeeHomePage.tsx */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { PendingActionsHub } from "../../../../shared/components/PendingActionsHub";
import { useEmployeeRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployeeRoleHomePendingActions";
import { useEmployeeUrgentPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployeeUrgentPendingHubItems";
import { ShiftDirectInviteSafetyModals } from "../../shiftJobs/components/ShiftDirectInviteSafetyModals";
import { ShiftToast } from "../../shiftJobs/components/ShiftPostDetailSections";
import { useEmployeeDirectInvitePendingFlow } from "../../shiftJobs/hooks/useEmployeeDirectInvitePendingFlow";
import {
  EMPLOYEE_HOME_WELCOME_KEY,
  EMPLOYEE_ONBOARDING_KEY,
  EMPLOYEE_SLIDES,
  ONBOARDING_KEY,
} from "../../../../shared/components/onboardingConstants";
import { useEmployeeHRRecords } from "../../employment/helpers/employeeHRSubscription";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { EmployeeHomeMainSections } from "../components/EmployeeHomeMainSections";
import { EmployeeHomeTopTiles } from "../components/EmployeeHomeTopTiles";
import { EmployeeHomeWelcomeCard } from "../components/EmployeeHomeWelcomeCard";
import { ProfileNudgeCard } from "../components/ProfileNudgeCard";
import { formatNumber, n, readDemo } from "../helpers/employeeHomeHelpers";

// AUDIT: Storage check functions preserved for future expansion but kept internal
function hasSeenEmployeeOnboarding(): boolean {
  try {
    return (
      localStorage.getItem(EMPLOYEE_ONBOARDING_KEY) === "1" ||
      localStorage.getItem(ONBOARDING_KEY) === "1"
    );
  } catch {
    return true;
  }
}

function hasSeenEmployeeHomeWelcome(): boolean {
  try {
    return localStorage.getItem(EMPLOYEE_HOME_WELCOME_KEY) === "1";
  } catch {
    return true;
  }
}

function markEmployeeHomeWelcomeSeen(): void {
  try {
    localStorage.setItem(EMPLOYEE_HOME_WELCOME_KEY, "1");
  } catch {
    // Fail-silent for demo mode
  }
}

export function EmployeeHomePage() {
  const nav = useNavigate();
  const pendingActions = useEmployeeRoleHomePendingActions(nav);
  const urgentPendingActions = useEmployeeUrgentPendingHubItems(nav);
  const directInviteFlow = useEmployeeDirectInvitePendingFlow();
  const allPendingActions = useMemo(
    () => [...directInviteFlow.hubItems, ...urgentPendingActions, ...pendingActions],
    [directInviteFlow.hubItems, urgentPendingActions, pendingActions],
  );

  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenEmployeeOnboarding());

  const demo = useMemo(() => readDemo(), []);
  const flags = useMemo(() => demo.flags ?? {}, [demo]);
  const counts = demo.counts ?? {};

  const showShift = flags.shiftEnabled ?? true;
  const showCareer = flags.careerEnabled ?? true;
  const anyDomain = showShift || showCareer;

  const upcomingShift = n(counts.upcomingShifts7d, 0);
  const shiftBroadcastUnread = n(counts.alerts, 0);

  const [showWelcome, setShowWelcome] = useState(() => !hasSeenEmployeeHomeWelcome());
  const [welcomeFading, setWelcomeFading] = useState(false);

  const userDisplayName = useMemo(() => {
    const profile = employeeProfileStorage.get();
    return profile.fullName || "User";
  }, []);

  const isFirstTime = useMemo(() => !flags.shiftEnabled && !flags.careerEnabled, [flags]);

  useEffect(() => {
    if (!isFirstTime || !showWelcome) return;

    markEmployeeHomeWelcomeSeen();

    const fadeTimer = setTimeout(() => setWelcomeFading(true), 10000);
    const removeTimer = setTimeout(() => setShowWelcome(false), 10500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [isFirstTime, showWelcome]);

  const hrRecords = useEmployeeHRRecords();
  const pendingOffers = hrRecords.filter((record) => record.status === "offered");

  const handleShiftTile = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  const handleBroadcastTile = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftWorkspaces);
  }, [nav]);

  const handleFindShifts = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftSearch);
  }, [nav]);

  const handleCareerSearch = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerSearch);
  }, [nav]);

  const handleViewHistory = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftEarnings);
  }, [nav]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wm-stack-gap)",
        fontFamily: `"Inter", "Plus Jakarta Sans", system-ui, sans-serif`,
      }}
    >
      <EmployeeHomeTopTiles
        userName={userDisplayName}
        upcomingShiftDisplay={formatNumber(upcomingShift)}
        shiftBroadcastUnreadDisplay={formatNumber(shiftBroadcastUnread)}
        onShiftTile={handleShiftTile}
        onBroadcastTile={handleBroadcastTile}
      />

      <PendingActionsHub items={allPendingActions} />

      <ShiftDirectInviteSafetyModals
        modal={directInviteFlow.modal}
        isBusy={directInviteFlow.isBusy}
        onCancel={directInviteFlow.closeModal}
        onConfirm={directInviteFlow.confirmModalAction}
      />

      {directInviteFlow.toast ? <ShiftToast message={directInviteFlow.toast} /> : null}

      {/* 2. DYNAMIC CONTENT AREA */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--wm-stack-gap)" }}>
        {isFirstTime && showWelcome && (
          <EmployeeHomeWelcomeCard
            userDisplayName={userDisplayName}
            welcomeFading={welcomeFading}
          />
        )}

        <ProfileNudgeCard />

        {/* BENTO GRID ACTION CARDS - AUDIT: Aligned with simplified Props */}
        <EmployeeHomeMainSections
          anyDomain={anyDomain}
          showShift={showShift}
          showCareer={showCareer}
          pendingOffers={pendingOffers}
          onFindShifts={handleFindShifts}
          onCareerSearch={handleCareerSearch}
          onViewHistory={handleViewHistory}
        />
      </div>

      {showOnboarding && (
        <OnboardingOverlay
          slides={EMPLOYEE_SLIDES}
          ctaLabel="Complete My Profile"
          storageKey={EMPLOYEE_ONBOARDING_KEY}
          onComplete={() => {
            setShowOnboarding(false);
            nav(ROUTE_PATHS.employeeProfile);
          }}
        />
      )}
    </div>
  );
}
