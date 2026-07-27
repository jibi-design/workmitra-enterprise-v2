/**
 * Report whether GJ-3 API bridge env keys are present (boolean only — no values).
 * Usage: node scripts/check-supabase-bridge-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return false;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
  return true;
}

const hasEnv = loadEnvFile(".env");
const hasLocal = loadEnvFile(".env.local");

function present(key) {
  const v = process.env[key]?.trim();
  return Boolean(v && !v.includes("YOUR_") && v.length > 8);
}

console.log(`ENV_FILE_DOTENV=${hasEnv}`);
console.log(`ENV_FILE_LOCAL=${hasLocal}`);

// FE (browser)
console.log(`FE_VITE_SUPABASE_URL=${present("VITE_SUPABASE_URL")}`);
console.log(`FE_VITE_SUPABASE_ANON_KEY=${present("VITE_SUPABASE_ANON_KEY")}`);
console.log(`FE_VITE_AUTH_BACKEND=${process.env.VITE_AUTH_BACKEND_ENABLED === "true"}`);

// API bridge (server-only)
console.log(`API_SUPABASE_URL=${present("SUPABASE_URL")}`);
console.log(`API_SUPABASE_ANON_KEY=${present("SUPABASE_ANON_KEY")}`);
console.log(`API_SUPABASE_SERVICE_ROLE_KEY=${present("SUPABASE_SERVICE_ROLE_KEY")}`);

const feOk = present("VITE_SUPABASE_URL") && present("VITE_SUPABASE_ANON_KEY");
const apiOk =
  present("SUPABASE_URL") &&
  present("SUPABASE_ANON_KEY") &&
  present("SUPABASE_SERVICE_ROLE_KEY");

console.log(`FE_SHIFT_OPS_CLIENT=${feOk ? "READY" : "MISSING"}`);
console.log(`API_AUTH_BRIDGE=${apiOk ? "READY" : "MISSING"}`);
console.log(
  `LIVE_JOIN_READY=${feOk && apiOk && process.env.VITE_AUTH_BACKEND_ENABLED === "true" ? "YES" : "NO"}`,
);
