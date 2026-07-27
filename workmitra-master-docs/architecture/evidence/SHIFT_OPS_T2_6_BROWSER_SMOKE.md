# Shift Ops T2-6 — Browser env + invite smoke

> **Companion:** `SHIFT_OPS_LIVE_STATE_NOTE.md` · `SUPABASE_OPERATOR_UI_NAV_NOTE.md`  
> **Hard rule:** Never paste `VITE_SUPABASE_ANON_KEY`, service_role, or pepper into chat / notes.

**Status:** **DONE / PASS** (2026-07-26)  
**Goal:** App can load Shift Ops invite landing with live env configured.

---

## Success criteria

| #   | Check                               | Result                                        |
| --- | ----------------------------------- | --------------------------------------------- |
| 1   | `.env.local` has URL + anon key     | PASS (operator `env set`; key names verified) |
| 2   | Dev server restarted after env      | PASS (operator)                               |
| 3   | Open `/#/employee/shift-ops/invite` | PASS (screenshot)                             |
| 4   | Dual Verify + Site invite UI        | PASS — “Verify work channels” + Invite token  |
| 5   | Shift Ops nav visible               | PASS (bottom nav)                             |

Out of scope (expected not done here): OTP send delivery, real invite join, Edge deploy (T2-7).

---

## Result log

| Date       | Step                   | Result   |
| ---------- | ---------------------- | -------- |
| 2026-07-26 | Doc + steps            | READY    |
| 2026-07-26 | Operator env           | PASS     |
| 2026-07-26 | Invite page screenshot | **PASS** |
| 2026-07-26 | **T2-6**               | **DONE** |
