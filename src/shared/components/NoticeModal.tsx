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
/* Tone → border color mapping                      */
/* ------------------------------------------------ */
const TONE_BORDER: Record<NoticeTone, string> = {
  info: "rgba(59, 130, 246, 0.22)",
  warn: "rgba(217, 119, 6, 0.22)",
  success: "rgba(22, 163, 74, 0.22)",
  error: "rgba(220, 38, 38, 0.22)",
};

const TONE_ICON_BG: Record<NoticeTone, string> = {
  info: "rgba(59, 130, 246, 0.08)",
  warn: "rgba(217, 119, 6, 0.08)",
  success: "rgba(22, 163, 74, 0.08)",
  error: "rgba(220, 38, 38, 0.08)",
};

const TONE_ICON_COLOR: Record<NoticeTone, string> = {
  info: "rgba(59, 130, 246, 0.85)",
  warn: "rgba(217, 119, 6, 0.85)",
  success: "rgba(22, 163, 74, 0.85)",
  error: "rgba(220, 38, 38, 0.85)",
};

/* ------------------------------------------------ */
/* SVG Icons per tone                               */
/* ------------------------------------------------ */
function ToneIcon(props: { tone: NoticeTone }) {
  const color = TONE_ICON_COLOR[props.tone];

  if (props.tone === "success") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill={color} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
      </svg>
    );
  }

  if (props.tone === "warn") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill={color} d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
      </svg>
    );
  }

  if (props.tone === "error") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill={color} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
      </svg>
    );
  }

  // info (default)
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill={color} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
    </svg>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function NoticeModal(props: NoticeModalProps) {
  const { notice, onClose } = props;
  if (!notice) return null;

  const tone = notice.tone ?? "info";

  return (
    <CenterModal
      open={!!notice}
      onBackdropClose={onClose}
      ariaLabel={notice.title}
    >
      <div style={{ borderTop: `3px solid ${TONE_BORDER[tone]}`, borderRadius: "var(--wm-radius-14, 14px) var(--wm-radius-14, 14px) 0 0" }}>
        {/* Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 0" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: TONE_ICON_BG[tone],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ToneIcon tone={tone} />
          </div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #111827)" }}>
            {notice.title}
          </div>
        </div>

        {/* Message */}
        <div
          style={{
            padding: "10px 16px 0 58px",
            fontSize: 13,
            color: "var(--wm-er-muted, #6b7280)",
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {notice.message}
        </div>

        {/* Action */}
        <div style={{ padding: "14px 16px 16px", display: "flex", justifyContent: "flex-end" }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
