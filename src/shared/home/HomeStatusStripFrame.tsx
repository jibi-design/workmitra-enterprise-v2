/** Job Mitra | HomeStatusStripFrame.tsx | Shared home status strip chrome */

import { useCallback, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import {
  dismissHomeStatusStrip,
  isHomeStatusStripDismissed,
  subscribeHomeStatusStripDismiss,
} from "./homeStatusStripDismiss";
import { HomeStatusStripChevronIcon } from "./HomeStatusStripIcons";

type Props = {
  readonly testId: string;
  readonly domain: string;
  readonly line: string;
  readonly ariaLabel: string;
  readonly dismissId: string;
  readonly icon: ReactNode;
  readonly onOpen: () => void;
};

export function HomeStatusStripFrame({
  testId,
  domain,
  line,
  ariaLabel,
  dismissId,
  icon,
  onOpen,
}: Props) {
  const dismissed = useSyncExternalStore(
    subscribeHomeStatusStripDismiss,
    () => isHomeStatusStripDismissed(dismissId),
    () => false,
  );

  const handleDismiss = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dismissHomeStatusStrip(dismissId);
    },
    [dismissId],
  );

  if (dismissed) return null;

  return (
    <div
      className="wm-homeStatusStrip"
      data-testid={testId}
      data-strip-domain={domain}
      data-ui-state="active"
    >
      <button
        type="button"
        className="wm-homeStatusStrip__main"
        onClick={onOpen}
        aria-label={ariaLabel}
      >
        <span className="wm-homeStatusStrip__icon">{icon}</span>
        <span className="wm-homeStatusStrip__line">{line}</span>
        <span className="wm-homeStatusStrip__chevron" aria-hidden="true">
          <HomeStatusStripChevronIcon />
        </span>
      </button>
      <button
        type="button"
        className="wm-homeStatusStrip__dismiss"
        aria-label="Dismiss alert"
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  );
}
