/** Resolve a live shift post UUID for workspace chat send. */

import { isShiftServerUuid, shiftPostIdBridge, shiftPostIdsMatch } from "../utils/shiftIdBridge";
import { ApiRequestError } from "../../../shared/services/apiService";
import { isLoosePostUuid, resolveServerPostId } from "./workspaceMessageMerge.helpers";

export type LocalPostHint = { id: string; jobName: string; startAt: number };
export type ServerPostHint = { id: string; job_name: string; start_at: string };

export function isApiPostId(value: string | null | undefined): value is string {
  return Boolean(value && (isShiftServerUuid(value) || isLoosePostUuid(value)));
}

export function pickServerPostId(input: {
  postId: string;
  localPosts: readonly LocalPostHint[];
  serverDtos: readonly ServerPostHint[];
  jobName?: string;
  startAt?: number;
}): string | null {
  const postId = input.postId.trim();
  if (!postId) return null;

  const direct = resolveServerPostId(postId);
  if (isApiPostId(direct)) return direct;

  for (const post of input.localPosts) {
    if (post.id !== postId && !shiftPostIdsMatch(post.id, postId)) continue;
    const mapped = resolveServerPostId(post.id);
    if (isApiPostId(mapped)) return mapped;
  }

  const local = input.localPosts.find((post) => post.id === postId);
  const jobName = (input.jobName ?? local?.jobName ?? "").trim();
  const startAt = input.startAt ?? local?.startAt;

  if (local) {
    for (const post of input.localPosts) {
      if (post.id === local.id || !isApiPostId(post.id)) continue;
      if (post.jobName !== local.jobName) continue;
      if (Math.abs(post.startAt - local.startAt) > 120_000) continue;
      return post.id;
    }
  }

  const named = jobName
    ? input.serverDtos.filter(
        (dto) => dto.job_name.trim().toLowerCase() === jobName.toLowerCase(),
      )
    : [];
  if (named.length === 1 && isApiPostId(named[0]?.id)) return named[0].id;
  if (typeof startAt === "number" && named.length > 1) {
    const close = named.find(
      (dto) => Math.abs(Date.parse(dto.start_at) - startAt) <= 120_000,
    );
    if (close && isApiPostId(close.id)) return close.id;
  }
  if (input.serverDtos.length === 1 && isApiPostId(input.serverDtos[0]?.id)) {
    return input.serverDtos[0].id;
  }
  return null;
}

export function pickServerPostIdFromApplications(
  postId: string,
  apps: readonly { id: string; postId: string }[],
): string | null {
  const wanted = postId.trim();
  for (const app of apps) {
    if (app.postId !== wanted && app.id !== wanted && !shiftPostIdsMatch(app.postId, wanted)) {
      continue;
    }
    const mapped = resolveServerPostId(app.postId);
    if (isApiPostId(mapped)) return mapped;
    if (isApiPostId(app.postId)) return app.postId;
  }
  const unique = [...new Set(apps.map((app) => app.postId).filter(isApiPostId))];
  return unique.length === 1 ? unique[0] : null;
}

export function rememberPostIdBridge(localId: string, serverId: string): void {
  if (localId && serverId && localId !== serverId && isApiPostId(serverId)) {
    shiftPostIdBridge.upsert(localId, serverId);
  }
}

export function formatWorkspaceSendError(error: unknown): string {
  if (error instanceof ApiRequestError && error.status === 429) {
    return "Too many requests right now. Wait a few seconds, then send again.";
  }
  if (error instanceof ApiRequestError && error.message.trim()) {
    return error.message.trim();
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return "Could not send the message. Try again in a few seconds.";
}
