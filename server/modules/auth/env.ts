/**
 * Server auth environment guards — Phase 2 + Sprint 1 binding.
 *
 * Non-demo mode: AUTH_USER_SOURCE=db only.
 * Memory/demo auth requires explicit WM_ALLOW_DEMO_AUTH=true AND not production.
 */

export type AuthUserSource = "db" | "memory";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Sprint 1: default is `db`. Memory only when explicitly opted into demo lab.
 */
export function getAuthUserSource(): AuthUserSource {
  if (isProduction()) return "db";

  const raw = (process.env.AUTH_USER_SOURCE ?? "db").trim().toLowerCase();
  if (raw === "memory") {
    if (process.env.WM_ALLOW_DEMO_AUTH === "true") return "memory";
    console.warn(
      "[auth] AUTH_USER_SOURCE=memory ignored — set WM_ALLOW_DEMO_AUTH=true for demo lab, " +
        "or use AUTH_USER_SOURCE=db. Falling back to db.",
    );
    return "db";
  }
  if (raw === "db") return "db";
  console.warn(`[auth] Unknown AUTH_USER_SOURCE="${raw}" — using db.`);
  return "db";
}

export function isDbAuthEnabled(): boolean {
  return getAuthUserSource() === "db";
}

/**
 * Wave-5: auth enforcement stance for mock routes / CSRF.
 * True when production, DB auth, or explicit WM_/VITE_ AUTH flags.
 */
export function isAuthEnabled(): boolean {
  if (isProduction()) return true;
  if (isDbAuthEnabled()) return true;
  if (process.env.WM_ENFORCE_AUTH === "true") return true;
  if (process.env.VITE_AUTH_BACKEND_ENABLED === "true") return true;
  return false;
}

/** True when in-memory demo users may authenticate (dev lab only). */
export function isDemoAuthAllowed(): boolean {
  if (isProduction()) return false;
  if (isDbAuthEnabled()) return false;
  return process.env.WM_ALLOW_DEMO_AUTH === "true";
}

/** Add Secure to session cookie when API runs in production (HTTPS). */
export function secureCookiesEnabled(): boolean {
  return isProduction();
}

/**
 * Fail closed: production requires db auth; demo/memory forbidden.
 * Pair with assertProductionSecrets() at process boot (see server/index.ts).
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

  if (process.env.VITE_AUTH_BACKEND_ENABLED === "true" && source === "memory") {
    console.error(
      "[FATAL] VITE_AUTH_BACKEND_ENABLED=true requires AUTH_USER_SOURCE=db " +
        "(cannot bind client RBAC to memory demo auth).",
    );
    process.exit(1);
  }

  if (isProduction() && !process.env.WM_SESSION_HASH_PEPPER && !process.env.JWT_SECRET) {
    console.error("[FATAL] WM_SESSION_HASH_PEPPER (or JWT_SECRET) is required in production.");
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
    console.log("[Job Mitra API] Development — memory DEMO auth (WM_ALLOW_DEMO_AUTH=true).");
  } else {
    console.log("[Job Mitra API] Development — demo auth disabled; use AUTH_USER_SOURCE=db.");
  }
}
