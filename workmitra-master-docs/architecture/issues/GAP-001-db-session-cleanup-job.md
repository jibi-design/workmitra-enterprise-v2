<!-- App name: WorkMitra / Job Mitra
File name: GAP-001-db-session-cleanup-job.md
-->

# GAP-001 — DB Session Cleanup Cron

**Status:** OPEN — **PLANNING** — staging/dev retention **LOCKED** (implementation not approved)  
**Phase:** 2.1 Production Readiness — Operational Hardening  
**Priority:** P1 (blocking operational readiness, not auth contract change)  
**Opened:** 2026-07-06  
**Planning started:** 2026-07-07  
**Retention locked (staging/dev):** 2026-07-07  
**Staging dry-run evidence:** **PASS / CLEARED** (2026-07-07) — see [`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](../evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md)

---

## Objective

Schedule a safe, idempotent job that purges **expired and long-revoked** `auth_sessions` rows from PostgreSQL so production does not accumulate dead session records indefinitely.

**Must not change Phase 2 Auth behavior** — login, logout, cookie contract, session validation on read remain unchanged.

---

## Scope

| In scope                                                              | Out of scope                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------- |
| Scheduled purge of eligible `auth_sessions` rows per retention policy | Changing login/session cookie contract               |
| Dry-run mode before any delete                                        | Domain APIs (Shift, Career, Work Vault, Admin, etc.) |
| Ops runbook entry                                                     | Auth persistence rewrite                             |
| Job logging: row counts only — no tokens, no PII                      | Deleting **active** sessions                         |
| Render cron / Supabase scheduled function / approved manual SQL       | Employer/Employee domain mixing                      |

---

## Non-goals

- Do not modify `auth.routes.ts`, session cookie logic, or Phase 2 auth contract.
- Do not delete sessions that are still valid (`expires_at > now()` AND `idle_expires_at > now()` AND `revoked_at IS NULL`).
- Do not implement in this planning phase — **no cron job code yet**.
- Do not mix Shift Jobs / Career Jobs or Employer / Employee domains.

---

## Affected tables / entities (inspect before implementation)

| Table               | Columns to respect                                                                                 | Migration reference        |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| `auth_sessions`     | `id`, `user_id`, `session_token_hash`, `expires_at`, `idle_expires_at`, `revoked_at`, `created_at` | `001_auth_persistence.sql` |
| `auth_audit_events` | `session_id` FK — `ON DELETE SET NULL` (audit rows preserved if session deleted)                   | `001_auth_persistence.sql` |

**Related read path (unchanged):** expired sessions are already **rejected on read** in auth service — cleanup is operational hygiene only.

---

## Retention policy — LOCKED (staging/dev only)

> **Policy scope:** This is a **staging/dev retention policy only**.  
> This is **not** the final production retention policy.  
> **Production retention must be reviewed again before production launch.**  
> Planning/docs are locked; **implementation is still not approved.**

| Rule            | Locked value (staging/dev)                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Table           | `auth_sessions`                                                                                         |
| Eligible rows   | **Expired or revoked sessions only**                                                                    |
| Grace period    | Delete only **30 days after** expiry or revocation                                                      |
| Active sessions | **Must never be deleted** (`expires_at > now()` AND `idle_expires_at > now()` AND `revoked_at IS NULL`) |

| Condition               | Eligible for purge (staging/dev)                                     |
| ----------------------- | -------------------------------------------------------------------- |
| Expired by `expires_at` | `expires_at < now() - interval '30 days'`                            |
| Expired by idle timeout | `idle_expires_at < now() - interval '30 days'`                       |
| Revoked                 | `revoked_at IS NOT NULL AND revoked_at < now() - interval '30 days'` |
| Active session          | **Never delete**                                                     |

**Destructive rules (mandatory):**

- Dry-run mode is **mandatory** before any `DELETE`.
- No destructive `DELETE` or `UPDATE` may run before dry-run evidence is reviewed and **operator-approved**.
- No active sessions may be deleted.
- Cleanup is **operational only** — no Job Mitra product/domain logic (Shift, Career, Employer, Employee, Work Vault, Admin).

**Gate status:**

| Gate                             | Status                          |
| -------------------------------- | ------------------------------- |
| Phase 2 Auth Persistence         | **LOCKED / PASS**               |
| Phase 2.1                        | **IN PROGRESS**                 |
| Production deployment            | **NOT APPROVED**                |
| GAP-001 implementation           | **Not approved**                |
| GAP-001 staging dry-run evidence | **PASS / CLEARED** (2026-07-07) |

---

## Staging dry-run evidence (2026-07-07)

**Collector:** `scripts/gap-001-002-dry-run.mjs` — **SELECT-only**; `destructive_action: false`.

| Field                                       | Recorded value |
| ------------------------------------------- | -------------- |
| `target_env`                                | `staging`      |
| `eligible_expired_or_revoked_session_count` | `0`            |
| `active_session_eligible_count`             | `0`            |
| `active_sessions_excluded`                  | `true`         |
| `oldest_eligible_date`                      | `null`         |
| `newest_eligible_date`                      | `null`         |

All counts were zero. No active sessions were eligible for purge. No destructive action was executed.

Full record: [`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](../evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md)

---

## Dry-run requirement (mandatory)

**All cleanup jobs must support non-destructive dry-run mode before any delete/update execution.**

| Mode            | Behavior                                                                        |
| --------------- | ------------------------------------------------------------------------------- |
| `DRY_RUN=true`  | `SELECT COUNT(*)` / list eligible row count only — **no DELETE**                |
| `DRY_RUN=false` | Execute `DELETE` only after dry-run evidence reviewed and **operator-approved** |

Dry-run output must log: `eligible_row_count`, `oldest_eligible_created_at` (date only), `job_run_id` — no session tokens, no `session_token_hash`, no user emails.

---

## Safety checks (before live delete)

1. Confirm job targets only rows matching retention SQL — never `WHERE 1=1` without predicates.
2. Confirm no row has `expires_at > now()` AND `idle_expires_at > now()` AND `revoked_at IS NULL`.
3. Run dry-run on **staging DB** first; compare count to manual `SELECT COUNT(*)` with same predicates.
4. Run during low-traffic window for first production execution.
5. Job must be **idempotent** — safe to re-run if interrupted.

---

## Rollback strategy

| Scenario           | Action                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Wrong rows deleted | Restore from Supabase backup (requires §8.1 backup enabled — not available on Free plan today) |
| Job runaway        | Disable cron; no further deletes until root cause reviewed                                     |
| Partial run        | Re-run idempotent job — only remaining eligible rows affected                                  |

> **Note:** Without scheduled backups (§8.1 NOT CLEARED), rollback depends on manual export or plan upgrade. Do not run destructive cleanup on production until backup strategy exists.

---

## Audit / logging evidence required

Job logs must include:

- `job_name`, `run_at`, `dry_run` flag, `rows_deleted` (or `rows_would_delete` in dry-run)
- No `session_token_hash`, no cookies, no `DATABASE_URL`, no passwords

Optional: insert a row into `auth_audit_events` with `event_type = 'session_cleanup_job'` (new type — requires separate implementation gate if added).

---

## Verification evidence required for clearance

| #   | Evidence                                                        |
| --- | --------------------------------------------------------------- |
| 1   | Dry-run output on staging — eligible count documented           | **PASS / CLEARED** (2026-07-07) — count `0`; active leak check `0` |
| 2   | Live run on staging — count matches dry-run                     |
| 3   | Active session smoke still passes: login → `/me` → logout → 401 |
| 4   | No active session rows in deleted set (SQL proof query)         |
| 5   | Runbook entry in ops docs                                       |
| 6   | Cron schedule documented (Render / Supabase / manual)           |

---

## Risks if implemented incorrectly

| Risk                                      | Impact                                      |
| ----------------------------------------- | ------------------------------------------- |
| Delete active sessions                    | Users logged out unexpectedly; trust damage |
| Delete too aggressively (short retention) | Audit trail gaps for session-linked events  |
| No dry-run                                | Irreversible mistake without backup         |
| No backup (§8.1)                          | Cannot restore if wrong rows deleted        |
| Logging tokens/PII                        | Security incident                           |

---

## Phase 2 lock confirmation

- **Phase 2 Auth Persistence:** **LOCKED / PASS** — this gap does **not** change accepted auth implementation.
- **Phase 2.1:** **IN PROGRESS** — not PASS.
- **Production deployment:** **NOT APPROVED**.
- **Active sessions must not be deleted.**
- **Implementation is not approved yet** — planning/docs locked; no cron until implementation gate opens.

---

## Problem (original)

Phase 2 auth persistence stores sessions in `auth_sessions` with `expires_at`, `idle_expires_at`, and `revoked_at`.

- Expired sessions are **rejected on read** (correct).
- In-memory demo mode has a periodic GC sweep (`session.store.ts`).
- **No scheduled job** purges expired/revoked `auth_sessions` rows from PostgreSQL.

Long-running production will accumulate dead session rows → table bloat, slower indexes.

---

## Suggested SQL (future implementation gate only — not executed now)

> Suggested reference only. **No SQL has been executed.** Dry-run `SELECT COUNT(*)` with these predicates required before any live delete.

```sql
-- DRY_RUN: SELECT COUNT(*) FROM auth_sessions WHERE ...
-- Eligible: expired or revoked, and 30+ days past expiry/revocation. Active sessions excluded.
DELETE FROM auth_sessions
WHERE (expires_at < now() - interval '30 days')
   OR (idle_expires_at < now() - interval '30 days')
   OR (revoked_at IS NOT NULL AND revoked_at < now() - interval '30 days');
```

---

## Related

- Checklist: `23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md` §6.5, §7, [Future Automation Guards for GAP-001/GAP-002](../23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md#job-mitra--future-automation-guards-for-gap-001gap-002)
- Overlaps: GAP-002 (`auth_sessions` retention also listed there)
- Operator decision: Supabase Pro deferred — see checklist § Operator Decision
