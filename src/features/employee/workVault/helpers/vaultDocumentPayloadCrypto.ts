/**
 * Vault document payload crypto (B-P0-3).
 * Persists base64Data / thumbnailBase64 as device-key envelopes (wmenc1/wmenc2).
 * Raw localStorage dumps expose ciphertext only — never plaintext data-URLs.
 */

import {
  ensurePiiCryptoReady,
  isPiiEnvelope,
  openPiiText,
  openPiiTextAsync,
  sealPiiText,
  sealPiiTextAsync,
} from "../../../shared/security/piiCrypto";

const EMPTY = "";

/** True when value is already a sealed envelope. */
export function isVaultPayloadSealed(value: string): boolean {
  return typeof value === "string" && isPiiEnvelope(value);
}

/** Plain data-URL / raw base64 that must be sealed before persist. */
export function isVaultPayloadPlaintext(value: string): boolean {
  if (!value) return false;
  if (isVaultPayloadSealed(value)) return false;
  return value.startsWith("data:") || value.length > 32;
}

/** Seal payload for localStorage (sync path — wmenc1 with device key). */
export function sealVaultPayloadSync(plaintext: string): string {
  if (!plaintext) return EMPTY;
  if (isVaultPayloadSealed(plaintext)) return plaintext;
  return sealPiiText(plaintext);
}

/** Open sealed payload; returns null if sealed but undecryptable. Pass-through plaintext legacy. */
export function openVaultPayloadSync(stored: string): string | null {
  if (!stored) return EMPTY;
  if (!isVaultPayloadSealed(stored)) return stored;
  return openPiiText(stored);
}

export async function sealVaultPayloadAsync(plaintext: string): Promise<string> {
  if (!plaintext) return EMPTY;
  if (isVaultPayloadSealed(plaintext)) return plaintext;
  await ensurePiiCryptoReady();
  return sealPiiTextAsync(plaintext);
}

export async function openVaultPayloadAsync(stored: string): Promise<string | null> {
  if (!stored) return EMPTY;
  if (!isVaultPayloadSealed(stored)) return stored;
  await ensurePiiCryptoReady();
  return openPiiTextAsync(stored);
}

/** Redact payloads for unauthorized callers (metadata-only). */
export function redactVaultPayloads<T extends { base64Data: string; thumbnailBase64: string }>(
  doc: T,
): T {
  return {
    ...doc,
    base64Data: EMPTY,
    thumbnailBase64: EMPTY,
  };
}
