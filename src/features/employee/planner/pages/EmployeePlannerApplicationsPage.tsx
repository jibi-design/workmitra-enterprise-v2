// Job Mitra | EmployeePlannerApplicationsPage.tsx | Gig plan bundles only

import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import { MyShiftApplicationsHeader } from "../../shiftJobs/components/MyShiftApplicationsHeader";
import { MyShiftApplicationsKpiTiles } from "../../shiftJobs/components/MyShiftApplicationsKpiTiles";
import { MyShiftApplicationsList } from "../../shiftJobs/components/MyShiftApplicationsList";
import { MyShiftApplicationsTabs } from "../../shiftJobs/components/MyShiftApplicationsTabs";
import { ShiftToast } from "../../shiftJobs/components/ShiftPostDetailSections";
import { useMyShiftApplicationsState } from "../../shiftJobs/hooks/useMyShiftApplicationsState";

export function EmployeePlannerApplicationsPage() {
  const {
    tab,
    kpi,
    counts,
    postMap,
    filteredApplications,
    withdrawConfirm,
    toast,
    setTab,
    openFindShifts,
    openApplication,
    requestWithdrawApplication,
    requestConfirmAttendanceApplication,
    handleCancelWithdraw,
    handleConfirmWithdraw,
  } = useMyShiftApplicationsState("planner");

  return (
    <div className="wm-ee-vPlanner wm-planner-page">
      <MyShiftApplicationsHeader domain="planner" onFindShifts={openFindShifts} />

      <MyShiftApplicationsKpiTiles domain="planner" kpi={kpi} />

      <MyShiftApplicationsTabs domain="planner" tab={tab} counts={counts} onChange={setTab} />

      <MyShiftApplicationsList
        domain="planner"
        applications={filteredApplications}
        postMap={postMap}
        onFindShifts={openFindShifts}
        onOpenApplication={openApplication}
        onWithdrawApplication={requestWithdrawApplication}
        onConfirmAttendanceApplication={requestConfirmAttendanceApplication}
      />

      <ShiftToast message={toast} />

      <ConfirmModal
        confirm={withdrawConfirm}
        onCancel={handleCancelWithdraw}
        onConfirm={handleConfirmWithdraw}
      />

      <div style={{ height: 32 }} />
    </div>
  );
}
