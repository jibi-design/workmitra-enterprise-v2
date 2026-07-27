// App name: Job Mitra | EmployerCareerCompletedRecordsPage.tsx — DomainHero (Wave 2)

import { EmployerCareerCompletedRecordsHeader } from "../components/EmployerCareerCompletedRecordsHeader";
import {
  CompactRecordRow,
  CompletedRecordsEmptyState,
} from "../components/EmployerCareerCompletedRecordsSections";
import {
  COMPLETED_FILTER_GRID_STYLE,
  COMPLETED_INPUT_STYLE,
  COMPLETED_PAGE_STYLE,
} from "../helpers/employerCareerCompletedRecordsPage.styles";
import type { FeedbackStatusFilter } from "../helpers/employerCareerRecords.helpers";
import { useEmployerCareerCompletedRecordsPage } from "../hooks/useEmployerCareerCompletedRecordsPage";

export function EmployerCareerCompletedRecordsPage() {
  const page = useEmployerCareerCompletedRecordsPage();

  return (
    <div
      className="wm-er-vCareer wm-stackGrid"
      data-testid="employer-career-completed-records"
      style={COMPLETED_PAGE_STYLE}
    >
      <EmployerCareerCompletedRecordsHeader />

      <section
        className="wm-career-surface-glass wm-career-surface-glass--compact"
        style={{ display: "grid", gap: 8 }}
        data-testid="career-completed-filters"
      >
        <input
          value={page.query}
          onChange={(event) => page.setQuery(event.target.value)}
          placeholder="Search by name, Unique ID, job, or department"
          style={COMPLETED_INPUT_STYLE}
        />

        <div style={COMPLETED_FILTER_GRID_STYLE}>
          <select
            value={page.departmentFilter}
            onChange={(event) => page.setDepartmentFilter(event.target.value)}
            style={COMPLETED_INPUT_STYLE}
          >
            <option value="">Department: All</option>
            {page.departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={page.feedbackStatus}
            onChange={(event) => page.setFeedbackStatus(event.target.value as FeedbackStatusFilter)}
            style={COMPLETED_INPUT_STYLE}
          >
            <option value="all">Feedback: All</option>
            <option value="pending">Feedback pending</option>
            <option value="completed">Feedback saved</option>
            <option value="none">No feedback yet</option>
          </select>
        </div>
      </section>

      {page.filtered.length === 0 ? (
        <CompletedRecordsEmptyState hasAnyRecords={page.records.length > 0} />
      ) : (
        <section style={{ display: "grid", gap: "var(--wm-stack-gap)" }}>
          {page.filtered.map((record) => (
            <CompactRecordRow
              key={record.id}
              record={record}
              feedbackTasks={page.feedbackTasks}
              onOpen={() => page.openRecord(record.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
