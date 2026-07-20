import { createServer } from "node:http";
import { assertSafeAuthEnvironment, isProduction, isDbAuthEnabled } from "./modules/auth/env.js";
import { handleAuthRoutes } from "./modules/auth/auth.routes.js";
import { handleEmployeeRoutes } from "./modules/employee/employee.routes.js";
import { handleEmployerRoutes } from "./modules/employer/employer.routes.js";

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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = req.method ?? "GET";

  if (await handleAuthRoutes(req, res, url.pathname, method)) return;
  if (await handleEmployeeRoutes(req, res, url, method)) return;
  if (await handleEmployerRoutes(req, res, url, method)) return;

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: { code: "NOT_FOUND", message: "Route not found" } }));
});

server.listen(PORT, () => {
  console.log(`[Job Mitra API] listening on http://localhost:${PORT}`);
  console.log(
    `[Job Mitra API] auth:     POST /v1/jobmitra/auth/login | GET /v1/jobmitra/auth/me | POST /v1/jobmitra/auth/logout`,
  );
  console.log(
    `[Job Mitra API] employee: /v1/jobmitra/employee/career/* (requireAuth + requireEmployeeRole)`,
  );
  console.log(
    `[Job Mitra API] employer: /v1/jobmitra/employer/career/* (requireAuth + requireEmployerRole)`,
  );
});
