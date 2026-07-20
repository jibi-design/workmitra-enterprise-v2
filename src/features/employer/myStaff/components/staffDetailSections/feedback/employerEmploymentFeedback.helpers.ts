// App: Job Mitra / WorkMitra_Enterprise_v2
// File: employerEmploymentFeedback.helpers.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\feedback\employerEmploymentFeedback.helpers.ts

import type {
  CareerEmploymentFeedbackStaffSnapshot,
  CareerEmploymentFeedbackTag,
  CareerEmploymentFeedbackTask,
} from "../../../storage/careerEmploymentFeedback.storage";

export type ConfirmationState = {
  actualWorkRecord: boolean;
  fairFeedback: boolean;
  lockUnderstood: boolean;
};

export const CAREER = "var(--wm-er-accent-career, #4f46e5)";
export const TEXT = "var(--wm-er-text, #111827)";
export const MUTED = "var(--wm-er-muted, #64748b)";

export function parseSnapshot(raw: string): CareerEmploymentFeedbackStaffSnapshot {
  try {
    const parsed = JSON.parse(raw) as CareerEmploymentFeedbackStaffSnapshot;

    return {
      task: parsed.task ?? null,
      canEdit: Boolean(parsed.canEdit),
    };
  } catch {
    return { task: null, canEdit: false };
  }
}

export function formatDateTime(timestamp?: number): string {
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

export function toggleTag(
  current: CareerEmploymentFeedbackTag[],
  next: CareerEmploymentFeedbackTag,
): CareerEmploymentFeedbackTag[] {
  return current.includes(next) ? current.filter((tag) => tag !== next) : [...current, next];
}

export function emptyConfirmations(): ConfirmationState {
  return {
    actualWorkRecord: false,
    fairFeedback: false,
    lockUnderstood: false,
  };
}

export function allConfirmed(value: ConfirmationState): boolean {
  return value.actualWorkRecord && value.fairFeedback && value.lockUnderstood;
}

export function getLockMessage(task: CareerEmploymentFeedbackTask, editsRemaining: number): string {
  if (!task.editWindowExpiresAt || editsRemaining <= 0) return "Feedback is now locked.";

  const remainingMs = task.editWindowExpiresAt - Date.now();
  if (remainingMs <= 0) return "Feedback is now locked.";

  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));

  return `You can still edit this feedback. It will lock after ${remainingMinutes} minute${
    remainingMinutes === 1 ? "" : "s"
  } or after 3 edits, whichever comes first.`;
}

export const WARNING_STYLE = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.18)",
  color: "#92400e",
  fontSize: 11.8,
  fontWeight: 800,
  lineHeight: 1.5,
} as const;

export const PROOF_BOX_STYLE = {
  marginTop: 12,
  padding: "10px 11px",
  borderRadius: 13,
  background: "rgba(15,23,42,0.035)",
  border: "1px solid rgba(148,163,184,0.14)",
  display: "grid",
  gap: 7,
} as const;

export const PRIMARY_BUTTON_STYLE = {
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 12,
  border: "none",
  background: CAREER,
  color: "#fff",
  fontSize: 12.5,
  fontWeight: 950,
  cursor: "pointer",
} as const;

export const SECONDARY_BUTTON_STYLE = {
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "transparent",
  color: MUTED,
  fontSize: 12.5,
  fontWeight: 850,
  cursor: "pointer",
} as const;
