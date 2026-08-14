/** Job Mitra | pendingBannerDismiss.storage.ts | Fingerprint dismiss for unified banner queue */

const KEY = "wm_employee_pending_banner_dismissed_v1";
const CHANGED = "wm:employee-pending-banner-dismissed";

type DismissedMap = Record<string, number>;

const EMPTY: DismissedMap = Object.freeze({});

let cacheRaw: string | null = "__init__";
let cache: DismissedMap = EMPTY;

function read(): DismissedMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cacheRaw && cacheRaw !== "__init__") return cache;
    cacheRaw = raw;
    if (!raw) {
      cache = EMPTY;
      return cache;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      cache = EMPTY;
      return cache;
    }
    cache = parsed as DismissedMap;
    return cache;
  } catch {
    cacheRaw = "__error__";
    cache = EMPTY;
    return cache;
  }
}

function write(next: DismissedMap): void {
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(KEY, raw);
    cacheRaw = raw;
    cache = next;
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* localStorage fail-silent */
  }
}

export const pendingBannerDismissStorage = {
  subscribe(cb: () => void): () => void {
    const onChange = () => cb();
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) cb();
    };
    window.addEventListener(CHANGED, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED, onChange);
      window.removeEventListener("storage", onStorage);
    };
  },

  getSnapshot(): string {
    return localStorage.getItem(KEY) ?? "";
  },

  isDismissed(fingerprint: string): boolean {
    return fingerprint in read();
  },

  dismiss(fingerprint: string): void {
    if (!fingerprint || fingerprint === "0") return;
    write({ ...read(), [fingerprint]: Date.now() });
  },

  /** Drop fingerprints no longer present in the live queue (bound growth). */
  pruneToLive(liveFingerprints: readonly string[]): void {
    const data = read();
    const live = new Set(liveFingerprints);
    let changed = false;
    const next: DismissedMap = {};
    for (const [fp, at] of Object.entries(data)) {
      if (live.has(fp)) {
        next[fp] = at;
      } else {
        changed = true;
      }
    }
    if (changed) write(next);
  },
} as const;
