/** Job Mitra | pulseGuidance.helpers.ts | Path lights until destination click */

import type { PulseChainSeverity, PulseNodeId } from "./pulseTypes";

/**
 * Current hop stays lit. Opening that hop advances the chain so the next
 * page can light. Destination click clears the path.
 */
export function isGuidanceRootNodeId(nodeId: PulseNodeId): boolean {
  if (!nodeId) return false;
  return (
    nodeId === "home-shift-card" ||
    nodeId === "home-career-card" ||
    nodeId === "home-planner-card" ||
    nodeId.startsWith("employee-home-")
  );
}

export function isUnresolvedPathNode(
  chain: readonly PulseNodeId[],
  nodeId: PulseNodeId,
): boolean {
  return Boolean(nodeId) && chain.includes(nodeId);
}

export function isDestinationNodeId(chain: readonly PulseNodeId[], nodeId: PulseNodeId): boolean {
  if (!nodeId || chain.length === 0) return false;
  return chain[chain.length - 1] === nodeId;
}

export function collectGuidanceRoots(chain: readonly PulseNodeId[]): PulseNodeId[] {
  const roots: PulseNodeId[] = [];
  for (const nodeId of chain) {
    if (!isGuidanceRootNodeId(nodeId)) continue;
    if (roots.includes(nodeId)) continue;
    roots.push(nodeId);
  }
  return roots;
}

export function isPendingGuidanceRoot(
  pendingGuidanceRoots: readonly PulseNodeId[],
  chainHead: PulseNodeId | null,
  nodeId: PulseNodeId,
): boolean {
  if (!nodeId || !isGuidanceRootNodeId(nodeId)) return false;
  if (chainHead === nodeId) return false;
  return pendingGuidanceRoots.includes(nodeId);
}

/**
 * Destination reached (last hop viewed/acted, or trail confirm).
 * Home reminder lights must not survive an empty chain.
 */
export function stripHomeGuidanceSeverity(
  severityByNodeId: Record<PulseNodeId, PulseChainSeverity>,
  pendingGuidanceRoots: readonly PulseNodeId[],
): Record<PulseNodeId, PulseChainSeverity> {
  const next: Record<PulseNodeId, PulseChainSeverity> = { ...severityByNodeId };
  for (const rootId of pendingGuidanceRoots) {
    delete next[rootId];
  }
  for (const nodeId of Object.keys(next)) {
    if (isGuidanceRootNodeId(nodeId)) delete next[nodeId];
  }
  return next;
}
