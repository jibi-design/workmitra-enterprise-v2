import type {
  AnnouncementStatus,
  WorkforceActivityKind,
  WorkforceAnnouncement,
} from "../../../../shared/domains/workforce/types/workforceTypes";

import { WF_ANNOUNCEMENTS_CHANGED } from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

import {
  canTransition,
  logActivity,
  readAnnouncementsList,
  writeAnnouncements,
} from "./workforceAnnouncementService.internal";

export function updateAnnouncementStatus(
  announcementId: string,
  newStatus: AnnouncementStatus,
): { success: boolean; errors?: string[] } {
  const all = readAnnouncementsList();
  const target = all.find((a) => a.id === announcementId);
  if (!target) {
    return { success: false, errors: ["Announcement not found."] };
  }

  if (!canTransition(target.status, newStatus)) {
    return {
      success: false,
      errors: [`Cannot change status from "${target.status}" to "${newStatus}".`],
    };
  }

  const now = Date.now();
  const updated = all.map((a) => {
    if (a.id !== announcementId) return a;
    const patched = { ...a, status: newStatus };
    if (newStatus === "confirmed") patched.confirmedAt = now;
    if (newStatus === "completed") patched.completedAt = now;
    return patched;
  });

  writeAnnouncements(updated);

  const activityMap: Partial<
    Record<AnnouncementStatus, { kind: WorkforceActivityKind; label: string }>
  > = {
    confirmed: { kind: "announcement_confirmed", label: "confirmed" },
    completed: { kind: "announcement_completed", label: "completed" },
    cancelled: { kind: "announcement_cancelled", label: "cancelled" },
  };

  const activityInfo = activityMap[newStatus];
  if (activityInfo) {
    logActivity(
      activityInfo.kind,
      `Announcement ${activityInfo.label}: ${target.title}`,
      `Date: ${target.date}`,
    );
  }

  return { success: true };
}

export function toggleAnnouncementAutoReplace(announcementId: string): {
  success: boolean;
  errors?: string[];
} {
  const all = readAnnouncementsList();
  const target = all.find((a) => a.id === announcementId);
  if (!target) {
    return { success: false, errors: ["Announcement not found."] };
  }

  if (target.status === "completed" || target.status === "cancelled") {
    return {
      success: false,
      errors: ["Cannot modify a completed or cancelled announcement."],
    };
  }

  const updated = all.map((a) =>
    a.id === announcementId ? { ...a, autoReplace: !a.autoReplace } : a,
  );
  writeAnnouncements(updated);
  return { success: true };
}

export function countAnnouncementsByStatus(): Record<AnnouncementStatus, number> {
  const all = readAnnouncementsList();
  const counts: Record<AnnouncementStatus, number> = {
    open: 0,
    analyzing: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const a of all) {
    counts[a.status] += 1;
  }
  return counts;
}

export function getAnnouncementTotalVacancy(announcementId: string): number {
  const source = readAnnouncementsList().find((a) => a.id === announcementId);
  if (!source) return 0;
  let total = 0;
  for (const catId of source.targetCategories) {
    const shiftMap = source.vacancyPerCategoryPerShift[catId];
    if (!shiftMap) continue;
    for (const shift of source.shifts) {
      total += shiftMap[shift.id] ?? 0;
    }
  }
  return total;
}

export function queryAnnouncements() {
  return {
    getAll(): WorkforceAnnouncement[] {
      return readAnnouncementsList();
    },

    getById(announcementId: string): WorkforceAnnouncement | null {
      return readAnnouncementsList().find((a) => a.id === announcementId) ?? null;
    },

    getByStatus(status: AnnouncementStatus): WorkforceAnnouncement[] {
      return readAnnouncementsList().filter((a) => a.status === status);
    },

    getActiveAnnouncements(): WorkforceAnnouncement[] {
      return readAnnouncementsList().filter(
        (a) => a.status !== "completed" && a.status !== "cancelled",
      );
    },

    getConfirmedForDate(date: string): WorkforceAnnouncement[] {
      return readAnnouncementsList().filter((a) => a.date === date && a.status === "confirmed");
    },
  };
}

export { WF_ANNOUNCEMENTS_CHANGED };
