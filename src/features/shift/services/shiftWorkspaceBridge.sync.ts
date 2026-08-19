/** Job Mitra | shiftWorkspaceBridge.sync.ts | Persist local↔server workspace UUID */

import { shiftConfirmApi } from "../../employer/shiftJobs/services/shiftConfirmApi.service";
import {
  isShiftServerUuid,
  shiftAppIdBridge,
  shiftPostIdBridge,
  shiftWorkspaceIdBridge,
} from "../utils/shiftIdBridge";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function rememberShiftWorkspaceId(localWorkspaceId: string, serverWorkspaceId: string): void {
  shiftWorkspaceIdBridge.upsert(localWorkspaceId, serverWorkspaceId);
}

function uuidFromPayload(workspace: unknown): string | null {
  if (!isRecord(workspace)) return null;
  const id = workspace.id;
  return typeof id === "string" && isShiftServerUuid(id) ? id : null;
}

export async function resolveServerWorkspaceUuid(input: {
  localWorkspaceId?: string;
  postId: string;
  appId?: string;
  confirmPayload?: { workspace?: unknown };
}): Promise<string | null> {
  const local = input.localWorkspaceId?.trim() ?? "";
  const fromPayload = uuidFromPayload(input.confirmPayload?.workspace);
  if (fromPayload) {
    if (local) rememberShiftWorkspaceId(local, fromPayload);
    return fromPayload;
  }
  if (local && isShiftServerUuid(local)) {
    rememberShiftWorkspaceId(local, local);
    return local;
  }
  if (local) {
    const mapped = shiftWorkspaceIdBridge.resolveServerId(local);
    if (mapped && mapped !== local) return mapped;
  }
  const postId = shiftPostIdBridge.resolveServerId(input.postId) ?? input.postId.trim();
  const appId = shiftAppIdBridge.resolveServerId(input.appId?.trim() ?? "") ?? input.appId?.trim() ?? "";
  if (!isShiftServerUuid(postId) || !isShiftServerUuid(appId)) return null;
  try {
    const workspace = await shiftConfirmApi.getWorkspace(postId, appId);
    if (!isShiftServerUuid(workspace.id)) return null;
    if (local) rememberShiftWorkspaceId(local, workspace.id);
    return workspace.id;
  } catch {
    return null;
  }
}

export async function syncShiftWorkspaceIdBridge(
  localWorkspaceId: string,
  postId: string,
  appId: string,
  confirmPayload?: { workspace?: unknown },
): Promise<string | null> {
  return resolveServerWorkspaceUuid({
    localWorkspaceId,
    postId,
    appId,
    confirmPayload,
  });
}
