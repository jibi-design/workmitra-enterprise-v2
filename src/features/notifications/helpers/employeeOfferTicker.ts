/** Job Mitra | employeeOfferTicker.ts | Home ticker rows from pending career offers */

import { ROUTE_PATHS } from "../../../app/router/routePaths";
import type { HRCandidateRecord } from "../../shared/hr/hrPublic";
import type { InboxTickerItem } from "./latestUnreadInboxPreview";

export function listEmployeeOfferTicker(
  records: readonly HRCandidateRecord[],
  employeeUniqueId: string,
): InboxTickerItem[] {
  const self = employeeUniqueId.trim();
  const rows: InboxTickerItem[] = [];
  for (const record of records) {
    if (record.status !== "offered") continue;
    if (self && record.employeeUniqueId !== self) continue;
    rows.push({
      id: `offer:${record.id}`,
      domain: "career",
      title: "Offer received",
      body: record.jobTitle.trim() || undefined,
      createdAt: record.updatedAt || record.createdAt,
      route: `${ROUTE_PATHS.employeeCareerApplications}?tab=offers`,
    });
  }
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}
