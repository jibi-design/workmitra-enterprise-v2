import type {
  AnnouncementStatus,
  WorkforceActivityEntry,
  WorkforceActivityKind,
  WorkforceAnnouncement,
} from "../../../../shared/domains/workforce/types/workforceTypes";

import {
  WF_ANNOUNCEMENTS_KEY,
  WF_ANNOUNCEMENTS_CHANGED,
  WF_ACTIVITY_KEY,
  WF_ACTIVITY_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

import {
  readAnnouncements,
  readActivity,
} from "../../../../shared/domains/workforce/helpers/workforceNormalizers";

const VALID_TRANSITIONS: Record<AnnouncementStatus, AnnouncementStatus[]> = {
  open: ["analyzing", "cancelled"],
  analyzing: ["confirmed", "open", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function readAnnouncementsList(): WorkforceAnnouncement[] {
  return readAnnouncements(WF_ANNOUNCEMENTS_KEY);
}

export function writeAnnouncements(announcements: WorkforceAnnouncement[]): void {
  safeWrite(WF_ANNOUNCEMENTS_KEY, announcements);
  safeDispatch(WF_ANNOUNCEMENTS_CHANGED);
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

export function canTransition(from: AnnouncementStatus, to: AnnouncementStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
