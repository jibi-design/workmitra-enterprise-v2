/** Job Mitra | pulseEventBridge.types.ts | src/features/pulse/pulseEventBridge.types.ts */

import type {
  NotificationId,
  PulseAffectedUserRole,
  PulseBackendEventType,
  PulseRouteDefinition,
} from "./pulseRegistry";
import type { PulseChainSeverity, PulseDomain, PulseNodeId } from "./pulseStore";

export type GlobalPulseEventType = PulseBackendEventType;

export type GlobalPulseEventPayload = {
  readonly type: GlobalPulseEventType;
  readonly domain: PulseDomain;
  readonly affectedUserRole: PulseAffectedUserRole;
  readonly targetId?: string;
  readonly postId?: string;
  readonly appId?: string;
  readonly severity?: PulseChainSeverity;
  readonly title?: string;
  readonly body?: string;
  readonly route?: string;
};

export type QueuedPulseEvent = GlobalPulseEventPayload & {
  readonly queueId: string;
  readonly batchKey: string;
  readonly createdAt: number;
};

export type ResolvedPulseEvent = {
  readonly notificationId: NotificationId;
  readonly domain: PulseDomain;
  readonly chain: readonly PulseNodeId[];
  readonly severity: PulseChainSeverity;
  readonly postId?: string;
  readonly appId?: string;
  readonly sectionId?: PulseRouteDefinition["targetSectionId"];
};

export type PulseDevTriggerOptions = {
  readonly targetId?: string;
  readonly postId?: string;
  readonly appId?: string;
  readonly severity?: PulseChainSeverity;
  readonly title?: string;
  readonly body?: string;
  readonly route?: string;
};

export type PulseDevStatus = {
  readonly currentNodeId: PulseNodeId | null;
  readonly chain: readonly PulseNodeId[];
  readonly hasAnyActivePulse: boolean;
};

export type PulseDevConsoleApi = {
  readonly events: readonly PulseBackendEventType[];
  readonly trigger: (
    type: PulseBackendEventType,
    options?: PulseDevTriggerOptions,
  ) => readonly PulseNodeId[];
  readonly queue: (type: PulseBackendEventType, options?: PulseDevTriggerOptions) => void;
  readonly activateNode: (
    nodeId: PulseNodeId,
    severity?: PulseChainSeverity,
  ) => readonly PulseNodeId[];
  readonly setChain: (
    chain: readonly PulseNodeId[],
    options?: {
      readonly severity?: PulseChainSeverity;
      readonly severityByNodeId?: Readonly<Record<string, PulseChainSeverity>>;
    },
  ) => readonly PulseNodeId[];
  readonly clear: () => void;
  readonly clearDemoData: () => void;
  readonly status: () => PulseDevStatus;
};

declare global {
  interface Window {
    wmPulseDev?: PulseDevConsoleApi;
  }
}

export const PULSE_EVENT_QUEUE_KEY = "wm_pulse_event_queue_v1";

export const PULSE_EVENT_QUEUE_CHANGED_EVENT = "wm:pulse-event-queue-changed";
