// Job Mitra | planBroadcastGroup.storage.ts | Mega Workspace Merge (BCC fan-out layer)

import { plannerDispatchChanged, plannerReadJson, plannerWriteJson } from "./plannerSafeStorage";

export type PlanBroadcastGroup = {
  id: string;
  planId: string;
  planName: string;
  companyName: string;
  memberWorkspaceIds: string[];
  memberWorkerMlIds: string[];
  createdAt: number;
  updatedAt: number;
  schemaVersion: 1;
};

const KEY = "wm_planner_broadcast_groups_v1";
const CHANGED = "wm:planner-broadcast-groups-changed";

function normalizeGroup(raw: unknown): PlanBroadcastGroup | null {
  if (typeof raw !== "object" || raw === null) return null;
  const rec = raw as Record<string, unknown> & PlanBroadcastGroup;
  const legacyWm = (rec as Record<string, unknown>).memberWorkerWmIds;
  const memberWorkerMlIds = Array.isArray(rec.memberWorkerMlIds)
    ? rec.memberWorkerMlIds.filter((id): id is string => typeof id === "string")
    : Array.isArray(legacyWm)
      ? legacyWm.filter((id): id is string => typeof id === "string")
      : [];
  return {
    ...rec,
    memberWorkerMlIds,
  };
}

function readAll(): PlanBroadcastGroup[] {
  const raw = plannerReadJson<unknown[]>(KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeGroup).filter((g): g is PlanBroadcastGroup => g !== null);
}

function writeAll(groups: PlanBroadcastGroup[]): boolean {
  if (plannerWriteJson(KEY, groups)) {
    plannerDispatchChanged(CHANGED);
    return true;
  }
  return false;
}

export const planBroadcastGroupStorage = {
  CHANGED_EVENT: CHANGED,

  ensureGroup(planId: string, planName: string, companyName: string): PlanBroadcastGroup {
    const existing = readAll().find((g) => g.planId === planId);
    if (existing) return existing;

    const now = Date.now();
    const group: PlanBroadcastGroup = {
      id: `pbg_${planId}`,
      planId,
      planName,
      companyName,
      memberWorkspaceIds: [],
      memberWorkerMlIds: [],
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };

    writeAll([group, ...readAll()]);
    return group;
  },

  getByPlanId(planId: string): PlanBroadcastGroup | null {
    return readAll().find((g) => g.planId === planId) ?? null;
  },

  enrollWorkspace(planId: string, workspaceId: string, workerMlId: string): boolean {
    const wmKey = workerMlId.trim().toUpperCase();
    if (!wmKey || !workspaceId) return false;

    const all = readAll();
    const idx = all.findIndex((g) => g.planId === planId);
    if (idx < 0) return false;

    const group = all[idx];
    const workspaceIds = group.memberWorkspaceIds.includes(workspaceId)
      ? group.memberWorkspaceIds
      : [...group.memberWorkspaceIds, workspaceId];

    const workerIds = group.memberWorkerMlIds.includes(wmKey)
      ? group.memberWorkerMlIds
      : [...group.memberWorkerMlIds, wmKey];

    all[idx] = {
      ...group,
      memberWorkspaceIds: workspaceIds,
      memberWorkerMlIds: workerIds,
      updatedAt: Date.now(),
    };

    return writeAll(all);
  },

  unenrollWorkspace(planId: string, workspaceId: string, workerMlId: string): void {
    const wmKey = workerMlId.trim().toUpperCase();
    const all = readAll();
    const idx = all.findIndex((g) => g.planId === planId);
    if (idx < 0) return;

    const group = all[idx];
    all[idx] = {
      ...group,
      memberWorkspaceIds: group.memberWorkspaceIds.filter((id) => id !== workspaceId),
      memberWorkerMlIds: group.memberWorkerMlIds.filter((id) => id !== wmKey),
      updatedAt: Date.now(),
    };

    writeAll(all);
  },

  getMemberWorkspaceIds(planId: string): string[] {
    return readAll().find((g) => g.planId === planId)?.memberWorkspaceIds ?? [];
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(CHANGED, handler);
    return () => window.removeEventListener(CHANGED, handler);
  },
} as const;
