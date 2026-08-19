/** Job Mitra | shiftIdBridge.ts | src/features/shift/utils/shiftIdBridge.ts */

const POST_BRIDGE_KEY = "wm_shift_post_id_bridge_v1";
const APP_BRIDGE_KEY = "wm_shift_app_id_bridge_v1";
const WORKSPACE_BRIDGE_KEY = "wm_shift_workspace_id_bridge_v1";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isShiftServerUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

type BridgeMap = {
  localToServer: Record<string, string>;
  serverToLocal: Record<string, string>;
};

function emptyMap(): BridgeMap {
  return { localToServer: {}, serverToLocal: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitize(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k === "string" && k.trim() && typeof v === "string" && v.trim()) {
      out[k.trim()] = v.trim();
    }
  }
  return out;
}

function load(key: string): BridgeMap {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyMap();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return emptyMap();
    return {
      localToServer: sanitize(parsed.localToServer),
      serverToLocal: sanitize(parsed.serverToLocal),
    };
  } catch {
    return emptyMap();
  }
}

function save(key: string, map: BridgeMap): void {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        localToServer: sanitize(map.localToServer),
        serverToLocal: sanitize(map.serverToLocal),
      }),
    );
  } catch {
    // demo-safe
  }
}

function makeBridge(storageKey: string) {
  return {
    upsert(localId: string, serverId: string): void {
      const local = localId.trim();
      const server = serverId.trim();
      if (!local || !server || !isShiftServerUuid(server)) return;
      const map = load(storageKey);
      map.localToServer[local] = server;
      map.serverToLocal[server] = local;
      save(storageKey, map);
    },
    resolveServerId(localOrServer: string): string | null {
      const id = localOrServer.trim();
      if (!id) return null;
      if (isShiftServerUuid(id)) return id;
      const mapped = load(storageKey).localToServer[id];
      return mapped && isShiftServerUuid(mapped) ? mapped : null;
    },
    resolveLocalId(serverOrLocal: string): string | null {
      const id = serverOrLocal.trim();
      if (!id) return null;
      const mapped = load(storageKey).serverToLocal[id];
      if (mapped) return mapped;
      return isShiftServerUuid(id) ? null : id;
    },
    load(): BridgeMap {
      return load(storageKey);
    },
  };
}

export const shiftPostIdBridge = makeBridge(POST_BRIDGE_KEY);
export const shiftAppIdBridge = makeBridge(APP_BRIDGE_KEY);
export const shiftWorkspaceIdBridge = makeBridge(WORKSPACE_BRIDGE_KEY);

export function shiftPostIdsMatch(left: string, right: string): boolean {
  return bridgeIdsMatch(shiftPostIdBridge, left, right);
}

export function shiftAppIdsMatch(left: string, right: string): boolean {
  return bridgeIdsMatch(shiftAppIdBridge, left, right);
}

export function shiftWorkspaceIdsMatch(left: string, right: string): boolean {
  return bridgeIdsMatch(shiftWorkspaceIdBridge, left, right);
}

function bridgeIdsMatch(
  bridge: ReturnType<typeof makeBridge>,
  left: string,
  right: string,
): boolean {
  const a = left.trim();
  const b = right.trim();
  if (!a || !b) return false;
  if (a === b) return true;
  const aServer = bridge.resolveServerId(a);
  const bServer = bridge.resolveServerId(b);
  if (aServer && bServer && aServer === bServer) return true;
  const map = bridge.load();
  return (
    map.localToServer[a] === b ||
    map.localToServer[b] === a ||
    map.serverToLocal[a] === b ||
    map.serverToLocal[b] === a
  );
}

export function expandShiftPostIdAliases(postId: string): string[] {
  const id = postId.trim();
  if (!id) return [];
  const aliases = new Set<string>([id]);
  const server = shiftPostIdBridge.resolveServerId(id);
  if (server) aliases.add(server);
  const local = shiftPostIdBridge.load().serverToLocal[id];
  if (local) aliases.add(local);
  return [...aliases];
}
