/**
 * Defense Layer 5 — offline migration integrity scan (no DB required).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const dir = resolve(process.cwd(), "server/db/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

function fail(message) {
  console.error(`[FATAL:migration-integrity] ${message}`);
  process.exit(1);
}

for (const file of files) {
  const sql = readFileSync(join(dir, file), "utf8");
  const lines = sql.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = (lines[i] ?? "").trim();
    if (!trimmed || trimmed.startsWith("--")) continue;
    const upper = trimmed.toUpperCase();
    if (upper.startsWith("CREATE TABLE") && !upper.includes("IF NOT EXISTS")) {
      fail(`${file}:${i + 1} CREATE TABLE must use IF NOT EXISTS`);
    }
    if (
      (upper.startsWith("CREATE INDEX") || upper.startsWith("CREATE UNIQUE INDEX")) &&
      !upper.includes("IF NOT EXISTS")
    ) {
      fail(`${file}:${i + 1} CREATE INDEX must use IF NOT EXISTS`);
    }
    if (upper.startsWith("CREATE EXTENSION") && !upper.includes("IF NOT EXISTS")) {
      fail(`${file}:${i + 1} CREATE EXTENSION must use IF NOT EXISTS`);
    }
  }
}

console.log(`[migration-integrity] OK — scanned ${files.length} file(s).`);
