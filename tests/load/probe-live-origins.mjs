/** Probe candidate live health endpoints; print origins only. */
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnvFile(name) {
  const full = resolve(root, name);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

for (const f of [".env", ".env.local", ".env.production", "server/.env"]) loadEnvFile(f);

function originOf(raw) {
  const v = (raw || "").trim();
  if (!v) return "";
  try {
    return new URL(v.includes("://") ? v : `https://${v}`).origin;
  } catch {
    return "";
  }
}

for (const k of [
  "VITE_API_URL",
  "WM_API_BASE",
  "WM_APP_URL",
  "VITE_APP_URL",
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
]) {
  const o = originOf(process.env[k]);
  console.log(`${k}=${o || "UNSET"}`);
}

const urls = [
  `${originOf(process.env.WM_API_BASE) || ""}/v1/jobmitra/health`,
  `${originOf(process.env.VITE_API_URL) || ""}/v1/jobmitra/health`,
  "https://api.mitralabs.app/v1/jobmitra/health",
  "https://api.mitraaccesshub.com/v1/jobmitra/health",
  "https://mitraaccesshub.com/v1/jobmitra/health",
  "https://job.mitraaccesshub.com/v1/jobmitra/health",
  "https://mitra-access-hub.jibin-dev-apps.workers.dev/v1/jobmitra/health",
  "https://mitra-access-hub.jibin-dev-apps.workers.dev/",
  "http://127.0.0.1:3001/v1/jobmitra/health",
].filter((u) => !u.startsWith("/"));

const seen = new Set();
for (const url of urls) {
  if (seen.has(url)) continue;
  seen.add(url);
  const t0 = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    console.log(`PROBE status=${res.status} ms=${Date.now() - t0} ${url}`);
  } catch (err) {
    console.log(
      `PROBE status=0 ms=${Date.now() - t0} err=${err instanceof Error ? err.message : String(err)} ${url}`,
    );
  }
}
