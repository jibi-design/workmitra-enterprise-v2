/** Job Mitra | pulseStore.trailActions.ts | src/features/pulse/pulseStore.trailActions.ts */

import type { NotificationId } from "./pulseRegistry";
import { normalizeSeverityFromRegistry } from "./pulseFlowBuilders";
import { collectGuidanceRoots } from "./pulseGuidance.helpers";
import { getPulseNavEnabled } from "./pulseNavStore";
import { persistPulseState } from "./pulseStorage";
import { markInboxHandledForTargetPath } from "./pulseInboxSync";
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
  ResolvePulseTrailTargetInput,
  StartPulseTrailInput,
} from "./pulseTypes";
import { scheduleResolvingTrailCleanup } from "./pulseStore.timers";

type PulseStoreGetter = () => PulseState;
type PulseStoreSetter = (
  partial: Partial<PulseState> | ((state: PulseState) => Partial<PulseState>),
) => void;

export function createPulseTrailActions(get: PulseStoreGetter, set: PulseStoreSetter) {
  return {
    startPulseTrail: (input: StartPulseTrailInput) => {
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
        const pendingGuidanceRoots =
          state.pendingGuidanceRoots.length > 0
            ? state.pendingGuidanceRoots
            : collectGuidanceRoots(nextChain);

        const nextSeverityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {
          ...state.severityByNodeId,
          [nodeId]: severity,
        };

        for (const rootId of pendingGuidanceRoots) {
          if (!nextSeverityByNodeId[rootId]) {
            nextSeverityByNodeId[rootId] = severity;
          }
        }

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
          pendingGuidanceRoots,
          resolvingNodeId: state.resolvingNodeId,
          severityByNodeId: nextSeverityByNodeId,
          activePulses: nextActivePulses,
          activeTrails: nextActiveTrails,
        };

        persistPulseState(nextState);

        return nextState;
      });
    },

    resolvePulseTrail: (trailId: string) => {
      const currentState = get();
      const trail = currentState.activeTrails[trailId];

      if (!trail) return;

      const trailNodeId = createNodeIdFromTrailLike(trail);
      const chainHeadMatchesDestination = currentState.chain[0] === trailNodeId;

      /**
       * Destination confirm (green arrival on target section/route).
       * Clears hop chain + home pending roots — only here may home LED turn off.
       */
      if (chainHeadMatchesDestination) {
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

        // Destination confirm: always clear guidance chain + home roots.
        const nextChain: PulseNodeId[] = [];
        const pendingGuidanceRoots: PulseNodeId[] = [];
        const nextSeverityByNodeId: Record<PulseNodeId, PulseChainSeverity> = {};

        const eventStillActive = Object.values(nextActiveTrails).some((entry) => {
          return (
            entry.trailId !== trailId &&
            entry.eventId === currentTrail.eventId &&
            entry.status === "TRAIL_STARTED"
          );
        });

        const nextActivePulses: ActivePulses = {
          ...state.activePulses,
          [currentTrail.eventId]: eventStillActive,
        };

        markInboxHandledForTargetPath(currentTrail.targetPath);

        const nextState = {
          chain: nextChain,
          pendingGuidanceRoots,
          resolvingNodeId: null,
          severityByNodeId: nextSeverityByNodeId,
          activeTrails: nextActiveTrails,
          activePulses: nextActivePulses,
        };

        persistPulseState(nextState);

        return nextState;
      });

      scheduleResolvingTrailCleanup([trailId]);
    },

    resolvePulseTrailByTarget: (input: ResolvePulseTrailTargetInput) => {
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

    isPulseTargetActive: (input: ResolvePulseTrailTargetInput & { includeResolving?: boolean }) => {
      const includeResolving = input.includeResolving ?? true;

      return Object.values(get().activeTrails).some((trail) => {
        if (!doesTrailMatchTarget(trail, input)) return false;
        if (trail.status === "TRAIL_STARTED") return true;

        return includeResolving && trail.status === "RESOLVING";
      });
    },

    isPulseActive: (id: string) => {
      const state = get();

      if (state.activePulses[id] === true) return true;
      if (state.chain.includes(id)) return true;

      return hasStartedTrailForEvent(state.activeTrails, id);
    },

    getPulseSeverity: (id: string) => {
      const state = get();

      if (state.severityByNodeId[id]) return state.severityByNodeId[id];

      const activeTrail = Object.values(state.activeTrails).find((trail) => {
        return trail.eventId === id && trail.status === "TRAIL_STARTED";
      });

      return activeTrail?.severity ?? normalizeSeverityFromRegistry(id as NotificationId);
    },
  };
}

export type PulseTrailActions = ReturnType<typeof createPulseTrailActions>;
