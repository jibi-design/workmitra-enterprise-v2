/**
 * Breathing Light Pro — Phase 2 domain resolution.
 * Domain comes from registry routes / PulseConfig — never nodeId substring heuristics.
 */

import type { NotificationId } from "./pulseEvents";
import { PULSE_EVENT_ROUTES, PULSE_REGISTRY } from "./pulseRegistry";
import type { PulseEventDomain } from "./pulseRegistry.eventTypes";
import type { PulseDomain, PulseNodeId } from "./pulseTypes";

/** Guide-tone domains (UI). Aligns with PulseDomain + planner/vault visual lanes. */
export type PulseVisualDomain =
  | PulseDomain
  | "planner"
  | "vault";

const EVENT_DOMAIN_BY_ID = new Map<string, PulseEventDomain>();
const NODE_DOMAIN_BY_ID = new Map<string, PulseEventDomain>();

function indexRoutes(): void {
  if (EVENT_DOMAIN_BY_ID.size > 0) return;
  for (const [backendType, route] of Object.entries(PULSE_EVENT_ROUTES)) {
    if (!route) continue;
    EVENT_DOMAIN_BY_ID.set(route.eventId, route.domain);
    EVENT_DOMAIN_BY_ID.set(backendType, route.domain);
    for (const nodeId of route.chain) {
      if (!NODE_DOMAIN_BY_ID.has(nodeId)) {
        NODE_DOMAIN_BY_ID.set(nodeId, route.domain);
      }
    }
  }
  for (const [eventId, config] of Object.entries(PULSE_REGISTRY)) {
    if (!config || !("domain" in config)) continue;
    const domain = (config as { domain?: PulseEventDomain }).domain;
    if (!domain) continue;
    if (!EVENT_DOMAIN_BY_ID.has(eventId)) {
      EVENT_DOMAIN_BY_ID.set(eventId, domain);
    }
  }
}

/** Map product domain → visual lane (planner/vault are tone lanes only). */
export function toVisualDomain(domain: PulseEventDomain | PulseDomain): PulseVisualDomain {
  if (domain === "workforce") return "planner";
  if (domain === "admin") return "vault";
  if (domain === "employment") return "career";
  return domain;
}

export type ResolvePulseDomainInput = {
  readonly domain?: PulseEventDomain | PulseDomain | null;
  readonly eventId?: NotificationId | string | null;
  readonly nodeId?: PulseNodeId | null;
};

/**
 * Resolve domain from explicit prop → event registry → chain node index.
 * Fallback: system (cyan idle/guide).
 */
export function resolvePulseDomain(input: ResolvePulseDomainInput): PulseEventDomain {
  indexRoutes();
  if (input.domain) return input.domain;
  if (input.eventId) {
    const fromEvent = EVENT_DOMAIN_BY_ID.get(String(input.eventId));
    if (fromEvent) return fromEvent;
    const config = PULSE_REGISTRY[input.eventId as NotificationId];
    if (config && "domain" in config && config.domain) {
      return config.domain as PulseEventDomain;
    }
  }
  if (input.nodeId) {
    const fromNode = NODE_DOMAIN_BY_ID.get(String(input.nodeId));
    if (fromNode) return fromNode;
  }
  return "system";
}

export function resolvePulseVisualDomain(
  input: ResolvePulseDomainInput,
): PulseVisualDomain {
  return toVisualDomain(resolvePulseDomain(input));
}

/** Test helper — expose index sizes after build. */
export function getPulseDomainIndexStats(): {
  readonly events: number;
  readonly nodes: number;
} {
  indexRoutes();
  return { events: EVENT_DOMAIN_BY_ID.size, nodes: NODE_DOMAIN_BY_ID.size };
}
