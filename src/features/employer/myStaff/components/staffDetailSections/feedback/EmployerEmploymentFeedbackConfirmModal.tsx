// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerEmploymentFeedbackConfirmModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\myStaff\components\staffDetailSections\feedback\EmployerEmploymentFeedbackConfirmModal.tsx

import { CenterModal } from "../../../../../../shared/components/CenterModal";
import {
  MUTED,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  TEXT,
  WARNING_STYLE,
} from "./employerEmploymentFeedback.helpers";

type Props = {
  open: boolean;
  isEdit: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function EmployerEmploymentFeedbackConfirmModal({
  open,
  isEdit,
  onClose,
  onConfirm,
}: Props) {
  return (
    <CenterModal
      open={open}
      onBackdropClose={onClose}
      ariaLabel="Confirm employment feedback submission"
      maxWidth={390}
    >
      <div style={{ padding: 18 }}>
        <div
          style={{ fontSize: 10, fontWeight: 950, color: "#92400e", textTransform: "uppercase" }}
        >
          Protected work feedback
        </div>

        <div style={{ marginTop: 8, fontSize: 17, fontWeight: 950, color: TEXT }}>
          {isEdit ? "Confirm Feedback Update" : "Confirm Feedback Submission"}
        </div>

        <div style={{ ...WARNING_STYLE, marginTop: 12 }}>
          This feedback can support the employee&apos;s approved work record. Submit only fair and
          truthful feedback based on actual completed work.
        </div>

        <div
          style={{ marginTop: 12, fontSize: 12, color: MUTED, lineHeight: 1.5, fontWeight: 750 }}
        >
          After submit, editing is limited to 1 hour and up to 3 corrections. Backend release will
          add account/session audit, moderation, and dispute review before any public reputation
          use.
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 9 }}>
          <button type="button" onClick={onClose} style={SECONDARY_BUTTON_STYLE}>
            Review Again
          </button>

          <button type="button" onClick={onConfirm} style={PRIMARY_BUTTON_STYLE}>
            {isEdit ? "Submit Update" : "Submit Work Feedback"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
