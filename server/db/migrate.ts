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
 * Note: supabase/migrations/ is a SEPARATE pipeline managed by the Supabase CLI.
 * It handles Supabase-specific schema (RLS policies, functions using auth.uid()).
 * Do NOT merge these two directories — they serve different purposes.
 */
export async function runMigrations(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await getPool().connect();
  try {
    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      await client.query(sql);
      console.log(`[Job Mitra DB] Migration applied: ${file}`);
    }
    if (files.length === 0) {
      console.log("[Job Mitra DB] No migration files found.");
    }
  } finally {
    client.release();
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  runMigrations()
    .then(() => closePool())
    .catch((err) => {
      console.error("[Job Mitra DB] Migration failed:", err);
      process.exit(1);
    });
}
