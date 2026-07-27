// src/features/employer/workforceOps/services/workforceGroupService.ts
//
// Group CRUD + status transitions for Workforce Ops Hub.
// Handles: create from announcement, quick group, complete, auto-delete check.
// Member operations are in workforceGroupMemberService.ts (Single Responsibility).

import type { WorkforceGroup } from "../../../../shared/domains/workforce/types/workforceTypes";
import { validateQuickGroup } from "../../../../shared/domains/workforce/validation/workforceValidation";
import {
  logActivity,
  read,
  readAllMembers,
  write,
  writeMembers,
  WF_GROUPS_CHANGED,
  WF_MEMBERS_CHANGED,
  uid,
  type AnnouncementGroupPayload,
  type QuickGroupPayload,
} from "./workforceGroupService.helpers";

export type { AnnouncementGroupPayload, QuickGroupPayload };

export const workforceGroupService = {
  getAll(): WorkforceGroup[] {
    return read();
  },

  getById(groupId: string): WorkforceGroup | null {
    return read().find((g) => g.id === groupId) ?? null;
  },

  getByStatus(status: WorkforceGroup["status"]): WorkforceGroup[] {
    return read().filter((g) => g.status === status);
  },

  getByAnnouncementId(announcementId: string): WorkforceGroup | null {
    return read().find((g) => g.announcementId === announcementId) ?? null;
  },

  getActiveGroups(): WorkforceGroup[] {
    return read().filter((g) => g.status === "active");
  },

  createFromAnnouncement(payload: AnnouncementGroupPayload): {
    success: boolean;
    groupId?: string;
    errors?: string[];
  } {
    const { announcement, confirmedMembers } = payload;

    if (confirmedMembers.length === 0) {
      return { success: false, errors: ["At least one confirmed member is required."] };
    }

    const existingGroup = read().find((g) => g.announcementId === announcement.id);
    if (existingGroup) {
      return { success: false, errors: ["A group already exists for this announcement."] };
    }

    const groupId = uid("wg");
    const group: WorkforceGroup = {
      id: groupId,
      announcementId: announcement.id,
      name: announcement.title,
      date: announcement.date,
      time: announcement.time,
      location: announcement.location,
      groupType: "announcement",
      shifts: announcement.shifts,
      autoReplace: announcement.autoReplace,
      autoDeleteHours: 24,
      status: "active",
      createdAt: Date.now(),
    };

    write([group, ...read()]);

    const newMembers = confirmedMembers.map((m) => ({
      id: uid("wgm"),
      groupId,
      staffId: m.staffId,
      employeeUniqueId: m.employeeUniqueId,
      employeeName: m.employeeName,
      categoryId: m.categoryId,
      assignedShiftIds: m.assignedShiftIds,
      status: "active" as const,
    }));

    const existingMembers = readAllMembers();
    writeMembers([...newMembers, ...existingMembers]);

    logActivity(
      "group_created",
      `Group created: ${group.name}`,
      `${confirmedMembers.length} member${confirmedMembers.length !== 1 ? "s" : ""} | ${announcement.shifts.length} shift${announcement.shifts.length !== 1 ? "s" : ""}`,
    );

    return { success: true, groupId };
  },

  createQuickGroup(payload: QuickGroupPayload): {
    success: boolean;
    groupId?: string;
    errors?: string[];
  } {
    const validation = validateQuickGroup(
      payload.name,
      payload.selectedStaff.map((s) => s.id),
    );
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const groupId = uid("wg");
    const group: WorkforceGroup = {
      id: groupId,
      announcementId: null,
      name: payload.name.trim(),
      date: payload.date,
      time: payload.time,
      location: payload.location.trim(),
      groupType: "quick",
      shifts: payload.shifts,
      autoReplace: payload.autoReplace,
      autoDeleteHours: 24,
      status: "active",
      createdAt: Date.now(),
    };

    write([group, ...read()]);

    const newMembers = payload.selectedStaff.map((staff) => ({
      id: uid("wgm"),
      groupId,
      staffId: staff.id,
      employeeUniqueId: staff.employeeUniqueId,
      employeeName: staff.employeeName,
      categoryId: payload.categoryPerStaff[staff.id] ?? "",
      assignedShiftIds: payload.shiftIdsPerStaff[staff.id] ?? [],
      status: "active" as const,
    }));

    const existingMembers = readAllMembers();
    writeMembers([...newMembers, ...existingMembers]);

    logActivity(
      "quick_group_created",
      `Quick group created: ${group.name}`,
      `${payload.selectedStaff.length} staff member${payload.selectedStaff.length !== 1 ? "s" : ""}`,
    );

    return { success: true, groupId };
  },

  completeGroup(groupId: string): { success: boolean; errors?: string[] } {
    const all = read();
    const target = all.find((g) => g.id === groupId);
    if (!target) {
      return { success: false, errors: ["Group not found."] };
    }

    if (target.status === "completed") {
      return { success: false, errors: ["Group is already completed."] };
    }

    const updated = all.map((g) =>
      g.id === groupId ? { ...g, status: "completed" as const, completedAt: Date.now() } : g,
    );
    write(updated);

    logActivity("group_completed", `Group completed: ${target.name}`, `Date: ${target.date}`);

    return { success: true };
  },

  getGroupsDueForAutoDelete(): WorkforceGroup[] {
    const now = Date.now();
    return read().filter((g) => {
      if (g.status !== "completed") return false;
      const eventEnd = new Date(`${g.date}T23:59:59`).getTime();
      const deleteAfter = eventEnd + g.autoDeleteHours * 60 * 60 * 1000;
      return now >= deleteAfter;
    });
  },

  archiveGroup(groupId: string): { success: boolean; errors?: string[] } {
    const all = read();
    const target = all.find((g) => g.id === groupId);
    if (!target) {
      return { success: false, errors: ["Group not found."] };
    }

    write(all.filter((g) => g.id !== groupId));

    const allMembers = readAllMembers();
    writeMembers(allMembers.filter((m) => m.groupId !== groupId));

    return { success: true };
  },

  countByStatus(): Record<WorkforceGroup["status"], number> {
    const all = read();
    const counts: Record<WorkforceGroup["status"], number> = {
      active: 0,
      completed: 0,
    };
    for (const g of all) {
      counts[g.status] += 1;
    }
    return counts;
  },

  countMembersForGroup(groupId: string): number {
    return readAllMembers().filter((m) => m.groupId === groupId && m.status === "active").length;
  },

  _events: {
    changed: WF_GROUPS_CHANGED,
    membersChanged: WF_MEMBERS_CHANGED,
  },
} as const;
