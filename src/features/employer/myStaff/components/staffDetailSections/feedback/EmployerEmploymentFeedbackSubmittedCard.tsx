// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerEmploymentFeedbackSubmittedCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\feedback\EmployerEmploymentFeedbackSubmittedCard.tsx

import {
  getCareerEmploymentFeedbackTagLabel,
  type CareerEmploymentFeedbackTask,
} from "../../../storage/careerEmploymentFeedback.storage";
import {
  CAREER,
  MUTED,
  PRIMARY_BUTTON_STYLE,
  PROOF_BOX_STYLE,
  TEXT,
  formatDateTime,
} from "./employerEmploymentFeedback.helpers";

type Props = {
  task: CareerEmploymentFeedbackTask;
  editsUsed: number;
  lastEdit?: number;
  canEdit: boolean;
  lockMessage: string;
  onEdit: () => void;
};

export function EmployerEmploymentFeedbackSubmittedCard({
  task,
  editsUsed,
  lastEdit,
  canEdit,
  lockMessage,
  onEdit,
}: Props) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "10px 11px",
        borderRadius: 15,
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <div style={{ fontSize: 12.4, fontWeight: 950, color: "#16a34a" }}>Work feedback saved</div>

      {task.selectedTags && task.selectedTags.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {task.selectedTags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "5px 9px",
                borderRadius: 999,
                background: "rgba(79,70,229,0.08)",
                border: "1px solid rgba(79,70,229,0.12)",
                color: CAREER,
                fontSize: 11.3,
                fontWeight: 850,
              }}
            >
              {getCareerEmploymentFeedbackTagLabel(tag)}
            </span>
          ))}
        </div>
      )}

      {task.privateNote && (
        <div
          style={{
            marginTop: 9,
            fontSize: 11.8,
            color: MUTED,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          Private note saved internally.
        </div>
      )}

      <div style={PROOF_BOX_STYLE}>
        <ProofRow label="Given by" value={task.companyName} />
        <ProofRow label="Given to" value={task.employeeUniqueId} />
        <ProofRow label="Career job" value={task.jobTitle} />
        <ProofRow label="First submitted" value={formatDateTime(task.completedAt)} />
        <ProofRow label="Last updated" value={formatDateTime(task.updatedAt)} />
        {lastEdit && <ProofRow label="Last edited" value={formatDateTime(lastEdit)} />}
        <ProofRow
          label="Edit status"
          value={editsUsed > 0 ? `${editsUsed} edits used` : "No edits used"}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          padding: "8px 10px",
          borderRadius: 11,
          background: canEdit ? "rgba(79,70,229,0.055)" : "rgba(22,163,74,0.06)",
          border: canEdit ? "1px solid rgba(79,70,229,0.12)" : "1px solid rgba(22,163,74,0.14)",
          color: canEdit ? MUTED : "#15803d",
          fontSize: 11.2,
          fontWeight: 850,
          lineHeight: 1.4,
        }}
      >
        {lockMessage}
      </div>

      {canEdit && (
        <button
          type="button"
          onClick={onEdit}
          style={{ ...PRIMARY_BUTTON_STYLE, width: "100%", marginTop: 10 }}
        >
          Edit Feedback
        </button>
      )}
    </div>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 10.8, color: MUTED, fontWeight: 800 }}>{label}</span>
      <span
        style={{
          maxWidth: "58%",
          textAlign: "right",
          fontSize: 10.9,
          color: TEXT,
          fontWeight: 900,
          overflowWrap: "anywhere",
        }}
      >
        {value || "Not recorded"}
      </span>
    </div>
  );
}
