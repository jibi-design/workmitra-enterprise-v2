# Phase 2.1 — GAP-001 / GAP-002 Dry-Run Evidence (T3-2)

> **Companion:** `TRACK_3_PHASE_2_1_LIVE_NOTE.md` · prior staging record `PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`  
> **Hard rule:** No secrets / DATABASE_URL values in this file.

**Date:** 2026-07-26  
**Command:** `DRY_RUN=true DRY_RUN_TARGET_ENV=dev npm run job:gap-retention`  
**DB:** local Docker `workmitra-postgres` (started for this run)  
**Destructive action:** `false`

---

## Result — **PASS**

### GAP-001

| Field                                     | Value |
| ----------------------------------------- | ----- |
| ok                                        | true  |
| dry_run                                   | true  |
| eligible_expired_or_revoked_session_count | 0     |
| rows_would_delete                         | 0     |
| rows_deleted                              | 0     |
| active_session_eligible_count             | 0     |
| active_sessions_excluded                  | true  |

### GAP-002

| Field                                   | Value |
| --------------------------------------- | ----- |
| ok                                      | true  |
| dry_run                                 | true  |
| login_attempts_older_than_30_days_count | 0     |
| audit_events_older_than_90_days_count   | 0     |
| rows_would_delete_*                     | 0     |
| rows_deleted_*                          | 0     |

**Interpretation:** No rows eligible for purge on local `dev` DB. No DELETE executed. Active-session safety check passed.

---

## Earlier attempt (same day)

`PHASE_2_1_GAP_T3_2_DRY_RUN_ATTEMPT.md` — BLOCKED while container stopped (ECONNREFUSED). Superseded by this PASS after `docker start workmitra-postgres`.

---

## Change log

| Date       | What                                                      |
| ---------- | --------------------------------------------------------- |
| 2026-07-26 | T3-2 PASS on local Docker Postgres after container start. |
