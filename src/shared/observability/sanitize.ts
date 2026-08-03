/**
 * Defense Layer 2 — frontend PII / secret redaction (mirrors server rules).
 */

const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_RE =
  /^(password|passwd|pwd|passphrase|secret|token|access[_-]?token|refresh[_-]?token|id[_-]?token|invite[_-]?token|server[_-]?invite[_-]?token|csrf|csrf[_-]?token|authorization|cookie|set-cookie|session|session[_-]?hash|session[_-]?id|pepper|api[_-]?key|private[_-]?key|fcm|fcm[_-]?token|device[_-]?token|agora|agora[_-]?token|rtc[_-]?token|rtm[_-]?token|app[_-]?certificate|database[_-]?url|db[_-]?url|connection[_-]?string|supabase[_-]?(service[_-]?role|anon)[_-]?key|twilio[_-]?auth[_-]?token|wm[_-]?session|bearer)$/i;

const IDENTITY_KEY_RE =
  /^(muid|worker[_-]?wm[_-]?id|worker[_-]?ml[_-]?id|unique[_-]?id|jobmitra[_-]?user[_-]?id)$/i;

const INLINE_PATTERNS: RegExp[] = [
  /\b(Bearer)\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /\b(password|passwd|pwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[^\s"',}]+/gi,
  /\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"'<>]+/gi,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  /\bWM-[A-Z0-9-]{4,}\b/gi,
];

const MAX_DEPTH = 6;
const MAX_STRING = 4_000;

export function sanitizeString(input: string): string {
  let out = input.length > MAX_STRING ? `${input.slice(0, MAX_STRING)}…` : input;
  for (const re of INLINE_PATTERNS) {
    out = out.replace(re, REDACTED);
  }
  return out;
}

function shouldRedactKey(key: string): boolean {
  return SENSITIVE_KEY_RE.test(key) || IDENTITY_KEY_RE.test(key);
}

export function sanitizeForLog(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return String(value);
  if (typeof value === "symbol") return String(value);
  if (typeof value === "function") return "[Function]";
  if (depth >= MAX_DEPTH) return "[MaxDepth]";

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message),
      stack: value.stack ? sanitizeString(value.stack) : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeForLog(item, depth + 1));
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (shouldRedactKey(key)) {
        out[key] = REDACTED;
      } else {
        out[key] = sanitizeForLog(child, depth + 1);
      }
    }
    return out;
  }

  return String(value);
}
