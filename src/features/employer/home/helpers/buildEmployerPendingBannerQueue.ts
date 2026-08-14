/** Job Mitra | buildEmployerPendingBannerQueue.ts | Employer role-home pending queue */

import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";
import type {
  PendingBannerAccent,
  PendingBannerQueueItem,
} from "../../../employee/home/helpers/pendingBannerQueue.types";

function mapAccent(domain: string): PendingBannerAccent {
  if (domain === "career") return "career";
  if (domain === "planner") return "planner";
  if (domain === "vault" || domain === "employment") return "vault";
  return "shift";
}

export function buildEmployerPendingBannerQueue(
  items: readonly PendingActionItem[],
): PendingBannerQueueItem[] {
  return items
    .filter((item) => item.count > 0)
    .map((item) => ({
      id: item.id,
      fingerprint: `action|${item.id}|${item.count}|${item.label}|${item.detail}`,
      accent: mapAccent(item.domain),
      domainLabel: item.label,
      title: item.label,
      detail: item.detail,
      count: item.count,
      ctaLabel: item.ctaLabel,
      pulseId: item.pulseId,
      onOpen: item.onAction,
      dualActions: item.dualActions,
    }));
}
