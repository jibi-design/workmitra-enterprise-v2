// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerStaffDetailPage.tsx — facade

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { employmentStorage } from "../../../../shared/employment/employmentStorage";
import { listHrStaffEmployments } from "../../hrManagement/services/hrEmploymentService";
import { employmentLifecycleStorage } from "../../../../shared/employment/employmentLifecycle.storage";
import { AcceptResignationModal } from "../components/AcceptResignationModal";
import { ExitProcessingModal } from "../components/ExitProcessingModal";
import {
  EmploymentDetails,
  EmploymentFeedbackSection,
  ExitedInfo,
  ExitActions,
  ExitDoneBanner,
  HeroCard,
  ResignationBanner,
  StaffDepartmentSection,
  StaffJoinConfirmationAction,
} from "../components/StaffDetailSections";
import { durationText, statusMeta } from "../helpers/staffDetailHelpers";
import { myStaffStorage } from "../storage/myStaff.storage";
import { isCareerApiSyncEnabled } from "../../../career/services/careerGateApi.service";
import {
  formatDateLabel,
  getDaysLeft,
  getStaffDetailSnapshot,
} from "./EmployerStaffDetailPage.helpers";
import { createStaffDetailHandlers } from "./EmployerStaffDetailPage.handlers";

export function EmployerStaffDetailPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const nav = useNavigate();
  const [nowMs] = useState(() => Date.now());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [exitDone, setExitDone] = useState(false);

  useEffect(() => {
    if (!isCareerApiSyncEnabled()) return;
    void listHrStaffEmployments();
  }, []);

  const subscribe = useCallback((cb: () => void) => myStaffStorage.subscribe(cb), []);
  const snapshot = useSyncExternalStore(subscribe, getStaffDetailSnapshot, getStaffDetailSnapshot);

  const record = useMemo(
    () => snapshot.records.find((item) => item.id === staffId) ?? null,
    [snapshot.records, staffId],
  );

  const careerPostId = record?.careerPostId;

  const sharedEmploymentRecord = useMemo(() => {
    if (!careerPostId) return null;
    return employmentStorage.getByPostId(careerPostId);
  }, [careerPostId]);

  const lifecycleRecord = useMemo(() => {
    if (!careerPostId) return null;

    return (
      employmentLifecycleStorage
        .getAll()
        .find((item) => item.careerPostId === careerPostId && item.status !== "exited") ?? null
    );
  }, [careerPostId]);

  const lastWorkingDay =
    sharedEmploymentRecord?.lastWorkingDay ?? lifecycleRecord?.preferredLastDate ?? null;
  const noticeDaysLeft = getDaysLeft(lastWorkingDay, nowMs);
  const canCloseEmployment = !lastWorkingDay || nowMs >= lastWorkingDay;

  if (!record) {
    return (
      <div style={{ padding: "18px 20px 32px" }}>
        <div className="wm-er-card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontWeight: 950, fontSize: 16, color: "var(--wm-er-text)" }}>
            Staff Member Not Found
          </div>
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 8 }}>
            This record may have been removed or the link is invalid.
          </div>

          <button
            className="wm-outlineBtn"
            type="button"
            onClick={() => nav(-1)}
            style={{ marginTop: 14 }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sm = statusMeta(record.status);
  const duration = durationText(record.joinedAt, nowMs);
  const isJoiningPending = record.status === "joining_pending";
  const isResignPending = record.status === "resignation_pending";

  const handlers = createStaffDetailHandlers(
    record,
    sharedEmploymentRecord,
    lifecycleRecord,
    canCloseEmployment,
    setShowExitModal,
    setShowResignModal,
    setExitDone,
  );

  return (
    <div className="wm-er-vCareer wm-stackGrid" style={{ padding: "8px 0 32px" }}>
      {exitDone && <ExitDoneBanner />}

      <HeroCard record={record} sm={sm} />
      <EmploymentDetails record={record} sm={sm} duration={duration} />
      <StaffDepartmentSection record={record} departments={snapshot.departments} />

      {isJoiningPending && !exitDone && (
        <StaffJoinConfirmationAction
          employeeName={record.employeeName}
          onConfirmJoined={handlers.handleConfirmJoined}
        />
      )}

      {isResignPending && !exitDone && (
        <ResignationBanner
          daysLeft={noticeDaysLeft}
          lastWorkingDateLabel={formatDateLabel(lastWorkingDay)}
          canCloseEmployment={canCloseEmployment}
          onAccept={() => setShowResignModal(true)}
          onReject={handlers.handleRejectResignation}
        />
      )}

      {canCloseEmployment && !isResignPending && !exitDone && (
        <ExitActions onStartExit={() => setShowExitModal(true)} />
      )}

      {record.status === "exited" && !exitDone && <ExitedInfo record={record} />}

      {(record.status === "exited" || exitDone) && <EmploymentFeedbackSection record={record} />}

      {showExitModal && (
        <ExitProcessingModal
          employeeName={record.employeeName}
          jobTitle={record.jobTitle}
          onComplete={handlers.handleExitComplete}
          onClose={() => setShowExitModal(false)}
        />
      )}

      {showResignModal && (
        <AcceptResignationModal
          employeeName={record.employeeName}
          jobTitle={record.jobTitle}
          onComplete={handlers.handleResignAccept}
          onClose={() => setShowResignModal(false)}
        />
      )}
    </div>
  );
}
