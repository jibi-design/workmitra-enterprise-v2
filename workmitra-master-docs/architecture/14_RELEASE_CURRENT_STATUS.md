<!-- App name: WorkMitra / Job Mitra
File name: 14_RELEASE_CURRENT_STATUS.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\14_RELEASE_CURRENT_STATUS.md -->

# WORKMITRA / JOB MITRA — RELEASE / CURRENT STATUS

## Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## Purpose

This document stores only the current release, Play Console, testing, app identity and operational status for WorkMitra / Job Mitra.

This document must not replace product architecture truth.

Product architecture belongs in:

- `01_CORE_MASTER_TRUTH.md`
- domain architecture documents
- cross-domain system rules
- UI design system rules

## Core Rule

Release status is temporary operational truth.

Product architecture is permanent product truth.

Do not mix temporary release operations into the master product architecture unless they become permanent product rules.

## Active Public Launch Identity

Public launch / Play Store name:

```txt
Job Mitra
```

---

## Phase Acceptance Log

| Date       | Phase                                   | Verdict            | Evidence                                                                              |
| ---------- | --------------------------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| 2026-07-06 | Phase 2 — Auth Persistence              | **PASS**           | See entry below                                                                       |
| 2026-07-07 | Phase 2.1 — Operator staging evidence   | **PARTIAL**        | 16 PASS — §8.1 NOT CLEARED (deferred); §8.2 DOCUMENTED; GAP-001/002 planning started  |
| 2026-07-07 | Phase 2.1 — GAP-001/002 staging dry-run | **PASS / CLEARED** | SELECT-only; all counts `0`; `destructive_action: false`; implementation not approved |

---

### Phase 2.1 Operator Staging Evidence (2026-07-07)

**Verdict: IN PROGRESS — not PASS**

**Collector:** `node scripts/phase-2-1-operator-staging.mjs` → **16 PASS / 0 FAIL / 0 BLOCKED / 1 NEEDS_OPERATOR**

**Accepted evidence:**

| Check                   | Result                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| Supabase Session Pooler | Host confirmed                                                                  |
| DB-backed auth smoke    | PASS                                                                            |
| Login                   | `userPresent=true`                                                              |
| GET /me                 | `200`                                                                           |
| POST /logout            | `200`                                                                           |
| GET /me after logout    | `401`                                                                           |
| Cookie flags (live)     | `HttpOnly`, `SameSite=Lax`, `Secure`                                            |
| Logout cookie clear     | `wm_session` cleared                                                            |
| Wrong-origin CORS       | Blocked                                                                         |
| Allowed-origin CORS     | Echoed `http://localhost:5173` (local staging simulation)                       |
| Rate limit              | `429` on failed logins                                                          |
| Audit/login rows        | `auditRowCount=5`, `failedAttemptCount=5`, `latestEventType=login_rate_limited` |

**Cleared:** GAP-003 (CORS evidence), GAP-004 (audit evidence query)

**Operator decision (2026-07-07):** Supabase Pro and PITR add-on **deferred** — dev/staging only, no real production users, cost deferred. §8.1 remains NOT CLEARED. Not an auth defect.

**Next milestone:** Phase 2.1 Operational Hardening — [GAP-001](architecture/issues/GAP-001-db-session-cleanup-job.md) / [GAP-002](architecture/issues/GAP-002-audit-retention-sweep-job.md) — staging dry-run evidence **PASS / CLEARED** (2026-07-07); **implementation not approved**. All cleanup jobs require dry-run before delete.

### GAP-001 / GAP-002 Staging Dry-Run Evidence (2026-07-07)

**Verdict:** Dry-run evidence **PASS / CLEARED** for staging — implementation **NOT APPROVED**

**Collector:** `npx tsx scripts/gap-001-002-dry-run.mjs` — **SELECT-only**; `destructive_action: false`; `target_env: staging`

| Gap     | Key counts                                                                                                           | Result             |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------------------ |
| GAP-001 | `eligible_expired_or_revoked_session_count: 0`, `active_session_eligible_count: 0`, `active_sessions_excluded: true` | **PASS / CLEARED** |
| GAP-002 | `login_attempts_older_than_30_days_count: 0`, `audit_events_older_than_90_days_count: 0`                             | **PASS / CLEARED** |

All date bounds were `null` (no eligible rows). No destructive action was executed.

**Evidence record:** [`evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md`](architecture/evidence/PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md)

**Not approved:** GAP-001/GAP-002 cron/sweep implementation. Production deployment. Phase 2.1 PASS.

**Remaining before Phase 2.1 PASS:**

- §8.1 Backup — **NOT CLEARED**: Free plan has no scheduled backups. Upgrade to Pro (or approved alternative) required before production deploy. Operational plan limitation — not an auth defect. Evidence: [`evidence/PHASE_2_1_8_1_RECORD.md`](architecture/evidence/PHASE_2_1_8_1_RECORD.md)
- §8.2 PITR — **DOCUMENTED — PLAN LIMITATION**: `pitr_available=no`; PITR is a Pro add-on at $100/month; Free plan excludes it. Mitigation recorded: upgrade to Pro and approve PITR add-on before production deploy if required by policy. Not an auth defect.
- Real staging frontend origin CORS/cookie evidence before production deploy (pre-deploy, not localhost simulation)

**Not approved:** Production deployment. Phase 2 Auth Persistence remains **LOCKED**.

---

### Phase 2 Auth Persistence — Final Acceptance (2026-07-06)

**Verdict: PASS — LOCKED**

**Lock rule:** Do not modify accepted Phase 2 auth persistence implementation without a new issue or phase gate.

**Evidence recorded:**

| Check                      | Result                                                                            |
| -------------------------- | --------------------------------------------------------------------------------- |
| Supabase project connected | Session Pooler URL — OK                                                           |
| `npm run db:migrate`       | Completed without error                                                           |
| `npm run db:seed`          | Created/updated `employee@staging.jobmitra.app` + `employer@staging.jobmitra.app` |
| `npm run dev:db`           | DB connection verified; API started on `localhost:3001`                           |
| Employee login             | Returned `data.user`                                                              |
| `GET /me`                  | Returned `data.user` with active session                                          |
| `POST /logout`             | Returned `ok=True`                                                                |
| `GET /me` after logout     | Returned `401` — correct                                                          |

**Scope:**

- DB-backed authentication for dev/runtime — accepted.
- No domain APIs mixed.
- No production deployment approval — production deploy requires separate phase gate.

**Not approved:**

- Production deployment
- Any cross-domain mixing (Shift ↔ Career)
- Any auth changes without new phase gate

---

## Current phase status

| Phase                            | Status            | Notes                                                                                                                |
| -------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Phase 2 — Auth Persistence       | **LOCKED / PASS** | Dev/runtime DB-backed auth accepted 2026-07-06                                                                       |
| Phase 2.1 — Production Readiness | **IN PROGRESS**   | GAP-001/002 staging dry-run PASS/CLEARED; §8.1 deferred; implementation not approved; production deploy not approved |
| Production deployment            | **NOT APPROVED**  | Requires Phase 2.1 PASS + separate deploy gate                                                                       |

**Phase 2.1 scope:** environment separation, production secrets, cookie security, CORS, rate limits, session cleanup, audit retention, Supabase backup/restore, deployment gate. **No domain APIs in this step.**
