# Track — Group Join / Onboarding + Auth Bridge (Live Note)

> **Purpose:** Static group link/QR + employer Daily OTP (Group ID) + deep-link join + Job Mitra↔Supabase auth bridge.  
> **Companions:** `PENDING_WORK_BOARD.md` · `SHIFT_OPS_LIVE_STATE_NOTE.md` · `GROUP_JOIN_GJ3_AUTH_BRIDGE.md` · migration `202607260001_shift_ops_static_link_daily_otp.sql`  
> **Domain:** `shift_ops` only. **Group ID = `sites.id`**. Not Workforce localStorage groups.  
> **Rule:** Do not apply SQL until founder says **`apply`**. Track 5 Global UX deferred.

**Last verified:** 2026-07-26 (Board double-audit **APPROVED with condition**; GJ-0…GJ-4 complete)  
**Overall status:** **BOARD APPROVED** — live join gated on API `SUPABASE_*` + auth backend.  
**Production:** **NOT APPROVED**

---

## 1. Current truth

| Item                               | Status                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Group ID mapping                   | `shift_ops.sites.id`                                                        |
| Static link + Daily OTP SQL        | **APPLIED** (2026-07-26) — verify tables=2, fns=6                           |
| FE manager mint + worker join gate | **IN REPO** (GJ-1)                                                          |
| Deep-link install→profile→join     | **DONE** (GJ-2)                                                             |
| Job Mitra ↔ Supabase auth bridge   | **IN REPO** (GJ-3) — needs API `SUPABASE_*` secrets                         |
| Error UX polish + smoke checklist  | **DONE** (GJ-4) — `GROUP_JOIN_GJ4_SMOKE.md`                                 |
| GJ-4 remote SQL re-smoke           | **PENDING operator** — local blocked; prior GJ-1 verify PASS                |
| Live join (API bridge env)         | **NOT READY** — FE client READY; API `SUPABASE_*` MISSING; auth backend off |
| Executive board double-audit       | **APPROVED (with condition)** — `GROUP_JOIN_BOARD_DOUBLE_AUDIT.md`          |
| Track 5 Global UX                  | **DEFERRED**                                                                |

### Files (GJ-1)

- `supabase/migrations/202607260001_shift_ops_static_link_daily_otp.sql`
- `src/features/shiftOps/services/groupDailyOtp.service.ts`
- `src/features/shiftOps/components/ShiftOpsGroupAccessCard.tsx`
- `src/features/shiftOps/helpers/groupJoinErrors.ts`
- Apply runbook: `GROUP_JOIN_GJ1_SQL_APPLY.md` (say **`apply`** only)

### Files (GJ-2)

- `src/features/shiftOps/storage/pendingGroupJoin.storage.ts`
- `src/features/shiftOps/helpers/groupJoinDeepLink.ts`
- Updated: `pendingRoute.ts`, `ProtectedRoute.tsx`, invite/home/profile

### Files (GJ-3)

- `server/modules/auth/supabaseBridge.service.ts`
- `POST /v1/jobmitra/auth/supabase-bridge`
- `src/features/shiftOps/services/authBridge.service.ts`
- Wired on login/hydrate/logout + Shift Ops RPC services
- Runbook: `GROUP_JOIN_GJ3_AUTH_BRIDGE.md`

### Product rules encoded

- Static link/QR does not expire with the calendar day (until revoke/rotate).
- Final join requires **today’s** Active Daily OTP bound to Group ID.
- Deep-link: onboarding → profile → invite.
- Auth bridge: JM cookie → Supabase JWT so `auth.uid()` works (no service_role in FE).

---

## 2. Ordered patches

| #    | Patch                            | Status                                   |
| ---- | -------------------------------- | ---------------------------------------- |
| GJ-0 | Live note + board                | **DONE**                                 |
| GJ-1 | Daily OTP + static link SQL + FE | **DONE** — SQL **APPLIED** (verify PASS) |
| GJ-2 | Deep-link orchestration          | **DONE**                                 |
| GJ-3 | Auth bridge                      | **DONE** (env configure separately)      |
| GJ-4 | Error UX + smoke after apply     | **DONE** — `GROUP_JOIN_GJ4_SMOKE.md`     |

---

## 3. Hard locks

- No SQL apply without explicit **`apply`**
- No `service_role` in frontend / chat
- No Track 5 polish in this track
- Do not mix Career / Planner / Workforce group state

---

## 4. Change log

| Date       | Who              | What                                                                                                                             |
| ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-26 | Founder + Cursor | Track started. GJ-0 DONE. GJ-1 SQL+FE in repo (not applied). Next = GJ-2.                                                        |
| 2026-07-26 | Founder + Cursor | GJ-1 verify: groupJoinErrors unit test PASS; SQL apply still LOCKED.                                                             |
| 2026-07-26 | Founder + Cursor | GJ-2 DONE: pending group join stash + post-auth/profile orchestration. Next = GJ-3.                                              |
| 2026-07-26 | Founder + Cursor | GJ-3 DONE: JM→Supabase bridge API + FE ensureShiftOpsAuthSession. Next = GJ-4 or apply.                                          |
| 2026-07-26 | Founder + Cursor | GJ-1 apply AUTHORIZED but BLOCKED: local no shift_ops; Supabase sign-in required. See GROUP_JOIN_GJ1_SQL_APPLY_ATTEMPT.md        |
| 2026-07-26 | Founder + Cursor | GJ-1 SQL APPLIED on jobmitra-enterprise-v2-dev. Verify PASS tables=2 fns=6. Next = GJ-4.                                         |
| 2026-07-26 | Founder + Cursor | GJ-4 DONE: classify/terminal empty UX + smoke checklist. Track functionally complete pending API bridge env + optional UI smoke. |
| 2026-07-26 | Founder + Cursor | Executive Board Double Audit recorded — APPROVED with Architect condition (API SUPABASE_*).                                      |
