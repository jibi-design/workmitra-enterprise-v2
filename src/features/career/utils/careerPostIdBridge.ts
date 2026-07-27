/** Job Mitra | careerPostIdBridge.ts | src/features/career/utils/careerPostIdBridge.ts
 *
 * Maps localStorage career post ids ↔ server career_posts.id (UUID).
 */

import { isCareerServerUuid } from "./careerAppIdBridge";

const BRIDGE_KEY = "wm_career_post_id_bridge_v1";

type CareerPostIdBridgeMap = {
  localToServer: Record<string, string>;
  serverToLocal: Record<string, string>;
};

function emptyMap(): CareerPostIdBridgeMap {
  return { localToServer: {}, serverToLocal: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeStringMap(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== "string" || !k.trim()) continue;
    if (typeof v !== "string" || !v.trim()) continue;
    out[k.trim()] = v.trim();
  }
  return out;
}

export const careerPostIdBridge = {
  load(): CareerPostIdBridgeMap {
    try {
      const raw = localStorage.getItem(BRIDGE_KEY);
      if (!raw) return emptyMap();
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return emptyMap();
      return {
        localToServer: sanitizeStringMap(parsed.localToServer),
        serverToLocal: sanitizeStringMap(parsed.serverToLocal),
      };
    } catch {
      return emptyMap();
    }
  },

  save(map: CareerPostIdBridgeMap): void {
    try {
      localStorage.setItem(
        BRIDGE_KEY,
        JSON.stringify({
          localToServer: sanitizeStringMap(map.localToServer),
          serverToLocal: sanitizeStringMap(map.serverToLocal),
        }),
      );
    } catch {
      // demo-safe ignore
    }
  },

  upsert(localPostId: string, serverPostId: string): void {
    const local = localPostId.trim();
    const server = serverPostId.trim();
    if (!local || !server || !isCareerServerUuid(server)) return;

    const map = this.load();
    map.localToServer[local] = server;
    map.serverToLocal[server] = local;
    this.save(map);
  },

  resolveServerPostId(localOrServerId: string): string | null {
    const id = localOrServerId.trim();
    if (!id) return null;
    if (isCareerServerUuid(id)) return id;
    const mapped = this.load().localToServer[id];
    return mapped && isCareerServerUuid(mapped) ? mapped : null;
  },
};
