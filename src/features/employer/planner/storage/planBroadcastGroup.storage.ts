// Job Mitra | planBroadcastGroup.storage.ts | Mega Workspace Merge (BCC fan-out layer)

import { plannerDispatchChanged, plannerReadJson, plannerWriteJson } from "./plannerSafeStorage";

export type PlanBroadcastGroup = {
  id: string;
  planId: string;
  planName: string;
  companyName: string;
  memberWorkspaceIds: string[];
  memberWorkerWmIds: string[];
  createdAt: number;
  updatedAt: number;
  schemaVersion: 1;
};

const KEY = "wm_planner_broadcast_groups_v1";
const CHANGED = "wm:planner-broadcast-groups-changed";

function readAll(): PlanBroadcastGroup[] {
  return plannerReadJson<PlanBroadcastGroup[]>(KEY, []);
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
      memberWorkerWmIds: [],
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

  enrollWorkspace(planId: string, workspaceId: string, workerWmId: string): boolean {
    const wmKey = workerWmId.trim().toUpperCase();
    if (!wmKey || !workspaceId) return false;

    const all = readAll();
    const idx = all.findIndex((g) => g.planId === planId);
    if (idx < 0) return false;

    const group = all[idx];
    const workspaceIds = group.memberWorkspaceIds.includes(workspaceId)
      ? group.memberWorkspaceIds
      : [...group.memberWorkspaceIds, workspaceId];

    const workerIds = group.memberWorkerWmIds.includes(wmKey)
      ? group.memberWorkerWmIds
      : [...group.memberWorkerWmIds, wmKey];

    all[idx] = {
      ...group,
      memberWorkspaceIds: workspaceIds,
      memberWorkerWmIds: workerIds,
      updatedAt: Date.now(),
    };

    return writeAll(all);
  },

  unenrollWorkspace(planId: string, workspaceId: string, workerWmId: string): void {
    const wmKey = workerWmId.trim().toUpperCase();
    const all = readAll();
    const idx = all.findIndex((g) => g.planId === planId);
    if (idx < 0) return;

    const group = all[idx];
    all[idx] = {
      ...group,
      memberWorkspaceIds: group.memberWorkspaceIds.filter((id) => id !== workspaceId),
      memberWorkerWmIds: group.memberWorkerWmIds.filter((id) => id !== wmKey),
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
