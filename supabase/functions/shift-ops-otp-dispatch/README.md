# shift-ops-otp-dispatch

Supabase Edge Function stub for Shift Ops OTP **delivery** (not verify).

See: `workmitra-master-docs/architecture/evidence/SHIFT_OPS_OTP_EDGE_DESIGN.md`

## Local invoke (after project linked + SQL applied)

```bash
supabase functions serve shift-ops-otp-dispatch --env-file supabase/.env.local
curl -X POST http://127.0.0.1:54321/functions/v1/shift-ops-otp-dispatch \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Do not commit `.env.local` or service_role keys.
