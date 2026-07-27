// src/features/employer/workforceOps/services/workforceGroupMemberService.helpers.ts

import type {
  WorkforceGroupMember,
  WorkforceApplication,
  WorkforceStaff,
  WorkforceGroup,
  WorkforceActivityEntry,
  WorkforceActivityKind,
} from "../../../../shared/domains/workforce/types/workforceTypes";

import {
  WF_MEMBERS_KEY,
  WF_MEMBERS_CHANGED,
  WF_APPLICATIONS_KEY,
  WF_APPLICATIONS_CHANGED,
  WF_STAFF_KEY,
  WF_STAFF_CHANGED,
  WF_GROUPS_KEY,
  WF_ACTIVITY_KEY,
  WF_ACTIVITY_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

import {
  readMembers,
  readApplications,
  readStaff,
  readGroups,
  readActivity,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";

import { employeeNotificationPort } from "../../../../shared/notifications/employeeNotificationPort";

export function readAllMembers(): WorkforceGroupMember[] {
  return readMembers(WF_MEMBERS_KEY);
}

export function writeMembers(members: WorkforceGroupMember[]): void {
  safeWrite(WF_MEMBERS_KEY, members);
  safeDispatch(WF_MEMBERS_CHANGED);
}

export function readAllApplications(): WorkforceApplication[] {
  return readApplications(WF_APPLICATIONS_KEY);
}

export function writeApplications(apps: WorkforceApplication[]): void {
  safeWrite(WF_APPLICATIONS_KEY, apps);
  safeDispatch(WF_APPLICATIONS_CHANGED);
}

export function readAllStaff(): WorkforceStaff[] {
  return readStaff(WF_STAFF_KEY);
}

export function writeStaff(staff: WorkforceStaff[]): void {
  safeWrite(WF_STAFF_KEY, staff);
  safeDispatch(WF_STAFF_CHANGED);
}

export function readAllGroups(): WorkforceGroup[] {
  return readGroups(WF_GROUPS_KEY);
}

export function logActivity(kind: WorkforceActivityKind, title: string, body?: string): void {
  const existing = readActivity(WF_ACTIVITY_KEY);
  const entry: WorkforceActivityEntry = {
    id: uid("wa"),
    kind,
    title,
    body,
    createdAt: Date.now(),
  };
  safeWrite(WF_ACTIVITY_KEY, [entry, ...existing]);
  safeDispatch(WF_ACTIVITY_CHANGED);
}

export function pushEmployeeNotification(title: string, body: string, route?: string): void {
  employeeNotificationPort.pushWorkforce(title, body, route);
}

export { WF_MEMBERS_CHANGED, uid };
