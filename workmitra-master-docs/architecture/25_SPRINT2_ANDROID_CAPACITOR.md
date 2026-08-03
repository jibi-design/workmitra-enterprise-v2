# Sprint 2 — Android Capacitor Generation

## Status

| Item                  | Result                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `capacitor.config.ts` | Updated — `com.mitralabs.jobmitra`, HTTPS scheme, allowNavigation                             |
| `android/`            | Already present; `npx cap sync android` OK after web build                                    |
| Cookie/session        | SameSite=None+Secure for Capacitor origins (session + CSRF)                                   |
| Network security      | `network_security_config.xml` + manifest hook (HTTPS-first; localhost cleartext for emulator) |
| Web build             | Pass with `VITE_AUTH_BACKEND_ENABLED=true`                                                    |
| Cap sync              | Pass                                                                                          |

## Sprint 1 SQL (blocked on this machine)

`.env` `DATABASE_URL` points to **localhost:5432** — connection **ECONNREFUSED** (Postgres not running locally).

SQL is ready at:

- `supabase/sql/sprint1_auth_rls_revoke.sql` (Dashboard paste)
- `server/db/migrations/013_auth_rls_revoke.sql` (migrate runner)

### To apply against live Supabase

1. Supabase Dashboard → **Project Settings → Database → Connection string** (URI)
2. Put that URI in `.env` as `DATABASE_URL` (use **Session mode** pooler or direct `db.*.supabase.co:5432`)
3. Or paste `supabase/sql/sprint1_auth_rls_revoke.sql` in **SQL Editor → Run**
4. Or: `node scripts/sprint1-apply-migrations.mjs` after DATABASE_URL points at remote

Required params (do not commit secrets):

- Host: `db.<project-ref>.supabase.co` (or pooler host)
- Port: `5432` (direct) / `6543` (pooler)
- User / password / database from Supabase
- SSL: usually required (`?sslmode=require`)

## Mobile cookie notes

- Capacitor Android origin ≈ `https://localhost`
- API must allow that origin in `WM_ALLOWED_ORIGINS` / CORS for credentialed requests
- Optional force: `WM_COOKIE_SAMESITE=None`
- Client already uses `credentials: "include"` when auth backend is on

## Commands

```bash
# Web + sync
set VITE_AUTH_BACKEND_ENABLED=true
npm run build
npx cap sync android

# Or
npm run build:mobile   # if env flag present for production build
```
