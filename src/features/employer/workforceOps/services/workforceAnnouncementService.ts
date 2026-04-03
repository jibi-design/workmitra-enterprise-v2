// src/features/employer/workforceOps/services/workforceAnnouncementService.ts
//
// Announcement CRUD + status transitions for Workforce Ops Hub.
// Manages the full lifecycle: create → open → analyzing → confirmed → completed / cancelled.

import type {
  WorkforceAnnouncement,
  AnnouncementShift,
  AnnouncementStatus,
  WorkforceTemplate,
  WorkforceActivityEntry,
  WorkforceActivityKind,
} from "../types/workforceTypes";

import {
  WF_ANNOUNCEMENTS_KEY,
  WF_ANNOUNCEMENTS_CHANGED,
  WF_TEMPLATES_KEY,
  WF_TEMPLATES_CHANGED,
  WF_ACTIVITY_KEY,
  WF_ACTIVITY_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../helpers/workforceStorageUtils";

import {
  readAnnouncements,
  readTemplates,
  readActivity,
} from "../helpers/workforceNormalizers";

import {
  validateAnnouncementStep1,
  validateAnnouncementStep2,
  validateAnnouncementStep3,
  validateShifts,
} from "../helpers/workforceValidation";

// ─────────────────────────────────────────────────────────────────────────────
// Types — Create Payload
// ─────────────────────────────────────────────────────────────────────────────

export type CreateAnnouncementPayload = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  targetCategories: string[];
  shifts: AnnouncementShift[];
  vacancyPerCategoryPerShift: Record<string, Record<string, number>>;
  waitingBuffer: number;
  autoReplace: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): WorkforceAnnouncement[] {
  return readAnnouncements(WF_ANNOUNCEMENTS_KEY);
}

function write(announcements: WorkforceAnnouncement[]): void {
  safeWrite(WF_ANNOUNCEMENTS_KEY, announcements);
  safeDispatch(WF_ANNOUNCEMENTS_CHANGED);
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Log Helper
// ─────────────────────────────────────────────────────────────────────────────

function logActivity(
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

// ─────────────────────────────────────────────────────────────────────────────
// Status Transition Map (one-directional)
// ─────────────────────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<AnnouncementStatus, AnnouncementStatus[]> = {
  open: ["analyzing", "cancelled"],
  analyzing: ["confirmed", "open", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function canTransition(from: AnnouncementStatus, to: AnnouncementStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const workforceAnnouncementService = {
  // ── Reads ──────────────────────────────────────────────────────────────

  getAll(): WorkforceAnnouncement[] {
    return read();
  },

  getById(announcementId: string): WorkforceAnnouncement | null {
    return read().find((a) => a.id === announcementId) ?? null;
  },

  getByStatus(status: AnnouncementStatus): WorkforceAnnouncement[] {
    return read().filter((a) => a.status === status);
  },

  getActiveAnnouncements(): WorkforceAnnouncement[] {
    return read().filter((a) => a.status !== "completed" && a.status !== "cancelled");
  },

  getConfirmedForDate(date: string): WorkforceAnnouncement[] {
    return read().filter((a) => a.date === date && a.status === "confirmed");
  },

  // ── Create ─────────────────────────────────────────────────────────────

  create(
    payload: CreateAnnouncementPayload,
  ): { success: boolean; id?: string; errors?: string[] } {
    const allErrors: string[] = [];

    const step1 = validateAnnouncementStep1(payload.targetCategories);
    if (!step1.valid) allErrors.push(...step1.errors);

    const shiftVal = validateShifts(payload.shifts);
    if (!shiftVal.valid) allErrors.push(...shiftVal.errors);

    if (step1.valid && shiftVal.valid) {
      const step2 = validateAnnouncementStep2(
        payload.vacancyPerCategoryPerShift,
        payload.targetCategories,
        payload.shifts,
      );
      if (!step2.valid) allErrors.push(...step2.errors);
    }

    const step3 = validateAnnouncementStep3(payload.title, payload.date);
    if (!step3.valid) allErrors.push(...step3.errors);

    if (allErrors.length > 0) {
      return { success: false, errors: allErrors };
    }

    const announcement: WorkforceAnnouncement = {
      id: uid("wann"),
      title: payload.title.trim(),
      date: payload.date,
      time: payload.time,
      location: payload.location.trim(),
      description: payload.description.trim(),
      targetCategories: payload.targetCategories,
      shifts: payload.shifts,
      vacancyPerCategoryPerShift: payload.vacancyPerCategoryPerShift,
      waitingBuffer: payload.waitingBuffer,
      autoReplace: payload.autoReplace,
      status: "open",
      createdAt: Date.now(),
      isTemplate: false,
    };

    write([announcement, ...read()]);

    logActivity(
      "announcement_created",
      `Announcement created: ${announcement.title}`,
      `Date: ${announcement.date} | Categories: ${announcement.targetCategories.length} | Shifts: ${announcement.shifts.length}`,
    );

    return { success: true, id: announcement.id };
  },

  // ── Clone from existing announcement ───────────────────────────────────

  clone(
    sourceId: string,
    overrides: Partial<CreateAnnouncementPayload>,
  ): { success: boolean; id?: string; errors?: string[] } {
    const source = read().find((a) => a.id === sourceId);
    if (!source) {
      return { success: false, errors: ["Source announcement not found."] };
    }

    const payload: CreateAnnouncementPayload = {
      title: overrides.title ?? source.title,
      date: overrides.date ?? source.date,
      time: overrides.time ?? source.time,
      location: overrides.location ?? source.location,
      description: overrides.description ?? source.description,
      targetCategories: overrides.targetCategories ?? source.targetCategories,
      shifts: overrides.shifts ?? source.shifts,
      vacancyPerCategoryPerShift:
        overrides.vacancyPerCategoryPerShift ?? source.vacancyPerCategoryPerShift,
      waitingBuffer: overrides.waitingBuffer ?? source.waitingBuffer,
      autoReplace: overrides.autoReplace ?? source.autoReplace,
    };

    const result = this.create(payload);

    if (result.success && result.id) {
      const all = read();
      const updated = all.map((a) =>
        a.id === result.id ? { ...a, clonedFrom: sourceId } : a,
      );
      write(updated);
    }

    return result;
  },

  // ── Clone from template ────────────────────────────────────────────────

  createFromTemplate(
    templateId: string,
    overrides: { title: string; date: string; time: string },
  ): { success: boolean; id?: string; errors?: string[] } {
    const templates = readTemplates(WF_TEMPLATES_KEY);
    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      return { success: false, errors: ["Template not found."] };
    }

    const payload: CreateAnnouncementPayload = {
      title: overrides.title || template.titlePattern,
      date: overrides.date,
      time: overrides.time,
      location: template.location,
      description: template.description,
      targetCategories: template.targetCategories,
      shifts: template.shifts.map((s) => ({ ...s, id: uid("ws") })),
      vacancyPerCategoryPerShift: template.vacancyPerCategoryPerShift,
      waitingBuffer: template.waitingBuffer,
      autoReplace: true,
    };

    return this.create(payload);
  },

  // ── Status Transitions ─────────────────────────────────────────────────

  updateStatus(
    announcementId: string,
    newStatus: AnnouncementStatus,
  ): { success: boolean; errors?: string[] } {
    const all = read();
    const target = all.find((a) => a.id === announcementId);
    if (!target) {
      return { success: false, errors: ["Announcement not found."] };
    }

    if (!canTransition(target.status, newStatus)) {
      return {
        success: false,
        errors: [
          `Cannot change status from "${target.status}" to "${newStatus}".`,
        ],
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

    write(updated);

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
  },

  // ── Toggle Auto-Replace ────────────────────────────────────────────────

  toggleAutoReplace(announcementId: string): { success: boolean; errors?: string[] } {
    const all = read();
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
    write(updated);
    return { success: true };
  },

  // ── Save as Template (IMP-2) ───────────────────────────────────────────

  saveAsTemplate(
    announcementId: string,
    templateName: string,
  ): { success: boolean; templateId?: string; errors?: string[] } {
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      return { success: false, errors: ["Template name is required."] };
    }
    if (trimmedName.length > 60) {
      return { success: false, errors: ["Template name must be 60 characters or less."] };
    }

    const source = read().find((a) => a.id === announcementId);
    if (!source) {
      return { success: false, errors: ["Announcement not found."] };
    }

    const existingTemplates = readTemplates(WF_TEMPLATES_KEY);
    const duplicateName = existingTemplates.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicateName) {
      return { success: false, errors: ["A template with this name already exists."] };
    }

    const template: WorkforceTemplate = {
      id: uid("wt"),
      name: trimmedName,
      targetCategories: source.targetCategories,
      shifts: source.shifts,
      vacancyPerCategoryPerShift: source.vacancyPerCategoryPerShift,
      waitingBuffer: source.waitingBuffer,
      titlePattern: source.title,
      description: source.description,
      location: source.location,
      createdAt: Date.now(),
    };

    safeWrite(WF_TEMPLATES_KEY, [template, ...existingTemplates]);
    safeDispatch(WF_TEMPLATES_CHANGED);

    const allAnnouncements = read();
    const updatedAnnouncements = allAnnouncements.map((a) =>
      a.id === announcementId
        ? { ...a, isTemplate: true, templateName: trimmedName }
        : a,
    );
    write(updatedAnnouncements);

    return { success: true, templateId: template.id };
  },

  // ── Counts / Analytics Helpers ─────────────────────────────────────────

  countByStatus(): Record<AnnouncementStatus, number> {
    const all = read();
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
  },

  getTotalVacancy(announcementId: string): number {
    const source = read().find((a) => a.id === announcementId);
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
  },

  // ── Events ─────────────────────────────────────────────────────────────

  _events: {
    changed: WF_ANNOUNCEMENTS_CHANGED,
  },
} as const;