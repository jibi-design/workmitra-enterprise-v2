/** Job Mitra | pulseEventBridge.resolve.ts | src/features/pulse/pulseEventBridge.resolve.ts */

import {
  isPulseEnabledEventType,
  PULSE_EVENT_ROUTES,
  PULSE_REGISTRY,
  type PulseRouteDefinition,
} from "./pulseRegistry";
import type { GlobalPulseEventPayload, ResolvedPulseEvent } from "./pulseEventBridge.types";
import {
  cleanId,
  compactChain,
  isPulseDomain,
  isSameChainOrContinuation,
  replaceRouteToken,
  toPulseSeverity,
} from "./pulseEventBridge.utils";
import { shouldSuppressPhase2Pulse } from "./pulseEventBridge.phase2";
import { getPulseNavEnabled } from "./pulseNavStore";
import { usePulseStore, type PulseNodeId } from "./pulseStore";

function resolveRouteChain(
  route: PulseRouteDefinition,
  payload: GlobalPulseEventPayload,
): PulseNodeId[] {
  return compactChain(
    route.chain.map((nodeId) => {
      const resolvedNodeId = replaceRouteToken(nodeId, payload);

      return resolvedNodeId && resolvedNodeId.trim().length > 0 ? resolvedNodeId : undefined;
    }),
  );
}

function resolvePulseEvent(payload: GlobalPulseEventPayload): ResolvedPulseEvent | null {
  if (!isPulseEnabledEventType(payload.type)) return null;

  const baseRoute = PULSE_EVENT_ROUTES[payload.type];

  if (!baseRoute) return null;

  const route =
    payload.type === "REVIEW_RECEIVED"
      ? {
          ...baseRoute,
          domain: payload.domain,
          affectedUserRole: payload.affectedUserRole,
          chain:
            payload.affectedUserRole === "employer"
              ? ["topbar-notification-icon", "employer-review-center"]
              : baseRoute.chain,
        }
      : baseRoute;

  if (route.affectedUserRole !== payload.affectedUserRole) return null;
  if (payload.type !== "REVIEW_RECEIVED" && route.domain !== payload.domain) return null;
  if (
    payload.type === "REVIEW_RECEIVED" &&
    payload.domain !== "shift" &&
    payload.domain !== "career"
  ) {
    return null;
  }
  if (!isPulseDomain(route.domain)) return null;

  const chain = resolveRouteChain(route, payload);

  if (chain.length === 0) return null;

  return {
    notificationId: route.eventId,
    domain: route.domain,
    severity: payload.severity ?? toPulseSeverity(route.severity),
    chain,
    postId: cleanId(payload.postId ?? payload.targetId),
    appId: cleanId(payload.appId),
    sectionId: "targetSectionId" in route ? route.targetSectionId : undefined,
  };
}

function activateResolvedPulseEvent(resolvedEvent: ResolvedPulseEvent): PulseNodeId[] {
  const registryConfig = PULSE_REGISTRY[resolvedEvent.notificationId];

  if (!registryConfig || !getPulseNavEnabled()) {
    return [];
  }

  const store = usePulseStore.getState();

  if (store.chain.length === 0 || !isSameChainOrContinuation(store.chain, resolvedEvent.chain)) {
    store.setChain(resolvedEvent.chain, {
      severity: resolvedEvent.severity,
      sourceEventId: resolvedEvent.notificationId,
    });
  }

  store.startPulseTrail({
    eventId: resolvedEvent.notificationId,
    domain: resolvedEvent.domain,
    targetPath: registryConfig.targetPath,
    targetParams: {
      postId: resolvedEvent.postId,
      appId: resolvedEvent.appId,
      sectionId: resolvedEvent.sectionId,
    },
    severity: resolvedEvent.severity,
  });

  return [...resolvedEvent.chain];
}

/**
 * Central entry point for the Global Pulse Navigation System.
 *
 * Future Supabase WebSocket / Push payloads can call this directly.
 */
export function dispatchPulseEvent(payload: GlobalPulseEventPayload): PulseNodeId[] {
  if (shouldSuppressPhase2Pulse(payload)) {
    return [];
  }

  if (!isPulseEnabledEventType(payload.type)) {
    return [];
  }

  const resolvedEvent = resolvePulseEvent(payload);

  if (!resolvedEvent) {
    return [];
  }

  return activateResolvedPulseEvent(resolvedEvent);
}
