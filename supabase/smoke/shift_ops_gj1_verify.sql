-- Job Mitra | GJ-1 post-apply verify (run after migration)
-- Expect: tables 2, functions 6

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
