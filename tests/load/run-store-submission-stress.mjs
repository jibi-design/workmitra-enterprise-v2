/**
 * Store-submission live stress runner — prefers k6, falls back to Node wave harness.
 *
 * Required: WM_API_BASE (live Cloudflare/API origin)
 * Optional: K6_VUS_MAX=1000, WM_LOAD_TEST_EMAIL, WM_LOAD_TEST_PASSWORD
 * Always forces K6_CHAOS=0 for certification.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const k6Script = path.join(root, "tests/load/k6-store-submission-stress.js");
const nodeHarness = path.join(root, "tests/load/node-store-submission-stress.mjs");

function hasK6() {
  if (process.env.WM_FORCE_NODE_LOAD === "1") return false;
  const probe = spawnSync("k6", ["version"], { encoding: "utf8", shell: true });
  return probe.status === 0;
}

const base = (process.env.WM_API_BASE || "").trim();
if (!base) {
  console.error("[store-stress] Set WM_API_BASE to the live API origin before running.");
  process.exit(2);
}

const env = {
  ...process.env,
  WM_API_BASE: base.replace(/\/$/, ""),
  K6_VUS_MAX: process.env.K6_VUS_MAX || "1000",
  K6_CHAOS: "0",
};

if (hasK6()) {
  console.log(`[store-stress] k6 → ${k6Script} VUs=${env.K6_VUS_MAX} base=${env.WM_API_BASE}`);
  const result = spawnSync("k6", ["run", k6Script], {
    cwd: root,
    env,
    stdio: "inherit",
    shell: true,
  });
  process.exit(result.status ?? 1);
}

if (!existsSync(nodeHarness)) {
  console.error(`[store-stress] Missing ${nodeHarness}`);
  process.exit(1);
}
console.log(
  `[store-stress] k6 missing — Node wave harness VUs=${env.K6_VUS_MAX} base=${env.WM_API_BASE}`,
);
const result = spawnSync(process.execPath, [nodeHarness], {
  cwd: root,
  env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
