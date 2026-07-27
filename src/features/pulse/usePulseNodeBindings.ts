/** Selective PulseNode store bindings — re-render only for this nodeId. */

import { useShallow } from "zustand/react/shallow";
import { usePulseStore } from "./pulseStore";
import type { PulseChainSeverity, PulseNodeId } from "./pulseTypes";

export type PulseNodeBindings = {
  readonly storeIsActive: boolean;
  readonly isResolving: boolean;
  readonly severity: PulseChainSeverity;
  /** True when any chain pulse is breathing — demote local guide/alert to static. */
  readonly hasViewportBreathingPulse: boolean;
};

export function usePulseNodeBindings(nodeId: PulseNodeId): PulseNodeBindings {
  return usePulseStore(
    useShallow((state) => ({
      storeIsActive: Boolean(nodeId) && state.chain[0] === nodeId,
      isResolving: Boolean(nodeId) && state.resolvingNodeId === nodeId,
      severity: nodeId ? (state.severityByNodeId[nodeId] ?? "info") : "info",
      hasViewportBreathingPulse: state.chain.length > 0,
    })),
  );
}

export function usePulseAdvanceChain(): () => void {
  return usePulseStore((state) => state.advanceChain);
}
