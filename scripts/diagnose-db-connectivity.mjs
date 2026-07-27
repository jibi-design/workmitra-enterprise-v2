/** Diagnose DATABASE_URL reachability — prints host hint + error only (no secrets). */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv(resolve(root, ".env"));
const u = process.env.DATABASE_URL || "";
const hostHint =
  u
    .replace(/:[^:@/]+@/, "@")
    .replace(/^[^:]+:\/\//, "")
    .split("/")[0]
    .split("@")
    .pop() || "none";
console.log(`host_hint=${hostHint}`);
console.log(`has_url=${Boolean(u)}`);

const ssl = String(process.env.DATABASE_SSL || "true").toLowerCase() !== "false";
const client = new pg.Client({
  connectionString: u,
  ssl: ssl ? { rejectUnauthorized: false } : false,
});

try {
  await client.connect();
  console.log("connect=ok");
} catch (e) {
  const err = /** @type {{ name?: string; code?: string; message?: string; errors?: Error[] }} */ (
    e
  );
  console.log("connect_fail=true");
  console.log(`err_name=${err.name || "n/a"}`);
  console.log(`err_code=${err.code || "n/a"}`);
  console.log(`err_message=${String(err.message || e).slice(0, 200)}`);
  if (Array.isArray(err.errors)) {
    console.log(`aggregate_count=${err.errors.length}`);
    for (const nested of err.errors.slice(0, 3)) {
      console.log(`nested=${String(nested && nested.message).slice(0, 120)}`);
    }
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
