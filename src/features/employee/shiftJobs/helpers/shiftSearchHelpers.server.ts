import { isShiftApiSyncEnabled, shiftGateApi } from "../../../shift/services/shiftGateApi.service";
import {
  isShiftServerUuid,
  shiftAppIdBridge,
  shiftPostIdBridge,
} from "../../../shift/utils/shiftIdBridge";

/** Auth-on helper: resolve bridges then GET employer workspace for an application. */
export async function loadEmployerShiftWorkspaceFromServer(
  localOrServerPostId: string,
  localOrServerAppId: string,
): Promise<{
  id: string;
  post_id: string;
  app_id: string;
  worker_wm_id: string;
  status: string;
} | null> {
  if (!isShiftApiSyncEnabled()) return null;
  const postId =
    shiftPostIdBridge.resolveServerId(localOrServerPostId) ??
    (isShiftServerUuid(localOrServerPostId) ? localOrServerPostId.trim() : null);
  const appId =
    shiftAppIdBridge.resolveServerId(localOrServerAppId) ??
    (isShiftServerUuid(localOrServerAppId) ? localOrServerAppId.trim() : null);
  if (!postId || !appId) return null;
  try {
    return await shiftGateApi.getWorkspace(postId, appId);
  } catch {
    return null;
  }
}
