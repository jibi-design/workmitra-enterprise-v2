/** Job Mitra | notificationsGateApi.service.ts | Phase 15 — Notifications DB gate */

import { getCurrentActorId, identityBridge } from "../../../../app/identity/identity.adapter";
import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import { apiService } from "../../../../shared/services/apiService";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";

const EMPLOYEE_NOTIF = "/v1/jobmitra/employee/notifications";
const EMPLOYER_NOTIF = "/v1/jobmitra/employer/notifications";

interface ApiEnvelope<T> {
  data: T;
  meta?: { requestId?: string };
}

export type ServerNotificationDto = {
  id: string;
  domain: string;
  eventType: string;
  title: string;
  body: string;
  route: string | null;
  isRead: boolean;
  createdAt: number;
  readAt: number | null;
  meta: Record<string, unknown>;
};

export function isNotificationsApiSyncEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asMs(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asNotification(value: unknown): ServerNotificationDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const title = typeof value.title === "string" ? value.title.trim() : "";
  if (!id || !title) return null;
  return {
    id,
    domain: typeof value.domain === "string" ? value.domain : "system",
    eventType: typeof value.eventType === "string" ? value.eventType : "",
    title,
    body: typeof value.body === "string" ? value.body : "",
    route: typeof value.route === "string" ? value.route : null,
    isRead: value.isRead === true,
    createdAt: asMs(value.createdAt),
    readAt: value.readAt == null ? null : asMs(value.readAt),
    meta: isRecord(value.meta) ? value.meta : {},
  };
}

function currentEmployeeMlId(): string | undefined {
  const legacy = employeeProfileStorage.get().uniqueId?.trim();
  const actor = getCurrentActorId("employee");
  if (actor.source === "auth" && actor.authUserId && legacy) {
    identityBridge.upsert("employee", legacy, actor.authUserId);
  }
  return legacy || undefined;
}

async function listInbox(prefix: string, mlId?: string): Promise<ServerNotificationDto[]> {
  const res = await apiService.get<ApiEnvelope<{ notifications: unknown }>>(
    prefix,
    mlId ? { ml_id: mlId } : undefined,
  );
  const raw = res.data.notifications;
  if (!Array.isArray(raw)) return [];
  return raw.map(asNotification).filter((n): n is ServerNotificationDto => n !== null);
}

export const notificationsGateApi = {
  async listMine(): Promise<ServerNotificationDto[]> {
    return listInbox(EMPLOYEE_NOTIF, currentEmployeeMlId());
  },

  async listEmployerInbox(): Promise<ServerNotificationDto[]> {
    return listInbox(EMPLOYER_NOTIF);
  },

  async markRead(notificationId: string): Promise<ServerNotificationDto> {
    const res = await apiService.patch<ApiEnvelope<{ notification: unknown }>>(
      `${EMPLOYEE_NOTIF}/${encodeURIComponent(notificationId)}/read`,
      {},
    );
    const mapped = asNotification(res.data.notification);
    if (!mapped) throw new Error("Invalid mark-read response");
    return mapped;
  },

  async markAllRead(): Promise<number> {
    const res = await apiService.post<ApiEnvelope<{ updated: number }>>(
      `${EMPLOYEE_NOTIF}/read-all`,
      {},
    );
    return typeof res.data.updated === "number" ? res.data.updated : 0;
  },

  async markEmployerRead(notificationId: string): Promise<ServerNotificationDto> {
    const res = await apiService.patch<ApiEnvelope<{ notification: unknown }>>(
      `${EMPLOYER_NOTIF}/${encodeURIComponent(notificationId)}/read`,
      {},
    );
    const mapped = asNotification(res.data.notification);
    if (!mapped) throw new Error("Invalid mark-read response");
    return mapped;
  },

  async markEmployerAllRead(): Promise<number> {
    const res = await apiService.post<ApiEnvelope<{ updated: number }>>(
      `${EMPLOYER_NOTIF}/read-all`,
      {},
    );
    return typeof res.data.updated === "number" ? res.data.updated : 0;
  },
};
