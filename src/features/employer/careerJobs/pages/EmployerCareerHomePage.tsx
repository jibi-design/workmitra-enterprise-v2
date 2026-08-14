// App name: Job Mitra
// File name: EmployerCareerHomePage.tsx
// Wave 3 — Loading / Empty / Active / Error

import { EnterpriseEmpty, EnterpriseSkeleton } from "../../../../shared/components/enterprise";
import { PulseIndicator } from "../../../pulse/PulseIndicator";
import { PulseTargetCard } from "../../../pulse/PulseTarget";
import { EmployerActiveEmployeeWorkspaceCard } from "../components/EmployerActiveEmployeeWorkspaceCard";
import { EmployerCareerDraftReminderCard } from "../components/EmployerCareerDraftReminderCard";
import { EmployerCareerHomeHeader } from "../components/EmployerCareerHomeHeader";
import { EmployerCareerHowItWorks } from "../components/EmployerCareerHowItWorks";
import { EmployerCareerPostListCard } from "../components/EmployerCareerPostListCard";
import { EmployerCompletedCareerRecordsCard } from "../components/EmployerCompletedCareerRecordsCard";
import { useEmployerCareerHomeState } from "../hooks/useEmployerCareerHomeState";

export function EmployerCareerHomePage() {
  const state = useEmployerCareerHomeState();

  if (state.viewState === "loading") {
    return (
      <div className="wm-er-vCareer wm-stackGrid" data-testid="employer-career-home-loading">
        <EnterpriseSkeleton domain="career" count={3} testId="career-home-skeleton" />
      </div>
    );
  }

  if (state.viewState === "error") {
    return (
      <div className="wm-er-vCareer wm-stackGrid" data-testid="employer-career-home-error">
        <EnterpriseEmpty
          domain="career"
          title="Couldn't open Career"
          subtitle={state.loadError || "We couldn't load this page. Try again in a moment."}
          primaryLabel="Retry"
          onPrimary={state.retryLoad}
          testId="career-home-error"
        />
      </div>
    );
  }

  return (
    <div
      className="wm-er-vCareer wm-stackGrid"
      style={{ position: "relative" }}
      data-testid="employer-career-home-active"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "70%",
            height: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.09) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-20%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, rgba(29, 78, 216, 0.06) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "10%",
            width: "50%",
            height: "40%",
            background:
              "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.05) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <EmployerCareerHomeHeader onCreate={state.openCreate} kpi={state.kpi} />

      <EmployerCareerDraftReminderCard />

      {state.viewState === "empty" ? (
        <EnterpriseEmpty
          domain="career"
          title="No Career posts yet"
          subtitle="Create your first Career job to start receiving applications and manage hiring here."
          primaryLabel="Create Job"
          onPrimary={state.openCreate}
          testId="career-home-empty"
        />
      ) : (
        <PulseTargetCard pulseId="career-dashboard-applications" radius="24px">
          <div style={{ position: "relative" }}>
            <PulseIndicator notificationId="APPLICATION_RECEIVED" />

            <EmployerCareerPostListCard
              summary={state.postSummary}
              onOpenPosts={state.openCareerPosts}
            />
          </div>
        </PulseTargetCard>
      )}

      <EmployerActiveEmployeeWorkspaceCard
        records={state.activeStaffRecords}
        onOpenStaff={state.openStaffDetail}
      />

      <EmployerCompletedCareerRecordsCard
        records={state.completedStaffRecords}
        feedbackTasks={state.feedbackTasks}
        onOpenRecords={state.openCompletedCareerRecords}
      />

      <EmployerCareerHowItWorks />
    </div>
  );
}
