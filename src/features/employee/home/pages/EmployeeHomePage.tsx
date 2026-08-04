/** Job Mitra | EmployeeHomePage.tsx | Cross-domain home — no Shift-ops duplicates */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { PendingActionsHub } from "../../../../shared/components/PendingActionsHub";
import { HomePageSkeleton } from "../../../../shared/components/layout/HomePageSkeleton";
import { useEmployeeRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployeeRoleHomePendingActions";
import { useEmployeeUrgentPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployeeUrgentPendingHubItems";
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
import { InsightsCard } from "../components/EmployeeInsightsCard";
import { ProfileNudgeCard } from "../components/ProfileNudgeCard";
import { formatNumber, n, readDemo } from "../helpers/employeeHomeHelpers";
import { HomeSectionPanel } from "../../../../shared/components/layout/HomeSectionPanel";
import {
  hasPendingGroupJoin,
  resolvePendingGroupJoinOrchestration,
} from "../../../shiftOps/helpers/groupJoinDeepLink";
import { PendingGroupJoinBanner } from "../../../shiftOps/components/PendingGroupJoinBanner";
import { IncomingCallAnswerBanner } from "../../../shared/calling";
import { resolveIncomingCallerIdentity } from "../../shiftJobs/helpers/incomingCallIdentity";

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
  const allPendingActions = useMemo(
    () => [...urgentPendingActions, ...pendingActions],
    [urgentPendingActions, pendingActions],
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
  const [chromeReady, setChromeReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChromeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const userDisplayName = useMemo(() => {
    const profile = employeeProfileStorage.get();
    return profile.fullName || "User";
  }, []);

  const employeeMlId = useMemo(() => employeeProfileStorage.get().uniqueId?.trim() ?? "", []);

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

  useEffect(() => {
    if (showOnboarding) return;
    const next = resolvePendingGroupJoinOrchestration();
    if (next && next.includes("/employee/shift-ops/invite")) {
      nav(next, { replace: true });
    }
  }, [showOnboarding, nav]);

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

  const handleInsights = useCallback(() => {
    nav(ROUTE_PATHS.employeeDashboard);
  }, [nav]);

  if (!chromeReady) {
    return (
      <div className="wm-homePage">
        <HomePageSkeleton audience="employee" />
      </div>
    );
  }

  return (
    <div className="wm-homePage">
      {hasPendingGroupJoin() ? (
        <div className="wm-homeStack">
          <PendingGroupJoinBanner />
        </div>
      ) : null}

      {employeeMlId ? (
        <IncomingCallAnswerBanner
          partyMl={employeeMlId}
          resolveCaller={resolveIncomingCallerIdentity}
        />
      ) : null}

      <EmployeeHomeTopTiles
        userName={userDisplayName}
        upcomingShiftDisplay={formatNumber(upcomingShift)}
        shiftBroadcastUnreadDisplay={formatNumber(shiftBroadcastUnread)}
        onShiftTile={handleShiftTile}
        onBroadcastTile={handleBroadcastTile}
      />

      <PendingActionsHub items={allPendingActions} />

      <div className="wm-homeStack">
        {isFirstTime && showWelcome && (
          <EmployeeHomeWelcomeCard
            userDisplayName={userDisplayName}
            welcomeFading={welcomeFading}
          />
        )}

        <ProfileNudgeCard />

        <EmployeeHomeMainSections
          anyDomain={anyDomain}
          showShift={showShift}
          showCareer={showCareer}
          pendingOffers={pendingOffers}
          onFindShifts={handleFindShifts}
          onCareerSearch={handleCareerSearch}
        />
      </div>

      <HomeSectionPanel eyebrow="Daily OS" title="My Dashboard">
        <div className="wm-homeCardEnter wm-homeCardEnter--5">
          <InsightsCard onViewHistory={handleInsights} />
        </div>
      </HomeSectionPanel>

      {showOnboarding && (
        <OnboardingOverlay
          slides={EMPLOYEE_SLIDES}
          ctaLabel="Complete My Profile"
          storageKey={EMPLOYEE_ONBOARDING_KEY}
          onComplete={() => {
            setShowOnboarding(false);
            const next = resolvePendingGroupJoinOrchestration() ?? ROUTE_PATHS.employeeProfile;
            nav(next);
          }}
        />
      )}
    </div>
  );
}
