// src/features/employer/workforceOps/services/workforceCategoryService.ts
//
// Category CRUD for Workforce Ops Hub.
// Manages role categories (Manager, Barman, Runner, etc.)

import type { WorkforceCategory } from "../types/workforceTypes";
import {
  WF_CATEGORIES_KEY,
  WF_CATEGORIES_CHANGED,
  safeWrite,
  safeDispatch,
  uid,
} from "../helpers/workforceStorageUtils";
import { readCategories } from "../helpers/workforceNormalizers";
import { validateCategoryName } from "../helpers/workforceValidation";

// ─────────────────────────────────────────────────────────────────────────────
// Default Suggestions
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CATEGORY_SUGGESTIONS: readonly string[] = [
  "Supervisor",
  "Team Lead",
  "Senior Staff",
  "General Staff",
  "Support Staff",
  "Helper",
  "Other",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): WorkforceCategory[] {
  return readCategories(WF_CATEGORIES_KEY);
}

function write(categories: WorkforceCategory[]): void {
  safeWrite(WF_CATEGORIES_KEY, categories);
  safeDispatch(WF_CATEGORIES_CHANGED);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const workforceCategoryService = {
  getAll(): WorkforceCategory[] {
    return read();
  },

  getById(categoryId: string): WorkforceCategory | null {
    return read().find((c) => c.id === categoryId) ?? null;
  },

  create(name: string): { success: boolean; id?: string; errors?: string[] } {
    const existing = read();
    const validation = validateCategoryName(name, existing);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const maxOrder = existing.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    const category: WorkforceCategory = {
      id: uid("wc"),
      name: name.trim(),
      createdAt: Date.now(),
      sortOrder: maxOrder + 1,
    };

    write([...existing, category]);
    return { success: true, id: category.id };
  },

  rename(categoryId: string, newName: string): { success: boolean; errors?: string[] } {
    const existing = read();
    const validation = validateCategoryName(newName, existing, categoryId);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const updated = existing.map((c) =>
      c.id === categoryId ? { ...c, name: newName.trim() } : c,
    );
    write(updated);
    return { success: true };
  },

  delete(categoryId: string, staffList: { categories: string[] }[], force = false): { success: boolean; assignedCount?: number; errors?: string[] } {
    const assignedCount = staffList.filter(
      (s) => s.categories.includes(categoryId),
    ).length;

    if (assignedCount > 0 && !force) {
      return {
        success: false,
        assignedCount,
        errors: [`${assignedCount} staff member${assignedCount !== 1 ? "s are" : " is"} assigned to this category.`],
      };
    }

    const existing = read();
    write(existing.filter((c) => c.id !== categoryId));
    return { success: true, assignedCount: 0 };
  },

  reorder(orderedIds: string[]): void {
    const existing = read();
    const reordered = orderedIds
      .map((id, index) => {
        const cat = existing.find((c) => c.id === id);
        return cat ? { ...cat, sortOrder: index } : null;
      })
      .filter((c): c is WorkforceCategory => c !== null);

    const remaining = existing.filter((c) => !orderedIds.includes(c.id));
    write([...reordered, ...remaining]);
  },

  seedDefaults(): void {
    const existing = read();
    if (existing.length > 0) return;

    const defaults: WorkforceCategory[] = DEFAULT_CATEGORY_SUGGESTIONS.map((name, i) => ({
      id: uid("wc"),
      name,
      createdAt: Date.now(),
      sortOrder: i,
    }));
    write(defaults);
  },

  _events: {
    changed: WF_CATEGORIES_CHANGED,
  },
} as const;