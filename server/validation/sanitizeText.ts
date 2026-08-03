/**
 * Defense Layer 4 — strip HTML/script from user-entered text (Stored XSS guard).
 * MED-1: allowlist sanitizer (sanitize-html) — no regex-only XSS stripping.
 */

import sanitizeHtml from "sanitize-html";

// Intentional C0 control strip (XSS/storage hygiene) — not a content match pattern.
// eslint-disable-next-line no-control-regex -- control chars must be removed
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Remove all HTML tags/attributes and dangerous URI schemes.
 * Returns plain text suitable for DB storage.
 */
export function stripHtmlAndScripts(input: string): string {
  const cleaned = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
    // Strip javascript: / data: URIs if any text survives attribute parsing
    allowedSchemes: [],
    allowProtocolRelative: false,
  });
  return cleaned
    .replace(CTRL_RE, "")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .trim();
}

/** Clamp + XSS-strip for free-text fields (notes, titles, descriptions). */
export function sanitizeUserText(input: unknown, maxLen = 2000): string {
  if (typeof input !== "string") return "";
  const cleaned = stripHtmlAndScripts(input);
  return cleaned.slice(0, maxLen);
}
