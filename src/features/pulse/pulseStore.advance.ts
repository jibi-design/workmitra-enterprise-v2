/** Job Mitra | pulseStore.advance.ts | Last-hop destination + home-root clear */

import { isGuidanceRootNodeId, stripHomeGuidanceSeverity } from "./pulseGuidance.helpers";
import { markInboxHandledForTargetPath } from "./pulseInboxSync";
import { persistPulseState } from "./pulseStorage";
import type {
  ActivePulseTrails,
  ActivePulses,
  PulseChainSeverity,
  PulseNodeId,
  PulseState,
} from "./pulseTypes";

export type AdvanceChainPatch = Pick<
  PulseState,
  | "chain"
  | "pendingGuidanceRoots"
  | "resolvingNodeId"
  | "severityByNodeId"
  | "activePulses"
  | "activeTrails"
>;

export function buildAdvanceChainPatch(args: {
  readonly state: PulseState;
  readonly resolvedNodeId: PulseNodeId;
  readonly nextChain: PulseNodeId[];
  readonly skipArrival: boolean;
}): { readonly patch: AdvanceChainPatch; readonly trailIdsToCleanup: string[] } {
  const { state, resolvedNodeId, nextChain, skipArrival } = args;
  const nextSeverityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {
    ...state.severityByNodeId,
  };

  if (!skipArrival && !isGuidanceRootNodeId(resolvedNodeId)) {
    delete nextSeverityByNodeId[resolvedNodeId];
  }

  const chainComplete = nextChain.length === 0;
  const pendingGuidanceRoots = chainComplete ? [] : state.pendingGuidanceRoots;
  const severityByNodeId = chainComplete
    ? stripHomeGuidanceSeverity(nextSeverityByNodeId, state.pendingGuidanceRoots)
    : nextSeverityByNodeId;

  const nextActiveTrails: ActivePulseTrails = { ...state.activeTrails };
  const nextActivePulses: ActivePulses = { ...state.activePulses };
  const trailIdsToCleanup: string[] = [];

  if (chainComplete) {
    const now = Date.now();
    for (const [trailId, trail] of Object.entries(nextActiveTrails)) {
      if (trail.status !== "TRAIL_STARTED") continue;
      markInboxHandledForTargetPath(trail.targetPath);
      nextActiveTrails[trailId] = {
        ...trail,
        status: "RESOLVING",
        updatedAt: now,
        resolvingStartedAt: now,
      };
      trailIdsToCleanup.push(trailId);
      nextActivePulses[trail.eventId] = false;
    }
  }

  const patch: AdvanceChainPatch = {
    chain: nextChain,
    pendingGuidanceRoots,
    resolvingNodeId: skipArrival ? null : resolvedNodeId,
    severityByNodeId,
    activePulses: nextActivePulses,
    activeTrails: nextActiveTrails,
  };

  persistPulseState(patch);
  return { patch, trailIdsToCleanup };
}
