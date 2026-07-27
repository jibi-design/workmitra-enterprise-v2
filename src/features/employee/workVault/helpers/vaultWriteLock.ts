/** Cross-tab write lock for vault documents localStorage (Wave 2 P1-3). */

const LOCK_KEY = "wm_vault_documents_write_lock_v1";
const TTL_MS = 8_000;
const TAB_KEY = "wm_vault_tab_id_v1";

type LockRecord = {
  token: string;
  holderTabId: string;
  expiresAt: number;
};

function now(): number {
  return Date.now();
}

function tabId(): string {
  try {
    const existing = sessionStorage.getItem(TAB_KEY);
    if (existing?.trim()) return existing.trim();
    const id = `tab_${Math.random().toString(16).slice(2)}_${now().toString(16)}`;
    sessionStorage.setItem(TAB_KEY, id);
    return id;
  } catch {
    return `tab_fallback_${now()}`;
  }
}

function readLock(): LockRecord | null {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LockRecord>;
    if (
      typeof parsed.token !== "string" ||
      typeof parsed.holderTabId !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    if (parsed.expiresAt <= now()) return null;
    return parsed as LockRecord;
  } catch {
    return null;
  }
}

function writeLock(rec: LockRecord): void {
  localStorage.setItem(LOCK_KEY, JSON.stringify(rec));
}

function clearLock(token: string): void {
  try {
    const cur = readLock();
    if (cur && cur.token === token) localStorage.removeItem(LOCK_KEY);
  } catch {
    /* ignore */
  }
}

function acquire(): { ok: true; token: string } | { ok: false } {
  const holder = tabId();
  const existing = readLock();
  if (existing && existing.holderTabId !== holder) return { ok: false };

  const token =
    existing && existing.holderTabId === holder
      ? existing.token
      : `tok_${Math.random().toString(16).slice(2)}_${now().toString(16)}`;
  const next: LockRecord = { token, holderTabId: holder, expiresAt: now() + TTL_MS };
  try {
    writeLock(next);
  } catch {
    return { ok: false };
  }
  const verify = readLock();
  if (!verify || verify.token !== token || verify.holderTabId !== holder) return { ok: false };
  return { ok: true, token };
}

/** Run sync vault document mutation under a short TTL cross-tab lock. */
export function withVaultDocumentsLock<T>(fn: () => T): T {
  const lock = acquire();
  if (!lock.ok) {
    throw new Error(
      "Another vault upload is in progress on this device. Please wait and try again.",
    );
  }
  try {
    return fn();
  } finally {
    clearLock(lock.token);
  }
}
