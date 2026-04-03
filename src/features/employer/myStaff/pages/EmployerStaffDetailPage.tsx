// src/features/employer/myStaff/pages/EmployerStaffDetailPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { myStaffStorage, type StaffRecord } from "../storage/myStaff.storage";
import { ratingStorage } from "../../../../shared/rating/ratingStorage";
import { employmentLifecycleStorage } from "../../../employee/employment/storage/employmentLifecycle.storage";
import { ExitProcessingModal } from "../components/ExitProcessingModal";
import { AcceptResignationModal } from "../components/AcceptResignationModal";
import { statusMeta, durationText } from "../helpers/staffDetailHelpers";
import { IconBack } from "../components/staffDetailComponents";
import {
  ExitDoneBanner,
  HeroCard,
  EmploymentDetails,
  ResignationBanner,
  ExitActions,
  ExitedInfo,
} from "../components/StaffDetailSections";

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerStaffDetailPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const nav = useNavigate();
  const [nowMs] = useState(() => Date.now());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [exitDone, setExitDone] = useState(false);

  const subscribe = useCallback(
    (cb: () => void) => myStaffStorage.subscribe(cb),
    [],
  );

  const snapshotRef = useCallback(() => {
    const all = myStaffStorage.getAll();
    return JSON.stringify(all);
  }, []);

  const raw = useSyncExternalStore(subscribe, snapshotRef, snapshotRef);

  const record = useMemo(() => {
    try {
      const all: StaffRecord[] = JSON.parse(raw);
      return all.find((r) => r.id === staffId) ?? null;
    } catch {
      return null;
    }
  }, [raw, staffId]);

  /* ---- Not found ---- */
  if (!record) {
    return (
      <div style={{ padding: 20 }}>
        <button
          type="button"
          onClick={() => nav(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: "var(--wm-er-text)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <IconBack /> Back
        </button>
        <div className="wm-er-card" style={{ marginTop: 16, textAlign: "center", padding: 32 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
            Staff Member Not Found
          </div>
          <div style={{ fontSize: 13, color: "var(--wm-er-muted)", marginTop: 8 }}>
            This record may have been removed or the link is invalid.
          </div>
        </div>
      </div>
    );
  }

  const sm = statusMeta(record.status);
  const duration = durationText(record.joinedAt, nowMs);
  const isResignPending = record.status === "resignation_pending";
  const canEndEmployment =
    record.status === "active" ||
    record.status === "probation" ||
    record.status === "notice_period";

  /* ---- Exit handlers ---- */
  const handleExitComplete = (
    exitReason: StaffRecord["exitReason"],
    exitedAt: number,
    rating: number,
    comment: string,
  ) => {
    if (!exitReason) return;
    myStaffStorage.endEmployment(record.id, exitReason, exitedAt, rating, comment || undefined);
    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (r) => r.careerPostId === record.careerPostId && r.status !== "exited",
    );
    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "exited",
        exitReason: exitReason as string as "resigned" | "terminated" | "layoff" | "contract_end" | "mutual_agreement",
        exitedAt,
        employerRating: rating,
        employerComment: comment || undefined,
        verified: true,
      });
    }
    setShowExitModal(false);
    setExitDone(true);
  };

  const handleResignAccept = (
    exitedAt: number,
    rating: number,
    comment: string,
  ) => {
    myStaffStorage.acceptResignation(record.id, exitedAt, rating, comment || undefined);
    /* Save to shared rating engine so worker WM ID rating updates */
    if (rating > 0 && record.employeeUniqueId) {
      ratingStorage.saveEmployerRating({
        jobId: record.careerPostId ?? record.id,
        domain: "career",
        employerWmId: "",
        workerWmId: record.employeeUniqueId ?? "",
        stars: rating as 1 | 2 | 3 | 4 | 5,
        tags: [],
        comment: comment.trim() || undefined,
        hireAgain: false,
      });
    }
    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (r) => r.careerPostId === record.careerPostId && r.status !== "exited",
    );
    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "exited",
        exitReason: "resigned",
        exitedAt,
        employerRating: rating,
        employerComment: comment || undefined,
        verified: true,
      });
    }
    setShowResignModal(false);
    setExitDone(true);
  };

  const handleRejectResignation = () => {
    myStaffStorage.updateStaff(record.id, { status: "active" });
    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (r) => r.careerPostId === record.careerPostId && r.status === "resignation_pending",
    );
    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "active",
        resignationNote: undefined,
        preferredLastDate: undefined,
      });
    }
  };

  /* ---- Render ---- */
  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 0" }}>
        <button
          type="button"
          onClick={() => nav(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: "var(--wm-er-text)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <IconBack /> Back to My Staff
        </button>
      </div>

      {exitDone && <ExitDoneBanner />}

      <HeroCard record={record} sm={sm} />
      <EmploymentDetails record={record} sm={sm} duration={duration} />

      {isResignPending && !exitDone && (
        <ResignationBanner
          onAccept={() => setShowResignModal(true)}
          onReject={handleRejectResignation}
        />
      )}

      {canEndEmployment && !isResignPending && !exitDone && (
        <ExitActions onStartExit={() => setShowExitModal(true)} />
      )}

      {record.status === "exited" && !exitDone && (
        <ExitedInfo record={record} />
      )}

      {/* Modals */}
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