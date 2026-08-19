/** Job Mitra | EmployeeHomePage.tsx | Cross-domain home — console wireframe */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import {
  EMPLOYEE_ONBOARDING_KEY,
  EMPLOYEE_SLIDES,
  ONBOARDING_KEY,
} from "../../../../shared/components/onboardingConstants";
import { HOME_LAYOUT_INSPECTION } from "../../../../shared/config/homeLayoutInspection";
import { purgeLayoutPreviewEmploymentArtifacts } from "../../employment/storage/employmentLayoutPreview.purge";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { EmployeeHomeCoreGrid } from "../components/EmployeeHomeCoreGrid";
import { EmployeeHomeMainSections } from "../components/EmployeeHomeMainSections";
import { EmployeeHomeBanners, EmployeeHomeTopTiles } from "../components/EmployeeHomeTopTiles";
import { InsightsCard } from "../components/EmployeeInsightsCard";
import { readDemo } from "../helpers/employeeHomeHelpers";
import { HomeSectionPanel } from "../../../../shared/components/layout/HomeSectionPanel";
import { resolvePendingGroupJoinOrchestration } from "../../../shiftOps/helpers/groupJoinDeepLink";
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
  const [showOnboarding, setShowOnboarding] = useState(
    () => !HOME_LAYOUT_INSPECTION && !hasSeenEmployeeOnboarding(),
  );

  const demo = useMemo(() => readDemo(), []);
  const flags = useMemo(() => demo.flags ?? {}, [demo]);

  // Layout inspection: always show Shift + Career domain cards.
  const showShift = HOME_LAYOUT_INSPECTION ? true : (flags.shiftEnabled ?? true);
  const showCareer = HOME_LAYOUT_INSPECTION ? true : (flags.careerEnabled ?? true);
  const anyDomain = showShift || showCareer;

  useEffect(() => {
    // Never seed real employment / Work Diary storage from layout inspection.
    // If a prior preview hire polluted lifecycle + diary keys, strip it once.
    purgeLayoutPreviewEmploymentArtifacts();
  }, []);

  const userDisplayName = useMemo(() => {
    const profile = employeeProfileStorage.get();
    return profile.fullName || "User";
  }, []);

  const employeeMlId = useMemo(() => employeeProfileStorage.get().uniqueId?.trim() ?? "", []);

  useEffect(() => {
    if (showOnboarding) return;
    const next = resolvePendingGroupJoinOrchestration();
    if (next && next.includes("/employee/shift-ops/invite")) {
      nav(next, { replace: true });
    }
  }, [showOnboarding, nav]);

  const handleFindShifts = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftSearch);
  }, [nav]);

  const handleCareerSearch = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerSearch);
  }, [nav]);

  const handleInsights = useCallback(() => {
    nav(ROUTE_PATHS.employeeDashboard);
  }, [nav]);
  const showCallBanner = Boolean(employeeMlId);

  return (
    <div className="wm-homePage wm-homePage--console wm-homePage--compactTop">
      <EmployeeHomeTopTiles userName={userDisplayName} />
      <EmployeeHomeBanners />

      {showCallBanner ? (
        <IncomingCallAnswerBanner
          key="call"
          partyMl={employeeMlId}
          resolveCaller={resolveIncomingCallerIdentity}
        />
      ) : null}

      <HomeSectionPanel eyebrow="Workflow Hub" title="Overview">
        <EmployeeHomeCoreGrid
          anyDomain={anyDomain}
          showShift={showShift}
          showCareer={showCareer}
          onFindShifts={handleFindShifts}
          onCareerSearch={handleCareerSearch}
        />
      </HomeSectionPanel>

      <EmployeeHomeMainSections />

      <HomeSectionPanel className="wm-homeInsightsSection" eyebrow="Daily OS" title="Insights">
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
