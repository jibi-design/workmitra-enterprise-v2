# Shift Ops T2-7 — OTP Edge deploy

> **Companion:** `SHIFT_OPS_OTP_EDGE_DESIGN.md` · `SHIFT_OPS_LIVE_STATE_NOTE.md` · `SUPABASE_OPERATOR_UI_NAV_NOTE.md`  
> **Hard rule:** Never paste service_role, cron secret, or pepper into chat / git.

**Status:** **PARKED** (2026-07-26)  
**Reason:** Operator uses private/incognito for testing — prefers not to do login/CLI auth steps this pass; keep pending and continue other tracks.  
**Target:** `jobmitra-enterprise-v2-dev` · function `shift-ops-otp-dispatch` (stub in repo)  
**Resume when founder says:** `T2-7 resume`

---

## Success criteria

| #   | Check                                         | Pass when                                               |
| --- | --------------------------------------------- | ------------------------------------------------------- |
| 1   | Function listed in Dashboard → Edge Functions | Name visible                                            |
| 2   | Secrets set (stub + optional cron)            | Set via CLI/Dashboard (values not in chat)              |
| 3   | POST invoke authorized                        | Returns JSON `ok: true` (empty queue → `claimed: 0` OK) |
| 4   | Unauthorized call rejected                    | 401 without secret/service bearer                       |

Out of scope: real SMS/email providers, cron schedule in production, FE calling Edge with service_role.

---

## Operator steps (one at a time)

### Step 1 — Login + link project

```bash
cd C:\projects\WorkMitra_Enterprise_v2
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

Project ref = URL subdomain (`https://PROJECT_REF.supabase.co`).  
Reply: **`linked`** (do not paste access token).

### Step 2 — Secrets

```bash
npx supabase secrets set SHIFT_OPS_OTP_STUB=1
```

Optional (recommended):

```bash
npx supabase secrets set SHIFT_OPS_CRON_SECRET=<generate-locally-do-not-chat>
```

`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are usually auto-injected for Edge; if invoke fails with `missing_supabase_env`, set them via Dashboard Secrets.  
Reply: **`secrets set`**

### Step 3 — Deploy

```bash
npx supabase functions deploy shift-ops-otp-dispatch
```

Reply: **`deployed`** or paste **non-secret** error text.

### Step 4 — Smoke invoke

Dashboard → Edge Functions → `shift-ops-otp-dispatch` → Invoke/Test with header:

- `x-shift-ops-cron-secret: <your secret>`  
  OR CLI curl with service role bearer (never paste response secrets).

Expect: `{ "ok": true, "stub": true, ... }`  
Reply: **`edge smoke ok`**

---

## Result log

| Date       | Step                     | Result                                            |
| ---------- | ------------------------ | ------------------------------------------------- |
| 2026-07-26 | Runbook                  | READY                                             |
| 2026-07-26 | CLI login/link/deploy    | **PARKED** — operator deferred login this session |
| 2026-07-26 | Secrets / Deploy / Smoke | PENDING until resume                              |
