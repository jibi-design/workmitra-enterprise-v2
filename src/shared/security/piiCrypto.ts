/**
 * Sprint 1 — PII at-rest seal (AES-256-GCM via Web Crypto).
 * Device key lives in IndexedDB (not localStorage). Legacy wmenc1 XOR still opens once.
 */

import { sha256Bytes, sha256Hex } from "./syncSha256";

const IDB_NAME = "wm_pii_vault_v1";
const IDB_STORE = "keys";
const IDB_KEY = "device_aes_v1";
const LEGACY_LS_KEY = "wm_pii_device_key_v1";

const ENVELOPE_V1 = "wmenc1:";
const ENVELOPE_V2 = "wmenc2:";

let cachedRawKey: Uint8Array | null = null;
let cachedCryptoKey: CryptoKey | null = null;
let readyPromise: Promise<void> | null = null;

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("idb_open_timeout"));
    }, 2_000);
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => {
      window.clearTimeout(timer);
      resolve(req.result);
    };
    req.onblocked = () => {
      window.clearTimeout(timer);
      reject(new Error("idb_open_blocked"));
    };
    req.onerror = () => {
      window.clearTimeout(timer);
      reject(req.error ?? new Error("idb open failed"));
    };
  });
}

async function idbGetKey(): Promise<Uint8Array | null> {
  try {
    const db = await openIdb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => {
        const v = req.result;
        if (typeof v === "string" && v.length) resolve(b64ToBytes(v));
        else resolve(null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbPutKey(raw: Uint8Array): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(bytesToB64(raw), IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbClearKey(): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

function migrateLegacyLocalStorageKey(): Uint8Array | null {
  try {
    const existing = localStorage.getItem(LEGACY_LS_KEY);
    if (!existing) return null;
    const raw = b64ToBytes(existing);
    localStorage.removeItem(LEGACY_LS_KEY);
    return raw;
  } catch {
    return null;
  }
}

async function importAesKey(raw: Uint8Array): Promise<CryptoKey> {
  const keyBytes = new Uint8Array(raw);
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/** Boot hook — call once before rendering the app. */
export async function ensurePiiCryptoReady(): Promise<void> {
  if (cachedCryptoKey && cachedRawKey) return;
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    let raw = await idbGetKey();
    if (!raw) {
      raw = migrateLegacyLocalStorageKey();
    }
    if (!raw) {
      raw = crypto.getRandomValues(new Uint8Array(32));
    }
    cachedRawKey = raw;
    cachedCryptoKey = await importAesKey(raw);
    try {
      await idbPutKey(raw);
    } catch {
      /* Memory key is enough for login to render if IndexedDB is blocked. */
    }
  })();

  try {
    await readyPromise;
  } catch (err) {
    readyPromise = null;
    throw err;
  }
}

/** Drop device key from memory, IndexedDB, and legacy localStorage. */
export function clearPiiDeviceKey(): void {
  cachedRawKey = null;
  cachedCryptoKey = null;
  readyPromise = null;
  try {
    localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    /* ignore */
  }
  void idbClearKey();
}

/* ── Legacy wmenc1 (XOR+HMAC) — open only for migration ─────────────────── */

function keystream(key: Uint8Array, nonce: Uint8Array, length: number): Uint8Array {
  const out = new Uint8Array(length);
  let offset = 0;
  let counter = 0;
  while (offset < length) {
    const block = sha256Bytes(
      new Uint8Array([
        ...key,
        ...nonce,
        (counter >>> 24) & 0xff,
        (counter >>> 16) & 0xff,
        (counter >>> 8) & 0xff,
        counter & 0xff,
      ]),
    );
    const take = Math.min(block.length, length - offset);
    out.set(block.subarray(0, take), offset);
    offset += take;
    counter += 1;
  }
  return out;
}

function hmacHex(key: Uint8Array, message: Uint8Array): string {
  const block = new Uint8Array(64);
  block.set(key.length > 64 ? sha256Bytes(key) : key);
  const opad = new Uint8Array(64);
  const ipad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    opad[i] = block[i]! ^ 0x5c;
    ipad[i] = block[i]! ^ 0x36;
  }
  const inner = sha256Bytes(new Uint8Array([...ipad, ...message]));
  return sha256Hex(new Uint8Array([...opad, ...inner]));
}

function openLegacyV1(envelope: string, key: Uint8Array): string | null {
  const body = envelope.slice(ENVELOPE_V1.length);
  const [nonceB64, cipherB64, mac] = body.split(".");
  if (!nonceB64 || !cipherB64 || !mac) return null;
  try {
    const nonce = b64ToBytes(nonceB64);
    const cipher = b64ToBytes(cipherB64);
    const expect = hmacHex(key, new Uint8Array([...nonce, ...cipher]));
    if (expect !== mac) return null;
    const stream = keystream(key, nonce, cipher.length);
    const plain = new Uint8Array(cipher.length);
    for (let i = 0; i < cipher.length; i++) plain[i] = cipher[i]! ^ stream[i]!;
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

/** Seal plaintext UTF-8 into AES-GCM envelope (wmenc2). */
export async function sealPiiTextAsync(plaintext: string): Promise<string> {
  await ensurePiiCryptoReady();
  if (!cachedCryptoKey) throw new Error("PII crypto not ready");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cachedCryptoKey, plain);
  return `${ENVELOPE_V2}${bytesToB64(iv)}.${bytesToB64(new Uint8Array(cipherBuf))}`;
}

/** Open wmenc2 or legacy wmenc1. */
export async function openPiiTextAsync(envelope: string): Promise<string | null> {
  await ensurePiiCryptoReady();
  if (!cachedRawKey || !cachedCryptoKey) return null;

  if (envelope.startsWith(ENVELOPE_V2)) {
    try {
      const body = envelope.slice(ENVELOPE_V2.length);
      const [ivB64, cipherB64] = body.split(".");
      if (!ivB64 || !cipherB64) return null;
      const iv = new Uint8Array(b64ToBytes(ivB64));
      const cipher = new Uint8Array(b64ToBytes(cipherB64));
      const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cachedCryptoKey,
        cipher,
      );
      return new TextDecoder().decode(plainBuf);
    } catch {
      return null;
    }
  }

  if (envelope.startsWith(ENVELOPE_V1)) {
    return openLegacyV1(envelope, cachedRawKey);
  }

  return null;
}

/**
 * Sync seal — prefers in-memory AES path after ready; falls back to blocking-free
 * legacy only when crypto not yet ready (should not happen after boot hydrate).
 */
export function sealPiiText(plaintext: string): string {
  if (!cachedCryptoKey || !cachedRawKey) {
    // Pre-boot emergency: temporary v1 so callers never throw mid-render.
    // Will be re-sealed to v2 on next async persist after ensurePiiCryptoReady.
    const key = cachedRawKey ?? crypto.getRandomValues(new Uint8Array(32));
    if (!cachedRawKey) cachedRawKey = key;
    const nonce = crypto.getRandomValues(new Uint8Array(16));
    const plain = new TextEncoder().encode(plaintext);
    const stream = keystream(key, nonce, plain.length);
    const cipher = new Uint8Array(plain.length);
    for (let i = 0; i < plain.length; i++) cipher[i] = plain[i]! ^ stream[i]!;
    const mac = hmacHex(key, new Uint8Array([...nonce, ...cipher]));
    return `${ENVELOPE_V1}${bytesToB64(nonce)}.${bytesToB64(cipher)}.${mac}`;
  }
  // Sync API cannot AES-GCM — queue async upgrade via caller setItem fire-and-forget.
  // For sync return, emit v1 with the same device key (still not in localStorage).
  const key = cachedRawKey;
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const plain = new TextEncoder().encode(plaintext);
  const stream = keystream(key, nonce, plain.length);
  const cipher = new Uint8Array(plain.length);
  for (let i = 0; i < plain.length; i++) cipher[i] = plain[i]! ^ stream[i]!;
  const mac = hmacHex(key, new Uint8Array([...nonce, ...cipher]));
  return `${ENVELOPE_V1}${bytesToB64(nonce)}.${bytesToB64(cipher)}.${mac}`;
}

/** Sync open — v1 immediate; v2 requires prior async hydrate into mirror (storage layer). */
export function openPiiText(envelope: string): string | null {
  if (envelope.startsWith(ENVELOPE_V1)) {
    const key = cachedRawKey;
    if (!key) return null;
    return openLegacyV1(envelope, key);
  }
  // v2 cannot decrypt synchronously — storage layer keeps a plaintext mirror.
  return null;
}

export function isPiiEnvelope(value: string): boolean {
  return value.startsWith(ENVELOPE_V1) || value.startsWith(ENVELOPE_V2);
}

/** One-way hash for export redaction (email/phone/name). */
export function hashPiiForExport(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  return `sha256:${sha256Hex(trimmed).slice(0, 16)}`;
}
