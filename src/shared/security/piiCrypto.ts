/** Device-bound sync seal for PII at rest (XOR stream + HMAC). */

import { sha256Bytes, sha256Hex } from "./syncSha256";

const DEVICE_KEY_NAME = "wm_pii_device_key_v1";
const ENVELOPE_PREFIX = "wmenc1:";

/** Same-tab cache — avoids re-read races after first resolve; cleared on logout. */
let cachedDeviceKey: Uint8Array | null = null;

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

/**
 * Read-or-create with adopt-winner: after write, re-read storage and use whatever
 * key is actually stored (dual-tab create race → one winner, no permanent orphan seals).
 */
function readOrCreateDeviceKey(): Uint8Array {
  if (cachedDeviceKey) return cachedDeviceKey;

  try {
    const existing = localStorage.getItem(DEVICE_KEY_NAME);
    if (existing) {
      cachedDeviceKey = b64ToBytes(existing);
      return cachedDeviceKey;
    }
  } catch {
    /* ignore */
  }

  const key = crypto.getRandomValues(new Uint8Array(32));
  const encoded = bytesToB64(key);
  try {
    const raced = localStorage.getItem(DEVICE_KEY_NAME);
    if (raced) {
      cachedDeviceKey = b64ToBytes(raced);
      return cachedDeviceKey;
    }
    localStorage.setItem(DEVICE_KEY_NAME, encoded);
    const stored = localStorage.getItem(DEVICE_KEY_NAME);
    if (stored) {
      cachedDeviceKey = b64ToBytes(stored);
      return cachedDeviceKey;
    }
  } catch {
    /* ignore */
  }

  cachedDeviceKey = key;
  return key;
}

/** Drop device key from memory and localStorage (logout / clear-local). */
export function clearPiiDeviceKey(): void {
  cachedDeviceKey = null;
  try {
    localStorage.removeItem(DEVICE_KEY_NAME);
  } catch {
    /* ignore */
  }
}

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

/** Seal plaintext UTF-8 into a portable envelope string. */
export function sealPiiText(plaintext: string): string {
  const key = readOrCreateDeviceKey();
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const plain = new TextEncoder().encode(plaintext);
  const stream = keystream(key, nonce, plain.length);
  const cipher = new Uint8Array(plain.length);
  for (let i = 0; i < plain.length; i++) cipher[i] = plain[i]! ^ stream[i]!;
  const mac = hmacHex(key, new Uint8Array([...nonce, ...cipher]));
  return `${ENVELOPE_PREFIX}${bytesToB64(nonce)}.${bytesToB64(cipher)}.${mac}`;
}

/** Open a sealed envelope; returns null if invalid/tampered. */
export function openPiiText(envelope: string): string | null {
  if (!envelope.startsWith(ENVELOPE_PREFIX)) return null;
  const body = envelope.slice(ENVELOPE_PREFIX.length);
  const [nonceB64, cipherB64, mac] = body.split(".");
  if (!nonceB64 || !cipherB64 || !mac) return null;
  try {
    const key = readOrCreateDeviceKey();
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

export function isPiiEnvelope(value: string): boolean {
  return value.startsWith(ENVELOPE_PREFIX);
}

/** One-way hash for export redaction (email/phone/name). */
export function hashPiiForExport(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  return `sha256:${sha256Hex(trimmed).slice(0, 16)}`;
}
