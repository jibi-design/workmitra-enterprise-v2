/**
 * Defense Layer 3 — CORS origin whitelist builder.
 * Merges WM_ALLOWED_ORIGINS + VITE_APP_URL / WM_APP_URL (solo-ops friendly).
 */

import { isProduction } from "../modules/auth/env.js";

function normalizeOrigin(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "*" || trimmed.includes("*")) return null;
  try {
    const u = new URL(trimmed);
    // Origin form: scheme://host[:port] — drop path/query
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/**
 * Build the allowed CORS origin set for the API process.
 * Production: only explicit https origins (fail-closed via assertProductionSecrets).
 * Development: defaults to Vite localhost ports when unset.
 */
export function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  const fromList = process.env.WM_ALLOWED_ORIGINS ?? "";
  for (const part of fromList.split(",")) {
    const o = normalizeOrigin(part);
    if (o) origins.add(o);
  }

  for (const envKey of ["VITE_APP_URL", "WM_APP_URL"] as const) {
    const o = normalizeOrigin(process.env[envKey] ?? "");
    if (o) origins.add(o);
  }

  if (origins.size === 0 && !isProduction()) {
    origins.add("http://localhost:5173");
    origins.add("http://localhost:4173");
  }

  // Sprint 3 — Capacitor Android WebView origin (https scheme)
  origins.add("https://localhost");

  return origins;
}

export function resolveCorsOrigin(
  requestOrigin: string | undefined,
  allowed: Set<string>,
): string | null {
  if (!requestOrigin) return null;
  if (allowed.has(requestOrigin)) return requestOrigin;
  if (isProduction()) return null;
  try {
    const u = new URL(requestOrigin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return requestOrigin;
  } catch {
    // reject malformed
  }
  return null;
}
