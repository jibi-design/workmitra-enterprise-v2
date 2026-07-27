// src/features/employer/workforceOps/services/workforceGroupService.helpers.ts

import type {
  WorkforceGroup,
  WorkforceAnnouncement,
  WorkforceStaff,
  WorkforceGroupMember,
  AnnouncementShift,
  WorkforceActivityEntry,
  WorkforceActivityKind,
} from "../../../../shared/domains/workforce/types/workforceTypes";

import {
  WF_GROUPS_KEY,
  WF_GROUPS_CHANGED,
  WF_MEMBERS_KEY,
  WF_MEMBERS_CHANGED,
  WF_ACTIVITY_KEY,
  WF_ACTIVITY_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

import {
  readGroups,
  readMembers,
  readActivity,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";

export type QuickGroupPayload = {
  name: string;
  date: string;
  time: string;
  location: string;
  shifts: AnnouncementShift[];
  autoReplace: boolean;
  selectedStaff: WorkforceStaff[];
  categoryPerStaff: Record<string, string>;
  shiftIdsPerStaff: Record<string, string[]>;
};

export type AnnouncementGroupPayload = {
  announcement: WorkforceAnnouncement;
  confirmedMembers: Array<{
    staffId: string;
    employeeUniqueId: string;
    employeeName: string;
    categoryId: string;
    assignedShiftIds: string[];
  }>;
};

export function read(): WorkforceGroup[] {
  return readGroups(WF_GROUPS_KEY);
}

export function write(groups: WorkforceGroup[]): void {
  safeWrite(WF_GROUPS_KEY, groups);
  safeDispatch(WF_GROUPS_CHANGED);
}

export function readAllMembers(): WorkforceGroupMember[] {
  return readMembers(WF_MEMBERS_KEY);
}

export function writeMembers(members: WorkforceGroupMember[]): void {
  safeWrite(WF_MEMBERS_KEY, members);
  safeDispatch(WF_MEMBERS_CHANGED);
}

export function logActivity(
  kind: WorkforceActivityKind,
  title: string,
  body?: string,
  route?: string,
): void {
  const existing = readActivity(WF_ACTIVITY_KEY);
  const entry: WorkforceActivityEntry = {
    id: uid("wa"),
    kind,
    title,
    body,
    createdAt: Date.now(),
    route,
  };
  safeWrite(WF_ACTIVITY_KEY, [entry, ...existing]);
  safeDispatch(WF_ACTIVITY_CHANGED);
}

export { WF_GROUPS_CHANGED, WF_MEMBERS_CHANGED, uid };
