/** Job Mitra | EmploymentRecordWorkspace.tsx | Full Company Work Log body */

import type { CareerEmploymentFeedbackTask } from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { WorkFeedbackSummaryCard } from "../../../../shared/employmentFeedback/WorkFeedbackSummaryCard";
import { EmployeeAvailabilitySection } from "./EmployeeAvailabilitySection";
import { EmployeeIncidentReportSection } from "./EmployeeIncidentReportSection";
import { EmployeePerformanceReviewSection } from "./EmployeePerformanceReviewSection";
import { EmployeeScheduleSection } from "./EmployeeScheduleSection";
import { EmployeeTaskViewSection } from "./EmployeeTaskViewSection";
import { EmploymentDetailsCard } from "./EmploymentDetailsCard";
import { EmploymentHeroCard } from "./EmploymentHeroCard";
import { EmploymentLeaveSection } from "./EmploymentLeaveSection";
import { EmploymentPrimarySwitcher } from "./EmploymentPrimarySwitcher";
import { EmploymentRatingSection } from "./EmploymentRatingSection";
import { LeaveApplyModal } from "./LeaveApplyModal";
import { WorkDiaryQuickReport } from "./WorkDiaryQuickReport";
import { WorkDiarySection } from "./WorkDiarySection";
import type { EmploymentRecord } from "../storage/employmentLifecycle.storage";

type Props = {
  readonly record: EmploymentRecord;
  readonly activeRecords: EmploymentRecord[];
  readonly primaryId: string | null;
  readonly onSetPrimary: (employmentId: string) => void;
  readonly employeeUniqueId: string;
  readonly completedFeedback: CareerEmploymentFeedbackTask | null;
  readonly hrCandidateId: string | null;
  readonly isClosedEmployment: boolean;
  readonly showHrEmploymentTools: boolean;
  readonly showManagerEmploymentTools: boolean;
  readonly canApplyLeave: boolean;
  readonly showLeaveModal: boolean;
  readonly onLeaveModal: (open: boolean) => void;
};

export function EmploymentRecordWorkspace({
  record,
  activeRecords,
  primaryId,
  onSetPrimary,
  employeeUniqueId,
  completedFeedback,
  hrCandidateId,
  isClosedEmployment,
  showHrEmploymentTools,
  showManagerEmploymentTools,
  canApplyLeave,
  showLeaveModal,
  onLeaveModal,
}: Props) {
  return (
    <div style={{ display: "grid", gap: 12, paddingBottom: 32 }}>
      <EmploymentHeroCard record={record} />

      {!isClosedEmployment && (
        <EmploymentPrimarySwitcher
          currentRecord={record}
          activeEmployments={activeRecords}
          primaryId={primaryId}
          onSetPrimary={onSetPrimary}
        />
      )}

      <EmploymentDetailsCard record={record} />

      {completedFeedback?.selectedTags && completedFeedback.selectedTags.length > 0 && (
        <WorkFeedbackSummaryCard
          tags={completedFeedback.selectedTags}
          companyName={completedFeedback.companyName ?? record.companyName}
          jobTitle={completedFeedback.jobTitle ?? record.jobTitle}
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
        activeEmployments={activeRecords}
        readOnly={isClosedEmployment}
      />

      <WorkDiaryQuickReport
        employmentId={record.id}
        jobTitle={record.jobTitle}
        companyName={record.companyName}
      />

      {showHrEmploymentTools && hrCandidateId ? (
        <EmployeeTaskViewSection hrCandidateId={hrCandidateId} />
      ) : null}
      {showHrEmploymentTools && hrCandidateId ? (
        <EmployeeAvailabilitySection hrCandidateId={hrCandidateId} />
      ) : null}
      {showHrEmploymentTools && hrCandidateId ? (
        <EmployeeScheduleSection hrCandidateId={hrCandidateId} />
      ) : null}

      {showManagerEmploymentTools && hrCandidateId ? (
        <EmployeeIncidentReportSection
          employmentId={record.id}
          hrCandidateId={hrCandidateId}
          employeeName={record.jobTitle}
        />
      ) : null}

      {canApplyLeave && hrCandidateId ? (
        <EmploymentLeaveSection
          hrCandidateId={hrCandidateId}
          onApplyLeave={() => onLeaveModal(true)}
        />
      ) : null}

      {showHrEmploymentTools && hrCandidateId ? (
        <EmployeePerformanceReviewSection hrCandidateId={hrCandidateId} />
      ) : null}

      {showLeaveModal && canApplyLeave && hrCandidateId ? (
        <LeaveApplyModal
          open={showLeaveModal}
          onClose={() => onLeaveModal(false)}
          hrCandidateId={hrCandidateId}
          employeeUniqueId=""
          employeeName={record.jobTitle}
        />
      ) : null}
    </div>
  );
}
