/** Job Mitra | GlobalToast.tsx | src/shared/components/feedback/GlobalToast.tsx */

export type ToastTone = "success" | "error" | "info" | "warn";

interface GlobalToastProps {
  message: string;
  tone: ToastTone;
  visible: boolean;
  onClose: () => void;
}

export function GlobalToast({ message, tone, visible, onClose }: GlobalToastProps) {
  if (!visible) return null;

  return (
    <div
      className={`wm-globalToast wm-globalToast-${tone}`}
      role="status"
      aria-live={tone === "error" || tone === "warn" ? "assertive" : "polite"}
    >
      <div className="wm-globalToastDot" aria-hidden="true" />

      <span className="wm-globalToastMessage">{message}</span>

      <button
        type="button"
        className="wm-globalToastClose"
        onClick={onClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
