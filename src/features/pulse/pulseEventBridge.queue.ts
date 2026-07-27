/** Job Mitra | pulseEventBridge.queue.ts | src/features/pulse/pulseEventBridge.queue.ts */

import type { PulseAffectedUserRole } from "./pulseRegistry";
import type { GlobalPulseEventPayload, QueuedPulseEvent } from "./pulseEventBridge.types";
import { PULSE_EVENT_QUEUE_CHANGED_EVENT, PULSE_EVENT_QUEUE_KEY } from "./pulseEventBridge.types";
import {
  createBatchKey,
  createQueueId,
  isRecord,
  readDomain,
  readEventType,
  readRole,
  readSeverity,
  readString,
} from "./pulseEventBridge.utils";
import { shouldSuppressPhase2Pulse } from "./pulseEventBridge.phase2";
import { handleIncomingNotification } from "./pulseEventBridge.notifications";

function readQueuedPulseEvent(value: unknown): QueuedPulseEvent | null {
  if (!isRecord(value)) return null;

  const type = readEventType(value.type);
  const domain = readDomain(value.domain);
  const affectedUserRole = readRole(value.affectedUserRole);
  const queueId = readString(value.queueId);
  const batchKey = readString(value.batchKey);
  const createdAt = typeof value.createdAt === "number" ? value.createdAt : undefined;

  if (!type || !domain || !affectedUserRole || !queueId || !batchKey || !createdAt) {
    return null;
  }

  return {
    type,
    domain,
    affectedUserRole,
    queueId,
    batchKey,
    createdAt,
    targetId: readString(value.targetId),
    postId: readString(value.postId),
    appId: readString(value.appId),
    severity: readSeverity(value.severity),
    title: readString(value.title),
    body: readString(value.body),
    route: readString(value.route),
  };
}

function readQueuedPulseEvents(): QueuedPulseEvent[] {
  try {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(PULSE_EVENT_QUEUE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(readQueuedPulseEvent)
      .filter((event): event is QueuedPulseEvent => event !== null);
  } catch {
    return [];
  }
}

function writeQueuedPulseEvents(events: readonly QueuedPulseEvent[]): void {
  try {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(PULSE_EVENT_QUEUE_KEY, JSON.stringify(events));
  } catch {
    // Queue is best-effort in demo/local mode. Backend will become source of truth later.
  }
}

function emitPulseQueueChanged(): void {
  try {
    if (typeof window === "undefined") return;

    window.dispatchEvent(new Event(PULSE_EVENT_QUEUE_CHANGED_EVENT));
  } catch {
    // Event emit is best-effort in demo/local mode.
  }
}

/**
 * Demo/local mode queue for cross-role testing before backend push delivery.
 */
export function queuePulseEventForAffectedUser(payload: GlobalPulseEventPayload): void {
  if (shouldSuppressPhase2Pulse(payload)) {
    return;
  }

  const batchKey = createBatchKey(payload);
  const existingEvents = readQueuedPulseEvents();

  if (existingEvents.some((event) => event.batchKey === batchKey)) {
    return;
  }

  writeQueuedPulseEvents([
    ...existingEvents,
    {
      ...payload,
      queueId: createQueueId(payload),
      batchKey,
      createdAt: Date.now(),
    },
  ]);

  emitPulseQueueChanged();
}

/** Cross-role notification entry point — queue for remote sessions, bell-only for info events. */
export const notifyCrossRole = queuePulseEventForAffectedUser;

export function consumeQueuedPulseEventsForRole(role: PulseAffectedUserRole): number {
  const queuedEvents = readQueuedPulseEvents();

  if (queuedEvents.length === 0) {
    return 0;
  }

  let consumedCount = 0;

  const remainingEvents = queuedEvents.filter((event) => {
    if (event.affectedUserRole !== role) {
      return true;
    }

    handleIncomingNotification(event);
    consumedCount += 1;
    return false;
  });

  writeQueuedPulseEvents(remainingEvents);

  return consumedCount;
}

export { PULSE_EVENT_QUEUE_CHANGED_EVENT };
