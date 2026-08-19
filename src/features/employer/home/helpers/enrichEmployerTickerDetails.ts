/** Job Mitra | enrichEmployerTickerDetails.ts | Attach post names to generic apply notices */

import { formatHomeStripRowLine } from "../../../notifications/helpers/homeStripRowCopy";
import type { InboxTickerItem } from "../../../notifications/helpers/latestUnreadInboxPreview";
import { countApplicationsForPost } from "../../shiftJobs/helpers/shiftHomeHelpers";
import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";

function applyPostNames(posts: readonly ShiftPost[]): string[] {
  const names: string[] = [];
  for (const post of posts) {
    if (post.status === "completed" || post.status === "cancelled") continue;
    if (countApplicationsForPost(post.id, "applied") <= 0) continue;
    const name = post.jobName.trim();
    if (name) names.push(name);
  }
  return names;
}

export function enrichEmployerTickerDetails(
  items: readonly InboxTickerItem[],
  posts: readonly ShiftPost[],
): InboxTickerItem[] {
  const unused = applyPostNames(posts).filter(
    (name) => !items.some((item) => (item.body ?? "").includes(name) || item.title.includes(name)),
  );
  let nextFallback = 0;
  return items.map((item) => {
    const fromCopy = formatHomeStripRowLine(item.title, item.body);
    if (fromCopy !== item.title.trim()) {
      return { ...item, body: fromCopy };
    }
    const fallback = unused[nextFallback];
    if (fallback) nextFallback += 1;
    return { ...item, body: formatHomeStripRowLine(item.title, item.body, fallback) };
  });
}
