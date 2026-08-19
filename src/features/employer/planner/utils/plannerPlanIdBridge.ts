/** Maps local dp_* DemandPlan ids ↔ planner_plans.id (UUID). */

const BRIDGE_KEY = "wm_planner_plan_id_bridge_v1";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPlannerServerUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

type PlannerPlanIdBridgeMap = {
  localToServer: Record<string, string>;
  serverToLocal: Record<string, string>;
};

function emptyMap(): PlannerPlanIdBridgeMap {
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

export const plannerPlanIdBridge = {
  load(): PlannerPlanIdBridgeMap {
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

  save(map: PlannerPlanIdBridgeMap): void {
    try {
      localStorage.setItem(
        BRIDGE_KEY,
        JSON.stringify({
          localToServer: sanitizeStringMap(map.localToServer),
          serverToLocal: sanitizeStringMap(map.serverToLocal),
        }),
      );
    } catch {
      /* demo-safe */
    }
  },

  upsert(localPlanId: string, serverPlanId: string): void {
    const local = localPlanId.trim();
    const server = serverPlanId.trim();
    if (!local || !server || !isPlannerServerUuid(server)) return;
    const map = this.load();
    map.localToServer[local] = server;
    map.serverToLocal[server] = local;
    this.save(map);
  },

  resolveServerPlanId(localOrServerId: string): string | null {
    const id = localOrServerId.trim();
    if (!id) return null;
    if (isPlannerServerUuid(id)) return id;
    const mapped = this.load().localToServer[id];
    return mapped && isPlannerServerUuid(mapped) ? mapped : null;
  },
};
