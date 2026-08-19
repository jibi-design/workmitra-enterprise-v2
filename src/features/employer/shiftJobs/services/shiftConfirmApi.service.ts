/** Job Mitra | shiftConfirmApi.service.ts — Phase 13 re-export compatibility */

import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import {
  isShiftServerUuid,
  shiftAppIdBridge,
  shiftPostIdBridge,
} from "../../../shift/utils/shiftIdBridge";
import { shiftGateApi } from "../../../shift/services/shiftGateApi.service";

export function isShiftConfirmApiEnabled(): boolean {
  return AUTH_BACKEND_ENABLED;
}

export function canSyncShiftConfirmIds(postId: string, appId: string): boolean {
  const serverPost = shiftPostIdBridge.resolveServerId(postId);
  const serverApp = shiftAppIdBridge.resolveServerId(appId);
  return Boolean(
    serverPost && serverApp && isShiftServerUuid(serverPost) && isShiftServerUuid(serverApp),
  );
}

export function buildShiftConfirmIdempotencyKey(postId: string, appId: string): string {
  const serverPostId = shiftPostIdBridge.resolveServerId(postId) ?? postId;
  const serverAppId = shiftAppIdBridge.resolveServerId(appId) ?? appId;
  return `shift-confirm:${serverPostId}:${serverAppId}`;
}

/** Heal local ids → server post/app UUIDs before confirm/reviews. */
export async function ensureConfirmServerIds(
  postId: string,
  appId: string,
  jobName = "",
): Promise<boolean> {
  if (canSyncShiftConfirmIds(postId, appId)) return true;
  let serverPost = shiftPostIdBridge.resolveServerId(postId);
  if (!serverPost || !isShiftServerUuid(serverPost)) {
    try {
      const posts = await shiftGateApi.listMyPosts();
      const named = jobName.trim();
      const hit = named
        ? posts.find((row) => row.job_name === named)
        : posts.find((row) => row.id === postId);
      if (hit && isShiftServerUuid(hit.id)) {
        shiftPostIdBridge.upsert(postId, hit.id);
        serverPost = hit.id;
      }
    } catch {
      return false;
    }
  }
  if (!serverPost || !isShiftServerUuid(serverPost)) return false;
  try {
    const apps = await shiftGateApi.listPostApplications(serverPost);
    const exact = apps.find((row) => row.id === appId);
    if (exact) {
      shiftAppIdBridge.upsert(appId, exact.id);
      return true;
    }
    const open = apps.filter(
      (row) => row.status === "applied" || row.status === "shortlisted" || row.status === "waiting",
    );
    const pick = open[0] ?? (apps.length === 1 ? apps[0] : undefined);
    if (pick) shiftAppIdBridge.upsert(appId, pick.id);
  } catch {
    return false;
  }
  return canSyncShiftConfirmIds(postId, appId);
}

export type ShiftConfirmApiResult = {
  workspace: unknown;
  events: unknown[];
};

export const shiftConfirmApi = {
  async confirm(
    postId: string,
    appId: string,
    workerMlId?: string,
  ): Promise<ShiftConfirmApiResult> {
    const serverPostId = shiftPostIdBridge.resolveServerId(postId) ?? postId;
    const serverAppId = shiftAppIdBridge.resolveServerId(appId) ?? appId;
    return shiftGateApi.confirm(serverPostId, serverAppId, workerMlId, {
      idempotencyKey: buildShiftConfirmIdempotencyKey(postId, appId),
    });
  },

  /** Wave-4 heal: verify server workspace after timeout / ALREADY_CONFIRMED */
  async getWorkspace(
    postId: string,
    appId: string,
  ): Promise<{
    id: string;
    post_id: string;
    app_id: string;
    worker_wm_id: string;
    status: string;
  }> {
    const serverPostId = shiftPostIdBridge.resolveServerId(postId) ?? postId;
    const serverAppId = shiftAppIdBridge.resolveServerId(appId) ?? appId;
    return shiftGateApi.getWorkspace(serverPostId, serverAppId);
  },
};
