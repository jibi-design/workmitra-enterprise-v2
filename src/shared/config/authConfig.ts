/** Job Mitra | authConfig.ts | src/shared/config/authConfig.ts */

/**
 * Phase-1 backend auth is opt-in via env so Play Store Phase-0 E2E (role pick) keeps working.
 *
 * Frontend: set VITE_AUTH_BACKEND_ENABLED=true OR run `npm run dev:auth`
 * Server:   run `npm run dev:api` (demo users only when NODE_ENV !== production)
 *
 * See `.env.example` for full documentation.
 */
export const AUTH_BACKEND_ENABLED = import.meta.env.VITE_AUTH_BACKEND_ENABLED === "true";

/** Canonical prefix — doc 16 Option A */
export const AUTH_API_PREFIX = "/v1/jobmitra/auth";
