# Group Join GJ-4 — Verification pass (2026-07-26)

> Companion: `GROUP_JOIN_GJ4_SMOKE.md`

## 1. SQL smoke (`shift_ops_gj4_smoke.sql`)

| Path                                                      | Result                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Local `DATABASE_URL` via `node scripts/run-gj4-smoke.mjs` | **BLOCKED** — `shift_ops` missing on local Docker (expected; GJ-1 lives on remote)                                                          |
| Remote `jobmitra-enterprise-v2-dev`                       | **Prior GJ-1 verify PASS** tables=2, fns=6 (founder screenshot). Full GJ-4 flag spot-check: **operator re-run recommended** (see SQL below) |

Remote objects were confirmed present at GJ-1 apply. GJ-4 adds only read-only flag checks on `join_site_via_group_link` body.

**Operator (1 min):** SQL Editor → paste `supabase/smoke/shift_ops_gj4_smoke.sql` → Run → confirm tables=2, fns=6, three `mentions_*=true`.

## 2. SUPABASE_* / live join readiness

Checked via `node scripts/check-supabase-bridge-env.mjs` (booleans only — no secrets printed):

| Check                                             | Status          |
| ------------------------------------------------- | --------------- |
| FE `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | **READY**       |
| FE `VITE_AUTH_BACKEND_ENABLED=true`               | **false** (off) |
| API `SUPABASE_URL`                                | **MISSING**     |
| API `SUPABASE_ANON_KEY`                           | **MISSING**     |
| API `SUPABASE_SERVICE_ROLE_KEY`                   | **MISSING**     |
| **LIVE_JOIN_READY**                               | **NO**          |

### To make live join READY (operator — do not paste secrets in chat)

Add to API env (`.env` used by `npm run dev:api`), never Vite:

- `SUPABASE_URL` = same project URL as FE
- `SUPABASE_ANON_KEY` = anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role (server only)

And for FE:

- `VITE_AUTH_BACKEND_ENABLED=true`
- Run API + app (`dev:api` + `dev:auth` or equivalent)

Then re-run: `node scripts/check-supabase-bridge-env.mjs` → expect `API_AUTH_BRIDGE=READY`, `LIVE_JOIN_READY=YES`.

## Verdict

- **Schema/objects:** PASS on remote (GJ-1 evidence); local smoke N/A.
- **Live join bridge:** **NOT configured yet** — FE client OK, API bridge + auth backend still missing.
- **Product code track GJ-0…GJ-4:** complete; ops env is the remaining gate for live join.
