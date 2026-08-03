/**
 * Defense Layer 6 — production build env fail-close (Vite).
 * Runs before vite build when NODE_ENV=production (or --mode production).
 * Never prints secret values.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function fail(message) {
  console.error(`[FATAL:build-env] ${message}`);
  process.exit(1);
}

const root = process.cwd();
loadDotEnvFile(resolve(root, ".env"));
loadDotEnvFile(resolve(root, ".env.production"));
loadDotEnvFile(resolve(root, ".env.local"));

const mode = process.env.NODE_ENV ?? "production";
const isProdBuild = mode === "production";

if (isProdBuild) {
  const authFlag =
    process.env.VITE_AUTH_BACKEND_ENABLED?.trim() ??
    process.env.WM_REQUIRE_VITE_AUTH?.trim();
  if (authFlag !== "true") {
    fail(
      "VITE_AUTH_BACKEND_ENABLED=true is required for production builds " +
        "(set in .env.production or the environment).",
    );
  }

  const origins =
    process.env.WM_ALLOWED_ORIGINS?.trim() ||
    process.env.VITE_APP_URL?.trim() ||
    process.env.WM_APP_URL?.trim();
  if (!origins) {
    console.warn(
      "[WARN:build-env] No WM_ALLOWED_ORIGINS / VITE_APP_URL set — API CORS will fail-close at runtime.",
    );
  }

  const pepper =
    process.env.WM_SESSION_HASH_PEPPER?.trim() || process.env.JWT_SECRET?.trim();
  if (!pepper) {
    console.warn(
      "[WARN:build-env] Session pepper unset in build env — API boot will fail-close if NODE_ENV=production.",
    );
  } else if (pepper.length < 32) {
    console.warn(
      "[WARN:build-env] Session pepper is shorter than 32 chars — API boot will refuse production start.",
    );
  }
}

console.log("[build-env] Production build environment checks passed.");
