// App name: Job Mitra
// File name: EmployeeEmployerFeedbackSubmittedCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\feedback\EmployeeEmployerFeedbackSubmittedCard.tsx

import { useEffect, useMemo, useState } from "react";
import {
  careerEmployerFeedbackStorage,
  getCareerEmployerFeedbackTagLabel,
  type CareerEmployerFeedbackTask,
} from "../../../../../shared/employmentFeedback/careerEmployerFeedback.storage";

type Props = {
  task: CareerEmployerFeedbackTask;
  canEdit: boolean;
  submittedBy: string;
  onEdit: () => void;
};

function formatDateTime(timestamp?: number): string {
  if (!timestamp) return "Not recorded";

  try {
    return new Date(timestamp).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Not recorded";
  }
}

function getLockMessage(editWindowExpiresAt?: number): string {
  if (!editWindowExpiresAt) return "Feedback is now locked.";

  const remainingMs = editWindowExpiresAt - Date.now();

  if (remainingMs <= 0) {
    return "Feedback is now locked.";
  }

  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));

  if (remainingMinutes >= 60) {
    return "You can still edit this feedback. It will lock after 1 hour or after 3 edits, whichever comes first.";
  }

  return `You can still edit this feedback. It will lock after ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"} or after 3 edits, whichever comes first.`;
}

export function EmployeeEmployerFeedbackSubmittedCard({
  task,
  canEdit,
  submittedBy,
  onEdit,
}: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const editsUsed = task.editCount ?? 0;
  const editsRemaining = Math.max(0, careerEmployerFeedbackStorage.MAX_EDIT_COUNT - editsUsed);
  const editHistory = Array.isArray(task.editHistory) ? task.editHistory : [];
  const lastEdit = editHistory.at(-1)?.editedAt;

  const editWindowActive = Boolean(task.editWindowExpiresAt && task.editWindowExpiresAt > now);
  const correctionLimitAvailable = editsRemaining > 0;
  const canUseEdit = canEdit && editWindowActive && correctionLimitAvailable;

  const statusMessage = useMemo(() => {
    if (!editWindowActive || !correctionLimitAvailable) {
      return "Feedback is now locked.";
    }

    return getLockMessage(task.editWindowExpiresAt);
  }, [editWindowActive, correctionLimitAvailable, task.editWindowExpiresAt]);

  return (
    <div
      className="wm-ee-card"
      style={{ borderLeft: "4px solid var(--wm-er-accent-career, #1d4ed8)" }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #1e293b)" }}>
        Your Employer Experience Feedback
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted, #64748b)",
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        Your structured feedback is saved for this completed Career employment record. Raw comments
        are not public and are not directly shown to the employer.
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 7, flexWrap: "wrap" }}>
        {(task.selectedTags ?? []).map((tag) => (
          <span
            key={tag}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(29,78,216,0.08)",
              border: "1px solid rgba(29,78,216,0.12)",
              color: "var(--wm-er-accent-career, #1d4ed8)",
              fontSize: 11.4,
              fontWeight: 850,
            }}
          >
            {getCareerEmployerFeedbackTagLabel(tag)}
          </span>
        ))}
      </div>

      {task.privateComment && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(15,23,42,0.04)",
            color: "var(--wm-er-muted, #64748b)",
            fontSize: 12,
            lineHeight: 1.5,
            fontWeight: 650,
          }}
        >
          &ldquo;{task.privateComment}&rdquo;
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          padding: "10px 11px",
          borderRadius: 13,
          background: "rgba(15,23,42,0.035)",
          border: "1px solid rgba(148,163,184,0.14)",
          display: "grid",
          gap: 7,
        }}
      >
        <ProofRow label="Submitted by" value={submittedBy} />
        <ProofRow label="Employer / Company" value={task.companyName} />
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
          marginTop: 11,
          padding: "8px 10px",
          borderRadius: 11,
          background: canUseEdit ? "rgba(29,78,216,0.055)" : "rgba(22,163,74,0.06)",
          border: canUseEdit ? "1px solid rgba(29,78,216,0.12)" : "1px solid rgba(22,163,74,0.14)",
          color: canUseEdit ? "var(--wm-er-muted, #64748b)" : "#15803d",
          fontSize: 11.2,
          fontWeight: 850,
          lineHeight: 1.4,
        }}
      >
        {statusMessage}
      </div>

      {canUseEdit && (
        <button
          type="button"
          onClick={onEdit}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 11,
            border: "1px solid rgba(29,78,216,0.24)",
            background: "rgba(29,78,216,0.08)",
            color: "var(--wm-er-accent-career, #1d4ed8)",
            fontWeight: 850,
            fontSize: 12,
            cursor: "pointer",
          }}
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
      <span style={{ fontSize: 10.8, color: "var(--wm-er-muted, #64748b)", fontWeight: 800 }}>
        {label}
      </span>
      <span
        style={{
          maxWidth: "58%",
          textAlign: "right",
          fontSize: 10.9,
          color: "var(--wm-er-text, #1e293b)",
          fontWeight: 900,
          overflowWrap: "anywhere",
        }}
      >
        {value || "Not recorded"}
      </span>
    </div>
  );
}
