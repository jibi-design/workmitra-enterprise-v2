// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerWorkspaceCard.tsx

import type { CareerEmploymentFeedbackTask } from "../../../../shared/employmentFeedback/careerEmploymentFeedback.storage";
import type { CareerWorkspace } from "../../../career/types/careerDomainTypes";
import {
  fmtWorkspaceDateTime,
  hasCompletedFeedbackForJob,
  workspaceStatusLabel,
  workspaceStatusTone,
  workspaceUpdateLabel,
  type WorkspaceBadgeTone,
} from "../helpers/employeeCareerWorkspaces.helpers";

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

function toneBadgeStyle(tone: WorkspaceBadgeTone): React.CSSProperties {
  if (tone === "career") {
    return {
      border: "1px solid rgba(29,78,216,0.20)",
      background: "rgba(29,78,216,0.08)",
      color: CAREER_BLUE_DEEP,
    };
  }

  if (tone === "bad") {
    return {
      border: "1px solid rgba(220,38,38,0.24)",
      background: "rgba(254,242,242,0.95)",
      color: "#dc2626",
    };
  }

  return {
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(248,250,252,0.96)",
    color: CAREER_MUTED,
  };
}

export function EmployeeCareerWorkspaceCard({
  workspace,
  feedbackTasks,
  onOpen,
}: {
  workspace: CareerWorkspace;
  feedbackTasks: CareerEmploymentFeedbackTask[];
  onOpen: () => void;
}) {
  const tone = workspaceStatusTone(workspace.status);
  const updatesCount = workspace.updates.length;
  const hasWorkFeedback = hasCompletedFeedbackForJob(feedbackTasks, workspace.jobId);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="wm-career-card wm-ee-card"
      style={{
        width: "100%",
        textAlign: "left",
        padding: 15,
        borderRadius: "var(--wm-radius-employer-card)",
        border: "1px solid rgba(29,78,216,0.13)",
        background:
          "radial-gradient(circle at 94% 0%, rgba(29,78,216,0.08), transparent 30%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        boxShadow: "0 14px 30px rgba(15,23,42,0.065)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 16,
          bottom: 16,
          width: 4,
          borderRadius: "0 var(--wm-radius-pill) var(--wm-radius-pill) 0",
          background: CAREER_BLUE,
        }}
      />

      <div style={{ paddingLeft: 5 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 950, color: CAREER_TEXT, lineHeight: 1.25 }}>
              {workspace.jobTitle}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12.5,
                fontWeight: 900,
                color: CAREER_TEXT,
                lineHeight: 1.35,
              }}
            >
              {workspace.companyName}
              {workspace.department ? ` - ${workspace.department}` : ""}
            </div>
          </div>

          <span
            style={{
              height: 26,
              padding: "0 10px",
              borderRadius: "var(--wm-radius-pill)",
              display: "inline-flex",
              alignItems: "center",
              fontSize: 10.5,
              fontWeight: 950,
              flexShrink: 0,
              whiteSpace: "nowrap",
              ...toneBadgeStyle(tone),
            }}
          >
            {workspaceStatusLabel(workspace.status)}
          </span>
        </div>

        {workspace.location && (
          <div
            style={{
              marginTop: 8,
              display: "inline-flex",
              maxWidth: "100%",
              padding: "6px 10px",
              borderRadius: "var(--wm-radius-pill)",
              background: "rgba(29,78,216,0.055)",
              border: "1px solid rgba(29,78,216,0.09)",
              color: CAREER_BLUE,
              fontSize: 11.5,
              fontWeight: 850,
              lineHeight: 1.25,
            }}
          >
            {workspace.location}
          </div>
        )}

        {hasWorkFeedback && (
          <div
            style={{
              marginTop: 9,
              display: "inline-flex",
              alignItems: "center",
              width: "fit-content",
              padding: "6px 10px",
              borderRadius: "var(--wm-radius-pill)",
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.16)",
              color: "#15803d",
              fontSize: 11.3,
              fontWeight: 950,
            }}
          >
            Work feedback available
          </div>
        )}

        <div
          style={{
            marginTop: 11,
            paddingTop: 10,
            borderTop: "1px solid rgba(148,163,184,0.14)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11.5, color: CAREER_MUTED, fontWeight: 750 }}>
            Hired {fmtWorkspaceDateTime(workspace.hiredAt)}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {updatesCount > 0 && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 950,
                  padding: "4px 8px",
                  borderRadius: "var(--wm-radius-pill)",
                  background: "rgba(29,78,216,0.09)",
                  border: "1px solid rgba(29,78,216,0.14)",
                  color: CAREER_BLUE_DEEP,
                }}
              >
                {workspaceUpdateLabel(updatesCount)}
              </span>
            )}

            <span
              style={{
                minHeight: 28,
                padding: "0 12px",
                borderRadius: "var(--wm-radius-pill)",
                display: "inline-flex",
                alignItems: "center",
                background: CAREER_BLUE,
                color: "#ffffff",
                fontSize: 11.5,
                fontWeight: 950,
                boxShadow: "0 8px 18px rgba(29,78,216,0.16)",
              }}
            >
              Open
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
