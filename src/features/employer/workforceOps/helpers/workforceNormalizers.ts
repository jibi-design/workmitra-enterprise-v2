// src/features/employer/workforceOps/helpers/workforceNormalizers.ts
//
// Safe read/write normalizers for all Workforce data types.
// Ensures type safety when reading from localStorage.

import type {
  WorkforceCategory,
  WorkforceStaff,
  WorkforceTemplate,
  WorkforceAnnouncement,
  WorkforceApplication,
  WorkforceGroup,
  WorkforceGroupMember,
  WorkforceMessage,
  AttendanceRecord,
  WorkforceActivityEntry,
  AnnouncementShift,
} from "../types/workforceTypes";

import {
  isRecord,
  getString,
  getNumber,
  getBoolean,
  getStringArray,
  safeParse,
  safeRead,
  type UnknownRecord,
} from "./workforceStorageUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Shift Normalizer (reused across announcement + group)
// ─────────────────────────────────────────────────────────────────────────────

function normalizeShift(raw: unknown): AnnouncementShift | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const name = getString(raw, "name");
  if (!id || !name) return null;
  return {
    id,
    name,
    startTime: getString(raw, "startTime"),
    endTime: getString(raw, "endTime"),
    hasBreak: getBoolean(raw, "hasBreak", false),
    breakStartTime: getString(raw, "breakStartTime"),
    breakEndTime: getString(raw, "breakEndTime"),
  };
}

function normalizeShifts(raw: unknown): AnnouncementShift[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeShift).filter((s): s is AnnouncementShift => s !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Record<string, Record<string, number>> normalizer
// ─────────────────────────────────────────────────────────────────────────────

function normalizeVacancyMap(raw: unknown): Record<string, Record<string, number>> {
  if (!isRecord(raw)) return {};
  const result: Record<string, Record<string, number>> = {};
  for (const [catId, shiftMap] of Object.entries(raw)) {
    if (!isRecord(shiftMap as unknown)) continue;
    const inner: Record<string, number> = {};
    for (const [shiftId, val] of Object.entries(shiftMap as UnknownRecord)) {
      if (typeof val === "number" && Number.isFinite(val) && val >= 0) {
        inner[shiftId] = Math.floor(val);
      }
    }
    if (Object.keys(inner).length > 0) result[catId] = inner;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeCategory(raw: unknown): WorkforceCategory | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const name = getString(raw, "name");
  if (!id || !name) return null;
  return { id, name, createdAt: getNumber(raw, "createdAt"), sortOrder: getNumber(raw, "sortOrder") };
}

export function readCategories(key: string): WorkforceCategory[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeCategory).filter((x): x is WorkforceCategory => x !== null).sort((a, b) => a.sortOrder - b.sortOrder);
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeStaff(raw: unknown): WorkforceStaff | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const eid = getString(raw, "employeeUniqueId");
  if (!id || !eid) return null;
  const ratingRaw = raw["rating"];
  const rating = typeof ratingRaw === "number" && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;
  return {
    id, employeeUniqueId: eid,
    employeeName: getString(raw, "employeeName"),
    employeeCity: getString(raw, "employeeCity"),
    employeeSkills: getStringArray(raw, "employeeSkills"),
    categories: getStringArray(raw, "categories"),
    rating,
    ratingCount: getNumber(raw, "ratingCount"),
    ratingComment: getString(raw, "ratingComment"),
    plusPoints: getString(raw, "plusPoints"),
    bio: getString(raw, "bio"),
    addedAt: getNumber(raw, "addedAt"),
    status: getString(raw, "status") === "removed" ? "removed" : "active",
    removedAt: raw["removedAt"] !== undefined ? getNumber(raw, "removedAt") : undefined,
  };
}

export function readStaff(key: string): WorkforceStaff[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeStaff).filter((x): x is WorkforceStaff => x !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Template
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeTemplate(raw: unknown): WorkforceTemplate | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const name = getString(raw, "name");
  if (!id || !name) return null;
  return {
    id, name,
    targetCategories: getStringArray(raw, "targetCategories"),
    shifts: normalizeShifts(raw["shifts"]),
    vacancyPerCategoryPerShift: normalizeVacancyMap(raw["vacancyPerCategoryPerShift"]),
    waitingBuffer: getNumber(raw, "waitingBuffer"),
    titlePattern: getString(raw, "titlePattern"),
    description: getString(raw, "description"),
    location: getString(raw, "location"),
    createdAt: getNumber(raw, "createdAt"),
  };
}

export function readTemplates(key: string): WorkforceTemplate[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeTemplate).filter((x): x is WorkforceTemplate => x !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Announcement
// ─────────────────────────────────────────────────────────────────────────────

const VALID_ANN_STATUS = new Set(["open", "analyzing", "confirmed", "completed", "cancelled"]);

export function normalizeAnnouncement(raw: unknown): WorkforceAnnouncement | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  if (!id) return null;
  const statusRaw = getString(raw, "status");
  const status = VALID_ANN_STATUS.has(statusRaw) ? statusRaw as WorkforceAnnouncement["status"] : "open";
  return {
    id,
    title: getString(raw, "title"),
    date: getString(raw, "date"),
    time: getString(raw, "time"),
    location: getString(raw, "location"),
    description: getString(raw, "description"),
    targetCategories: getStringArray(raw, "targetCategories"),
    shifts: normalizeShifts(raw["shifts"]),
    vacancyPerCategoryPerShift: normalizeVacancyMap(raw["vacancyPerCategoryPerShift"]),
    waitingBuffer: getNumber(raw, "waitingBuffer"),
    autoReplace: getBoolean(raw, "autoReplace", true),
    status,
    createdAt: getNumber(raw, "createdAt"),
    confirmedAt: raw["confirmedAt"] !== undefined ? getNumber(raw, "confirmedAt") : undefined,
    completedAt: raw["completedAt"] !== undefined ? getNumber(raw, "completedAt") : undefined,
    isTemplate: getBoolean(raw, "isTemplate", false),
    templateName: getString(raw, "templateName") || undefined,
    clonedFrom: getString(raw, "clonedFrom") || undefined,
  };
}

export function readAnnouncements(key: string): WorkforceAnnouncement[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeAnnouncement).filter((x): x is WorkforceAnnouncement => x !== null).sort((a, b) => b.createdAt - a.createdAt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Application
// ─────────────────────────────────────────────────────────────────────────────

const VALID_APP_STATUS = new Set(["applied", "selected", "waiting", "not_selected", "confirmed", "cancelled"]);

export function normalizeApplication(raw: unknown): WorkforceApplication | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const announcementId = getString(raw, "announcementId");
  if (!id || !announcementId) return null;
  const statusRaw = getString(raw, "status");
  const status = VALID_APP_STATUS.has(statusRaw) ? statusRaw as WorkforceApplication["status"] : "applied";
  const ratingRaw = raw["rating"];
  const rating = typeof ratingRaw === "number" && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;
  return {
    id, announcementId,
    staffId: getString(raw, "staffId"),
    employeeUniqueId: getString(raw, "employeeUniqueId"),
    employeeName: getString(raw, "employeeName"),
    categoryId: getString(raw, "categoryId"),
    shiftIds: getStringArray(raw, "shiftIds"),
    rating,
    hasDateConflict: getBoolean(raw, "hasDateConflict", false),
    status,
    appliedAt: getNumber(raw, "appliedAt"),
    confirmedAt: raw["confirmedAt"] !== undefined ? getNumber(raw, "confirmedAt") : undefined,
    cancelledAt: raw["cancelledAt"] !== undefined ? getNumber(raw, "cancelledAt") : undefined,
    cancelReason: getString(raw, "cancelReason") as WorkforceApplication["cancelReason"] || undefined,
    cancelNote: getString(raw, "cancelNote") || undefined,
  };
}

export function readApplications(key: string): WorkforceApplication[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeApplication).filter((x): x is WorkforceApplication => x !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Group
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeGroup(raw: unknown): WorkforceGroup | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  if (!id) return null;
  return {
    id,
    announcementId: getString(raw, "announcementId") || null,
    name: getString(raw, "name"),
    date: getString(raw, "date"),
    time: getString(raw, "time"),
    location: getString(raw, "location"),
    groupType: getString(raw, "groupType") === "quick" ? "quick" : "announcement",
    shifts: normalizeShifts(raw["shifts"]),
    autoReplace: getBoolean(raw, "autoReplace", true),
    autoDeleteHours: getNumber(raw, "autoDeleteHours") || 24,
    status: getString(raw, "status") === "completed" ? "completed" : "active",
    createdAt: getNumber(raw, "createdAt"),
    completedAt: raw["completedAt"] !== undefined ? getNumber(raw, "completedAt") : undefined,
  };
}

export function readGroups(key: string): WorkforceGroup[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeGroup).filter((x): x is WorkforceGroup => x !== null).sort((a, b) => b.createdAt - a.createdAt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Group Member
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeMember(raw: unknown): WorkforceGroupMember | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const groupId = getString(raw, "groupId");
  if (!id || !groupId) return null;
  const statusRaw = getString(raw, "status");
  const status = (statusRaw === "exited" || statusRaw === "replaced") ? statusRaw as WorkforceGroupMember["status"] : "active";
  const perRaw = raw["postEventRating"];
  return {
    id, groupId,
    staffId: getString(raw, "staffId"),
    employeeUniqueId: getString(raw, "employeeUniqueId"),
    employeeName: getString(raw, "employeeName"),
    categoryId: getString(raw, "categoryId"),
    assignedShiftIds: getStringArray(raw, "assignedShiftIds"),
    status,
    exitedAt: raw["exitedAt"] !== undefined ? getNumber(raw, "exitedAt") : undefined,
    exitReason: getString(raw, "exitReason") as WorkforceGroupMember["exitReason"] || undefined,
    exitNote: getString(raw, "exitNote") || undefined,
    postEventRating: typeof perRaw === "number" && perRaw >= 1 && perRaw <= 5 ? perRaw : undefined,
    postEventComment: getString(raw, "postEventComment") || undefined,
  };
}

export function readMembers(key: string): WorkforceGroupMember[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeMember).filter((x): x is WorkforceGroupMember => x !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeAttendance(raw: unknown): AttendanceRecord | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const groupId = getString(raw, "groupId");
  if (!id || !groupId) return null;
  const signOutRaw = raw["signOutAt"];
  const signOut = typeof signOutRaw === "number" && signOutRaw > 0 ? signOutRaw : null;
  const hoursRaw = raw["hoursWorked"];
  const hours = typeof hoursRaw === "number" && hoursRaw >= 0 ? hoursRaw : null;
  const soType = getString(raw, "signOutType");
  const validTypes = new Set(["manual", "auto", "employer_set"]);
  return {
    id, groupId,
    memberId: getString(raw, "memberId"),
    employeeUniqueId: getString(raw, "employeeUniqueId"),
    shiftId: getString(raw, "shiftId"),
    signInAt: getNumber(raw, "signInAt"),
    signOutAt: signOut,
    signOutType: validTypes.has(soType) ? soType as AttendanceRecord["signOutType"] : null,
    hoursWorked: hours,
  };
}

export function readAttendance(key: string): AttendanceRecord[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeAttendance).filter((x): x is AttendanceRecord => x !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Message
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeMessage(raw: unknown): WorkforceMessage | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const groupId = getString(raw, "groupId");
  const text = getString(raw, "text");
  if (!id || !groupId || !text) return null;
  return {
    id, groupId,
    senderType: getString(raw, "senderType") === "employee" ? "employee" : "employer",
    senderName: getString(raw, "senderName"),
    senderId: getString(raw, "senderId"),
    text,
    createdAt: getNumber(raw, "createdAt"),
    isUrgent: getBoolean(raw, "isUrgent", false),
  };
}

export function readMessages(key: string): WorkforceMessage[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeMessage).filter((x): x is WorkforceMessage => x !== null).sort((a, b) => a.createdAt - b.createdAt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeActivity(raw: unknown): WorkforceActivityEntry | null {
  if (!isRecord(raw)) return null;
  const id = getString(raw, "id");
  const title = getString(raw, "title");
  const createdAt = getNumber(raw, "createdAt");
  if (!id || !title || !createdAt) return null;
  return {
    id,
    kind: getString(raw, "kind") as WorkforceActivityEntry["kind"],
    title,
    body: getString(raw, "body") || undefined,
    createdAt,
    route: getString(raw, "route") || undefined,
  };
}

export function readActivity(key: string): WorkforceActivityEntry[] {
  return safeParse<unknown>(safeRead(key)).map(normalizeActivity).filter((x): x is WorkforceActivityEntry => x !== null).sort((a, b) => b.createdAt - a.createdAt);
}