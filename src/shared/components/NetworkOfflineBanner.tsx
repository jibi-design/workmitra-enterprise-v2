/** Global floating offline banner — shown when network is unavailable. */

import { useNetworkOnline } from "../native/networkStatus";

export function NetworkOfflineBanner() {
  const online = useNetworkOnline();
  if (online) return null;

  return (
    <div
      className="wm-offlineBanner"
      role="status"
      aria-live="polite"
      data-testid="network-offline-banner"
    >
      <span className="wm-offlineBanner__dot" aria-hidden="true" />
      <span className="wm-offlineBanner__label">No Internet Connection</span>
      <button
        type="button"
        className="wm-offlineBanner__retry"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}
