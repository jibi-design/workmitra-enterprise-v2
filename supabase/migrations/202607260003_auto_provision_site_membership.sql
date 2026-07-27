-- Job Mitra | P1-FIX-4 — auto_provision_site_membership
-- Schema-correct upsert into shift_ops.site_memberships (NO plan_id / worker_ml columns).
-- DO NOT apply until founder says "apply" for this migration.
--
-- After planner/shift employer confirm: site manager session may provision
-- worker membership as pending_manager_approval (invite/group-join parity).
-- Existing ready_for_assignment rows are left untouched.

create extension if not exists pgcrypto with schema extensions;

-- Ensure SO user row for an arbitrary auth.users id (not only auth.uid()).
create or replace function shift_ops.ensure_so_user_for_auth(
  p_auth_user_id uuid,
  p_role shift_ops.so_role default 'worker'
)
returns uuid
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  uid uuid;
begin
  if p_auth_user_id is null then
    raise exception 'auth_user_required';
  end if;

  select id into uid
  from shift_ops.users
  where auth_user_id = p_auth_user_id;

  if uid is not null then
    return uid;
  end if;

  insert into shift_ops.users (auth_user_id, role)
  values (p_auth_user_id, p_role)
  returning id into uid;

  return uid;
end;
$$;

revoke all on function shift_ops.ensure_so_user_for_auth(uuid, shift_ops.so_role) from public;
grant execute on function shift_ops.ensure_so_user_for_auth(uuid, shift_ops.so_role) to authenticated;
grant execute on function shift_ops.ensure_so_user_for_auth(uuid, shift_ops.so_role) to service_role;

create or replace function shift_ops.auto_provision_site_membership(
  p_site_id uuid,
  p_worker_auth_user_id uuid default null,
  p_jobmitra_user_id text default null,
  p_jobmitra_ml_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = shift_ops, public, auth
as $$
declare
  caller_so uuid := shift_ops.current_so_user_id();
  site_manager uuid;
  site_active boolean;
  worker_auth uuid;
  worker_so uuid;
  mid uuid;
  jm_user text := nullif(trim(p_jobmitra_user_id), '');
  jm_ml text := nullif(upper(trim(p_jobmitra_ml_id)), '');
begin
  if caller_so is null then
    raise exception 'not_authenticated';
  end if;

  if p_site_id is null then
    raise exception 'site_required';
  end if;

  select s.manager_user_id, s.is_active
    into site_manager, site_active
  from shift_ops.sites s
  where s.id = p_site_id;

  if site_manager is null then
    raise exception 'site_not_found';
  end if;

  if site_active is not true then
    raise exception 'site_inactive';
  end if;

  if site_manager <> caller_so then
    raise exception 'not_site_manager';
  end if;

  worker_auth := p_worker_auth_user_id;

  if worker_auth is null and jm_user is not null then
    select u.id into worker_auth
    from auth.users u
    where u.raw_user_meta_data->>'jobmitra_user_id' = jm_user
    limit 1;
  end if;

  if worker_auth is null and jm_ml is not null then
    select u.id into worker_auth
    from auth.users u
    where upper(trim(u.raw_user_meta_data->>'jobmitra_ml_id')) = jm_ml
    limit 1;
  end if;

  if worker_auth is null then
    raise exception 'worker_auth_unresolved';
  end if;

  worker_so := shift_ops.ensure_so_user_for_auth(worker_auth, 'worker');

  insert into shift_ops.site_memberships (site_id, worker_user_id, invite_id, status)
  values (p_site_id, worker_so, null, 'pending_manager_approval')
  on conflict (site_id, worker_user_id) do update
    set status = case
          when site_memberships.status = 'ready_for_assignment'
            then site_memberships.status
          else 'pending_manager_approval'::shift_ops.so_membership_status
        end,
        invite_id = site_memberships.invite_id,
        decided_by = case
          when site_memberships.status = 'ready_for_assignment'
            then site_memberships.decided_by
          else null
        end,
        decided_at = case
          when site_memberships.status = 'ready_for_assignment'
            then site_memberships.decided_at
          else null
        end,
        reject_reason = case
          when site_memberships.status = 'ready_for_assignment'
            then site_memberships.reject_reason
          else null
        end,
        updated_at = now()
  returning id into mid;

  return mid;
end;
$$;

comment on function shift_ops.auto_provision_site_membership(uuid, uuid, text, text) is
  'P1-FIX-4: site manager provisions worker membership pending_manager_approval. No plan_id column.';

revoke all on function shift_ops.auto_provision_site_membership(uuid, uuid, text, text) from public;
grant execute on function shift_ops.auto_provision_site_membership(uuid, uuid, text, text) to authenticated;
grant execute on function shift_ops.auto_provision_site_membership(uuid, uuid, text, text) to service_role;
