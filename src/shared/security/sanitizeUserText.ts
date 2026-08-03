/**
 * Defense Layer 4 — strip HTML/script from user-entered text (Stored XSS guard).
 * Shared client utility for LocalStorage drafts and notes.
 */

const TAG_RE = /<\/?[^>]+>/g;
const SCRIPT_BLOCK_RE = /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;
const EVENT_HANDLER_RE = /\bon[a-z]+\s*=\s*(["']).*?\1/gi;
const JS_URI_RE = /javascript\s*:/gi;
const DATA_HTML_RE = /data\s*:\s*text\/html/gi;
// Intentional C0 control strip (XSS/storage hygiene) — not a content match pattern.
// eslint-disable-next-line no-control-regex -- control chars must be removed
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function stripHtmlAndScripts(input: string): string {
  let out = input;
  out = out.replace(SCRIPT_BLOCK_RE, " ");
  out = out.replace(EVENT_HANDLER_RE, " ");
  out = out.replace(JS_URI_RE, "");
  out = out.replace(DATA_HTML_RE, "");
  out = out.replace(TAG_RE, " ");
  out = out.replace(CTRL_RE, "");
  out = out.replace(/[ \t\f\v]+/g, " ");
  out = out.replace(/ ?\n ?/g, "\n");
  return out.trim();
}

export function sanitizeUserText(input: unknown, maxLen = 2000): string {
  if (typeof input !== "string") return "";
  return stripHtmlAndScripts(input).slice(0, maxLen);
}
