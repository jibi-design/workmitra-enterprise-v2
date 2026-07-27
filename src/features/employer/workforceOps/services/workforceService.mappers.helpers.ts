// src/features/employer/workforceOps/services/workforceService.mappers.helpers.ts

import type {
  WorkforceGroup,
  WorkforceGroupMember,
} from "../../../../shared/domains/workforce/types/workforceTypes";
import {
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
  WF_GROUPS_CHANGED,
  WF_MEMBERS_CHANGED,
  safeWrite,
  safeDispatch,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";
import type { ServerWorkforceGroupDto, ServerWorkforceMemberDto } from "./workforceGateApi.service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

export function parseMs(value: string, fallback: number): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

export function mapGroupFromServer(row: ServerWorkforceGroupDto): WorkforceGroup {
  const d = row.details;
  return {
    id: row.id,
    announcementId: typeof d.announcementId === "string" ? d.announcementId : "",
    name: row.name,
    date: typeof d.date === "string" ? d.date : "",
    time: typeof d.time === "string" ? d.time : "",
    location: typeof d.location === "string" ? d.location : "",
    groupType: d.groupType === "quick" ? "quick" : "announcement",
    shifts: Array.isArray(d.shifts) ? (d.shifts as WorkforceGroup["shifts"]) : [],
    autoReplace: d.autoReplace === true,
    autoDeleteHours: typeof d.autoDeleteHours === "number" ? d.autoDeleteHours : 24,
    status: row.status === "completed" ? "completed" : "active",
    createdAt: typeof d.createdAt === "number" ? d.createdAt : parseMs(row.created_at, Date.now()),
    completedAt: typeof d.completedAt === "number" ? d.completedAt : undefined,
  };
}

export function mapMemberFromServer(row: ServerWorkforceMemberDto): WorkforceGroupMember {
  const d = row.details;
  return {
    id: row.id,
    groupId: row.group_id,
    staffId: typeof d.staffId === "string" ? d.staffId : "",
    employeeUniqueId:
      typeof d.employeeUniqueId === "string" ? d.employeeUniqueId : row.employee_ml_id,
    employeeName: typeof d.employeeName === "string" ? d.employeeName : "Worker",
    categoryId: typeof d.categoryId === "string" ? d.categoryId : row.role,
    assignedShiftIds: Array.isArray(d.assignedShiftIds)
      ? d.assignedShiftIds.filter((x): x is string => typeof x === "string")
      : [],
    status: row.status === "exited" || row.status === "replaced" ? row.status : "active",
    exitedAt: typeof d.exitedAt === "number" ? d.exitedAt : undefined,
    exitReason:
      d.exitReason === "sick" ||
      d.exitReason === "emergency" ||
      d.exitReason === "travel" ||
      d.exitReason === "other"
        ? d.exitReason
        : undefined,
    exitNote: typeof d.exitNote === "string" ? d.exitNote : undefined,
    postEventRating: typeof d.postEventRating === "number" ? d.postEventRating : undefined,
    postEventComment: typeof d.postEventComment === "string" ? d.postEventComment : undefined,
  };
}

export function writeGroups(groups: WorkforceGroup[]): void {
  safeWrite(WF_GROUPS_KEY, groups);
  safeDispatch(WF_GROUPS_CHANGED);
}

export function writeMembers(members: WorkforceGroupMember[]): void {
  safeWrite(WF_MEMBERS_KEY, members);
  safeDispatch(WF_MEMBERS_CHANGED);
}
