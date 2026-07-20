// Job Mitra — employmentLifecycle.storage.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\employment\storage\employmentLifecycle.storage.ts

// Stores the employee's current active employment, primary current job preference, and work history.
// Used by "My Current Employment" card and verified work history.
// Employer-controlled dates. Employee can only view/confirm/dispute.

export type EmploymentStatus =
  "joining_pending" | "active" | "probation" | "resignation_pending" | "notice_period" | "exited";

export type ExitReason = "resigned" | "terminated" | "layoff" | "contract_end" | "mutual_agreement";

export type EmploymentRecord = {
  id: string;
  careerPostId: string;
  companyName: string;
  jobTitle: string;
  department: string;
  location: string;
  joinedAt: number;
  exitedAt?: number;
  status: EmploymentStatus;
  exitReason?: ExitReason;
  resignationNote?: string;
  preferredLastDate?: number;
  employerRating?: number;
  employerComment?: string;
  employeeRating?: number;
  employeeComment?: string;
  resignationReminderCount?: number;
  verified: boolean;
  hireMethod: "via_app" | "manually_added";
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "wm_employment_lifecycle_v1";
const PRIMARY_ACTIVE_EMPLOYMENT_KEY = "wm_primary_current_employment_id_v1";
const CHANGED_EVENT = "wm:employment-lifecycle-changed";

const ACTIVE_EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  "joining_pending",
  "active",
  "probation",
  "resignation_pending",
  "notice_period",
];

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

function isActiveEmployment(record: EmploymentRecord): boolean {
  return ACTIVE_EMPLOYMENT_STATUSES.includes(record.status);
}

function sortNewestFirst(records: EmploymentRecord[]): EmploymentRecord[] {
  return [...records].sort((a, b) => b.createdAt - a.createdAt);
}

function sortOldestJoinedFirst(records: EmploymentRecord[]): EmploymentRecord[] {
  return [...records].sort((a, b) => a.joinedAt - b.joinedAt);
}

function getStoredPrimaryId(): string | null {
  try {
    return localStorage.getItem(PRIMARY_ACTIVE_EMPLOYMENT_KEY);
  } catch {
    return null;
  }
}

function writePrimaryId(employmentId: string): void {
  localStorage.setItem(PRIMARY_ACTIVE_EMPLOYMENT_KEY, employmentId);
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export const employmentLifecycleStorage = {
  getAll(): EmploymentRecord[] {
    return sortNewestFirst(read());
  },

  getActiveList(): EmploymentRecord[] {
    return sortNewestFirst(read().filter(isActiveEmployment));
  },

  getPrimaryActiveId(): string | null {
    const activeList = this.getActiveList();
    const storedId = getStoredPrimaryId();

    if (storedId && activeList.some((record) => record.id === storedId)) {
      return storedId;
    }

    return sortOldestJoinedFirst(activeList)[0]?.id ?? null;
  },

  setPrimaryActiveId(employmentId: string): boolean {
    const activeList = this.getActiveList();
    const exists = activeList.some((record) => record.id === employmentId);

    if (!exists) return false;

    writePrimaryId(employmentId);
    return true;
  },

  getPrimaryActive(): EmploymentRecord | null {
    const primaryId = this.getPrimaryActiveId();
    if (!primaryId) return null;

    return this.getActiveList().find((record) => record.id === primaryId) ?? null;
  },

  getActive(): EmploymentRecord | null {
    return this.getPrimaryActive();
  },

  getVerifiedHistory(): EmploymentRecord[] {
    return read()
      .filter((record) => record.status === "exited" && record.verified)
      .sort((a, b) => (b.exitedAt ?? b.createdAt) - (a.exitedAt ?? a.createdAt));
  },

  createEmployment(data: Omit<EmploymentRecord, "id" | "createdAt" | "updatedAt">): string {
    const now = Date.now();
    const id = `emp_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    const record: EmploymentRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const all = read();
    write([record, ...all]);

    if (!this.getPrimaryActiveId() && isActiveEmployment(record)) {
      writePrimaryId(id);
    }

    return id;
  },

  update(id: string, patch: Partial<EmploymentRecord>): boolean {
    const all = read();
    const idx = all.findIndex((record) => record.id === id);

    if (idx === -1) return false;

    all[idx] = { ...all[idx], ...patch, updatedAt: Date.now() };
    write(all);
    return true;
  },

  submitResignation(id: string, note: string, preferredLastDate: number): boolean {
    const success = this.update(id, {
      status: "resignation_pending",
      resignationNote: note,
      preferredLastDate,
    });

    if (success) {
      try {
        const rec = read().find((record) => record.id === id);

        if (rec?.careerPostId) {
          const staffRaw = localStorage.getItem("wm_employer_staff_v1");

          if (staffRaw) {
            const staffAll = JSON.parse(staffRaw) as Array<Record<string, unknown>>;
            const staffIdx = staffAll.findIndex(
              (staff) => staff.careerPostId === rec.careerPostId && staff.status !== "exited",
            );

            if (staffIdx !== -1) {
              staffAll[staffIdx] = {
                ...staffAll[staffIdx],
                status: "resignation_pending",
                updatedAt: Date.now(),
              };

              localStorage.setItem("wm_employer_staff_v1", JSON.stringify(staffAll));
              window.dispatchEvent(new Event("wm:employer-staff-changed"));
            }
          }
        }
      } catch {
        // Sync failure is non-critical in local demo storage.
      }
    }

    return success;
  },

  submitEmployeeRating(id: string, rating: number, comment?: string): boolean {
    const all = read();
    const rec = all.find((record) => record.id === id);

    if (!rec || rec.status !== "exited") return false;
    if (typeof rec.employeeRating === "number") return false;

    return this.update(id, {
      employeeRating: rating,
      employeeComment: comment,
    });
  },

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

  restoreEmploymentLifecycleRecords(records: EmploymentRecord[]): void {
    write(records);
  },

  sendReminder(id: string): { sent: boolean; count: number } {
    const all = read();
    const rec = all.find((record) => record.id === id);

    if (!rec || rec.status !== "resignation_pending") return { sent: false, count: 0 };

    const current = rec.resignationReminderCount ?? 0;
    if (current >= 3) return { sent: false, count: current };

    const next = current + 1;
    this.update(id, { resignationReminderCount: next });

    return { sent: true, count: next };
  },

  subscribe(cb: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === STORAGE_KEY ||
        event.key === PRIMARY_ACTIVE_EMPLOYMENT_KEY ||
        event.key === null
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
