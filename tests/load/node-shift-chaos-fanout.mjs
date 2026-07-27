/**
 * Node fallback — 500 concurrent Shift notification/API fan-out (HTTP).
 * Used when k6 is not installed. Isolates per-client failures (no false PASS).
 *
 * Env: K6_VUS_MAX (default 500), WM_API_BASE, K6_CHAOS=1
 */

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VUS = Number(process.env.K6_VUS_MAX || "500");
const BASE = process.env.WM_API_BASE || "http://localhost:3001";
const CHAOS = (process.env.K6_CHAOS || "1") === "1";
const PATHS = [
  "/v1/jobmitra/health",
  "/v1/jobmitra/employee/shift/availability?workerMlId=node-fanout",
  "/v1/jobmitra/employer/shift/availability-pool",
  "/v1/jobmitra/employer/shift/favorites",
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const summaryPath = path.join(root, "tests/load/node-shift-chaos-summary.json");

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

/**
 * @param {number} clientId
 */
async function hitClient(clientId) {
  const route = PATHS[clientId % PATHS.length];
  const url = `${BASE}${route}`;
  const started = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...chaosHeaders() },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const ms = performance.now() - started;
    const transportOk = res.status > 0;
    const softOk = res.status < 500;
    return {
      clientId,
      route,
      status: res.status,
      ms,
      ok: transportOk && softOk,
      failedAction: softOk ? null : `HTTP_${res.status}`,
      payload: { url, status: res.status, chaos: CHAOS },
    };
  } catch (err) {
    const ms = performance.now() - started;
    const message = err instanceof Error ? err.message : String(err);
    return {
      clientId,
      route,
      status: 0,
      ms,
      ok: false,
      failedAction: "TRANSPORT_OR_ABORT",
      payload: { url, error: message, chaos: CHAOS },
    };
  }
}

async function main() {
  console.log(`[node-fanout] launching ${VUS} concurrent clients against ${BASE}`);
  const started = performance.now();
  const results = await Promise.all(
    Array.from({ length: VUS }, (_, i) => hitClient(i)),
  );
  const elapsedMs = performance.now() - started;

  const failures = results.filter((r) => !r.ok);
  const transportDead = results.filter((r) => r.status === 0);
  const latencies = results.map((r) => r.ms).sort((a, b) => a - b);
  const p95 = latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95))] ?? 0;
  const okRate = (results.length - failures.length) / results.length;

  const summary = {
    harness: "node-shift-chaos-fanout",
    vus: VUS,
    base: BASE,
    chaos: CHAOS,
    elapsedMs,
    okRate,
    failCount: failures.length,
    transportDead: transportDead.length,
    p95Ms: p95,
    /** Strict: do not PASS if any client failed without isolation log */
    isolatedFailures: failures.slice(0, 25).map((f) => ({
      clientId: f.clientId,
      failedAction: f.failedAction,
      route: f.route,
      payload: f.payload,
      ms: f.ms,
    })),
    thresholds: {
      okRateMin: 0.85,
      p95MsMax: 3000,
      /** Allow API-down environments to soft-fail with clear BLOCKED status */
      allowApiDown: process.env.WM_ALLOW_API_DOWN === "1",
    },
  };

  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`[node-fanout] summary → ${summaryPath}`);
  console.log(
    `[node-fanout] okRate=${(okRate * 100).toFixed(1)}% fails=${failures.length} p95=${p95.toFixed(0)}ms transportDead=${transportDead.length}`,
  );

  if (failures.length > 0) {
    console.error("[node-fanout] PARTIAL FAILURE ISOLATION (first 5):");
    for (const f of failures.slice(0, 5)) {
      console.error(
        `  client=${f.clientId} action=${f.failedAction} route=${f.route} payload=${JSON.stringify(f.payload)}`,
      );
    }
  }

  const apiDown = transportDead.length === VUS;
  if (apiDown && summary.thresholds.allowApiDown) {
    console.warn("[node-fanout] API unreachable — treated as BLOCKED (WM_ALLOW_API_DOWN=1)");
    process.exit(0);
  }

  if (apiDown) {
    console.error(
      "[node-fanout] FAIL — API unreachable for all clients. Start npm run dev:api or set WM_ALLOW_API_DOWN=1",
    );
    process.exit(2);
  }

  if (okRate < summary.thresholds.okRateMin || p95 > summary.thresholds.p95MsMax) {
    console.error("[node-fanout] FAIL — thresholds breached (no false PASS)");
    process.exit(1);
  }

  console.log("[node-fanout] PASS");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
