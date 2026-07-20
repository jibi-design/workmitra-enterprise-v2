import { PENDING_ACTION_PROVIDERS } from "./pendingActions.providers";
import type {
  PendingActionItem,
  PendingActionScope,
  PendingActionsContext,
} from "./pendingActions.types";

export function collectPendingActions(
  scope: PendingActionScope,
  ctx: PendingActionsContext,
): PendingActionItem[] {
  const items: PendingActionItem[] = [];

  for (const provider of PENDING_ACTION_PROVIDERS) {
    if (!provider.scopes.includes(scope)) continue;

    const item = provider.resolve(ctx);
    if (item && item.count > 0) {
      items.push(item);
    }
  }

  return items;
}

export function sumPendingActionCounts(items: PendingActionItem[]): number {
  return items.reduce((total, item) => total + item.count, 0);
}
