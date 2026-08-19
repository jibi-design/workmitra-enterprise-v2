/** Job Mitra | CareerEmptyState.tsx | Shared career empty state */

import type { ReactNode } from "react";

type CareerEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
};

function BriefcaseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="7"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CareerEmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCta,
}: CareerEmptyStateProps) {
  return (
    <section className="wm-career-empty">
      <div className="wm-career-empty__icon">{icon ?? <BriefcaseIcon />}</div>
      <div className="wm-career-empty__title">{title}</div>
      <div className="wm-career-empty__subtitle">{subtitle}</div>
      {ctaLabel && onCta ? (
        <div className="wm-career-empty__cta">
          <button
            type="button"
            className="wm-career-cta wm-career-cta--primary"
            data-testid={ctaLabel === "Save Job" ? "career-save-job" : undefined}
            onClick={onCta}
          >
            {ctaLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
