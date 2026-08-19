/** Mask contact + street-level detail for unauthenticated browse. */

import { sanitizeUserText } from "../../security/sanitizeUserText";

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /(?:\+|00)?\d[\d\s().-]{7,}\d/g;

export function maskGuestSensitiveText(raw: string): string {
  const cleaned = sanitizeUserText(raw, 8000);
  return cleaned
    .replace(EMAIL_RE, "contact hidden")
    .replace(PHONE_RE, "••••")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function toGuestPublicPlace(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Area shown after sign-in";
  const masked = maskGuestSensitiveText(raw);
  const noDoor = masked
    .replace(/\b\d{1,5}[A-Za-z]?\b/g, " ")
    .replace(/[#,]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (noDoor.length < 2) return "Area shown after sign-in";
  return noDoor;
}

export function toGuestPublicBody(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  return maskGuestSensitiveText(raw);
}
