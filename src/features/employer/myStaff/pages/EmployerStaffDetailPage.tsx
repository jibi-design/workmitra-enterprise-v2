// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerStaffDetailPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\pages\EmployerStaffDetailPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  employmentActions,
  employmentStorage,
} from "../../../../shared/employment/employmentStorage";
import { employmentLifecycleStorage } from "../../../employee/employment/storage/employmentLifecycle.storage";
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
import { careerEmploymentFeedbackStorage } from "../storage/careerEmploymentFeedback.storage";
import { myStaffStorage, type StaffDepartment, type StaffRecord } from "../storage/myStaff.storage";

const DAY_MS = 86_400_000;

function formatDateLabel(timestamp: number | null | undefined): string {
  if (!timestamp) return "Not set";

  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not set";
  }
}

function getDaysLeft(lastWorkingDay: number | null | undefined, nowMs: number): number | null {
  if (!lastWorkingDay) return null;

  return Math.max(0, Math.ceil((lastWorkingDay - nowMs) / DAY_MS));
}

function createPendingFeedbackTask(record: StaffRecord, companyName: string): void {
  careerEmploymentFeedbackStorage.createPending({
    staffId: record.id,
    careerPostId: record.careerPostId,
    employeeUniqueId: record.employeeUniqueId,
    employeeName: record.employeeName,
    jobTitle: record.jobTitle,
    companyName,
  });
}

type StaffDetailSnapshot = {
  records: StaffRecord[];
  departments: StaffDepartment[];
};

let cachedSnapshot: StaffDetailSnapshot = { records: [], departments: [] };
let cachedSnapshotKey = "";

function getStaffDetailSnapshot(): StaffDetailSnapshot {
  const fresh: StaffDetailSnapshot = {
    records: myStaffStorage.getAll(),
    departments: myStaffStorage.getDepartments(),
  };

  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedSnapshotKey) {
    cachedSnapshot = fresh;
    cachedSnapshotKey = freshKey;
  }

  return cachedSnapshot;
}

export function EmployerStaffDetailPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const nav = useNavigate();
  const [nowMs] = useState(() => Date.now());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [exitDone, setExitDone] = useState(false);

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
  const canEndEmployment =
    record.status === "active" ||
    record.status === "probation" ||
    record.status === "notice_period";

  const handleConfirmJoined = () => {
    const joinedAt = Date.now();

    myStaffStorage.updateStaff(record.id, {
      status: "active",
      joinedAt,
      employeeConfirmed: true,
    });

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) => item.careerPostId === record.careerPostId && item.status !== "exited",
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "active",
        joinedAt,
        verified: true,
      });
    }

    if (record.careerPostId) {
      employmentActions.markAsJoined(record.careerPostId, joinedAt);
    }
  };

  const handleExitComplete = (
    exitReason: StaffRecord["exitReason"],
    exitedAt: number,
    rating: number,
    comment: string,
  ) => {
    if (!exitReason) return;

    myStaffStorage.endEmployment(record.id, exitReason, exitedAt, rating, comment || undefined);
    createPendingFeedbackTask(
      record,
      sharedEmploymentRecord?.companyName ?? lifecycleRecord?.companyName ?? "Career Employment",
    );

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) => item.careerPostId === record.careerPostId && item.status !== "exited",
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "exited",
        exitReason: exitReason as
          "resigned" | "terminated" | "layoff" | "contract_end" | "mutual_agreement",
        exitedAt,
        employerRating: rating,
        employerComment: comment || undefined,
        verified: true,
      });
    }

    setShowExitModal(false);
    setExitDone(true);
  };

  const handleResignAccept = (exitedAt: number) => {
    if (!canCloseEmployment) return;

    myStaffStorage.acceptResignation(record.id, exitedAt);
    createPendingFeedbackTask(record, sharedEmploymentRecord?.companyName ?? "Career Employment");

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) => item.careerPostId === record.careerPostId && item.status !== "exited",
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "exited",
        exitReason: "resigned",
        exitedAt,
        verified: true,
      });
    }

    if (record.careerPostId) {
      employmentActions.confirmResignation(record.careerPostId);
    }

    setShowResignModal(false);
    setExitDone(true);
  };

  const handleRejectResignation = () => {
    myStaffStorage.updateStaff(record.id, { status: "active" });

    if (record.careerPostId) {
      employmentActions.withdrawResignation(record.careerPostId);
    }

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) =>
        item.careerPostId === record.careerPostId &&
        (item.status === "resignation_pending" || item.status === "notice_period"),
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "active",
        resignationNote: undefined,
        preferredLastDate: undefined,
      });
    }
  };

  return (
    <div style={{ padding: "8px 0 32px" }}>
      {exitDone && <ExitDoneBanner />}

      <HeroCard record={record} sm={sm} />
      <EmploymentDetails record={record} sm={sm} duration={duration} />
      <StaffDepartmentSection record={record} departments={snapshot.departments} />

      {isJoiningPending && !exitDone && (
        <StaffJoinConfirmationAction
          employeeName={record.employeeName}
          onConfirmJoined={handleConfirmJoined}
        />
      )}

      {isResignPending && !exitDone && (
        <ResignationBanner
          daysLeft={noticeDaysLeft}
          lastWorkingDateLabel={formatDateLabel(lastWorkingDay)}
          canCloseEmployment={canCloseEmployment}
          onAccept={() => setShowResignModal(true)}
          onReject={handleRejectResignation}
        />
      )}

      {canEndEmployment && !isResignPending && !exitDone && (
        <ExitActions onStartExit={() => setShowExitModal(true)} />
      )}

      {record.status === "exited" && !exitDone && <ExitedInfo record={record} />}

      {(record.status === "exited" || exitDone) && <EmploymentFeedbackSection record={record} />}

      {showExitModal && (
        <ExitProcessingModal
          employeeName={record.employeeName}
          jobTitle={record.jobTitle}
          onComplete={handleExitComplete}
          onClose={() => setShowExitModal(false)}
        />
      )}

      {showResignModal && (
        <AcceptResignationModal
          employeeName={record.employeeName}
          jobTitle={record.jobTitle}
          onComplete={handleResignAccept}
          onClose={() => setShowResignModal(false)}
        />
      )}
    </div>
  );
}
