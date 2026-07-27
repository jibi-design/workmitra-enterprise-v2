// App name: Job Mitra
// File name: EmployeeCareerApplicationsList.tsx

import { PulseTargetCard } from "../../../../features/pulse/PulseTarget";
import { AppCard } from "./CareerApplicationComponents";
import { getEmployeeApplicationPulseTarget } from "../helpers/employeeCareerApplicationsPage.helpers";
import type { useEmployeeCareerApplicationsPage } from "../hooks/useEmployeeCareerApplicationsPage";

type PageState = ReturnType<typeof useEmployeeCareerApplicationsPage>;

export function EmployeeCareerApplicationsList({ page }: { page: PageState }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {page.filtered.map((app) => {
        const pulseTarget = getEmployeeApplicationPulseTarget(app.stage);
        const isPulseActive = Boolean(
          pulseTarget && pulseTarget.pulseId === page.activePulseNodeId,
        );
        const post = page.postsMap.get(app.jobId);

        const applicationCard = (
          <AppCard
            app={app}
            post={post}
            isPulseActive={isPulseActive}
            onOpen={() => page.openApplicationTarget(app.jobId, app.stage)}
            onAcceptOffer={() => {
              void page.acceptOffer(app.jobId);
            }}
            onDeclineOffer={() => {
              page.requestDeclineOffer(app.jobId, post?.jobTitle ?? "this position");
            }}
            onAcceptInterview={() => {
              page.acceptInterviewRsvp(app.jobId);
            }}
            onDeclineInterview={() => {
              page.declineInterviewRsvp(app.jobId);
            }}
            onWithdraw={() => {
              page.requestWithdraw(app.jobId, post?.jobTitle ?? "this position");
            }}
          />
        );

        if (!pulseTarget) {
          return <div key={app.id}>{applicationCard}</div>;
        }

        return (
          <PulseTargetCard key={app.id} pulseId={pulseTarget.pulseId} edgeMode="full" radius="24px">
            {applicationCard}
          </PulseTargetCard>
        );
      })}
    </div>
  );
}
