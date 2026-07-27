-- Job Mitra | Shift Ops — active roster assignment columns + reassign RPC
-- File: supabase/migrations/202607260004_shift_ops_roster_reassign.sql
-- Scope: Group/zone/crew-role reassignment WITHOUT resetting membership status
-- or touching pending_shift_assignments / check-in ledgers.

begin;

-- Operational assignment fields (NOT so_role worker|manager|admin)
alter table shift_ops.site_memberships
  add column if not exists assignment_zone text not null default 'General';

alter table shift_ops.site_memberships
  add column if not exists crew_role text not null default 'Staff';

alter table shift_ops.site_memberships
  add column if not exists jobmitra_ml_id text;

alter table shift_ops.site_memberships
  add column if not exists last_reassign_note text;

alter table shift_ops.site_memberships
  add column if not exists last_reassigned_at timestamptz;

comment on column shift_ops.site_memberships.assignment_zone is
  'On-shift zone/bucket within or across managed groups (e.g. Zone A).';

comment on column shift_ops.site_memberships.crew_role is
  'Operational crew role (Staff / Team Supervisor). Independent of so_role.';

comment on column shift_ops.site_memberships.jobmitra_ml_id is
  'Optional Mitra Lab id for in-app CallButton routing (never phone).';

-- Manager roster: active (ready_for_assignment) members for a group/site
create or replace function shift_ops.list_active_group_roster(p_site_id uuid)
returns table (
  membership_id uuid,
  site_id uuid,
  site_name text,
  worker_user_id uuid,
  display_name text,
  status shift_ops.so_membership_status,
  assignment_zone text,
  crew_role text,
  jobmitra_ml_id text,
  last_reassign_note text,
  last_reassigned_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = shift_ops, public, auth
as $$
begin
  perform shift_ops.assert_site_manager(p_site_id);

  return query
  select
    sm.id,
    sm.site_id,
    s.name,
    sm.worker_user_id,
    coalesce(nullif(trim(u.display_name), ''), 'Worker'),
    sm.status,
    sm.assignment_zone,
    sm.crew_role,
    sm.jobmitra_ml_id,
    sm.last_reassign_note,
    sm.last_reassigned_at,
    sm.created_at,
    sm.updated_at
  from shift_ops.site_memberships sm
  join shift_ops.sites s on s.id = sm.site_id
  join shift_ops.users u on u.id = sm.worker_user_id
  where sm.site_id = p_site_id
    and sm.status = 'ready_for_assignment'
  order by sm.updated_at desc;
end;
$$;

revoke all on function shift_ops.list_active_group_roster(uuid) from public;
grant execute on function shift_ops.list_active_group_roster(uuid) to authenticated;
grant execute on function shift_ops.list_active_group_roster(uuid) to service_role;

-- Reassign group (site) and/or zone + crew role. Never resets status or shift tracking.
create or replace function shift_ops.reassign_worker_group_and_role(
  p_membership_id uuid,
  p_target_site_id uuid,
  p_assignment_zone text default null,
  p_crew_role text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = shift_ops, public, auth
as $$
declare
  caller uuid := shift_ops.current_so_user_id();
  sm shift_ops.site_memberships%rowtype;
  target_site shift_ops.sites%rowtype;
  zone_v text;
  role_v text;
  note_v text;
  conflict_id uuid;
begin
  if caller is null then
    raise exception 'not_authenticated';
  end if;

  if p_membership_id is null then
    raise exception 'membership_required';
  end if;

  if p_target_site_id is null then
    raise exception 'target_site_required';
  end if;

  select * into sm
  from shift_ops.site_memberships
  where id = p_membership_id
  for update;

  if sm.id is null then
    raise exception 'membership_not_found';
  end if;

  if sm.status <> 'ready_for_assignment' then
    raise exception 'membership_not_active';
  end if;

  -- Manager of current group OR target group may reassign
  begin
    perform shift_ops.assert_site_manager(sm.site_id);
  exception
    when others then
      perform shift_ops.assert_site_manager(p_target_site_id);
  end;

  perform shift_ops.assert_site_manager(p_target_site_id);

  select * into target_site
  from shift_ops.sites
  where id = p_target_site_id;

  if target_site.id is null then
    raise exception 'site_not_found';
  end if;

  if target_site.is_active is not true then
    raise exception 'site_inactive';
  end if;

  zone_v := coalesce(nullif(trim(p_assignment_zone), ''), sm.assignment_zone, 'General');
  role_v := coalesce(nullif(trim(p_crew_role), ''), sm.crew_role, 'Staff');
  note_v := nullif(trim(p_note), '');

  if p_target_site_id <> sm.site_id then
    select id into conflict_id
    from shift_ops.site_memberships
    where site_id = p_target_site_id
      and worker_user_id = sm.worker_user_id
      and id <> sm.id;

    if conflict_id is not null then
      raise exception 'worker_already_in_target_group';
    end if;
  end if;

  update shift_ops.site_memberships
  set site_id = p_target_site_id,
      assignment_zone = zone_v,
      crew_role = role_v,
      last_reassign_note = note_v,
      last_reassigned_at = now(),
      updated_at = now()
      -- status intentionally unchanged (preserves ready_for_assignment)
      -- pending_shift_assignments / check-ins are never touched here
  where id = sm.id
  returning * into sm;

  return jsonb_build_object(
    'ok', true,
    'membership_id', sm.id,
    'site_id', sm.site_id,
    'site_name', target_site.name,
    'worker_user_id', sm.worker_user_id,
    'status', sm.status,
    'assignment_zone', sm.assignment_zone,
    'crew_role', sm.crew_role,
    'jobmitra_ml_id', sm.jobmitra_ml_id,
    'last_reassign_note', sm.last_reassign_note,
    'last_reassigned_at', sm.last_reassigned_at
  );
end;
$$;

revoke all on function shift_ops.reassign_worker_group_and_role(uuid, uuid, text, text, text) from public;
grant execute on function shift_ops.reassign_worker_group_and_role(uuid, uuid, text, text, text) to authenticated;
grant execute on function shift_ops.reassign_worker_group_and_role(uuid, uuid, text, text, text) to service_role;

commit;
