/**
 * Phase 2.1 — Operator staging evidence collector (read-only on auth code).
 *
 * Prerequisites (staging only — set in shell or .env, never commit):
 *   DATABASE_URL              — Supabase Session Pooler (staging project)
 *   WM_SESSION_HASH_PEPPER    — staging pepper
 *   WM_ALLOWED_ORIGINS        — exact staging frontend origin
 *   SEED_EMPLOYEE_PASSWORD    — staging seed password
 *   AUTH_USER_SOURCE=db       — set automatically by npm run dev:db
 *
 * Optional:
 *   STAGING_API_BASE_URL      — if API already deployed (e.g. https://api-staging.example)
 *   WM_LOGIN_RATE_LIMIT_MAX   — default 5
 *
 * Usage:
 *   node scripts/phase-2-1-operator-staging.mjs
 *
 * Logging policy: never print DATABASE_URL, pepper, passwords, session tokens,
 * raw Set-Cookie headers, or cookie values. Cookie evidence = flag booleans only.
 */
import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import https from "node:https";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE = process.env.STAGING_API_BASE_URL ?? "http://localhost:3001";
const WRONG_ORIGIN = "https://evil.example.com";
const EMPLOYEE_EMAIL = process.env.SEED_EMPLOYEE_EMAIL ?? "employee@staging.jobmitra.app";
const EMPLOYEE_PASSWORD = process.env.SEED_EMPLOYEE_PASSWORD;
const SESSION_COOKIE_NAME = "wm_session";

/** Mirror server/index.ts origin list — first entry used for CORS probes. */
function resolveExpectedAllowedOrigin() {
  if (process.env.WM_ALLOWED_ORIGINS) {
    const first = process.env.WM_ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .find(Boolean);
    if (first) return first;
  }
  return "http://localhost:5173";
}

const ALLOWED_ORIGIN = resolveExpectedAllowedOrigin();

const evidence = [];
let serverProc = null;

function log(id, status, note) {
  evidence.push({ id, status, note, at: new Date().toISOString() });
  console.log(`[${status.padEnd(12)}] ${id} — ${note}`);
}

function envPresent(name) {
  return Boolean(process.env[name]);
}

/** Parse last JSON object line from subprocess stdout (skips npm warn noise). */
function parseLastJsonLine(stdout) {
  const lines = (stdout || "").split("\n").map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith("{")) return JSON.parse(lines[i]);
  }
  throw new Error("no json line in stdout");
}

/** Raw HTTP(S) probe — fetch() may hide ACAO on some Node versions; use for CORS evidence. */
function probeHttp(method, path, origin) {
  return new Promise((resolveProbe, reject) => {
    const base = new URL(API_BASE);
    const isHttps = base.protocol === "https:";
    const lib = isHttps ? https : http;
    const headers = {};
    if (origin) headers.Origin = origin;
    if (method === "OPTIONS") headers["Access-Control-Request-Method"] = "GET";

    const req = lib.request(
      {
        hostname: base.hostname,
        port: base.port || (isHttps ? 443 : 80),
        path,
        method,
        headers,
      },
      (res) => {
        res.resume();
        resolveProbe({
          status: res.statusCode ?? 0,
          acao: res.headers["access-control-allow-origin"] ?? null,
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function fetchApi(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...opts, redirect: "manual" });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-json */
  }
  return { res, text, json, headers: res.headers };
}

function getSetCookie(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

/** Parse Set-Cookie directive flags only — never log cookie values or raw headers. */
function parseSetCookieFlags(setCookieHeaders) {
  const combined = setCookieHeaders.join("; ");
  return {
    cookieName: SESSION_COOKIE_NAME,
    hasHttpOnly: /\bHttpOnly\b/i.test(combined),
    hasSameSiteLax: /\bSameSite=Lax\b/i.test(combined),
    hasSecure: /\bSecure\b/i.test(combined),
    hasLogoutMaxAgeZero: /\bMax-Age=0\b/i.test(combined),
  };
}

/** Build Cookie request header internally — value never logged. */
function extractSessionCookieHeader(setCookieHeaders) {
  for (const header of setCookieHeaders) {
    const match = header.match(/^wm_session=([^;]+)/);
    if (match) return `${SESSION_COOKIE_NAME}=${match[1]}`;
  }
  return "";
}

async function waitForApi(maxMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const { res } = await fetchApi("/v1/jobmitra/auth/me");
      if (res.status === 401 || res.status === 200) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function startLocalApi() {
  return new Promise((resolveStart, reject) => {
    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    serverProc = spawn(npx, ["tsx", "server/index.ts"], {
      cwd: root,
      env: { ...process.env, AUTH_USER_SOURCE: "db", NODE_ENV: "production" },
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    serverProc.on("error", reject);
    waitForApi().then((ok) => {
      if (ok) resolveStart();
      else {
        serverProc?.kill();
        reject(new Error("API did not start within timeout (stderr redacted)"));
      }
    });
  });
}

function stopLocalApi() {
  if (serverProc) {
    serverProc.kill();
    serverProc = null;
  }
}

// ─── 1. Staging env confirmation ─────────────────────────────────────────────

log("1.2 AUTH_USER_SOURCE", envPresent("AUTH_USER_SOURCE") ? "PASS" : "INFO", envPresent("AUTH_USER_SOURCE") ? process.env.AUTH_USER_SOURCE : "will force db for local API run");
log("1.2 DATABASE_URL", envPresent("DATABASE_URL") ? "PASS" : "BLOCKED", envPresent("DATABASE_URL") ? "set" : "not set — cannot run DB-backed staging tests");
log("2.1 WM_SESSION_HASH_PEPPER", envPresent("WM_SESSION_HASH_PEPPER") ? "PASS" : "BLOCKED", envPresent("WM_SESSION_HASH_PEPPER") ? "set" : "not set");
log("4.1 WM_ALLOWED_ORIGINS", envPresent("WM_ALLOWED_ORIGINS") ? "PASS" : "WARN", envPresent("WM_ALLOWED_ORIGINS") ? "set" : `not set — using default origin for CORS test`);

const poolerHint = process.env.DATABASE_URL?.includes("pooler") ?? false;
if (envPresent("DATABASE_URL")) {
  log("1.6 Session Pooler URL", poolerHint ? "PASS" : "WARN", poolerHint ? "host contains pooler" : "pooler host not detected in connection string");
}

// ─── 3. Secure cookie flag (production mode logic — subprocess uses env, not inline assignment) ─

const secureTest = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "tsx",
    "-e",
    "import { secureCookiesEnabled } from './server/modules/auth/env.ts'; console.log(JSON.stringify({ hasSecure: secureCookiesEnabled() }));",
  ],
  {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
    encoding: "utf8",
    shell: process.platform === "win32",
  },
);
try {
  const parsed = parseLastJsonLine(secureTest.stdout);
  log(
    "3.4 Secure flag (NODE_ENV=production logic)",
    parsed.hasSecure === true ? "PASS" : "INFO",
    `hasSecure=${parsed.hasSecure === true} (live Set-Cookie is authoritative when API runs)`,
  );
} catch {
  log(
    "3.4 Secure flag (NODE_ENV=production logic)",
    "INFO",
    "subprocess check skipped — use live Set-Cookie hasSecure after login",
  );
}

if (!envPresent("DATABASE_URL") || !EMPLOYEE_PASSWORD) {
  log("9.5 staging smoke", "BLOCKED", "DATABASE_URL and SEED_EMPLOYEE_PASSWORD required");
  log("4.4 wrong-origin CORS", "BLOCKED", "requires running staging API");
  log("5.1 rate limit 429", "BLOCKED", "requires running staging API + DB");
  log("5.3 audit row", "BLOCKED", "requires DATABASE_URL");
  log("8.1 Supabase backup", "NEEDS_OPERATOR", "Supabase dashboard — agent cannot access");
  printSummary();
  process.exit(0);
}

// ─── Run live tests ───────────────────────────────────────────────────────────

const useRemote = Boolean(process.env.STAGING_API_BASE_URL);

try {
  if (!useRemote) {
    log("runtime", "INFO", "Starting local API with AUTH_USER_SOURCE=db NODE_ENV=production");
    await startLocalApi();
  } else {
    log("runtime", "INFO", `Using remote staging API: ${API_BASE}`);
    const up = await waitForApi();
    if (!up) throw new Error("Remote staging API unreachable");
  }

  // 9.5 Smoke
  const login = await fetchApi("/v1/jobmitra/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: EMPLOYEE_EMAIL, password: EMPLOYEE_PASSWORD }),
  });
  const loginSetCookies = getSetCookie(login.headers);
  const loginOk = login.res.status === 200 && Boolean(login.json?.data?.user);
  log("9.5 login", loginOk ? "PASS" : "FAIL", `status=${login.res.status} userPresent=${loginOk}`);

  const cookieHeader = extractSessionCookieHeader(loginSetCookies);
  const loginFlags = parseSetCookieFlags(loginSetCookies);
  log("3.2 HttpOnly", loginFlags.hasHttpOnly ? "PASS" : "FAIL", `cookieName=${SESSION_COOKIE_NAME} hasHttpOnly=${loginFlags.hasHttpOnly}`);
  log("3.3 SameSite=Lax", loginFlags.hasSameSiteLax ? "PASS" : "FAIL", `cookieName=${SESSION_COOKIE_NAME} hasSameSiteLax=${loginFlags.hasSameSiteLax}`);
  log("3.4 Secure (live)", loginFlags.hasSecure ? "PASS" : "FAIL", `cookieName=${SESSION_COOKIE_NAME} hasSecure=${loginFlags.hasSecure}`);

  const me = await fetchApi("/v1/jobmitra/auth/me", {
    headers: { Cookie: cookieHeader, Origin: ALLOWED_ORIGIN },
  });
  log("9.5 GET /me", me.res.status === 200 && me.json?.data?.user ? "PASS" : "FAIL", `status=${me.res.status}`);

  const logout = await fetchApi("/v1/jobmitra/auth/logout", {
    method: "POST",
    headers: { Cookie: cookieHeader, Origin: ALLOWED_ORIGIN },
  });
  log("9.5 POST /logout", logout.res.status === 200 && logout.json?.data?.ok === true ? "PASS" : "FAIL", `status=${logout.res.status}`);

  const logoutFlags = parseSetCookieFlags(getSetCookie(logout.headers));
  log(
    "3.6 logout clears cookie",
    logoutFlags.hasLogoutMaxAgeZero ? "PASS" : "FAIL",
    `cookieName=${SESSION_COOKIE_NAME} hasLogoutMaxAgeZero=${logoutFlags.hasLogoutMaxAgeZero}`,
  );

  const meAfter = await fetchApi("/v1/jobmitra/auth/me", {
    headers: { Cookie: cookieHeader, Origin: ALLOWED_ORIGIN },
  });
  log("9.5 GET /me after logout", meAfter.res.status === 401 ? "PASS" : "FAIL", `status=${meAfter.res.status}`);

  // 4.4 / 4.3 CORS — raw HTTP probe (matches server OPTIONS + GET handling)
  const corsBadOpts = await probeHttp("OPTIONS", "/v1/jobmitra/auth/me", WRONG_ORIGIN);
  const corsBadGet = await probeHttp("GET", "/v1/jobmitra/auth/me", WRONG_ORIGIN);
  const badAco = corsBadOpts.acao ?? corsBadGet.acao;
  const corsOk =
    badAco !== "*" && badAco !== WRONG_ORIGIN && (badAco === null || badAco === "");
  log(
    "4.4 wrong-origin CORS",
    corsOk ? "PASS" : "FAIL",
    `OPTIONS_ACAO=${corsBadOpts.acao ?? "(none)"} GET_ACAO=${corsBadGet.acao ?? "(none)"}`,
  );

  const corsGoodOpts = await probeHttp("OPTIONS", "/v1/jobmitra/auth/me", ALLOWED_ORIGIN);
  const corsGoodGet = await probeHttp("GET", "/v1/jobmitra/auth/me", ALLOWED_ORIGIN);
  const goodAco = corsGoodOpts.acao ?? corsGoodGet.acao;
  const corsAllowedPass = goodAco === ALLOWED_ORIGIN;
  log(
    "4.3 allowed-origin CORS",
    corsAllowedPass ? "PASS" : "FAIL",
    `OPTIONS_ACAO=${corsGoodOpts.acao ?? "(none)"} GET_ACAO=${corsGoodGet.acao ?? "(none)"} expectedOriginConfigured=true`,
  );
  if (!corsAllowedPass) {
    log(
      "4.3 CORS follow-up",
      "NEEDS_OPERATOR",
      "See GAP-003 — run scripts/gap-003-cors-probe.mjs with PROBE_NODE_ENV=production before opening server CORS patch",
    );
  }

  // 5.1 Rate limit — use wrong password
  for (let i = 1; i <= 6; i++) {
    const r = await fetchApi("/v1/jobmitra/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
      body: JSON.stringify({ email: EMPLOYEE_EMAIL, password: "wrong-password-phase-2-1" }),
    });
    if (r.res.status === 429) {
      log("5.1 6th failed login 429", "PASS", `attempt=${i} status=429 code=${r.json?.error?.code ?? "unknown"}`);
      break;
    }
    if (i === 6) {
      log("5.1 6th failed login 429", "FAIL", `last status=${r.res.status}`);
    }
  }

  // 5.3 Audit + login_attempt rows — dedicated script (tsx -e top-level await fails on Windows; $1 mangled in shell)
  const auditQuery = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["tsx", "scripts/gap-004-audit-query.mjs"],
    {
      cwd: root,
      env: { ...process.env, AUTH_USER_SOURCE: "db" },
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );
  if (auditQuery.status !== 0) {
    log("5.3 audit/login rows", "FAIL", `audit subprocess exitCode=${auditQuery.status ?? "unknown"}`);
  } else {
    try {
      const payload = parseLastJsonLine(auditQuery.stdout);
      if (payload.ok === false) {
        log("5.3 audit/login rows", "FAIL", "audit SELECT failed (details redacted)");
      } else {
        const auditRowCount = Number(payload.auditFilteredRowCount ?? 0);
        const failedCount = Number(payload.failedAttemptCount ?? 0);
        const hasAudit = auditRowCount > 0 || failedCount > 0;
        const latestType = payload.auditFilteredLatestType ?? "none";
        log(
          "5.3 audit/login rows",
          hasAudit ? "PASS" : "FAIL",
          `auditRowCount=${auditRowCount} failedAttemptCount=${failedCount} latestEventType=${latestType}`,
        );
      }
    } catch {
      log("5.3 audit/login rows", "FAIL", "audit query parse failed (details redacted)");
    }
  }

  log("8.1 Supabase backup/PITR", "NEEDS_OPERATOR", "Confirm in Supabase dashboard — not automatable here");
} catch (err) {
  log("runtime", "FAIL", "staging evidence run failed (details redacted)");
} finally {
  stopLocalApi();
}

printSummary();

function printSummary() {
  const pass = evidence.filter((e) => e.status === "PASS").length;
  const fail = evidence.filter((e) => e.status === "FAIL").length;
  const blocked = evidence.filter((e) => e.status === "BLOCKED").length;
  const needs = evidence.filter((e) => e.status === "NEEDS_OPERATOR").length;
  console.log(`\n=== Operator staging summary: ${pass} PASS, ${fail} FAIL, ${blocked} BLOCKED, ${needs} NEEDS_OPERATOR ===`);
  console.log(JSON.stringify(evidence, null, 2));
}
