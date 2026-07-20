<!-- App name: WorkMitra / Job Mitra
File name: 23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md
-->

# Phase 2.1 — Production Readiness Checklist

> **Historical evidence preservation:** Staging examples in this document (including `staging.jobmitra.app`, `@staging.jobmitra.app` seed identities, and related URLs) are **execution evidence** from Phase 2.1 operator runs. Do not rewrite quoted values. For current canonical domain decisions, refer to [`MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](./MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md) — staging hostname remains **UNRESOLVED** in V2.

**Status:** IN PROGRESS — operator staging **16 PASS** (2026-07-07); GAP-001/002 staging dry-run **PASS / CLEARED** (2026-07-07); §8.1 NOT CLEARED (deferred); **Operational Hardening planning** — GAP-001 / GAP-002 implementation not approved  
**Prerequisite:** Phase 2 Auth Persistence — **LOCKED / PASS** (2026-07-06)  
**Inherits from:** `01_CORE_MASTER_TRUTH.md`, `15_BACKEND_LOGIN_MASTER_DOCUMENT_POSTING_SAFE.md`, `14_RELEASE_CURRENT_STATUS.md`

## Purpose

Verify that accepted Phase 2 auth persistence is safe to run in a production environment before any production deployment approval.

**Out of scope for Phase 2.1:**

- New domain APIs (Shift, Career, Work Vault, etc.)
- Product feature work
- Changes to accepted Phase 2 auth behaviour without a new issue/phase gate

---

## Lock rule (Phase 2)

Do not modify accepted auth persistence implementation without a new issue or phase gate.

Phase 2.1 may add **operational hardening** (env, secrets, cleanup jobs, runbooks) but must not change the accepted login/session contract unless a new gate is opened.

---

## Operator Decision — Supabase Pro / PITR Deferred (2026-07-07)

| Decision                 | Status                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| Supabase Pro upgrade     | **Deferred** — not upgrading now                                         |
| PITR add-on              | **Deferred** — not enabling now                                          |
| Reason                   | Dev/staging only; no real production users; avoid premature monthly cost |
| §8.1 scheduled backups   | **NOT CLEARED** — Free plan has no project backups                       |
| §8.2 PITR                | **DOCUMENTED** — plan limitation; Pro add-on                             |
| Before production launch | Supabase Pro **or** approved backup/restore strategy **required**        |
| PITR reconsider          | Only when business/data risk justifies cost                              |
| Phase 2.1                | **IN PROGRESS** — not PASS                                               |
| Production deployment    | **NOT APPROVED**                                                         |
| Auth code defect         | **None** — operational plan limitation only                              |

Evidence: [`evidence/PHASE_2_1_8_1_RECORD.md`](evidence/PHASE_2_1_8_1_RECORD.md)

---

## Next milestone — Phase 2.1 Operational Hardening (GAP-001 / GAP-002)

**Status:** PLANNING — implementation **not approved**

| Gap                                                    | Title                                  | Planning doc    | Dry-run evidence (staging)      | Implementation |
| ------------------------------------------------------ | -------------------------------------- | --------------- | ------------------------------- | -------------- |
| [GAP-001](issues/GAP-001-db-session-cleanup-job.md)    | DB Session Cleanup Cron                | OPEN — PLANNING | **PASS / CLEARED** (2026-07-07) | Not approved   |
| [GAP-002](issues/GAP-002-audit-retention-sweep-job.md) | Audit / Login Attempts Retention Sweep | OPEN — PLANNING | **PASS / CLEARED** (2026-07-07) | Not approved   |

**Dry-run evidence record:** [`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md) — SELECT-only; all counts `0`; `destructive_action: false`; no active sessions eligible.

**Dry-run rule (mandatory):** All cleanup/sweep jobs must support non-destructive `DRY_RUN` mode before any DELETE. No cron implementation until planning gate closes and operator approves implementation.

**Out of scope for this milestone:** auth code changes, domain APIs, production deploy approval, Phase 2.1 PASS.

**Future automation guards (planning only):** See [Job Mitra — Future Automation Guards for GAP-001/GAP-002](#job-mitra--future-automation-guards-for-gap-001gap-002) — implementation **NOT APPROVED**.

---

## Evidence log (2026-07-07 — operator staging rerun)

**Collector:** `node scripts/phase-2-1-operator-staging.mjs`  
**Summary:** **16 PASS / 0 FAIL / 0 BLOCKED / 1 NEEDS_OPERATOR**  
**Verdict:** NOT PASS — §8.1 Supabase backup/PITR dashboard evidence still required.  
**Auth code modified:** No.

### Operator PASS (accepted)

| ID                       | Result | Evidence                                                                        |
| ------------------------ | ------ | ------------------------------------------------------------------------------- |
| 1.6                      | PASS   | Supabase Session Pooler host confirmed                                          |
| 1.2                      | PASS   | DB-backed auth (`AUTH_USER_SOURCE=db`) smoke                                    |
| 9.5 login                | PASS   | `userPresent=true`                                                              |
| 9.5 GET /me              | PASS   | `status=200`                                                                    |
| 9.5 POST /logout         | PASS   | `status=200`                                                                    |
| 9.5 GET /me after logout | PASS   | `status=401`                                                                    |
| 3.2                      | PASS   | Cookie `HttpOnly` (live)                                                        |
| 3.3                      | PASS   | Cookie `SameSite=Lax` (live)                                                    |
| 3.4                      | PASS   | Cookie `Secure` (live)                                                          |
| 3.6                      | PASS   | Logout clears `wm_session`                                                      |
| 4.4                      | PASS   | Wrong-origin CORS blocked                                                       |
| 4.3                      | PASS   | Allowed-origin CORS echoed `http://localhost:5173` (local staging simulation)   |
| 5.1                      | PASS   | Failed-login rate limit returned `429`                                          |
| 5.3                      | PASS   | `auditRowCount=5`, `failedAttemptCount=5`, `latestEventType=login_rate_limited` |
| 2.1                      | PASS   | `WM_SESSION_HASH_PEPPER` set                                                    |
| 4.1                      | PASS   | `WM_ALLOWED_ORIGINS` set                                                        |

### NEEDS_OPERATOR (remaining — 2026-07-07)

| ID  | Gap                       | Status                            | Action required                                                                                                                                                                           |
| --- | ------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1 | Scheduled backups enabled | **NOT CLEARED — PLAN LIMITATION** | Upgrade staging/prod Supabase project to Pro (or approved alternative); re-confirm `backup_enabled=yes`; record in [`evidence/PHASE_2_1_8_1_RECORD.md`](evidence/PHASE_2_1_8_1_RECORD.md) |
| 8.2 | PITR documented           | **DOCUMENTED — PLAN LIMITATION**  | `pitr_available=no`; Pro add-on; mitigation recorded in [`PHASE_2_1_8_1_RECORD.md`](evidence/PHASE_2_1_8_1_RECORD.md)                                                                     |

**Classification:** §8.1 and §8.2 are operational plan limitations — not auth code defects. No auth code change required.  
**§8.2 is DOCUMENTED** — plan limitation and mitigation on record; no further dashboard check needed for §8.2.  
**Phase 2.1 verdict:** IN PROGRESS — **do not mark PASS** until §8.1 backup cleared on upgraded plan + all P0 signed (§9.1). **Next work:** GAP-001/GAP-002 implementation gate (cron/sweep jobs — **not approved**); dry-run evidence on staging is **PASS / CLEARED**.

---

## Evidence log (2026-07-07 — GAP-001 / GAP-002 staging dry-run)

**Collector:** `npx tsx scripts/gap-001-002-dry-run.mjs`  
**Target:** `staging` — **SELECT-only**; `destructive_action: false`  
**Verdict:** Dry-run evidence **PASS / CLEARED** for staging. Implementation **NOT APPROVED**.  
**Auth code modified:** No.

### GAP-001 dry-run (staging)

| Field                                       | Value  |
| ------------------------------------------- | ------ |
| `eligible_expired_or_revoked_session_count` | `0`    |
| `active_session_eligible_count`             | `0`    |
| `active_sessions_excluded`                  | `true` |
| `oldest_eligible_date`                      | `null` |
| `newest_eligible_date`                      | `null` |

### GAP-002 dry-run (staging)

| Field                                     | Value  |
| ----------------------------------------- | ------ |
| `login_attempts_older_than_30_days_count` | `0`    |
| `audit_events_older_than_90_days_count`   | `0`    |
| `oldest_login_attempt_date`               | `null` |
| `newest_login_attempt_date`               | `null` |
| `oldest_audit_event_date`                 | `null` |
| `newest_audit_event_date`                 | `null` |

**Note:** All counts were zero. No active sessions were eligible for purge. No destructive action was executed.

**Full record:** [`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md)

---

### Cleared by operator rerun (2026-07-07)

| Item                         | Gap         | Notes                                                 |
| ---------------------------- | ----------- | ----------------------------------------------------- |
| Allowed-origin CORS evidence | **GAP-003** | **CLEARED** — no server CORS patch required           |
| Audit/login rows evidence    | **GAP-004** | **CLEARED** — `gap-004-audit-query.mjs` path verified |

### Pre-production deploy (not blocking Phase 2.1 PASS alone)

| Item                         | Notes                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Real staging frontend origin | Repeat CORS + cookie smoke with deployed staging `WM_ALLOWED_ORIGINS` (not localhost simulation) before production deploy approval |

---

## Evidence log (2026-07-06 — automated + code review)

**Verdict so far:** NOT PASS — operator evidence and live staging tests still required.  
**Auth code modified:** No — evidence collection only.

### Automated / code-review PASS

| ID               | Result       | Evidence                                                                                                         |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| 1.3              | PASS         | `assertSafeAuthEnvironment` exits when `NODE_ENV=production` + `AUTH_USER_SOURCE=memory`                         |
| 1.4              | PASS         | Exits when `WM_ALLOW_DEMO_AUTH=true` in production                                                               |
| 1.5              | PASS (code)  | `seed.ts` defaults to `@staging.jobmitra.app`; passwords from env only                                           |
| 2.1              | PASS (guard) | Exits when `WM_SESSION_HASH_PEPPER` missing in production                                                        |
| 2.2              | PASS         | `.env` and `.env.*` in `.gitignore`                                                                              |
| 2.4              | PASS         | No `VITE_*SECRET/PEPPER/DATABASE/PASSWORD` in `src/`                                                             |
| 3.1–3.3, 3.5–3.6 | PASS         | `auth.routes.ts` + migration: `wm_session`, `HttpOnly`, `SameSite=Lax`, `session_token_hash`, logout `Max-Age=0` |
| 4.2, 4.6         | PASS         | `server/index.ts`: whitelist CORS, `Vary: Origin`, no `*` wildcard                                               |
| 5.2              | PASS (code)  | Unknown user + bad password → same `"Invalid email or password"` message                                         |
| 9.2              | PASS         | `npm run check:types` — exit 0                                                                                   |
| 9.3              | PASS         | `npm run check:lint` — exit 0                                                                                    |
| 9.4              | PASS         | `npm run build` — exit 0                                                                                         |
| 9.6              | PASS         | API routes remain auth-only (`/v1/jobmitra/auth/*`)                                                              |

**Collector:** `node scripts/phase-2-1-evidence.mjs` → 14 PASS, 0 FAIL, 7 NEEDS_OPERATOR (this run).

### NEEDS_OPERATOR (blocking P0 sign-off)

| ID           | Gap                                            | Action required                                                                                          |
| ------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1.1          | Separate dev/staging/prod Supabase project IDs | Document in secret manager (not git)                                                                     |
| 1.2          | Staging/prod `AUTH_USER_SOURCE=db`             | Deploy env screenshot                                                                                    |
| 1.7          | Per-env `VITE_API_URL`                         | Staging/prod config table                                                                                |
| 2.5          | Unique peppers per environment                 | Secret manager comparison                                                                                |
| 3.4          | `Secure` cookie on HTTPS                       | Staging HTTPS login test                                                                                 |
| 3.7          | `document.cookie` cannot read session          | Browser devtools (P1)                                                                                    |
| 4.1, 4.3–4.5 | Live CORS preflight tests                      | Staging API + curl/browser                                                                               |
| 5.1, 5.3     | Live rate-limit + audit row                    | 6 failed logins on staging DB                                                                            |
| 6.1–6.4      | Live session TTL + logout DB row               | Repeat Phase 2 smoke on staging                                                                          |
| 6.5          | DB session purge job                           | **Dry-run PASS / CLEARED** (staging, 2026-07-07); **implementation gap:** no cron/job in repo            |
| 7.1, 7.3     | Audit events in DB after login                 | Staging DB query                                                                                         |
| 7.5          | Retention sweep job                            | **Dry-run PASS / CLEARED** (staging, 2026-07-07); **implementation gap:** no scheduled purge job in repo |
| 8.1–8.3      | Backup + restore drill                         | Supabase dashboard + operator sign-off                                                                   |
| 8.4          | Migrate idempotency                            | Re-run `npm run db:migrate` on staging with `DATABASE_URL` set                                           |
| 9.5          | Staging auth smoke test                        | login → `/me` → logout → 401                                                                             |
| 9.10         | Sign-off                                       | Architect + operator                                                                                     |

### Runtime note (this evidence run)

`DATABASE_URL` was **not set** in the validation environment — live API/CORS/rate-limit tests skipped. Phase 2 acceptance evidence (operator machine with Supabase Session Pooler) remains the baseline for 9.5 until repeated on staging.

### Open gaps (2026-07-07)

| Gap                                                          | Severity    | Status                   | Notes                                                                                  |
| ------------------------------------------------------------ | ----------- | ------------------------ | -------------------------------------------------------------------------------------- |
| [GAP-001](issues/GAP-001-db-session-cleanup-job.md)          | P1          | OPEN — **PLANNING**      | Staging dry-run **PASS / CLEARED** (2026-07-07); cron implementation **not approved**  |
| [GAP-002](issues/GAP-002-audit-retention-sweep-job.md)       | P1          | OPEN — **PLANNING**      | Staging dry-run **PASS / CLEARED** (2026-07-07); sweep implementation **not approved** |
| [GAP-003](issues/GAP-003-cors-allowed-origin-evidence.md)    | P0 evidence | **CLEARED** (2026-07-07) | Operator rerun §4.3 PASS — no server patch                                             |
| [GAP-004](issues/GAP-004-audit-evidence-query-subprocess.md) | P0 evidence | **CLEARED** (2026-07-07) | Operator rerun §5.3 PASS                                                               |

### Open gaps (no auth code change until issue opened)

| Gap                                                                 | Severity | Recommendation                                                                     |
| ------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| No DB session cleanup cron                                          | P1       | **GAP-001** — scheduled job to purge expired/revoked `auth_sessions`               |
| No audit/login_attempts retention job                               | P1       | **GAP-002** — daily retention sweep per locked periods                             |
| `db:migrate` CLI may not log on Windows when entry guard mismatches | P1       | Verify on staging with `DATABASE_URL`; open issue only if migration does not apply |

---

## Exit criteria

Phase 2.1 is **PASS** only when every **P0** item is checked and evidence is recorded.  
Production deployment still requires a separate deploy gate after Phase 2.1 PASS.

---

## 1. Environment separation

| #   | Check                                                                                                                 | Priority | Evidence required                       |
| --- | --------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- |
| 1.1 | Separate Supabase projects: **dev**, **staging**, **production**                                                      | P0       | Project IDs documented (not in git)     |
| 1.2 | `AUTH_USER_SOURCE=db` in staging and production                                                                       | P0       | Env var screenshot / deploy config      |
| 1.3 | `AUTH_USER_SOURCE=memory` forbidden in production (`assertSafeAuthEnvironment` exits)                                 | P0       | Startup test with `NODE_ENV=production` |
| 1.4 | `WM_ALLOW_DEMO_AUTH` not `true` in production                                                                         | P0       | Env audit                               |
| 1.5 | Staging seed accounts (`employee@staging.jobmitra.app`, `employer@staging.jobmitra.app`) not present in production DB | P0       | SQL query or seed script review         |
| 1.6 | `DATABASE_URL` uses Session Pooler in serverless/deploy targets                                                       | P1       | Connection string class documented      |
| 1.7 | Frontend `VITE_*` / API base URL points to correct environment                                                        | P0       | Per-env config table                    |

**Env matrix (fill before deploy):**

| Variable                 | Dev             | Staging        | Production              |
| ------------------------ | --------------- | -------------- | ----------------------- |
| `NODE_ENV`               | development     | production     | production              |
| `AUTH_USER_SOURCE`       | db              | db             | db                      |
| `DATABASE_URL`           | dev pooler      | staging pooler | prod pooler             |
| `WM_SESSION_HASH_PEPPER` | dev pepper      | staging pepper | **unique prod pepper**  |
| `WM_ALLOWED_ORIGINS`     | localhost       | staging origin | production origin(s)    |
| `WM_ALLOW_DEMO_AUTH`     | false (when db) | false          | **must be unset/false** |

---

## 2. Production secrets

| #   | Check                                                                           | Priority | Evidence required               |
| --- | ------------------------------------------------------------------------------- | -------- | ------------------------------- |
| 2.1 | `WM_SESSION_HASH_PEPPER` set in production — random, ≥32 bytes, never committed | P0       | Secret manager reference        |
| 2.2 | `DATABASE_URL` stored in secret manager only — not in repo, not in client       | P0       | `.env` in `.gitignore` verified |
| 2.3 | Pepper rotation procedure documented (invalidates all sessions)                 | P1       | Runbook section                 |
| 2.4 | No secrets in frontend bundle (`VITE_` audit)                                   | P0       | Build output grep               |
| 2.5 | Staging and production use **different** peppers and DB credentials             | P0       | Secret manager comparison       |

**Secret storage:** Bitwarden / 1Password / host secret manager — not Notepad, not committed `.env`.

---

## 3. Cookie security

| #   | Check                                                            | Priority | Evidence required          |
| --- | ---------------------------------------------------------------- | -------- | -------------------------- |
| 3.1 | Session cookie name: `wm_session`                                | P0       | Code reference locked      |
| 3.2 | `HttpOnly` flag set on session cookie                            | P0       | Response header capture    |
| 3.3 | `SameSite=Lax` on session cookie                                 | P0       | Response header capture    |
| 3.4 | `Secure` flag enabled when `NODE_ENV=production`                 | P0       | HTTPS staging test         |
| 3.5 | Raw session token never stored in DB — only `session_token_hash` | P0       | Schema + code review       |
| 3.6 | Logout clears cookie (`Max-Age=0` or equivalent)                 | P0       | Repeat Phase 2 logout test |
| 3.7 | Cookie not accessible from JavaScript (`document.cookie` test)   | P1       | Browser devtools check     |

**Production requirement:** API must be served over HTTPS for `Secure` cookies to work end-to-end.

---

## 4. CORS policy

| #   | Check                                                             | Priority | Evidence required               |
| --- | ----------------------------------------------------------------- | -------- | ------------------------------- |
| 4.1 | `WM_ALLOWED_ORIGINS` whitelist set in staging/production          | P0       | Env config                      |
| 4.2 | No wildcard `*` origin with credentials                           | P0       | Code review (`server/index.ts`) |
| 4.3 | `Access-Control-Allow-Credentials: true` only for allowed origins | P0       | Preflight test                  |
| 4.4 | Disallowed origin receives no `Access-Control-Allow-Origin`       | P0       | curl test from wrong origin     |
| 4.5 | Production does not allow arbitrary localhost origins             | P0       | `NODE_ENV=production` CORS test |
| 4.6 | `Vary: Origin` header present                                     | P1       | Response header capture         |

**Staging example:**

```txt
WM_ALLOWED_ORIGINS=https://staging.jobmitra.app
```

---

## 5. Rate-limit validation

| #   | Check                                                               | Priority | Evidence required        |
| --- | ------------------------------------------------------------------- | -------- | ------------------------ |
| 5.1 | Login rate limit: default 5 attempts / 15 min / email+IP            | P0       | Staging brute-force test |
| 5.2 | Rate-limited login returns safe error (no user enumeration)         | P0       | Response body review     |
| 5.3 | `login_rate_limited` audit event written                            | P0       | DB query after test      |
| 5.4 | Account lock threshold tested (default 10 failures / 60 min window) | P1       | Staging test account     |
| 5.5 | Locked account cannot login until `locked_until` expires            | P1       | Staging test             |
| 5.6 | Rate limit env vars documented (`WM_LOGIN_RATE_LIMIT_MAX`, etc.)    | P1       | Env matrix               |

---

## 6. Session cleanup strategy

| #   | Check                                                                          | Priority | Evidence required              |
| --- | ------------------------------------------------------------------------------ | -------- | ------------------------------ |
| 6.1 | Absolute session TTL enforced (default 7 days — `WM_SESSION_ABSOLUTE_TTL_SEC`) | P0       | Expired session → 401 on `/me` |
| 6.2 | Idle session TTL enforced (default 24 h — `WM_SESSION_IDLE_TTL_SEC`)           | P0       | Idle test or TTL override test |
| 6.3 | Logout sets `revoked_at` on session row                                        | P0       | DB row check after logout      |
| 6.4 | Expired sessions rejected on `/me`                                             | P0       | Manual or scripted test        |
| 6.5 | Background job or cron to purge/archive expired `auth_sessions` rows           | P1       | Job documented + run once      |
| 6.6 | `revokeAllSessionsForUser` path exists for password reset / account lock       | P1       | Code + test plan               |
| 6.7 | Orphan session growth monitored (count query alert threshold)                  | P2       | Ops alert rule                 |

**Note:** Phase 2 validates expiry on read. Phase 2.1 should add explicit DB cleanup policy for long-running production.

---

## 7. Audit retention

| #   | Check                                                                                                                                      | Priority | Evidence required            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------- |
| 7.1 | `auth_audit_events` table receiving: `login_success`, `login_failed`, `login_rate_limited`, `session_created`, `session_expired`, `logout` | P0       | Staging login flow DB query  |
| 7.2 | Audit metadata contains no raw passwords or session tokens                                                                                 | P0       | Sample row review            |
| 7.3 | IP stored as hash only (`ip_hash`) — not raw IP in audit                                                                                   | P0       | Schema + sample row          |
| 7.4 | Retention period locked (recommend: **90 days** auth audit, **30 days** login_attempts)                                                    | P1       | Documented in this checklist |
| 7.5 | Retention sweep job or Supabase scheduled task documented                                                                                  | P1       | Runbook                      |
| 7.6 | `auth_login_attempts` old rows purged per retention policy                                                                                 | P1       | Job run evidence             |

**Locked retention (Phase 2.1):**

| Table                             | Retention            | Action                 |
| --------------------------------- | -------------------- | ---------------------- |
| `auth_audit_events`               | 90 days              | Archive or hard delete |
| `auth_login_attempts`             | 30 days              | Hard delete            |
| `auth_sessions` (revoked/expired) | 30 days after expiry | Hard delete            |

---

## 8. Supabase backup / restore readiness

**§8.1 operator gate (2026-07-07):** Dashboard evidence recorded. Free plan confirmed — no scheduled backups. Operational plan limitation, not an auth code defect. See [`evidence/PHASE_2_1_8_1_RECORD.md`](evidence/PHASE_2_1_8_1_RECORD.md).

| #   | Check                                                                           | Priority | Evidence required                                                                                              | Status                                                                                                                    |
| --- | ------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 8.1 | Scheduled backups enabled on staging/production Supabase project                | P0       | Dashboard screenshot (ops drive only, not git) + [`PHASE_2_1_8_1_RECORD.md`](evidence/PHASE_2_1_8_1_RECORD.md) | **NOT CLEARED — PLAN LIMITATION** (Free plan; upgrade required)                                                           |
| 8.2 | Point-in-time recovery (PITR) understood and documented                         | P1       | [`PHASE_2_1_8_1_RECORD.md`](evidence/PHASE_2_1_8_1_RECORD.md)                                                  | **DOCUMENTED — PLAN LIMITATION** (`pitr_available=no`; Pro add-on at $100/month; mitigation recorded; not an auth defect) |
| 8.3 | Staging restore drill performed from backup                                     | P1       | Date + operator sign-off                                                                                       | —                                                                                                                         |
| 8.4 | `npm run db:migrate` idempotent on clean and existing DB                        | P0       | Re-run migrate on staging                                                                                      | —                                                                                                                         |
| 8.5 | Migration rollback policy documented (forward-only vs down scripts)             | P1       | `04-migration-policy` or runbook                                                                               | —                                                                                                                         |
| 8.6 | Session Pooler URL used for API; direct connection reserved for migrations only | P1       | Connection docs                                                                                                | —                                                                                                                         |

---

## 9. Deployment gate checklist

| #    | Check                                                                          | Priority | Evidence required             |
| ---- | ------------------------------------------------------------------------------ | -------- | ----------------------------- |
| 9.1  | All Phase 2.1 P0 items PASS                                                    | P0       | This document signed          |
| 9.2  | `npm run lint` — PASS                                                          | P0       | CI output                     |
| 9.3  | `npm run typecheck` — PASS                                                     | P0       | CI output                     |
| 9.4  | `npm run build` — PASS                                                         | P0       | CI output                     |
| 9.5  | Phase 2 auth smoke test repeated on **staging** (login → `/me` → logout → 401) | P0       | Test log                      |
| 9.6  | No domain APIs deployed in this release                                        | P0       | Route inventory               |
| 9.7  | Health endpoint or startup log confirms db auth mode                           | P1       | Deploy log                    |
| 9.8  | Error tracking configured (Sentry or equivalent) for API                       | P1       | Project DSN in secret manager |
| 9.9  | Rollback plan: previous API image + DB forward-only acknowledged               | P1       | Runbook                       |
| 9.10 | Architect + operator sign-off recorded in `14_RELEASE_CURRENT_STATUS.md`       | P0       | Sign-off table                |

---

## 10. Staging verification script (repeat before sign-off)

```txt
1. npm run db:migrate          → no error
2. npm run db:seed             → staging accounts only (if staging)
3. npm run dev:db              → API on :3001, DB verified
4. POST /v1/jobmitra/auth/login (employee@staging.jobmitra.app) → data.user
5. GET  /v1/jobmitra/auth/me   → data.user (cookie sent)
6. POST /v1/jobmitra/auth/logout → ok=true
7. GET  /v1/jobmitra/auth/me   → 401
8. CORS preflight from staging origin → allowed
9. CORS from unknown origin → blocked
10. 6th failed login → rate limited + audit event
```

---

## Job Mitra — Future Automation Guards for GAP-001/GAP-002

**Status:** PLANNING ONLY — automation implementation **NOT APPROVED**  
**Purpose:** Define read-only guard automations to protect GAP-001/GAP-002 cleanup and retention work **before** any implementation gate opens.  
**Prerequisite context:** Staging dry-run evidence is **PASS / CLEARED** ([`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md)). GAP-001/GAP-002 **implementation is NOT APPROVED**. No cron, scheduler, `DELETE`, or `UPDATE` is approved by default.

| Gate                            | Status                     |
| ------------------------------- | -------------------------- |
| Phase 2 Auth Persistence        | **LOCKED / PASS**          |
| Phase 2.1                       | **IN PROGRESS** — not PASS |
| Production deployment           | **NOT APPROVED**           |
| GAP-001/GAP-002 implementation  | **NOT APPROVED**           |
| Automation guard implementation | **NOT APPROVED**           |
| DELETE / UPDATE by default      | **NOT APPROVED**           |

**Planning conclusion:** These five read-only automation guards are **recommended before** GAP-001/GAP-002 implementation work begins. They do **not** replace operator/architect approval gates. No guard script exists in the repo yet.

**Domain separation:** Guards apply only to Job Mitra operational/evidence scripts (`scripts/`, auth backend evidence paths). They must **not** mix Employer Shift Jobs and Employee Career Jobs, and must **not** combine Shift and Career job state in one guard or report.

---

### 1. Forbidden SQL Operation Scanner

| Attribute                    | Detail                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**                | Detect unsafe SQL operations in operator/evidence scripts before merge or implementation work.                                                                                                                                                                                                                                            |
| **Scope**                    | Read-only static scan of `scripts/*.mjs`, `scripts/*.js`, and future GAP cleanup job files when added. Token scan for: `DELETE`, `UPDATE`, `INSERT`, `UPSERT`, `TRUNCATE`, `ALTER`, `DROP`, `CREATE INDEX`, `CREATE TABLE`, and migration execution (`db:migrate`, `runMigrations`, `migrations/*.sql` invocation from evidence scripts). |
| **Non-goals**                | Does not scan application runtime routes; does not validate SQL semantics; does not approve or run cleanup jobs; does not touch Shift/Career domain code.                                                                                                                                                                                 |
| **Safety rules**             | File read only; regex/AST token match; allowlist comments/doc blocks if needed; exit non-zero on match in executable code paths.                                                                                                                                                                                                          |
| **When it should run**       | Pre-commit (optional), CI (when CI exists), and **mandatory** before GAP-001/GAP-002 implementation PR review.                                                                                                                                                                                                                            |
| **What it must never do**    | Execute scripts; connect to DB; run SQL; print connection strings; auto-fix files.                                                                                                                                                                                                                                                        |
| **Approval needed**          | Architect/operator approval before creating the scanner script and wiring to hooks/CI.                                                                                                                                                                                                                                                    |
| **Expected report format**   | JSON or plain text: `{ "guard": "forbidden-sql", "ok": true                                                                                                                                                                                                                                                                               | false, "findings": [{ "file": "scripts/...", "line": N, "token": "DELETE" }] }` — no secret values. |
| **Rollback/safety behavior** | Read-only — no side effects. On failure, block merge/review only; no DB or auth impact.                                                                                                                                                                                                                                                   |

---

### 2. Import-Safety Scanner

| Attribute                    | Detail                                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objective**                | Detect unsafe top-level DB pool imports in DB-touching evidence scripts.                                                                                                                                                                                           |
| **Scope**                    | Static scan for top-level `import ... from "../server/db/pool"` (or equivalent) in `scripts/gap-*.mjs`, `scripts/phase-2-1-*.mjs`, and future evidence collectors. Require dynamic `await import("../server/db/pool.ts")` **after** documented fail-closed guards. |
| **Non-goals**                | Does not change import style automatically; does not scan locked Phase 2 Auth runtime modules except as read-only path list for diff guard; does not run scripts.                                                                                                  |
| **Safety rules**             | Parse module top-level imports only; flag static pool import before guard block; reference pattern: `scripts/gap-001-002-dry-run.mjs` (dynamic import after guards).                                                                                               |
| **When it should run**       | Before merging new/changed evidence scripts; before GAP implementation gate; alongside Forbidden SQL scanner.                                                                                                                                                      |
| **What it must never do**    | Load `pool.ts`; connect to DB; execute guarded scripts; print `DATABASE_URL`.                                                                                                                                                                                      |
| **Approval needed**          | Architect/operator approval before implementation.                                                                                                                                                                                                                 |
| **Expected report format**   | `{ "guard": "import-safety", "ok": true                                                                                                                                                                                                                            | false, "findings": [{ "file": "...", "line": N, "issue": "static_pool_import_before_guards" }] }` |
| **Rollback/safety behavior** | Read-only. Failure is advisory/blocking at review only.                                                                                                                                                                                                            |

---

### 3. Redaction Leak Scanner

| Attribute                    | Detail                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Objective**                | Detect accidental secret or sensitive output in evidence files and script stdout samples committed to docs.                                                                                                                                                                                                                                                                                      |
| **Scope**                    | Scan `scripts/phase-2-1-evidence-output.txt`, `workmitra-master-docs/architecture/evidence/*.md`, and optional captured dry-run JSON artifacts. Patterns: `postgres://`, `DATABASE_URL=`, password assignments, `session_token`, `session_token_hash`, `ip_hash`, email-like strings in evidence, raw `metadata` payloads, API keys, service role keys, cookie values, `WM_SESSION_HASH_PEPPER`. |
| **Non-goals**                | Does not scan `.env` (must remain gitignored); does not print matched secret — **finding type and file/line only**; does not modify files.                                                                                                                                                                                                                                                       |
| **Safety rules**             | Redacted finding output only: `{ "type": "postgres_url", "file": "...", "line": N }`; never echo matched substring.                                                                                                                                                                                                                                                                              |
| **When it should run**       | After operator evidence capture; before committing evidence docs; before Phase 2.1 sign-off review.                                                                                                                                                                                                                                                                                              |
| **What it must never do**    | Print secret values; read or store `.env`; connect to DB; send findings to external services without approval.                                                                                                                                                                                                                                                                                   |
| **Approval needed**          | Architect/operator approval before implementation.                                                                                                                                                                                                                                                                                                                                               |
| **Expected report format**   | `{ "guard": "redaction-leak", "ok": true                                                                                                                                                                                                                                                                                                                                                         | false, "findings": [{ "type": "database_url", "file": "...", "line": N }] }` |
| **Rollback/safety behavior** | Read-only. Operator removes/redacts offending content manually — scanner does not auto-edit.                                                                                                                                                                                                                                                                                                     |

---

### 4. Dry-Run Output Schema Validator

| Attribute                    | Detail                                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**                | Validate GAP-001/GAP-002 dry-run JSON output shape and safety flags without DB access.                                                                                              |
| **Scope**                    | Parse JSON lines from `scripts/gap-001-002-dry-run.mjs` stdout or saved redacted artifact. Confirm: `ok=true`, `dry_run=true`, `destructive_action=false`, `target_env` in `staging | dev`, counts are numbers, GAP-001 `active_session_eligible_count=0`, no forbidden sensitive field names (`session_token_hash`, `ip_hash`, `metadata`, `email`, `DATABASE_URL`). |
| **Non-goals**                | Does not re-run dry-run; does not connect to DB; does not approve implementation; does not compare counts to live DB.                                                               |
| **Safety rules**             | Schema validation only; input from file or stdin pipe; reject unknown sensitive keys.                                                                                               |
| **When it should run**       | Immediately after operator-approved dry-run capture; before recording evidence in docs; before any implementation gate review.                                                      |
| **What it must never do**    | Connect to database; execute SQL; run the dry-run script automatically without operator approval.                                                                                   |
| **Approval needed**          | Architect/operator approval before implementation.                                                                                                                                  |
| **Expected report format**   | `{ "guard": "dry-run-schema", "ok": true                                                                                                                                            | false, "gap": "GAP-001"                                                                                                                                                         | "GAP-002", "violations": ["destructive_action_not_false"] }` |
| **Rollback/safety behavior** | Read-only. Invalid schema → block evidence doc update until re-run/review.                                                                                                          |

---

### 5. Phase 2 Auth Diff Guard

| Attribute                    | Detail                                                                                                                                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**                | Detect accidental Phase 2 Auth file changes during GAP-001/GAP-002 work.                                                                                                                                                                                                            |
| **Scope**                    | Git diff / changed-file path check against locked paths, e.g. `server/modules/auth/**`, `server/db/migrations/001_auth_persistence.sql`, `server/modules/auth/auth.routes.ts`, `auth.service.db.ts`, `session.store.ts`, cookie/CORS blocks in `server/index.ts` when auth-related. |
| **Non-goals**                | Does not modify files; does not auto-revert; does not block unrelated Job Mitra frontend work outside auth paths; does not mix Shift/Career domain paths into auth guard scope.                                                                                                     |
| **Safety rules**             | Fail if auth path changed and commit/PR lacks approved issue reference in message or linked doc gate; read-only `git diff --name-only` against base branch.                                                                                                                         |
| **When it should run**       | On PR open; pre-merge; during GAP-001/GAP-002 implementation phase (when approved).                                                                                                                                                                                                 |
| **What it must never do**    | Modify auth code; amend commits; bypass phase gate; run tests that connect to DB.                                                                                                                                                                                                   |
| **Approval needed**          | Architect/operator approval before implementation; path list must be signed off.                                                                                                                                                                                                    |
| **Expected report format**   | `{ "guard": "phase2-auth-diff", "ok": true                                                                                                                                                                                                                                          | false, "changed_auth_files": ["server/modules/auth/..."], "gate_required": true }` |
| **Rollback/safety behavior** | Read-only. Failure blocks merge until new issue/phase gate documented — no automatic rollback of git state.                                                                                                                                                                         |

---

### Automation guard implementation gate (not approved)

| Step | Requirement                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------ |
| 1    | Architect/operator approves guard automation planning (this section).                            |
| 2    | Implement read-only scripts one guard at a time — **no DB connection**.                          |
| 3    | Wire to CI/hooks only after each guard is reviewed.                                              |
| 4    | GAP-001/GAP-002 **implementation gate** remains separate — guards do not imply cleanup approval. |
| 5    | Live `DELETE`/`UPDATE` requires dry-run evidence + separate operator approval.                   |

**Related:** Prior automation inventory (2026-07-07) noted missing guards — this section is the approved planning record. GAP docs: [GAP-001](issues/GAP-001-db-session-cleanup-job.md), [GAP-002](issues/GAP-002-audit-retention-sweep-job.md).

---

## Sign-off

| Role      | Name | Date | Phase 2.1 verdict |
| --------- | ---- | ---- | ----------------- |
| Architect |      |      |                   |
| Operator  |      |      |                   |

**Verdict options:** PASS / FAIL / PASS WITH CONDITIONS

---

## Related documents

- `14_RELEASE_CURRENT_STATUS.md` — phase acceptance log
- `15_BACKEND_LOGIN_MASTER_DOCUMENT_POSTING_SAFE.md` — auth architecture truth
- `19_ROLE_SESSION_ROUTE_GUARD_WORKFLOW.md` — session/route guards
- `20_LOCAL_PERSISTENCE_VERIFICATION_MATRIX.md` — local vs DB verification
