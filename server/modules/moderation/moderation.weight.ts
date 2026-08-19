/** Report weight — high-severity reasons count more. Isolated from Shift/Career domain logic. */

import type { ContentReportReason } from "./moderation.types.js";

export function reportWeightForReason(reason: ContentReportReason): number {
  if (reason === "asks_money" || reason === "harassment") return 1.5;
  if (reason === "discriminatory") return 1.25;
  return 1;
}

export const REPORT_RATE_LIMIT_24H = 5;
