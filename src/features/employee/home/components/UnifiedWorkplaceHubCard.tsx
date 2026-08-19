/** Job Mitra | UnifiedWorkplaceHubCard.tsx | Single Workplace Hub entrance */

type Props = {
  onOpen: () => void;
};

function WorkplaceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z"
      />
    </svg>
  );
}

export function UnifiedWorkplaceHubCard({ onOpen }: Props) {
  return (
    <button
      type="button"
      className="wm-homeHubEntry wm-homeHubEntry--featured wm-press-card"
      onClick={onOpen}
      aria-label="Open Workplace Hub"
      data-testid="unified-workplace-hub-entry"
    >
      <div className="wm-homeHubEntry__row">
        <span className="wm-homeHubEntry__icon" aria-hidden="true">
          <WorkplaceIcon />
        </span>
        <div className="wm-homeHubEntry__copy">
          <div className="wm-homeHubEntry__kicker">Workplace</div>
          <div className="wm-homeHubEntry__title">Workplace Hub</div>
          <div className="wm-homeHubEntry__sub">Work Vault</div>
        </div>
      </div>
    </button>
  );
}
