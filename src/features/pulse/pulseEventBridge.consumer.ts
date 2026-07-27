/** Job Mitra | pulseEventBridge.consumer.ts | src/features/pulse/pulseEventBridge.consumer.ts */

import { useEffect } from "react";
import type { PulseAffectedUserRole } from "./pulseRegistry";
import { PULSE_EVENT_QUEUE_CHANGED_EVENT } from "./pulseEventBridge.types";
import { consumeQueuedPulseEventsForRole } from "./pulseEventBridge.queue";
import { installPulseDevTools } from "./pulseEventBridge.devTools";

/**
 * Shell-level consumer. Keeps pages/cards free from queue/listener logic.
 */
export function usePulseEventBridgeConsumer(role: PulseAffectedUserRole | null): void {
  useEffect(() => {
    const uninstallPulseDevTools = installPulseDevTools();

    if (!role) {
      return uninstallPulseDevTools;
    }

    const consumePulseQueue = () => {
      consumeQueuedPulseEventsForRole(role);
    };

    consumePulseQueue();

    const retryTimerId = window.setTimeout(consumePulseQueue, 150);

    window.addEventListener("focus", consumePulseQueue);
    window.addEventListener("storage", consumePulseQueue);
    window.addEventListener(PULSE_EVENT_QUEUE_CHANGED_EVENT, consumePulseQueue);

    return () => {
      window.clearTimeout(retryTimerId);
      window.removeEventListener("focus", consumePulseQueue);
      window.removeEventListener("storage", consumePulseQueue);
      window.removeEventListener(PULSE_EVENT_QUEUE_CHANGED_EVENT, consumePulseQueue);
      uninstallPulseDevTools();
    };
  }, [role]);
}
