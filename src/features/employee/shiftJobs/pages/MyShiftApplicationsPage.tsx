// App name: Job Mitra | MyShiftApplicationsPage.tsx — Wave A primitives

import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { MyShiftApplicationsHeader } from "../components/MyShiftApplicationsHeader";
import { MyShiftApplicationsKpiTiles } from "../components/MyShiftApplicationsKpiTiles";
import { MyShiftApplicationsList } from "../components/MyShiftApplicationsList";
import { MyShiftApplicationsTabs } from "../components/MyShiftApplicationsTabs";
import { ShiftToast } from "../components/ShiftPostDetailSections";
import { useMyShiftApplicationsState } from "../hooks/useMyShiftApplicationsState";

export function MyShiftApplicationsPage() {
  const {
    tab,
    kpi,
    counts,
    postMap,
    filteredApplications,
    withdrawConfirm,
    toast,
    resumeBanner,
    setTab,
    openFindShifts,
    openApplication,
    requestWithdrawApplication,
    requestConfirmAttendanceApplication,
    handleCancelWithdraw,
    handleConfirmWithdraw,
  } = useMyShiftApplicationsState("shift");

  return (
    <div
      className="wm-ee-vShift wm-stackGrid"
      data-testid="shift-applications-page"
      style={{ gap: "var(--wm-stack-gap)" }}
    >
      <MyShiftApplicationsHeader onFindShifts={openFindShifts} />

      {resumeBanner ? (
        <div
          className="wm-shift-surface-glass"
          data-testid="shift-applications-resume-banner"
          style={{ padding: "11px 12px" }}
        >
          <div style={{ fontSize: 13, fontWeight: 950, color: "var(--wm-emp-text)" }}>
            {resumeBanner.title}
          </div>
          <div
            style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)" }}
          >
            {resumeBanner.message}
          </div>
        </div>
      ) : null}

      <MyShiftApplicationsKpiTiles kpi={kpi} />

      <MyShiftApplicationsTabs tab={tab} counts={counts} onChange={setTab} />

      <div className="wm-animateIn" style={{ animationDelay: "120ms" }}>
        <MyShiftApplicationsList
          domain="shift"
          applications={filteredApplications}
          postMap={postMap}
          onFindShifts={openFindShifts}
          onOpenApplication={openApplication}
          onWithdrawApplication={requestWithdrawApplication}
          onConfirmAttendanceApplication={requestConfirmAttendanceApplication}
        />
      </div>

      <ShiftToast message={toast} />

      <ConfirmModal
        confirm={withdrawConfirm}
        onCancel={handleCancelWithdraw}
        onConfirm={handleConfirmWithdraw}
      />
    </div>
  );
}
