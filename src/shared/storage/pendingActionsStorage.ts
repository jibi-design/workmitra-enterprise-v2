// App name: Job Mitra
// File name: pendingActionsStorage.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\storage\pendingActionsStorage.ts
//
// Tracks "Rate Later" dismissed pending action items.
// When a user dismisses a rating prompt with "Later", that action is stored
// here so PendingActionsHub can persist the reminder until the rating is done.

const KEY = "wm_pending_actions_later_v1";
const CHANGED = "wm:pending-actions-changed";

type DismissedRecord = Record<string, number>; // actionId → dismissedAt timestamp

const EMPTY_DISMISSED: DismissedRecord = Object.freeze({});

let dismissedCacheRaw: string | null = "__init__";
let dismissedCache: DismissedRecord = EMPTY_DISMISSED;

function read(): DismissedRecord {
  try {
    const raw = localStorage.getItem(KEY);

    if (raw === dismissedCacheRaw && dismissedCacheRaw !== "__init__") {
      return dismissedCache;
    }

    dismissedCacheRaw = raw;

    if (!raw) {
      dismissedCache = EMPTY_DISMISSED;
      return dismissedCache;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      dismissedCache = EMPTY_DISMISSED;
      return dismissedCache;
    }

    dismissedCache = parsed as DismissedRecord;
    return dismissedCache;
  } catch {
    dismissedCacheRaw = "__error__";
    dismissedCache = EMPTY_DISMISSED;
    return dismissedCache;
  }
}

function write(data: DismissedRecord): void {
  try {
    const raw = JSON.stringify(data);
    localStorage.setItem(KEY, raw);
    dismissedCacheRaw = raw;
    dismissedCache = data;
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* Phase-0 localStorage-safe fallback */
  }
}

export const pendingActionsStorage = {
  subscribe(cb: () => void): () => void {
    const h = () => cb();
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) cb();
    };
    window.addEventListener(CHANGED, h);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED, h);
      window.removeEventListener("storage", onStorage);
    };
  },

  getAll(): DismissedRecord {
    return read();
  },

  /** Call when user taps "Later" on a rating modal. */
  dismissLater(actionId: string): void {
    write({ ...read(), [actionId]: Date.now() });
  },

  /** Call when the action is completed (rating submitted). */
  clearDismissed(actionId: string): void {
    const data = read();
    const rest = { ...data };
    delete rest[actionId];
    write(rest);
  },

  isDismissed(actionId: string): boolean {
    return actionId in read();
  },
} as const;
