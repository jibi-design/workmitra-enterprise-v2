<!-- App name: WorkMitra / Job Mitra
File name: GAP-002-audit-retention-sweep-job.md
-->

# GAP-002 — Audit / Login Attempts Retention Sweep

**Status:** OPEN — **PLANNING** — staging/dev retention **LOCKED** (implementation not approved)  
**Phase:** 2.1 Production Readiness — Operational Hardening  
**Priority:** P1 (blocking operational readiness, not auth contract change)  
**Opened:** 2026-07-06  
**Planning started:** 2026-07-07  
**Retention locked (staging/dev):** 2026-07-07  
**Staging dry-run evidence:** **PASS / CLEARED** (2026-07-07) — see [`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](../evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md)

---

## Objective

Schedule a safe, idempotent retention sweep that removes **old** `auth_audit_events` and `auth_login_attempts` rows per locked Phase 2.1 retention periods — without destroying security evidence needed for recent investigations.

**Must not change Phase 2 Auth behavior** — login, rate limit, audit write paths remain unchanged.

---

## Scope

| In scope                                                                     | Out of scope                                |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| Retention sweep for `auth_audit_events` (**90 days** — staging/dev locked)   | Auth login API changes                      |
| Retention sweep for `auth_login_attempts` (**30 days** — staging/dev locked) | Domain APIs                                 |
| Dry-run mode before any delete                                               | Deleting recent security/audit evidence     |
| Runbook + alert if job fails                                                 | Auth persistence rewrite                    |
| Optional archive to cold storage before delete (P2)                          | Shift/Career/Employer/Employee feature work |

---

## Non-goals

- Do not modify audit write logic in `auth.service.db.ts` without a new phase gate.
- Do not delete rows newer than locked retention window.
- Do not implement in this planning phase — **no sweep job code yet**.
- Do not accidentally destroy evidence needed for active incident investigation.

---

## Affected tables / entities (inspect before implementation)

| Table                 | Key columns                                                     | Event types (audit)                                                        | Migration reference        |
| --------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| `auth_audit_events`   | `event_type`, `created_at`, `user_id`, `session_id`, `metadata` | `login`, `logout`, `login_failed`, `login_rate_limited`, session lifecycle | `001_auth_persistence.sql` |
| `auth_login_attempts` | `email_normalized`, `ip_hash`, `success`, `attempted_at`        | N/A — rate-limit tracking                                                  | `001_auth_persistence.sql` |

**Service reference:** `auth.service.db.ts` writes `login_failed`, `login_rate_limited`, etc.

---

## Retention policy — LOCKED (staging/dev only)

> **Policy scope:** This is a **staging/dev retention policy only**.  
> This is **not** the final production retention policy.  
> **Production retention must be reviewed again before production launch.**  
> Planning/docs are locked; **implementation is still not approved.**

| Table                             | Locked retention (staging/dev)  | Action (when implementation approved)                                       |
| --------------------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| `auth_login_attempts`             | **30 days**                     | Hard delete rows where `attempted_at < now() - interval '30 days'`          |
| `auth_audit_events`               | **90 days**                     | Hard delete or archive rows where `created_at < now() - interval '90 days'` |
| `auth_sessions` (expired/revoked) | 30 days after expiry/revocation | **GAP-001** — separate job                                                  |

**Destructive rules (mandatory):**

- Dry-run mode is **mandatory** before any `DELETE`.
- No destructive `DELETE` or `UPDATE` may run before dry-run evidence is reviewed and **operator-approved**.
- No audit or security evidence required for investigation may be destroyed (rows within retention window).
- Retention sweep is **operational only** — no Job Mitra product/domain logic (Shift, Career, Employer, Employee, Work Vault, Admin).

**Gate status:**

| Gate                             | Status                          |
| -------------------------------- | ------------------------------- |
| Phase 2 Auth Persistence         | **LOCKED / PASS**               |
| Phase 2.1                        | **IN PROGRESS**                 |
| Production deployment            | **NOT APPROVED**                |
| GAP-002 implementation           | **Not approved**                |
| GAP-002 staging dry-run evidence | **PASS / CLEARED** (2026-07-07) |

---

## Staging dry-run evidence (2026-07-07)

**Collector:** `scripts/gap-001-002-dry-run.mjs` — **SELECT-only**; `destructive_action: false`.

| Field                                     | Recorded value |
| ----------------------------------------- | -------------- |
| `target_env`                              | `staging`      |
| `login_attempts_older_than_30_days_count` | `0`            |
| `audit_events_older_than_90_days_count`   | `0`            |
| `oldest_login_attempt_date`               | `null`         |
| `newest_login_attempt_date`               | `null`         |
| `oldest_audit_event_date`                 | `null`         |
| `newest_audit_event_date`                 | `null`         |

All counts were zero. No rows exceeded locked retention windows at time of run. No destructive action was executed.

Full record: [`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](../evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md)

---

## Dry-run requirement (mandatory)

**All cleanup/sweep jobs must support non-destructive dry-run mode before any delete/update execution.**

| Mode            | Behavior                                                                        |
| --------------- | ------------------------------------------------------------------------------- |
| `DRY_RUN=true`  | `SELECT COUNT(*)` per table — **no DELETE**                                     |
| `DRY_RUN=false` | Execute `DELETE` only after dry-run evidence reviewed and **operator-approved** |

Dry-run output must log: `table_name`, `eligible_row_count`, `oldest_eligible_date` (date only) — no `ip_hash` values, no emails, no `metadata` payloads, no tokens.

---

## Safety checks (before live delete)

1. Predicate uses `created_at` / `attempted_at` only — never delete all rows.
2. Confirm retention window matches **locked staging/dev policy** (`auth_login_attempts` 30 days; `auth_audit_events` 90 days).
3. Dry-run on staging first; manual `SELECT COUNT(*)` cross-check.
4. Do not run during active security incident investigation without ops approval.
5. Job must be **idempotent**.

---

## Rollback strategy

| Scenario             | Action                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Wrong rows deleted   | Restore from backup if §8.1 backup available; otherwise data is unrecoverable                |
| Job deletes too much | Disable cron; extend retention predicate; review dry-run logs                                |
| Archive path (P2)    | Prefer archive-before-delete for `auth_audit_events` if compliance requires longer retention |

> Without §8.1 backups, destructive sweeps on production carry higher risk. Defer live sweep on production until backup strategy exists.

---

## Audit / security evidence preservation

| Rule                    | Detail                                                                     |
| ----------------------- | -------------------------------------------------------------------------- |
| Recent events protected | Rows within retention window must never be deleted                         |
| Rate-limit evidence     | `login_rate_limited` / `login_failed` in window preserved for ops review   |
| No PII in job logs      | Log counts and dates only                                                  |
| Investigation hold (P2) | Optional: skip delete if `metadata` flags active case — future enhancement |

**Security audit evidence must not be accidentally destroyed** — dry-run + retention window enforcement are mandatory gates.

---

## Verification evidence required for clearance

| #   | Evidence                                                           |
| --- | ------------------------------------------------------------------ |
| 1   | Dry-run on staging — counts per table documented                   | **PASS / CLEARED** (2026-07-07) — both counts `0` |
| 2   | Live staging sweep — counts match dry-run                          |
| 3   | Rows inside retention window remain (spot-check `SELECT COUNT(*)`) |
| 4   | Auth smoke still passes after sweep                                |
| 5   | Rate-limit still writes new `auth_login_attempts` rows             |
| 6   | Runbook + failure alert documented                                 |

---

## Risks if implemented incorrectly

| Risk                             | Impact                                        |
| -------------------------------- | --------------------------------------------- |
| Delete recent audit events       | Cannot investigate login attacks or incidents |
| Delete active rate-limit context | Lockout/rate-limit behavior harder to debug   |
| Wrong retention window           | Compliance / ops visibility loss              |
| No dry-run                       | Irreversible without backup                   |
| Log PII from `metadata`          | Security incident                             |

---

## Phase 2 lock confirmation

- **Phase 2 Auth Persistence:** **LOCKED / PASS** — this gap does **not** change accepted auth implementation.
- **Phase 2.1:** **IN PROGRESS** — not PASS.
- **Production deployment:** **NOT APPROVED**.
- **Security audit evidence must not be accidentally destroyed.**
- **Implementation is not approved yet** — planning/docs locked; no sweep job until implementation gate opens.

---

## Problem (original)

Phase 2 persistence writes:

- `auth_audit_events` — login, logout, session lifecycle
- `auth_login_attempts` — rate-limit and lockout tracking

**No scheduled retention sweep exists** in the codebase.

---

## Suggested SQL (future implementation gate only — not executed now)

> Suggested reference only. **No SQL has been executed.** Dry-run `SELECT COUNT(*)` with these predicates required before any live delete.

```sql
-- DRY_RUN: SELECT COUNT(*) FROM auth_login_attempts WHERE attempted_at < now() - interval '30 days';
-- Locked staging/dev: auth_login_attempts retain 30 days
DELETE FROM auth_login_attempts
WHERE attempted_at < now() - interval '30 days';

-- DRY_RUN: SELECT COUNT(*) FROM auth_audit_events WHERE created_at < now() - interval '90 days';
-- Locked staging/dev: auth_audit_events retain 90 days
DELETE FROM auth_audit_events
WHERE created_at < now() - interval '90 days';
```

---

## Related issues

- GAP-001 — session row cleanup (overlapping `auth_sessions` purge)
- GAP-004 — audit evidence query (CLEARED — read path only)
- Phase 2.1 checklist § [Future Automation Guards for GAP-001/GAP-002](../23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md#job-mitra--future-automation-guards-for-gap-001gap-002) — planning only; not approved
