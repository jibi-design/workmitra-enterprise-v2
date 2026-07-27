/** Job Mitra | VaultEmptyState.tsx | Shared vault empty state */

import type { ReactNode } from "react";

type VaultEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
};

function VaultIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14.5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function VaultEmptyState({ icon, title, subtitle, ctaLabel, onCta }: VaultEmptyStateProps) {
  return (
    <section className="wm-vault-empty">
      <div className="wm-vault-empty__icon">{icon ?? <VaultIcon />}</div>
      <div className="wm-vault-empty__title">{title}</div>
      <div className="wm-vault-empty__subtitle">{subtitle}</div>
      {ctaLabel && onCta ? (
        <div className="wm-vault-empty__cta">
          <button type="button" className="wm-vault-cta wm-vault-cta--primary" onClick={onCta}>
            {ctaLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
