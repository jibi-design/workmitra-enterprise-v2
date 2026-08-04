/**
 * Wave 3 — Employee Dashboard daily Availability Pulse.
 * Key: wm_shift_availability_daily_v1 (shift utility family).
 * MUST NOT touch wm_work_diary_* .
 */

export type DailyAvailabilityStatus = "available" | "shifted" | "off_duty";

export type ShiftAvailabilityDailyRecord = {
  readonly dateKey: string;
  readonly status: DailyAvailabilityStatus;
  readonly updatedAt: number;
};

const KEY = "wm_shift_availability_daily_v1";
const CHANGED = "wm:shift-availability-daily-changed";

const EMPTY_SNAPSHOT = "";

let cacheRaw: string | null = "__init__";
let cacheRecord: ShiftAvailabilityDailyRecord | null = null;
let cacheSnapshot = EMPTY_SNAPSHOT;

function toDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseRecord(raw: string | null): ShiftAvailabilityDailyRecord | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const rec = parsed as Record<string, unknown>;
    const dateKey = typeof rec.dateKey === "string" ? rec.dateKey : "";
    const status = rec.status;
    const updatedAt = typeof rec.updatedAt === "number" ? rec.updatedAt : NaN;
    if (
      !dateKey ||
      (status !== "available" && status !== "shifted" && status !== "off_duty") ||
      !Number.isFinite(updatedAt)
    ) {
      return null;
    }
    return { dateKey, status, updatedAt };
  } catch {
    return null;
  }
}

function syncCache(): ShiftAvailabilityDailyRecord | null {
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

function write(record: ShiftAvailabilityDailyRecord): void {
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
}

export const shiftAvailabilityDailyStorage = {
  KEY,
  CHANGED_EVENT: CHANGED,

  todayKey(): string {
    return toDateKey();
  },

  getToday(): ShiftAvailabilityDailyRecord | null {
    const record = syncCache();
    if (!record) return null;
    return record.dateKey === toDateKey() ? record : null;
  },

  getTodayStatus(): DailyAvailabilityStatus | null {
    return this.getToday()?.status ?? null;
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

  setTodayStatus(status: DailyAvailabilityStatus): void {
    write({
      dateKey: toDateKey(),
      status,
      updatedAt: Date.now(),
    });
  },

  clearToday(): void {
    const today = toDateKey();
    const current = syncCache();
    if (!current || current.dateKey !== today) return;
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
