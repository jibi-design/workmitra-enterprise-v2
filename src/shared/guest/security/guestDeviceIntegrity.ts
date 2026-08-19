/** Privacy-safe guest device token: random seed hashed locally. No hardware fingerprint. */

const SEED_KEY = "wm_guest_device_seed_v1";
const HASH_KEY = "wm_guest_device_hash_v1";
const STRIKES_KEY = "wm_guest_device_strikes_v1";
const BLOCK_KEY = "wm_guest_device_block_until_v1";
const MAX_STRIKES = 8;
const BLOCK_MS = 15 * 60 * 1000;

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function fnv1aHex(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function ensureGuestDeviceHash(): string {
  const existing = lsGet(HASH_KEY);
  if (existing && /^[a-f0-9]{16,64}$/i.test(existing)) return existing.toLowerCase();

  let seed = lsGet(SEED_KEY);
  if (!seed) {
    seed =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `g_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
    lsSet(SEED_KEY, seed);
  }
  const hash = `${fnv1aHex(`wm-guest-v1|${seed}`)}${fnv1aHex(`wm-guest-v1b|${seed}`)}`;
  lsSet(HASH_KEY, hash);
  return hash;
}

export function isGuestDeviceThrottled(now = Date.now()): boolean {
  const until = Number(lsGet(BLOCK_KEY) ?? "0");
  return Number.isFinite(until) && until > now;
}

export function recordGuestIntegrityStrike(): void {
  if (isGuestDeviceThrottled()) return;
  const next = Math.min(MAX_STRIKES, Number(lsGet(STRIKES_KEY) ?? "0") + 1);
  lsSet(STRIKES_KEY, String(next));
  if (next >= MAX_STRIKES) {
    lsSet(BLOCK_KEY, String(Date.now() + BLOCK_MS));
  }
}

export function guestDeviceThrottleRemainingMs(now = Date.now()): number {
  const until = Number(lsGet(BLOCK_KEY) ?? "0");
  if (!Number.isFinite(until) || until <= now) return 0;
  return until - now;
}
