/** Job Mitra | employerPendingBannerDismiss.storage.ts | Employer pending banner dismiss */

const KEY = "wm_employer_pending_banner_dismissed_v1";
const CHANGED = "wm:employer-pending-banner-dismissed";

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
    /* fail-silent */
  }
}

export const employerPendingBannerDismissStorage = {
  subscribe(cb: () => void): () => void {
    const onChange = () => cb();
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) onChange();
    };
    window.addEventListener(CHANGED, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGED, onChange);
      window.removeEventListener("storage", onStorage);
    };
  },

  getSnapshot(): string {
    return JSON.stringify(read());
  },

  isDismissed(fingerprint: string): boolean {
    return fingerprint in read();
  },

  dismiss(fingerprint: string): void {
    const next = { ...read(), [fingerprint]: Date.now() };
    write(next);
  },

  pruneToLive(fingerprints: readonly string[]): void {
    const live = new Set(fingerprints);
    const current = read();
    const next: DismissedMap = {};
    let changed = false;
    for (const [fp, ts] of Object.entries(current)) {
      if (live.has(fp)) next[fp] = ts;
      else changed = true;
    }
    if (changed) write(next);
  },
};
