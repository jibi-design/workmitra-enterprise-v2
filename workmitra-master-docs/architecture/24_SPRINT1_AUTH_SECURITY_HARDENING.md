# Sprint 1 — Auth & Security Hardening

Status: **implemented in repo** (operator must apply SQL + set env).

## 1. Database RLS (`public.auth_*`)

**Migration:** `server/db/migrations/013_auth_rls_revoke.sql`  
**Supabase paste:** `supabase/sql/sprint1_auth_rls_revoke.sql`

Enables + FORCEs RLS, RESTRICTIVE deny policies for `anon`/`authenticated`, REVOKE ALL from PUBLIC/anon/authenticated, GRANT to `service_role` when present.

```bash
# via migrate runner (if DATABASE_URL set)
npm run db:migrate
# or paste sprint1_auth_rls_revoke.sql in Supabase SQL editor
```

## 2. Auth binding

| Env                         | Non-demo / production                                            |
| --------------------------- | ---------------------------------------------------------------- |
| `AUTH_USER_SOURCE`          | **`db`** (default now; memory only if `WM_ALLOW_DEMO_AUTH=true`) |
| `VITE_AUTH_BACKEND_ENABLED` | **`true`** required in production (fail-close)                   |
| `WM_ALLOW_DEMO_AUTH`        | Forbidden in production; required for memory demo lab            |

Files: `server/modules/auth/env.ts`, `failCloseEnv.ts`, `auth.service.ts`

## 3. Client PII storage

- Device key → **IndexedDB** (removed from localStorage)
- Sealed envelopes upgrade to **AES-256-GCM** (`wmenc2:`)
- Boot: `hydratePiiSecureStorage()` in `src/main.tsx`
- Sync callers keep working via in-memory plaintext mirror

## 4. Super Admin BFF

- Password: **scrypt** + `timingSafeEqual` (no plaintext `===`)
- Prefer `MASTER_ADMIN_PASSWORD_HASH=scrypt$saltHex$hashHex`
- Login rate limit: 5 failures / 15 min per IP → 429
- Host allowlist: localhost / 127.0.0.1 / `admin.mitraaccesshub.com` only

Generate hash:

```bash
cd "C:\projects\Admin\Super Admin"
node -e "import('./bff/authSecurity.mjs').then(m => console.log(m.hashPasswordForEnv(process.argv[1]||'mitra-owner-demo')))" your-password
```
