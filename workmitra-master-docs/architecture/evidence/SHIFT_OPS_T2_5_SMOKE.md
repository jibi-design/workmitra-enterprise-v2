# Shift Ops T2-5 Smoke — post-apply

> **Companion:** `SHIFT_OPS_LIVE_STATE_NOTE.md`  
> **SQL pack:** `supabase/smoke/shift_ops_t2_5_smoke.sql`  
> **Hard rule:** Never paste pepper, service_role, or DB passwords into chat.

**Started:** 2026-07-26  
**Closed (SQL):** 2026-07-26 — **PASS**  
**Target:** `jobmitra-enterprise-v2-dev`

---

## A. Already verified (before this smoke)

| Check                                         | Result                         |
| --------------------------------------------- | ------------------------------ |
| Phase 0+1 SQL applied (SQL Editor)            | PASS                           |
| Exposed schemas includes `shift_ops` (3 of 3) | PASS                           |
| `is_channel_pepper_ready()`                   | PASS (`true`)                  |
| Router/nav behind `showShiftOpsFeatures`      | PASS (T2-1)                    |
| OTP Edge stub in repo                         | PASS (not deployed — expected) |

---

## B. Live SQL smoke — **PASS**

### Part 1 (full pack — visible columns)

| Column              | Expect | Actual |
| ------------------- | ------ | ------ |
| schema_ok           | true   | true   |
| table_count         | ≥ 10   | 13     |
| pepper_ready        | true   | true   |
| core_fn_count       | ≥ 12   | 13     |
| channel_secrets_rls | true   | true   |
| otp_outbox_rls      | true   | true   |

### Part 2 (privilege follow-up)

| Column                        | Expect | Actual |
| ----------------------------- | ------ | ------ |
| anon_can_select_secrets       | false  | false  |
| auth_can_select_secrets       | false  | false  |
| anon_can_select_outbox        | false  | false  |
| auth_can_select_outbox        | false  | false  |
| auth_can_select_channels_safe | true   | true   |
| channels_safe_view_ok         | true   | true   |

---

## C. App env smoke — **DEFERRED**

Needs local (gitignored):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (publishable/anon — not service_role)

Then DEV open `/employee/shift-ops/invite`.  
Not required to close Track 2 SQL gate; do when wiring browser client.

---

## D. Out of scope for T2-5

- Deploy OTP Edge Function
- Twilio / Resend send
- Production approve

---

## E. Result log

| Date       | Area                | Result          |
| ---------- | ------------------- | --------------- |
| 2026-07-26 | Pre-checks A        | PASS            |
| 2026-07-26 | Repo `tsc` + routes | PASS            |
| 2026-07-26 | Live SQL B part 1+2 | **PASS**        |
| 2026-07-26 | App env C           | DEFERRED        |
| 2026-07-26 | **T2-5 SQL smoke**  | **DONE / PASS** |
