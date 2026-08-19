/** Selective PulseNode store bindings — re-render only for this nodeId. */

import { useShallow } from "zustand/react/shallow";
import { isDestinationNodeId } from "./pulseGuidance.helpers";
import { usePulseStore } from "./pulseStore";
import type { PulseChainSeverity, PulseNodeId } from "./pulseTypes";

export type PulseNodeBindings = {
  readonly storeIsActive: boolean;
  /** True when this node is chain[0] (live hop) — not merely a home reminder. */
  readonly isChainHead: boolean;
  readonly isResolving: boolean;
  /** True when this node is the last step in the active chain (final destination). */
  readonly isFinalDestination: boolean;
  readonly severity: PulseChainSeverity;
  /** True when any chain pulse is breathing — demote local guide/alert to static. */
  readonly hasViewportBreathingPulse: boolean;
};

export function usePulseNodeBindings(nodeId: PulseNodeId): PulseNodeBindings {
    return usePulseStore(
    useShallow((state) => {
      const isChainHead = Boolean(nodeId) && state.chain[0] === nodeId;

      return {
        storeIsActive: isChainHead,
        isChainHead,
        isResolving: Boolean(nodeId) && state.resolvingNodeId === nodeId,
        isFinalDestination: Boolean(nodeId) && isDestinationNodeId(state.chain, nodeId),
        severity: nodeId ? (state.severityByNodeId[nodeId] ?? "info") : "info",
        hasViewportBreathingPulse: state.chain.length > 0,
      };
    }),
  );
}

export function usePulseAdvanceChain(): (options?: { readonly skipArrival?: boolean }) => void {
  return usePulseStore((state) => state.advanceChain);
}
