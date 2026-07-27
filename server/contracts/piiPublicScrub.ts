/** Shared PII scrub contract for public shift payloads */

const PHONE_RE = /(\+?\d[\d\s\-()]{7,}\d)/g;
const COORD_RE = /-?\d{1,3}\.\d{4,}/g;

const BLOCKED_KEYS = new Set([
  "phone",
  "phoneNumber",
  "mobile",
  "personalPhone",
  "privateRating",
  "privateRatings",
  "ratingComment",
  "coordinates",
  "lat",
  "lng",
  "latitude",
  "longitude",
  "homeAddress",
  "nationalId",
  "aadhaar",
]);

export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

export function scrubPiiFromPublicPayload(input: unknown): JsonValue {
  return scrub(input, 0);
}

function scrub(value: unknown, depth: number): JsonValue {
  if (depth > 8) return null;
  if (value == null) return null;
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") {
    return value.replace(PHONE_RE, "[REDACTED_PHONE]").replace(COORD_RE, "[REDACTED_COORD]");
  }
  if (Array.isArray(value)) return value.map((item) => scrub(item, depth + 1));
  if (typeof value !== "object") return null;

  const out: Record<string, JsonValue> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (BLOCKED_KEYS.has(key)) continue;
    out[key] = scrub(nested, depth + 1);
  }
  return out;
}

export function assertNoPiiLeak(payload: unknown): string[] {
  const raw = JSON.stringify(payload);
  const leaks: string[] = [];
  if (PHONE_RE.test(raw)) leaks.push("phone_pattern");
  if (/"phoneNumber"\s*:/.test(raw)) leaks.push("phoneNumber_key");
  if (/"privateRating"\s*:/.test(raw)) leaks.push("privateRating_key");
  if (/"latitude"\s*:/.test(raw) || /"longitude"\s*:/.test(raw)) leaks.push("coordinates_key");
  return leaks;
}
