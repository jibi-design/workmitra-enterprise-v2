// Job Mitra | personalCalendarShift.storage.ts | Section 6.10.4

export type PersonalCalendarShiftBlock = {
  id: string;
  dateKey: string;
  domain: "shift";
  source: "planner" | "single";
  planId?: string;
  planName?: string;
  postId: string;
  workspaceId?: string;
  applicationId?: string;
  jobName: string;
  companyName: string;
  payPerDay?: number;
  status: "confirmed" | "completed" | "cancelled" | "replaced";
  syncedAt: number;
  schemaVersion: 1;
};

const KEY = "wm_employee_personal_calendar_shift_v1";
const CHANGED = "wm:employee-personal-calendar-shift-changed";
/** Wave-3: FIFO cap aligned with vault history pattern */
const PERSONAL_CALENDAR_SHIFT_MAX = 200;

const EMPTY_BLOCKS: PersonalCalendarShiftBlock[] = [];

let allCacheRaw: string | null = "__init__";
let allCacheList: PersonalCalendarShiftBlock[] = EMPTY_BLOCKS;
let activeCacheRaw: string | null = "__init__";
let activeCacheList: PersonalCalendarShiftBlock[] = EMPTY_BLOCKS;

function invalidateCaches(): void {
  allCacheRaw = "__dirty__";
  activeCacheRaw = "__dirty__";
}

function readAllCached(): PersonalCalendarShiftBlock[] {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }

  if (raw === allCacheRaw && allCacheRaw !== "__init__" && allCacheRaw !== "__dirty__") {
    return allCacheList;
  }

  allCacheRaw = raw;

  if (!raw) {
    allCacheList = EMPTY_BLOCKS;
    activeCacheRaw = raw;
    activeCacheList = EMPTY_BLOCKS;
    return allCacheList;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    allCacheList = Array.isArray(parsed) ? (parsed as PersonalCalendarShiftBlock[]) : EMPTY_BLOCKS;
  } catch {
    allCacheList = EMPTY_BLOCKS;
  }

  activeCacheRaw = "__dirty__";
  return allCacheList;
}

function getActiveCached(): PersonalCalendarShiftBlock[] {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }

  if (raw === activeCacheRaw && activeCacheRaw !== "__init__" && activeCacheRaw !== "__dirty__") {
    return activeCacheList;
  }

  const all = readAllCached();
  activeCacheRaw = raw;
  activeCacheList = all.filter((b) => b.status === "confirmed" || b.status === "completed");
  return activeCacheList;
}

function writeAll(blocks: PersonalCalendarShiftBlock[]): boolean {
  try {
    const trimmed =
      blocks.length > PERSONAL_CALENDAR_SHIFT_MAX
        ? [...blocks].sort((a, b) => b.syncedAt - a.syncedAt).slice(0, PERSONAL_CALENDAR_SHIFT_MAX)
        : blocks;
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    invalidateCaches();
    window.dispatchEvent(new CustomEvent(CHANGED));
    return true;
  } catch {
    try {
      window.dispatchEvent(new CustomEvent("wm:storage-quota-exceeded", { detail: { key: KEY } }));
    } catch {
      /* ignore */
    }
    return false;
  }
}

export const personalCalendarShiftStorage = {
  CHANGED_EVENT: CHANGED,

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(CHANGED, handler);
    return () => window.removeEventListener(CHANGED, handler);
  },

  getAll(): PersonalCalendarShiftBlock[] {
    return readAllCached();
  },

  getActive(): PersonalCalendarShiftBlock[] {
    return getActiveCached();
  },

  upsert(block: PersonalCalendarShiftBlock): void {
    const list = [...readAllCached()];
    const idx = list.findIndex((b) => b.id === block.id);
    if (idx >= 0) list[idx] = block;
    else list.push(block);
    writeAll(list);
  },

  markStatusByPost(postId: string, status: PersonalCalendarShiftBlock["status"]): void {
    writeAll(
      readAllCached().map((b) =>
        b.postId === postId ? { ...b, status, syncedAt: Date.now() } : b,
      ),
    );
  },

  markPlanCancelled(planId: string): void {
    writeAll(
      readAllCached().map((b) =>
        b.planId === planId && b.status === "confirmed"
          ? { ...b, status: "cancelled" as const, syncedAt: Date.now() }
          : b,
      ),
    );
  },
};

export function getPersonalCalendarShiftActiveSnapshot(): PersonalCalendarShiftBlock[] {
  return personalCalendarShiftStorage.getActive();
}
