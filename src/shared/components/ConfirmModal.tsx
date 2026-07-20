// src/shared/components/ConfirmModal.tsx
import { CenterModal } from "./CenterModal";

export type ConfirmTone = "danger" | "warn" | "neutral";

export interface ConfirmData {
  title: string;
  message: string;
  warning?: string;
  tone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmModalProps {
  confirm: ConfirmData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE_LABEL: Record<ConfirmTone, string> = {
  danger: "Final destructive action",
  warn: "Important confirmation",
  neutral: "Final approval required",
};

export function ConfirmModal({ confirm, onConfirm, onCancel }: ConfirmModalProps) {
  if (!confirm) return null;

  const tone = confirm.tone ?? "neutral";

  return (
    <CenterModal
      open={!!confirm}
      onBackdropClose={onCancel}
      ariaLabel={confirm.title}
      surface="bare"
    >
      <div className={`wm-confirmModal wm-confirmModal-${tone}`}>
        <div className="wm-confirmModalHeader">
          <div className="wm-confirmModalIcon">
            <ConfirmIcon tone={tone} />
          </div>

          <div className="wm-confirmModalTitleBlock">
            <div className="wm-confirmModalEyebrow">{TONE_LABEL[tone]}</div>
            <div className="wm-confirmModalTitle">{confirm.title}</div>
            <div className="wm-confirmModalSubtitle">
              Review the details carefully before continuing.
            </div>
          </div>
        </div>

        <div className="wm-confirmModalSection">
          <div className="wm-confirmModalSectionLabel">Summary</div>
          <div className="wm-confirmModalSummary">{confirm.message}</div>
        </div>

        {confirm.warning && (
          <div className="wm-confirmModalWarning">
            <div className="wm-confirmModalWarningTitle">Important before publishing</div>
            <div className="wm-confirmModalWarningText">{confirm.warning}</div>
          </div>
        )}

        <div className="wm-confirmModalActions">
          <button type="button" onClick={onCancel} className="wm-outlineBtn wm-confirmModalCancel">
            {confirm.cancelLabel ?? "Cancel"}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="wm-primarybtn wm-confirmModalConfirm"
          >
            {confirm.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}

function ConfirmIcon({ tone }: { tone: ConfirmTone }) {
  if (tone === "danger") {
    return (
      <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
        />
      </svg>
    );
  }

  if (tone === "warn") {
    return (
      <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
      </svg>
    );
  }

  return (
    <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 4 5.5v6.1c0 5.05 3.41 9.77 8 10.9 4.59-1.13 8-5.85 8-10.9V5.5L12 2Zm3.7 7.7-4.53 4.53L8.3 11.36l1.4-1.41 1.47 1.46 3.12-3.12 1.41 1.41Z"
      />
    </svg>
  );
}
