/**
 * Defense Layer 6 — fail-close environment validation (boot + build).
 * Never logs secret values — only config keys and sanitized reasons.
 */

import { isProduction, getAuthUserSource } from "./env.js";

const INSECURE_SUBSTRINGS = [
  "change-me",
  "changeme",
  "password",
  "default",
  "example",
  "placeholder",
  "not-for-production",
  "test123",
  "todo",
  "replace_me",
  "your-",
  "xxxx",
  "wm-dev-session-pepper",
] as const;

const DEV_PEPPER = "wm-dev-session-pepper-not-for-production";

function isInsecureSecret(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v.length < 16) return true;
  return INSECURE_SUBSTRINGS.some((s) => v.includes(s));
}

function fatal(message: string): never {
  console.error(`[FATAL] ${message}`);
  process.exit(1);
}

/**
 * Resolve session signing secret.
 * Canonical: WM_SESSION_HASH_PEPPER. Alias: JWT_SECRET (ops familiarity).
 */
export function resolveSessionPepper(): string | undefined {
  const pepper = process.env.WM_SESSION_HASH_PEPPER?.trim();
  if (pepper) return pepper;
  const jwt = process.env.JWT_SECRET?.trim();
  if (jwt) return jwt;
  return undefined;
}

function assertCorsOrigins(): void {
  const originParts: string[] = [];
  const originsRaw = process.env.WM_ALLOWED_ORIGINS?.trim() ?? "";
  if (originsRaw) {
    originParts.push(
      ...originsRaw
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    );
  }
  for (const key of ["VITE_APP_URL", "WM_APP_URL"] as const) {
    const v = process.env[key]?.trim();
    if (v) originParts.push(v);
  }
  if (originParts.length === 0) {
    fatal(
      "WM_ALLOWED_ORIGINS (or VITE_APP_URL / WM_APP_URL) is required in production. " +
        "Refusing open/default localhost CORS.",
    );
  }
  for (const origin of [...new Set(originParts)]) {
    if (origin === "*" || origin.includes("*")) {
      fatal("CORS origins must not use wildcards in production.");
    }
    try {
      const u = new URL(origin);
      if (u.protocol !== "https:") {
        fatal(`CORS origin must be https in production: ${origin}`);
      }
    } catch {
      fatal(`CORS origin is invalid: ${origin}`);
    }
  }
}

/**
 * Fail closed on missing / weak production secrets and misconfig.
 * Call at API boot (and mirrored by build-time scripts for Vite).
 */
export function assertFailCloseEnvironment(): void {
  if (!isProduction()) {
    const pepper = resolveSessionPepper();
    if (pepper && (pepper === DEV_PEPPER || isInsecureSecret(pepper))) {
      console.warn(
        "[WARN] Session pepper (WM_SESSION_HASH_PEPPER / JWT_SECRET) looks weak. " +
          "Use a long random value before promoting to production.",
      );
    }
    return;
  }

  const pepper = resolveSessionPepper() ?? "";
  if (!pepper) {
    fatal("WM_SESSION_HASH_PEPPER (or JWT_SECRET alias) is required in production.");
  }
  if (pepper === DEV_PEPPER || isInsecureSecret(pepper)) {
    fatal(
      "Session pepper is insecure or a known default. " +
        "Generate a long random secret (≥32 chars) and redeploy.",
    );
  }
  if (pepper.length < 32) {
    fatal("Session pepper must be at least 32 characters in production.");
  }

  assertCorsOrigins();

  // Production always requires DB auth + DATABASE_URL
  if (getAuthUserSource() !== "db") {
    fatal("AUTH_USER_SOURCE must be 'db' in production.");
  }

  const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (!dbUrl) {
    fatal("DATABASE_URL is required in production.");
  }
  if (
    dbUrl.includes("user:password") ||
    dbUrl.includes("localhost") ||
    dbUrl.toLowerCase().includes("example.com")
  ) {
    fatal("DATABASE_URL looks like a placeholder or local URL — refused in production.");
  }

  // Client auth must be explicitly enabled for production SPA deploys (Sprint 1)
  const viteAuth =
    process.env.VITE_AUTH_BACKEND_ENABLED?.trim() ?? process.env.WM_REQUIRE_VITE_AUTH?.trim();
  if (viteAuth !== "true") {
    fatal(
      'VITE_AUTH_BACKEND_ENABLED must be "true" in production ' +
        "(client roleStorage is not a security boundary).",
    );
  }

  const optionalSecrets: Array<{ name: string; value: string | undefined }> = [
    { name: "AGORA_APP_CERTIFICATE", value: process.env.AGORA_APP_CERTIFICATE },
    { name: "FCM_SERVER_KEY", value: process.env.FCM_SERVER_KEY },
    { name: "TWILIO_AUTH_TOKEN", value: process.env.TWILIO_AUTH_TOKEN },
    { name: "SUPABASE_SERVICE_ROLE_KEY", value: process.env.SUPABASE_SERVICE_ROLE_KEY },
    { name: "SUPABASE_ANON_KEY", value: process.env.SUPABASE_ANON_KEY },
    { name: "SENTRY_DSN", value: process.env.SENTRY_DSN },
  ];

  for (const { name, value } of optionalSecrets) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    if (isInsecureSecret(trimmed)) {
      fatal(
        `${name} appears to be a placeholder/insecure value. Unset or replace before production.`,
      );
    }
  }

  console.log("[Job Mitra API] Fail-close environment check passed.");
}

/** @deprecated Use assertFailCloseEnvironment — kept for Layer 1 call sites. */
export function assertProductionSecrets(): void {
  assertFailCloseEnvironment();
}
