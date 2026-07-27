/** Job Mitra | pulseEventBridge.phase2.ts | src/features/pulse/pulseEventBridge.phase2.ts */

import { showPhase2Features } from "../../shared/config/featureFlags";
import type { GlobalPulseEventPayload } from "./pulseEventBridge.types";

export function isPhase2PulsePayload(payload: GlobalPulseEventPayload): boolean {
  if (payload.domain === "workforce") return true;

  const route = payload.route ?? "";
  return (
    route.includes("/workforce") ||
    route.includes("/employer/hr") ||
    route.includes("/employer/console")
  );
}

export function shouldSuppressPhase2Pulse(payload: GlobalPulseEventPayload): boolean {
  return !showPhase2Features && isPhase2PulsePayload(payload);
}
