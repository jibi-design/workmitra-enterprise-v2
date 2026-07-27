/**
 * Shift load runner — prefers k6; falls back to Node 500-VU fan-out harness.
 *
 * Env:
 *   K6_VUS_MAX (default 500 for node fallback, 50 for k6 script default)
 *   K6_CHAOS=1
 *   WM_API_BASE (default http://localhost:3001)
 *   WM_FORCE_NODE_LOAD=1 — skip k6 even if installed
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const k6Script = path.join(root, "tests/load/k6-shift-chaos.js");
const nodeHarness = path.join(root, "tests/load/node-shift-chaos-fanout.mjs");

function hasK6() {
  if (process.env.WM_FORCE_NODE_LOAD === "1") return false;
  const probe = spawnSync("k6", ["version"], { encoding: "utf8", shell: true });
  return probe.status === 0;
}

function runK6() {
  const vus = process.env.K6_VUS_MAX || "500";
  const env = {
    ...process.env,
    K6_VUS_MAX: vus,
    K6_CHAOS: process.env.K6_CHAOS || "1",
  };
  console.log(`[load] k6 detected — running ${k6Script} with K6_VUS_MAX=${vus}`);
  const result = spawnSync("k6", ["run", k6Script], {
    cwd: root,
    env,
    stdio: "inherit",
    shell: true,
  });
  process.exit(result.status ?? 1);
}

function runNodeFallback() {
  if (!existsSync(nodeHarness)) {
    console.error(`[load] Missing Node harness: ${nodeHarness}`);
    process.exit(1);
  }
  const vus = process.env.K6_VUS_MAX || "500";
  console.log(
    `[load] k6 not available — falling back to Node fan-out harness (${vus} concurrent clients)`,
  );
  const result = spawnSync(process.execPath, [nodeHarness], {
    cwd: root,
    env: {
      ...process.env,
      K6_VUS_MAX: vus,
      K6_CHAOS: process.env.K6_CHAOS || "1",
      WM_API_BASE: process.env.WM_API_BASE || "http://localhost:3001",
    },
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

if (hasK6()) {
  runK6();
} else {
  runNodeFallback();
}
