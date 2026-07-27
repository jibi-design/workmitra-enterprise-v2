# Shift Ops OTP Edge Design — T2-2

> **Status:** Stub **in repo** (T2-2). SQL **applied**. Pepper **ready**. Deploy = **T2-7** (in progress). Providers still not wired.  
> **Companion:** `SHIFT_OPS_LIVE_STATE_NOTE.md` · `SHIFT_OPS_T2_7_EDGE_DEPLOY.md`

## Split of responsibility

| Step        | Owner                                    | Notes                                                                       |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| Request OTP | FE → RPC `shift_ops.request_channel_otp` | Creates hash challenge + encrypted outbox row. **No plaintext to browser.** |
| Send OTP    | Edge `shift-ops-otp-dispatch`            | service_role / cron secret. Decrypts + (later) provider send.               |
| Verify OTP  | FE → RPC `shift_ops.verify_channel_otp`  | Client submits code; hash compare in Postgres. **No Edge verify.**          |

## Flow

1. Worker registers work mobile/email → `upsert_work_channel` (ciphertext in `channel_secrets`).
2. UI calls `request_channel_otp` → row in `channel_otp_challenges` (otp_hash only) + `otp_delivery_outbox` (`delivery_ciphertext` = pgp_sym_encrypt(code)).
3. Cron/operator POSTs Edge Function → claims `queued` → `otp_dispatch_decrypt_bundle` → stub log / future SMS-email → clear ciphertext, status `sent`.
4. Worker enters code → `verify_channel_otp` → channel `verified`.

## Hard rules

- Never put `service_role` in Vite/frontend.
- Never return plaintext OTP from RPC to browser.
- Never grant `otp_delivery_outbox` / `channel_secrets` / `otp_dispatch_decrypt_bundle` to `anon`/`authenticated`.
- Stub mode (`SHIFT_OPS_OTP_STUB=1`) marks sent without transmitting — safe until providers + pepper (T2-3).
- Set `channel_pepper` only via `SHIFT_OPS_CHANNEL_PEPPER_OPERATOR_RUNBOOK.md` (never commit / never paste in chat).

## Files

- Edge: `supabase/functions/shift-ops-otp-dispatch/index.ts`
- SQL draft (patched in T2-2): `supabase/migrations/202607240002_shift_ops_phase1_onboarding_approval.sql`
- FE (unchanged RPC clients): `src/features/shiftOps/services/onboarding.service.ts`

## Deploy (T2-7)

See `SHIFT_OPS_T2_7_EDGE_DEPLOY.md` — stub mode first; providers later.
