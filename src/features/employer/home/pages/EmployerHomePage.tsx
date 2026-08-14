/** Job Mitra | EmployerHomePage.tsx | Employer Home Console — light glass + compact grid */

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { HomePageSkeleton } from "../../../../shared/components/layout/HomePageSkeleton";
import { HomeSectionPanel } from "../../../../shared/components/layout/HomeSectionPanel";
import { useEmployerRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployerRoleHomePendingActions";
import { useEmployerOfferPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerOfferPendingHubItems";
import { useEmployerShiftConfirmPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerShiftConfirmPendingHubItems";
import {
  EMPLOYER_ONBOARDING_KEY,
  EMPLOYER_SLIDES,
  ONBOARDING_KEY,
} from "../../../../shared/components/onboardingConstants";
import { HOME_LAYOUT_INSPECTION } from "../../../../shared/config/homeLayoutInspection";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { EmployerHomeHero } from "../components/EmployerHomeHero";
import {
  CareerJobsCard,
  DemandPlannerCard,
  ShiftJobsCard,
} from "../components/EmployerHomePrimaryCards";
import { WorkVaultCard } from "../components/EmployerHomeSecondaryCards";
import { EmployerHomeDashboardLinks } from "../components/EmployerHomeDashboardLinks";
import { EmployerPendingActionsBanner } from "../components/EmployerPendingActionsBanner";
import { HomeInboxTicker } from "../../../notifications/components/HomeInboxTicker";
import { useHomeInboxTicker } from "../../../notifications/hooks/useHomeInboxTicker";
import { getDashboardSnapshot, subscribeDashboard } from "../helpers/employerHomeDashboard";

export function EmployerHomePage() {
  const navigate = useNavigate();
  const pendingActions = useEmployerRoleHomePendingActions(navigate);
  const offerPendingActions = useEmployerOfferPendingHubItems(navigate);
  const confirmPendingActions = useEmployerShiftConfirmPendingHubItems(navigate);
  const allPendingActions = useMemo(
    () => [...confirmPendingActions, ...offerPendingActions, ...pendingActions],
    [confirmPendingActions, offerPendingActions, pendingActions],
  );
  const [showOnboarding, setShowOnboarding] = useState(
    () =>
      !HOME_LAYOUT_INSPECTION &&
      localStorage.getItem(EMPLOYER_ONBOARDING_KEY) !== "1" &&
      localStorage.getItem(ONBOARDING_KEY) !== "1",
  );
  const [chromeReady, setChromeReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChromeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const data = useSyncExternalStore(subscribeDashboard, getDashboardSnapshot, getDashboardSnapshot);

  const companyDisplayName = useMemo(() => {
    const profile = employerSettingsStorage.get();
    return profile.companyName || profile.fullName || "Partner";
  }, []);
  const inboxTicker = useHomeInboxTicker("employer");

  if (!chromeReady) {
    return (
      <div className="wm-homePage wm-homePage--console">
        <HomePageSkeleton audience="employer" />
      </div>
    );
  }

  return (
    <div className="wm-homePage wm-homePage--console" data-testid="employer-home-launcher">
      <EmployerHomeHero companyName={companyDisplayName} />

      <div className="wm-homeSmartNudges">
        <HomeInboxTicker
          item={inboxTicker.item}
          onOpen={inboxTicker.onOpen}
          testId="employer-home-inbox-ticker"
        />
        <EmployerPendingActionsBanner pendingActions={allPendingActions} />
      </div>

      <HomeSectionPanel eyebrow="Core services" title="Launch">
        <section
          className="wm-homeCoreGrid"
          data-testid="employer-home-core-grid"
          aria-label="Employer launch shortcuts"
        >
          <div className="wm-homeCoreGrid__cell wm-homeCardEnter wm-homeCardEnter--1">
            <ShiftJobsCard data={data} />
          </div>
          <div className="wm-homeCoreGrid__cell wm-homeCardEnter wm-homeCardEnter--2">
            <CareerJobsCard data={data} />
          </div>
          <div className="wm-homeCoreGrid__cell wm-homeCardEnter wm-homeCardEnter--3">
            <DemandPlannerCard />
          </div>
          <div className="wm-homeCoreGrid__cell wm-homeCardEnter wm-homeCardEnter--4">
            <WorkVaultCard />
          </div>
        </section>
      </HomeSectionPanel>

      <div className="wm-homeCardEnter wm-homeCardEnter--5">
        <EmployerHomeDashboardLinks />
      </div>

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
