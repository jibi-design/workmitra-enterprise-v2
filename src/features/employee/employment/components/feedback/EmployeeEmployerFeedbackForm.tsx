// App name: Job Mitra
// File name: EmployeeEmployerFeedbackForm.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\components\feedback\EmployeeEmployerFeedbackForm.tsx

import {
  CAREER_EMPLOYER_FEEDBACK_TAGS,
  careerEmployerFeedbackStorage,
  type CareerEmployerFeedbackTag,
} from "../../../../../shared/employmentFeedback/careerEmployerFeedback.storage";

export type FeedbackConfirmationState = {
  realExperience: boolean;
  fairTruthful: boolean;
  lockUnderstood: boolean;
};

type Props = {
  selectedTags: CareerEmployerFeedbackTag[];
  privateComment: string;
  confirmations: FeedbackConfirmationState;
  daysLeft: number;
  isEditing: boolean;
  canContinue: boolean;
  shouldShowSensitiveWarning: boolean;
  onToggleTag: (tag: CareerEmployerFeedbackTag) => void;
  onCommentChange: (value: string) => void;
  onConfirmationChange: (key: keyof FeedbackConfirmationState, checked: boolean) => void;
  onCancelEdit: () => void;
  onContinue: () => void;
};

export function EmployeeEmployerFeedbackForm({
  selectedTags,
  privateComment,
  confirmations,
  daysLeft,
  isEditing,
  canContinue,
  shouldShowSensitiveWarning,
  onToggleTag,
  onCommentChange,
  onConfirmationChange,
  onCancelEdit,
  onContinue,
}: Props) {
  return (
    <div
      className="wm-ee-card"
      style={{ borderLeft: "4px solid var(--wm-er-accent-career, #1d4ed8)" }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-accent-career, #1d4ed8)" }}>
        Your Feedback About Employer
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted, #64748b)",
          marginTop: 6,
          lineHeight: 1.55,
        }}
      >
        Share structured feedback for this completed Career employment record. This is not public
        employer reputation.
      </div>

      <div style={WARNING_STYLE}>
        Your feedback can affect employer reputation in future. Submit only fair and truthful
        feedback based on your actual work experience. You can edit or undo only within 1 hour after
        submit.
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 11.5,
          color: "var(--wm-er-text, #1e293b)",
          fontWeight: 850,
        }}
      >
        Select what was true in your experience:
      </div>

      <div style={{ marginTop: 9, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CAREER_EMPLOYER_FEEDBACK_TAGS.map((tag) => {
          const active = selectedTags.includes(tag.value);

          return (
            <button
              key={tag.value}
              type="button"
              onClick={() => onToggleTag(tag.value)}
              style={{
                padding: "8px 11px",
                borderRadius: 999,
                border: active
                  ? "1px solid rgba(29,78,216,0.32)"
                  : "1px solid rgba(148,163,184,0.22)",
                background: active ? "rgba(29,78,216,0.1)" : "rgba(255,255,255,0.92)",
                color: active
                  ? "var(--wm-er-accent-career, #1d4ed8)"
                  : "var(--wm-er-muted, #64748b)",
                fontSize: 11.5,
                fontWeight: 850,
                cursor: "pointer",
              }}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={privateComment}
        onChange={(event) => onCommentChange(event.target.value)}
        placeholder="Optional short note, for example: Payment and timing were clear. Employer was respectful."
        maxLength={careerEmployerFeedbackStorage.MAX_COMMENT_LENGTH}
        rows={3}
        style={TEXTAREA_STYLE}
      />

      <div
        style={{
          marginTop: 6,
          fontSize: 10.8,
          color: "var(--wm-er-muted, #64748b)",
          fontWeight: 700,
        }}
      >
        {privateComment.length}/{careerEmployerFeedbackStorage.MAX_COMMENT_LENGTH} characters ·{" "}
        {daysLeft} day
        {daysLeft === 1 ? "" : "s"} left
      </div>

      {shouldShowSensitiveWarning && (
        <div style={SENSITIVE_WARNING_STYLE}>
          Please avoid abusive, personal, or unsupported claims. Keep feedback based on your actual
          work experience.
        </div>
      )}

      <div style={{ marginTop: 11, display: "grid", gap: 7 }}>
        <ConfirmCheckbox
          checked={confirmations.realExperience}
          label="This feedback is based on my real work experience."
          onChange={(checked) => onConfirmationChange("realExperience", checked)}
        />
        <ConfirmCheckbox
          checked={confirmations.fairTruthful}
          label="I understand false or misuse feedback may be reviewed later."
          onChange={(checked) => onConfirmationChange("fairTruthful", checked)}
        />
        <ConfirmCheckbox
          checked={confirmations.lockUnderstood}
          label="I understand edit/undo is available only for 1 hour after submit."
          onChange={(checked) => onConfirmationChange("lockUnderstood", checked)}
        />
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {isEditing && (
          <button type="button" onClick={onCancelEdit} style={SECONDARY_BUTTON_STYLE}>
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          style={{
            ...PRIMARY_BUTTON_STYLE,
            background: canContinue ? "var(--wm-er-accent-career, #1d4ed8)" : "#e5e7eb",
            color: canContinue ? "#fff" : "#9ca3af",
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ConfirmCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label style={CHECKBOX_STYLE}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ marginTop: 2, flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 11.4,
          lineHeight: 1.4,
          fontWeight: 780,
          color: "var(--wm-er-text, #1e293b)",
        }}
      >
        {label}
      </span>
    </label>
  );
}

const WARNING_STYLE: React.CSSProperties = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.18)",
  color: "#92400e",
  fontSize: 11.8,
  fontWeight: 750,
  lineHeight: 1.5,
};

const TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%",
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1.5px solid rgba(148,163,184,0.24)",
  fontSize: 12,
  fontWeight: 650,
  color: "var(--wm-er-text, #1e293b)",
  background: "var(--wm-er-card, #f8fafc)",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const SENSITIVE_WARNING_STYLE: React.CSSProperties = {
  marginTop: 9,
  padding: "8px 10px",
  borderRadius: 11,
  background: "rgba(220,38,38,0.06)",
  border: "1px solid rgba(220,38,38,0.14)",
  color: "#b91c1c",
  fontSize: 11.3,
  fontWeight: 800,
  lineHeight: 1.45,
};

const CHECKBOX_STYLE: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "flex-start",
  padding: "8px 10px",
  borderRadius: 11,
  background: "rgba(15,23,42,0.035)",
  border: "1px solid rgba(148,163,184,0.14)",
  cursor: "pointer",
};

const SECONDARY_BUTTON_STYLE: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 11,
  border: "1px solid rgba(148,163,184,0.26)",
  background: "rgba(255,255,255,0.92)",
  color: "var(--wm-er-text, #1e293b)",
  fontWeight: 850,
  fontSize: 12,
  cursor: "pointer",
};

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 11,
  border: "none",
  fontWeight: 850,
  fontSize: 12,
};
