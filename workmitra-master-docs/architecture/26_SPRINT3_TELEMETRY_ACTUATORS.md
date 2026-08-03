# Sprint 3 — Real telemetry & remote actuators

## Goal

Bond Super Admin Visual Cockpit to live Job Mitra health + honor remote
maintenance / lockdown / kill switches. Dual-write privileged audit into
Postgres `platform_ops.admin_audit`.

## SQL (apply on live Supabase)

1. Paste / run `supabase/sql/sprint1_auth_rls_revoke.sql` (auth_* RLS + REVOKE).
2. Paste / run `supabase/sql/sprint3_platform_ops.sql` OR rely on migrate
   `014_platform_ops_runtime.sql` when Job Mitra API starts with `DATABASE_URL`.

Verify RLS (as service role / SQL editor):

```sql
SELECT relname, relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND relname LIKE 'auth_%';

SELECT to_regclass('platform_ops.admin_audit'),
       to_regclass('platform_ops.runtime_flags');
```

## Job Mitra env

```
DATABASE_URL=postgresql://...          # live Supabase URI (not localhost)
AUTH_USER_SOURCE=db
WM_OPS_CONTROL_TOKEN=<16+ char secret> # shared with Super Admin BFF
WM_ALLOWED_ORIGINS=https://app.example.com,https://localhost
```

`https://localhost` is always added by `corsOrigins.ts` for Capacitor WebView.

## Super Admin BFF env

```
JOB_MITRA_API_BASE=http://localhost:3001
# or production API origin
TELEMETRY_PROBE_JOB_MITRA=http://localhost:3001/v1/jobmitra/health
WM_OPS_CONTROL_TOKEN=<same secret>
# Optional demo inject: TELEMETRY_ALLOW_SYNTHETIC=true
```

## Endpoints

| Path                               | Role                              |
| ---------------------------------- | --------------------------------- |
| GET `/v1/jobmitra/health`          | latency + DB ping + ops snapshot  |
| GET `/v1/jobmitra/ops/flags`       | public poll for app gate          |
| PATCH `/v1/jobmitra/ops/flags`     | Bearer ops token — actuators      |
| POST `/v1/jobmitra/ops/audit`      | Bearer ops token — Postgres audit |
| GET `/v1/master-admin/telemetry`   | BFF cockpit (probes JM health)    |
| PATCH `/v1/master-admin/actuators` | BFF → JM flags                    |

## Client honor path

- `RuntimeOpsMaintenanceGate` blocks UI on maintenance/lockdown.
- `LaunchModuleBoundary runtimeKill` gates Shift / Career / Planner routes.

## Apply helper

```
node scripts/sprint1-apply-migrations.mjs
```

Requires live `DATABASE_URL` in `.env` / `.env.local`.
