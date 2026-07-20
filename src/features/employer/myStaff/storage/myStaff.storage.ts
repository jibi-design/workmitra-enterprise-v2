// src/features/employer/myStaff/storage/myStaff.storage.ts
//
// Employer's staff management storage.
// Stores all active/exited staff across Career Jobs hires + manual additions.
// Supports custom departments, department assignment, Unique ID search, and exit processing.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StaffStatus =
  "joining_pending" | "active" | "probation" | "resignation_pending" | "notice_period" | "exited";

export type StaffExitReason =
  "resigned" | "terminated" | "layoff" | "contract_end" | "mutual_agreement";

export type StaffEmploymentType = "full_time" | "part_time" | "contract";

export type StaffDepartmentHistoryEntry = {
  id: string;
  fromDepartmentId?: string;
  fromDepartmentName?: string;
  toDepartmentId: string;
  toDepartmentName: string;
  movedAt: number;
  note?: string;
};

export type StaffRecord = {
  id: string;

  /** Employee identity */
  employeeUniqueId: string;
  employeeName: string;

  /** Job details */
  jobTitle: string;
  category: string;
  employmentType: StaffEmploymentType;

  /** Department details — custom employer-created department system */
  departmentId?: string;
  departmentName?: string;
  departmentHistory?: StaffDepartmentHistoryEntry[];

  /** Dates — employer-controlled */
  joinedAt: number;
  exitedAt?: number;

  /** Status */
  status: StaffStatus;

  /** Exit details */
  exitReason?: StaffExitReason;

  /** Ratings */
  employerRating?: number;
  employerComment?: string;

  /** How added */
  addMethod: "via_app" | "manually_added";

  /** Link to career post (if hired via app) */
  careerPostId?: string;

  /** Employee confirmed (for manually added staff) */
  employeeConfirmed: boolean;

  /** Timestamps */
  createdAt: number;
  updatedAt: number;
};

export type StaffDepartment = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type StaffCategory = {
  id: string;
  name: string;
  createdAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STAFF_KEY = "wm_employer_staff_v1";
const CATEGORIES_KEY = "wm_employer_staff_categories_v1";
const DEPARTMENTS_KEY = "wm_employer_staff_departments_v1";
const CHANGED_EVENT = "wm:employer-staff-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function readStaff(): StaffRecord[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffRecord[]) : [];
  } catch {
    return [];
  }
}

function writeStaff(records: StaffRecord[]): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function restoreStaffRecords(records: StaffRecord[]): void {
  writeStaff(records);
}

function readCategories(): StaffCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffCategory[]) : [];
  } catch {
    return [];
  }
}

function writeCategories(categories: StaffCategory[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function readDepartments(): StaffDepartment[] {
  try {
    const raw = localStorage.getItem(DEPARTMENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffDepartment[]) : [];
  } catch {
    return [];
  }
}

function writeDepartments(departments: StaffDepartment[]): void {
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function genId(prefix: string): string {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function sortByNewest<T extends { createdAt: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const myStaffStorage = {
  // ── Staff CRUD ──

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

  // ── Departments ──

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

  // ── Legacy Categories ──

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

  // ── Subscription ──

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
