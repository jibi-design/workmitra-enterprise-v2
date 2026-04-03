// src/features/employee/employment/pages/EmployeeEmploymentDetailPage.tsx
//
// My Current Employment — main page. Orchestrator only.
// Domain: Manager Console Ocean Blue #0369a1

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import {
  employmentLifecycleStorage,
  type EmploymentRecord,
} from "../storage/employmentLifecycle.storage";
import { hrManagementStorage } from "../../../employer/hrManagement/storage/hrManagement.storage";
import { EmploymentHeroCard } from "../components/EmploymentHeroCard";
import { EmploymentDetailsCard } from "../components/EmploymentDetailsCard";
import { EmploymentLeaveSection } from "../components/EmploymentLeaveSection";
import { EmployeePerformanceReviewSection } from "../components/EmployeePerformanceReviewSection";
import { EmploymentRatingSection } from "../components/EmploymentRatingSection";
import { EmploymentResignationSection } from "../components/EmploymentResignationSection";
import { ResignationModal } from "../components/ResignationModal";
import { LeaveApplyModal } from "../components/LeaveApplyModal";
import { WorkDiarySection } from "../components/WorkDiarySection";
import { EmployeeIncidentReportSection } from "../components/EmployeeIncidentReportSection";
import { EmployeeAvailabilitySection } from "../components/EmployeeAvailabilitySection";
import { EmployeeScheduleSection } from "../components/EmployeeScheduleSection";
import { EmployeeTaskViewSection } from "../components/EmployeeTaskViewSection";
import { WorkDiaryQuickReport } from "../components/WorkDiaryQuickReport";

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
function findHRCandidateId(careerPostId: string): string | null {
  const all = hrManagementStorage.getAll();
  const found = all.find((r) => r.careerPostId === careerPostId && r.status === "active");
  return found?.id ?? null;
}

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="var(--wm-er-accent-console, #0369a1)"
        d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2Zm-6 0h-4V4h4v2Z"
      />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeEmploymentDetailPage() {
  const { employmentId } = useParams<{ employmentId: string }>();
  const [showResignModal, setShowResignModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const subscribe = useCallback(
    (cb: () => void) => employmentLifecycleStorage.subscribe(cb),
    [],
  );

  const recordRef = useCallback(() => {
    const all = employmentLifecycleStorage.getAll();
    return JSON.stringify(all);
  }, []);

  const raw = useSyncExternalStore(subscribe, recordRef, recordRef);

  const record = useMemo(() => {
    try {
      const all: EmploymentRecord[] = JSON.parse(raw);
      return all.find((r) => r.id === employmentId) ?? null;
    } catch { return null; }
  }, [raw, employmentId]);

  const hrCandidateId = useMemo(() => {
    if (!record) return null;
    return findHRCandidateId(record.careerPostId);
  }, [record]);

  /* ---- Not found ---- */
  if (!record) {
    return (
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "rgba(3,105,161,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconBriefcase />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>
              My Employment
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
              Employment record not found
            </div>
          </div>
        </div>
        <div className="wm-ee-card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--wm-er-text, #1e293b)" }}>
            Employment Not Found
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 8 }}>
            This employment record may have been removed or the link is invalid.
          </div>
        </div>
      </div>
    );
  }

  const canApplyLeave = hrCandidateId && (record.status === "active" || record.status === "probation");

  function handleResignSubmit(note: string, preferredLastDate: number) {
    if (!record) return;
    employmentLifecycleStorage.submitResignation(record.id, note, preferredLastDate);
    setShowResignModal(false);
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "rgba(3,105,161,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconBriefcase />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text, #1e293b)" }}>
            My Employment
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted, #64748b)", marginTop: 2 }}>
            {record.companyName} &middot; {record.jobTitle}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "grid", gap: 12, paddingBottom: 32 }}>
        <EmploymentHeroCard record={record} />
        <EmploymentDetailsCard record={record} />

        <WorkDiarySection employmentId={record.id} />
        <WorkDiaryQuickReport employmentId={record.id} />

        {hrCandidateId && (
          <EmployeeTaskViewSection hrCandidateId={hrCandidateId} />
        )}

        {hrCandidateId && (
          <EmployeeAvailabilitySection hrCandidateId={hrCandidateId} />
        )}

        {hrCandidateId && (
          <EmployeeScheduleSection hrCandidateId={hrCandidateId} />
        )}

        <EmployeeIncidentReportSection
          employmentId={record.id}
          hrCandidateId={hrCandidateId}
          employeeName={record.jobTitle}
        />

        {canApplyLeave && hrCandidateId && (
          <EmploymentLeaveSection
            hrCandidateId={hrCandidateId}
            onApplyLeave={() => setShowLeaveModal(true)}
          />
        )}

        {hrCandidateId && (
          <EmployeePerformanceReviewSection hrCandidateId={hrCandidateId} />
        )}

        <EmploymentRatingSection record={record} />

        <EmploymentResignationSection
          record={record}
          onResign={() => setShowResignModal(true)}
        />
      </div>

      {/* Modals */}
      {showResignModal && (
        <ResignationModal
          companyName={record.companyName}
          jobTitle={record.jobTitle}
          onSubmit={handleResignSubmit}
          onClose={() => setShowResignModal(false)}
        />
      )}

      {showLeaveModal && hrCandidateId && (
        <LeaveApplyModal
          open={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          hrCandidateId={hrCandidateId}
          employeeUniqueId=""
          employeeName={record.jobTitle}
        />
      )}
    </div>
  );
}