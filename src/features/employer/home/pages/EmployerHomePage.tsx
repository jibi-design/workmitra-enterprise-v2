/** Job Mitra | EmployerHomePage.tsx | Employer Home Console — light glass + compact grid */

import { useMemo, useState, useSyncExternalStore } from "react";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { HomeSectionPanel } from "../../../../shared/components/layout/HomeSectionPanel";
import {
  EMPLOYER_ONBOARDING_KEY,
  EMPLOYER_SLIDES,
  ONBOARDING_KEY,
} from "../../../../shared/components/onboardingConstants";
import { HOME_LAYOUT_INSPECTION } from "../../../../shared/config/homeLayoutInspection";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { EmployerHomeBanners, EmployerHomeHero } from "../components/EmployerHomeHero";
import {
  CareerJobsCard,
  DemandPlannerCard,
  ShiftJobsCard,
} from "../components/EmployerHomePrimaryCards";
import { WorkVaultCard } from "../components/EmployerHomeSecondaryCards";
import { EmployerHomeDashboardLinks } from "../components/EmployerHomeDashboardLinks";
import { getDashboardSnapshot, subscribeDashboard } from "../helpers/employerHomeDashboard";

export function EmployerHomePage() {
  const [showOnboarding, setShowOnboarding] = useState(
    () =>
      !HOME_LAYOUT_INSPECTION &&
      localStorage.getItem(EMPLOYER_ONBOARDING_KEY) !== "1" &&
      localStorage.getItem(ONBOARDING_KEY) !== "1",
  );
  const data = useSyncExternalStore(subscribeDashboard, getDashboardSnapshot, getDashboardSnapshot);

  const companyDisplayName = useMemo(() => {
    const profile = employerSettingsStorage.get();
    return profile.companyName || profile.fullName || "Partner";
  }, []);

  return (
    <div className="wm-homePage wm-homePage--console wm-homePage--compactTop" data-testid="employer-home-launcher">
      <EmployerHomeHero companyName={companyDisplayName} />

      <HomeSectionPanel eyebrow="Core services" title="Launch" lead={<EmployerHomeBanners />}>
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
