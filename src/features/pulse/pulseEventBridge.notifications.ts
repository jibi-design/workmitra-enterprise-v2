/** Job Mitra | pulseEventBridge.notifications.ts | src/features/pulse/pulseEventBridge.notifications.ts */

import { employeeNotificationsStorage } from "../employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../employer/notifications/storage/employerNotifications.storage";
import { isPulseEnabledEventType } from "./pulseRegistry";
import type { GlobalPulseEventPayload } from "./pulseEventBridge.types";
import { getBellNotificationCopy } from "./pulseEventBridge.notificationCopy";
import { shouldSuppressPhase2Pulse } from "./pulseEventBridge.phase2";
import { dispatchPulseEvent } from "./pulseEventBridge.resolve";
import type { PulseNodeId } from "./pulseStore";

function dispatchToNotificationStore(payload: GlobalPulseEventPayload): void {
  const notification = getBellNotificationCopy(payload);

  if (payload.affectedUserRole === "employee") {
    if (payload.domain === "shift") {
      employeeNotificationsStorage.pushShift(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    if (payload.domain === "career") {
      employeeNotificationsStorage.pushCareer(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    if (payload.domain === "workforce") {
      employeeNotificationsStorage.pushWorkforce(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    if (payload.domain === "employment") {
      employeeNotificationsStorage.pushEmployment(
        notification.title,
        notification.body,
        notification.route,
      );
      return;
    }

    employeeNotificationsStorage.pushEmployment(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "shift") {
    employerNotificationsStorage.pushShift(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "career") {
    employerNotificationsStorage.pushCareer(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "workforce") {
    employerNotificationsStorage.pushWorkforce(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  if (payload.domain === "employment") {
    employerNotificationsStorage.pushEmployment(
      notification.title,
      notification.body,
      notification.route,
    );
    return;
  }

  employerNotificationsStorage.pushConsole(
    notification.title,
    notification.body,
    notification.route,
  );
}

/**
 * Strict Global Notification Bridge.
 *
 * Bell notifications are always updated. Pulse is only allowed for events in
 * PULSE_ENABLED_EVENT_TYPES. Passive events bypass the pulse store entirely.
 */
export function handleIncomingNotification(payload: GlobalPulseEventPayload): PulseNodeId[] {
  if (shouldSuppressPhase2Pulse(payload)) {
    return [];
  }

  dispatchToNotificationStore(payload);

  if (!isPulseEnabledEventType(payload.type)) {
    return [];
  }

  return dispatchPulseEvent(payload);
}
