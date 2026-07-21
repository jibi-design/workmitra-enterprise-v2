/** Job Mitra | GlobalToast.tsx | src/shared/components/feedback/GlobalToast.tsx */
/** Luxury L3 — optional className / testId for enterprise host */

export type ToastTone = "success" | "error" | "info" | "warn";

interface GlobalToastProps {
  message: string;
  tone: ToastTone;
  visible: boolean;
  onClose: () => void;
  className?: string;
  testId?: string;
}

export function GlobalToast({
  message,
  tone,
  visible,
  onClose,
  className,
  testId,
}: GlobalToastProps) {
  if (!visible) return null;

  const classes = ["wm-globalToast", `wm-globalToast-${tone}`, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="status"
      aria-live={tone === "error" || tone === "warn" ? "assertive" : "polite"}
      data-testid={testId ?? "wm-global-toast"}
      data-tone={tone}
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
