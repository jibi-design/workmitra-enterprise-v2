/**
 * Resolve WM_API_BASE from env files (no secret printing) and run store-submission stress.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnvFile(name) {
  const full = resolve(root, name);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

for (const f of [".env", ".env.local", ".env.production", ".env.production.local", "server/.env"]) {
  loadEnvFile(f);
}

function originOf(raw) {
  const v = (raw || "").trim();
  if (!v) return "";
  try {
    return new URL(v).origin;
  } catch {
    return "";
  }
}

const candidates = [
  process.env.WM_API_BASE,
  process.env.VITE_API_URL,
  process.env.WM_APP_URL,
  process.env.VITE_APP_URL,
  "https://mitraaccesshub.com",
  "https://mitra-access-hub.jibin-dev-apps.workers.dev",
  "https://api.mitralabs.app",
  "https://api.mitraaccesshub.com",
].map(originOf).filter(Boolean);

console.log("[preflight] candidate origins:");
for (const c of [...new Set(candidates)]) console.log(`  - ${c}`);

async function probe(base) {
  const url = `${base}/v1/jobmitra/health`;
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    return { base, status: res.status, ms: Date.now() - started, ok: res.status > 0 && res.status < 500 };
  } catch (err) {
    return {
      base,
      status: 0,
      ms: Date.now() - started,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

const unique = [...new Set(candidates)];
let chosen = "";
for (const base of unique) {
  const r = await probe(base);
  console.log(`[preflight] health ${base} → status=${r.status} ms=${r.ms}${r.error ? ` err=${r.error}` : ""}`);
  if (r.ok) {
    chosen = base;
    break;
  }
}

if (!chosen) {
  console.error("[preflight] No live health endpoint responded OK — aborting 1k stress.");
  process.exit(1);
}

if (!process.env.WM_LOAD_TEST_EMAIL && process.env.PLAY_REVIEWER_EMAIL) {
  process.env.WM_LOAD_TEST_EMAIL = process.env.PLAY_REVIEWER_EMAIL;
}
if (!process.env.WM_LOAD_TEST_PASSWORD && process.env.PLAY_REVIEWER_PASSWORD) {
  process.env.WM_LOAD_TEST_PASSWORD = process.env.PLAY_REVIEWER_PASSWORD;
}

process.env.WM_API_BASE = chosen;
process.env.K6_VUS_MAX = process.env.K6_VUS_MAX || "1000";
process.env.K6_CHAOS = "0";
process.env.WM_FORCE_NODE_LOAD = process.env.WM_FORCE_NODE_LOAD || "1";

console.log(`[preflight] selected WM_API_BASE=${chosen}`);
console.log(`[preflight] VUs=${process.env.K6_VUS_MAX} chaos=0 auth=${Boolean(process.env.WM_LOAD_TEST_EMAIL && process.env.WM_LOAD_TEST_PASSWORD)}`);

const runner = resolve(root, "tests/load/run-store-submission-stress.mjs");
const result = spawnSync(process.execPath, [runner], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
