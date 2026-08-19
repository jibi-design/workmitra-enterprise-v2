/** Job Mitra | persistShiftReviewToServer.ts | POST /shift/reviews with server workspace UUID only */

import { enqueueShiftRetry } from "../../../shared/shift/shiftRetryQueue";
import { submitShiftReview } from "./shiftGateApi.reviews";
import { resolveServerWorkspaceUuid } from "./shiftWorkspaceBridge.sync";
import { isShiftServerUuid, shiftAppIdBridge, shiftPostIdBridge } from "../utils/shiftIdBridge";

function readWorkspaceHint(
  postId: string,
  hintedId: string,
): { id: string; appId?: string } | null {
  if (typeof localStorage === "undefined") return hintedId ? { id: hintedId } : null;
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.includes("shift_workspaces_v1") || key.includes("__migrated")) continue;
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (!Array.isArray(parsed)) continue;
      const match = parsed.find((row) => {
        if (!row || typeof row !== "object") return false;
        const rec = row as { id?: string; postId?: string; appId?: string };
        if (hintedId && rec.id === hintedId) return true;
        return rec.postId === postId && typeof rec.id === "string";
      }) as { id: string; appId?: string } | undefined;
      if (match?.id) return match;
    }
  } catch {
    return hintedId ? { id: hintedId } : null;
  }
  return hintedId ? { id: hintedId } : null;
}

export async function persistShiftReviewToServer(input: {
  role: "employer" | "employee";
  workspaceId?: string;
  postId: string;
  appId?: string;
  rating: number;
  body?: string;
  revieweeUserId?: string;
}): Promise<void> {
  const hinted = readWorkspaceHint(input.postId, input.workspaceId?.trim() ?? "");
  const localWorkspaceId = hinted?.id ?? "";
  const appId = input.appId?.trim() || hinted?.appId || "";
  const serverWorkspaceId = await resolveServerWorkspaceUuid({
    localWorkspaceId,
    postId: input.postId,
    appId,
  });
  if (!serverWorkspaceId || !isShiftServerUuid(serverWorkspaceId)) {
    enqueueShiftRetry("rating_points", {
      workspaceId: localWorkspaceId,
      jobId: input.postId,
      step: "review_missing_server_uuid",
    });
    return;
  }

  try {
    await submitShiftReview(input.role, {
      workspaceId: serverWorkspaceId,
      jobPostId: shiftPostIdBridge.resolveServerId(input.postId) ?? undefined,
      appId: shiftAppIdBridge.resolveServerId(appId) ?? undefined,
      rating: input.rating,
      body: input.body,
      revieweeUserId: input.revieweeUserId,
    });
  } catch {
    enqueueShiftRetry("rating_points", {
      workspaceId: serverWorkspaceId,
      jobId: input.postId,
      step: "review_api",
    });
  }
}
