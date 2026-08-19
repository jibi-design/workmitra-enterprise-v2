/** Mask contact + street-level detail for unauthenticated browse. */

import { sanitizeUserText } from "../../security/sanitizeUserText";

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const OBFUSCATED_EMAIL_RE =
  /\b[\w.+-]+\s*(?:\(|\[)?\s*(?:at|@)\s*(?:\)|\])?\s*[\w.-]+\s*(?:\(|\[)?\s*(?:dot|\.)\s*(?:\)|\])?\s*[a-z]{2,}\b/gi;
const PHONE_RE = /(?:\+|00)?\d[\d\s().-]{6,}\d/g;
const POSTAL_RE = /\b(?:[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|\d{5}(?:-\d{4})?)\b/gi;
const STREET_TOKEN_RE =
  /\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|close|court|ct\.?|way|boulevard|blvd\.?|terrace|place|plaza|square|sq\.?|highway|hwy\.?|estate|block|unit|flat|apt\.?|apartment|suite|floor|door)\b/i;

export function maskGuestSensitiveText(raw: string): string {
  const cleaned = sanitizeUserText(raw, 8000);
  return cleaned
    .replace(EMAIL_RE, "contact hidden")
    .replace(OBFUSCATED_EMAIL_RE, "contact hidden")
    .replace(PHONE_RE, "••••")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function coarsenPlaceParts(raw: string): string {
  const withoutPostal = raw.replace(POSTAL_RE, " ");
  const parts = withoutPostal
    .split(",")
    .map((part) =>
      part
        .replace(/\b\d{1,5}[A-Za-z]?\b/g, " ")
        .replace(/[#]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim(),
    )
    .filter((part) => part.length >= 2 && !STREET_TOKEN_RE.test(part));
  if (parts.length === 0) return "";
  return parts.slice(-2).join(", ");
}

export function toGuestPublicPlace(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Area shown after sign-in";
  const masked = maskGuestSensitiveText(raw);
  const coarse = coarsenPlaceParts(masked);
  if (coarse.length < 2) return "Area shown after sign-in";
  return coarse;
}

export function toGuestPublicBody(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  return maskGuestSensitiveText(raw);
}
