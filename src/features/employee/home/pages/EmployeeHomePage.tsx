/** Job Mitra | EmployeeHomePage.tsx | Cross-domain home — console wireframe */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { HomePageSkeleton } from "../../../../shared/components/layout/HomePageSkeleton";
import { useEmployeeRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployeeRoleHomePendingActions";
import { useEmployeeUrgentPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployeeUrgentPendingHubItems";
import {
  EMPLOYEE_ONBOARDING_KEY,
  EMPLOYEE_SLIDES,
  ONBOARDING_KEY,
} from "../../../../shared/components/onboardingConstants";
import { HOME_LAYOUT_INSPECTION } from "../../../../shared/config/homeLayoutInspection";
import { useEmployeeHRRecords } from "../../employment/helpers/employeeHRSubscription";
import { purgeLayoutPreviewEmploymentArtifacts } from "../../employment/storage/employmentLayoutPreview.purge";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { ActivePriorityBand } from "../components/ActivePriorityBand";
import { EmployeeHomeCoreGrid } from "../components/EmployeeHomeCoreGrid";
import { EmployeeHomeMainSections } from "../components/EmployeeHomeMainSections";
import { EmployeeHomeTopTiles } from "../components/EmployeeHomeTopTiles";
import { EmployeePendingActionsBanner } from "../components/EmployeePendingActionsBanner";
import { HomeInboxTicker } from "../../../notifications/components/HomeInboxTicker";
import { useHomeInboxTicker } from "../../../notifications/hooks/useHomeInboxTicker";
import { InsightsCard } from "../components/EmployeeInsightsCard";
import { UnifiedWorkplaceHubPortal } from "../components/UnifiedWorkplaceHubPortal";
import { readDemo } from "../helpers/employeeHomeHelpers";
import {
  demoForceBroadcastNudge,
  demoForceUpcomingShiftNudge,
} from "../helpers/employeeHomeDynamicNudges.helpers";
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

export function EmployeeHomePage() {
  const nav = useNavigate();
  const pendingActions = useEmployeeRoleHomePendingActions(nav);
  const urgentPendingActions = useEmployeeUrgentPendingHubItems(nav);
  const allPendingActions = useMemo(
    () => [...urgentPendingActions, ...pendingActions],
    [urgentPendingActions, pendingActions],
  );

  const [showOnboarding, setShowOnboarding] = useState(
    () => !HOME_LAYOUT_INSPECTION && !hasSeenEmployeeOnboarding(),
  );
  const [hubOpen, setHubOpen] = useState(false);

  const demo = useMemo(() => readDemo(), []);
  const flags = useMemo(() => demo.flags ?? {}, [demo]);

  // Layout inspection: always show Shift + Career domain cards.
  const showShift = HOME_LAYOUT_INSPECTION ? true : (flags.shiftEnabled ?? true);
  const showCareer = HOME_LAYOUT_INSPECTION ? true : (flags.careerEnabled ?? true);
  const anyDomain = showShift || showCareer;

  const [chromeReady, setChromeReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChromeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    // Never seed real employment / Work Diary storage from layout inspection.
    // If a prior preview hire polluted lifecycle + diary keys, strip it once.
    purgeLayoutPreviewEmploymentArtifacts();

    if (!HOME_LAYOUT_INSPECTION) return;
    demoForceUpcomingShiftNudge();
    demoForceBroadcastNudge("shift");
  }, []);

  const userDisplayName = useMemo(() => {
    const profile = employeeProfileStorage.get();
    return profile.fullName || "User";
  }, []);

  const userPhoto = useMemo(() => employeeProfileStorage.get().photoDataUrl ?? null, []);

  const employeeMlId = useMemo(() => employeeProfileStorage.get().uniqueId?.trim() ?? "", []);

  useEffect(() => {
    if (showOnboarding) return;
    const next = resolvePendingGroupJoinOrchestration();
    if (next && next.includes("/employee/shift-ops/invite")) {
      nav(next, { replace: true });
    }
  }, [showOnboarding, nav]);

  const hrRecords = useEmployeeHRRecords();
  const pendingOffers = hrRecords.filter((record) => record.status === "offered");

  const handleFindShifts = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftSearch);
  }, [nav]);

  const handleCareerSearch = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerSearch);
  }, [nav]);

  const handleInsights = useCallback(() => {
    nav(ROUTE_PATHS.employeeDashboard);
  }, [nav]);

  const handleOpenHub = useCallback(() => setHubOpen(true), []);
  const handleCloseHub = useCallback(() => setHubOpen(false), []);
  const inboxTicker = useHomeInboxTicker("employee");

  const showJoinBanner = hasPendingGroupJoin();
  const showCallBanner = Boolean(employeeMlId);

  if (!chromeReady) {
    return (
      <div className="wm-homePage wm-homePage--console">
        <HomePageSkeleton audience="employee" />
      </div>
    );
  }

  return (
    <div className="wm-homePage wm-homePage--console wm-homePage--compactTop">
      <EmployeeHomeTopTiles userName={userDisplayName} userPhoto={userPhoto} />

      {showJoinBanner ? <PendingGroupJoinBanner key="join" /> : null}

      <div className="wm-homeSmartNudges">
        <HomeInboxTicker
          item={inboxTicker.item}
          onOpen={inboxTicker.onOpen}
          testId="employee-home-inbox-ticker"
        />
        <EmployeePendingActionsBanner
          pendingActions={allPendingActions}
          forceVisible={HOME_LAYOUT_INSPECTION}
        />
      </div>

      <ActivePriorityBand>
        {showCallBanner ? (
          <IncomingCallAnswerBanner
            key="call"
            partyMl={employeeMlId}
            resolveCaller={resolveIncomingCallerIdentity}
          />
        ) : null}
        {/* Daily / first-open welcome card permanently disabled */}
      </ActivePriorityBand>

      <EmployeeHomeCoreGrid
        anyDomain={anyDomain}
        showShift={showShift}
        showCareer={showCareer}
        onFindShifts={handleFindShifts}
        onCareerSearch={handleCareerSearch}
        onOpenWorkplaceHub={handleOpenHub}
      />

      <EmployeeHomeMainSections pendingOffers={pendingOffers} onOpenWorkplaceHub={handleOpenHub} />

      <HomeSectionPanel className="wm-homeInsightsSection" eyebrow="Daily OS" title="Insights">
        <div className="wm-homeCardEnter wm-homeCardEnter--5">
          <InsightsCard onViewHistory={handleInsights} />
        </div>
      </HomeSectionPanel>

      <UnifiedWorkplaceHubPortal open={hubOpen} onClose={handleCloseHub} />

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
