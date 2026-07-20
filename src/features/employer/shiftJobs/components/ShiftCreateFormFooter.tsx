// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftCreateFormFooter.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftCreateFormFooter.tsx

import { ConfirmModal, type ConfirmData } from "../../../../shared/components/ConfirmModal";
import { NoticeModal, type NoticeData } from "../../../../shared/components/NoticeModal";
import type { ShiftDuplicateWarning, ShiftPayBasisDraft } from "../helpers/shiftCreateHelpers";
import { IconPlus } from "./ShiftCreateIcons";
import { ShiftCreateConfirmModal } from "./ShiftCreateConfirmModal";

type CreatePreview = {
  jobName: string;
  companyName: string;
  workers: number;
  payPerDay: number;
  payBasis: ShiftPayBasisDraft;
  locationName: string;
  dateRange: string;
  category: string;
  shiftTiming: string;
  requirementsCount: number;
  goodToHaveCount: number;
  providedCount: number;
  quickQuestionCount: number;
  duplicateWarnings: ShiftDuplicateWarning[];
};

type Props = {
  isValid: boolean;
  errors: string[];
  onCancel: () => void;
  onCreate: () => void;
  discardConfirm: ConfirmData | null;
  onDiscardCancel: () => void;
  onDiscardConfirm: () => void;
  notice: NoticeData | null;
  onNoticeDismiss: () => void;
  showCreateConfirm: boolean;
  createPreview: CreatePreview;
  onCreateConfirm: () => void;
  onCreateCancel: () => void;
  /** When true, only modals render (wizard supplies its own footer buttons). */
  hideActions?: boolean;
};

export function ShiftCreateFormFooter({
  isValid,
  errors,
  onCancel,
  onCreate,
  discardConfirm,
  onDiscardCancel,
  onDiscardConfirm,
  notice,
  onNoticeDismiss,
  showCreateConfirm,
  createPreview,
  onCreateConfirm,
  onCreateCancel,
  hideActions = false,
}: Props) {
  return (
    <>
      {!hideActions && !isValid && errors.length > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: "var(--wm-radius-14)",
            border: "1px solid rgba(220,38,38,0.2)",
            background: "rgba(220,38,38,0.04)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-error)" }}>
            Please fix before creating:
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.6 }}>
            {errors.map((err) => (
              <div key={err}>- {err}</div>
            ))}
          </div>
        </div>
      )}

      {!hideActions && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            paddingBottom: 32,
          }}
        >
          <button className="wm-outlineBtn" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={onCreate}
            disabled={!isValid}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
          >
            <IconPlus /> Review Post
          </button>
        </div>
      )}

      <NoticeModal notice={notice} onClose={onNoticeDismiss} />
      <ConfirmModal
        confirm={discardConfirm}
        onCancel={onDiscardCancel}
        onConfirm={onDiscardConfirm}
      />
      <ShiftCreateConfirmModal
        open={showCreateConfirm}
        {...createPreview}
        onConfirm={onCreateConfirm}
        onCancel={onCreateCancel}
      />
    </>
  );
}
