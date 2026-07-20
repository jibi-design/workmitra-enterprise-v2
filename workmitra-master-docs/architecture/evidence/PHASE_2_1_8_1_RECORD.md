<!-- App name: WorkMitra / Job Mitra
File name: PHASE_2_1_8_1_RECORD.md
-->

# Phase 2.1 §8.1 — Supabase Backup / PITR Evidence Record

**Status:** RECORDED — §8.1 and §8.2 both documented (2026-07-07)  
**§8.1 gate:** NOT CLEARED — Free plan has no scheduled backups  
**§8.2 gate:** DOCUMENTED — PITR is a Pro Plan add-on; plan limitation confirmed  
**Phase 2.1 verdict:** IN PROGRESS — not PASS  
**Production deployment:** NOT APPROVED  
**Phase 2 Auth Persistence:** LOCKED

---

## Classification

This is an **operational / plan limitation — not an auth code defect**.  
Phase 2 auth implementation is correct. No code change is required to address this finding.  
Backups must be enabled (via plan upgrade or approved alternative strategy) before production deployment is approved.

---

## Attestation (operator — 2026-07-07)

| Field                         | Value                                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recorded_at`                 | 2026-07-07                                                                                                                                                                   |
| `operator_signoff`            | pending — full sign-off held until §8.1 backup is cleared on upgraded plan                                                                                                   |
| `project_env`                 | staging (dev/staging Supabase project used for Phase 2.1 smoke)                                                                                                              |
| `production_project_exists`   | not confirmed — same project used for staging                                                                                                                                |
| `plan_tier`                   | Free                                                                                                                                                                         |
| `backup_enabled`              | **no**                                                                                                                                                                       |
| `backup_schedule`             | not available on Free plan                                                                                                                                                   |
| `backup_retention_days`       | 0 — not included on Free plan                                                                                                                                                |
| `last_successful_backup_date` | none — no backups have run                                                                                                                                                   |
| `dashboard_message`           | "Free Plan does not include project backups. Upgrade to the Pro Plan for up to 7 days of scheduled backups."                                                                 |
| `pitr_available`              | **no** — Pro Plan add-on; not available on Free plan                                                                                                                         |
| `pitr_dashboard_message`      | "Point In Time Recovery is a Pro Plan add-on. Roll back your database to a specific second. Starts at $100/month. Pro Plan already includes daily backups at no extra cost." |
| `pitr_retention_days`         | n/a (not enabled)                                                                                                                                                            |
| `pitr_blocker`                | plan_limitation                                                                                                                                                              |
| `pitr_mitigation`             | Before production deployment, upgrade to Pro and enable / approve PITR add-on if required by production readiness policy.                                                    |
| `screenshot_location`         | ops drive / secret manager — not committed to git                                                                                                                            |

---

## Checklist mapping

| Checklist ID        | Priority | Result                            | Notes                                                                                              |
| ------------------- | -------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| 8.1 Backup enabled  | **P0**   | **NOT CLEARED — PLAN LIMITATION** | `backup_enabled=no`; Free plan excludes project backups; upgrade required before production deploy |
| 8.2 PITR documented | P1       | **DOCUMENTED — PLAN LIMITATION**  | `pitr_available=no`; Pro add-on at $100/month; Free plan excludes PITR; mitigation recorded        |

---

## Verdict block

```text
§8.1 backup/PITR operator confirmation: RECORDED (2026-07-07)
§8.1 backup_enabled: no
§8.1 gate result: NOT CLEARED — plan limitation (Free plan; no scheduled project backups)
§8.2 pitr_available: no
§8.2 pitr_blocker: plan_limitation (Pro add-on; not included on Free)
§8.2 gate result: DOCUMENTED — plan limitation; mitigation recorded
Classification: operational plan limitation — not an auth code defect
Auth code failure: none
Operator sign-off: pending (held until §8.1 cleared on upgraded plan)
Production deployment: NOT APPROVED
Phase 2 Auth Persistence: LOCKED
Phase 2.1: IN PROGRESS
```

---

## Required before §8.1 clears

1. Upgrade staging (and production) Supabase project to **Pro or equivalent** plan that includes scheduled backups (Pro includes daily backups; PITR available as add-on from $100/month).
2. Re-confirm `backup_enabled=yes` and record `last_successful_backup_date` in this file.
3. Decide whether PITR add-on is required by production readiness policy; document decision.
4. Record operator sign-off once §8.1 backup is confirmed on upgraded plan.

**§8.2 is already DOCUMENTED.** No further dashboard check needed for §8.2 — plan limitation and mitigation are on record.

---

## Operator Decision — Supabase Pro / PITR Deferred (2026-07-07)

| Decision                 | Value                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| Supabase Pro upgrade now | **No — deferred**                                                        |
| PITR add-on now          | **No — deferred**                                                        |
| Reason                   | Dev/staging only; no real production users; avoid premature monthly cost |
| §8.1 status              | Remains **NOT CLEARED** (Free plan)                                      |
| §8.2 status              | Remains **DOCUMENTED** (plan limitation)                                 |
| Before production launch | Upgrade to Pro **or** approved backup/restore strategy required          |
| PITR                     | Reconsider only when business/data risk justifies cost                   |
| Phase 2.1                | IN PROGRESS                                                              |
| Production deployment    | NOT APPROVED                                                             |
| Auth defect              | None                                                                     |

---

## Reference

Operator runbook: `evidence/PHASE_2_1_8_1_SUPABASE_BACKUP_PITR_OPERATOR.md`  
Checklist: `23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md` §8
