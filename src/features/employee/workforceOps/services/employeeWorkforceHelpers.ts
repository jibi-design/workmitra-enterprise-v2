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
  EmployeeWorkforcePreferences,
} from "../../../employer/workforceOps/types/workforceTypes";

import {
  WF_STAFF_KEY,
  WF_ANNOUNCEMENTS_KEY,
  WF_APPLICATIONS_KEY,
  WF_GROUPS_KEY,
  WF_MEMBERS_KEY,
  WF_CATEGORIES_KEY,
  WF_EMPLOYEE_PREFS_KEY,
  WF_ATTENDANCE_KEY,
  safeWrite,
  safeRead,
  safeDispatch,
  WF_APPLICATIONS_CHANGED,
  uid,
} from "../../../employer/workforceOps/helpers/workforceStorageUtils";

import {
  readStaff,
  readAnnouncements,
  readApplications,
  readGroups,
  readMembers,
  readCategories,
  readAttendance,
} from "../../../employer/workforceOps/helpers/workforceNormalizers";

// ─────────────────────────────────────────────────────────────────────────────
// Employee Profile Helper
// ─────────────────────────────────────────────────────────────────────────────

function getEmployeeUniqueId(): string {
  try {
    const raw = localStorage.getItem("wm_employee_profile_v1");
    if (!raw) return "";
    const profile = JSON.parse(raw) as Record<string, unknown>;
    return typeof profile["uniqueId"] === "string" ? profile["uniqueId"] : "";
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Company Detection (which employers added this employee as staff)
// ─────────────────────────────────────────────────────────────────────────────

export type EmployeeCompany = {
  staffRecord: WorkforceStaff;
  categories: WorkforceCategory[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Preferences (IMP-5)
// ─────────────────────────────────────────────────────────────────────────────

function readPrefs(): EmployeeWorkforcePreferences {
  try {
    const raw = safeRead(WF_EMPLOYEE_PREFS_KEY);
    if (!raw) return { preferredCompanyIds: [] };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const ids = parsed["preferredCompanyIds"];
    return {
      preferredCompanyIds: Array.isArray(ids)
        ? ids.filter((x): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return { preferredCompanyIds: [] };
  }
}

function writePrefs(prefs: EmployeeWorkforcePreferences): void {
  safeWrite(WF_EMPLOYEE_PREFS_KEY, prefs);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const employeeWorkforceHelpers = {
  getMyUniqueId(): string {
    return getEmployeeUniqueId();
  },

  // ── Staff Record ────────────────────────────────────────────────────────

  getMyStaffRecord(): WorkforceStaff | null {
    const myId = getEmployeeUniqueId();
    if (!myId) return null;
    return readStaff(WF_STAFF_KEY).find(
      (s) => s.employeeUniqueId === myId && s.status === "active",
    ) ?? null;
  },

  isAddedAsStaff(): boolean {
    return this.getMyStaffRecord() !== null;
  },

  // ── Categories ──────────────────────────────────────────────────────────

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

  // ── Announcements (visible to employee) ─────────────────────────────────

  getVisibleAnnouncements(): WorkforceAnnouncement[] {
    const staff = this.getMyStaffRecord();
    if (!staff) return [];

    return readAnnouncements(WF_ANNOUNCEMENTS_KEY).filter(
      (a) =>
        a.status === "open" &&
        a.targetCategories.some((catId) => staff.categories.includes(catId)),
    );
  },

  getAllAnnouncementsForMe(): WorkforceAnnouncement[] {
    const staff = this.getMyStaffRecord();
    if (!staff) return [];

    return readAnnouncements(WF_ANNOUNCEMENTS_KEY).filter(
      (a) => a.targetCategories.some((catId) => staff.categories.includes(catId)),
    );
  },

  // ── Applications ────────────────────────────────────────────────────────

  getMyApplications(): WorkforceApplication[] {
    const myId = getEmployeeUniqueId();
    if (!myId) return [];
    return readApplications(WF_APPLICATIONS_KEY).filter(
      (a) => a.employeeUniqueId === myId,
    );
  },

  getApplicationForAnnouncement(announcementId: string): WorkforceApplication | null {
    const myId = getEmployeeUniqueId();
    if (!myId) return null;
    return readApplications(WF_APPLICATIONS_KEY).find(
      (a) => a.announcementId === announcementId && a.employeeUniqueId === myId,
    ) ?? null;
  },

  hasApplied(announcementId: string): boolean {
    return this.getApplicationForAnnouncement(announcementId) !== null;
  },

  // ── Apply to Announcement ───────────────────────────────────────────────

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

    const announcement = readAnnouncements(WF_ANNOUNCEMENTS_KEY).find((a) => a.id === announcementId);
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

  // ── Groups (employee is member of) ──────────────────────────────────────

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

  // ── Preferred Companies (IMP-5) ─────────────────────────────────────────

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

  // ── Summary (for home page KPIs) ───────────────────────────────────────

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

  // ── Timesheet (Monthly attendance summary) ──────────────────────────────

  getMyTimesheet(year: number, month: number): {
    totalDays: number;
    totalHours: number;
    avgHoursPerDay: number;
    entries: Array<{
      groupId: string;
      groupName: string;
      date: string;
      shiftName: string;
      signInAt: number;
      signOutAt: number | null;
      hoursWorked: number | null;
    }>;
  } {
    const myId = getEmployeeUniqueId();
    if (!myId) return { totalDays: 0, totalHours: 0, avgHoursPerDay: 0, entries: [] };

    const allAttendance = readAttendance(WF_ATTENDANCE_KEY);
    const allMembers = readMembers(WF_MEMBERS_KEY);
    const allGroups = readGroups(WF_GROUPS_KEY);

    const myMemberIds = new Set(
      allMembers.filter((m) => m.employeeUniqueId === myId).map((m) => m.id),
    );

    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

    const myRecords = allAttendance.filter(
      (a) => myMemberIds.has(a.memberId) && a.signInAt >= monthStart && a.signInAt <= monthEnd,
    );

    const groupMap = new Map<string, string>();
    for (const g of allGroups) groupMap.set(g.id, g.name);

    const shiftMap = new Map<string, string>();
    for (const g of allGroups) {
      for (const s of g.shifts) shiftMap.set(`${g.id}__${s.id}`, s.name);
    }

    const entries = myRecords
      .map((rec) => ({
        groupId: rec.groupId,
        groupName: groupMap.get(rec.groupId) ?? "Unknown",
        date: new Date(rec.signInAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
        shiftName: shiftMap.get(`${rec.groupId}__${rec.shiftId}`) ?? "Shift",
        signInAt: rec.signInAt,
        signOutAt: rec.signOutAt,
        hoursWorked: rec.hoursWorked,
      }))
      .sort((a, b) => b.signInAt - a.signInAt);

    let totalHours = 0;
    const uniqueDays = new Set<string>();
    for (const e of entries) {
      if (e.hoursWorked !== null) totalHours += e.hoursWorked;
      uniqueDays.add(new Date(e.signInAt).toDateString());
    }

    const totalDays = uniqueDays.size;
    const avgHoursPerDay = totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0;
    totalHours = Math.round(totalHours * 10) / 10;

    return { totalDays, totalHours, avgHoursPerDay, entries };
  },
} as const;