// App name: Job Mitra
// File name: notificationListGuards.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\notifications\guards\notificationListGuards.ts

import {
  DEFAULT_NOTIFICATION_MAX_ITEMS,
  DEFAULT_NOTIFICATION_TEXT_LIMITS,
  type NotificationLike,
} from "./notificationGuardTypes";
import { getNotificationSignature } from "./notificationDuplicateGuards";
import { cleanNotificationRoute } from "./notificationRouteGuards";
import { cleanNotificationText, cleanOptionalNotificationText } from "./notificationTextGuards";
import { getSafeNotificationTimestamp } from "./notificationTimeGuards";

type Rec = Record<string, unknown>;

function isRecord(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseNotificationJson(raw: string | null): unknown[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function normalizeNotificationInput<TDomain extends string>(
  raw: unknown,
  validDomains: readonly TDomain[],
  now = Date.now(),
): (NotificationLike & { domain: TDomain }) | null {
  if (!isRecord(raw)) return null;

  const domainRaw = raw.domain;
  if (typeof domainRaw !== "string") return null;
  if (!validDomains.includes(domainRaw as TDomain)) return null;

  const id = cleanNotificationText(raw.id, 120);
  const title = cleanNotificationText(raw.title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);

  if (!id || !title) return null;

  return {
    id,
    domain: domainRaw as TDomain,
    title,
    body: cleanOptionalNotificationText(raw.body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body),
    createdAt: getSafeNotificationTimestamp(raw.createdAt, now),
    isRead: typeof raw.isRead === "boolean" ? raw.isRead : false,
    route: cleanNotificationRoute(raw.route),
  };
}

export function normalizeAnyDomainNotificationInput(
  raw: unknown,
  now = Date.now(),
): NotificationLike | null {
  if (!isRecord(raw)) return null;

  const id = cleanNotificationText(raw.id, 120);
  const domain = cleanNotificationText(raw.domain, 60);
  const title = cleanNotificationText(raw.title, DEFAULT_NOTIFICATION_TEXT_LIMITS.title);

  if (!id || !domain || !title) return null;

  return {
    id,
    domain,
    title,
    body: cleanOptionalNotificationText(raw.body, DEFAULT_NOTIFICATION_TEXT_LIMITS.body),
    createdAt: getSafeNotificationTimestamp(raw.createdAt, now),
    isRead: typeof raw.isRead === "boolean" ? raw.isRead : false,
    route: cleanNotificationRoute(raw.route),
  };
}

export function uniqueLatestNotifications<T extends NotificationLike>(
  items: T[],
  maxItems = DEFAULT_NOTIFICATION_MAX_ITEMS,
): T[] {
  const bySignature = new Map<string, T>();

  for (const item of items) {
    const signature = getNotificationSignature(item);
    const existing = bySignature.get(signature);

    if (!existing || item.createdAt > existing.createdAt) {
      bySignature.set(signature, item);
    }
  }

  return Array.from(bySignature.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, maxItems);
}
