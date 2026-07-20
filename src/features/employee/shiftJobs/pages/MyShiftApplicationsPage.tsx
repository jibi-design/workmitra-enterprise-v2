// App name: Job Mitra
// File name: MyShiftApplicationsPage.tsx

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
    setTab,
    openFindShifts,
    openApplication,
    requestWithdrawApplication,
    requestConfirmAttendanceApplication,
    handleCancelWithdraw,
    handleConfirmWithdraw,
  } = useMyShiftApplicationsState("shift");

  return (
    <div className="wm-ee-vShift">
      <MyShiftApplicationsHeader onFindShifts={openFindShifts} />

      <MyShiftApplicationsKpiTiles kpi={kpi} />

      <MyShiftApplicationsTabs tab={tab} counts={counts} onChange={setTab} />

      <MyShiftApplicationsList
        domain="shift"
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
