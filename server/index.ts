import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  assertSafeAuthEnvironment,
  isProduction,
  isAuthEnabled,
  isDbAuthEnabled,
} from "./modules/auth/env.js";
import { assertFailCloseEnvironment } from "./modules/auth/failCloseEnv.js";
import { handleAuthRoutes } from "./modules/auth/auth.routes.js";
import { handleEmployeeRoutes } from "./modules/employee/employee.routes.js";
import { handleEmployerRoutes } from "./modules/employer/employer.routes.js";
import { handlePublicEventDayRoutes } from "./modules/employer/eventDay/eventDay.public.routes.js";
import { handleAvailabilityRoutes } from "./modules/shift/availability.routes.js";
import { handleFavoritesRoutes } from "./modules/shift/favorites.routes.js";
import { handleCallingRoutes } from "./routes/calling.routes.js";
import { enforceCsrf, isMutatingMethod } from "./middleware/csrf.js";
import { applyChaosInjection } from "./middleware/rateLimitChaos.js";
import { applyRateLimiter } from "./middleware/rateLimiter.js";
import { applySecurityHeaders } from "./middleware/securityHeaders.js";
import { buildAllowedOrigins, resolveCorsOrigin } from "./middleware/corsOrigins.js";
import { resolveClientIp } from "./middleware/clientIp.js";
import { getRequestId, requireAuth } from "./middleware/index.js";
import { handleUnhandledDispatchError } from "./middleware/errorHandler.js";
import { initServerMonitor } from "./observability/monitor.js";
import { logSecurityEvent } from "./observability/securityEvents.js";
import { handleOpsRoutes } from "./modules/ops/ops.routes.js";
import { handleAdminModerationRoutes } from "./modules/moderation/moderation.admin.routes.js";
import { enforceOpsMaintenanceGate } from "./middleware/opsMaintenanceGate.js";
import {
  recordPostingSpikeSignal,
  recordRateLimitSignal,
} from "./observability/anomalyDetector.js";
import { attachPulseWebSocket } from "./modules/realtime/attachPulseUpgrade.js";

const PORT = Number(process.env.PORT ?? 3001);

assertSafeAuthEnvironment();
assertFailCloseEnvironment();
initServerMonitor();
process.env.WM_BOOT_TS = String(Date.now());

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
 * Allowed CORS origins — whitelist only (Layer 3).
 * Production: WM_ALLOWED_ORIGINS and/or VITE_APP_URL / WM_APP_URL (https) — assertProductionSecrets.
 */
const ALLOWED_ORIGINS = buildAllowedOrigins();

function clientKeyFromReq(req: IncomingMessage): string {
  return resolveClientIp(req);
}

async function dispatchRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  applySecurityHeaders(res);

  const requestOrigin = req.headers.origin;
  const allowedOrigin = resolveCorsOrigin(requestOrigin, ALLOWED_ORIGINS);

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  } else if (requestOrigin && isProduction()) {
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-CSRF-Token, Idempotency-Key, Authorization, X-WM-Step-Up",
  );
  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-CSRF-Token, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Class, X-RateLimit-Dimension, Retry-After",
  );

  if (req.method === "OPTIONS") {
    if (isProduction() && requestOrigin && !allowedOrigin) {
      logSecurityEvent({
        event: "CORS_DENIED",
        method: "OPTIONS",
        httpStatus: 403,
        clientKey: clientKeyFromReq(req),
        meta: { phase: "preflight" },
      });
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { code: "CORS_DENIED", message: "Origin not allowed" } }));
      return;
    }
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = req.method ?? "GET";

  if (url.pathname === "/v1/jobmitra/health" && method === "GET") {
    const started = Number(process.env.WM_BOOT_TS || Date.now());
    const payload: Record<string, unknown> = {
      ok: true,
      service: "workmitra-api",
      ts: Date.now(),
      uptimeSec: Math.round((Date.now() - started) / 1000),
    };
    if (isDbAuthEnabled()) {
      try {
        const { pingDb } = await import("./db/pool.js");
        const db = await pingDb();
        payload.db = { ok: db.ok, latencyMs: db.latencyMs };
        const { getRuntimeFlags } = await import("./modules/ops/runtimeFlags.service.js");
        const flags = await getRuntimeFlags();
        payload.ops = {
          maintenanceMode: flags.maintenanceMode,
          lockdown: flags.lockdown,
          source: flags.source,
        };
        if (db.latencyMs > 1200) payload.ok = false;
      } catch (err) {
        payload.db = {
          ok: false,
          latencyMs: null,
          error: err instanceof Error ? err.message : "db_unreachable",
        };
        payload.ok = false;
      }
    }
    res.statusCode = payload.ok ? 200 : 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
    return;
  }

  if (await handleOpsRoutes(req, res, url.pathname, method)) {
    return;
  }

  // Emergency kill-switch: 503 public APIs; ops/health already returned above.
  if (await enforceOpsMaintenanceGate(req, res, url.pathname)) {
    logSecurityEvent({
      event: "MAINTENANCE_GATE_503",
      path: url.pathname,
      method,
      httpStatus: 503,
      clientKey: clientKeyFromReq(req),
    });
    return;
  }

  if (isProduction() && requestOrigin && !allowedOrigin) {
    logSecurityEvent({
      event: "CORS_DENIED",
      path: url.pathname,
      method,
      httpStatus: 403,
      clientKey: clientKeyFromReq(req),
    });
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { code: "CORS_DENIED", message: "Origin not allowed" } }));
    return;
  }

  const isContractMockPath =
    url.pathname.startsWith("/v1/jobmitra/employee/shift/availability") ||
    url.pathname.startsWith("/v1/jobmitra/employer/shift/availability-pool") ||
    url.pathname.startsWith("/v1/jobmitra/employer/shift/favorites");

  const rate = await applyRateLimiter(req, res, url.pathname, method);
  if (rate.blocked) {
    const storeOutage = rate.dimension === "store_error";
    const httpStatus = storeOutage ? 503 : 429;
    logSecurityEvent({
      event: storeOutage ? "RATE_LIMIT_STORE_ERROR" : "RATE_LIMIT_HIT",
      path: url.pathname,
      method,
      httpStatus,
      rateClass: rate.rateClass,
      clientKey: clientKeyFromReq(req),
      meta: {
        retryAfterSec: rate.retryAfterSec,
        dimension: rate.dimension,
      },
    });
    if (!storeOutage) {
      recordRateLimitSignal(clientKeyFromReq(req), url.pathname, rate.rateClass);
    }
    res.statusCode = httpStatus;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          code: storeOutage ? "RATE_LIMIT_UNAVAILABLE" : "TOO_MANY_REQUESTS",
          message: storeOutage ? "Rate limit service temporarily unavailable" : "Too Many Requests",
          retryAfterSec: rate.retryAfterSec,
        },
      }),
    );
    return;
  }

  const chaos = await applyChaosInjection(req, res);
  if (chaos === "handled") return;

  const isLogin = method === "POST" && url.pathname === "/v1/jobmitra/auth/login";
  const isOpsMutating =
    (method === "PATCH" && url.pathname === "/v1/jobmitra/ops/flags") ||
    (method === "POST" && url.pathname === "/v1/jobmitra/ops/audit") ||
    (method === "POST" && url.pathname === "/v1/jobmitra/ops/step-up") ||
    (method === "POST" && url.pathname === "/v1/jobmitra/ops/privileged");
  const isPublicEventDay = url.pathname.startsWith("/v1/jobmitra/public/event-day/");
  const skipCsrf =
    isLogin || isOpsMutating || isPublicEventDay || (isContractMockPath && !isAuthEnabled());
  if (isMutatingMethod(method) && !skipCsrf) {
    if (!(await enforceCsrf(req, res))) return;
  }

  if (
    isMutatingMethod(method) &&
    url.pathname.startsWith("/v1/jobmitra/") &&
    !url.pathname.startsWith("/v1/jobmitra/ops/") &&
    !url.pathname.startsWith("/v1/jobmitra/auth/") &&
    !url.pathname.startsWith("/v1/jobmitra/public/")
  ) {
    recordPostingSpikeSignal(clientKeyFromReq(req), url.pathname);
  }

  if (isContractMockPath) {
    if (isAuthEnabled()) {
      const requestId = getRequestId();
      await requireAuth(
        req,
        res,
        requestId,
        async (authedReq) => {
          if (await handleAvailabilityRoutes(authedReq, res, url, method)) return;
          if (await handleFavoritesRoutes(req, res, url, method)) return;
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: { code: "NOT_FOUND", message: "Route not found" } }));
        },
        url,
      );
      return;
    }
    if (await handleAvailabilityRoutes(req, res, url, method)) return;
    if (await handleFavoritesRoutes(req, res, url, method)) return;
  }

  if (await handleAuthRoutes(req, res, url.pathname, method)) return;
  if (await handleCallingRoutes(req, res, url, method)) return;
  if (await handlePublicEventDayRoutes(req, res, url, method)) return;
  if (await handleAdminModerationRoutes(req, res, url, method)) return;
  if (await handleEmployeeRoutes(req, res, url, method)) return;
  if (await handleEmployerRoutes(req, res, url, method)) return;

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: { code: "NOT_FOUND", message: "Route not found" } }));
}

const server = createServer((req, res) => {
  void dispatchRequest(req, res).catch((err: unknown) => {
    handleUnhandledDispatchError(req, res, err, getRequestId());
  });
});
attachPulseWebSocket(server);

server.listen(PORT, () => {
  console.log(`[Job Mitra API] listening on http://localhost:${PORT}`);
  console.log(
    `[Job Mitra API] auth:     POST /v1/jobmitra/auth/login | GET /v1/jobmitra/auth/me | POST /v1/jobmitra/auth/logout | POST /v1/jobmitra/auth/supabase-bridge`,
  );
  console.log(
    `[Job Mitra API] employee: /v1/jobmitra/employee/career/* (requireAuth + requireEmployeeRole)`,
  );
  console.log(
    `[Job Mitra API] employer: /v1/jobmitra/employer/career|shift|vault|hr|workforce|event-day/* (requireAuth + requireEmployerRole)`,
  );
  console.log(
    `[Job Mitra API] public:   GET /v1/jobmitra/public/event-day/passes/:token | POST /v1/jobmitra/public/event-day/check-in`,
  );
  console.log(
    `[Job Mitra API] calling:  POST /v1/jobmitra/call/{initiate|answer|end|fallback|register-device} (alias /api/call/*)`,
  );
  console.log(`[Job Mitra API] defense:  L1–L4 + L5 DB resilience + L6 fail-close env`);
  console.log(
    `[Job Mitra API] calling job: npm run job:call-fallback (no-answer → Twilio or mark failed)`,
  );
});
