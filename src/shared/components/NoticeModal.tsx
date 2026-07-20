// src/shared/components/NoticeModal.tsx
import { CenterModal } from "./CenterModal";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type NoticeTone = "info" | "warn" | "success" | "error";

export interface NoticeData {
  title: string;
  message: string;
  tone?: NoticeTone;
}

interface NoticeModalProps {
  notice: NoticeData | null;
  onClose: () => void;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NoticeModal({ notice, onClose }: NoticeModalProps) {
  if (!notice) return null;

  const tone = notice.tone ?? "info";

  return (
    <CenterModal open={!!notice} onBackdropClose={onClose} ariaLabel={notice.title}>
      <div className={`wm-noticeModal wm-noticeModal-${tone}`}>
        <div className="wm-noticeModalHeader">
          <div className="wm-noticeModalIcon">
            <ToneIcon tone={tone} />
          </div>

          <div className="wm-noticeModalTitle">{notice.title}</div>
        </div>

        <div className="wm-noticeModalMessage">{notice.message}</div>

        <div className="wm-noticeModalActions">
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </CenterModal>
  );
}

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
function ToneIcon({ tone }: { tone: NoticeTone }) {
  if (tone === "success") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"
        />
      </svg>
    );
  }

  if (tone === "warn") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
      </svg>
    );
  }

  if (tone === "error") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"
      />
    </svg>
  );
}
