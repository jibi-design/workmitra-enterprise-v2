/** Server gate PIN folder id — same event + venue + date rule as pass folders. */

import { resolvePassFolderId } from "./eventDay.folders.js";

export function resolveEventGateFolderId(
  issuerId: string,
  eventName: string | null,
  venueName: string,
  validFrom: string,
): string {
  return resolvePassFolderId({
    passId: "pin",
    issuerId,
    eventName,
    venueName,
    validFrom,
    status: "active",
  });
}
