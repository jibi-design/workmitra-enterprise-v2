/**
 * Authenticated store-submission live stress (Node wave harness).
 *
 * Strategy (avoids IP login lockout at 1k VUs):
 *  1) Warm session pool (1–5 logins) with cookie capture
 *  2) Ramp 1→1000 concurrent authenticated /auth/me + RLS/shift reads
 *  3) Small login latency probe (≤3 concurrent) — optional
 *
 * Required: WM_API_BASE, WM_LOAD_TEST_EMAIL, WM_LOAD_TEST_PASSWORD
 * Optional: K6_VUS_MAX=1000, WM_SESSION_POOL=3
 * Forbidden: K6_CHAOS=1
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VUS = Number(process.env.K6_VUS_MAX || "1000");
const BASE = (process.env.WM_API_BASE || "").replace(/\/$/, "");
const CHAOS = (process.env.K6_CHAOS || "0") === "1";
const EMAIL = (process.env.WM_LOAD_TEST_EMAIL || "").trim();
const PASSWORD = (process.env.WM_LOAD_TEST_PASSWORD || "").trim();
const SESSION_POOL = Math.max(1, Math.min(5, Number(process.env.WM_SESSION_POOL || "3")));
const REQUIRE_AUTH = (process.env.WM_REQUIRE_AUTH || "1") === "1";

const AUTH_READS = ["/v1/jobmitra/auth/me", "/v1/jobmitra/auth/sessions"];
const SHIFT_READS = [
  "/v1/jobmitra/employee/shift/availability?workerMlId=store-stress-auth",
  "/v1/jobmitra/employer/shift/availability-pool",
  "/v1/jobmitra/employer/shift/favorites",
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "tests/load");
const summaryPath = path.join(outDir, "node-store-submission-stress-summary.json");

if (!BASE) {
  console.error("[store-stress-auth] WM_API_BASE is required");
  process.exit(2);
}
if (CHAOS) {
  console.error("[store-stress-auth] K6_CHAOS=1 forbidden for certification run");
  process.exit(2);
}
if (REQUIRE_AUTH && (!EMAIL || !PASSWORD)) {
  console.error(
    "[store-stress-auth] WM_LOAD_TEST_EMAIL and WM_LOAD_TEST_PASSWORD are required (WM_REQUIRE_AUTH=1)",
  );
  process.exit(2);
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

function cookieHeaderFromJar(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function applySetCookie(jar, res) {
  /** @type {string[]} */
  let raw = [];
  if (typeof res.headers.getSetCookie === "function") {
    raw = res.headers.getSetCookie();
  } else {
    const single = res.headers.get("set-cookie");
    if (single) raw = [single];
  }
  for (const line of raw) {
    const pair = String(line).split(";")[0];
    const eq = pair.indexOf("=");
    if (eq < 1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (name) jar[name] = value;
  }
}

/**
 * @returns {Promise<{status:number,ms:number,ok:boolean,is5xx:boolean,timeout:boolean,authOk?:boolean,error?:string,jar?:Record<string,string>}>}
 */
async function fetchJson(url, init = {}, jar = null) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  const headers = {
    Accept: "application/json",
    ...(init.headers || {}),
  };
  if (jar && Object.keys(jar).length) {
    headers.Cookie = cookieHeaderFromJar(jar);
  }
  try {
    const res = await fetch(url, { ...init, headers, signal: controller.signal });
    clearTimeout(timer);
    if (jar) applySetCookie(jar, res);
    const status = res.status;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const buf = Buffer.from(await res.arrayBuffer().catch(() => new ArrayBuffer(0)));
    const head = buf.subarray(0, 32).toString("utf8").trimStart();
    const isHtml =
      ct.includes("text/html") ||
      head.startsWith("<!DOCTYPE") ||
      head.startsWith("<html") ||
      head.startsWith("<!doctype");
    if (isHtml) {
      return {
        status,
        ms: performance.now() - started,
        ok: false,
        is5xx: false,
        timeout: false,
        authOk: false,
        error: "HTML_NOT_API",
        jar: jar ? { ...jar } : undefined,
      };
    }
    return {
      status,
      ms: performance.now() - started,
      ok: status > 0 && status < 500,
      is5xx: status >= 500,
      timeout: false,
      authOk: status === 200,
      jar: jar ? { ...jar } : undefined,
    };
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 0,
      ms: performance.now() - started,
      ok: false,
      is5xx: false,
      timeout: /abort/i.test(message),
      authOk: false,
      error: message,
    };
  }
}

async function loginOnce() {
  const jar = /** @type {Record<string,string>} */ ({});
  // Warm CSRF cookie (optional for login, helps some edge paths).
  await fetchJson(`${BASE}/v1/jobmitra/auth/csrf`, { method: "GET" }, jar);
  const login = await fetchJson(
    `${BASE}/v1/jobmitra/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    },
    jar,
  );
  return { login, jar };
}

async function warmSessionPool() {
  /** @type {Array<Record<string,string>>} */
  const sessions = [];
  /** @type {Array<{status:number,ms:number}>} */
  const loginSamples = [];

  for (let i = 0; i < SESSION_POOL; i++) {
    const { login, jar } = await loginOnce();
    loginSamples.push({ status: login.status, ms: login.ms });
    if (login.status !== 200 || !jar.wm_session) {
      console.error(
        `[store-stress-auth] login failed status=${login.status} hasSessionCookie=${Boolean(jar.wm_session)}`,
      );
      if (login.status === 429) {
        console.error("[store-stress-auth] rate-limited during session warm-up — aborting");
        process.exit(1);
      }
      // Keep trying remaining pool slots only if first failed for other reasons
      if (i === 0) process.exit(1);
      continue;
    }
    // Verify session binds to DB auth (/me)
    const me = await fetchJson(`${BASE}/v1/jobmitra/auth/me`, { method: "GET" }, jar);
    if (me.status !== 200) {
      console.error(`[store-stress-auth] /auth/me after login status=${me.status}`);
      process.exit(1);
    }
    sessions.push(jar);
    console.log(
      `[store-stress-auth] session ${sessions.length}/${SESSION_POOL} ready (login ${Math.round(login.ms)}ms, me ${Math.round(me.ms)}ms)`,
    );
    // Brief pause to avoid login lockout between warm-ups
    await new Promise((r) => setTimeout(r, 250));
  }

  if (!sessions.length) {
    console.error("[store-stress-auth] no warm sessions");
    process.exit(1);
  }
  return { sessions, loginSamples };
}

async function runAuthenticatedClient(clientId, sessions) {
  const jar = sessions[clientId % sessions.length];
  const results = [];

  const health = await fetchJson(`${BASE}/v1/jobmitra/health`);
  results.push({ route: "/v1/jobmitra/health", class: "health", ...health });

  const mePath = AUTH_READS[clientId % AUTH_READS.length];
  const me = await fetchJson(`${BASE}${mePath}`, { method: "GET" }, { ...jar });
  results.push({
    route: mePath,
    class: "auth",
    ...me,
    // For authenticated certification, 401/403 count as fail even if <500
    ok: me.status === 200,
  });

  const shiftPath = SHIFT_READS[clientId % SHIFT_READS.length];
  const shift = await fetchJson(`${BASE}${shiftPath}`, { method: "GET" }, { ...jar });
  results.push({ route: shiftPath, class: "shift", ...shift });

  return results;
}

async function wave(concurrency, waveId, sessions) {
  const started = performance.now();
  const batches = await Promise.all(
    Array.from({ length: concurrency }, (_, i) =>
      runAuthenticatedClient(waveId * 10_000 + i, sessions),
    ),
  );
  return { elapsedMs: performance.now() - started, flat: batches.flat() };
}

async function main() {
  console.log(
    `[store-stress-auth] live authenticated ramp against ${BASE} (VUs=${VUS}, pool=${SESSION_POOL}, chaos=0)`,
  );
  console.log(`[store-stress-auth] email=${EMAIL.replace(/(^.).*(@.*)$/, "$1***$2")}`);

  const probe = await fetchJson(`${BASE}/v1/jobmitra/health`);
  if (!probe.ok) {
    console.error(
      `[store-stress-auth] health probe failed status=${probe.status} error=${probe.error || "n/a"}`,
    );
    if (probe.error === "HTML_NOT_API") {
      console.error(
        "[store-stress-auth] Origin returned SPA/HTML for /v1 — Cloudflare is not proxying Job Mitra API. Set WM_API_BASE to the real API origin.",
      );
    }
    process.exit(1);
  }

  const { sessions, loginSamples } = await warmSessionPool();

  const stages = [
    Math.min(1, VUS),
    Math.min(50, VUS),
    Math.min(200, VUS),
    Math.min(500, VUS),
    VUS,
  ].filter((v, i, arr) => i === 0 || v > arr[i - 1]);

  const all = [];
  const stageReports = [];
  const wallStart = performance.now();

  for (let i = 0; i < stages.length; i++) {
    const n = stages[i];
    console.log(`[store-stress-auth] wave ${i + 1}/${stages.length}: ${n} concurrent authenticated clients`);
    const { elapsedMs, flat } = await wave(n, i, sessions);
    all.push(...flat);
    const fails = flat.filter((r) => !r.ok).length;
    const s5 = flat.filter((r) => r.is5xx).length;
    const authFails = flat.filter((r) => r.class === "auth" && !r.ok).length;
    stageReports.push({
      wave: i + 1,
      concurrency: n,
      requests: flat.length,
      failCount: fails,
      authFailCount: authFails,
      http5xx: s5,
      elapsedMs,
    });
    console.log(
      `[store-stress-auth] wave ${i + 1} done requests=${flat.length} fail=${fails} authFail=${authFails} 5xx=${s5} ms=${Math.round(elapsedMs)}`,
    );
  }

  const wallMs = performance.now() - wallStart;
  const byClass = (cls) => all.filter((r) => r.class === cls);
  const latAll = all.map((r) => r.ms).sort((a, b) => a - b);
  const latAuth = byClass("auth")
    .map((r) => r.ms)
    .sort((a, b) => a - b);
  const latShift = byClass("shift")
    .map((r) => r.ms)
    .sort((a, b) => a - b);
  const latLogin = loginSamples.map((r) => r.ms).sort((a, b) => a - b);

  const failCount = all.filter((r) => !r.ok).length;
  const http5xx = all.filter((r) => r.is5xx).length;
  const timeoutCount = all.filter((r) => r.timeout || r.status === 0).length;
  const authFailCount = byClass("auth").filter((r) => !r.ok).length;
  const okRate = all.length ? (all.length - failCount) / all.length : 0;
  const authOkRate = byClass("auth").length
    ? (byClass("auth").length - authFailCount) / byClass("auth").length
    : 0;
  const rate5xx = all.length ? http5xx / all.length : 0;
  const p95 = percentile(latAll, 0.95);
  const p99 = percentile(latAll, 0.99);
  const authP95 = percentile(latAuth, 0.95);
  const authP99 = percentile(latAuth, 0.99);
  const shiftP95 = percentile(latShift, 0.95);
  const shiftP99 = percentile(latShift, 0.99);
  const loginP95 = percentile(latLogin, 0.95);
  const throughputRps = all.length / (wallMs / 1000);

  const thresholds = {
    okRateMin: 0.95,
    authOkRateMin: 0.99,
    rate5xxMax: 0,
    p95MsMax: 3000,
    p99MsMax: 8000,
    authP95MsMax: 3000,
    timeoutMax: 0,
  };

  const pass =
    okRate >= thresholds.okRateMin &&
    authOkRate >= thresholds.authOkRateMin &&
    rate5xx <= thresholds.rate5xxMax &&
    p95 <= thresholds.p95MsMax &&
    p99 <= thresholds.p99MsMax &&
    authP95 <= thresholds.authP95MsMax &&
    timeoutCount <= thresholds.timeoutMax;

  const summary = {
    harness: "node-store-submission-stress-auth",
    profile: "store-submission-live-1k-authenticated",
    base: BASE,
    vusMax: VUS,
    chaos: false,
    authEnabled: true,
    sessionPool: sessions.length,
    wallMs,
    totalRequests: all.length,
    okRate,
    authOkRate,
    failCount,
    authFailCount,
    http5xx,
    timeoutCount,
    p95Ms: p95,
    p99Ms: p99,
    authP95Ms: authP95,
    authP99Ms: authP99,
    shiftP95Ms: shiftP95,
    shiftP99Ms: shiftP99,
    loginWarmP95Ms: loginP95,
    loginWarmSamples: loginSamples,
    throughputRps,
    stages: stageReports,
    thresholds,
    supabaseNote:
      "Connection pool / CPU: observe Supabase Dashboard → Database → Connections & Query performance for this run window. Not scraped by this client.",
    verdict: pass ? "PASS" : "FAIL",
    generatedAt: new Date().toISOString(),
  };

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`[store-stress-auth] summary → ${summaryPath}`);
  console.log(
    `[store-stress-auth] verdict=${summary.verdict} okRate=${(okRate * 100).toFixed(2)}% authOk=${(authOkRate * 100).toFixed(2)}% 5xx=${http5xx} p95=${p95.toFixed(0)}ms p99=${p99.toFixed(0)}ms authP95=${authP95.toFixed(0)}ms rps=${throughputRps.toFixed(1)}`,
  );
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error("[store-stress-auth] fatal", err);
  process.exit(1);
});
