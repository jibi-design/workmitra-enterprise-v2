// App name: Job Mitra
// File name: EmployeeCareerApplicationsPage.tsx

import { CareerSkeletonCard } from "../../../career/components/CareerSkeletonCard";
import { EmptyState, FilterTabs, KpiTiles } from "../components/CareerApplicationComponents";
import { EmployeeCareerApplicationsHero } from "../components/EmployeeCareerApplicationsHero";
import { EmployeeCareerApplicationsList } from "../components/EmployeeCareerApplicationsList";
import { EmployeeCareerApplicationsModals } from "../components/EmployeeCareerApplicationsModals";
import { useEmployeeCareerApplicationsPage } from "../hooks/useEmployeeCareerApplicationsPage";

export function EmployeeCareerApplicationsPage() {
  const page = useEmployeeCareerApplicationsPage();

  return (
    <div className="wm-ee-vCareer wm-stackGrid" style={{ paddingBottom: 32 }}>
      <EmployeeCareerApplicationsModals
        withdrawJobId={page.withdrawJobId}
        withdrawJobTitle={page.withdrawJobTitle}
        declineJobId={page.declineJobId}
        declineJobTitle={page.declineJobTitle}
        actionError={page.actionError}
        onCloseWithdraw={() => page.setWithdrawJobId(null)}
        onConfirmWithdraw={page.handleWithdrawConfirm}
        onCloseDecline={() => {
          page.setDeclineJobId(null);
          page.setDeclineJobTitle("");
        }}
        onConfirmDecline={page.handleDeclineOfferConfirm}
        onCloseActionError={() => page.setActionError(null)}
      />

      <EmployeeCareerApplicationsHero onFindJobs={page.goFind} />

      {page.resumeBanner ? (
        <div
          className="wm-er-card"
          data-testid="career-applications-resume-banner"
          style={{ padding: "11px 12px" }}
        >
          <div style={{ fontSize: 13, fontWeight: 950 }}>{page.resumeBanner.title}</div>
          <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "var(--wm-er-muted)" }}>
            {page.resumeBanner.message}
          </div>
        </div>
      ) : null}

      <div className="wm-stackGrid" style={{ padding: "0 4px" }}>
        <KpiTiles kpi={page.kpi} />
        <FilterTabs tab={page.visibleTab} counts={page.counts} onChange={page.setTab} />

        {page.isHydrating && page.filtered.length === 0 ? (
          <CareerSkeletonCard count={3} />
        ) : (
          <>
            {page.filtered.length === 0 ? <EmptyState onFind={page.goFind} /> : null}
            {page.filtered.length > 0 ? <EmployeeCareerApplicationsList page={page} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
