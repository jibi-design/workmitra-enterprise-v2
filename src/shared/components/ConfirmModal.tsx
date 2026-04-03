// src/shared/components/ConfirmModal.tsx
import { CenterModal } from "./CenterModal";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
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

/* ------------------------------------------------ */
/* Tone → confirm button style                      */
/* ------------------------------------------------ */
const TONE_BTN_BG: Record<ConfirmTone, string> = {
  danger: "var(--wm-error, #dc2626)",
  warn: "var(--wm-warning, #d97706)",
  neutral: "var(--wm-brand-600, #1d4ed8)",
};

const TONE_ICON_BG: Record<ConfirmTone, string> = {
  danger: "rgba(220, 38, 38, 0.08)",
  warn: "rgba(217, 119, 6, 0.08)",
  neutral: "rgba(29, 78, 216, 0.08)",
};

const TONE_ICON_COLOR: Record<ConfirmTone, string> = {
  danger: "rgba(220, 38, 38, 0.85)",
  warn: "rgba(217, 119, 6, 0.85)",
  neutral: "rgba(29, 78, 216, 0.85)",
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ConfirmModal(props: ConfirmModalProps) {
  const { confirm, onConfirm, onCancel } = props;
  if (!confirm) return null;

  const tone = confirm.tone ?? "neutral";

  return (
    <CenterModal
      open={!!confirm}
      onBackdropClose={onCancel}
      ariaLabel={confirm.title}
    >
      <div style={{ padding: 16 }}>
        {/* Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            {tone === "danger" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill={TONE_ICON_COLOR[tone]} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
              </svg>
            ) : tone === "warn" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill={TONE_ICON_COLOR[tone]} d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill={TONE_ICON_COLOR[tone]} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
              </svg>
            )}
          </div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text, #111827)" }}>
            {confirm.title}
          </div>
        </div>

       {/* Message (grey card if warning exists) */}
        <div
          style={{
            marginTop: 10,
            marginLeft: 42,
            fontSize: 13,
            color: "var(--wm-er-text, #111827)",
            fontWeight: 600,
            lineHeight: 1.6,
            ...(confirm.warning ? { background: "#f9fafb", borderRadius: 10, padding: 12 } : { color: "var(--wm-er-muted, #6b7280)", fontWeight: 500 }),
          }}
        >
          {confirm.message}
        </div>

        {/* Warning (amber, below summary) */}
        {confirm.warning && (
          <div style={{ marginTop: 10, marginLeft: 42, fontSize: 12, fontWeight: 600, color: "#d97706", lineHeight: 1.5 }}>
            ⚠ {confirm.warning}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onCancel}>
            {confirm.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              height: 40,
              borderRadius: "var(--wm-radius-14, 14px)",
              border: 0,
              background: TONE_BTN_BG[tone],
              padding: "0 16px",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              color: "#fff",
            }}
          >
            {confirm.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
