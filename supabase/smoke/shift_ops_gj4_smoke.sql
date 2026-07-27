-- Job Mitra | GJ-4 SQL smoke (read-only checks after GJ-1 apply)
-- Safe: SELECT / catalog only. No DELETE.

-- 1) Objects present
select 'tables' as kind, count(*)::int as n
from information_schema.tables
where table_schema = 'shift_ops'
  and table_name in ('site_static_links', 'site_daily_otps')
union all
select 'fns' as kind, count(*)::int as n
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'shift_ops'
  and p.proname in (
    'ensure_site_static_link',
    'rotate_site_static_link',
    'rotate_site_daily_otp',
    'site_daily_otp_status',
    'peek_group_from_static_link',
    'join_site_via_group_link'
  );

-- 2) Exception names exist in function bodies (spot-check)
select p.proname,
  (p.prosrc ilike '%group_deleted%') as mentions_group_deleted,
  (p.prosrc ilike '%daily_otp_invalid%') as mentions_daily_otp_invalid,
  (p.prosrc ilike '%group_inactive%') as mentions_group_inactive
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'shift_ops'
  and p.proname = 'join_site_via_group_link';
