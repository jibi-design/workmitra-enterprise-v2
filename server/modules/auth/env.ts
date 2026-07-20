/**
 * Server auth environment guards — Phase 1 + Phase 2 persistence.
 */

export type AuthUserSource = "db" | "memory";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getAuthUserSource(): AuthUserSource {
  const raw = process.env.AUTH_USER_SOURCE ?? "memory";
  if (raw === "db" || raw === "memory") return raw;
  return "memory";
}

export function isDbAuthEnabled(): boolean {
  return getAuthUserSource() === "db";
}

/** True when in-memory demo users may authenticate (dev + memory source only). */
export function isDemoAuthAllowed(): boolean {
  if (isProduction()) return false;
  if (isDbAuthEnabled()) return false;
  return process.env.WM_ALLOW_DEMO_AUTH !== "false";
}

/** Add Secure to session cookie when API runs in production (HTTPS). */
export function secureCookiesEnabled(): boolean {
  return isProduction();
}

/**
 * Fail closed: production requires db auth; demo/memory forbidden.
 */
export function assertSafeAuthEnvironment(): void {
  const source = getAuthUserSource();

  if (isProduction() && source !== "db") {
    console.error(
      "[FATAL] AUTH_USER_SOURCE must be 'db' in production. Memory/demo auth is forbidden.",
    );
    process.exit(1);
  }

  if (isProduction() && process.env.WM_ALLOW_DEMO_AUTH === "true") {
    console.error(
      "[FATAL] WM_ALLOW_DEMO_AUTH=true is forbidden when NODE_ENV=production. Refusing to start.",
    );
    process.exit(1);
  }

  if (isProduction() && !process.env.WM_SESSION_HASH_PEPPER) {
    console.error("[FATAL] WM_SESSION_HASH_PEPPER is required in production.");
    process.exit(1);
  }

  if (source === "db" && !process.env.DATABASE_URL) {
    console.error("[FATAL] DATABASE_URL is required when AUTH_USER_SOURCE=db.");
    process.exit(1);
  }

  if (isProduction()) {
    console.log("[Job Mitra API] Production — db auth, Secure cookies, demo disabled.");
  } else if (isDbAuthEnabled()) {
    console.log("[Job Mitra API] Development — AUTH_USER_SOURCE=db (Supabase PostgreSQL).");
  } else if (isDemoAuthAllowed()) {
    console.log(
      "[Job Mitra API] Development — memory demo auth (set AUTH_USER_SOURCE=db for PostgreSQL).",
    );
  } else {
    console.log("[Job Mitra API] Development — demo auth disabled.");
  }
}
