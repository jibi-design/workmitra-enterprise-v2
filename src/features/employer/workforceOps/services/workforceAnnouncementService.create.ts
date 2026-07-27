import type {
  WorkforceAnnouncement,
  WorkforceTemplate,
} from "../../../../shared/domains/workforce/types/workforceTypes";

import {
  WF_TEMPLATES_KEY,
  WF_TEMPLATES_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../../../../shared/domains/workforce/storage/workforceStorageUtils";

import { readTemplates } from "../../../../shared/domains/workforce/helpers/workforceNormalizers";

import {
  validateAnnouncementStep1,
  validateAnnouncementStep2,
  validateAnnouncementStep3,
  validateShifts,
} from "../../../../shared/domains/workforce/validation/workforceValidation";

import type { CreateAnnouncementPayload } from "./workforceAnnouncementService.types";
import {
  logActivity,
  readAnnouncementsList,
  writeAnnouncements,
} from "./workforceAnnouncementService.internal";

export function createAnnouncement(payload: CreateAnnouncementPayload): {
  success: boolean;
  id?: string;
  errors?: string[];
} {
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

  writeAnnouncements([announcement, ...readAnnouncementsList()]);

  logActivity(
    "announcement_created",
    `Announcement created: ${announcement.title}`,
    `Date: ${announcement.date} | Categories: ${announcement.targetCategories.length} | Shifts: ${announcement.shifts.length}`,
  );

  return { success: true, id: announcement.id };
}

export function cloneAnnouncement(
  sourceId: string,
  overrides: Partial<CreateAnnouncementPayload>,
): { success: boolean; id?: string; errors?: string[] } {
  const source = readAnnouncementsList().find((a) => a.id === sourceId);
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

  const result = createAnnouncement(payload);

  if (result.success && result.id) {
    const all = readAnnouncementsList();
    const updated = all.map((a) => (a.id === result.id ? { ...a, clonedFrom: sourceId } : a));
    writeAnnouncements(updated);
  }

  return result;
}

export function createAnnouncementFromTemplate(
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

  return createAnnouncement(payload);
}

export function saveAnnouncementAsTemplate(
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

  const source = readAnnouncementsList().find((a) => a.id === announcementId);
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

  const allAnnouncements = readAnnouncementsList();
  const updatedAnnouncements = allAnnouncements.map((a) =>
    a.id === announcementId ? { ...a, isTemplate: true, templateName: trimmedName } : a,
  );
  writeAnnouncements(updatedAnnouncements);

  return { success: true, templateId: template.id };
}
