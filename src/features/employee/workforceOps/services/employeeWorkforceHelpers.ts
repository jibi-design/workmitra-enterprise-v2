// src/features/employee/workforceOps/services/employeeWorkforceHelpers.ts
//
// Employee-side helpers for Workforce Ops Hub.
// Reads employer workforce data from localStorage to build employee views.
// Employee is identified by their unique ID.

import type {
  WorkforceStaff,
  WorkforceAnnouncement,
  WorkforceApplication,
  WorkforceGroup,
  WorkforceGroupMember,
  WorkforceCategory,
} from "../../../../shared/domains/workforce/types/workforceTypes";

import {
  WF_STAFF_KEY,
  WF_ANNOUNCEMENTS_KEY,
  WF_APPLICATIONS_KEY,
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
  WF_CATEGORIES_KEY,
  WF_APPLICATIONS_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

import {
  readStaff,
  readAnnouncements,
  readApplications,
  readGroups,
  readMembers,
  readCategories,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";

import {
  getEmployeeUniqueId,
  readPrefs,
  writePrefs,
} from "./employeeWorkforceHelpers.internal.helpers";
import { getMyTimesheet } from "./employeeWorkforceHelpers.timesheet";

export type EmployeeCompany = {
  staffRecord: WorkforceStaff;
  categories: WorkforceCategory[];
};

export const employeeWorkforceHelpers = {
  getMyUniqueId(): string {
    return getEmployeeUniqueId();
  },

  getMyStaffRecord(): WorkforceStaff | null {
    const myId = getEmployeeUniqueId();
    if (!myId) return null;
    return (
      readStaff(WF_STAFF_KEY).find((s) => s.employeeUniqueId === myId && s.status === "active") ??
      null
    );
  },

  isAddedAsStaff(): boolean {
    return this.getMyStaffRecord() !== null;
  },

  getAllCategories(): WorkforceCategory[] {
    return readCategories(WF_CATEGORIES_KEY);
  },

  getMyCategoryNames(): string[] {
    const staff = this.getMyStaffRecord();
    if (!staff) return [];
    const cats = readCategories(WF_CATEGORIES_KEY);
    const catMap = new Map<string, string>();
    for (const c of cats) catMap.set(c.id, c.name);
    return staff.categories.map((id) => catMap.get(id) ?? id);
  },

  getVisibleAnnouncements(): WorkforceAnnouncement[] {
    const staff = this.getMyStaffRecord();
    if (!staff) return [];

    return readAnnouncements(WF_ANNOUNCEMENTS_KEY).filter(
      (a) =>
        a.status === "open" && a.targetCategories.some((catId) => staff.categories.includes(catId)),
    );
  },

  getAllAnnouncementsForMe(): WorkforceAnnouncement[] {
    const staff = this.getMyStaffRecord();
    if (!staff) return [];

    return readAnnouncements(WF_ANNOUNCEMENTS_KEY).filter((a) =>
      a.targetCategories.some((catId) => staff.categories.includes(catId)),
    );
  },

  getMyApplications(): WorkforceApplication[] {
    const myId = getEmployeeUniqueId();
    if (!myId) return [];
    return readApplications(WF_APPLICATIONS_KEY).filter((a) => a.employeeUniqueId === myId);
  },

  getApplicationForAnnouncement(announcementId: string): WorkforceApplication | null {
    const myId = getEmployeeUniqueId();
    if (!myId) return null;
    return (
      readApplications(WF_APPLICATIONS_KEY).find(
        (a) => a.announcementId === announcementId && a.employeeUniqueId === myId,
      ) ?? null
    );
  },

  hasApplied(announcementId: string): boolean {
    return this.getApplicationForAnnouncement(announcementId) !== null;
  },

  apply(
    announcementId: string,
    categoryId: string,
    shiftIds: string[],
  ): { success: boolean; errors?: string[] } {
    const staff = this.getMyStaffRecord();
    if (!staff) {
      return { success: false, errors: ["You are not added as staff."] };
    }

    if (shiftIds.length === 0) {
      return { success: false, errors: ["Select at least one shift."] };
    }

    const existing = this.getApplicationForAnnouncement(announcementId);
    if (existing) {
      return { success: false, errors: ["You have already applied to this announcement."] };
    }

    const announcement = readAnnouncements(WF_ANNOUNCEMENTS_KEY).find(
      (a) => a.id === announcementId,
    );
    if (!announcement) {
      return { success: false, errors: ["Announcement not found."] };
    }

    const confirmedAnnouncements = readAnnouncements(WF_ANNOUNCEMENTS_KEY).filter(
      (a) => a.status === "confirmed",
    );
    const hasConflict = confirmedAnnouncements.some((a) => a.date === announcement.date);

    const allApps = readApplications(WF_APPLICATIONS_KEY);
    const application: WorkforceApplication = {
      id: uid("wapp"),
      announcementId,
      staffId: staff.id,
      employeeUniqueId: staff.employeeUniqueId,
      employeeName: staff.employeeName,
      categoryId,
      shiftIds,
      rating: staff.rating,
      hasDateConflict: hasConflict,
      status: "applied",
      appliedAt: Date.now(),
    };

    safeWrite(WF_APPLICATIONS_KEY, [...allApps, application]);
    safeDispatch(WF_APPLICATIONS_CHANGED);

    return { success: true };
  },

  getMyGroups(): Array<{ group: WorkforceGroup; member: WorkforceGroupMember }> {
    const myId = getEmployeeUniqueId();
    if (!myId) return [];

    const allMembers = readMembers(WF_MEMBERS_KEY);
    const myMembers = allMembers.filter(
      (m) => m.employeeUniqueId === myId && m.status === "active",
    );

    const allGroups = readGroups(WF_GROUPS_KEY);
    const result: Array<{ group: WorkforceGroup; member: WorkforceGroupMember }> = [];

    for (const member of myMembers) {
      const group = allGroups.find((g) => g.id === member.groupId);
      if (group) result.push({ group, member });
    }

    return result.sort((a, b) => b.group.createdAt - a.group.createdAt);
  },

  getMyActiveGroups(): Array<{ group: WorkforceGroup; member: WorkforceGroupMember }> {
    return this.getMyGroups().filter((g) => g.group.status === "active");
  },

  getPreferredCompanyIds(): string[] {
    return readPrefs().preferredCompanyIds;
  },

  togglePreferredCompany(companyId: string): void {
    const prefs = readPrefs();
    const exists = prefs.preferredCompanyIds.includes(companyId);
    const updated = exists
      ? prefs.preferredCompanyIds.filter((id) => id !== companyId)
      : [...prefs.preferredCompanyIds, companyId];
    writePrefs({ preferredCompanyIds: updated });
  },

  isPreferred(companyId: string): boolean {
    return readPrefs().preferredCompanyIds.includes(companyId);
  },

  getHomeSummary(): {
    isStaff: boolean;
    categoryCount: number;
    openAnnouncements: number;
    myApplications: number;
    activeGroups: number;
  } {
    const staff = this.getMyStaffRecord();
    return {
      isStaff: staff !== null,
      categoryCount: staff?.categories.length ?? 0,
      openAnnouncements: this.getVisibleAnnouncements().length,
      myApplications: this.getMyApplications().length,
      activeGroups: this.getMyActiveGroups().length,
    };
  },

  getMyTimesheet,
} as const;
