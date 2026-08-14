/** PendingActionsHub — one card; rows for manual actions only. */

import { useCallback, useId, useState } from "react";
import type { PendingActionItem } from "../pendingActions/pendingActions.types";
import { PendingActionRow } from "./PendingActionRow";

export type { PendingActionItem as PendingAction };

type PendingActionsHubProps = {
  items: PendingActionItem[];
  emptyTitle?: string;
  emptyBody?: string;
  /** Compact trigger strip; expands list on tap. Hides when idle. */
  variant?: "full" | "compact";
  /** Layout inspection: keep compact hub visible even with zero pending. */
  forceVisible?: boolean;
};

export function PendingActionsHub({
  items,
  emptyTitle = "Pending Actions",
  emptyBody = "Approvals and reviews appear here when needed.",
  variant = "full",
  forceVisible = false,
}: PendingActionsHubProps) {
  const activeItems = items.filter((item) => item.count > 0);
  const totalCount = activeItems.reduce((sum, item) => sum + item.count, 0);
  const isActive = totalCount > 0;
  const panelId = useId();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (variant === "compact") {
    if (!isActive && !forceVisible) return null;

    return (
      <section
        className={`wm-pendingActionsHub wm-pendingActionsHub--compact wm-animateIn ${
          expanded ? "isExpanded" : ""
        }`}
        data-testid="pending-actions-hub"
        data-pending-active={isActive ? "true" : "false"}
        data-pending-compact="true"
        data-pending-force={forceVisible ? "true" : "false"}
      >
        <button
          type="button"
          className="wm-pendingActionsHub__compactTrigger"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={toggleExpanded}
        >
          <span className="wm-pendingActionsHub__compactPulse" aria-hidden="true" />
          <span className="wm-pendingActionsHub__compactCopy">
            <span className="wm-pendingActionsHub__compactTitle">Pending Actions</span>
            <span className="wm-pendingActionsHub__compactSub">
              {isActive
                ? `${totalCount} need${totalCount === 1 ? "s" : ""} attention`
                : "Layout preview — no live pending items"}
            </span>
          </span>
          <span className="wm-pendingActionsHub__compactBadge">{isActive ? totalCount : "0"}</span>
          <span className="wm-pendingActionsHub__compactChevron" aria-hidden="true">
            {expanded ? "▴" : "▾"}
          </span>
        </button>

        {expanded ? (
          <ul id={panelId} className="wm-pendingActionsHub__rows">
            {activeItems.length > 0 ? (
              activeItems.map((item) => <PendingActionRow key={item.id} item={item} />)
            ) : (
              <li className="wm-pendingActionsHub__idlePanel">All clear for now.</li>
            )}
          </ul>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={`wm-pendingActionsHub wm-animateIn ${isActive ? "isActive" : "isIdle"}`}
      data-testid="pending-actions-hub"
      data-pending-active={isActive ? "true" : "false"}
    >
      <div className="wm-pendingActionsHub__head">
        <div className="wm-pendingActionsHub__headRow">
          <div className="wm-pendingActionsHub__headCopy">
            <div className="wm-pendingActionsHub__title">
              {isActive ? "Pending Actions" : emptyTitle}
            </div>
            <div className="wm-pendingActionsHub__sub">
              {isActive ? `${totalCount} need${totalCount === 1 ? "s" : ""} attention` : emptyBody}
            </div>
          </div>
          <span
            className="wm-pendingActionsHub__badge"
            aria-label={isActive ? `${totalCount} pending actions` : "No pending actions"}
          >
            {isActive ? totalCount : "✓"}
          </span>
        </div>
      </div>

      {activeItems.length > 0 ? (
        <ul className="wm-pendingActionsHub__rows">
          {activeItems.map((item) => (
            <PendingActionRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="wm-pendingActionsHub__idlePanel">All clear for now.</div>
      )}
    </section>
  );
}
