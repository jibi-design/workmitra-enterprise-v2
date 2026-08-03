/**
 * Defense Layer 5 — migration integrity: idempotent DDL patterns + transactional apply.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, closePool } from "./pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

/**
 * Soft integrity scan — refuse non-idempotent CREATE TABLE / INDEX at deploy time.
 * ALTER ADD CONSTRAINT should use DO-block or DROP IF EXISTS + ADD (checked separately).
 */
export function assertMigrationIntegrity(sql: string, filename: string): void {
  const lines = sql.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("--")) continue;

    const upper = trimmed.toUpperCase();
    if (upper.startsWith("CREATE TABLE") && !upper.includes("IF NOT EXISTS")) {
      throw new Error(
        `[MigrationIntegrity] ${filename}:${i + 1} — CREATE TABLE must use IF NOT EXISTS`,
      );
    }
    if (
      (upper.startsWith("CREATE INDEX") || upper.startsWith("CREATE UNIQUE INDEX")) &&
      !upper.includes("IF NOT EXISTS")
    ) {
      throw new Error(
        `[MigrationIntegrity] ${filename}:${i + 1} — CREATE INDEX must use IF NOT EXISTS`,
      );
    }
    if (upper.startsWith("CREATE EXTENSION") && !upper.includes("IF NOT EXISTS")) {
      throw new Error(
        `[MigrationIntegrity] ${filename}:${i + 1} — CREATE EXTENSION must use IF NOT EXISTS`,
      );
    }
  }
}

/**
 * Runs all .sql migration files in server/db/migrations/ sequentially,
 * sorted by filename. Each file runs in a transaction (atomic apply).
 */
export async function runMigrations(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await getPool().connect();
  try {
    // Ensure tracker exists before scanning (000 is also in the list)
    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      assertMigrationIntegrity(sql, file);

      const already = await client
        .query<{ filename: string }>(`SELECT filename FROM schema_migrations WHERE filename = $1`, [
          file,
        ])
        .catch(() => ({ rows: [] as { filename: string }[] }));

      if (already.rows.length > 0 && file !== "000_schema_migrations.sql") {
        console.log(`[Job Mitra DB] Migration skip (already applied): ${file}`);
        continue;
      }

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)
           ON CONFLICT (filename) DO NOTHING`,
          [file],
        );
        await client.query("COMMIT");
        console.log(`[Job Mitra DB] Migration applied: ${file}`);
      } catch (err) {
        try {
          await client.query("ROLLBACK");
        } catch {
          /* ignore */
        }
        console.error(`[Job Mitra DB] Migration failed (rolled back): ${file}`);
        throw err;
      }
    }
    if (files.length === 0) {
      console.log("[Job Mitra DB] No migration files found.");
    }
  } finally {
    client.release();
  }
}

const entryPath = process.argv[1] ? process.argv[1].replace(/\\/g, "/") : "";
if (entryPath.endsWith("migrate.ts") || entryPath.endsWith("migrate.js")) {
  runMigrations()
    .then(() => closePool())
    .catch((err) => {
      console.error("[Job Mitra DB] Migration failed:", err);
      process.exit(1);
    });
}
