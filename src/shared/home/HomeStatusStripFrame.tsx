/** Job Mitra | HomeStatusStripFrame.tsx | Expandable home status strip chrome */

import { useCallback, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import {
  dismissHomeStatusStrip,
  getHomeStatusStripDismissRevision,
  isHomeStatusStripDismissed,
  subscribeHomeStatusStripDismiss,
} from "./homeStatusStripDismiss";
import { HomeStatusStripChevronIcon } from "./HomeStatusStripIcons";

export type HomeStatusStripDetail = {
  readonly id: string;
  readonly line: string;
  readonly onOpen?: () => void;
  readonly content?: ReactNode;
};

type Props = {
  readonly testId: string;
  readonly domain: string;
  readonly line: string;
  readonly ariaLabel: string;
  readonly dismissId: string;
  readonly icon: ReactNode;
  readonly details: readonly HomeStatusStripDetail[];
  readonly subtext?: string;
  readonly subContent?: ReactNode;
  readonly status?: "pending" | "clear";
  readonly hideDismiss?: boolean;
  readonly persistDismiss?: boolean;
  readonly onDismiss?: () => void;
  readonly onPrimaryAction?: () => void;
};

function stop(event: MouseEvent<HTMLButtonElement>): void {
  event.preventDefault();
  event.stopPropagation();
}

export function HomeStatusStripFrame({
  testId,
  domain,
  line,
  ariaLabel,
  dismissId,
  icon,
  details,
  subtext,
  subContent,
  status,
  hideDismiss = false,
  persistDismiss = true,
  onDismiss,
  onPrimaryAction,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  useSyncExternalStore(
    subscribeHomeStatusStripDismiss,
    getHomeStatusStripDismissRevision,
    () => "",
  );

  const toggle = useCallback(() => {
    setExpanded((open) => !open);
  }, []);

  const handleDismiss = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stop(event);
      if (onDismiss) onDismiss();
      else if (persistDismiss) dismissHomeStatusStrip(dismissId);
    },
    [dismissId, onDismiss, persistDismiss],
  );

  if (persistDismiss && isHomeStatusStripDismissed(dismissId)) return null;

  const rows = details.filter((row) => !isHomeStatusStripDismissed(`row:${row.id}`));
  if (rows.length === 0 && !line.trim()) return null;

  return (
    <div
      className="wm-homeStatusStrip"
      data-testid={testId}
      data-strip-domain={domain}
      data-strip-status={status ?? "info"}
      data-strip-layout={subtext || subContent ? "ticker" : "single"}
      data-expanded={expanded ? "true" : "false"}
      data-ui-state="active"
    >
      <div className="wm-homeStatusStrip__head">
        <button
          type="button"
          className="wm-homeStatusStrip__main"
          onClick={onPrimaryAction ?? toggle}
          aria-expanded={expanded}
          aria-label={ariaLabel}
        >
          <span className="wm-homeStatusStrip__icon">{icon}</span>
          <span className="wm-homeStatusStrip__copy">
            <span className="wm-homeStatusStrip__line">{line}</span>
            {subContent ? (
              <span className="wm-homeStatusStrip__sub">{subContent}</span>
            ) : subtext ? (
              <span className="wm-homeStatusStrip__sub">{subtext}</span>
            ) : null}
          </span>
        </button>
        <div className="wm-homeStatusStrip__actions">
        {rows.length > 0 ? (
          <button
            type="button"
            className="wm-homeStatusStrip__chevron"
            data-testid="home-status-strip-chevron"
            aria-label={expanded ? "Collapse alert" : "Expand alert"}
            aria-expanded={expanded}
            onClick={toggle}
          >
            <HomeStatusStripChevronIcon expanded={expanded} size={11} />
          </button>
        ) : null}
        {hideDismiss ? null : (
          <button
            type="button"
            className="wm-homeStatusStrip__dismiss"
            data-testid="home-status-strip-dismiss"
            aria-label="Dismiss alert"
            onClick={handleDismiss}
          >
            ×
          </button>
        )}
        </div>
      </div>
      {expanded && rows.length > 0 ? (
        <ul className="wm-homeStatusStrip__body">
          {rows.map((row) => (
            <li key={row.id} className="wm-homeStatusStrip__item">
              <span className="wm-homeStatusStrip__itemText">
                {row.content ?? row.line}
              </span>
              {row.onOpen ? (
                <button type="button" className="wm-homeStatusStrip__itemView" onClick={row.onOpen}>
                  View
                </button>
              ) : null}
              <button
                type="button"
                className="wm-homeStatusStrip__itemDismiss"
                aria-label="Dismiss this notice"
                onClick={(event) => {
                  stop(event);
                  dismissHomeStatusStrip(`row:${row.id}`);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
