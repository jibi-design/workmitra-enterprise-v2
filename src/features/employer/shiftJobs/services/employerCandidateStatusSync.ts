import { AUTH_BACKEND_ENABLED } from "../../../../shared/config/authConfig";
import {
  isShiftServerUuid,
  shiftAppIdBridge,
  shiftPostIdBridge,
} from "../../../shift/utils/shiftIdBridge";
import { isShiftApiSyncEnabled, shiftGateApi } from "../../../shift/services/shiftGateApi.service";

export function syncEmployerCandidateStatusToServer(
  postId: string,
  appId: string,
  status: "shortlisted" | "waiting" | "rejected",
): void {
  if (!AUTH_BACKEND_ENABLED || !isShiftApiSyncEnabled()) return;
  const serverPost = shiftPostIdBridge.resolveServerId(postId);
  const serverApp = shiftAppIdBridge.resolveServerId(appId);
  if (!serverPost || !serverApp || !isShiftServerUuid(serverPost) || !isShiftServerUuid(serverApp)) {
    return;
  }
  void shiftGateApi.patchApplicationStatus(serverPost, serverApp, status).catch(() => {
    // Bell/pulse still arrive via server inbox poll when the write succeeds later.
  });
}
