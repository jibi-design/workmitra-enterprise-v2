/**
 * Provision WM_LOAD_TEST_* from env files and run authenticated live store stress.
 * Never prints password values.
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
    return new URL(v.includes("://") ? v : `https://${v}`).origin;
  } catch {
    return "";
  }
}

// Credential provisioning (prefer explicit load-test keys, else Play reviewer seed keys)
if (!process.env.WM_LOAD_TEST_EMAIL?.trim()) {
  process.env.WM_LOAD_TEST_EMAIL =
    process.env.SEED_PLAY_REVIEWER_EMAIL?.trim() || "google.reviewer@workmitra.com";
}
if (!process.env.WM_LOAD_TEST_PASSWORD?.trim()) {
  const fromSeed = process.env.SEED_PLAY_REVIEWER_PASSWORD?.trim();
  if (fromSeed) process.env.WM_LOAD_TEST_PASSWORD = fromSeed;
}

process.env.WM_API_BASE =
  originOf(process.env.WM_API_BASE) ||
  originOf(process.env.VITE_API_URL) ||
  originOf(process.env.WM_APP_URL) ||
  "https://mitraaccesshub.com";
process.env.K6_VUS_MAX = process.env.K6_VUS_MAX || "1000";
process.env.K6_CHAOS = "0";
process.env.WM_REQUIRE_AUTH = "1";
process.env.WM_FORCE_NODE_LOAD = "1";
process.env.WM_SESSION_POOL = process.env.WM_SESSION_POOL || "3";

const email = process.env.WM_LOAD_TEST_EMAIL || "";
const hasPass = Boolean(process.env.WM_LOAD_TEST_PASSWORD?.trim());
console.log(`[auth-preflight] WM_API_BASE=${process.env.WM_API_BASE}`);
console.log(
  `[auth-preflight] email=${email.replace(/(^.).*(@.*)$/, "$1***$2")} password=${hasPass ? "SET" : "MISSING"}`,
);
console.log(
  `[auth-preflight] VUs=${process.env.K6_VUS_MAX} sessionPool=${process.env.WM_SESSION_POOL} chaos=0`,
);

if (!hasPass) {
  console.error(
    "[auth-preflight] Missing WM_LOAD_TEST_PASSWORD (or SEED_PLAY_REVIEWER_PASSWORD). Aborting.",
  );
  process.exit(2);
}

const health = await fetch(`${process.env.WM_API_BASE}/v1/jobmitra/health`, {
  signal: AbortSignal.timeout(12_000),
}).catch(() => null);
if (!health || health.status >= 500 || health.status === 0) {
  console.error(`[auth-preflight] health failed status=${health?.status ?? 0}`);
  process.exit(1);
}
console.log(`[auth-preflight] health status=${health.status}`);

const harness = resolve(root, "tests/load/node-store-submission-stress.mjs");
const result = spawnSync(process.execPath, [harness], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
