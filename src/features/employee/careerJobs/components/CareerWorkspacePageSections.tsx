// App: Job Mitra / WorkMitra_Enterprise_v2
// File: CareerWorkspacePageSections.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerWorkspacePageSections.tsx

import type { CareerEmploymentFeedbackTask } from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import { WorkFeedbackSummaryCard } from "../../../../shared/employmentFeedback/WorkFeedbackSummaryCard";
import type { CareerWorkspace } from "../../../career/types/careerDomainTypes";
import type { EmploymentRecord } from "../../employment/storage/employmentLifecycle.storage";
import {
  explanationBg,
  explanationBorder,
  fmtDateTime,
  statusExplanation,
} from "../helpers/careerWorkspaceDisplayHelpers";
import { InfoRow, UpdateCard } from "./CareerWorkspaceComponents";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "var(--wm-career-text, #111827)";
const CAREER_MUTED = "var(--wm-career-muted, #6b7280)";

type CareerWorkspacePageSectionsProps = {
  workspace: CareerWorkspace;
  employmentRecord: EmploymentRecord | null;
  completedFeedback: CareerEmploymentFeedbackTask | null | undefined;
  onOpenEmploymentDetail: (employmentId: string) => void;
};

export function CareerWorkspacePageSections({
  workspace,
  employmentRecord,
  completedFeedback,
  onOpenEmploymentDetail,
}: CareerWorkspacePageSectionsProps) {
  const explain = statusExplanation(workspace.status);

  return (
    <>
      {explain && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: "var(--wm-radius-chip)",
            border: `1px solid ${explanationBorder(explain.tone)}`,
            background: explanationBg(explain.tone),
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: CAREER_TEXT }}>{explain.title}</div>
          <div style={{ fontSize: 12, color: CAREER_MUTED, marginTop: 4, lineHeight: 1.6 }}>
            {explain.body}
          </div>
        </div>
      )}

      {employmentRecord && (
        <button
          type="button"
          onClick={() => onOpenEmploymentDetail(employmentRecord.id)}
          style={{
            marginTop: 12,
            width: "100%",
            minHeight: 50,
            borderRadius: "var(--wm-radius-chip)",
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 950,
            cursor: "pointer",
            boxShadow: "0 12px 28px rgba(37,99,235,0.24)",
          }}
        >
          Open Daily Tasks & Work Diary
        </button>
      )}

      <div className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: CAREER_BLUE, marginBottom: 10 }}>
          Position details
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <InfoRow label="Job Title" value={workspace.jobTitle} />
          <InfoRow label="Company" value={workspace.companyName} />
          <InfoRow label="Department" value={workspace.department} />
          <InfoRow label="Location" value={workspace.location} />
          <InfoRow
            label="Hired On"
            value={workspace.hiredAt ? fmtDateTime(workspace.hiredAt) : ""}
          />
        </div>
      </div>

      {completedFeedback?.selectedTags && completedFeedback.selectedTags.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <WorkFeedbackSummaryCard
            tags={completedFeedback.selectedTags}
            companyName={completedFeedback.companyName}
            jobTitle={completedFeedback.jobTitle}
            displayMode="protectedRecord"
            subtitle="Protected feedback from this completed Career employment record."
          />
        </div>
      )}

      <div className="wm-ee-card" style={{ marginTop: "var(--wm-space-12)" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: CAREER_BLUE,
            marginBottom: "var(--wm-space-10)",
          }}
        >
          Updates ({workspace.updates.length})
        </div>

        {workspace.updates.length === 0 ? (
          <div style={{ fontSize: 12, color: CAREER_MUTED }}>
            No updates yet. Employer communications will appear here.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--wm-space-10)" }}>
            {workspace.updates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
