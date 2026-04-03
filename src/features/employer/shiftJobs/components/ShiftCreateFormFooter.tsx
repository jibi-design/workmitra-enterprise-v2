// src/features/employer/shiftJobs/components/ShiftCreateFormFooter.tsx
//
// Footer for EmployerShiftCreatePage.
// Validation errors, Cancel/Create buttons, all modals.

import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import { IconPlus } from "./ShiftCreateIcons";
import { ShiftCreateConfirmModal } from "./ShiftCreateConfirmModal";

type Props = {
  isValid: boolean;
  errors: string[];
  onCancel: () => void;
  onCreate: () => void;
  /* Confirm modal */
  discardConfirm: ConfirmData | null;
  onDiscardCancel: () => void;
  onDiscardConfirm: () => void;
  /* Notice modal */
  notice: NoticeData | null;
  onNoticeDismiss: () => void;
  /* Create confirm modal */
  showCreateConfirm: boolean;
  createPreview: { jobName: string; companyName: string; workers: number; payPerDay: number; locationName: string; dateRange: string };
  onCreateConfirm: () => void;
  onCreateCancel: () => void;
};

export function ShiftCreateFormFooter({
  isValid, errors, onCancel, onCreate,
  discardConfirm, onDiscardCancel, onDiscardConfirm,
  notice, onNoticeDismiss,
  showCreateConfirm, createPreview, onCreateConfirm, onCreateCancel,
}: Props) {
  return (
    <>
      {/* Validation errors */}
      {!isValid && errors.length > 0 && (
        <div style={{
          marginTop: 12, padding: 14, borderRadius: "var(--wm-radius-14)",
          border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)",
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-error)" }}>
            Please fix before creating:
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
            {errors.map((err) => <div key={err}>&mdash; {err}</div>)}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end", paddingBottom: 32 }}>
        <button className="wm-outlineBtn" type="button" onClick={onCancel}>Cancel</button>
        <button className="wm-primarybtn" type="button" onClick={onCreate} disabled={!isValid}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          <IconPlus /> Create Post
        </button>
      </div>

      {/* Modals */}
      <NoticeModal notice={notice} onClose={onNoticeDismiss} />
      <ConfirmModal confirm={discardConfirm} onCancel={onDiscardCancel} onConfirm={onDiscardConfirm} />
      <ShiftCreateConfirmModal open={showCreateConfirm} {...createPreview} onConfirm={onCreateConfirm} onCancel={onCreateCancel} />
    </>
  );
}