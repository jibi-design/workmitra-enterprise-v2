import type {
  AttendanceRecord,
  WorkforceActivityEntry,
  WorkforceGroup,
  WorkforceGroupMember,
  WorkforceMessage,
} from "../types/workforceTypes";
import {
  getBoolean,
  getNumber,
  getString,
  getStringArray,
  isRecord,
  safeParse,
  safeRead,
} from "../storage/workforceStorageUtils";
import { normalizeShifts } from "./workforceNormalizers.shared";

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
    shifts: normalizeShifts(raw.shifts),
    autoReplace: getBoolean(raw, "autoReplace", true),
    autoDeleteHours: getNumber(raw, "autoDeleteHours") || 24,
    status: getString(raw, "status") === "completed" ? "completed" : "active",
    createdAt: getNumber(raw, "createdAt"),
    completedAt: raw.completedAt !== undefined ? getNumber(raw, "completedAt") : undefined,
  };
}

export function readGroups(key: string): WorkforceGroup[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeGroup)
    .filter((group): group is WorkforceGroup => group !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function normalizeMember(raw: unknown): WorkforceGroupMember | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const groupId = getString(raw, "groupId");

  if (!id || !groupId) return null;

  const statusRaw = getString(raw, "status");
  const status =
    statusRaw === "exited" || statusRaw === "replaced"
      ? (statusRaw as WorkforceGroupMember["status"])
      : "active";

  const postEventRatingRaw = raw.postEventRating;

  return {
    id,
    groupId,
    staffId: getString(raw, "staffId"),
    employeeUniqueId: getString(raw, "employeeUniqueId"),
    employeeName: getString(raw, "employeeName"),
    categoryId: getString(raw, "categoryId"),
    assignedShiftIds: getStringArray(raw, "assignedShiftIds"),
    status,
    exitedAt: raw.exitedAt !== undefined ? getNumber(raw, "exitedAt") : undefined,
    exitReason: (getString(raw, "exitReason") as WorkforceGroupMember["exitReason"]) || undefined,
    exitNote: getString(raw, "exitNote") || undefined,
    postEventRating:
      typeof postEventRatingRaw === "number" && postEventRatingRaw >= 1 && postEventRatingRaw <= 5
        ? postEventRatingRaw
        : undefined,
    postEventComment: getString(raw, "postEventComment") || undefined,
  };
}

export function readMembers(key: string): WorkforceGroupMember[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeMember)
    .filter((member): member is WorkforceGroupMember => member !== null);
}

export function normalizeAttendance(raw: unknown): AttendanceRecord | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const groupId = getString(raw, "groupId");

  if (!id || !groupId) return null;

  const signOutRaw = raw.signOutAt;
  const signOutAt = typeof signOutRaw === "number" && signOutRaw > 0 ? signOutRaw : null;

  const hoursRaw = raw.hoursWorked;
  const hoursWorked = typeof hoursRaw === "number" && hoursRaw >= 0 ? hoursRaw : null;

  const signOutTypeRaw = getString(raw, "signOutType");
  const validTypes = new Set(["manual", "auto", "employer_set"]);

  return {
    id,
    groupId,
    memberId: getString(raw, "memberId"),
    employeeUniqueId: getString(raw, "employeeUniqueId"),
    shiftId: getString(raw, "shiftId"),
    signInAt: getNumber(raw, "signInAt"),
    signOutAt,
    signOutType: validTypes.has(signOutTypeRaw)
      ? (signOutTypeRaw as AttendanceRecord["signOutType"])
      : null,
    hoursWorked,
  };
}

export function readAttendance(key: string): AttendanceRecord[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeAttendance)
    .filter((attendance): attendance is AttendanceRecord => attendance !== null);
}

export function normalizeMessage(raw: unknown): WorkforceMessage | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw, "id");
  const groupId = getString(raw, "groupId");
  const text = getString(raw, "text");

  if (!id || !groupId || !text) return null;

  return {
    id,
    groupId,
    senderType: getString(raw, "senderType") === "employee" ? "employee" : "employer",
    senderName: getString(raw, "senderName"),
    senderId: getString(raw, "senderId"),
    text,
    createdAt: getNumber(raw, "createdAt"),
    isUrgent: getBoolean(raw, "isUrgent", false),
  };
}

export function readMessages(key: string): WorkforceMessage[] {
  return safeParse<unknown>(safeRead(key))
    .map(normalizeMessage)
    .filter((message): message is WorkforceMessage => message !== null)
    .sort((a, b) => a.createdAt - b.createdAt);
}

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
  return safeParse<unknown>(safeRead(key))
    .map(normalizeActivity)
    .filter((activity): activity is WorkforceActivityEntry => activity !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}
