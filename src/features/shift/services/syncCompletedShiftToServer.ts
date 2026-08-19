/** Job Mitra | syncCompletedShiftToServer.ts | PATCH post + complete workspace UUID */

import { enqueueShiftRetry } from "../../../shared/shift/shiftRetryQueue";
import type { ShiftWorkspace } from "../../employer/shiftJobs/types/shiftWorkspaceTypes";
import { completeShiftWorkspace } from "./shiftGateApi.reviews";
import { isShiftApiSyncEnabled, shiftGateApi } from "./shiftGateApi.service";
import { syncShiftWorkspaceIdBridge } from "./shiftWorkspaceBridge.sync";
import {
  isShiftServerUuid,
  shiftPostIdBridge,
  shiftWorkspaceIdBridge,
} from "../utils/shiftIdBridge";

export async function syncCompletedShiftToServer(
  workspace: ShiftWorkspace,
  postCompleted: boolean,
): Promise<void> {
  if (!isShiftApiSyncEnabled()) return;

  const serverPostId = shiftPostIdBridge.resolveServerId(workspace.postId);
  const serverWorkspaceId =
    shiftWorkspaceIdBridge.resolveServerId(workspace.id) ??
    (await syncShiftWorkspaceIdBridge(workspace.id, workspace.postId, workspace.appId ?? ""));

  try {
    if (serverWorkspaceId && isShiftServerUuid(serverWorkspaceId)) {
      await completeShiftWorkspace(serverWorkspaceId);
    } else if (import.meta.env.PROD) {
      enqueueShiftRetry("post_complete_side_effect", {
        workspaceId: workspace.id,
        step: "complete_workspace_missing_uuid",
      });
    }

    if (postCompleted && serverPostId) {
      await shiftGateApi.updatePost(serverPostId, { status: "completed" });
    } else if (postCompleted && import.meta.env.PROD && !serverPostId) {
      enqueueShiftRetry("post_complete_side_effect", {
        postId: workspace.postId,
        step: "complete_post_missing_uuid",
      });
    }
  } catch {
    enqueueShiftRetry("post_complete_side_effect", {
      workspaceId: workspace.id,
      postId: workspace.postId,
      step: "complete_api",
    });
  }
}
