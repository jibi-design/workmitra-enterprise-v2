import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required when AUTH_USER_SOURCE=db");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    });
  }
  return pool;
}

export async function verifyDbConnection(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
