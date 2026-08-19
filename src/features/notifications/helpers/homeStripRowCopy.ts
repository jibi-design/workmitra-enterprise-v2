/** Job Mitra | homeStripRowCopy.ts | Expanded banner row copy without repeating titles */

import type { InboxTickerItem } from "./latestUnreadInboxPreview";

const GENERIC_POST = /your shift post|your career job post|a worker has applied|a candidate has applied/i;

export function extractAppliedPostName(body: string): string | null {
  const match = body.trim().match(/applied to\s+(.+?)\.?$/i);
  if (!match) return null;
  const name = match[1].trim();
  if (!name || GENERIC_POST.test(name)) return null;
  return name;
}

export function formatHomeStripRowLine(
  title: string,
  body?: string,
  fallbackDetail?: string,
): string {
  const heading = title.trim();
  const text = (body ?? "").trim();
  const appliedTo = text ? extractAppliedPostName(text) : null;
  if (appliedTo) return appliedTo;
  if (text && !GENERIC_POST.test(text) && text !== heading) {
    if (text.startsWith(heading)) {
      const rest = text.slice(heading.length).replace(/^[\s—\-–:]+/, "").trim();
      if (rest && !GENERIC_POST.test(rest)) return rest;
    }
    return text;
  }
  const fallback = fallbackDetail?.trim();
  if (fallback) return fallback;
  return heading;
}

export function overlayTickerDetailBodies(
  items: readonly InboxTickerItem[],
  fallbacks: readonly InboxTickerItem[],
): InboxTickerItem[] {
  let next = 0;
  return items.map((item) => {
    const line = formatHomeStripRowLine(item.title, item.body);
    if (line !== item.title.trim()) return { ...item, body: line };
    const fallback = fallbacks[next];
    next += 1;
    if (fallback?.body) return { ...item, body: fallback.body };
    return item;
  });
}
