/** Job Mitra | latestUnreadInboxPreview.ts | Shift/Career/Employment ticker pick */

import { ROUTE_PATHS } from "../../../app/router/routePaths";
import { stripNotificationDedupeSignature } from "../../../shared/notifications/guards";

export const INBOX_TICKER_DOMAINS = ["shift", "career", "employment", "system"] as const;

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
  return value === "shift" || value === "career" || value === "employment" || value === "system";
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
      body: item.body ? stripNotificationDedupeSignature(item.body) || undefined : undefined,
      createdAt: item.createdAt,
      route: item.route?.trim() || undefined,
    };
  }
  return latest;
}

function toTickerItem(item: InboxTickerSource): InboxTickerItem | null {
  if (!isInboxTickerDomain(item.domain)) return null;
  const title = item.title.trim();
  if (!title) return null;
  return {
    id: item.id,
    domain: item.domain,
    title,
    body: item.body ? stripNotificationDedupeSignature(item.body) || undefined : undefined,
    createdAt: item.createdAt,
    route: item.route?.trim() || undefined,
  };
}

export function listLiveShiftCareer(
  items: readonly InboxTickerSource[],
  limit = 5,
): InboxTickerItem[] {
  const unread: InboxTickerItem[] = [];
  const seen = new Set<string>();
  const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);
  for (const source of sorted) {
    const mapped = toTickerItem(source);
    if (!mapped || seen.has(mapped.id) || source.isRead) continue;
    seen.add(mapped.id);
    unread.push(mapped);
    if (unread.length >= limit) break;
  }
  return unread;
}

export function pickLatestLiveShiftCareer(
  items: readonly InboxTickerSource[],
): InboxTickerItem | null {
  return listLiveShiftCareer(items, 1)[0] ?? null;
}

export function resolveInboxTickerHref(item: InboxTickerItem, inboxPath: string): string {
  const route = item.route?.trim() ?? "";
  const employer = inboxPath.includes("/employer");
  if (/please rate/i.test(item.title) && item.domain === "employment") {
    return employer ? ROUTE_PATHS.employerReviewCenter : ROUTE_PATHS.employeeReviewCenter;
  }
  if (!route.startsWith("/") || PLANNER_PATH.test(route)) return inboxPath;
  if (route.includes("/review-center")) return route;
  if (item.domain === "shift" && route.includes("/shift")) return route;
  if (item.domain === "career" && route.includes("/career")) return route;
  if (
    item.domain === "employment" &&
    (route.includes("/career") || route.includes("/employment"))
  ) {
    return route;
  }
  if (item.domain === "system" && route.startsWith("/") && !PLANNER_PATH.test(route)) return route;
  return inboxPath;
}
