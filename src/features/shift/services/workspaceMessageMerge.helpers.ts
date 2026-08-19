/** Merge server workspace events into a local workspace list. */

import {
  expandShiftPostIdAliases,
  isShiftServerUuid,
  shiftPostIdBridge,
  shiftPostIdsMatch,
} from "../utils/shiftIdBridge";

export type WorkspaceMessageDto = {
  id: string;
  postId: string;
  kind: "broadcast" | "direct";
  title: string;
  body: string;
  actorRole: "employee" | "employer";
  createdAt: number;
};

type WorkspaceLike = {
  postId: string;
  appId?: string;
  status?: string;
  lastActivityAt: number;
  unreadCount: number;
  updates: Array<{
    id: string;
    createdAt: number;
    kind: "system" | "broadcast" | "direct";
    title: string;
    body?: string;
  }>;
};

type LinkedApp = { id: string; postId: string };

const LOOSE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLoosePostUuid(value: string): boolean {
  return LOOSE_UUID.test(value.trim());
}

export function resolveServerPostId(postId: string): string | null {
  const trimmed = postId.trim();
  if (!trimmed) return null;
  if (isShiftServerUuid(trimmed) || isLoosePostUuid(trimmed)) return trimmed;
  const mapped = shiftPostIdBridge.resolveServerId(trimmed);
  if (mapped) return mapped;
  return null;
}

export function collectPostAliases(
  serverPostId: string,
  apps: readonly LinkedApp[] = [],
): Set<string> {
  const aliases = new Set(expandShiftPostIdAliases(serverPostId));
  aliases.add(serverPostId.trim());
  for (const app of apps) {
    if (shiftPostIdsMatch(app.postId, serverPostId) || aliases.has(app.postId)) {
      for (const alias of expandShiftPostIdAliases(app.postId)) aliases.add(alias);
      aliases.add(app.postId);
    }
  }
  return aliases;
}

function workspaceMatchesAliases(
  workspace: WorkspaceLike,
  aliases: Set<string>,
  apps: readonly LinkedApp[],
): boolean {
  if (aliases.has(workspace.postId)) return true;
  for (const alias of aliases) {
    if (shiftPostIdsMatch(workspace.postId, alias)) return true;
  }
  if (!workspace.appId) return false;
  return apps.some((app) => {
    if (app.id !== workspace.appId) return false;
    if (aliases.has(app.postId)) return true;
    return [...aliases].some((alias) => shiftPostIdsMatch(app.postId, alias));
  });
}

function mapMessage(message: WorkspaceMessageDto): WorkspaceLike["updates"][number] {
  const title =
    message.actorRole === "employee" && message.kind === "direct"
      ? "Reply (Employee)"
      : message.actorRole === "employer" && message.kind === "direct"
        ? "Reply (Employer)"
        : message.title;
  const base = {
    id: message.id,
    createdAt: message.createdAt,
    kind: message.kind,
    title,
  };
  return message.body ? { ...base, body: message.body } : base;
}

export function mergeWorkspaceMessages<T extends WorkspaceLike>(
  workspaces: readonly T[],
  serverPostId: string,
  messages: readonly WorkspaceMessageDto[],
  apps: readonly LinkedApp[] = [],
): T[] {
  if (messages.length === 0) return [...workspaces];
  const aliases = collectPostAliases(serverPostId, apps);
  let matched = false;

  const next = workspaces.map((workspace) => {
    if (!workspaceMatchesAliases(workspace, aliases, apps)) return workspace;
    matched = true;
    const existingIds = new Set(workspace.updates.map((update) => update.id));
    const incoming = messages.filter((message) => !existingIds.has(message.id));
    if (incoming.length === 0) return workspace;
    const latest = incoming.reduce((max, message) => Math.max(max, message.createdAt), 0);
    return {
      ...workspace,
      updates: [...incoming.map(mapMessage), ...workspace.updates]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50),
      lastActivityAt: Math.max(workspace.lastActivityAt, latest),
      unreadCount: workspace.unreadCount + incoming.length,
    };
  });

  if (matched) return next;

  const live = next.filter(
    (workspace) => workspace.status === "active" || workspace.status === "upcoming" || !workspace.status,
  );
  if (live.length !== 1) return next;

  const only = live[0];
  const existingIds = new Set(only.updates.map((update) => update.id));
  const incoming = messages.filter((message) => !existingIds.has(message.id));
  if (incoming.length === 0) return next;
  const latest = incoming.reduce((max, message) => Math.max(max, message.createdAt), 0);
  return next.map((workspace) =>
    workspace === only
      ? {
          ...workspace,
          updates: [...incoming.map(mapMessage), ...workspace.updates]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 50),
          lastActivityAt: Math.max(workspace.lastActivityAt, latest),
          unreadCount: workspace.unreadCount + incoming.length,
        }
      : workspace,
  );
}

export function mergeAllWorkspaceMessages<T extends WorkspaceLike>(
  workspaces: readonly T[],
  messages: readonly WorkspaceMessageDto[],
  apps: readonly LinkedApp[] = [],
): T[] {
  const byPost = new Map<string, WorkspaceMessageDto[]>();
  for (const message of messages) {
    const list = byPost.get(message.postId) ?? [];
    list.push(message);
    byPost.set(message.postId, list);
  }
  let next = [...workspaces];
  for (const [postId, group] of byPost) {
    next = mergeWorkspaceMessages(next, postId, group, apps);
  }
  return next;
}
