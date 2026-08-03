/**
 * Sprint helper: load .env then run migrate.ts (does not print secrets).
 */
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile(resolve(root, ".env"));
loadEnvFile(resolve(root, ".env.local"));

const url = process.env.DATABASE_URL || "";
let host = "(unset)";
try {
  host = new URL(url.replace(/^postgres(ql)?:/i, "http:")).hostname;
} catch {
  host = "(parse_fail)";
}
console.log(`[sprint1-sql] DATABASE_URL host=${host} set=${Boolean(url)}`);

if (!url) {
  console.error("[sprint1-sql] DATABASE_URL missing — cannot apply SQL.");
  process.exit(1);
}

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["tsx", "server/db/migrate.ts"],
  {
    cwd: root,
    env: { ...process.env, AUTH_USER_SOURCE: "db" },
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

process.exit(result.status ?? 1);
