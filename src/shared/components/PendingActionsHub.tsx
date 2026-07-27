/** PendingActionsHub — one card; rows for manual actions only. */

import type { PendingActionItem } from "../pendingActions/pendingActions.types";
import { PendingActionRow } from "./PendingActionRow";

export type { PendingActionItem as PendingAction };

type PendingActionsHubProps = {
  items: PendingActionItem[];
  emptyTitle?: string;
  emptyBody?: string;
};

export function PendingActionsHub({
  items,
  emptyTitle = "Pending Actions",
  emptyBody = "Approvals and reviews appear here when needed.",
}: PendingActionsHubProps) {
  const activeItems = items.filter((item) => item.count > 0);
  const totalCount = activeItems.reduce((sum, item) => sum + item.count, 0);
  const isActive = totalCount > 0;

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
