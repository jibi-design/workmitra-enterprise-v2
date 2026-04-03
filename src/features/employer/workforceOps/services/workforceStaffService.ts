// src/features/employer/workforceOps/services/workforceStaffService.ts
//
// Staff directory CRUD for Workforce Ops Hub.
// Add/remove staff, assign categories, rate (weighted average), bio/notes.

import type { WorkforceStaff, WorkforceActivityEntry } from "../types/workforceTypes";
import {
  WF_STAFF_KEY,
  WF_STAFF_CHANGED,
  WF_ACTIVITY_KEY,
  WF_ACTIVITY_CHANGED,
  EMPLOYEE_NOTIF_KEY,
  EMPLOYEE_NOTIF_CHANGED,
  safeWrite,
  safeDispatch,
  safeParse,
  safeRead,
  uid,
} from "../helpers/workforceStorageUtils";
import { readStaff, readActivity } from "../helpers/workforceNormalizers";
import { validateAddStaff, validateStaffRating } from "../helpers/workforceValidation";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): WorkforceStaff[] {
  return readStaff(WF_STAFF_KEY);
}

function write(staff: WorkforceStaff[]): void {
  safeWrite(WF_STAFF_KEY, staff);
  safeDispatch(WF_STAFF_CHANGED);
}

function pushActivity(entry: Omit<WorkforceActivityEntry, "id" | "createdAt">): void {
  const existing = readActivity(WF_ACTIVITY_KEY);
  const item: WorkforceActivityEntry = {
    id: uid("wa"),
    ...entry,
    createdAt: Date.now(),
  };
  safeWrite(WF_ACTIVITY_KEY, [item, ...existing].slice(0, 300));
  safeDispatch(WF_ACTIVITY_CHANGED);
}

function pushEmployeeNotification(title: string, body: string, route?: string): void {
  const existing = safeParse<Record<string, unknown>>(safeRead(EMPLOYEE_NOTIF_KEY));
  const note = {
    id: uid("n"),
    domain: "workforce" as const,
    title,
    body,
    createdAt: Date.now(),
    isRead: false,
    route,
  };
  safeWrite(EMPLOYEE_NOTIF_KEY, [note, ...existing].slice(0, 100));
  safeDispatch(EMPLOYEE_NOTIF_CHANGED);
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee Profile Lookup (Phase-0: from localStorage)
// ─────────────────────────────────────────────────────────────────────────────

type EmployeeSnapshot = {
  found: boolean;
  fullName: string;
  city: string;
  skills: string[];
};

function lookupEmployee(uniqueId: string): EmployeeSnapshot {
  try {
    const raw = localStorage.getItem("wm_employee_profile_v1");
    if (!raw) return { found: false, fullName: "", city: "", skills: [] };
    const profile = JSON.parse(raw) as Record<string, unknown>;
    if (typeof profile !== "object" || profile === null) return { found: false, fullName: "", city: "", skills: [] };

    const profileId = typeof profile["uniqueId"] === "string" ? profile["uniqueId"] : "";
    if (profileId !== uniqueId) return { found: false, fullName: "", city: "", skills: [] };

    return {
      found: true,
      fullName: typeof profile["fullName"] === "string" ? profile["fullName"] : "",
      city: typeof profile["city"] === "string" ? profile["city"] : "",
      skills: Array.isArray(profile["skills"])
        ? (profile["skills"] as unknown[]).filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch {
    return { found: false, fullName: "", city: "", skills: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const workforceStaffService = {
  getAll(): WorkforceStaff[] {
    return read().filter((s) => s.status === "active");
  },

  getAllIncludingRemoved(): WorkforceStaff[] {
    return read();
  },

  getById(staffId: string): WorkforceStaff | null {
    return read().find((s) => s.id === staffId) ?? null;
  },

  getByEmployeeId(employeeUniqueId: string): WorkforceStaff | null {
    return read().find((s) => s.employeeUniqueId === employeeUniqueId && s.status === "active") ?? null;
  },

  getByCategory(categoryId: string): WorkforceStaff[] {
    return this.getAll().filter((s) => s.categories.includes(categoryId));
  },

  lookupEmployee(uniqueId: string): EmployeeSnapshot {
    return lookupEmployee(uniqueId);
  },

  add(input: {
    employeeUniqueId: string;
    categories: string[];
    bio?: string;
    plusPoints?: string;
    rating?: number;
    ratingComment?: string;
  }): { success: boolean; id?: string; errors?: string[] } {
    const existing = read();
    const validation = validateAddStaff(input.employeeUniqueId, input.categories, existing);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const snapshot = lookupEmployee(input.employeeUniqueId.trim());

    const staff: WorkforceStaff = {
      id: uid("ws"),
      employeeUniqueId: input.employeeUniqueId.trim(),
      employeeName: snapshot.fullName || input.employeeUniqueId.trim(),
      employeeCity: snapshot.city,
      employeeSkills: snapshot.skills,
      categories: input.categories,
      rating: input.rating !== undefined && input.rating >= 1 && input.rating <= 5 ? input.rating : null,
      ratingCount: input.rating !== undefined ? 1 : 0,
      ratingComment: input.ratingComment?.trim() ?? "",
      plusPoints: input.plusPoints?.trim() ?? "",
      bio: input.bio?.trim() ?? "",
      addedAt: Date.now(),
      status: "active",
    };

    write([staff, ...existing]);

    pushActivity({
      kind: "staff_added",
      title: "Staff added",
      body: `${staff.employeeName} (${staff.employeeUniqueId}) added to workforce.`,
    });

    pushEmployeeNotification(
      "Added to workforce",
      `You have been added to a company workforce directory.`,
    );

    return { success: true, id: staff.id };
  },

  updateCategories(staffId: string, categories: string[]): void {
    const list = read();
    write(list.map((s) => s.id === staffId ? { ...s, categories } : s));
  },

  updateBio(staffId: string, bio: string, plusPoints: string, ratingComment: string): void {
    const list = read();
    write(list.map((s) =>
      s.id === staffId
        ? { ...s, bio: bio.trim(), plusPoints: plusPoints.trim(), ratingComment: ratingComment.trim() }
        : s,
    ));
  },

  rate(staffId: string, newRating: number): { success: boolean; errors?: string[] } {
    const validation = validateStaffRating(newRating);
    if (!validation.valid) return { success: false, errors: validation.errors };

    const list = read();
    const staff = list.find((s) => s.id === staffId);
    if (!staff) return { success: false, errors: ["Staff not found."] };

    const oldRating = staff.rating ?? 0;
    const oldCount = staff.ratingCount ?? 0;
    const weightedAvg = oldCount > 0
      ? Math.round(((oldRating * oldCount + newRating) / (oldCount + 1)) * 10) / 10
      : newRating;

    write(list.map((s) =>
      s.id === staffId
        ? { ...s, rating: weightedAvg, ratingCount: oldCount + 1 }
        : s,
    ));

    pushActivity({
      kind: "staff_rated",
      title: "Staff rated",
      body: `${staff.employeeName} rated ${newRating}/5. Average: ${weightedAvg}/5.`,
    });

    return { success: true };
  },

  remove(staffId: string, reason?: string): void {
    const list = read();
    const staff = list.find((s) => s.id === staffId);
    if (!staff) return;

    write(list.map((s) =>
      s.id === staffId
        ? { ...s, status: "removed" as const, removedAt: Date.now() }
        : s,
    ));

    pushActivity({
      kind: "staff_removed",
      title: "Staff removed",
      body: `${staff.employeeName} (${staff.employeeUniqueId}) removed.${reason ? ` Reason: ${reason}` : ""}`,
    });

    pushEmployeeNotification(
      "Removed from workforce",
      "You have been removed from a company workforce directory.",
    );
  },

  _events: {
    changed: WF_STAFF_CHANGED,
  },
} as const;