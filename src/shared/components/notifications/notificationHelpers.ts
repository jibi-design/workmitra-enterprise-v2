// src/shared/components/notifications/notificationHelpers.ts
//
// Shared helpers for notification pages.
// Time formatting, time grouping, and SVG icon.

/* ------------------------------------------------ */
/* Time Group Types                                 */
/* ------------------------------------------------ */
export type TimeGroupKey = "TODAY" | "YESTERDAY" | "EARLIER";

export type TimeGrouped<T> = {
  key: TimeGroupKey;
  items: T[];
};

/* ------------------------------------------------ */
/* Time Grouping                                    */
/* ------------------------------------------------ */
function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function getGroupKey(timestamp: number): TimeGroupKey {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86_400_000;

  if (timestamp >= todayStart) return "TODAY";
  if (timestamp >= yesterdayStart) return "YESTERDAY";
  return "EARLIER";
}

/**
 * Groups a sorted (newest-first) list of items by time.
 * Returns only non-empty groups in order: TODAY → YESTERDAY → EARLIER.
 */
export function groupByTime<T extends { createdAt: number }>(items: T[]): TimeGrouped<T>[] {
  const map: Record<TimeGroupKey, T[]> = { TODAY: [], YESTERDAY: [], EARLIER: [] };

  for (const item of items) {
    map[getGroupKey(item.createdAt)].push(item);
  }

  const result: TimeGrouped<T>[] = [];
  const order: TimeGroupKey[] = ["TODAY", "YESTERDAY", "EARLIER"];
  for (const key of order) {
    if (map[key].length > 0) result.push({ key, items: map[key] });
  }
  return result;
}

/* ------------------------------------------------ */
/* Time Formatting                                  */
/* ------------------------------------------------ */
/**
 * Formats timestamp for display inside notification cards.
 * TODAY/YESTERDAY items: "10:45 AM" (time only — group header gives date context)
 * EARLIER items: "15 Mar, 10:45 AM"
 */
export function formatNotificationTime(ts: number): string {
  try {
    const d = new Date(ts);
    const group = getGroupKey(ts);

    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    if (group === "TODAY" || group === "YESTERDAY") return timeStr;

    const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return "";
  }
}

/* ------------------------------------------------ */
/* Count helpers                                    */
/* ------------------------------------------------ */
/** Counts items per domain key. Returns Record<domainKey, count>. */
export function countByDomain<T extends { domain: string }>(items: T[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.domain] = (counts[item.domain] ?? 0) + 1;
  }
  return counts;
}