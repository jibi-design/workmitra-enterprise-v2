/**
 * 5-minute hybrid API background load.
 * 50 concurrent employer reads + 500+ employee reads per burst. No chaos injection.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DURATION_MS = Number(process.env.DURATION_MS || "300000");
const BASE = (process.env.WM_API_BASE || "http://127.0.0.1:3001").replace(/\/$/, "");
const EMPLOYER_N = Number(process.env.HYBRID_EMPLOYER_VUS || "50");
const EMPLOYEE_N = Number(process.env.HYBRID_EMPLOYEE_ACTIONS || "500");
const EMP_EMAIL = process.env.WM_HYBRID_EMPLOYER_EMAIL || "employer@demo.jobmitra.app";
const EE_EMAIL = process.env.WM_HYBRID_EMPLOYEE_EMAIL || "employee@demo.jobmitra.app";
const PASSWORD = process.env.WM_HYBRID_PASSWORD || "demo1234";

const EMPLOYER_PATHS = [
  "/v1/jobmitra/employer/planner/plans",
  "/v1/jobmitra/employer/shift/favorites",
  "/v1/jobmitra/employer/shift/availability-pool",
];
const EMPLOYEE_PATHS = [
  "/v1/jobmitra/employee/career/saved-jobs",
  "/v1/jobmitra/employee/shift/availability?workerMlId=hybrid-5min",
  "/v1/jobmitra/health",
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outPath = path.join(root, "tests/load/hybrid-5min-api-summary.json");

function cookieHeader(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function applySetCookie(jar, res) {
  const raw =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")]
        : [];
  for (const line of raw) {
    const pair = String(line).split(";")[0];
    const eq = pair.indexOf("=");
    if (eq < 1) continue;
    jar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
}

async function hit(pathname, jar) {
  const started = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(`${BASE}${pathname}`, {
      headers: { Accept: "application/json", Cookie: cookieHeader(jar) },
      signal: controller.signal,
    });
    clearTimeout(timer);
    applySetCookie(jar, res);
    return { status: res.status, ms: performance.now() - started, path: pathname };
  } catch (err) {
    return {
      status: 0,
      ms: performance.now() - started,
      path: pathname,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function login(email) {
  const jar = {};
  await fetch(`${BASE}/v1/jobmitra/auth/csrf`).then((res) => applySetCookie(jar, res));
  const res = await fetch(`${BASE}/v1/jobmitra/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader(jar) },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  applySetCookie(jar, res);
  return { status: res.status, jar, hasSession: Boolean(jar.wm_session) };
}

function tally(rows) {
  const statuses = {};
  const http5xxByPath = {};
  let sum = 0;
  for (const row of rows) {
    statuses[row.status] = (statuses[row.status] || 0) + 1;
    sum += row.ms;
    if (row.status >= 500) {
      http5xxByPath[row.path] = (http5xxByPath[row.path] || 0) + 1;
    }
  }
  const sorted = rows.map((r) => r.ms).sort((a, b) => a - b);
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] || 0;
  return {
    count: rows.length,
    avgMs: rows.length ? sum / rows.length : 0,
    p95Ms: p95,
    http429: statuses[429] || 0,
    http5xx: Object.entries(statuses)
      .filter(([code]) => Number(code) >= 500)
      .reduce((n, [, c]) => n + c, 0),
    http5xxByPath,
    transportFail: statuses[0] || 0,
    statuses,
  };
}

async function batchedHits(count, batchSize, makeHit) {
  const out = [];
  for (let i = 0; i < count; i += batchSize) {
    const size = Math.min(batchSize, count - i);
    const chunk = Array.from({ length: size }, (_, j) => makeHit(i + j));
    out.push(...(await Promise.all(chunk)));
  }
  return out;
}

async function main() {
  const startedAt = Date.now();
  const empLogin = await login(EMP_EMAIL);
  const eeLogin = await login(EE_EMAIL);
  const all = [];

  all.push(
    ...(await batchedHits(EMPLOYER_N, 10, (i) =>
      hit(EMPLOYER_PATHS[i % EMPLOYER_PATHS.length], empLogin.jar),
    )),
  );
  all.push(
    ...(await batchedHits(EMPLOYEE_N, 20, (i) =>
      hit(EMPLOYEE_PATHS[i % EMPLOYEE_PATHS.length], eeLogin.jar),
    )),
  );

  while (Date.now() - startedAt < DURATION_MS) {
    all.push(
      ...(await batchedHits(10, 10, (i) =>
        hit(EMPLOYER_PATHS[i % EMPLOYER_PATHS.length], empLogin.jar),
      )),
    );
    all.push(
      ...(await batchedHits(20, 10, (i) =>
        hit(EMPLOYEE_PATHS[i % EMPLOYEE_PATHS.length], eeLogin.jar),
      )),
    );
    await new Promise((r) => setTimeout(r, 1500));
  }

  const employerHits = all.filter((r) => r.path.startsWith("/v1/jobmitra/employer"));
  const employeeHits = all.filter((r) => !r.path.startsWith("/v1/jobmitra/employer"));
  const summary = {
    harness: "hybrid-5min-background",
    durationMs: Date.now() - startedAt,
    base: BASE,
    logins: {
      employer: { status: empLogin.status, hasSession: empLogin.hasSession },
      employee: { status: eeLogin.status, hasSession: eeLogin.hasSession },
    },
    burst: { employerVus: EMPLOYER_N, employeeActions: EMPLOYEE_N },
    totals: tally(all),
    employer: tally(employerHits),
    employee: tally(employeeHits),
  };
  writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`[hybrid-5min-api] wrote ${outPath}`);
  console.log(JSON.stringify(summary.totals));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
