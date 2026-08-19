# Pending Work Board — Mitra Labs / Job Mitra

> **Last updated:** 2026-08-18  
> **Leader rule:** Finish product/ops pending before launch cosmetics.  
> **v2.0 release focus:** Job Posting → Recruitment → Group Formation → Privacy-Locked Call/Chat → Shift Completion → Reviews.  
> **Live notes:** `CLOUDFLARE_LIVE_STATE_NOTE.md` · `SUPABASE_LIVE_STATE_NOTE.md` · Planner `07` · `SHIFT_OPS_LIVE_STATE_NOTE.md` · `TRACK_GROUP_JOIN_LIVE_NOTE.md`

---

## WorkMitra v2.1 Future Roadmap (DESCOPED from v2.0)

> Do **not** implement these in the current release. Catalog only until founder unlocks **v2.1**.

| #     | Feature                                                    | Scope (v2.1)                                                         | Why descope now                                                                         |
| ----- | ---------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| V21-1 | **Live Attendance Verification**                           | Real-time QR check-in + live shift timers / elapsed clocks           | Not in v2.0 core path; Group Join QR ≠ live punch-in; timer UI claims were aspirational |
| V21-2 | **Financial Settlement Queues**                            | Automated OT locking + settlement queues + direct payout processing  | Earnings UI is estimate-only; no payout API in v2.0                                     |
| V21-3 | **Real-Time Venue Ratings & Deep Durability Backend Sync** | Venue as rating subject + durable multi-device trust/ratings backend | v2.0 keeps local Employer↔Worker reviews only                                           |

**v2.0 allowed (keep):** Pre-shift **intent** (“I will attend”) · local earnings **estimate** · Group Join static link/OTP · privacy-locked Call/Chat · mark completed · bidirectional reviews (local).

**Start only when founder says:** `v2.1 തുടങ്ങൂ` (or names a specific V21-* row).

---

## Deferred until pre-launch bundle (do NOT do now)

| Item                                                                                    | Why deferred                                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Company email + GitHub/Cloudflare/Supabase ownership migrate                            | Do once, together, before public launch                                        |
| Cloudflare www record + redirect                                                        | Cosmetic/DNS; approve later                                                    |
| Cloudflare Worker → Pages + replace Coming Soon with Next `out/`                        | Marketing deploy; after product pending                                        |
| Email DNS (MX/SPF/DKIM/DMARC)                                                           | With company email bundle                                                      |
| Supabase Pro / PITR / §8.1 backups                                                      | Required before production approve; not now                                    |
| Production deployment approve                                                           | NOT APPROVED until Phase 2.1 + backup strategy                                 |
| **Track 5 — Global UX / premium polish** (currency, phone country, Shift Ops luxury UI) | **DEFERRED** until Group Join track done (or founder says `Global UX തുടങ്ങൂ`) |

---

## Already DONE (do not re-audit from zero)

| Item                                                                | Evidence                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Cloudflare verify (Worker, domain, SSL Full, apex DNS, Coming Soon) | `CLOUDFLARE_LIVE_STATE_NOTE.md`                                |
| Supabase homepage investigation CLOSED                              | `SUPABASE_LIVE_STATE_NOTE.md`                                  |
| Local Access Hub `npm run build` → `out/` PASS                      | 2026-07-25                                                     |
| Phase 2 Auth Persistence                                            | LOCKED / PASS                                                  |
| Phase 2.1 staging operator                                          | 16 PASS; GAP-001/002 dry-run PASS; implementation not approved |
| Planner Track 1 (T1-1…T1-5)                                         | Planner doc `07` + master `01` v1.10                           |

---

## Ordered pending tracks (do in this order)

### Track 1 — Planner product — **COMPLETE** (2026-07-26)

**Canonical live note:** `workmitra-master-docs/planner/07_PLANNER_PENDING_AND_DEFERRED_LIVE_NOTE.md`

All T1-1…T1-5 done. Further Planner work = P2 open items / D-xx deferred in doc 07 + master `01` §11 (v1.10).

### Track 2 — Shift Ops Phase 0–1 — **SQL PATH COMPLETE** (2026-07-26)

**Canonical live note:** `workmitra-master-docs/architecture/evidence/SHIFT_OPS_LIVE_STATE_NOTE.md`  
**Smoke evidence:** `workmitra-master-docs/architecture/evidence/SHIFT_OPS_T2_5_SMOKE.md`

| Finding               | Status                           |
| --------------------- | -------------------------------- |
| SQL Phase 0+1         | **APPLIED**                      |
| Schema exposed        | **DONE** (`shift_ops` in 3 of 3) |
| Pepper                | **ready=true**                   |
| T2-5 SQL smoke        | **PASS**                         |
| OTP Edge              | Stub only — not deployed         |
| `ensure_site_for_shift_post` SQL | **APPLIED** 2026-08-18 (table `shift_post_sites` + RPC verify true) |
| App `VITE_SUPABASE_*` | **SET** (browser client READY)   |
| API `SUPABASE_SERVICE_ROLE_KEY` | **MISSING** — supabase-bridge 503; Confirm fail-opens local group |

**Patches T2-0…T2-5 (SQL):** **DONE**

**Track 2 closeout (optional but recommended — finish before Track 3):**

1. **T2-6** Browser env + invite smoke — set local `VITE_SUPABASE_URL` + anon/publishable key → open `/employee/shift-ops/invite`
2. **T2-7** OTP Edge deploy — `shift-ops-otp-dispatch` to project (stub mode OK; no Twilio yet) — needs “T2-7 തുടങ്ങൂ”

### Track 3 — Phase 2.1 Operational Hardening — **CLOSED** (daily) (2026-07-26)

**Canonical live note:** `workmitra-master-docs/architecture/evidence/TRACK_3_PHASE_2_1_LIVE_NOTE.md`  
**Issues:** `GAP-001-db-session-cleanup-job.md` · `GAP-002-audit-retention-sweep-job.md`  
**Dry-run evidence:** `PHASE_2_1_GAP_001_002_DRY_RUN_RECORD.md` (PASS 2026-07-07)

| Finding                       | Status                                                      |
| ----------------------------- | ----------------------------------------------------------- |
| Staging dry-run (SELECT-only) | **PASS** (2026-07-07)                                       |
| Job implementation in repo    | **DONE (T3-1)** — DRY_RUN default; DELETE gated             |
| Cron stub                     | **DONE (T3-3)** — `job:gap-retention:cron` forces dry-run   |
| Live DELETE                   | **SKIPPED (T3-4)** — reopen later with `GAP delete approve` |

**Ordered patches:**

- T3-0…T3-3 → **DONE**
- T3-4 Live DELETE → **SKIPPED** (2026-07-26)
- T3-5 Prod retention review — pre-launch (with Track 4)

### Track 4 — Pre-launch infra bundle — **LATER (do not start now)**

Company email · CF www/Pages · Pro/backup · production gate.  
(See Deferred table above.)  
**Plain meaning:** Public launch തയ്യാറെടുപ്പ് (email, DNS, backup) — daily coding അല്ല.

### Track 5 — Global UX / Premium polish — **DEFERRED** (do not start now)

**Founder lock:** Deferred while Group Join / Auth Bridge is ACTIVE. Do not forget.

| Item                                                                         | Why                                                                  |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| No hardcoded currency symbols (`₹`, etc.) anywhere — Job Mitra is **global** | Planner already has ₹ in finance/roster; full-repo audit + fix       |
| Phone inputs: country selector + local number — never force `+91`            | Shift Ops DualVerify placeholder `+91…` is wrong for global          |
| Shift Ops invite / dual-verify / related pages → ultra-premium luxury UI     | Current page is base scaffold only; redesign after functional tracks |

**Start only when founder says:** `Global UX തുടങ്ങൂ`

### Track — Group Join / Onboarding + Auth Bridge — **PATCHES COMPLETE** (2026-07-26)

**Canonical live note:** `workmitra-master-docs/architecture/evidence/TRACK_GROUP_JOIN_LIVE_NOTE.md`  
**SQL apply runbook:** `GROUP_JOIN_GJ1_SQL_APPLY.md` (LOCKED until **`apply`**)  
**Domain:** `shift_ops`; Group ID = `sites.id`

| Finding                               | Status                                              |
| ------------------------------------- | --------------------------------------------------- |
| GJ-0 Live note + board                | **DONE**                                            |
| GJ-1 Static link + Daily OTP SQL + FE | **DONE** — SQL **APPLIED** (verify tables=2, fns=6) |
| GJ-2 Deep-link orchestration          | **DONE**                                            |
| GJ-3 Auth bridge                      | **DONE** (API `SUPABASE_*` env required for live)   |
| GJ-4 Error UX + smoke                 | **DONE** — `GROUP_JOIN_GJ4_SMOKE.md`                |

---

## Recommended continuation (one at a time)

| Order    | Item                                                        | Status / say                                                                                     |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1        | T2-6 Browser env + invite smoke                             | **DONE**                                                                                         |
| 2        | T2-7 OTP Edge deploy                                        | **PARKED** — **`T2-7 resume`**                                                                   |
| 3        | Track 3 Phase 2.1                                           | **CLOSED** — T3-4 skipped                                                                        |
| **NOW**  | **Group Join / Auth Bridge**                                | **GJ-0…GJ-4 DONE** — optional: set API `SUPABASE_*` + UI smoke; or Track 4 / `Global UX തുടങ്ങൂ` |
| 4        | Track 4 pre-launch (email/DNS/backup)                       | **Not now** — **`Track 4 തുടങ്ങൂ`**                                                              |
| 5 (last) | Track 5 Global UX / premium polish                          | **DEFERRED** — **`Global UX തുടങ്ങൂ`**                                                           |
| **v2.1** | Live attendance / settlement payout / venue+durable ratings | **ROADMAP ONLY** — **`v2.1 തുടങ്ങൂ`**                                                            |

---

## Hard locks (always)

- No SQL migrations / DB deletes without explicit instruction
- No auth_* table changes
- No production deploy approve from this board alone
- No company email chase in daily sessions
- No `service_role` in frontend / chat

---

## Change log

| Date       | Change                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-26 | Board created. Email/CF cosmetics deferred to pre-launch. Active = Track 1 Planner.                                                                                                                                            |
| 2026-07-26 | Track 1 inventory through T1-5. Track 1 COMPLETE.                                                                                                                                                                              |
| 2026-07-26 | Track 2 ACTIVE. Shift Ops inventory + `SHIFT_OPS_LIVE_STATE_NOTE.md`. T2-0 DONE. Next = T2-1.                                                                                                                                  |
| 2026-07-26 | T2-1 DONE. Router/nav flagged. Next = T2-2 OTP Edge. SQL still LOCKED.                                                                                                                                                         |
| 2026-07-26 | T2-2 DONE. OTP Edge stub + design. Next = T2-3 pepper (operator). SQL still LOCKED.                                                                                                                                            |
| 2026-07-26 | T2-3 DONE (runbook). Live pepper SET after T2-4. Next = explicit “apply” for T2-4.                                                                                                                                             |
| 2026-07-26 | T2-4 apply ATTEMPTED/BLOCKED. localhost ECONNREFUSED; need SHIFT_OPS_DATABASE_URL or SQL Editor.                                                                                                                               |
| 2026-07-26 | T2-4 DONE via SQL Editor (Phase 0+1). Next = expose shift_ops + pepper + T2-5.                                                                                                                                                 |
| 2026-07-26 | Exposed schemas 3/3 includes shift_ops (screenshot). Next = Save + pepper.                                                                                                                                                     |
| 2026-07-26 | Pepper ready=true verified. Next = T2-5 smoke.                                                                                                                                                                                 |
| 2026-07-26 | T2-5 IN PROGRESS. Smoke SQL pack ready. Awaiting operator Run.                                                                                                                                                                 |
| 2026-07-26 | T2-5 SQL smoke PASS. Track 2 SQL path COMPLETE. App env deferred.                                                                                                                                                              |
| 2026-07-26 | Route map clarified: T2-6 → T2-7 → Track 3. Track 4 deferred.                                                                                                                                                                  |
| 2026-07-26 | T2-6 started. Browser smoke doc ready. Awaiting operator env + invite page.                                                                                                                                                    |
| 2026-07-26 | T2-6 PASS (invite page UI). Next = T2-7.                                                                                                                                                                                       |
| 2026-07-26 | Track 5 Global UX parked (currency/phone/premium). Finish pending first; polish last.                                                                                                                                          |
| 2026-07-26 | T2-7 started. Edge deploy runbook ready. Awaiting link/secrets/deploy.                                                                                                                                                         |
| 2026-07-26 | T2-7 PARKED (CLI login deferred). Next = Track 3 or T2-7 resume.                                                                                                                                                               |
| 2026-07-26 | Login section stays pending (private-window testing). Continue route → Track 3 next.                                                                                                                                           |
| 2026-07-26 | Track 3 ACTIVE. T3-0 DONE. Next = T3-1 (DRY_RUN jobs).                                                                                                                                                                         |
| 2026-07-26 | T3-1 DONE. GAP jobs in repo. Next = T3-2 dry-run on DB.                                                                                                                                                                        |
| 2026-07-26 | T3-2 BLOCKED (localhost ECONNREFUSED). Unblock DB or park → T3-3.                                                                                                                                                              |
| 2026-07-26 | T3-2 PASS (Docker postgres started). Next = T3-3.                                                                                                                                                                              |
| 2026-07-26 | T3-3 DONE (cron stub forces dry-run). T3-4 LOCKED until `GAP delete approve`.                                                                                                                                                  |
| 2026-07-26 | Founder: skip unclear T3-4 + T2-7 for now. T3-4 SKIPPED; Track 3 CLOSED; T2-7 PARKED. Daily queue empty → choose Track 4 or Track 5.                                                                                           |
| 2026-07-26 | Group Join track ACTIVE. Track 5 DEFERRED. GJ-0+GJ-1 DONE (SQL apply LOCKED). Next = GJ-2.                                                                                                                                     |
| 2026-07-26 | GJ-2 DONE (pending group join deep-link). Next = GJ-3 auth bridge.                                                                                                                                                             |
| 2026-07-26 | GJ-3 DONE (JM→Supabase auth bridge in repo). Next = GJ-4 or apply.                                                                                                                                                             |
| 2026-07-26 | GJ-1 apply AUTHORIZED; BLOCKED on Supabase login / local missing shift_ops. Operator: SQL Editor Run + say GJ-1 SQL applied.                                                                                                   |
| 2026-07-26 | GJ-1 SQL APPLIED (verify PASS tables=2 fns=6). Next = GJ-4.                                                                                                                                                                    |
| 2026-07-26 | GJ-4 DONE (error UX + smoke checklist). Group Join track patches complete.                                                                                                                                                     |
| 2026-07-26 | Board Double Audit APPROVED (condition: API SUPABASE_*). See GROUP_JOIN_BOARD_DOUBLE_AUDIT.md.                                                                                                                                 |
| 2026-07-27 | **v2.0 descope:** Live Attendance (QR/timers), Settlement/Payout queues, Venue ratings + durable trust sync → **WorkMitra v2.1 Future Roadmap**. v2.0 focus = Post → Recruit → Group → Privacy Call/Chat → Complete → Reviews. |
