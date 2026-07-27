import { workforceGroupService } from "../services/workforceGroupService";
import type { WorkforceGroup } from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  WF_GROUPS_CHANGED,
  WF_MEMBERS_CHANGED,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

export type GroupsSnapshot = {
  groups: WorkforceGroup[];
  memberCounts: Map<string, number>;
  ver: number;
};

let snapCache: GroupsSnapshot | null = null;
let snapVer = 0;

export function getWorkforceGroupsSnapshot(): GroupsSnapshot {
  if (snapCache && snapCache.ver === snapVer) return snapCache;
  const groups = workforceGroupService.getAll();
  const memberCounts = new Map<string, number>();
  for (const g of groups) {
    memberCounts.set(g.id, workforceGroupService.countMembersForGroup(g.id));
  }
  snapCache = { groups, memberCounts, ver: snapVer };
  return snapCache;
}

export function subscribeWorkforceGroups(cb: () => void): () => void {
  const events = [WF_GROUPS_CHANGED, WF_MEMBERS_CHANGED];
  const handler = () => {
    snapVer++;
    snapCache = null;
    cb();
  };
  for (const e of events) window.addEventListener(e, handler);
  window.addEventListener("storage", handler);
  return () => {
    for (const e of events) window.removeEventListener(e, handler);
    window.removeEventListener("storage", handler);
  };
}
