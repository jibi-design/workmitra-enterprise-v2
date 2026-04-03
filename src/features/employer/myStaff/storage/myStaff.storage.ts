// src/features/employer/myStaff/storage/myStaff.storage.ts
//
// Employer's staff management storage.
// Stores all active/exited staff across Career Jobs hires + manual additions.
// Categories, search by Unique ID, exit processing.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StaffStatus =
  | "active"
  | "probation"
  | "resignation_pending"
  | "notice_period"
  | "exited";

export type StaffExitReason =
  | "resigned"
  | "terminated"
  | "layoff"
  | "contract_end"
  | "mutual_agreement";

export type StaffEmploymentType = "full_time" | "part_time" | "contract";

export type StaffRecord = {
  id: string;
  /** Employee identity */
  employeeUniqueId: string;
  employeeName: string;
  /** Job details */
  jobTitle: string;
  category: string;
  employmentType: StaffEmploymentType;
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

function genId(prefix: string): string {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const myStaffStorage = {
  // ── Staff CRUD ──

  /** Get all staff (newest first) */
  getAll(): StaffRecord[] {
    return readStaff().sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get active staff only */
  getActive(): StaffRecord[] {
    return readStaff()
      .filter(
        (r) =>
          r.status === "active" ||
          r.status === "probation" ||
          r.status === "resignation_pending" ||
          r.status === "notice_period",
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get active staff count */
  getActiveCount(): number {
    return readStaff().filter(
      (r) =>
        r.status === "active" ||
        r.status === "probation" ||
        r.status === "resignation_pending" ||
        r.status === "notice_period",
    ).length;
  },

  /** Find staff by employee Unique ID */
  findByUniqueId(uniqueId: string): StaffRecord | null {
    return readStaff().find((r) => r.employeeUniqueId === uniqueId) ?? null;
  },

  /** Find staff by career post ID */
  findByCareerPostId(postId: string): StaffRecord | null {
    return readStaff().find((r) => r.careerPostId === postId) ?? null;
  },

  /** Add staff (via app hire or manually) */
  addStaff(data: Omit<StaffRecord, "id" | "createdAt" | "updatedAt">): string {
    const now = Date.now();
    const id = genId("stf");
    const record: StaffRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const all = readStaff();
    writeStaff([record, ...all]);
    return id;
  },

  /** Update a staff record */
  updateStaff(id: string, patch: Partial<StaffRecord>): boolean {
    const all = readStaff();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...patch, updatedAt: Date.now() };
    writeStaff(all);
    return true;
  },

  /** End employment (employer action) */
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

  /** Accept resignation (employer action) */
  acceptResignation(
    id: string,
    exitedAt: number,
    rating?: number,
    comment?: string,
  ): boolean {
    return this.updateStaff(id, {
      status: "exited",
      exitReason: "resigned",
      exitedAt,
      employerRating: rating,
      employerComment: comment,
    });
  },

  // ── Categories ──

  /** Get all categories */
  getCategories(): StaffCategory[] {
    return readCategories().sort((a, b) => a.name.localeCompare(b.name));
  },

  /** Add category */
  addCategory(name: string): string {
    const all = readCategories();
    const exists = all.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return "";
    const id = genId("cat");
    const cat: StaffCategory = { id, name: name.trim(), createdAt: Date.now() };
    writeCategories([...all, cat]);
    return id;
  },

  /** Delete category */
  deleteCategory(id: string): boolean {
    const all = readCategories();
    const filtered = all.filter((c) => c.id !== id);
    if (filtered.length === all.length) return false;
    writeCategories(filtered);
    return true;
  },

  // ── Subscription ──

  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
} as const;