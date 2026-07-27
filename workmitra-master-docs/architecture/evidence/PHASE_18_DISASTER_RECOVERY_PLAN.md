# Phase 18 — Disaster Recovery Plan (WorkMitra Enterprise v2)

## Scope

PostgreSQL is the system of record when `AUTH_USER_SOURCE=db`. Browser localStorage is a cache when `VITE_AUTH_BACKEND_ENABLED=true`.

## Backups

1. Prefer managed PostgreSQL with **automated daily backups + PITR** (Supabase Pro, Cloud SQL, or equivalent).
2. Staging on Supabase Free historically has `backup_enabled=no` — **not production-ready** until backup/PITR is enabled.
3. Evidence / operator notes:
   - `workmitra-master-docs/architecture/evidence/PHASE_2_1_8_1_SUPABASE_BACKUP_PITR_OPERATOR.md`
   - `workmitra-master-docs/architecture/evidence/PHASE_2_1_8_1_RECORD.md`

## Recovery

1. Restore DB from latest backup / PITR target time.
2. Re-run forward migrations if restore is pre-migration (`npm run db:migrate`).
3. Clients: logout → clear domain LS (or hard refresh) → re-login → hydrate from GET APIs (Career/Shift/HR/Workforce/Employment/Notifications/Vault).

## Migration rollback

- Pipeline is **forward-only** (`server/db/migrate.ts`, files `000`–`010`).
- There are no down migrations. Roll forward with a new migration, or restore DB from backup taken before the bad migrate.

## LS recovery (auth on)

1. Logout clears auth session cookie + auth store keys.
2. Domain LS may remain until cleared; hydrate services treat DB as authoritative for UUID rows.
3. Operator can wipe `wm_*` keys in DevTools if cache is corrupt; user re-syncs from API.

## RTO / RPO targets (recommended)

- RPO: ≤ 24h (daily backup) or ≤ minutes (PITR)
- RTO: ≤ 4h (restore + migrate + smoke)

## Sign-off gate

Production launch requires backup/PITR **CLEARED** on the target managed DB.
