/** Job Mitra | pulseEventBridge.qa.ts | src/features/pulse/pulseEventBridge.qa.ts */

import {
  isPulseEnabledEventType,
  PULSE_EVENT_ROUTES,
  type PulseBackendEventType,
} from "./pulseRegistry";
import type { GlobalPulseEventPayload, PulseDevTriggerOptions } from "./pulseEventBridge.types";
import { getDefaultNotificationTarget } from "./pulseEventBridge.notificationCopy";
import { isPulseDomain, toPulseSeverity } from "./pulseEventBridge.utils";
import {
  clearCareerPulseQaData,
  getPulseQaCareerSeed,
  seedCareerPulseQaData,
} from "./pulseEventBridge.qa.career";
import {
  clearShiftPulseQaData,
  getPulseQaShiftSeed,
  seedShiftPulseQaData,
} from "./pulseEventBridge.qa.shift";

export function seedPulseQaData(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): PulseDevTriggerOptions | undefined {
  const shiftSeed = getPulseQaShiftSeed(type, options);

  if (shiftSeed) {
    seedShiftPulseQaData(shiftSeed);

    return {
      ...options,
      postId: shiftSeed.postId,
      appId: shiftSeed.appId,
      targetId: options?.targetId ?? shiftSeed.postId,
    };
  }

  const careerSeed = getPulseQaCareerSeed(type, options);

  if (careerSeed) {
    seedCareerPulseQaData(careerSeed);

    return {
      ...options,
      postId: careerSeed.jobId,
      appId: careerSeed.appId,
      targetId: options?.targetId ?? careerSeed.jobId,
    };
  }

  return options;
}

export function createDevPulsePayload(
  type: PulseBackendEventType,
  options?: PulseDevTriggerOptions,
): GlobalPulseEventPayload | null {
  if (isPulseEnabledEventType(type)) {
    const route = PULSE_EVENT_ROUTES[type];

    if (!route) return null;
    if (!isPulseDomain(route.domain)) return null;

    return {
      type,
      domain: route.domain,
      affectedUserRole: route.affectedUserRole,
      targetId:
        options?.targetId ?? options?.postId ?? options?.appId ?? `qa-${type.toLowerCase()}`,
      postId: options?.postId,
      appId: options?.appId,
      severity: options?.severity ?? toPulseSeverity(route.severity),
    };
  }

  const fallback = getDefaultNotificationTarget(type);

  return {
    type,
    domain: fallback.domain,
    affectedUserRole: fallback.affectedUserRole,
    targetId: options?.targetId ?? options?.postId ?? options?.appId ?? `qa-${type.toLowerCase()}`,
    postId: options?.postId,
    appId: options?.appId,
    severity: options?.severity,
  };
}

export { clearShiftPulseQaData, clearCareerPulseQaData };
