/** Job Mitra | EmployerHomePage.tsx | src/features/employer/home/pages/EmployerHomePage.tsx */

import { useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { PendingActionsHub } from "../../../../shared/components/PendingActionsHub";
import { useEmployerRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployerRoleHomePendingActions";
import { useEmployerOfferPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerOfferPendingHubItems";
import { showPhase2Features } from "../../../../shared/config/featureFlags";
import {
  EMPLOYER_ONBOARDING_KEY,
  EMPLOYER_SLIDES,
  ONBOARDING_KEY,
} from "../../../../shared/components/onboardingConstants";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
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

const PAGE_SHELL: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxSizing: "border-box",
  fontFamily: `"Inter", "Plus Jakarta Sans", system-ui, sans-serif`,
};

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

  // AUDIT: Re-enable data sync for status pulse triggering
  const data = useSyncExternalStore(subscribeDashboard, getDashboardSnapshot, getDashboardSnapshot);

  const companyDisplayName = useMemo(() => {
    const profile = employerSettingsStorage.get();
    return profile.companyName || profile.fullName || "Partner";
  }, []);

  return (
    <div style={PAGE_SHELL}>
      {/* HEADER SECTION */}
      <EmployerHomeHero companyName={companyDisplayName} />

      <PendingActionsHub items={allPendingActions} />

      {/* WORKSPACE DIRECTORY - Passing 'data' for the pulse indicators */}
      <HomeSection eyebrow="Hiring" title="Recruitment Hub">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--wm-stack-gap)" }}>
          <CareerJobsCard data={data} />
          <ShiftJobsCard data={data} />
          <DemandPlannerCard />
        </div>
      </HomeSection>

      <HomeSection eyebrow="Organization" title="Staff & Documents">
        <WorkVaultCard />
      </HomeSection>

      {showPhase2Features ? (
        <HomeSection eyebrow="Operations" title="Workforce & HR (Beta)">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--wm-stack-gap)" }}>
            <WorkforceCard data={data} />
            <HRManagementCard />
            <ManagerConsoleCard />
          </div>
        </HomeSection>
      ) : null}

      <HomeSection eyebrow="Intelligence" title="Reports">
        <InsightsCard />
      </HomeSection>

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

function EmployerHomeHero({ companyName }: { companyName: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{
        marginTop: 0,
        padding: "20px 16px",
        borderRadius: 24,
        background: "linear-gradient(145deg, #0F172A 0%, #1E293B 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 16px 32px rgba(15, 23, 42, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -20,
          width: 140,
          height: 140,
          background: "rgba(37, 99, 235, 0.1)",
          filter: "blur(50px)",
          borderRadius: "50%",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10B981",
              boxShadow: "0 0 12px #10B981",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#10B981",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            System Active
          </span>
        </div>

        <h1
          style={{
            margin: "12px 0 0 0",
            fontSize: 24,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.04em",
          }}
        >
          {greeting}, {companyName}
        </h1>
        <p style={{ marginTop: 4, fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
          Executive Command Center
        </p>
      </div>

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {companyName.charAt(0)}
      </div>
    </div>
  );
}

function HomeSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 750,
            color: "#94A3B8",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 16,
            fontWeight: 700,
            color: "#0F172A",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
      </div>
      {children}
    </section>
  );
}
