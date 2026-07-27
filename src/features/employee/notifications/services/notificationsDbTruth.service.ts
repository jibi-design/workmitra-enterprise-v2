/** Job Mitra | notificationsDbTruth.service.ts | Phase 15 — hydrate DB → LS cache */

import type {
  EmployeeNotification,
  EmployeeNotificationDomain,
} from "../storage/employeeNotifications.storage";
import {
  isNotificationsApiSyncEnabled,
  notificationsGateApi,
  type ServerNotificationDto,
} from "./notificationsGateApi.service";

const VALID_DOMAINS: readonly EmployeeNotificationDomain[] = [
  "shift",
  "career",
  "workforce",
  "employment",
] as const;

function mapDomain(raw: string): EmployeeNotificationDomain {
  if ((VALID_DOMAINS as readonly string[]).includes(raw)) {
    return raw as EmployeeNotificationDomain;
  }
  return "employment";
}

function mapServerToLocal(n: ServerNotificationDto): EmployeeNotification {
  return {
    id: n.id,
    domain: mapDomain(n.domain),
    title: n.title,
    body: n.body || undefined,
    createdAt: n.createdAt || Date.now(),
    isRead: n.isRead,
    route: n.route || undefined,
  };
}

/**
 * Server-authoritative hydrate into LS cache.
 * Keeps local-only items (non-UUID ids from auth-off writers) merged in.
 */
export async function hydrateEmployeeNotificationsFromDb(
  writeLocal: (list: EmployeeNotification[]) => void,
  readLocal: () => EmployeeNotification[],
): Promise<EmployeeNotification[]> {
  if (!isNotificationsApiSyncEnabled()) {
    return readLocal();
  }

  try {
    const server = await notificationsGateApi.listMine();
    const serverMapped = server.map(mapServerToLocal);
    const serverIds = new Set(serverMapped.map((n) => n.id));

    const localOnly = readLocal().filter((n) => {
      // Keep demo/local-generated ids that are not server UUIDs
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(n.id);
      return !isUuid && !serverIds.has(n.id);
    });

    const merged = [...serverMapped, ...localOnly].sort((a, b) => b.createdAt - a.createdAt);
    writeLocal(merged);
    return merged;
  } catch {
    return readLocal();
  }
}

export function mapServerNotificationToLocal(n: ServerNotificationDto): EmployeeNotification {
  return mapServerToLocal(n);
}
