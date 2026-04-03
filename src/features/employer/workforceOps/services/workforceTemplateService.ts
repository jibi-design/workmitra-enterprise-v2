// src/features/employer/workforceOps/services/workforceTemplateService.ts
//
// Template CRUD for Workforce Ops Hub (IMP-2).
// Save/load/delete announcement templates for quick reuse.

import type { WorkforceTemplate, AnnouncementShift } from "../types/workforceTypes";
import {
  WF_TEMPLATES_KEY,
  WF_TEMPLATES_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../helpers/workforceStorageUtils";
import { readTemplates } from "../helpers/workforceNormalizers";

// ─────────────────────────────────────────────────────────────────────────────
// Internal
// ─────────────────────────────────────────────────────────────────────────────

function read(): WorkforceTemplate[] {
  return readTemplates(WF_TEMPLATES_KEY);
}

function write(templates: WorkforceTemplate[]): void {
  safeWrite(WF_TEMPLATES_KEY, templates);
  safeDispatch(WF_TEMPLATES_CHANGED);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const workforceTemplateService = {
  getAll(): WorkforceTemplate[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  getById(templateId: string): WorkforceTemplate | null {
    return read().find((t) => t.id === templateId) ?? null;
  },

  save(input: {
    name: string;
    targetCategories: string[];
    shifts: AnnouncementShift[];
    vacancyPerCategoryPerShift: Record<string, Record<string, number>>;
    waitingBuffer: number;
    titlePattern: string;
    description: string;
    location: string;
  }): { success: boolean; id?: string; errors?: string[] } {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      return { success: false, errors: ["Template name is required."] };
    }

    if (trimmedName.length > 60) {
      return { success: false, errors: ["Template name must be 60 characters or less."] };
    }

    const existing = read();
    const duplicate = existing.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) {
      return { success: false, errors: ["A template with this name already exists."] };
    }

    const template: WorkforceTemplate = {
      id: uid("wt"),
      name: trimmedName,
      targetCategories: input.targetCategories,
      shifts: input.shifts,
      vacancyPerCategoryPerShift: input.vacancyPerCategoryPerShift,
      waitingBuffer: input.waitingBuffer,
      titlePattern: input.titlePattern.trim(),
      description: input.description.trim(),
      location: input.location.trim(),
      createdAt: Date.now(),
    };

    write([template, ...existing]);
    return { success: true, id: template.id };
  },

  delete(templateId: string): void {
    const existing = read();
    write(existing.filter((t) => t.id !== templateId));
  },

  rename(templateId: string, newName: string): { success: boolean; errors?: string[] } {
    const trimmed = newName.trim();
    if (!trimmed) return { success: false, errors: ["Template name is required."] };

    const existing = read();
    const duplicate = existing.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== templateId,
    );
    if (duplicate) return { success: false, errors: ["A template with this name already exists."] };

    write(existing.map((t) => t.id === templateId ? { ...t, name: trimmed } : t));
    return { success: true };
  },

  _events: {
    changed: WF_TEMPLATES_CHANGED,
  },
} as const;