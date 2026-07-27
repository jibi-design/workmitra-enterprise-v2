# Group Join GJ-1 — SQL apply runbook

> Companion: `TRACK_GROUP_JOIN_LIVE_NOTE.md`  
> Migration: `supabase/migrations/202607260001_shift_ops_static_link_daily_otp.sql`  
> Attempt record: `GROUP_JOIN_GJ1_SQL_APPLY_ATTEMPT.md`

**Status:** **APPLIED** (2026-07-26) on `jobmitra-enterprise-v2-dev` via SQL Editor.  
Verify: `shift_ops_gj1_verify.sql` → **tables=2**, **fns=6** (screenshot confirmed).

---

## What this added

- Tables: `shift_ops.site_static_links`, `shift_ops.site_daily_otps`
- RPCs: `ensure_site_static_link`, `rotate_site_static_link`, `rotate_site_daily_otp`, `site_daily_otp_status`, `peek_group_from_static_link`, `join_site_via_group_link`

---

## Re-verify (optional)

```sql
-- supabase/smoke/shift_ops_gj1_verify.sql
-- expect tables n=2, fns n=6
```

Never paste pepper / service_role into chat.

---

## Next

`GJ-4 തുടങ്ങൂ` — error UX + end-to-end smoke (still needs GJ-3 API `SUPABASE_*` for reliable auth.uid()).
