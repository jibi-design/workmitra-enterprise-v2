/**
 * Job Mitra | Phase 3 Calling — gate API client
 * Path: src/features/shared/calling/callingGateApi.service.ts
 */

import { AUTH_BACKEND_ENABLED } from "../../../shared/config/authConfig";
import { apiService } from "../../../shared/services/apiService";
import type { CallSessionDto } from "./calling.types";

const CALL_PREFIX = "/v1/jobmitra/call";

type ApiEnvelope<T> = { data: T; meta?: { requestId?: string } };

type AgoraPayload = {
  appId: string;
  channelId: string;
  token: string;
  uid: number;
  role: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asSession(value: unknown): CallSessionDto | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const workspaceId = typeof value.workspaceId === "string" ? value.workspaceId.trim() : "";
  const channelId = typeof value.channelId === "string" ? value.channelId.trim() : "";
  if (!id || !workspaceId || !channelId) return null;
  return {
    id,
    workspaceId,
    channelId,
    initiatorMl: typeof value.initiatorMl === "string" ? value.initiatorMl : "",
    receiverMl: typeof value.receiverMl === "string" ? value.receiverMl : "",
    status: typeof value.status === "string" ? value.status : "",
    startedAt: typeof value.startedAt === "string" ? value.startedAt : "",
    answeredAt: typeof value.answeredAt === "string" ? value.answeredAt : null,
    endedAt: typeof value.endedAt === "string" ? value.endedAt : null,
  };
}

function asAgora(value: unknown): AgoraPayload | null {
  if (!isRecord(value)) return null;
  const channelId = typeof value.channelId === "string" ? value.channelId.trim() : "";
  const token = typeof value.token === "string" ? value.token.trim() : "";
  const appId = typeof value.appId === "string" ? value.appId.trim() : "";
  const uid = typeof value.uid === "number" ? value.uid : Number(value.uid);
  if (!channelId || !token || !appId || !Number.isFinite(uid)) return null;
  return {
    appId,
    channelId,
    token,
    uid: Math.floor(uid),
    role: typeof value.role === "string" ? value.role : "publisher",
  };
}

export function isCallingApiEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export const callingGateApi = {
  async initiate(body: {
    workspaceId: string;
    initiatorMl: string;
    receiverMl: string;
    fcmToken?: string;
    uid?: number;
  }): Promise<{ session: CallSessionDto; agora: AgoraPayload }> {
    const res = await apiService.post<ApiEnvelope<{ session: unknown; agora: unknown }>>(
      `${CALL_PREFIX}/initiate`,
      body,
    );
    const session = asSession(res.data.session);
    const agora = asAgora(res.data.agora);
    if (!session || !agora) throw new Error("Invalid initiate call response");
    return { session, agora };
  },

  async answer(body: {
    callSessionId: string;
    partyMl: string;
    uid?: number;
  }): Promise<{ session: CallSessionDto; agora: AgoraPayload }> {
    const res = await apiService.post<ApiEnvelope<{ session: unknown; agora: unknown }>>(
      `${CALL_PREFIX}/answer`,
      body,
    );
    const session = asSession(res.data.session);
    const agora = asAgora(res.data.agora);
    if (!session || !agora) throw new Error("Invalid answer call response");
    return { session, agora };
  },

  async end(body: {
    callSessionId: string;
    partyMl: string;
    status?: "ended" | "declined" | "failed";
  }): Promise<CallSessionDto> {
    const res = await apiService.post<ApiEnvelope<{ session: unknown }>>(
      `${CALL_PREFIX}/end`,
      body,
    );
    const session = asSession(res.data.session);
    if (!session) throw new Error("Invalid end call response");
    return session;
  },

  async fallback(body: {
    callSessionId: string;
    partyMl: string;
    toE164: string;
  }): Promise<{ session: CallSessionDto | null; twilioCallSid: string }> {
    const res = await apiService.post<ApiEnvelope<{ session: unknown; twilioCallSid: string }>>(
      `${CALL_PREFIX}/fallback`,
      body,
    );
    return {
      session: asSession(res.data.session),
      twilioCallSid: String(res.data.twilioCallSid ?? ""),
    };
  },
};
