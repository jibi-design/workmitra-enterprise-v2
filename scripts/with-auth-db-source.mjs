/**
 * Cross-platform runner: sets AUTH_USER_SOURCE=db then execs tsx on the given entry.
 * Usage: node scripts/with-auth-db-source.mjs server/index.ts
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = process.argv[2];

if (!entry) {
  console.error("[with-auth-db] Missing entry script path.");
  console.error("Usage: node scripts/with-auth-db-source.mjs <entry.ts>");
  process.exit(1);
}

const env = { ...process.env, AUTH_USER_SOURCE: "db" };
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npx, ["tsx", entry], {
  stdio: "inherit",
  env,
  cwd: root,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
