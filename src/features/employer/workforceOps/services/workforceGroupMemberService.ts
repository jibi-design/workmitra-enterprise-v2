// src/features/employer/workforceOps/services/workforceGroupMemberService.ts
//
// Group member operations for Workforce Ops Hub.
// Handles: member exit, auto-replace, urgent broadcast, post-event rating.
// Group CRUD is in workforceGroupService.ts (Single Responsibility).

import type {
  WorkforceGroupMember,
  WorkforceGroup,
  CancelReason,
} from "../../../../shared/domains/workforce/types/workforceTypes";

import { validatePostEventRating } from "../../../../shared/domains/workforce/validation/workforceValidation";

import {
  logActivity,
  pushEmployeeNotification,
  readAllApplications,
  readAllGroups,
  readAllMembers,
  readAllStaff,
  writeApplications,
  writeMembers,
  writeStaff,
  WF_MEMBERS_CHANGED,
  uid,
} from "./workforceGroupMemberService.helpers";

export const workforceGroupMemberService = {
  getMembersForGroup(groupId: string): WorkforceGroupMember[] {
    return readAllMembers().filter((m) => m.groupId === groupId);
  },

  getActiveMembersForGroup(groupId: string): WorkforceGroupMember[] {
    return readAllMembers().filter((m) => m.groupId === groupId && m.status === "active");
  },

  getMemberById(memberId: string): WorkforceGroupMember | null {
    return readAllMembers().find((m) => m.id === memberId) ?? null;
  },

  getMemberByStaffAndGroup(staffId: string, groupId: string): WorkforceGroupMember | null {
    return (
      readAllMembers().find(
        (m) => m.staffId === staffId && m.groupId === groupId && m.status === "active",
      ) ?? null
    );
  },

  exitMember(
    memberId: string,
    reason: CancelReason,
    note: string,
  ): { success: boolean; replacedBy?: string; errors?: string[] } {
    const allMembers = readAllMembers();
    const target = allMembers.find((m) => m.id === memberId);
    if (!target) {
      return { success: false, errors: ["Member not found."] };
    }

    if (target.status !== "active") {
      return { success: false, errors: ["Member is not active."] };
    }

    const group = readAllGroups().find((g) => g.id === target.groupId);
    if (!group) {
      return { success: false, errors: ["Group not found."] };
    }

    const updatedMembers = allMembers.map((m) =>
      m.id === memberId
        ? {
            ...m,
            status: "exited" as const,
            exitedAt: Date.now(),
            exitReason: reason,
            exitNote: note.trim() || undefined,
          }
        : m,
    );
    writeMembers(updatedMembers);

    logActivity(
      "member_exited",
      `${target.employeeName} exited group: ${group.name}`,
      `Reason: ${reason}`,
    );

    let replacedByName: string | undefined;

    if (group.autoReplace && group.announcementId) {
      replacedByName = this._tryAutoReplace(group, target.categoryId, target.assignedShiftIds);
    }

    return { success: true, replacedBy: replacedByName };
  },

  _tryAutoReplace(
    group: WorkforceGroup,
    categoryId: string,
    shiftIds: string[],
  ): string | undefined {
    if (!group.announcementId) return undefined;

    const allApps = readAllApplications();
    const waitingApps = allApps
      .filter(
        (a) =>
          a.announcementId === group.announcementId &&
          a.categoryId === categoryId &&
          a.status === "waiting" &&
          a.shiftIds.some((sid) => shiftIds.includes(sid)),
      )
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    const topCandidate = waitingApps[0];
    if (!topCandidate) return undefined;

    const updatedApps = allApps.map((a) =>
      a.id === topCandidate.id
        ? { ...a, status: "confirmed" as const, confirmedAt: Date.now() }
        : a,
    );
    writeApplications(updatedApps);

    const newMember: WorkforceGroupMember = {
      id: uid("wgm"),
      groupId: group.id,
      staffId: topCandidate.staffId,
      employeeUniqueId: topCandidate.employeeUniqueId,
      employeeName: topCandidate.employeeName,
      categoryId: topCandidate.categoryId,
      assignedShiftIds: topCandidate.shiftIds.filter((sid) => shiftIds.includes(sid)),
      status: "active",
    };

    const currentMembers = readAllMembers();
    writeMembers([newMember, ...currentMembers]);

    logActivity(
      "member_replaced",
      `${topCandidate.employeeName} auto-replaced into: ${group.name}`,
      `Category: ${categoryId}`,
    );

    pushEmployeeNotification(
      "You've been selected!",
      `You have been moved from the waiting list to group "${group.name}".`,
    );

    return topCandidate.employeeName;
  },

  sendUrgentBroadcast(
    groupId: string,
    categoryId: string,
    message: string,
  ): { success: boolean; notifiedCount: number; errors?: string[] } {
    const group = readAllGroups().find((g) => g.id === groupId);
    if (!group) {
      return { success: false, notifiedCount: 0, errors: ["Group not found."] };
    }

    const allStaff = readAllStaff();
    const eligibleStaff = allStaff.filter(
      (s) => s.status === "active" && s.categories.includes(categoryId),
    );

    const activeMembers = readAllMembers().filter(
      (m) => m.groupId === groupId && m.status === "active",
    );
    const activeMemberStaffIds = new Set(activeMembers.map((m) => m.staffId));

    const targetStaff = eligibleStaff.filter((s) => !activeMemberStaffIds.has(s.id));

    if (targetStaff.length === 0) {
      return {
        success: false,
        notifiedCount: 0,
        errors: ["No available staff to notify for this category."],
      };
    }

    const broadcastText = message.trim() || `Urgent: Staff needed for "${group.name}"`;
    pushEmployeeNotification("[URGENT] Staff Needed", broadcastText);

    logActivity(
      "urgent_broadcast",
      `Urgent broadcast sent for: ${group.name}`,
      `Category staff notified: ${targetStaff.length}`,
    );

    return { success: true, notifiedCount: targetStaff.length };
  },

  rateGroupMember(
    memberId: string,
    rating: number,
    comment: string,
  ): { success: boolean; errors?: string[] } {
    const validation = validatePostEventRating(rating, comment);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const allMembers = readAllMembers();
    const target = allMembers.find((m) => m.id === memberId);
    if (!target) {
      return { success: false, errors: ["Member not found."] };
    }

    const updatedMembers = allMembers.map((m) =>
      m.id === memberId
        ? {
            ...m,
            postEventRating: rating,
            postEventComment: comment.trim() || undefined,
          }
        : m,
    );
    writeMembers(updatedMembers);

    this._updateStaffRating(target.staffId, rating);

    logActivity(
      "staff_rated",
      `${target.employeeName} rated: ${rating}/5`,
      comment.trim() || undefined,
    );

    return { success: true };
  },

  _updateStaffRating(staffId: string, newRating: number): void {
    const allStaff = readAllStaff();
    const staff = allStaff.find((s) => s.id === staffId);
    if (!staff) return;

    const oldRating = staff.rating ?? 0;
    const oldCount = staff.ratingCount;
    const newCount = oldCount + 1;
    const weightedAvg = Math.round(((oldRating * oldCount + newRating) / newCount) * 100) / 100;

    const updatedStaff = allStaff.map((s) =>
      s.id === staffId ? { ...s, rating: weightedAvg, ratingCount: newCount } : s,
    );
    writeStaff(updatedStaff);
  },

  rateAllGroupMembers(ratings: Array<{ memberId: string; rating: number; comment: string }>): {
    success: boolean;
    ratedCount: number;
    errors?: string[];
  } {
    const allErrors: string[] = [];
    let ratedCount = 0;

    for (const entry of ratings) {
      const result = this.rateGroupMember(entry.memberId, entry.rating, entry.comment);
      if (result.success) {
        ratedCount += 1;
      } else if (result.errors) {
        allErrors.push(...result.errors);
      }
    }

    if (allErrors.length > 0 && ratedCount === 0) {
      return { success: false, ratedCount: 0, errors: allErrors };
    }

    return { success: true, ratedCount };
  },

  areAllMembersRated(groupId: string): boolean {
    const members = readAllMembers().filter((m) => m.groupId === groupId && m.status === "active");
    return members.length > 0 && members.every((m) => m.postEventRating !== undefined);
  },

  _events: {
    changed: WF_MEMBERS_CHANGED,
  },
} as const;
