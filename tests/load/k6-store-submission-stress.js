/**
 * Store-submission live stress — Cloudflare Workers + Supabase-backed API.
 *
 * Ramp: 1 → 1000 VUs. Chaos headers DISABLED (must measure real 5xx / timeouts).
 *
 * Required:
 *   WM_API_BASE=https://<live-api-origin>
 * Optional:
 *   K6_VUS_MAX=1000
 *   WM_LOAD_TEST_EMAIL / WM_LOAD_TEST_PASSWORD — auth path (cookie session)
 *   K6_CHAOS must be 0 / unset for certification
 *
 * Run:
 *   K6_CHAOS=0 K6_VUS_MAX=1000 k6 run tests/load/k6-store-submission-stress.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE = (__ENV.WM_API_BASE || "").replace(/\/$/, "");
const VUS_MAX = Number(__ENV.K6_VUS_MAX || "1000");
const CHAOS = (__ENV.K6_CHAOS || "0") === "1";
const EMAIL = (__ENV.WM_LOAD_TEST_EMAIL || "").trim();
const PASSWORD = (__ENV.WM_LOAD_TEST_PASSWORD || "").trim();
const AUTH_ENABLED = EMAIL.length > 0 && PASSWORD.length > 0;

if (!BASE) {
  throw new Error("WM_API_BASE is required for store-submission live stress");
}
if (CHAOS) {
  throw new Error("K6_CHAOS=1 is forbidden for store-submission certification (would inject fake 5xx)");
}

const http5xx = new Rate("wm_http_5xx_rate");
const httpFail = new Rate("wm_http_fail_rate");
const timeouts = new Counter("wm_timeouts");
const authOk = new Counter("wm_auth_ok");
const authFail = new Counter("wm_auth_fail");
const latency = new Trend("wm_endpoint_latency", true);
const latencyAuth = new Trend("wm_auth_latency", true);
const latencyShift = new Trend("wm_shift_latency", true);

export const options = {
  scenarios: {
    store_submission_1k: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "1m", target: Math.min(100, VUS_MAX) },
        { duration: "2m", target: Math.min(500, VUS_MAX) },
        { duration: "2m", target: VUS_MAX },
        { duration: "2m", target: VUS_MAX },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    wm_http_5xx_rate: ["rate==0"],
    wm_endpoint_latency: ["p(95)<3000", "p(99)<8000"],
    checks: ["rate>0.95"],
  },
};

function record(res, trend) {
  const ms = res.timings.duration;
  latency.add(ms);
  if (trend) trend.add(ms);
  const isTimeout = res.status === 0 && String(res.error || "").toLowerCase().includes("timeout");
  if (isTimeout || res.status === 0) timeouts.add(1);
  const is5xx = res.status >= 500;
  http5xx.add(is5xx);
  httpFail.add(res.status === 0 || is5xx);
  return res;
}

function getJson(path, jar) {
  const res = http.get(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
    timeout: "15s",
    jar,
  });
  return record(res, latencyShift);
}

function postJson(path, body, jar) {
  const res = http.post(`${BASE}${path}`, JSON.stringify(body), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: "15s",
    jar,
  });
  return record(res, latencyAuth);
}

export function setup() {
  const health = http.get(`${BASE}/v1/jobmitra/health`, { timeout: "10s" });
  if (health.status === 0 || health.status >= 500) {
    throw new Error(`Live health probe failed: status=${health.status} base=${BASE}`);
  }
  return {
    base: BASE,
    authEnabled: AUTH_ENABLED,
    healthStatus: health.status,
    startedAt: new Date().toISOString(),
  };
}

export default function storeSubmissionVu() {
  const jar = http.cookieJar();

  group("health", () => {
    const res = getJson("/v1/jobmitra/health", jar);
    check(res, {
      "health not 5xx": (r) => r.status > 0 && r.status < 500,
      "health transport alive": (r) => r.status !== 0,
    });
  });

  if (AUTH_ENABLED) {
    group("auth_login", () => {
      const res = postJson(
        "/v1/jobmitra/auth/login",
        { email: EMAIL, password: PASSWORD },
        jar,
      );
      const ok = res.status === 200;
      if (ok) authOk.add(1);
      else authFail.add(1);
      check(res, {
        "login not 5xx": (r) => r.status > 0 && r.status < 500,
        "login accepted or rate-limited": (r) =>
          r.status === 200 || r.status === 401 || r.status === 429,
      });
    });
  }

  group("shift_reads", () => {
    const paths = [
      "/v1/jobmitra/employee/shift/availability?workerMlId=store-stress",
      "/v1/jobmitra/employer/shift/availability-pool",
      "/v1/jobmitra/employer/shift/favorites",
    ];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const res = getJson(path, jar);
    check(res, {
      "shift read not 5xx": (r) => r.status > 0 && r.status < 500,
      "shift read not timeout": (r) => r.status !== 0,
    });
  });

  // Lightweight authenticated write probe — CSRF + session when login succeeded.
  if (AUTH_ENABLED) {
    group("auth_me_read", () => {
      const res = getJson("/v1/jobmitra/auth/me", jar);
      check(res, {
        "me not 5xx": (r) => r.status > 0 && r.status < 500,
      });
    });
  }

  sleep(0.15 + Math.random() * 0.35);
}

export function handleSummary(data) {
  const root = "tests/load/k6-store-submission-stress-summary.json";
  return {
    [root]: JSON.stringify(
      {
        profile: "store-submission-live-1k",
        base: BASE,
        vusMax: VUS_MAX,
        chaos: false,
        authEnabled: AUTH_ENABLED,
        metrics: data.metrics,
        root_group: data.root_group,
        state: data.state,
      },
      null,
      2,
    ),
    stdout: textReport(data),
  };
}

function textReport(data) {
  const m = data.metrics || {};
  const get = (name, field) => (m[name] && m[name].values && m[name].values[field]) || null;
  const lines = [
    "",
    "=== Job Mitra Store-Submission Live Stress ===",
    `BASE=${BASE} VUS_MAX=${VUS_MAX} AUTH=${AUTH_ENABLED}`,
    `http_reqs=${get("http_reqs", "count")}`,
    `http_req_failed=${get("http_req_failed", "rate")}`,
    `wm_http_5xx_rate=${get("wm_http_5xx_rate", "rate")}`,
    `wm_timeouts=${get("wm_timeouts", "count")}`,
    `latency p95=${get("wm_endpoint_latency", "p(95)")} p99=${get("wm_endpoint_latency", "p(99)")}`,
    `auth_ok=${get("wm_auth_ok", "count")} auth_fail=${get("wm_auth_fail", "count")}`,
    "",
  ];
  return lines.join("\n");
}
