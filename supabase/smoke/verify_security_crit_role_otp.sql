-- WorkMitra — verify CRIT-2 / CRIT-3 after 202607280001_security_crit_role_otp.sql
-- Paste into Supabase SQL Editor → Run. Expect all status = PASS.

-- 1) CRIT-2: ensure_so_user must block non-worker self-registration
select
  'CRIT2_role_lock' as check_id,
  case
    when pg_get_functiondef(p.oid) ilike '%role_escalation_forbidden%'
     and pg_get_functiondef(p.oid) ilike '%p_role <> ''worker''%'
    then 'PASS'
    else 'FAIL'
  end as status
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'shift_ops'
  and p.proname = 'ensure_so_user'
limit 1;

-- 2) CRIT-3: authenticated must NOT have SELECT on OTP base table (otp_hash)
select
  'CRIT3_base_table_select_revoked' as check_id,
  case
    when has_table_privilege('authenticated', 'shift_ops.channel_otp_challenges', 'SELECT')
    then 'FAIL'
    else 'PASS'
  end as status;

-- 3) CRIT-3: authenticated must HAVE SELECT on safe view
select
  'CRIT3_safe_view_select_granted' as check_id,
  case
    when has_table_privilege('authenticated', 'shift_ops.otp_challenges_safe', 'SELECT')
    then 'PASS'
    else 'FAIL'
  end as status;

-- 4) Safe view must not expose otp_hash column
select
  'CRIT3_safe_view_no_otp_hash' as check_id,
  case
    when exists (
      select 1
      from information_schema.columns
      where table_schema = 'shift_ops'
        and table_name = 'otp_challenges_safe'
        and column_name = 'otp_hash'
    )
    then 'FAIL'
    else 'PASS'
  end as status;

-- 5) Summary one-row view (optional)
select * from (
  select 'CRIT2_role_lock' as check_id,
    case when pg_get_functiondef(p.oid) ilike '%role_escalation_forbidden%' then 'PASS' else 'FAIL' end as status
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'shift_ops' and p.proname = 'ensure_so_user'
  limit 1
) s
union all
select
  'CRIT3_base_table_select_revoked',
  case when has_table_privilege('authenticated', 'shift_ops.channel_otp_challenges', 'SELECT') then 'FAIL' else 'PASS' end
union all
select
  'CRIT3_safe_view_select_granted',
  case when has_table_privilege('authenticated', 'shift_ops.otp_challenges_safe', 'SELECT') then 'PASS' else 'FAIL' end
union all
select
  'CRIT3_safe_view_no_otp_hash',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'shift_ops' and table_name = 'otp_challenges_safe' and column_name = 'otp_hash'
  ) then 'FAIL' else 'PASS' end;
