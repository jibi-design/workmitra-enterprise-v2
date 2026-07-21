/** Job Mitra | SlideOver.tsx | Universal right drawer for quick-action views */

import { useEffect, type ReactNode } from "react";

export type SlideOverProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
  testId?: string;
};

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  ariaLabel,
  testId,
}: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="wm-ent-slide-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
      data-testid={testId ?? "wm-ent-slideover"}
      onClick={onClose}
    >
      <div
        className="wm-ent-slide-panel"
        onClick={(e) => e.stopPropagation()}
        data-testid="wm-ent-slideover-panel"
      >
        <header className="wm-ent-slide-header">
          <div>
            <h2 className="wm-ent-slide-title">{title}</h2>
            {subtitle ? <div className="wm-ent-slide-subtitle">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={onClose}
            data-testid="wm-ent-slideover-close"
            aria-label="Close"
          >
            Close
          </button>
        </header>
        <div className="wm-ent-slide-body">{children}</div>
        {footer ? <footer className="wm-ent-slide-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
