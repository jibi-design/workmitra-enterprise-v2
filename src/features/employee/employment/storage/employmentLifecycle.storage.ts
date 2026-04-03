// src/features/employee/employment/storage/employmentLifecycle.storage.ts
//
// Stores the employee's current active employment and work history.
// Used by "My Current Employment" card and verified work history.
// Employer-controlled dates. Employee can only view/confirm/dispute.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EmploymentStatus =
  | "active"
  | "probation"
  | "resignation_pending"
  | "notice_period"
  | "exited";

export type ExitReason =
  | "resigned"
  | "terminated"
  | "layoff"
  | "contract_end"
  | "mutual_agreement";

export type EmploymentRecord = {
  id: string;
  /** Career post ID that led to this employment */
  careerPostId: string;
  /** Employer details */
  companyName: string;
  jobTitle: string;
  department: string;
  location: string;
  /** Dates — employer-controlled */
  joinedAt: number;
  exitedAt?: number;
  /** Status */
  status: EmploymentStatus;
  /** Exit details */
  exitReason?: ExitReason;
  resignationNote?: string;
  preferredLastDate?: number;
  /** Ratings */
  employerRating?: number;
  employerComment?: string;
  employeeRating?: number;
 employeeComment?: string;
  /** Resignation reminder tracking */
  resignationReminderCount?: number;
  /** Verification */
  verified: boolean;
  /** How hired */
  hireMethod: "via_app" | "manually_added";
  /** Timestamps */
  createdAt: number;
  updatedAt: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wm_employment_lifecycle_v1";
const CHANGED_EVENT = "wm:employment-lifecycle-changed";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helpers
// ─────────────────────────────────────────────────────────────────────────────

function read(): EmploymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EmploymentRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: EmploymentRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const employmentLifecycleStorage = {
  /** Get all employment records (newest first) */
  getAll(): EmploymentRecord[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },

  /** Get current active employment (if any) */
  getActive(): EmploymentRecord | null {
    const all = read();
    return (
      all.find(
        (r) =>
          r.status === "active" ||
          r.status === "probation" ||
          r.status === "resignation_pending" ||
          r.status === "notice_period",
      ) ?? null
    );
  },

  /** Get verified work history (exited + verified only) */
  getVerifiedHistory(): EmploymentRecord[] {
    return read()
      .filter((r) => r.status === "exited" && r.verified)
      .sort((a, b) => (b.exitedAt ?? b.createdAt) - (a.exitedAt ?? a.createdAt));
  },

  /** Create new active employment (called on hire) */
  createEmployment(data: Omit<EmploymentRecord, "id" | "createdAt" | "updatedAt">): string {
    const now = Date.now();
    const id = "emp_" + now.toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    const record: EmploymentRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const all = read();
    write([record, ...all]);
    return id;
  },

  /** Update an employment record */
  update(id: string, patch: Partial<EmploymentRecord>): boolean {
    const all = read();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...patch, updatedAt: Date.now() };
    write(all);
    return true;
  },

  /** Submit resignation (employee action) — also syncs employer staff record */
  submitResignation(id: string, note: string, preferredLastDate: number): boolean {
    const success = this.update(id, {
      status: "resignation_pending",
      resignationNote: note,
      preferredLastDate,
    });
    if (success) {
      // Sync to employer's myStaff storage
      try {
        const rec = read().find((r) => r.id === id);
        if (rec?.careerPostId) {
          const staffRaw = localStorage.getItem("wm_employer_staff_v1");
          if (staffRaw) {
            const staffAll = JSON.parse(staffRaw) as Array<Record<string, unknown>>;
            const staffIdx = staffAll.findIndex(
              (s) => s.careerPostId === rec.careerPostId && s.status !== "exited",
            );
            if (staffIdx !== -1) {
              staffAll[staffIdx] = { ...staffAll[staffIdx], status: "resignation_pending", updatedAt: Date.now() };
              localStorage.setItem("wm_employer_staff_v1", JSON.stringify(staffAll));
              window.dispatchEvent(new Event("wm:employer-staff-changed"));
            }
          }
        }
      } catch { /* sync failure is non-critical */ }
    }
    return success;
  },

  /** Submit employee's rating of employer (after exit — one-time only) */
  submitEmployeeRating(id: string, rating: number, comment?: string): boolean {
    const all = read();
    const rec = all.find((r) => r.id === id);
    if (!rec || rec.status !== "exited") return false;
    if (typeof rec.employeeRating === "number") return false;
    return this.update(id, {
      employeeRating: rating,
      employeeComment: comment,
    });
  },

  /** Process exit (called by employer — updates employee record) */
  processExit(
    id: string,
    exitReason: ExitReason,
    exitedAt: number,
    employerRating?: number,
    employerComment?: string,
  ): boolean {
    return this.update(id, {
      status: "exited",
      exitReason,
      exitedAt,
      employerRating,
      employerComment,
      verified: true,
    });
  },

  /** Send resignation reminder (max 3) */
  sendReminder(id: string): { sent: boolean; count: number } {
    const all = read();
    const rec = all.find((r) => r.id === id);
    if (!rec || rec.status !== "resignation_pending") return { sent: false, count: 0 };
    const current = rec.resignationReminderCount ?? 0;
    if (current >= 3) return { sent: false, count: current };
    const next = current + 1;
    this.update(id, { resignationReminderCount: next });
    return { sent: true, count: next };
  },

  /** Subscribe to changes */
  subscribe(cb: () => void): () => void {
    window.addEventListener(CHANGED_EVENT, cb);
    return () => window.removeEventListener(CHANGED_EVENT, cb);
  },

  CHANGED_EVENT,
} as const;