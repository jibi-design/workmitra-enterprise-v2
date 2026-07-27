/**
 * Job Mitra | phoneDialCountries.ts
 * Full ISO dial list + search helpers (data: phoneDialCountries.data.json).
 */

import rawCountries from "./phoneDialCountries.data.json";

export type PhoneDialCountry = {
  readonly iso: string;
  readonly name: string;
  readonly dial: string;
  readonly flag: string;
};

/** Pinned for quick pick — shown above A–Z list. */
export const POPULAR_PHONE_DIAL_ISOS = [
  "GB",
  "IN",
  "AE",
  "US",
  "CA",
  "AU",
  "SG",
  "SA",
  "QA",
  "DE",
  "FR",
  "IE",
] as const;

export const DEFAULT_PHONE_DIAL_ISO = "GB";

export const PHONE_DIAL_COUNTRIES: readonly PhoneDialCountry[] = rawCountries as PhoneDialCountry[];

const BY_ISO = new Map(PHONE_DIAL_COUNTRIES.map((c) => [c.iso, c]));

const POPULAR_SET = new Set<string>(POPULAR_PHONE_DIAL_ISOS);

/** Dial length desc, then popular ISO preference (for +1 / +44 ambiguity). */
const PARSE_ORDER = [...PHONE_DIAL_COUNTRIES].sort((a, b) => {
  const len = b.dial.length - a.dial.length;
  if (len !== 0) return len;
  const ap = POPULAR_SET.has(a.iso) ? 0 : 1;
  const bp = POPULAR_SET.has(b.iso) ? 0 : 1;
  if (ap !== bp) return ap - bp;
  return a.name.localeCompare(b.name);
});

export function getPhoneDialCountry(iso: string): PhoneDialCountry {
  return BY_ISO.get(iso) ?? BY_ISO.get(DEFAULT_PHONE_DIAL_ISO)!;
}

export function getPopularPhoneDialCountries(): PhoneDialCountry[] {
  return POPULAR_PHONE_DIAL_ISOS.map((iso) => BY_ISO.get(iso)).filter((c): c is PhoneDialCountry =>
    Boolean(c),
  );
}

export function filterPhoneDialCountries(query: string): PhoneDialCountry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...PHONE_DIAL_COUNTRIES];
  const digits = q.replace(/\D/g, "");
  return PHONE_DIAL_COUNTRIES.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.iso.toLowerCase().includes(q)) return true;
    if (c.dial.toLowerCase().includes(q)) return true;
    if (digits && c.dial.replace(/\D/g, "").includes(digits)) return true;
    return false;
  });
}

/** Digits only national part. */
export function sanitizeNationalNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 15);
}

/** Build E.164-ish value for APIs: +{cc}{national}. */
export function composeE164(dial: string, national: string): string {
  const cc = dial.trim().startsWith("+") ? dial.trim() : `+${dial.trim()}`;
  const n = sanitizeNationalNumber(national);
  if (!n) return "";
  return `${cc}${n}`;
}

/** Split stored E.164 into iso + national when possible. */
export function parseStoredPhone(value: string): {
  iso: string;
  national: string;
} {
  const raw = value.trim();
  if (!raw) {
    return { iso: DEFAULT_PHONE_DIAL_ISO, national: "" };
  }
  for (const c of PARSE_ORDER) {
    if (raw.startsWith(c.dial)) {
      return { iso: c.iso, national: sanitizeNationalNumber(raw.slice(c.dial.length)) };
    }
  }
  if (raw.startsWith("+")) {
    return { iso: DEFAULT_PHONE_DIAL_ISO, national: sanitizeNationalNumber(raw) };
  }
  return { iso: DEFAULT_PHONE_DIAL_ISO, national: sanitizeNationalNumber(raw) };
}

export function maskPhoneHint(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 4) return "•••• ••••";
  return `•••• ${digits.slice(-4)}`;
}
