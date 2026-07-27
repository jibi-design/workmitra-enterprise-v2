/** Job Mitra | ShiftEmptyState.tsx | Shared shift empty state */

import type { ReactNode } from "react";

type ShiftEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
};

function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShiftEmptyState({ icon, title, subtitle, ctaLabel, onCta }: ShiftEmptyStateProps) {
  return (
    <section className="wm-shift-empty">
      <div className="wm-shift-empty__icon">{icon ?? <CalendarIcon />}</div>
      <div className="wm-shift-empty__title">{title}</div>
      <div className="wm-shift-empty__subtitle">{subtitle}</div>
      {ctaLabel && onCta ? (
        <div className="wm-shift-empty__cta">
          <button type="button" className="wm-shift-cta wm-shift-cta--primary" onClick={onCta}>
            {ctaLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
