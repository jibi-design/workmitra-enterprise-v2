// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerEmploymentFeedbackPendingCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\feedback\EmployerEmploymentFeedbackPendingCard.tsx

import type { CareerEmploymentFeedbackTask } from "../../../myStaff/storage/careerEmploymentFeedback.storage";

type Props = {
  task: CareerEmploymentFeedbackTask;
  pendingCount: number;
  onAddFeedback: () => void;
  onRemindLater: () => void;
  onDismiss: () => void;
};

const CAREER = "var(--wm-er-accent-career, #4f46e5)";
const TEXT = "var(--wm-er-text, #111827)";
const MUTED = "var(--wm-er-muted, #64748b)";

export function EmployerEmploymentFeedbackPendingCard({
  task,
  pendingCount,
  onAddFeedback,
  onRemindLater,
  onDismiss,
}: Props) {
  const extraCount = Math.max(0, pendingCount - 1);

  return (
    <section
      style={{
        marginTop: 10,
        padding: "10px 11px",
        borderRadius: "var(--wm-radius-chip)",
        border: "1px solid rgba(79,70,229,0.13)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))",
        boxShadow: "0 6px 14px rgba(15,23,42,0.035)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
        <div
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--wm-radius-chip)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(79,70,229,0.08)",
            border: "1px solid rgba(79,70,229,0.1)",
            color: CAREER,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5 4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Zm8 1v4h4l-4-4ZM8 12h8v2H8v-2Zm0 4h6v2H8v-2Z"
            />
          </svg>
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.2, fontWeight: 950, color: TEXT, lineHeight: 1.2 }}>
            Work Feedback Pending
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: 11.1,
              color: MUTED,
              lineHeight: 1.35,
              fontWeight: 700,
            }}
          >
            {task.employeeName} · {task.jobTitle} · {task.companyName}
            {extraCount > 0 ? ` · +${extraCount} more` : ""}
          </div>

          <div
            style={{ marginTop: 8, display: "flex", gap: "var(--wm-space-8)", flexWrap: "wrap" }}
          >
            <button type="button" className="wm-primarybtn" onClick={onAddFeedback}>
              Add Feedback
            </button>

            <button type="button" className="wm-outlineBtn" onClick={onRemindLater}>
              Remind later
            </button>

            <button type="button" className="wm-ghostBtn" onClick={onDismiss}>
              Hide from Home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
