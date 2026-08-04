/**
 * Wave 3 — "Today I Rest" ritual (personal off-day marker).
 * Key: wm_employee_rest_ritual_v1
 * Outside employment Personal Work Diary — MUST NOT touch wm_work_diary_* .
 */

export type EmployeeRestRitualRecord = {
  readonly dateKey: string;
  readonly markedAt: number;
};

const KEY = "wm_employee_rest_ritual_v1";
const CHANGED = "wm:employee-rest-ritual-changed";

const EMPTY_SNAPSHOT = "";

let cacheRaw: string | null = "__init__";
let cacheRecord: EmployeeRestRitualRecord | null = null;
let cacheSnapshot = EMPTY_SNAPSHOT;

function toDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseRecord(raw: string | null): EmployeeRestRitualRecord | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const rec = parsed as Record<string, unknown>;
    const dateKey = typeof rec.dateKey === "string" ? rec.dateKey : "";
    const markedAt = typeof rec.markedAt === "number" ? rec.markedAt : NaN;
    if (!dateKey || !Number.isFinite(markedAt)) return null;
    return { dateKey, markedAt };
  } catch {
    return null;
  }
}

function syncCache(): EmployeeRestRitualRecord | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }

  if (raw === cacheRaw && cacheRaw !== "__init__") {
    return cacheRecord;
  }

  cacheRaw = raw;
  cacheRecord = parseRecord(raw);
  cacheSnapshot = cacheRecord ? JSON.stringify(cacheRecord) : EMPTY_SNAPSHOT;
  return cacheRecord;
}

export const employeeRestRitualStorage = {
  KEY,
  CHANGED_EVENT: CHANGED,

  todayKey(): string {
    return toDateKey();
  },

  isRestingToday(): boolean {
    const record = syncCache();
    return Boolean(record && record.dateKey === toDateKey());
  },

  /** Stable string snapshot for useSyncExternalStore. */
  getSnapshot(): string {
    syncCache();
    const today = toDateKey();
    if (cacheRecord && cacheRecord.dateKey === today) {
      return cacheSnapshot;
    }
    return EMPTY_SNAPSHOT;
  },

  markTodayRest(): void {
    const record: EmployeeRestRitualRecord = {
      dateKey: toDateKey(),
      markedAt: Date.now(),
    };
    try {
      const raw = JSON.stringify(record);
      localStorage.setItem(KEY, raw);
      cacheRaw = raw;
      cacheRecord = record;
      cacheSnapshot = raw;
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      /* demo-safe */
    }
  },

  clearTodayRest(): void {
    if (!this.isRestingToday()) return;
    try {
      localStorage.removeItem(KEY);
      cacheRaw = null;
      cacheRecord = null;
      cacheSnapshot = EMPTY_SNAPSHOT;
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      /* demo-safe */
    }
  },

  subscribe(cb: () => void): () => void {
    const handler = () => cb();
    window.addEventListener(CHANGED, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  },
} as const;
