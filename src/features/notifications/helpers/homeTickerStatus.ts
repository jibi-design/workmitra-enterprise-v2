/** Job Mitra | homeTickerStatus.ts | Pending vs All Clear home ticker copy */

import { buildHomeTickerLayout, formatHomeTickerLayoutLine, isActionableTickerLayout } from "./homeTickerLayout";
import type { InboxTickerItem } from "./latestUnreadInboxPreview";

export function isActionableTickerItem(item: InboxTickerItem): boolean {
  return isActionableTickerLayout(buildHomeTickerLayout(item));
}

export function listActionableTickerItems(
  items: readonly InboxTickerItem[],
): InboxTickerItem[] {
  return items.filter(isActionableTickerItem);
}

export type HomeTickerStatusView = {
  readonly status: "pending" | "clear";
  readonly badge: string;
  readonly subtext: string;
  readonly domain: InboxTickerItem["domain"] | "shift";
  readonly pendingCount: number;
};

export function buildHomeTickerStatus(
  items: readonly InboxTickerItem[],
  extraPendingCount = 0,
  extraPendingTitle = "Confirm shortlisted workers",
): HomeTickerStatusView {
  const actionable = listActionableTickerItems(items);
  const pendingCount = actionable.length + Math.max(0, extraPendingCount);
  if (pendingCount <= 0) {
    return {
      status: "clear",
      badge: "✓ All Clear",
      subtext: "No pending actions right now.",
      domain: "shift",
      pendingCount: 0,
    };
  }
  const top = actionable[0];
  const extraLayout = {
    badge: "Action Required",
    headline: "Shift: Shortlist",
    context: extraPendingTitle,
  };
  return {
    status: "pending",
    badge: `⚠️ Pending Actions (${pendingCount})`,
    subtext: top ? formatHomeTickerLayoutLine(buildHomeTickerLayout(top)) : formatHomeTickerLayoutLine(extraLayout),
    domain: top?.domain ?? "shift",
    pendingCount,
  };
}
