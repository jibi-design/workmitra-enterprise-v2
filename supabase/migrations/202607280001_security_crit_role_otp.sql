-- CRIT-2 / CRIT-3 forward patch for databases that already applied Phase 0+1.
-- Safe to re-run (CREATE OR REPLACE + REVOKE / DROP POLICY IF EXISTS).

begin;

-- CRIT-2: lock self-registration to worker only
create or replace function shift_ops.ensure_so_user(p_role shift_ops.so_role default 'worker')
returns uuid
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  uid uuid;
  aid uuid := auth.uid();
begin
  if aid is null then
    raise exception 'not_authenticated';
  end if;

  select id into uid from shift_ops.users where auth_user_id = aid;
  if uid is not null then
    return uid;
  end if;

  if p_role <> 'worker' then
    raise exception 'role_escalation_forbidden'
      using hint = 'Only service_role (or ops SQL) may assign non-worker roles. Self-registration is worker only.';
  end if;

  insert into shift_ops.users (auth_user_id, role)
  values (aid, p_role)
  returning id into uid;

  return uid;
end;
$$;

revoke all on function shift_ops.ensure_so_user(shift_ops.so_role) from public;
grant execute on function shift_ops.ensure_so_user(shift_ops.so_role) to authenticated;

-- CRIT-3: no client SELECT on OTP base table (otp_hash)
drop policy if exists so_otp_select_own on shift_ops.channel_otp_challenges;
revoke select on shift_ops.channel_otp_challenges from authenticated;

create or replace view shift_ops.otp_challenges_safe
with (security_invoker = true)
as
select
  id,
  channel_id,
  purpose,
  expires_at,
  attempts,
  max_attempts,
  consumed_at,
  created_at
from shift_ops.channel_otp_challenges;

grant select on shift_ops.otp_challenges_safe to authenticated;

commit;
