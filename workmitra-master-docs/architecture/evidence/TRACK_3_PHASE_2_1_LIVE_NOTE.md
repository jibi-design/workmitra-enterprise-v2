# Track 3 — Phase 2.1 Operational Hardening (Live Note)

> **Purpose:** GAP-001 session cleanup + GAP-002 audit retention — implement safely.  
> **Companions:** `GAP-001-db-session-cleanup-job.md` · `GAP-002-audit-retention-sweep-job.md` · `PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md` · `PENDING_WORK_BOARD.md`  
> **Rule:** Dry-run mandatory before any DELETE. No production purge. Phase 2 Auth contract unchanged.

**Last verified:** 2026-07-26 (T3-4 **SKIPPED**; Track 3 daily work **CLOSED**)  
**Overall status:** T3-0…T3-3 DONE. T3-4 live DELETE **SKIPPED** (not needed now; eligible was 0). T3-5 stays pre-launch.  
**Production:** **NOT APPROVED**

---

## 1. Current truth

| Item                                           | Status                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| Phase 2 Auth Persistence                       | **LOCKED / PASS** — do not reopen                                           |
| GAP-001 / GAP-002 staging dry-run (2026-07-07) | **PASS / CLEARED**                                                          |
| Job code                                       | **IN REPO** (T3-1) — see files below                                        |
| Default mode                                   | `DRY_RUN` unset/`true` → count only                                         |
| Live DELETE                                    | **SKIPPED for now** (T3-4) — still needs `GAP delete approve` later if ever |
| Cron scheduler                                 | **STUB IN REPO** (T3-3) — forces dry-run; Render not wired                  |
| §8.1 backup                                    | **NOT CLEARED**                                                             |

### Files (T3-1)

- `server/jobs/gapRetention.shared.ts`
- `server/jobs/gap001SessionCleanup.job.ts`
- `server/jobs/gap002AuditRetention.job.ts`
- `scripts/run-gap-retention-jobs.ts`
- `src/tests/gapRetention.shared.test.ts` (3 PASS)
- npm: `npm run job:gap-retention` (via `with-auth-db-source`)

### Files (T3-3)

- `scripts/gap-retention-cron-entry.ts` — forces `DRY_RUN=true`, clears `GAP_DELETE_APPROVED`
- `server/jobs/gapRetention.cron.stub.ts` — schedule metadata (`0 3 * * *`)
- `PHASE_2_1_GAP_CRON_STUB.md` — runbook
- npm: `npm run job:gap-retention:cron`

### How to run (dry-run — default)

```bash
DRY_RUN_TARGET_ENV=dev npm run job:gap-retention
DRY_RUN_TARGET_ENV=dev npm run job:gap-retention:cron
```

Logs JSON counts/dates only. Never paste `DATABASE_URL` into chat.

---

## 2. Ordered patches

| #    | Patch                                       | Status                                                                                          |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| T3-0 | Inventory + live note                       | **DONE**                                                                                        |
| T3-1 | Jobs with DRY_RUN=true default              | **DONE** (2026-07-26)                                                                           |
| T3-2 | Re-run dry-run on current DB; record counts | **DONE / PASS** — `PHASE_2_1_GAP_T3_2_DRY_RUN_PASS.md`                                          |
| T3-3 | Cron/scheduler stub (still dry-run)         | **DONE** — `PHASE_2_1_GAP_CRON_STUB.md`                                                         |
| T3-4 | Live DELETE                                 | **SKIPPED** (2026-07-26) — founder: unclear gates; eligible 0; reopen with `GAP delete approve` |
| T3-5 | Prod retention review                       | Pre-launch                                                                                      |

---

## 3. Hard locks

- Do **not** change auth login/cookie contract
- Do **not** set `GAP_DELETE_APPROVED=1` without founder approve
- Do **not** run against production
- Counts/dates only in logs

---

## 4. Change log

| Date       | Who              | What                                                                                                       |
| ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| 2026-07-26 | Founder + Cursor | Track 3 started. T3-0 DONE.                                                                                |
| 2026-07-26 | Founder + Cursor | T3-1 DONE: GAP-001/002 jobs + CLI; unit tests 3 PASS; DELETE gated. Next = T3-2.                           |
| 2026-07-26 | Founder + Cursor | T3-2 attempted: `job:gap-retention` dry-run → ECONNREFUSED localhost:5432. Recorded BLOCKED.               |
| 2026-07-26 | Founder + Cursor | T3-2 PASS after `docker start workmitra-postgres`. All eligible counts 0. Next = T3-3.                     |
| 2026-07-26 | Founder + Cursor | T3-3 DONE: cron entry forces dry-run even if live flags set; Render not wired. Next = T3-4 LOCKED or skip. |
| 2026-07-26 | Founder + Cursor | T3-4 SKIPPED (unclear + eligible 0). Track 3 daily CLOSED. T2-7 stays PARKED.                              |
