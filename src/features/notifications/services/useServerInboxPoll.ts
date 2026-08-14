import { useEffect } from "react";
import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { dispatchPulseEvent, type PulseAffectedUserRole } from "../../pulse/pulseEventBridge";
import {
  getDefaultNotificationTarget,
  getBellNotificationCopy,
} from "../../pulse/pulseEventBridge.notificationCopy";
import {
  isPulseEnabledEventType,
  PULSE_BACKEND_EVENT_TYPES,
  type PulseBackendEventType,
} from "../../pulse/pulseRegistry";
import {
  isNotificationsApiSyncEnabled,
  notificationsGateApi,
  type ServerNotificationDto,
} from "../../employee/notifications/services/notificationsGateApi.service";
import { employeeNotificationsStorage } from "../../employee/notifications/storage/employeeNotifications.storage";
import { employerNotificationsStorage } from "../../employer/notifications/storage/employerNotifications.storage";
import {
  hydrateShiftApplicationsFromServer,
  hydrateShiftPostsFromServer,
  hydrateEmployerPostApplicationsFromServer,
} from "../../shift/services/shiftDbTruth.service";
import { isShiftApiSyncEnabled, shiftGateApi } from "../../shift/services/shiftGateApi.service";

const seenByRole = new Map<PulseAffectedUserRole, Set<string>>();

function isBackendEventType(value: string): value is PulseBackendEventType {
  return (PULSE_BACKEND_EVENT_TYPES as readonly string[]).includes(value);
}

function readMetaId(meta: Record<string, unknown>, key: string): string | undefined {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

const primedRoles = new Set<PulseAffectedUserRole>();

function rememberAndPulse(
  role: PulseAffectedUserRole,
  items: readonly ServerNotificationDto[],
): void {
  let seen = seenByRole.get(role);
  if (!seen) {
    seen = new Set();
    seenByRole.set(role, seen);
  }
  const priming = !primedRoles.has(role);
  primedRoles.add(role);
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    if (priming) continue;
    if (!isBackendEventType(item.eventType) || !isPulseEnabledEventType(item.eventType)) continue;
    if (
      item.eventType === "PLAN_CANCELLED" ||
      item.eventType === "SHIFT_PLAN_CANCELLED_CONFIRMED_WORKER"
    ) {
      continue;
    }
    const defaults = getDefaultNotificationTarget(item.eventType);
    if (defaults.domain !== "shift" && defaults.domain !== "career") continue;
    if (defaults.affectedUserRole !== role) continue;
    const copy = getBellNotificationCopy({
      type: item.eventType,
      domain: defaults.domain,
      affectedUserRole: role,
      title: item.title,
      body: item.body || undefined,
      route: item.route || undefined,
    });
    dispatchPulseEvent({
      type: item.eventType,
      domain: defaults.domain,
      affectedUserRole: role,
      title: copy.title,
      body: copy.body,
      route: copy.route,
      postId: readMetaId(item.meta, "postId"),
      appId: readMetaId(item.meta, "appId"),
      targetId: readMetaId(item.meta, "postId"),
    });
  }
}

export async function pollServerInbox(role: PulseAffectedUserRole): Promise<void> {
  if (!AUTH_BACKEND_ENABLED || !isNotificationsApiSyncEnabled()) return;
  try {
    if (role === "employee") {
      const items = await notificationsGateApi.listMine();
      rememberAndPulse(role, items);
      await employeeNotificationsStorage.hydrateFromDb();
      await hydrateShiftApplicationsFromServer();
      return;
    }
    if (role === "employer") {
      const items = await notificationsGateApi.listEmployerInbox();
      rememberAndPulse(role, items);
      const localOnly = employerNotificationsStorage.getAll().filter((n) => {
        return !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          n.id,
        );
      });
      employerNotificationsStorage.replaceFromHydrate([
        ...items.map((n) => ({
          id: n.id,
          domain:
            n.domain === "career" || n.domain === "workforce" || n.domain === "employment"
              ? n.domain
              : "shift",
          title: n.title,
          body: n.body || undefined,
          createdAt: n.createdAt,
          isRead: n.isRead,
          route: n.route || undefined,
        })),
        ...localOnly,
      ]);
      await hydrateShiftPostsFromServer();
      if (isShiftApiSyncEnabled()) {
        const posts = await shiftGateApi.listMyPosts().catch(() => []);
        for (const post of posts) {
          await hydrateEmployerPostApplicationsFromServer(post.id);
        }
      }
    }
  } catch {
    // Inbox hydrate is best-effort; WebSocket reconnect retries.
  }
}

export function useServerInboxPoll(role: PulseAffectedUserRole | null): void {
  useEffect(() => {
    if (!role || (role !== "employee" && role !== "employer")) return;
    if (!AUTH_BACKEND_ENABLED || !isNotificationsApiSyncEnabled()) return;

    let closed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer = 0;
    let attempt = 0;

    const hydrate = () => {
      void pollServerInbox(role);
    };

    const connect = () => {
      if (closed) return;
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const url = `${proto}//${window.location.host}/v1/jobmitra/realtime/pulse`;
      try {
        socket = new WebSocket(url);
      } catch {
        scheduleReconnect();
        return;
      }
      socket.onopen = () => {
        attempt = 0;
        hydrate();
      };
      socket.onmessage = () => {
        hydrate();
      };
      socket.onerror = () => {
        socket?.close();
      };
      socket.onclose = () => {
        socket = null;
        if (!closed) scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      window.clearTimeout(reconnectTimer);
      const delay = Math.min(15_000, 500 * 2 ** Math.min(attempt, 5));
      attempt += 1;
      reconnectTimer = window.setTimeout(connect, delay);
    };

    hydrate();
    connect();
    const onWake = () => hydrate();
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);
    return () => {
      closed = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [role]);
}
