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
    return shiftGateApi.confirm(serverPostId, serverAppId, workerMlId);
  },
};
