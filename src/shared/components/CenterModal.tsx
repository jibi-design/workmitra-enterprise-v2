// src/shared/components/CenterModal.tsx
import { useEffect, type ReactNode } from "react";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
interface CenterModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when backdrop is clicked or Escape is pressed */
  onBackdropClose?: () => void;
  /** Accessible label for the dialog */
  ariaLabel?: string;
  /** Max width of the modal card in pixels */
  maxWidth?: number;
  /** Use when the child component provides its own full modal surface */
  surface?: "default" | "bare";
  children: ReactNode;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function CenterModal({
  open,
  onBackdropClose,
  ariaLabel = "Dialog",
  maxWidth = 520,
  surface = "default",
  children,
}: CenterModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !onBackdropClose) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onBackdropClose?.();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onBackdropClose]);

  if (!open) return null;

  const isBare = surface === "bare";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="wm-modal-backdrop"
      onClick={onBackdropClose}
    >
      <div
        className={isBare ? "wm-modal-bare" : "wm-modal-card"}
        style={{ maxWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
