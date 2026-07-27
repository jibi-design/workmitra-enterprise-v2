/** Job Mitra | workforceService.dualWrite.ts | Phase 17 dual-write operations */

import type {
  WorkforceGroup,
  WorkforceGroupMember,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  readGroups,
  readMembers,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";
import {
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import {
  workforceGroupService,
  type AnnouncementGroupPayload,
  type QuickGroupPayload,
} from "./workforceGroupService";
import { isWorkforceApiSyncEnabled, workforceGateApi } from "./workforceGateApi.service";
import {
  isUuid,
  mapGroupFromServer,
  mapMemberFromServer,
  writeGroups,
  writeMembers,
} from "./workforceService.mappers.helpers";

async function dualWriteCreatedGroup(
  localGroupId: string,
  priorGroups: WorkforceGroup[],
  priorMembers: WorkforceGroupMember[],
): Promise<{ success: boolean; groupId?: string; errors?: string[] }> {
  if (!isWorkforceApiSyncEnabled()) {
    return { success: true, groupId: localGroupId };
  }

  const group = readGroups(WF_GROUPS_KEY).find((g) => g.id === localGroupId);
  if (!group) {
    writeGroups(priorGroups);
    writeMembers(priorMembers);
    return { success: false, errors: ["Group missing after local write"] };
  }

  try {
    const serverGroup = await workforceGateApi.createGroup({
      name: group.name,
      description: `${group.date} ${group.time} @ ${group.location}`.trim(),
      status: group.status,
      details: { ...group, localId: localGroupId },
    });

    const members = readMembers(WF_MEMBERS_KEY).filter((m) => m.groupId === localGroupId);
    const serverMembers: WorkforceGroupMember[] = [];

    for (const member of members) {
      const created = await workforceGateApi.addMember(serverGroup.id, {
        employee_ml_id: member.employeeUniqueId,
        role: member.categoryId,
        status: member.status,
        details: { ...member, localId: member.id },
      });
      serverMembers.push(mapMemberFromServer(created));
    }

    const mappedGroup = mapGroupFromServer(serverGroup);
    const withoutLocalGroup = priorGroups.filter((g) => g.id !== localGroupId);
    const withoutLocalMembers = priorMembers.filter((m) => m.groupId !== localGroupId);

    writeGroups([mappedGroup, ...withoutLocalGroup]);
    writeMembers([...serverMembers, ...withoutLocalMembers]);

    return { success: true, groupId: mappedGroup.id };
  } catch (err) {
    writeGroups(priorGroups);
    writeMembers(priorMembers);
    return {
      success: false,
      errors: [err instanceof Error ? err.message : "Workforce API sync failed"],
    };
  }
}

export async function createQuickGroupDualWrite(
  payload: QuickGroupPayload,
): Promise<{ success: boolean; groupId?: string; errors?: string[] }> {
  const priorGroups = readGroups(WF_GROUPS_KEY);
  const priorMembers = readMembers(WF_MEMBERS_KEY);
  const result = workforceGroupService.createQuickGroup(payload);
  if (!result.success || !result.groupId) return result;
  return dualWriteCreatedGroup(result.groupId, priorGroups, priorMembers);
}

export async function createFromAnnouncementDualWrite(
  payload: AnnouncementGroupPayload,
): Promise<{ success: boolean; groupId?: string; errors?: string[] }> {
  const priorGroups = readGroups(WF_GROUPS_KEY);
  const priorMembers = readMembers(WF_MEMBERS_KEY);
  const result = workforceGroupService.createFromAnnouncement(payload);
  if (!result.success || !result.groupId) return result;
  return dualWriteCreatedGroup(result.groupId, priorGroups, priorMembers);
}

export async function updateGroupDualWrite(
  groupId: string,
  patch: { name?: string; status?: "active" | "completed" },
): Promise<boolean> {
  const priorGroups = readGroups(WF_GROUPS_KEY);
  const current = priorGroups.find((g) => g.id === groupId);
  if (!current) return false;

  const next: WorkforceGroup = {
    ...current,
    name: patch.name?.trim() || current.name,
    status: patch.status ?? current.status,
    completedAt: patch.status === "completed" ? Date.now() : current.completedAt,
  };
  writeGroups(priorGroups.map((g) => (g.id === groupId ? next : g)));

  if (!isWorkforceApiSyncEnabled()) return true;
  if (!isUuid(groupId)) {
    writeGroups(priorGroups);
    return false;
  }

  try {
    const server = await workforceGateApi.patchGroup(groupId, {
      name: next.name,
      status: next.status,
      details: { ...next },
    });
    const mapped = mapGroupFromServer(server);
    writeGroups(priorGroups.map((g) => (g.id === groupId ? mapped : g)));
    return true;
  } catch {
    writeGroups(priorGroups);
    return false;
  }
}

export async function addMemberDualWrite(
  groupId: string,
  member: Omit<WorkforceGroupMember, "id"> & { id?: string },
): Promise<WorkforceGroupMember | null> {
  const priorMembers = readMembers(WF_MEMBERS_KEY);
  const local: WorkforceGroupMember = {
    id: member.id ?? `wgm_${Date.now().toString(36)}`,
    groupId,
    staffId: member.staffId,
    employeeUniqueId: member.employeeUniqueId,
    employeeName: member.employeeName,
    categoryId: member.categoryId,
    assignedShiftIds: member.assignedShiftIds,
    status: member.status ?? "active",
  };
  writeMembers([local, ...priorMembers]);

  if (!isWorkforceApiSyncEnabled()) return local;
  if (!isUuid(groupId)) {
    writeMembers(priorMembers);
    return null;
  }

  try {
    const server = await workforceGateApi.addMember(groupId, {
      employee_ml_id: local.employeeUniqueId,
      role: local.categoryId,
      status: local.status,
      details: { ...local, localId: local.id },
    });
    const mapped = mapMemberFromServer(server);
    writeMembers([mapped, ...priorMembers.filter((m) => m.id !== local.id)]);
    return mapped;
  } catch {
    writeMembers(priorMembers);
    return null;
  }
}

export async function removeMemberDualWrite(groupId: string, memberId: string): Promise<boolean> {
  const priorMembers = readMembers(WF_MEMBERS_KEY);
  const next = priorMembers.filter((m) => m.id !== memberId);
  if (next.length === priorMembers.length) return false;
  writeMembers(next);

  if (!isWorkforceApiSyncEnabled()) return true;
  if (!isUuid(groupId) || !isUuid(memberId)) {
    writeMembers(priorMembers);
    return false;
  }

  try {
    await workforceGateApi.removeMember(groupId, memberId);
    return true;
  } catch {
    writeMembers(priorMembers);
    return false;
  }
}
