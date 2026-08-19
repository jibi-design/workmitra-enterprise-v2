/** Shift-level scanner unlock — sessionStorage only. Never stores the PIN. */

const KEY = "wm_event_day_scanner_shift_v1";
const TTL_MS = 12 * 60 * 60 * 1000;

type ShiftSession = {
  readonly issuerId: string;
  readonly folderId: string;
  readonly unlockedAt: number;
};

function readSession(): ShiftSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ShiftSession>;
    if (
      typeof parsed.issuerId !== "string" ||
      typeof parsed.folderId !== "string" ||
      typeof parsed.unlockedAt !== "number"
    ) {
      return null;
    }
    return { issuerId: parsed.issuerId, folderId: parsed.folderId, unlockedAt: parsed.unlockedAt };
  } catch {
    return null;
  }
}

export function getScannerShiftFolderId(issuerId: string): string | null {
  const session = readSession();
  if (!session || session.issuerId !== issuerId) return null;
  if (Date.now() - session.unlockedAt >= TTL_MS) return null;
  return session.folderId;
}

export function isScannerShiftUnlocked(issuerId: string, folderId?: string): boolean {
  const current = getScannerShiftFolderId(issuerId);
  if (!current) return false;
  return folderId ? current === folderId : true;
}

export function markScannerShiftUnlocked(issuerId: string, folderId: string): void {
  if (typeof sessionStorage === "undefined" || !issuerId || !folderId) return;
  const payload: ShiftSession = { issuerId, folderId, unlockedAt: Date.now() };
  sessionStorage.setItem(KEY, JSON.stringify(payload));
}

export function clearScannerShiftUnlock(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(KEY);
}
