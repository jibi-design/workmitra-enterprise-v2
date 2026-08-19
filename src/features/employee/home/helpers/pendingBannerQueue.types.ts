/** Job Mitra | pendingBannerQueue.types.ts | Unified Pending Actions banner queue model */

import type { DomainRegistryKey } from "../../../../shared/config/domainRegistry";
import type { PendingActionItem } from "../../../../shared/pendingActions/pendingActions.types";

/** Domain accent for banner chrome (profile uses soft amber, not Day-1 registry). */
export type PendingBannerAccent = DomainRegistryKey | "profile";

export type PendingBannerQueueItem = {
  id: string;
  /** Stable content key — dismiss hides this fingerprint; content change reappears. */
  fingerprint: string;
  accent: PendingBannerAccent;
  /** Short domain chip (Shift / Career / Profile / …). */
  domainLabel: string;
  /** Primary line under Pending Actions kicker. */
  title: string;
  detail?: string;
  count?: number;
  ctaLabel?: string;
  pulseId?: string;
  onOpen: () => void;
  dualActions?: PendingActionItem["dualActions"];
  /** Layout-inspection demo force — clear flag on dismiss. */
  isDemoForce?: boolean;
  demoKind?: "upcoming" | "broadcast";
};

export type PendingBannerQueueView = {
  /** Non-dismissed items in priority order. */
  visible: PendingBannerQueueItem[];
  /** Currently displayed head of queue (or null when empty). */
  current: PendingBannerQueueItem | null;
  /** Total live sources before dismiss filtering (for badge honesty). */
  liveCount: number;
  queueIndex: number;
  queueTotal: number;
  dismissItem: (fingerprint: string) => void;
};
