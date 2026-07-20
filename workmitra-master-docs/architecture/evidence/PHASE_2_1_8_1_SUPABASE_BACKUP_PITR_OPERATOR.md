<!-- App name: WorkMitra / Job Mitra
File name: PHASE_2_1_8_1_SUPABASE_BACKUP_PITR_OPERATOR.md
-->

# Phase 2.1 §8.1 — Supabase Backup / PITR Operator Confirmation

**Status:** AWAITING_OPERATOR  
**Phase:** 2.1 Production Readiness  
**Gate:** P0 §8.1 (backup) + P1 §8.2 (PITR documentation)  
**Opened:** 2026-07-07

**Does not modify:** Phase 2 auth code, auth contract, or production deployment approval.

---

## Purpose

Record operator-verified Supabase backup and point-in-time recovery (PITR) status for the Job Mitra database project(s). This is **dashboard evidence only** — not automatable from the API or auth codebase.

**Phase 2.1 remains IN PROGRESS** until this evidence is recorded in `PHASE_2_1_8_1_RECORD.md` and cross-linked from the checklist.

---

## Which project to confirm

| Project                                                  | When required                                     | Checklist                                                                     |
| -------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Staging** (Session Pooler used in Phase 2 / 2.1 smoke) | **Now** — minimum for §8.1 staging gate           | Confirm backups enabled on staging Supabase project                           |
| **Production**                                           | Before production deploy approval (separate gate) | §8.1 text references production project — re-confirm when prod project exists |

If production Supabase project does not exist yet, record **staging backup evidence** and note `production_project=not_created` in the record. Do **not** mark production deploy approved.

---

## Operator steps (Supabase Dashboard)

1. Sign in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select the **staging** project (the one whose Session Pooler URL is in `DATABASE_URL` for Phase 2.1 smoke — **do not paste URL or password into git**).
3. Navigate: **Project Settings → Database → Backups** (or **Infrastructure → Backups** depending on dashboard version).
4. Record:

| Field                    | What to verify                                                            |
| ------------------------ | ------------------------------------------------------------------------- |
| `backup_enabled`         | Daily (or better) automated backups are **on** and not failing            |
| `backup_retention`       | Retention period shown (e.g. 7 days Free, longer on Pro)                  |
| `last_successful_backup` | Recent successful backup timestamp (date only in git record)              |
| `pitr_available`         | Whether **Point in Time Recovery** is offered and enabled on current plan |
| `pitr_retention`         | If PITR available — recovery window (e.g. 7 days)                         |

5. Optional (not required for §8.1): note whether a manual backup download is available.

**Evidence storage:** Screenshot → secret manager / ops drive only. Git record = **redacted attestation** (booleans, dates, plan tier name — no project ref IDs unless operator approves).

---

## PITR unavailable — not a code failure

If the current Supabase plan does **not** include PITR:

| Classification        | Use when                                                              |
| --------------------- | --------------------------------------------------------------------- |
| `plan_limitation`     | PITR not included on Free / current tier — backups may still be daily |
| `operational_blocker` | Production deploy requires PITR but plan upgrade not yet done         |
| `not_applicable`      | Staging-only gate; PITR deferred to production project upgrade        |

Record in `PHASE_2_1_8_1_RECORD.md`:

- `pitr_available: false`
- `pitr_blocker: plan_limitation` (or `operational_blocker`)
- `mitigation`: e.g. upgrade to Pro before production deploy; rely on daily backups until then

**This is not a Phase 2 auth code defect.** Do not change auth implementation.

§8.1 P0 requires **backup enabled**. §8.2 P1 requires **PITR understood and documented** — documenting plan limitation satisfies §8.2 when PITR is unavailable.

---

## Recording evidence (no secrets)

### Option A — env attestation script

```powershell
$env:SUPABASE_PROJECT_ENV = "staging"
$env:SUPABASE_BACKUP_ENABLED = "yes"
$env:SUPABASE_BACKUP_RETENTION_DAYS = "7"
$env:SUPABASE_LAST_BACKUP_DATE = "2026-07-07"
$env:SUPABASE_PLAN_TIER = "Pro"
$env:SUPABASE_PITR_AVAILABLE = "no"
$env:SUPABASE_PITR_BLOCKER = "plan_limitation"
$env:SUPABASE_PITR_MITIGATION = "Upgrade staging/prod to Pro before production deploy; daily backups active"
$env:OPERATOR_SIGNOFF = "initials-or-role"
node scripts/phase-2-1-operator-8-1-backup.mjs
```

Paste script output into `PHASE_2_1_8_1_RECORD.md` (replace PENDING block).

### Option B — manual

Fill `PHASE_2_1_8_1_RECORD.md` directly using the template fields.

---

## Acceptance (to clear §8.1 / document §8.2)

| ID  | Criterion                                                                | Required                             |
| --- | ------------------------------------------------------------------------ | ------------------------------------ |
| 8.1 | Automated backup **enabled** on staging (or production) Supabase project | P0 — must be `yes`                   |
| 8.2 | PITR status **documented** (available or plan limitation + mitigation)   | P1 — required for this operator step |
| —   | Operator sign-off date recorded                                          | Yes                                  |
| —   | No secrets in git                                                        | Yes                                  |

After record is complete, update:

- `23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md` §8 evidence log
- `14_RELEASE_CURRENT_STATUS.md` — only if **all P0** items pass (including 8.1); Phase 2.1 PASS still requires full P0 sign-off per §9.1

---

## Related

- Checklist: `23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md` §8
- Evidence record: `evidence/PHASE_2_1_8_1_RECORD.md`
- Staging smoke collector: `scripts/phase-2-1-operator-staging.mjs` (§8.1 stays NEEDS_OPERATOR until this step completes)
