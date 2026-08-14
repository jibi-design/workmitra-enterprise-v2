/** Job Mitra | EmployerPendingActionsBanner.tsx | Compact strip + expand queue (employer home) */

import { useCallback, useId, useState, type CSSProperties, type MouseEvent } from "react";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import { pendingBannerAccentCssVar } from "../../../employee/home/helpers/buildEmployeePendingBannerQueue";
import type { PendingBannerQueueItem } from "../../../employee/home/helpers/pendingBannerQueue.types";
import { PendingBannerDomainIcon } from "../../../employee/home/components/PendingBannerDomainIcon";
import { PulseNode } from "../../../pulse/PulseNode";
import { compactPendingBannerLine } from "../../../../shared/pendingActions/helpers/compactPendingBannerLine";
import { useEmployerPendingBannerQueue } from "../hooks/useEmployerPendingBannerQueue";

type Props = {
  pendingActions: readonly PendingActionItem[];
};

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {expanded ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
    </svg>
  );
}

type RowProps = {
  item: PendingBannerQueueItem;
  onDismiss: (fingerprint: string) => void;
};

function PendingBannerRow({ item, onDismiss }: RowProps) {
  const accent = pendingBannerAccentCssVar(item.accent);
  const style = { "--wm-pending-banner-accent": accent } as CSSProperties;
  const line = compactPendingBannerLine(item.title, item.detail);

  const handleDismiss = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      onDismiss(item.fingerprint);
    },
    [item.fingerprint, onDismiss],
  );

  return (
    <li
      className="wm-pendingActionsBanner__row"
      style={style}
      data-pending-id={item.id}
      data-testid={`pending-action-row-${item.id}`}
    >
      <PulseNode
        variant="button"
        pulseId={item.pulseId}
        style={{ "--wm-pulse-node-radius": "var(--wm-radius-chip, 14px)" }}
      >
        <button
          type="button"
          className="wm-pendingActionsBanner__main"
          onClick={item.onOpen}
          aria-label={line}
        >
          <span className="wm-pendingActionsBanner__icon" aria-hidden="true">
            <PendingBannerDomainIcon accent={item.accent} />
          </span>
          <span className="wm-pendingActionsBanner__line">{line}</span>
        </button>
      </PulseNode>
      <button
        type="button"
        className="wm-pendingActionsBanner__dismiss"
        aria-label={`Dismiss ${item.title}`}
        onClick={handleDismiss}
      >
        ×
      </button>
    </li>
  );
}

export function EmployerPendingActionsBanner({ pendingActions }: Props) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const { current, visible, queueTotal, liveCount, dismissCurrent, dismissItem } =
    useEmployerPendingBannerQueue(pendingActions);
  const isExpanded = expanded && queueTotal > 0;

  const toggleExpanded = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setExpanded((prev) => !prev);
  }, []);

  const handleDismissCurrent = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      dismissCurrent();
    },
    [dismissCurrent],
  );

  if (!current) return null;

  const accent = pendingBannerAccentCssVar(current.accent);
  const style = { "--wm-pending-banner-accent": accent } as CSSProperties;
  const line = compactPendingBannerLine(current.title, current.detail);
  const headerLine = isExpanded ? `Pending Actions · ${queueTotal}` : line;

  return (
    <div
      className={`wm-pendingActionsBannerWrap${isExpanded ? " isExpanded" : ""}`}
      data-testid="employer-pending-actions-banner"
      data-pending-active="true"
      data-pending-expanded={isExpanded ? "true" : "false"}
      data-pending-queue={queueTotal}
      data-pending-live={liveCount}
    >
      <section
        className="wm-pendingActionsBanner"
        style={style}
        data-pending-domain={current.accent}
        data-pending-id={current.id}
        aria-label={`Pending Actions: ${current.title}`}
      >
        {isExpanded ? (
          <div className="wm-pendingActionsBanner__main wm-pendingActionsBanner__main--static">
            <span className="wm-pendingActionsBanner__icon" aria-hidden="true">
              <PendingBannerDomainIcon accent={current.accent} />
            </span>
            <span className="wm-pendingActionsBanner__line">{headerLine}</span>
          </div>
        ) : (
          <PulseNode
            variant="button"
            pulseId={current.pulseId}
            style={{ "--wm-pulse-node-radius": "var(--wm-radius-chip, 14px)" }}
          >
            <button
              type="button"
              className="wm-pendingActionsBanner__main"
              onClick={current.onOpen}
              aria-label={line}
              data-testid={`pending-action-row-${current.id}`}
            >
              <span className="wm-pendingActionsBanner__icon" aria-hidden="true">
                <PendingBannerDomainIcon accent={current.accent} />
              </span>
              <span className="wm-pendingActionsBanner__line">{line}</span>
            </button>
          </PulseNode>
        )}

        <button
          type="button"
          className="wm-pendingActionsBanner__toggle"
          aria-expanded={isExpanded}
          aria-controls={listId}
          aria-label={
            isExpanded ? "Minimize pending actions list" : "Maximize pending actions list"
          }
          onClick={toggleExpanded}
        >
          <ChevronIcon expanded={isExpanded} />
        </button>

        {!isExpanded ? (
          <button
            type="button"
            className="wm-pendingActionsBanner__dismiss"
            aria-label="Dismiss this pending action"
            onClick={handleDismissCurrent}
          >
            ×
          </button>
        ) : null}
      </section>

      {isExpanded ? (
        <ul id={listId} className="wm-pendingActionsBanner__list" aria-label="All pending actions">
          {visible.map((item) => (
            <PendingBannerRow key={item.fingerprint} item={item} onDismiss={dismissItem} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
