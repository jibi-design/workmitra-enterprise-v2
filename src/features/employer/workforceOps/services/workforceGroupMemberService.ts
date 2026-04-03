// src/features/employer/workforceOps/services/workforceGroupMemberService.ts
//
// Group member operations for Workforce Ops Hub.
// Handles: member exit, auto-replace, urgent broadcast, post-event rating.
// Group CRUD is in workforceGroupService.ts (Single Responsibility).

import type {
  WorkforceGroupMember,
  WorkforceApplication,
  WorkforceStaff,
  WorkforceGroup,
  CancelReason,
  WorkforceActivityEntry,
  WorkforceActivityKind,
} from "../types/workforceTypes";

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
  EMPLOYEE_NOTIF_KEY,
  EMPLOYEE_NOTIF_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../helpers/workforceStorageUtils";

import {
  readMembers,
  readApplications,
  readStaff,
  readGroups,
  readActivity,
} from "../helpers/workforceNormalizers";

import {
  validatePostEventRating,
} from "../helpers/workforceValidation";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function readAllMembers(): WorkforceGroupMember[] {
  return readMembers(WF_MEMBERS_KEY);
}

function writeMembers(members: WorkforceGroupMember[]): void {
  safeWrite(WF_MEMBERS_KEY, members);
  safeDispatch(WF_MEMBERS_CHANGED);
}

function readAllApplications(): WorkforceApplication[] {
  return readApplications(WF_APPLICATIONS_KEY);
}

function writeApplications(apps: WorkforceApplication[]): void {
  safeWrite(WF_APPLICATIONS_KEY, apps);
  safeDispatch(WF_APPLICATIONS_CHANGED);
}

function readAllStaff(): WorkforceStaff[] {
  return readStaff(WF_STAFF_KEY);
}

function writeStaff(staff: WorkforceStaff[]): void {
  safeWrite(WF_STAFF_KEY, staff);
  safeDispatch(WF_STAFF_CHANGED);
}

function readAllGroups(): WorkforceGroup[] {
  return readGroups(WF_GROUPS_KEY);
}

function logActivity(
  kind: WorkforceActivityKind,
  title: string,
  body?: string,
): void {
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

// ─────────────────────────────────────────────────────────────────────────────
// Employee Notification Helper
// ─────────────────────────────────────────────────────────────────────────────

type EmployeeNotification = {
  id: string;
  domain: string;
  title: string;
  body: string;
  route?: string;
  read: boolean;
  createdAt: number;
};

function pushEmployeeNotification(
  title: string,
  body: string,
  route?: string,
): void {
  const raw = localStorage.getItem(EMPLOYEE_NOTIF_KEY);
  let existing: EmployeeNotification[] = [];
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) existing = parsed as EmployeeNotification[];
  } catch {
    // ignore
  }

  const notification: EmployeeNotification = {
    id: uid("en"),
    domain: "workforce",
    title,
    body,
    route,
    read: false,
    createdAt: Date.now(),
  };

  safeWrite(EMPLOYEE_NOTIF_KEY, [notification, ...existing]);
  safeDispatch(EMPLOYEE_NOTIF_CHANGED);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const workforceGroupMemberService = {
  // ── Reads ──────────────────────────────────────────────────────────────

  getMembersForGroup(groupId: string): WorkforceGroupMember[] {
    return readAllMembers().filter((m) => m.groupId === groupId);
  },

  getActiveMembersForGroup(groupId: string): WorkforceGroupMember[] {
    return readAllMembers().filter(
      (m) => m.groupId === groupId && m.status === "active",
    );
  },

  getMemberById(memberId: string): WorkforceGroupMember | null {
    return readAllMembers().find((m) => m.id === memberId) ?? null;
  },

  getMemberByStaffAndGroup(
    staffId: string,
    groupId: string,
  ): WorkforceGroupMember | null {
    return (
      readAllMembers().find(
        (m) => m.staffId === staffId && m.groupId === groupId && m.status === "active",
      ) ?? null
    );
  },

  // ── Member Exit (with reason) ──────────────────────────────────────────

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

    // Mark member as exited
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

    // Auto-replace logic
    let replacedByName: string | undefined;

    if (group.autoReplace && group.announcementId) {
      replacedByName = this._tryAutoReplace(
        group,
        target.categoryId,
        target.assignedShiftIds,
      );
    }

    return { success: true, replacedBy: replacedByName };
  },

  // ── Auto-Replace from Waiting List ─────────────────────────────────────

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

    // Promote waiting → confirmed in applications
    const updatedApps = allApps.map((a) =>
      a.id === topCandidate.id
        ? { ...a, status: "confirmed" as const, confirmedAt: Date.now() }
        : a,
    );
    writeApplications(updatedApps);

    // Add as new group member
    const newMember: WorkforceGroupMember = {
      id: uid("wgm"),
      groupId: group.id,
      staffId: topCandidate.staffId,
      employeeUniqueId: topCandidate.employeeUniqueId,
      employeeName: topCandidate.employeeName,
      categoryId: topCandidate.categoryId,
      assignedShiftIds: topCandidate.shiftIds.filter((sid) =>
        shiftIds.includes(sid),
      ),
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

  // ── Urgent Replacement Broadcast (IMP-3) ───────────────────────────────

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
    const activeMemberStaffIds = new Set(
      activeMembers.map((m) => m.staffId),
    );

    const targetStaff = eligibleStaff.filter(
      (s) => !activeMemberStaffIds.has(s.id),
    );

    if (targetStaff.length === 0) {
      return {
        success: false,
        notifiedCount: 0,
        errors: ["No available staff to notify for this category."],
      };
    }

    const broadcastText = message.trim() || `Urgent: Staff needed for "${group.name}"`;
    pushEmployeeNotification(
      "[URGENT] Staff Needed",
      broadcastText,
    );

    logActivity(
      "urgent_broadcast",
      `Urgent broadcast sent for: ${group.name}`,
      `Category staff notified: ${targetStaff.length}`,
    );

    return { success: true, notifiedCount: targetStaff.length };
  },

  // ── Post-Event Rating (IMP-4) ──────────────────────────────────────────

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

    // Update member with post-event rating
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

    // Update staff weighted average rating
    this._updateStaffRating(target.staffId, rating);

    logActivity(
      "staff_rated",
      `${target.employeeName} rated: ${rating}/5`,
      comment.trim() || undefined,
    );

    return { success: true };
  },

  // ── Staff Rating Weighted Average (IMP-4) ──────────────────────────────
  // Formula: newAvg = (oldRating * oldCount + newRating) / (oldCount + 1)

  _updateStaffRating(staffId: string, newRating: number): void {
    const allStaff = readAllStaff();
    const staff = allStaff.find((s) => s.id === staffId);
    if (!staff) return;

    const oldRating = staff.rating ?? 0;
    const oldCount = staff.ratingCount;
    const newCount = oldCount + 1;
    const weightedAvg =
      Math.round(((oldRating * oldCount + newRating) / newCount) * 100) / 100;

    const updatedStaff = allStaff.map((s) =>
      s.id === staffId
        ? { ...s, rating: weightedAvg, ratingCount: newCount }
        : s,
    );
    writeStaff(updatedStaff);
  },

  // ── Bulk Rate All Members (Post-Event) ─────────────────────────────────

  rateAllGroupMembers(
    ratings: Array<{ memberId: string; rating: number; comment: string }>,
  ): { success: boolean; ratedCount: number; errors?: string[] } {
    const allErrors: string[] = [];
    let ratedCount = 0;

    for (const entry of ratings) {
      const result = this.rateGroupMember(
        entry.memberId,
        entry.rating,
        entry.comment,
      );
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

  // ── Check if All Members Rated (for auto-delete gate) ──────────────────

  areAllMembersRated(groupId: string): boolean {
    const members = readAllMembers().filter(
      (m) => m.groupId === groupId && m.status === "active",
    );
    return members.length > 0 && members.every((m) => m.postEventRating !== undefined);
  },

  // ── Events ─────────────────────────────────────────────────────────────

  _events: {
    changed: WF_MEMBERS_CHANGED,
  },
} as const;