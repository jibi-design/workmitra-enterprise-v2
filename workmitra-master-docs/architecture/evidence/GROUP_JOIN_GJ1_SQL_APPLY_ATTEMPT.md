# Group Join GJ-1 — SQL apply attempt (2026-07-26)

> Companion: `GROUP_JOIN_GJ1_SQL_APPLY.md` · migration `202607260001_shift_ops_static_link_daily_otp.sql`

**Status:** **BLOCKED then CLEARED** — founder ran migration + verify in SQL Editor.  
**Founder said:** `apply (GJ-1 SQL)` — apply authorized.  
**Verify (2026-07-26 screenshot):** `tables=2`, `fns=6` → **PASS / APPLIED**

---

## What was tried

| Step                                                                | Result                                   |
| ------------------------------------------------------------------- | ---------------------------------------- |
| `node scripts/apply-gj1-migration.mjs` against local `DATABASE_URL` | **BLOCKED** — `shift_ops` schema missing |
| Supabase Dashboard SQL Editor (agent)                               | **BLOCKED** — sign-in                    |
| Operator SQL Editor (founder)                                       | **PASS** — migration + verify            |

---

## Verify evidence

| kind   | n   |
| ------ | --- |
| tables | 2   |
| fns    | 6   |

Project: `jobmitra-enterprise-v2-dev` · Primary Database · role postgres.
