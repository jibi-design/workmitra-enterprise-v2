// src/features/employer/myStaff/storage/myStaff.storage.ts — facade

export type {
  StaffStatus,
  StaffExitReason,
  StaffEmploymentType,
  StaffDepartmentHistoryEntry,
  StaffRecord,
  StaffDepartment,
  StaffCategory,
} from "./myStaff.types";

import type {
  StaffCategory,
  StaffDepartment,
  StaffDepartmentHistoryEntry,
  StaffExitReason,
  StaffRecord,
} from "./myStaff.types";
import {
  CATEGORIES_KEY,
  CHANGED_EVENT,
  DEPARTMENTS_KEY,
  STAFF_KEY,
  genId,
  normalizeName,
  readCategories,
  readDepartments,
  readStaff,
  sortByNewest,
  writeCategories,
  writeDepartments,
  writeStaff,
} from "./myStaff.storage.internal";

export function restoreStaffRecords(records: StaffRecord[]): void {
  writeStaff(records);
}

export const myStaffStorage = {
  getAll(): StaffRecord[] {
    return sortByNewest(readStaff());
  },

  getActive(): StaffRecord[] {
    return sortByNewest(
      readStaff().filter(
        (r) =>
          r.status === "joining_pending" ||
          r.status === "active" ||
          r.status === "probation" ||
          r.status === "resignation_pending" ||
          r.status === "notice_period",
      ),
    );
  },

  getActiveCount(): number {
    return readStaff().filter(
      (r) =>
        r.status === "active" ||
        r.status === "probation" ||
        r.status === "resignation_pending" ||
        r.status === "notice_period",
    ).length;
  },

  findByUniqueId(uniqueId: string): StaffRecord | null {
    return readStaff().find((r) => r.employeeUniqueId === uniqueId) ?? null;
  },

  findByCareerPostId(postId: string): StaffRecord | null {
    return readStaff().find((r) => r.careerPostId === postId) ?? null;
  },

  findByShiftPostId(postId: string): StaffRecord | null {
    return readStaff().find((r) => r.shiftPostId === postId) ?? null;
  },

  addStaff(data: Omit<StaffRecord, "id" | "createdAt" | "updatedAt">): string {
    const now = Date.now();
    const id = genId("stf");
    const record: StaffRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    writeStaff([record, ...readStaff()]);
    return id;
  },

  updateStaff(id: string, patch: Partial<StaffRecord>): boolean {
    const all = readStaff();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    all[idx] = { ...all[idx], ...patch, updatedAt: Date.now() };
    writeStaff(all);
    return true;
  },

  endEmployment(
    id: string,
    exitReason: StaffExitReason,
    exitedAt: number,
    rating?: number,
    comment?: string,
  ): boolean {
    return this.updateStaff(id, {
      status: "exited",
      exitReason,
      exitedAt,
      employerRating: rating,
      employerComment: comment,
    });
  },

  acceptResignation(id: string, exitedAt: number, rating?: number, comment?: string): boolean {
    return this.updateStaff(id, {
      status: "exited",
      exitReason: "resigned",
      exitedAt,
      employerRating: rating,
      employerComment: comment,
    });
  },

  getDepartments(): StaffDepartment[] {
    return readDepartments().sort((a, b) => a.name.localeCompare(b.name));
  },

  addDepartment(name: string): string {
    const normalized = normalizeName(name);
    if (!normalized) return "";

    const all = readDepartments();
    const existing = all.find((dept) => dept.name.toLowerCase() === normalized.toLowerCase());
    if (existing) return existing.id;

    const now = Date.now();
    const department: StaffDepartment = {
      id: genId("dep"),
      name: normalized,
      createdAt: now,
      updatedAt: now,
    };

    writeDepartments([...all, department]);
    return department.id;
  },

  renameDepartment(id: string, name: string): boolean {
    const normalized = normalizeName(name);
    if (!normalized) return false;

    const all = readDepartments();
    const exists = all.some(
      (dept) => dept.id !== id && dept.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (exists) return false;

    const next = all.map((dept) =>
      dept.id === id ? { ...dept, name: normalized, updatedAt: Date.now() } : dept,
    );

    if (JSON.stringify(next) === JSON.stringify(all)) return false;

    writeDepartments(next);

    const staff = readStaff();
    const updatedStaff = staff.map((record) =>
      record.departmentId === id
        ? { ...record, departmentName: normalized, updatedAt: Date.now() }
        : record,
    );
    writeStaff(updatedStaff);

    return true;
  },

  assignStaffDepartment(staffId: string, departmentId: string, note?: string): boolean {
    const department = readDepartments().find((item) => item.id === departmentId);
    if (!department) return false;

    const all = readStaff();
    const index = all.findIndex((record) => record.id === staffId);
    if (index === -1) return false;

    const record = all[index];
    const now = Date.now();

    if (record.departmentId === department.id) return true;

    const historyEntry: StaffDepartmentHistoryEntry = {
      id: genId("dh"),
      fromDepartmentId: record.departmentId,
      fromDepartmentName: record.departmentName,
      toDepartmentId: department.id,
      toDepartmentName: department.name,
      movedAt: now,
      note: note?.trim() || undefined,
    };

    all[index] = {
      ...record,
      departmentId: department.id,
      departmentName: department.name,
      departmentHistory: [historyEntry, ...(record.departmentHistory ?? [])],
      updatedAt: now,
    };

    writeStaff(all);
    return true;
  },

  clearStaffDepartment(staffId: string): boolean {
    const all = readStaff();
    const index = all.findIndex((record) => record.id === staffId);
    if (index === -1) return false;

    const record = all[index];
    if (!record.departmentId && !record.departmentName) return true;

    all[index] = {
      ...record,
      departmentId: undefined,
      departmentName: undefined,
      updatedAt: Date.now(),
    };

    writeStaff(all);
    return true;
  },

  getCategories(): StaffCategory[] {
    return readCategories().sort((a, b) => a.name.localeCompare(b.name));
  },

  addCategory(name: string): string {
    const normalized = normalizeName(name);
    if (!normalized) return "";

    const all = readCategories();
    const exists = all.some((c) => c.name.toLowerCase() === normalized.toLowerCase());
    if (exists) return "";

    const cat: StaffCategory = { id: genId("cat"), name: normalized, createdAt: Date.now() };
    writeCategories([...all, cat]);
    return cat.id;
  },

  deleteCategory(id: string): boolean {
    const all = readCategories();
    const filtered = all.filter((c) => c.id !== id);
    if (filtered.length === all.length) return false;

    writeCategories(filtered);
    return true;
  },

  subscribe(cb: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === STAFF_KEY ||
        event.key === DEPARTMENTS_KEY ||
        event.key === CATEGORIES_KEY
      ) {
        cb();
      }
    };

    window.addEventListener(CHANGED_EVENT, cb);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CHANGED_EVENT, cb);
      window.removeEventListener("storage", handleStorage);
    };
  },

  CHANGED_EVENT,
} as const;
