# Phase 2.1 — GAP retention cron stub (T3-3)

> **Companion:** `TRACK_3_PHASE_2_1_LIVE_NOTE.md`  
> **Hard rule:** This stub **never** DELETEs. Live purge = T3-4 + explicit approve + backup.

**Status:** **DONE** (2026-07-26) — stub + docs only; not deployed to Render yet.

---

## What exists

| Piece                              | Path / command                          |
| ---------------------------------- | --------------------------------------- |
| Cron entry (forces `DRY_RUN=true`) | `scripts/gap-retention-cron-entry.ts`   |
| Schedule metadata stub             | `server/jobs/gapRetention.cron.stub.ts` |
| npm                                | `npm run job:gap-retention:cron`        |
| Manual dry-run (same jobs)         | `npm run job:gap-retention`             |

Schedule intent: **`0 3 * * *`** (daily 03:00 UTC) — documented only; not live on Render.

---

## How to run stub locally

1. Ensure Postgres is up (`docker start workmitra-postgres` if needed)
2. `DRY_RUN_TARGET_ENV=dev npm run job:gap-retention:cron`
3. Expect JSON with `"dry_run": true`, `"destructive_action": false`

---

## Future Render wiring (not now)

1. Create Render Cron Job
2. Command: `npm run job:gap-retention:cron`
3. Env: `AUTH_USER_SOURCE=db`, `DATABASE_URL` (secret), `DRY_RUN_TARGET_ENV=staging`
4. Do **not** set `GAP_DELETE_APPROVED` on cron
5. After T3-4 approve + §8.1 backup: separate live job design (not this stub)

---

## Out of scope (T3-3)

- Auto-start inside `server/index.ts`
- Production cron enable
- Live DELETE

---

## Change log

| Date       | What                       |
| ---------- | -------------------------- |
| 2026-07-26 | T3-3 stub + runbook added. |
