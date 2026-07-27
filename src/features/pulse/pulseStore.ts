/** Job Mitra | pulseStore.ts | src/features/pulse/pulseStore.ts */

import { create } from "zustand";
import { showPhase2Features } from "../../shared/config/featureFlags";
import { buildDynamicPulseFlow, normalizeSeverityFromRegistry } from "./pulseFlowBuilders";
import { getPulseNavEnabled } from "./pulseNavStore";
import { persistPulseState, safeRemovePulseStorage } from "./pulseStorage";
import type { ActivePulses, PulseChainSeverity, PulseNodeId, PulseState } from "./pulseTypes";
import {
  createSeverityMap,
  hydratedPulseState,
  isPhase2PulseTarget,
  normalizeChain,
  PULSE_GLOW_SWAP_MS,
} from "./pulseStore.helpers";
import { createPulseTrailActions } from "./pulseStore.trailActions";
import {
  bindPulseStoreTimers,
  clearResolvingTimer,
  scheduleResolvingNodeClear,
} from "./pulseStore.timers";

export type {
  ActivePulseTrails,
  ActivePulses,
  HydratedPulseState,
  KnownPulseFlowNotificationType,
  PulseChainSeverity,
  PulseDomain,
  PulseFlowBuildResult,
  PulseFlowBuilder,
  PulseFlowBuilderInput,
  PulseFlowNotificationType,
  PulseNodeId,
  PulseState,
  PulseTargetLookupInput,
  PulseTrail,
  PulseTrailStatus,
  PulseTrailTargetParams,
  ResolvePulseTrailTargetInput,
  SetPulseChainOptions,
  StartPulseTrailInput,
  TriggerPulseFlowOptions,
} from "./pulseTypes";

export { PULSE_GLOW_SWAP_MS };

export const usePulseStore = create<PulseState>((set, get) => {
  const trailActions = createPulseTrailActions(get, set);

  return {
    chain: hydratedPulseState.chain,
    resolvingNodeId: hydratedPulseState.resolvingNodeId,
    severityByNodeId: hydratedPulseState.severityByNodeId,
    activePulses: hydratedPulseState.activePulses,
    activeTrails: hydratedPulseState.activeTrails,

    setChain: (pathArray, options) => {
      if (!getPulseNavEnabled()) return;
      const nextChain = normalizeChain(pathArray);
      const nextSeverityByNodeId = createSeverityMap(nextChain, options);

      clearResolvingTimer();

      set((state) => {
        const nextActivePulses: ActivePulses = { ...state.activePulses };

        if (options?.sourceEventId) {
          nextActivePulses[options.sourceEventId] = nextChain.length > 0;
        }

        if (nextChain.length === 0) {
          for (const key of Object.keys(nextActivePulses)) {
            nextActivePulses[key] = false;
          }
        }

        const nextState = {
          chain: nextChain,
          resolvingNodeId: null,
          severityByNodeId: nextSeverityByNodeId,
          activePulses: nextActivePulses,
          activeTrails: state.activeTrails,
        };

        persistPulseState(nextState);

        return nextState;
      });
    },

    triggerPulseFlow: (notificationType, targetId, options) => {
      if (!getPulseNavEnabled()) return [];
      if (!showPhase2Features && isPhase2PulseTarget(targetId, notificationType)) return [];

      const generatedFlow = buildDynamicPulseFlow(notificationType, targetId);
      const fallbackChain = options?.fallbackNodeId ? [options.fallbackNodeId] : [];
      const chain = generatedFlow.chain.length > 0 ? generatedFlow.chain : fallbackChain;
      const severity = options?.severity ?? generatedFlow.defaultSeverity;

      get().setChain(chain, {
        severity,
        severityByNodeId: options?.severityByNodeId,
        sourceEventId: options?.sourceEventId,
      });

      return chain;
    },

    buildPulseFlow: (notificationType, targetId) => {
      return buildDynamicPulseFlow(notificationType, targetId).chain;
    },

    advanceChain: () => {
      const currentChain = get().chain;

      if (currentChain.length === 0) return;

      const resolvedNodeId = currentChain[0];
      const nextChain = currentChain.slice(1);

      set((state) => {
        const nextSeverityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {
          ...state.severityByNodeId,
        };
        delete nextSeverityByNodeId[resolvedNodeId];

        const nextActivePulses: ActivePulses = { ...state.activePulses };

        if (nextChain.length === 0) {
          for (const key of Object.keys(nextActivePulses)) {
            nextActivePulses[key] = false;
          }
        }

        const nextState = {
          chain: nextChain,
          resolvingNodeId: resolvedNodeId,
          severityByNodeId: nextSeverityByNodeId,
          activePulses: nextActivePulses,
          activeTrails: state.activeTrails,
        };

        persistPulseState(nextState);

        return nextState;
      });

      scheduleResolvingNodeClear();
    },

    clearAll: () => {
      clearResolvingTimer();
      safeRemovePulseStorage();

      set({
        chain: [],
        resolvingNodeId: null,
        severityByNodeId: {},
        activePulses: {},
        activeTrails: {},
      });
    },

    clearAllPulses: () => {
      get().clearAll();
    },

    getCurrentNodeId: () => {
      return get().chain[0] ?? null;
    },

    isNodeActive: (id) => {
      return get().chain[0] === id;
    },

    isNodeResolving: (id) => {
      return get().resolvingNodeId === id;
    },

    shouldDimNode: () => {
      return false;
    },

    hasActiveChain: () => {
      return get().chain.length > 0;
    },

    hasAnyActivePulse: () => {
      const state = get();

      if (state.chain.length > 0) return true;
      if (Object.values(state.activePulses).some(Boolean)) return true;

      return Object.values(state.activeTrails).some((trail) => trail.status === "TRAIL_STARTED");
    },

    getNodeSeverity: (id) => {
      return get().severityByNodeId[id] ?? "info";
    },

    activatePulse: (id, severity) => {
      if (!getPulseNavEnabled()) return;
      const normalizedSeverity = severity ?? normalizeSeverityFromRegistry(id);

      get().setChain([id], {
        severity: normalizedSeverity,
        sourceEventId: id,
      });
    },

    resolvePulse: (id) => {
      const state = get();

      if (state.chain[0] === id) {
        state.advanceChain();
        return;
      }

      set((currentState) => {
        const nextChain = currentState.chain.filter((nodeId) => nodeId !== id);
        const nextSeverityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {
          ...currentState.severityByNodeId,
        };
        delete nextSeverityByNodeId[id];

        const nextActivePulses: ActivePulses = {
          ...currentState.activePulses,
          [id]: false,
        };

        const nextState = {
          chain: nextChain,
          resolvingNodeId: currentState.resolvingNodeId,
          severityByNodeId: nextSeverityByNodeId,
          activePulses: nextActivePulses,
          activeTrails: currentState.activeTrails,
        };

        persistPulseState(nextState);

        return nextState;
      });
    },

    ...trailActions,
  };
});

bindPulseStoreTimers(usePulseStore);
