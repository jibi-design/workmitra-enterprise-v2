/** Sanitize localStorage dumps — never export raw PII. */

import { hashPiiForExport, isPiiEnvelope } from "./piiCrypto";
import { PII_STORAGE_KEYS } from "./piiSecureStorage";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /\+?\d[\d\s\-()]{6,}\d/g;

const SENSITIVE_FIELD_KEYS = new Set([
  "email",
  "phone",
  "fullName",
  "companyName",
  "photoDataUrl",
  "registrationNo",
  "ownerUniqueId",
  "ownerUserId",
]);

function redactValue(key: string, value: unknown): unknown {
  if (typeof value === "string") {
    if (key === "photoDataUrl" || value.startsWith("data:")) return "[redacted-binary]";
    if (SENSITIVE_FIELD_KEYS.has(key)) return hashPiiForExport(value) || "[redacted]";
    return value
      .replace(EMAIL_RE, (m) => hashPiiForExport(m) || "[email]")
      .replace(PHONE_RE, (m) => hashPiiForExport(m) || "[phone]");
  }
  if (Array.isArray(value)) return value.map((item, i) => redactValue(String(i), item));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactValue(k, v);
    }
    return out;
  }
  return value;
}

/** Build an export-safe snapshot of localStorage (PII hashed/redacted). */
export function buildSanitizedLocalStorageExport(): Record<string, unknown> {
  const data: Record<string, unknown> = {
    _meta: {
      sanitized: true,
      note: "PII fields hashed/redacted. Encrypted profile envelopes exported as ciphertext only.",
      exportedAt: new Date().toISOString(),
    },
  };

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key || key === "wm_pii_device_key_v1") continue;

    const raw = localStorage.getItem(key);
    if (raw == null) continue;

    if (isPiiEnvelope(raw) || (PII_STORAGE_KEYS as readonly string[]).includes(key)) {
      data[key] = {
        sealed: true,
        ciphertextPreview: `${raw.slice(0, 24)}…`,
        length: raw.length,
      };
      continue;
    }

    try {
      data[key] = redactValue(key, JSON.parse(raw));
    } catch {
      data[key] = redactValue(key, raw);
    }
  }

  return data;
}
