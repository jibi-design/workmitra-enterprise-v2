// App name: Job Mitra
// File name: EmployerCareerCompletedRecordsSections.tsx

import type { StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  getFeedbackStatusForStaff,
  getFeedbackStatusLabel,
  getRecordDepartmentLabel,
} from "../helpers/employerCareerRecords.helpers";
import type { CareerEmploymentFeedbackTask } from "../../myStaff/storage/careerEmploymentFeedback.storage";
import {
  COMPLETED_DEPARTMENT_META_STYLE,
  COMPLETED_EMPTY_GUIDE_CHIP_STYLE,
  COMPLETED_EMPTY_GUIDE_GRID_STYLE,
  COMPLETED_EMPTY_GUIDE_TEXT_STYLE,
  COMPLETED_EMPTY_GUIDE_TITLE_STYLE,
  COMPLETED_EMPTY_ICON_STYLE,
  COMPLETED_EMPTY_STATE_STYLE,
  COMPLETED_EMPTY_TEXT_STYLE,
  COMPLETED_EMPTY_TITLE_STYLE,
  COMPLETED_EXIT_BADGE_STYLE,
  COMPLETED_FEEDBACK_BADGE_STYLE,
  COMPLETED_OPEN_TEXT_STYLE,
  COMPLETED_RECORD_META_STYLE,
  COMPLETED_RECORD_ROW_STYLE,
  COMPLETED_RECORD_TITLE_STYLE,
  COMPLETED_ROW_BOTTOM_STYLE,
  COMPLETED_ROW_TOP_STYLE,
} from "../helpers/employerCareerCompletedRecordsPage.styles";

const CAREER_BLUE_DEEP = "#1e3a8a";

export function CompletedRecordsEmptyState({ hasAnyRecords }: { hasAnyRecords: boolean }) {
  return (
    <section style={COMPLETED_EMPTY_STATE_STYLE}>
      <div style={COMPLETED_EMPTY_ICON_STYLE} aria-hidden="true">
        ✓
      </div>

      <div style={COMPLETED_EMPTY_TITLE_STYLE}>
        {hasAnyRecords ? "No records match this filter" : "No completed Career records yet"}
      </div>

      <div style={COMPLETED_EMPTY_TEXT_STYLE}>
        {hasAnyRecords
          ? "Try a different search term, department, or feedback status filter to find the completed staff record."
          : "Exited employees will appear here after employment is closed. This keeps old staff records separate from active employees."}
      </div>

      <div style={COMPLETED_EMPTY_GUIDE_GRID_STYLE}>
        <EmptyGuideChip
          title="Long-term lookup"
          text="Search old staff by name, Unique ID, job, or department."
        />
        <EmptyGuideChip
          title="Feedback status"
          text="Track whether protected work feedback is pending or saved."
        />
      </div>
    </section>
  );
}

function EmptyGuideChip({ title, text }: { title: string; text: string }) {
  return (
    <div style={COMPLETED_EMPTY_GUIDE_CHIP_STYLE}>
      <div style={COMPLETED_EMPTY_GUIDE_TITLE_STYLE}>{title}</div>
      <div style={COMPLETED_EMPTY_GUIDE_TEXT_STYLE}>{text}</div>
    </div>
  );
}

export function CompactRecordRow({
  record,
  feedbackTasks,
  onOpen,
}: {
  record: StaffRecord;
  feedbackTasks: CareerEmploymentFeedbackTask[];
  onOpen: () => void;
}) {
  const feedbackStatus = getFeedbackStatusForStaff(record, feedbackTasks);
  const feedbackIsPending = feedbackStatus === "pending";
  const departmentLabel = getRecordDepartmentLabel(record);

  return (
    <button type="button" onClick={onOpen} style={COMPLETED_RECORD_ROW_STYLE}>
      <div style={COMPLETED_ROW_TOP_STYLE}>
        <div style={{ minWidth: 0 }}>
          <div style={COMPLETED_RECORD_TITLE_STYLE}>{record.employeeName}</div>
          <div style={COMPLETED_RECORD_META_STYLE}>
            {[record.employeeUniqueId, record.jobTitle].filter(Boolean).join(" - ")}
          </div>
          <div style={COMPLETED_DEPARTMENT_META_STYLE}>{departmentLabel}</div>
        </div>
        <span style={COMPLETED_EXIT_BADGE_STYLE}>Exited</span>
      </div>

      <div style={COMPLETED_ROW_BOTTOM_STYLE}>
        <span
          style={{
            ...COMPLETED_FEEDBACK_BADGE_STYLE,
            color: feedbackIsPending ? CAREER_BLUE_DEEP : "rgba(15,23,42,0.62)",
            background: feedbackIsPending ? "rgba(29,78,216,0.08)" : "rgba(15,23,42,0.055)",
          }}
        >
          {getFeedbackStatusLabel(feedbackStatus)}
        </span>
        <span style={COMPLETED_OPEN_TEXT_STYLE}>View record</span>
      </div>
    </button>
  );
}
