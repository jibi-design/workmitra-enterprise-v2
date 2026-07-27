/**
 * Job Mitra | shiftSearchFeed.service.ts
 * Explicit feed refresh for Search 4-state (Loading / Error / Empty / Active).
 */

import {
  hydrateShiftApplicationsFromServer,
  hydrateShiftPostsFromServer,
} from "../../../shift/services/shiftDbTruth.service";
import { isShiftApiSyncEnabled } from "../../../shift/services/shiftGateApi.service";

export type ShiftSearchFeedStatus = "loading" | "ready" | "error";

export async function refreshShiftSearchFeed(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  if (!isShiftApiSyncEnabled()) {
    return { ok: true };
  }

  const [postsOk, appsOk] = await Promise.all([
    hydrateShiftPostsFromServer(),
    hydrateShiftApplicationsFromServer(),
  ]);

  if (postsOk && appsOk) return { ok: true };

  return {
    ok: false,
    message: "Could not refresh shifts. Check your connection and try again.",
  };
}
