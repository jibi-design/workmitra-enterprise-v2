/** Job Mitra | authConfig.ts | src/shared/config/authConfig.ts */

/**
 * Phase-1 backend auth is opt-in via env so Play Store Phase-0 E2E (role pick) keeps working.
 *
 * Frontend: set VITE_AUTH_BACKEND_ENABLED=true OR run `npm run dev:auth`
 * Server:   AUTH_USER_SOURCE=db (default). Memory demo only when WM_ALLOW_DEMO_AUTH=true.
 *
 * SECURITY: When false, RequireRole trusts sessionStorage role only (UX gate — not RBAC).
 * Production builds MUST set VITE_AUTH_BACKEND_ENABLED=true — init throws if PROD && false.
 * Vite also refuses `vite build` (mode production) without the flag (see vite.config.ts).
 * Sprint 1: production API fail-close requires VITE_AUTH_BACKEND_ENABLED=true explicitly.
 *
 * P1 Trust Foundation (A1-narrow):
 * - API SoT remains HttpOnly wm_session → auth_users.id (no JWT migration).
 * - Client resolveActorStorageId / resolveActorApiId fail-closed: no employee_demo /
 *   employer_demo when AUTH on.
 * - Tenant gate: tests/e2e/tenant-isolation.spec.ts
 *   CI: TENANT_ISOLATION_REQUIRE_API=1 (fail if :3001 unreachable).
 * - Board SuperAdmin/TenantAdmin/User map: server/modules/auth/platformRoleMap.ts
 *   (docs only — DB roles stay employee|employer|admin).
 */
export const AUTH_BACKEND_ENABLED = import.meta.env.VITE_AUTH_BACKEND_ENABLED === "true";

/** Canonical prefix — doc 16 Option A */
export const AUTH_API_PREFIX = "/v1/jobmitra/auth";

if (import.meta.env.PROD && !AUTH_BACKEND_ENABLED) {
  throw new Error(
    '[WorkMitra] FATAL: VITE_AUTH_BACKEND_ENABLED must be "true" in production. ' +
      "Client roleStorage is not a security boundary — refusing to boot without backend auth RBAC.",
  );
}
