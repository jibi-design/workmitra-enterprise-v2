// App name: Job Mitra
// File name: EmployeeEmploymentDetailPage.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\pages\EmployeeEmploymentDetailPage.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  employmentLifecycleStorage,
  type EmploymentRecord,
} from "../storage/employmentLifecycle.storage";
import { hrManagementStorage } from "../../../employer/hrManagement/storage/hrManagement.storage";
import { EmploymentHeroCard } from "../components/EmploymentHeroCard";
import { EmploymentDetailsCard } from "../components/EmploymentDetailsCard";
import { EmploymentLeaveSection } from "../components/EmploymentLeaveSection";
import { EmployeePerformanceReviewSection } from "../components/EmployeePerformanceReviewSection";
import { LeaveApplyModal } from "../components/LeaveApplyModal";
import { WorkDiarySection } from "../components/WorkDiarySection";
import { EmployeeIncidentReportSection } from "../components/EmployeeIncidentReportSection";
import { EmployeeAvailabilitySection } from "../components/EmployeeAvailabilitySection";
import { EmployeeScheduleSection } from "../components/EmployeeScheduleSection";
import { EmployeeTaskViewSection } from "../components/EmployeeTaskViewSection";
import { WorkDiaryQuickReport } from "../components/WorkDiaryQuickReport";
import { EmploymentPrimarySwitcher } from "../components/EmploymentPrimarySwitcher";
import { EmploymentRatingSection } from "../components/EmploymentRatingSection";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackCompletedSnapshot,
} from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { WorkFeedbackSummaryCard } from "../../../../shared/employmentFeedback/WorkFeedbackSummaryCard";
import { LAUNCH_VISIBILITY } from "../../../../shared/launch/launchVisibility";

type EmploymentPageSnapshot = {
  records: EmploymentRecord[];
  activeRecords: EmploymentRecord[];
  primaryId: string | null;
};

function findHRCandidateId(careerPostId: string): string | null {
  const all = hrManagementStorage.getAll();
  const found = all.find(
    (record) => record.careerPostId === careerPostId && record.status === "active",
  );
  return found?.id ?? null;
}

function parseCompletedFeedbackSnapshot(raw: string): CareerEmploymentFeedbackCompletedSnapshot {
  try {
    const parsed = JSON.parse(raw) as CareerEmploymentFeedbackCompletedSnapshot;
    return { task: parsed.task ?? null };
  } catch {
    return { task: null };
  }
}

function getEmployeeUniqueId(): string {
  const profile = employeeProfileStorage.get();
  return profile.uniqueId || "Employee ID not available";
}

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

export function EmployeeEmploymentDetailPage() {
  const { employmentId } = useParams<{ employmentId: string }>();
  const navigate = useNavigate();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const subscribe = useCallback(
    (callback: () => void) => employmentLifecycleStorage.subscribe(callback),
    [],
  );

  const feedbackSubscribe = useCallback(
    (callback: () => void) => careerEmploymentFeedbackStorage.subscribe(callback),
    [],
  );

  const recordRef = useCallback(() => {
    const snapshot: EmploymentPageSnapshot = {
      records: employmentLifecycleStorage.getAll(),
      activeRecords: employmentLifecycleStorage.getActiveList(),
      primaryId: employmentLifecycleStorage.getPrimaryActiveId(),
    };

    return JSON.stringify(snapshot);
  }, []);

  const raw = useSyncExternalStore(subscribe, recordRef, recordRef);

  const parsed = useMemo<EmploymentPageSnapshot>(() => {
    try {
      const value = JSON.parse(raw) as EmploymentPageSnapshot;

      return {
        records: Array.isArray(value.records) ? value.records : [],
        activeRecords: Array.isArray(value.activeRecords) ? value.activeRecords : [],
        primaryId: value.primaryId ?? null,
      };
    } catch {
      return { records: [], activeRecords: [], primaryId: null };
    }
  }, [raw]);

  const record = useMemo(() => {
    return parsed.records.find((item) => item.id === employmentId) ?? null;
  }, [parsed.records, employmentId]);

  const employeeUniqueId = useMemo(() => getEmployeeUniqueId(), []);
  const careerPostId = record?.careerPostId ?? "";

  const feedbackRaw = useSyncExternalStore(
    feedbackSubscribe,
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
    () => careerEmploymentFeedbackStorage.getCompletedCareerPostSnapshot(careerPostId),
  );

  const completedFeedback = useMemo(
    () => parseCompletedFeedbackSnapshot(feedbackRaw).task,
    [feedbackRaw],
  );

  const hrCandidateId = useMemo(() => {
    if (!record) return null;
    return findHRCandidateId(record.careerPostId);
  }, [record]);

  const handleSetPrimaryEmployment = (nextEmploymentId: string) => {
    const success = employmentLifecycleStorage.setPrimaryActiveId(nextEmploymentId);

    if (success) {
      navigate(`/employee/employment/${nextEmploymentId}`, { replace: true });
    }
  };

  if (!record) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              background: "rgba(3,105,161,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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

  const isClosedEmployment = record.status === "exited";
  const showHrEmploymentTools =
    !isClosedEmployment && !!hrCandidateId && LAUNCH_VISIBILITY.employerHrManagement;

  const showManagerEmploymentTools =
    !isClosedEmployment && !!hrCandidateId && LAUNCH_VISIBILITY.employerManagerConsole;

  const canApplyLeave =
    showHrEmploymentTools && (record.status === "active" || record.status === "probation");

  return (
    <div>
      <div style={{ display: "grid", gap: 12, paddingBottom: 32 }}>
        <EmploymentHeroCard record={record} />

        {!isClosedEmployment && (
          <EmploymentPrimarySwitcher
            currentRecord={record}
            activeEmployments={parsed.activeRecords}
            primaryId={parsed.primaryId}
            onSetPrimary={handleSetPrimaryEmployment}
          />
        )}

        <EmploymentDetailsCard record={record} />

        {completedFeedback?.selectedTags && completedFeedback.selectedTags.length > 0 && (
          <WorkFeedbackSummaryCard
            tags={completedFeedback.selectedTags}
            companyName={completedFeedback.companyName}
            jobTitle={completedFeedback.jobTitle}
            givenTo={employeeUniqueId}
            recordedAt={completedFeedback.completedAt ?? record.exitedAt ?? record.updatedAt}
            displayMode="protectedRecord"
          />
        )}

        <EmploymentRatingSection record={record} />

        <WorkDiarySection
          key={record.id}
          employmentId={record.id}
          jobTitle={record.jobTitle}
          companyName={record.companyName}
          activeEmployments={parsed.activeRecords}
          readOnly={isClosedEmployment}
        />

        <WorkDiaryQuickReport
          employmentId={record.id}
          jobTitle={record.jobTitle}
          companyName={record.companyName}
        />

        {showHrEmploymentTools && <EmployeeTaskViewSection hrCandidateId={hrCandidateId} />}
        {showHrEmploymentTools && <EmployeeAvailabilitySection hrCandidateId={hrCandidateId} />}
        {showHrEmploymentTools && <EmployeeScheduleSection hrCandidateId={hrCandidateId} />}

        {showManagerEmploymentTools && (
          <EmployeeIncidentReportSection
            employmentId={record.id}
            hrCandidateId={hrCandidateId}
            employeeName={record.jobTitle}
          />
        )}

        {canApplyLeave && hrCandidateId && (
          <EmploymentLeaveSection
            hrCandidateId={hrCandidateId}
            onApplyLeave={() => setShowLeaveModal(true)}
          />
        )}

        {showHrEmploymentTools && (
          <EmployeePerformanceReviewSection hrCandidateId={hrCandidateId} />
        )}
      </div>

      {showLeaveModal && canApplyLeave && hrCandidateId && (
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
