// App name: Job Mitra
// File name: CareerPostNotesModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerPostNotesModal.tsx

import { CenterModal } from "../../../../shared/components/CenterModal";

const MAX_EMPLOYER_NOTES_LENGTH = 600;

type CareerPostNotesModalProps = {
  open: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export function CareerPostNotesModal({
  open,
  value,
  onValueChange,
  onSave,
  onClose,
}: CareerPostNotesModalProps) {
  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Employer Notes">
      <div style={{ padding: 20 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--wm-er-accent-career)",
            marginBottom: 12,
          }}
        >
          Employer Notes
        </div>

        <textarea
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          maxLength={MAX_EMPLOYER_NOTES_LENGTH}
          placeholder="Add private notes about this candidate..."
          rows={4}
          style={{
            width: "100%",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-10)",
            border: "1.5px solid var(--wm-er-border)",
            background: "var(--wm-er-bg)",
            color: "var(--wm-er-text)",
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />

        <div
          style={{
            marginTop: 5,
            textAlign: "right",
            fontSize: 11,
            fontWeight: 800,
            color: "var(--wm-er-muted)",
          }}
        >
          {value.length}/{MAX_EMPLOYER_NOTES_LENGTH}
        </div>

        <div
          style={{
            display: "flex",
            gap: "var(--wm-space-10)",
            justifyContent: "flex-end",
            marginTop: "var(--wm-space-14)",
          }}
        >
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={onClose}
            style={{ fontSize: 13, height: 38, padding: "0 16px" }}
          >
            Cancel
          </button>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onSave}
            style={{ fontSize: 13, padding: "8px 20px" }}
          >
            Save
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
