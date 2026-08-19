/** Job Mitra | pulseRegistryTypes.ts | src/features/pulse/pulseRegistryTypes.ts */

import { ROUTE_PATHS } from "../../app/router/routePaths";
import type { PulseEvent } from "./pulseEvents";
import type { PulseEventDomain } from "./pulseRegistry.eventTypes";
import type { PulseSectionId } from "./pulseSectionIds";

export type PulseSeverity = "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";

export type PulseDuration = `${number}ms` | `${number}s`;

export type PulseResolutionType = "ROUTE" | "INTERACTION";

export type PulseTargetPath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

export type NotificationId = PulseEvent;

export interface PulseConfigBase {
  /** Product domain — drives guide LED hue (Phase 2). */
  readonly domain: PulseEventDomain;
  readonly severity: PulseSeverity;
  readonly colorBase: string;
  readonly colorGloss: string;
  readonly colorGlow: string;
  readonly duration: PulseDuration;
  readonly targetPath: PulseTargetPath;
}

export interface RoutePulseConfig extends PulseConfigBase {
  readonly resolutionType: "ROUTE";
  readonly targetSectionId?: never;
}

export interface InteractionPulseConfig extends PulseConfigBase {
  readonly resolutionType: "INTERACTION";
  readonly targetSectionId: PulseSectionId;
}

export type PulseConfig = RoutePulseConfig | InteractionPulseConfig;
