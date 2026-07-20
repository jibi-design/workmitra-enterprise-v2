// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerEmploymentFeedbackForm.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\feedback\EmployerEmploymentFeedbackForm.tsx

import {
  CAREER_EMPLOYMENT_FEEDBACK_TAGS,
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackTag,
} from "../../../storage/careerEmploymentFeedback.storage";
import {
  CAREER,
  MUTED,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  TEXT,
  WARNING_STYLE,
  type ConfirmationState,
} from "./employerEmploymentFeedback.helpers";

type Props = {
  selectedTags: CareerEmploymentFeedbackTag[];
  privateNote: string;
  confirmations: ConfirmationState;
  canContinue: boolean;
  onToggleTag: (tag: CareerEmploymentFeedbackTag) => void;
  onPrivateNoteChange: (value: string) => void;
  onConfirmationChange: (key: keyof ConfirmationState, checked: boolean) => void;
  onCancel: () => void;
  onContinue: () => void;
};

export function EmployerEmploymentFeedbackForm({
  selectedTags,
  privateNote,
  confirmations,
  canContinue,
  onToggleTag,
  onPrivateNoteChange,
  onConfirmationChange,
  onCancel,
  onContinue,
}: Props) {
  return (
    <div style={{ marginTop: 13 }}>
      <div style={WARNING_STYLE}>
        Submit only fair and truthful work feedback based on this employee&apos;s actual completed
        work record.
      </div>

      <div style={{ fontSize: 12, fontWeight: 950, color: TEXT, marginTop: 12, marginBottom: 8 }}>
        Select structured feedback
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {CAREER_EMPLOYMENT_FEEDBACK_TAGS.map((tag) => {
          const selected = selectedTags.includes(tag.value);

          return (
            <button
              key={tag.value}
              type="button"
              onClick={() => onToggleTag(tag.value)}
              style={{
                minHeight: 34,
                padding: "0 11px",
                borderRadius: 999,
                border: selected
                  ? "1px solid rgba(79,70,229,0.34)"
                  : "1px solid rgba(148,163,184,0.18)",
                background: selected ? "rgba(79,70,229,0.1)" : "rgba(255,255,255,0.78)",
                color: selected ? CAREER : MUTED,
                fontSize: 11.6,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <label
          style={{
            display: "block",
            fontSize: 11.5,
            fontWeight: 950,
            color: TEXT,
            marginBottom: 6,
          }}
        >
          Private note optional
        </label>

        <textarea
          value={privateNote}
          onChange={(event) =>
            onPrivateNoteChange(
              event.target.value.slice(0, careerEmploymentFeedbackStorage.MAX_PRIVATE_NOTE_LENGTH),
            )
          }
          placeholder="Internal note only. Example: Completed assigned work and followed workplace instructions."
          rows={3}
          style={{
            width: "100%",
            padding: "10px 11px",
            borderRadius: 13,
            border: "1px solid rgba(148,163,184,0.24)",
            background: "rgba(255,255,255,0.84)",
            color: TEXT,
            fontSize: 12.6,
            fontWeight: 700,
            resize: "vertical",
            boxSizing: "border-box",
            outline: "none",
          }}
        />

        <div
          style={{
            marginTop: 4,
            textAlign: "right",
            fontSize: 10.8,
            color: MUTED,
            fontWeight: 800,
          }}
        >
          {privateNote.length}/{careerEmploymentFeedbackStorage.MAX_PRIVATE_NOTE_LENGTH}
        </div>
      </div>

      <div style={{ marginTop: 11, display: "grid", gap: 7 }}>
        <ConfirmCheckbox
          checked={confirmations.actualWorkRecord}
          label="This feedback is based on the employee's actual completed work record."
          onChange={(checked) => onConfirmationChange("actualWorkRecord", checked)}
        />
        <ConfirmCheckbox
          checked={confirmations.fairFeedback}
          label="I understand false or unfair feedback may be reviewed later."
          onChange={(checked) => onConfirmationChange("fairFeedback", checked)}
        />
        <ConfirmCheckbox
          checked={confirmations.lockUnderstood}
          label="I understand edit is limited after submit."
          onChange={(checked) => onConfirmationChange("lockUnderstood", checked)}
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" onClick={onCancel} style={SECONDARY_BUTTON_STYLE}>
          Later
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          style={{
            ...PRIMARY_BUTTON_STYLE,
            background: canContinue ? CAREER : "rgba(148,163,184,0.34)",
            color: canContinue ? "#fff" : "#64748b",
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
    <label
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        padding: "8px 10px",
        borderRadius: 11,
        background: "rgba(15,23,42,0.035)",
        border: "1px solid rgba(148,163,184,0.14)",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ marginTop: 2, flexShrink: 0 }}
      />
      <span style={{ fontSize: 11.4, lineHeight: 1.4, fontWeight: 780, color: TEXT }}>{label}</span>
    </label>
  );
}
