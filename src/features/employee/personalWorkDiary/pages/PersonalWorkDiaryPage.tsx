/** Job Mitra | PersonalWorkDiaryPage — home diary opens full work-log workspace */

import { useCallback, useSyncExternalStore } from "react";
import { EmploymentRecordWorkspace } from "../../employment/components/EmploymentRecordWorkspace";
import { useEmploymentRecordModel } from "../../employment/helpers/employmentRecordModel";
import { employmentLifecycleStorage } from "../../employment/storage/employmentLifecycle.storage";
import { ensurePersonalWorkDiaryEmployment } from "../helpers/ensurePersonalWorkDiaryEmployment";

export function PersonalWorkDiaryPage() {
  const subscribe = useCallback(
    (cb: () => void) => employmentLifecycleStorage.subscribe(cb),
    [],
  );
  const employmentId = useSyncExternalStore(
    subscribe,
    () => ensurePersonalWorkDiaryEmployment()?.id ?? null,
    () => null,
  );
  const model = useEmploymentRecordModel(employmentId ?? undefined);

  const handleSetPrimary = (nextEmploymentId: string) => {
    employmentLifecycleStorage.setPrimaryActiveId(nextEmploymentId);
  };

  if (!model.record) {
    return (
      <div className="wm-stackGrid wm-ee-vDiary" data-testid="employee-personal-work-diary-page">
        <div className="wm-ee-card" data-testid="personal-diary-empty" style={{ padding: 20 }}>
          <div className="wm-typeCardTitle">No active employment</div>
          <p className="wm-typeHelper" style={{ marginTop: 8, marginBottom: 0 }}>
            Personal Work Diary opens when you have an active job on Home.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wm-stackGrid wm-ee-vDiary" data-testid="employee-personal-work-diary-page">
      <EmploymentRecordWorkspace
        record={model.record}
        activeRecords={model.parsed.activeRecords}
        primaryId={model.parsed.primaryId}
        onSetPrimary={handleSetPrimary}
        employeeUniqueId={model.employeeUniqueId}
        completedFeedback={model.completedFeedback}
        hrCandidateId={model.hrCandidateId}
        isClosedEmployment={Boolean(model.isClosedEmployment)}
        showHrEmploymentTools={model.showHrEmploymentTools}
        showManagerEmploymentTools={model.showManagerEmploymentTools}
        canApplyLeave={model.canApplyLeave}
        showLeaveModal={model.showLeaveModal}
        onLeaveModal={model.setShowLeaveModal}
      />
    </div>
  );
}
