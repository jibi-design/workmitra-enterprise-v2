/** Job Mitra | pulseStore.timers.ts | src/features/pulse/pulseStore.timers.ts */

import type { StoreApi } from "zustand";
import { persistPulseState } from "./pulseStorage";
import { hasStartedTrailForEvent } from "./pulseTrailUtils";
import type { ActivePulseTrails, ActivePulses, PulseState } from "./pulseTypes";
import { RESOLVING_ANIMATION_MS } from "./pulseStore.helpers";

let resolvingClearTimerId: number | null = null;
let resolvingTrailCleanupTimerId: number | null = null;
let pulseStoreRef: StoreApi<PulseState> | null = null;

export function bindPulseStoreTimers(store: StoreApi<PulseState>): void {
  pulseStoreRef = store;
}

export function clearResolvingTimer(): void {
  if (typeof window === "undefined") return;

  if (resolvingClearTimerId !== null) {
    window.clearTimeout(resolvingClearTimerId);
    resolvingClearTimerId = null;
  }

  if (resolvingTrailCleanupTimerId !== null) {
    window.clearTimeout(resolvingTrailCleanupTimerId);
    resolvingTrailCleanupTimerId = null;
  }
}

export function scheduleResolvingNodeClear(): void {
  if (typeof window === "undefined") return;
  if (!pulseStoreRef) return;

  clearResolvingTimer();

  resolvingClearTimerId = window.setTimeout(() => {
    pulseStoreRef?.setState({
      resolvingNodeId: null,
    });

    resolvingClearTimerId = null;
  }, RESOLVING_ANIMATION_MS);
}

export function scheduleResolvingTrailCleanup(trailIds: readonly string[]): void {
  if (trailIds.length === 0) return;
  if (typeof window === "undefined") return;
  if (!pulseStoreRef) return;

  if (resolvingTrailCleanupTimerId !== null) {
    window.clearTimeout(resolvingTrailCleanupTimerId);
    resolvingTrailCleanupTimerId = null;
  }

  resolvingTrailCleanupTimerId = window.setTimeout(() => {
    resolvingTrailCleanupTimerId = null;

    pulseStoreRef?.setState((state) => {
      const nextTrails: ActivePulseTrails = { ...state.activeTrails };

      for (const trailId of trailIds) {
        const trail = nextTrails[trailId];

        if (trail?.status === "RESOLVING") {
          delete nextTrails[trailId];
        }
      }

      const nextActivePulses: ActivePulses = { ...state.activePulses };

      for (const eventId of Object.keys(nextActivePulses)) {
        const hasVisibleTrail = hasStartedTrailForEvent(nextTrails, eventId);
        const hasChainNode = state.chain.includes(eventId);

        nextActivePulses[eventId] = hasVisibleTrail || hasChainNode;
      }

      const nextState = {
        activeTrails: nextTrails,
        activePulses: nextActivePulses,
      };

      persistPulseState({
        chain: [...state.chain],
        severityByNodeId: state.severityByNodeId,
        activePulses: nextActivePulses,
        activeTrails: nextTrails,
      });

      return nextState;
    });
  }, RESOLVING_ANIMATION_MS);
}
