/** Job Mitra | workforceService.ts | Phase 17 — Workforce DB hydrate + dual-write */

import {
  readGroups,
  readMembers,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import {
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import type { AnnouncementGroupPayload, QuickGroupPayload } from "./workforceGroupService";
import { isWorkforceApiSyncEnabled, workforceGateApi } from "./workforceGateApi.service";
import {
  isUuid,
  mapGroupFromServer,
  mapMemberFromServer,
  writeGroups,
  writeMembers,
} from "./workforceService.mappers.helpers";
import {
  addMemberDualWrite,
  createFromAnnouncementDualWrite,
  createQuickGroupDualWrite,
  removeMemberDualWrite,
  updateGroupDualWrite,
} from "./workforceService.dualWrite";

export async function hydrateWorkforceGroupsFromDb() {
  if (!isWorkforceApiSyncEnabled()) return readGroups(WF_GROUPS_KEY);

  try {
    const rows = await workforceGateApi.listGroups();
    const mapped = rows.map(mapGroupFromServer);
    const local = readGroups(WF_GROUPS_KEY);
    const byId = new Set(mapped.map((g) => g.id));
    const localOnly = local.filter((g) => !isUuid(g.id) && !byId.has(g.id));
    const merged = [...mapped, ...localOnly];
    writeGroups(merged);
    return merged;
  } catch {
    return readGroups(WF_GROUPS_KEY);
  }
}

export async function hydrateWorkforceMembersFromDb(groupId: string) {
  if (!isWorkforceApiSyncEnabled()) {
    return readMembers(WF_MEMBERS_KEY).filter((m) => m.groupId === groupId);
  }

  if (!isUuid(groupId)) {
    return readMembers(WF_MEMBERS_KEY).filter((m) => m.groupId === groupId);
  }

  try {
    const rows = await workforceGateApi.listMembers(groupId);
    const mapped = rows.map(mapMemberFromServer);
    const all = readMembers(WF_MEMBERS_KEY);
    const other = all.filter((m) => m.groupId !== groupId);
    const localOnly = all.filter(
      (m) => m.groupId === groupId && !isUuid(m.id) && !mapped.some((x) => x.id === m.id),
    );
    writeMembers([...mapped, ...localOnly, ...other]);
    return [...mapped, ...localOnly];
  } catch {
    return readMembers(WF_MEMBERS_KEY).filter((m) => m.groupId === groupId);
  }
}

export const workforceService = {
  hydrateGroups: hydrateWorkforceGroupsFromDb,
  hydrateMembers: hydrateWorkforceMembersFromDb,
  createQuickGroup: createQuickGroupDualWrite,
  createFromAnnouncement: createFromAnnouncementDualWrite,
  updateGroup: updateGroupDualWrite,
  addMember: addMemberDualWrite,
  removeMember: removeMemberDualWrite,
  isSyncEnabled: isWorkforceApiSyncEnabled,
};

export type { AnnouncementGroupPayload, QuickGroupPayload };
