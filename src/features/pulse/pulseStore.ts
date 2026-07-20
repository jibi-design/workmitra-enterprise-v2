/** Job Mitra | pulseStore.ts | src/features/pulse/pulseStore.ts */

import { create } from "zustand";
import { showPhase2Features } from "../../shared/config/featureFlags";
import { buildDynamicPulseFlow, normalizeSeverityFromRegistry } from "./pulseFlowBuilders";
import { getPulseNavEnabled } from "./pulseNavStore";
import { hydratePulseState, persistPulseState, safeRemovePulseStorage } from "./pulseStorage";
import {
  createNodeIdFromTrailLike,
  createTrailId,
  doesTrailMatchTarget,
  getNow,
  hasStartedTrailForEvent,
} from "./pulseTrailUtils";
import type {
  ActivePulseTrails,
  ActivePulses,
  PulseChainSeverity,
  PulseNodeId,
  PulseState,
  PulseTrail,
  SetPulseChainOptions,
} from "./pulseTypes";

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

const RESOLVING_ANIMATION_MS = 320;
/** Glow-swap: border restores after pulse edge clears (Section 18 — Bespoke Tier). */
export const PULSE_GLOW_SWAP_MS = RESOLVING_ANIMATION_MS;

const PHASE2_PULSE_MARKERS = ["/workforce", "/employer/hr", "/employer/console"] as const;

function isPhase2PulseTarget(targetId: string | undefined, notificationType?: string): boolean {
  const haystack = `${targetId ?? ""}|${notificationType ?? ""}`;
  return PHASE2_PULSE_MARKERS.some((marker) => haystack.includes(marker));
}

let resolvingClearTimerId: number | null = null;

function normalizeChain(pathArray: readonly PulseNodeId[]): PulseNodeId[] {
  const output: PulseNodeId[] = [];

  for (const item of pathArray) {
    const trimmed = item.trim();

    if (trimmed.length === 0) continue;
    if (output.includes(trimmed)) continue;

    output.push(trimmed);
  }

  return output;
}

function createSeverityMap(
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

function clearResolvingTimer(): void {
  if (typeof window === "undefined") return;

  if (resolvingClearTimerId !== null) {
    window.clearTimeout(resolvingClearTimerId);
    resolvingClearTimerId = null;
  }
}

function scheduleResolvingNodeClear(): void {
  if (typeof window === "undefined") return;

  clearResolvingTimer();

  resolvingClearTimerId = window.setTimeout(() => {
    usePulseStore.setState({
      resolvingNodeId: null,
    });

    resolvingClearTimerId = null;
  }, RESOLVING_ANIMATION_MS);
}

function scheduleResolvingTrailCleanup(trailIds: readonly string[]): void {
  if (trailIds.length === 0) return;
  if (typeof window === "undefined") return;

  window.setTimeout(() => {
    usePulseStore.setState((state) => {
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
        chain: state.chain,
        severityByNodeId: state.severityByNodeId,
        activePulses: nextActivePulses,
        activeTrails: nextTrails,
      });

      return nextState;
    });
  }, RESOLVING_ANIMATION_MS);
}

const hydratedState = hydratePulseState();

export const usePulseStore = create<PulseState>((set, get) => ({
  chain: hydratedState.chain,
  resolvingNodeId: hydratedState.resolvingNodeId,
  severityByNodeId: hydratedState.severityByNodeId,
  activePulses: hydratedState.activePulses,
  activeTrails: hydratedState.activeTrails,

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

  isPulseActive: (id) => {
    const state = get();

    if (state.activePulses[id] === true) return true;
    if (state.chain.includes(id)) return true;

    return hasStartedTrailForEvent(state.activeTrails, id);
  },

  getPulseSeverity: (id) => {
    const state = get();

    if (state.severityByNodeId[id]) return state.severityByNodeId[id];

    const activeTrail = Object.values(state.activeTrails).find((trail) => {
      return trail.eventId === id && trail.status === "TRAIL_STARTED";
    });

    return activeTrail?.severity ?? normalizeSeverityFromRegistry(id);
  },

  startPulseTrail: (input) => {
    if (!getPulseNavEnabled()) return;
    const now = getNow();
    const trailId = createTrailId(input);
    const nodeId = createNodeIdFromTrailLike(input);
    const severity = input.severity ?? normalizeSeverityFromRegistry(input.eventId);

    set((state) => {
      const nextTrail: PulseTrail = {
        trailId,
        id: trailId,
        eventId: input.eventId,
        domain: input.domain,
        severity,
        targetPath: input.targetPath,
        targetParams: input.targetParams,
        status: "TRAIL_STARTED",
        createdAt: state.activeTrails[trailId]?.createdAt ?? now,
        updatedAt: now,
        resolvingStartedAt: undefined,
      };

      const nextChain = state.chain.length > 0 ? state.chain : [nodeId];

      const nextSeverityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {
        ...state.severityByNodeId,
        [nodeId]: severity,
      };

      const nextActivePulses: ActivePulses = {
        ...state.activePulses,
        [input.eventId]: true,
      };

      const nextActiveTrails: ActivePulseTrails = {
        ...state.activeTrails,
        [trailId]: nextTrail,
      };

      const nextState = {
        chain: nextChain,
        resolvingNodeId: state.resolvingNodeId,
        severityByNodeId: nextSeverityByNodeId,
        activePulses: nextActivePulses,
        activeTrails: nextActiveTrails,
      };

      persistPulseState(nextState);

      return nextState;
    });
  },

  resolvePulseTrail: (trailId) => {
    const currentState = get();
    const trail = currentState.activeTrails[trailId];

    if (!trail) return;

    const trailNodeId = createNodeIdFromTrailLike(trail);

    if (currentState.chain[0] === trailNodeId) {
      currentState.advanceChain();
    }

    const now = getNow();

    set((state) => {
      const currentTrail = state.activeTrails[trailId];

      if (!currentTrail) return {};

      const nextTrail: PulseTrail = {
        ...currentTrail,
        status: "RESOLVING",
        updatedAt: now,
        resolvingStartedAt: now,
      };

      const nextActiveTrails: ActivePulseTrails = {
        ...state.activeTrails,
        [trailId]: nextTrail,
      };

      const eventStillActive = Object.values(nextActiveTrails).some((entry) => {
        return (
          entry.trailId !== trailId &&
          entry.eventId === currentTrail.eventId &&
          entry.status === "TRAIL_STARTED"
        );
      });

      const nextActivePulses: ActivePulses = {
        ...state.activePulses,
        [currentTrail.eventId]: eventStillActive || state.chain.includes(currentTrail.eventId),
      };

      const nextState = {
        activeTrails: nextActiveTrails,
        activePulses: nextActivePulses,
      };

      persistPulseState({
        chain: state.chain,
        severityByNodeId: state.severityByNodeId,
        activePulses: nextActivePulses,
        activeTrails: nextActiveTrails,
      });

      return nextState;
    });

    scheduleResolvingTrailCleanup([trailId]);
  },

  resolvePulseTrailByTarget: (input) => {
    const currentState = get();
    const matchedTrailIds: string[] = [];

    for (const [trailId, trail] of Object.entries(currentState.activeTrails)) {
      if (doesTrailMatchTarget(trail, input) && trail.status === "TRAIL_STARTED") {
        matchedTrailIds.push(trailId);
      }
    }

    for (const trailId of matchedTrailIds) {
      get().resolvePulseTrail(trailId);
    }
  },

  isPulseTargetActive: (input) => {
    const includeResolving = input.includeResolving ?? true;

    return Object.values(get().activeTrails).some((trail) => {
      if (!doesTrailMatchTarget(trail, input)) return false;
      if (trail.status === "TRAIL_STARTED") return true;

      return includeResolving && trail.status === "RESOLVING";
    });
  },
}));
