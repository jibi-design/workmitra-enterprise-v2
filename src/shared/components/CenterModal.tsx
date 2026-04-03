// src/shared/components/CenterModal.tsx
import { useEffect, type ReactNode } from "react";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
interface CenterModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when backdrop is clicked (optional — omit to disable backdrop close) */
  onBackdropClose?: () => void;
  /** Accessible label for the dialog */
  ariaLabel?: string;
  /** Max width of the modal card (default: 520px) */
  maxWidth?: number;
  children: ReactNode;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function CenterModal(props: CenterModalProps) {
  const { open, onBackdropClose, ariaLabel = "Dialog", maxWidth = 520, children } = props;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open || !onBackdropClose) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onBackdropClose!();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onBackdropClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="wm-modal-backdrop"
      onClick={onBackdropClose}
    >
      <div
        className="wm-modal-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
