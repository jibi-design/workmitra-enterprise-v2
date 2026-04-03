// src/features/employer/workforceOps/helpers/workforceValidation.ts
//
// Validation rules for Workforce Ops Hub.
// Used before write operations to ensure data integrity.

import type {
  WorkforceCategory,
  WorkforceStaff,
  WorkforceAnnouncement,
  AnnouncementShift,
} from "../types/workforceTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Result Type
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function fail(errors: string[]): ValidationResult {
  return { valid: false, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateCategoryName(name: string, existing: WorkforceCategory[], editId?: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = name.trim();

  if (!trimmed) {
    errors.push("Category name is required.");
  } else if (trimmed.length > 40) {
    errors.push("Category name must be 40 characters or less.");
  }

  const duplicate = existing.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editId,
  );
  if (duplicate) {
    errors.push("A category with this name already exists.");
  }

  return errors.length === 0 ? ok() : fail(errors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateAddStaff(
  employeeUniqueId: string,
  categories: string[],
  existingStaff: WorkforceStaff[],
): ValidationResult {
  const errors: string[] = [];
  const trimmedId = employeeUniqueId.trim();

  if (!trimmedId) {
    errors.push("Employee unique ID is required.");
  }

  if (categories.length === 0) {
    errors.push("At least one category must be assigned.");
  }

  const duplicate = existingStaff.find(
    (s) => s.employeeUniqueId === trimmedId && s.status === "active",
  );
  if (duplicate) {
    errors.push("This employee is already in your staff directory.");
  }

  return errors.length === 0 ? ok() : fail(errors);
}

export function validateStaffRating(rating: number): ValidationResult {
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return fail(["Rating must be between 1 and 5."]);
  }
  return ok();
}

// ─────────────────────────────────────────────────────────────────────────────
// Shift Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateShifts(shifts: AnnouncementShift[]): ValidationResult {
  const errors: string[] = [];

  if (shifts.length === 0) {
    errors.push("At least one shift must be defined.");
  }

  for (const shift of shifts) {
    if (!shift.name.trim()) {
      errors.push("Every shift must have a name.");
      break;
    }
    if (!shift.startTime || !shift.endTime) {
      errors.push(`Shift "${shift.name}" must have start and end time.`);
    }
  }

  const names = shifts.map((s) => s.name.trim().toLowerCase());
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    errors.push("Shift names must be unique.");
  }

  return errors.length === 0 ? ok() : fail(errors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Announcement Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateAnnouncementStep1(targetCategories: string[]): ValidationResult {
  if (targetCategories.length === 0) {
    return fail(["At least one category must be selected."]);
  }
  return ok();
}

export function validateAnnouncementStep2(
  vacancyMap: Record<string, Record<string, number>>,
  targetCategories: string[],
  shifts: AnnouncementShift[],
): ValidationResult {
  const errors: string[] = [];
  let totalVacancy = 0;

  for (const catId of targetCategories) {
    const shiftMap = vacancyMap[catId];
    if (!shiftMap) {
      errors.push("Vacancy must be set for all selected categories.");
      break;
    }
    for (const shift of shifts) {
      const count = shiftMap[shift.id] ?? 0;
      totalVacancy += count;
    }
  }

  if (totalVacancy === 0 && errors.length === 0) {
    errors.push("Total vacancy must be at least 1.");
  }

  return errors.length === 0 ? ok() : fail(errors);
}

export function validateAnnouncementStep3(title: string, date: string): ValidationResult {
  const errors: string[] = [];

  if (!title.trim()) {
    errors.push("Announcement title is required.");
  } else if (title.trim().length > 100) {
    errors.push("Title must be 100 characters or less.");
  }

  if (!date) {
    errors.push("Event date is required.");
  }

  return errors.length === 0 ? ok() : fail(errors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Group Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateQuickGroup(name: string, staffIds: string[]): ValidationResult {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push("Group name is required.");
  } else if (name.trim().length > 80) {
    errors.push("Group name must be 80 characters or less.");
  }

  if (staffIds.length === 0) {
    errors.push("At least one staff member must be selected.");
  }

  return errors.length === 0 ? ok() : fail(errors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Conflict Check (IMP-1)
// ─────────────────────────────────────────────────────────────────────────────

export function checkDateConflict(
  _employeeUniqueId: string,
  eventDate: string,
  confirmedAnnouncements: WorkforceAnnouncement[],
): boolean {
  return confirmedAnnouncements.some(
    (a) => a.date === eventDate && a.status === "confirmed",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateMessage(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return fail(["Message cannot be empty."]);
  }
  if (trimmed.length > 500) {
    return fail(["Message must be 500 characters or less."]);
  }
  return ok();
}

// ─────────────────────────────────────────────────────────────────────────────
// Post-Event Rating Validation (IMP-4)
// ─────────────────────────────────────────────────────────────────────────────

export function validatePostEventRating(rating: number, comment: string): ValidationResult {
  const errors: string[] = [];
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5.");
  }
  if (comment.length > 200) {
    errors.push("Comment must be 200 characters or less.");
  }
  return errors.length === 0 ? ok() : fail(errors);
}