/**
 * GAP-003 — read-only CORS probe (no auth code changes).
 * Usage:
 *   node scripts/gap-003-cors-probe.mjs
 * Env (optional): WM_ALLOWED_ORIGINS, NODE_ENV probe mode via PROBE_NODE_ENV
 */
import { spawn } from "node:child_process";
import http from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3099;
const ORIGIN = process.env.WM_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).find(Boolean) ?? "http://localhost:5173";
const NODE_ENV = process.env.PROBE_NODE_ENV ?? "development";
const USE_DB = NODE_ENV === "production";

function probe(method, path, origin) {
  return new Promise((resolveProbe, reject) => {
    const headers = {};
    if (origin) headers.Origin = origin;
    if (method === "OPTIONS") headers["Access-Control-Request-Method"] = "GET";
    const req = http.request(
      { hostname: "127.0.0.1", port: PORT, path, method, headers },
      (res) => {
        res.resume();
        resolveProbe({
          status: res.statusCode ?? 0,
          acao: res.headers["access-control-allow-origin"] ?? null,
          vary: res.headers.vary ?? null,
          credentials: res.headers["access-control-allow-credentials"] ?? null,
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function waitReady(maxMs = 15000) {
  const start = Date.now();
  return new Promise((resolveReady) => {
    const tick = () => {
      http
        .get(`http://127.0.0.1:${PORT}/v1/jobmitra/auth/me`, (res) => {
          res.resume();
          if (res.statusCode === 401 || res.statusCode === 200) resolveReady(true);
          else if (Date.now() - start < maxMs) setTimeout(tick, 300);
          else resolveReady(false);
        })
        .on("error", () => {
          if (Date.now() - start < maxMs) setTimeout(tick, 300);
          else resolveReady(false);
        });
    };
    tick();
  });
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const childEnv = {
  ...process.env,
  PORT: String(PORT),
  NODE_ENV,
  WM_ALLOWED_ORIGINS: process.env.WM_ALLOWED_ORIGINS ?? ORIGIN,
  WM_SESSION_HASH_PEPPER: process.env.WM_SESSION_HASH_PEPPER ?? "gap003-probe-pepper-not-for-prod",
};

if (USE_DB) {
  childEnv.AUTH_USER_SOURCE = "db";
  if (!process.env.DATABASE_URL) {
    console.log(JSON.stringify({ error: "DATABASE_URL required for production probe", skipped: true }));
    process.exit(0);
  }
} else {
  childEnv.AUTH_USER_SOURCE = "memory";
}

const proc = spawn(npx, ["tsx", "server/index.ts"], {
  cwd: root,
  env: childEnv,
  shell: process.platform === "win32",
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
proc.stderr?.on("data", (c) => {
  stderr += String(c);
});

const ready = await waitReady();
if (!ready) {
  proc.kill();
  console.log(
    JSON.stringify({
      error: "server_start_timeout",
      nodeEnv: NODE_ENV,
      stderrLines: stderr.split("\n").slice(-5).map((l) => l.trim()).filter(Boolean),
    }),
  );
  process.exit(1);
}

const evil = "https://evil.example.com";
const results = {
  nodeEnv: NODE_ENV,
  wmAllowedOrigins: childEnv.WM_ALLOWED_ORIGINS,
  probeOrigin: ORIGIN,
  allowed: {
    options: await probe("OPTIONS", "/v1/jobmitra/auth/me", ORIGIN),
    get: await probe("GET", "/v1/jobmitra/auth/me", ORIGIN),
  },
  wrong: {
    options: await probe("OPTIONS", "/v1/jobmitra/auth/me", evil),
    get: await probe("GET", "/v1/jobmitra/auth/me", evil),
  },
};

proc.kill();
console.log(JSON.stringify(results, null, 2));
