/** Job Mitra | latestUnreadInboxPreview.ts | Shift/Career unread ticker pick */

export const INBOX_TICKER_DOMAINS = ["shift", "career"] as const;

export type InboxTickerDomain = (typeof INBOX_TICKER_DOMAINS)[number];

export type InboxTickerSource = {
  readonly id: string;
  readonly domain: string;
  readonly title: string;
  readonly body?: string;
  readonly createdAt: number;
  readonly isRead: boolean;
  readonly route?: string;
};

export type InboxTickerItem = {
  readonly id: string;
  readonly domain: InboxTickerDomain;
  readonly title: string;
  readonly body?: string;
  readonly createdAt: number;
  readonly route?: string;
};

const PLANNER_PATH = /planner|workforce/i;

export function isInboxTickerDomain(value: string): value is InboxTickerDomain {
  return value === "shift" || value === "career";
}

export function pickLatestUnreadShiftCareer(
  items: readonly InboxTickerSource[],
): InboxTickerItem | null {
  let latest: InboxTickerItem | null = null;
  for (const item of items) {
    if (item.isRead || !isInboxTickerDomain(item.domain)) continue;
    const title = item.title.trim();
    if (!title) continue;
    if (latest && item.createdAt <= latest.createdAt) continue;
    latest = {
      id: item.id,
      domain: item.domain,
      title,
      body: item.body?.trim() || undefined,
      createdAt: item.createdAt,
      route: item.route?.trim() || undefined,
    };
  }
  return latest;
}

export function resolveInboxTickerHref(item: InboxTickerItem, inboxPath: string): string {
  const route = item.route?.trim() ?? "";
  if (!route.startsWith("/") || PLANNER_PATH.test(route)) return inboxPath;
  if (item.domain === "shift" && route.includes("/shift")) return route;
  if (item.domain === "career" && route.includes("/career")) return route;
  return inboxPath;
}
