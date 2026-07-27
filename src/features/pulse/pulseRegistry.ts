/** Job Mitra | pulseRegistry.ts | src/features/pulse/pulseRegistry.ts */

import type { PulseEvent } from "./pulseEvents";
import type { PulseConfig } from "./pulseRegistryTypes";
import { PULSE_REGISTRY_CAREER } from "./pulseRegistry.career";
import { PULSE_REGISTRY_EMPLOYMENT } from "./pulseRegistry.employment";
import {
  type PulseAffectedUserRole,
  type PulseBackendEventType,
  type PulseEnabledEventType,
  type PulseEventDomain,
  type PulseEventSeverity,
  type PulseRouteDefinition,
  type InformationOnlyEventType,
  PULSE_BACKEND_EVENT_TYPES,
  PULSE_ENABLED_EVENT_TYPES,
  INFORMATION_ONLY_EVENT_TYPES,
  isPulseEnabledEventType,
  isInformationOnlyEventType,
} from "./pulseRegistry.eventTypes";
import { PULSE_EVENT_ROUTES_CAREER } from "./pulseRegistry.routes.career";
import { PULSE_EVENT_ROUTES_EMPLOYMENT } from "./pulseRegistry.routes.employment";
import { PULSE_EVENT_ROUTES_SHIFT } from "./pulseRegistry.routes.shift";
import { PULSE_EVENT_ROUTES_SYSTEM } from "./pulseRegistry.routes.system";
import { PULSE_REGISTRY_SHIFT } from "./pulseRegistry.shift";
import { PULSE_REGISTRY_SYSTEM } from "./pulseRegistry.system";

export { PulseEvent } from "./pulseEvents";
export type { NotificationId } from "./pulseEvents";
export { PulseSectionId } from "./pulseSectionIds";
export type {
  InteractionPulseConfig,
  PulseConfig,
  PulseDuration,
  PulseResolutionType,
  PulseSeverity,
  PulseTargetPath,
  RoutePulseConfig,
} from "./pulseRegistryTypes";

export type {
  PulseAffectedUserRole,
  PulseBackendEventType,
  PulseEnabledEventType,
  PulseEventDomain,
  PulseEventSeverity,
  PulseRouteDefinition,
  InformationOnlyEventType,
};

export {
  PULSE_BACKEND_EVENT_TYPES,
  PULSE_ENABLED_EVENT_TYPES,
  INFORMATION_ONLY_EVENT_TYPES,
  isPulseEnabledEventType,
  isInformationOnlyEventType,
};

/**
 * Central Pulse Registry
 * -----------------------------------------------------------------------------
 * This file is now only the event-to-target map.
 *
 * Keep this file free from:
 * - Zustand state.
 * - React hooks.
 * - Component rendering.
 * - Navigation side effects.
 * - Private job/application/message payloads.
 */
export const PULSE_REGISTRY = {
  ...PULSE_REGISTRY_SHIFT,
  ...PULSE_REGISTRY_CAREER,
  ...PULSE_REGISTRY_SYSTEM,
  ...PULSE_REGISTRY_EMPLOYMENT,
} as const satisfies Partial<Record<PulseEvent, PulseConfig>>;

/**
 * Backend/App Event → UI Pulse Route map.
 *
 * Locked architecture rule:
 * Add future pulse flows here, not inside pages/components.
 */
export const PULSE_EVENT_ROUTES: Partial<Record<PulseBackendEventType, PulseRouteDefinition>> = {
  ...PULSE_EVENT_ROUTES_SHIFT,
  ...PULSE_EVENT_ROUTES_CAREER,
  ...PULSE_EVENT_ROUTES_SYSTEM,
  ...PULSE_EVENT_ROUTES_EMPLOYMENT,
} as const;
