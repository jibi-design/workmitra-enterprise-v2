/**
 * Defense Layer 1 — security response headers (Helmet-equivalent for node:http).
 * Does not alter CORS allow logic; call after CORS origin resolution.
 */

import type { ServerResponse } from "node:http";
import { isProduction } from "../modules/auth/env.js";

/**
 * Apply essential browser / proxy security headers on every API response.
 */
export function applySecurityHeaders(res: ServerResponse): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  // API returns JSON — tight CSP; no scripts expected on API origin.
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  );

  if (isProduction()) {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Reduce fingerprinting / version leakage
  res.removeHeader("X-Powered-By");
}
