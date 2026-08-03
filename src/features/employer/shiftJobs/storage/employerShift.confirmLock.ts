// App name: Job Mitra
// Per-post async lock for confirm / direct-invite vacancy integrity (Wave 1 SC-1/SC-2)
// Wave-1/4: in-memory (same-tab) + navigator.locks + BroadcastChannel fallback + LS verify

const tails = new Map<string, Promise<unknown>>();

const LS_LOCK_KEY = "wm_shift_confirm_lock_v1";
const LS_LOCK_TTL_MS = 30_000;
const BC_LOCK_NAME = "wm_shift_confirm_lock_bc_v1";
const BC_PEER_WAIT_MS = 80;

type ShiftConfirmLsLock = {
  postId: string;
  token: string;
  holderTabId: string;
  expiresAt: number;
};

let cachedTabId: string | null = null;

function getShiftConfirmTabId(): string {
  if (cachedTabId) return cachedTabId;
  try {
    const key = "wm_shift_confirm_tab_id_v1";
    const existing = sessionStorage.getItem(key);
    if (existing?.trim()) {
      cachedTabId = existing.trim();
      return cachedTabId;
    }
    const id = `tab_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    sessionStorage.setItem(key, id);
    cachedTabId = id;
    return cachedTabId;
  } catch {
    cachedTabId = `tab_fallback_${Date.now()}`;
    return cachedTabId;
  }
}

function makeToken(): string {
  return `tok_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function readLsLocks(): ShiftConfirmLsLock[] {
  try {
    const raw = localStorage.getItem(LS_LOCK_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ShiftConfirmLsLock => {
      if (typeof item !== "object" || item === null) return false;
      const rec = item as Record<string, unknown>;
      return (
        typeof rec.postId === "string" &&
        typeof rec.token === "string" &&
        typeof rec.holderTabId === "string" &&
        typeof rec.expiresAt === "number"
      );
    });
  } catch {
    return [];
  }
}

function writeLsLocks(locks: ShiftConfirmLsLock[]): void {
  try {
    localStorage.setItem(LS_LOCK_KEY, JSON.stringify(locks));
  } catch {
    /* quota / private mode */
  }
}

function acquireLsLock(postId: string): { ok: true; token: string } | { ok: false } {
  const id = postId.trim() || "_";
  const now = Date.now();
  const tabId = getShiftConfirmTabId();
  const live = readLsLocks().filter((l) => l.expiresAt > now);
  const held = live.find((l) => l.postId === id);
  if (held && held.holderTabId !== tabId) {
    writeLsLocks(live);
    return { ok: false };
  }
  const token = makeToken();
  const next = live.filter((l) => l.postId !== id);
  next.push({
    postId: id,
    token,
    holderTabId: tabId,
    expiresAt: now + LS_LOCK_TTL_MS,
  });
  writeLsLocks(next);
  return { ok: true, token };
}

function releaseLsLock(postId: string, token: string): void {
  const id = postId.trim() || "_";
  if (!token.trim()) return;
  writeLsLocks(readLsLocks().filter((l) => !(l.postId === id && l.token === token.trim())));
}

async function withInMemoryLock<T>(postId: string, fn: () => Promise<T>): Promise<T> {
  const key = postId.trim() || "_";
  const prev = tails.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => gate);
  tails.set(
    key,
    chained.then(
      () => undefined,
      () => undefined,
    ),
  );

  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

/**
 * When Web Locks API is unavailable: BroadcastChannel peer probe + localStorage verify.
 */
async function withBroadcastChannelFallbackLock<T>(
  postId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const id = postId.trim() || "_";
  const tabId = getShiftConfirmTabId();
  const channel =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(BC_LOCK_NAME) : null;

  let holding = false;
  let holdToken = "";

  const onPeerQuery = (ev: MessageEvent) => {
    const data = ev.data as { type?: string; postId?: string };
    if (!holding) return;
    if (data?.type === "who_holds" && data.postId === id) {
      channel?.postMessage({ type: "holding", postId: id, tabId, token: holdToken });
    }
  };

  try {
    if (channel) {
      channel.addEventListener("message", onPeerQuery);
      const peerBusy = await new Promise<boolean>((resolve) => {
        const timer = window.setTimeout(() => resolve(false), BC_PEER_WAIT_MS);
        const onMsg = (ev: MessageEvent) => {
          const data = ev.data as { type?: string; postId?: string; tabId?: string };
          if (data?.type === "holding" && data.postId === id && data.tabId !== tabId) {
            window.clearTimeout(timer);
            channel.removeEventListener("message", onMsg);
            resolve(true);
          }
        };
        channel.addEventListener("message", onMsg);
        channel.postMessage({ type: "who_holds", postId: id, from: tabId });
      });
      if (peerBusy) {
        throw new Error("SHIFT_CONFIRM_LOCKED");
      }
    }

    const claimed = acquireLsLock(id);
    if (!claimed.ok) {
      throw new Error("SHIFT_CONFIRM_LOCKED");
    }
    holding = true;
    holdToken = claimed.token;
    channel?.postMessage({ type: "holding", postId: id, tabId, token: holdToken });

    try {
      return await fn();
    } finally {
      releaseLsLock(id, claimed.token);
      holding = false;
      channel?.postMessage({ type: "released", postId: id, token: claimed.token });
    }
  } finally {
    if (channel) {
      channel.removeEventListener("message", onPeerQuery);
      channel.close();
    }
  }
}

async function withCrossTabLock<T>(postId: string, fn: () => Promise<T>): Promise<T> {
  const id = postId.trim() || "_";
  const lockName = `wm-shift-confirm:${id}`;

  const runWithLs = async (): Promise<T> => {
    const claimed = acquireLsLock(id);
    if (!claimed.ok) {
      throw new Error("SHIFT_CONFIRM_LOCKED");
    }
    try {
      return await fn();
    } finally {
      releaseLsLock(id, claimed.token);
    }
  };

  const locksApi = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (locksApi?.request) {
    return locksApi.request(lockName, runWithLs);
  }
  return withBroadcastChannelFallbackLock(id, fn);
}

/**
 * Serialize confirm / direct-invite per post across same-tab callers and peer tabs.
 *
 * Wave-5: this lock is ADVISORY UX only. Server-side FOR UPDATE + status CAS is the
 * authoritative vacancy lock. On SHIFT_CONFIRM_LOCKED, callers should retry briefly
 * rather than treating the lock as security boundary.
 *
 * Throws Error("SHIFT_CONFIRM_LOCKED") when another tab holds the advisory lock.
 */
export async function withShiftConfirmLock<T>(postId: string, fn: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await withInMemoryLock(postId, () => withCrossTabLock(postId, fn));
    } catch (err) {
      lastErr = err;
      if (!(err instanceof Error) || err.message !== "SHIFT_CONFIRM_LOCKED") throw err;
      if (attempt === maxAttempts - 1) break;
      await new Promise((r) => window.setTimeout(r, 40 * (attempt + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("SHIFT_CONFIRM_LOCKED");
}

/** Test-only helper */
export function __resetShiftConfirmTabIdCacheForTests(): void {
  cachedTabId = null;
}
