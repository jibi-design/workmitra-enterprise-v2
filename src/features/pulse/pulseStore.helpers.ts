/** Job Mitra | pulseStore.helpers.ts | src/features/pulse/pulseStore.helpers.ts */

import { hydratePulseState } from "./pulseStorage";
import type { PulseChainSeverity, PulseNodeId, SetPulseChainOptions } from "./pulseTypes";

export const RESOLVING_ANIMATION_MS = 2500;
/** Arrival lock duration — solid success glow then auto-dim (Pillar 2). */
export const PULSE_ARRIVAL_LOCK_MS = RESOLVING_ANIMATION_MS;
/** Glow-swap: border restores after pulse edge clears (Section 18 — Bespoke Tier). */
export const PULSE_GLOW_SWAP_MS = RESOLVING_ANIMATION_MS;

const PHASE2_PULSE_MARKERS = ["/workforce", "/employer/hr", "/employer/console"] as const;

export function isPhase2PulseTarget(
  targetId: string | undefined,
  notificationType?: string,
): boolean {
  const haystack = `${targetId ?? ""}|${notificationType ?? ""}`;
  return PHASE2_PULSE_MARKERS.some((marker) => haystack.includes(marker));
}

export function normalizeChain(pathArray: readonly PulseNodeId[]): PulseNodeId[] {
  const output: PulseNodeId[] = [];

  for (const item of pathArray) {
    const trimmed = item.trim();

    if (trimmed.length === 0) continue;
    if (output.includes(trimmed)) continue;

    output.push(trimmed);
  }

  return output;
}

export function createSeverityMap(
  chain: readonly PulseNodeId[],
  options?: SetPulseChainOptions,
): Record<PulseNodeId, PulseChainSeverity> {
  const output: Record<PulseNodeId, PulseChainSeverity> = {};
  const fallbackSeverity = options?.severity ?? "info";

  for (const nodeId of chain) {
    output[nodeId] = options?.severityByNodeId?.[nodeId] ?? fallbackSeverity;
  }

  return output;
}

export const hydratedPulseState = hydratePulseState();
