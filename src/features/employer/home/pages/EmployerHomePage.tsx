/** Job Mitra | EmployerHomePage.tsx | src/features/employer/home/pages/EmployerHomePage.tsx */

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { PendingActionsHub } from "../../../../shared/components/PendingActionsHub";
import { HomeSectionPanel } from "../../../../shared/components/layout/HomeSectionPanel";
import { useEmployerRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployerRoleHomePendingActions";
import { useEmployerOfferPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerOfferPendingHubItems";
import { showPhase2Features } from "../../../../shared/config/featureFlags";
import {
  EMPLOYER_ONBOARDING_KEY,
  EMPLOYER_SLIDES,
  ONBOARDING_KEY,
} from "../../../../shared/components/onboardingConstants";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { EmployerHomeHero } from "../components/EmployerHomeHero";
import {
  CareerJobsCard,
  DemandPlannerCard,
  ShiftJobsCard,
} from "../components/EmployerHomePrimaryCards";
import {
  HRManagementCard,
  InsightsCard,
  ManagerConsoleCard,
  WorkforceCard,
  WorkVaultCard,
} from "../components/EmployerHomeSecondaryCards";
import { getDashboardSnapshot, subscribeDashboard } from "../helpers/employerHomeDashboard";

export function EmployerHomePage() {
  const navigate = useNavigate();
  const pendingActions = useEmployerRoleHomePendingActions(navigate);
  const offerPendingActions = useEmployerOfferPendingHubItems(navigate);
  const allPendingActions = useMemo(
    () => [...offerPendingActions, ...pendingActions],
    [offerPendingActions, pendingActions],
  );
  const [showOnboarding, setShowOnboarding] = useState(
    () =>
      localStorage.getItem(EMPLOYER_ONBOARDING_KEY) !== "1" &&
      localStorage.getItem(ONBOARDING_KEY) !== "1",
  );

  const data = useSyncExternalStore(subscribeDashboard, getDashboardSnapshot, getDashboardSnapshot);

  const companyDisplayName = useMemo(() => {
    const profile = employerSettingsStorage.get();
    return profile.companyName || profile.fullName || "Partner";
  }, []);

  return (
    <div className="wm-homePage">
      <EmployerHomeHero companyName={companyDisplayName} />

      <PendingActionsHub items={allPendingActions} />

      <HomeSectionPanel eyebrow="Hiring" title="Recruitment Hub">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--wm-stack-gap)" }}>
          <div className="wm-homeCardEnter wm-homeCardEnter--1">
            <CareerJobsCard data={data} />
          </div>
          <div className="wm-homeCardEnter wm-homeCardEnter--2">
            <ShiftJobsCard data={data} />
          </div>
          <div className="wm-homeCardEnter wm-homeCardEnter--3">
            <DemandPlannerCard />
          </div>
        </div>
      </HomeSectionPanel>

      <HomeSectionPanel eyebrow="Organization" title="Staff & Documents">
        <div className="wm-homeCardEnter wm-homeCardEnter--4">
          <WorkVaultCard />
        </div>
      </HomeSectionPanel>

      {showPhase2Features ? (
        <HomeSectionPanel eyebrow="Operations" title="Workforce & HR (Beta)">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--wm-stack-gap)" }}>
            <WorkforceCard data={data} />
            <HRManagementCard />
            <ManagerConsoleCard />
          </div>
        </HomeSectionPanel>
      ) : null}

      <HomeSectionPanel eyebrow="Intelligence" title="Reports">
        <div className="wm-homeCardEnter wm-homeCardEnter--5">
          <InsightsCard />
        </div>
      </HomeSectionPanel>

      {showOnboarding && (
        <OnboardingOverlay
          slides={EMPLOYER_SLIDES}
          ctaLabel="Get Started"
          storageKey={EMPLOYER_ONBOARDING_KEY}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
