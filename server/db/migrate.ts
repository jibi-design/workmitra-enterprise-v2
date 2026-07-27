import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, closePool } from "./pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

/**
 * Runs all .sql migration files in server/db/migrations/ sequentially,
 * sorted by filename (numeric prefix ensures correct order).
 *
 * Tracks applied files in schema_migrations (created by 000_schema_migrations.sql).
 *
 * Note: supabase/migrations/ is a SEPARATE pipeline managed by the Supabase CLI.
 */
export async function runMigrations(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await getPool().connect();
  try {
    for (const file of files) {
      const already = await client
        .query<{ filename: string }>(`SELECT filename FROM schema_migrations WHERE filename = $1`, [
          file,
        ])
        .catch(() => ({ rows: [] as { filename: string }[] }));

      if (already.rows.length > 0 && file !== "000_schema_migrations.sql") {
        console.log(`[Job Mitra DB] Migration skip (already applied): ${file}`);
        continue;
      }

      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      await client.query(sql);

      if (file === "000_schema_migrations.sql") {
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)
           ON CONFLICT (filename) DO NOTHING`,
          [file],
        );
      } else {
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)
           ON CONFLICT (filename) DO NOTHING`,
          [file],
        );
      }

      console.log(`[Job Mitra DB] Migration applied: ${file}`);
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
