import { createServer } from "node:http";
import { assertSafeAuthEnvironment, isProduction, isDbAuthEnabled } from "./modules/auth/env.js";
import { handleAuthRoutes } from "./modules/auth/auth.routes.js";
import { handleEmployeeRoutes } from "./modules/employee/employee.routes.js";
import { handleEmployerRoutes } from "./modules/employer/employer.routes.js";
import { handleAvailabilityRoutes } from "./modules/shift/availability.routes.js";
import { handleFavoritesRoutes } from "./modules/shift/favorites.routes.js";
import { handleCallingRoutes } from "./routes/calling.routes.js";
import { enforceCsrf, isMutatingMethod } from "./middleware/csrf.js";
import { applyApiRateLimit, applyChaosInjection } from "./middleware/rateLimitChaos.js";

const PORT = Number(process.env.PORT ?? 3001);

assertSafeAuthEnvironment();

if (isDbAuthEnabled()) {
  try {
    const { verifyDbConnection } = await import("./db/pool.js");
    const { runMigrations } = await import("./db/migrate.js");
    await verifyDbConnection();
    console.log("[Job Mitra API] DB connection verified.");
    await runMigrations();
  } catch (err) {
    console.error("[Job Mitra API] DB startup failed:", err);
    process.exit(1);
  }
}

/**
 * Allowed CORS origins — whitelist only.
 * Production: set WM_ALLOWED_ORIGINS="https://yourapp.com" (comma-separated).
 * Development: defaults to localhost:5173 and localhost:4173.
 */
const ALLOWED_ORIGINS: Set<string> = new Set(
  process.env.WM_ALLOWED_ORIGINS
    ? process.env.WM_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "http://localhost:4173"],
);

function resolveAllowedOrigin(requestOrigin: string | undefined): string | null {
  if (!requestOrigin) return null;
  if (ALLOWED_ORIGINS.has(requestOrigin)) return requestOrigin;
  if (isProduction()) return null;
  try {
    const u = new URL(requestOrigin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return requestOrigin;
  } catch {
    // malformed origin — reject
  }
  return null;
}

const server = createServer(async (req, res) => {
  const requestOrigin = req.headers.origin;
  const allowedOrigin = resolveAllowedOrigin(requestOrigin);

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
  res.setHeader("Access-Control-Expose-Headers", "X-CSRF-Token");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = req.method ?? "GET";

  if (url.pathname === "/v1/jobmitra/health" && method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, service: "workmitra-api", ts: Date.now() }));
    return;
  }

  const isContractMockPath =
    url.pathname.startsWith("/v1/jobmitra/employee/shift/availability") ||
    url.pathname.startsWith("/v1/jobmitra/employer/shift/availability-pool") ||
    url.pathname.startsWith("/v1/jobmitra/employer/shift/favorites");

  if (!isContractMockPath || method !== "GET") {
    // Always rate-limit mutating + contract mock GETs used by flood probes.
  }

  const rate = applyApiRateLimit(req, res);
  if (rate.blocked) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          code: "RATE_LIMITED",
          message: "Too Many Requests",
          retryAfterSec: rate.retryAfterSec,
        },
      }),
    );
    return;
  }

  const chaos = await applyChaosInjection(req, res);
  if (chaos === "handled") return;

  const isLogin = method === "POST" && url.pathname === "/v1/jobmitra/auth/login";
  const skipCsrf = isLogin || isContractMockPath;
  if (isMutatingMethod(method) && !skipCsrf) {
    if (!enforceCsrf(req, res)) return;
  }

  // Contract mocks (availability/favorites) — PII-scrubbed; used by k6 + security probes.
  if (await handleAvailabilityRoutes(req, res, url, method)) return;
  if (await handleFavoritesRoutes(req, res, url, method)) return;

  if (await handleAuthRoutes(req, res, url.pathname, method)) return;
  if (await handleCallingRoutes(req, res, url, method)) return;
  if (await handleEmployeeRoutes(req, res, url, method)) return;
  if (await handleEmployerRoutes(req, res, url, method)) return;

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: { code: "NOT_FOUND", message: "Route not found" } }));
});

server.listen(PORT, () => {
  console.log(`[Job Mitra API] listening on http://localhost:${PORT}`);
  console.log(
    `[Job Mitra API] auth:     POST /v1/jobmitra/auth/login | GET /v1/jobmitra/auth/me | POST /v1/jobmitra/auth/logout | POST /v1/jobmitra/auth/supabase-bridge`,
  );
  console.log(
    `[Job Mitra API] employee: /v1/jobmitra/employee/career/* (requireAuth + requireEmployeeRole)`,
  );
  console.log(
    `[Job Mitra API] employer: /v1/jobmitra/employer/career|shift|vault|hr|workforce/* (requireAuth + requireEmployerRole)`,
  );
  console.log(
    `[Job Mitra API] calling:  POST /v1/jobmitra/call/{initiate|answer|end|fallback} (alias /api/call/*)`,
  );
  console.log(
    `[Job Mitra API] calling job: npm run job:call-fallback (no-answer → Twilio or mark failed)`,
  );
});
