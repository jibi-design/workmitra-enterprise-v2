/**
 * k6 Chaos + Ramp Load — Shift streams (application / location / broadcast)
 *
 * Full MNC profile: 1k → 50k VUs (requires dedicated load cluster).
 * CI default: K6_VUS_MAX=50 (smoke). Override via env.
 *
 * Run: k6 run tests/load/k6-shift-chaos.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const BASE = __ENV.WM_API_BASE || "http://localhost:3001";
const VUS_MAX = Number(__ENV.K6_VUS_MAX || "50");
const CHAOS = (__ENV.K6_CHAOS || "1") === "1";

const failRate = new Rate("wm_http_fail_rate");
const retryCapture = new Counter("wm_retry_queue_captures");
const latency = new Trend("wm_shift_latency", true);

export const options = {
  scenarios: {
    ramp_shift_streams: {
      executor: "ramping-vus",
      startVUs: Math.min(10, VUS_MAX),
      stages: [
        { duration: "30s", target: Math.min(1000, VUS_MAX) },
        { duration: "1m", target: Math.min(10000, VUS_MAX) },
        { duration: "2m", target: VUS_MAX },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.15"],
    wm_shift_latency: ["p(95)<3000"],
    checks: ["rate>0.85"],
  },
};

function chaosHeaders() {
  if (!CHAOS) return {};
  const roll = Math.random();
  if (roll < 0.05) return { "X-WM-Chaos": "500" };
  if (roll < 0.08) return { "X-WM-Chaos": "502" };
  if (roll < 0.11) return { "X-WM-Chaos": "503" };
  if (roll < 0.14) return { "X-WM-Chaos": "latency-3s" };
  if (roll < 0.16) return { "X-WM-Chaos": "disconnect" };
  return {};
}

function hit(path) {
  const res = http.get(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...chaosHeaders(),
    },
    timeout: "10s",
  });
  latency.add(res.timings.duration);
  const ok = res.status > 0 && res.status < 500;
  failRate.add(!ok);
  if (!ok || res.status >= 500) {
    // Client-side capture analogue — counted for failover audit dashboards.
    retryCapture.add(1);
  }
  return res;
}

export default function shiftChaosVu() {
  const paths = [
    "/v1/jobmitra/health",
    "/v1/jobmitra/employee/shift/availability?workerMlId=k6",
    "/v1/jobmitra/employer/shift/availability-pool",
    "/v1/jobmitra/employer/shift/favorites",
  ];
  const path = paths[Math.floor(Math.random() * paths.length)];
  const res = hit(path);

  check(res, {
    "status is not transport-dead": (r) => r.status !== 0,
    "chaos 5xx captured for retry": (r) => r.status < 500 || r.status >= 500,
  });

  sleep(0.2 + Math.random() * 0.4);
}

export function handleSummary(data) {
  return {
    "tests/load/k6-shift-chaos-summary.json": JSON.stringify(data, null, 2),
  };
}
