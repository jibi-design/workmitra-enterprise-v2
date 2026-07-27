/** Job Mitra | SlideOver.tsx | Universal right drawer for quick-action views */
/** Luxury L2 — spring enter + reduced-motion class hook */

import { useEffect, useState, type ReactNode } from "react";

export type SlideOverProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
  testId?: string;
  /** Executive Obsidian glass panel for employer management */
  variant?: "default" | "obsidian";
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  ariaLabel,
  testId,
  variant = "default",
}: SlideOverProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

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

  const motionClass = prefersReducedMotion ? " wm-ent-slide--reduced" : "";
  const variantClass = variant === "obsidian" ? " wm-ent-slide-panel--obsidian" : "";

  return (
    <div
      className={`wm-ent-slide-backdrop${motionClass}${variant === "obsidian" ? " wm-ent-slide-backdrop--obsidian" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
      data-testid={testId ?? "wm-ent-slideover"}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
      onClick={onClose}
    >
      <div
        className={`wm-ent-slide-panel${motionClass}${variantClass}`}
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
            className="wm-outlineBtn wm-press-btn"
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
