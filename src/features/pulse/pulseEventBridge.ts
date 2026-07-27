/** Job Mitra | pulseEventBridge.ts | src/features/pulse/pulseEventBridge.ts */

export type { PulseAffectedUserRole, PulseBackendEventType } from "./pulseRegistry";

export type { GlobalPulseEventPayload, GlobalPulseEventType } from "./pulseEventBridge.types";

export { PULSE_EVENT_QUEUE_CHANGED_EVENT } from "./pulseEventBridge.queue";

export { handleIncomingNotification } from "./pulseEventBridge.notifications";

export { dispatchPulseEvent } from "./pulseEventBridge.resolve";

export {
  queuePulseEventForAffectedUser,
  notifyCrossRole,
  consumeQueuedPulseEventsForRole,
} from "./pulseEventBridge.queue";

export { usePulseEventBridgeConsumer } from "./pulseEventBridge.consumer";
