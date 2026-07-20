-- Job Mitra / WorkMitra Enterprise v2
-- Migration: Pulse Trail Notification Backend Foundation
-- File: supabase/migrations/202606210001_create_pulse_notification_tables.sql
--
-- Purpose:
-- 1. Store notification events as backend source of truth.
-- 2. Store which authenticated users should receive each event.
-- 3. Store exact user-level resolution/read confirmation.
-- 4. Store audit logs for trust, debugging, and future admin review.
--
-- Architecture:
-- notification_events      = what happened
-- notification_recipients  = who should see it
-- notification_resolutions = when/how the user resolved it
-- audit_logs               = backend trust history
--
-- Important:
-- This migration assumes Supabase Auth is enabled.
-- User identity uses auth.users(id).

begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'app_product'
  ) then
    create type public.app_product as enum (
      'job_mitra',
      'homefix_mitra',
      'admin'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'app_role'
  ) then
    create type public.app_role as enum (
      'employee',
      'employer',
      'admin',
      'customer',
      'independent_technician',
      'shop_technician',
      'shop_owner'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'notification_domain'
  ) then
    create type public.notification_domain as enum (
      'career',
      'shift',
      'profile',
      'system'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'notification_severity'
  ) then
    create type public.notification_severity as enum (
      'INFO',
      'WARNING',
      'CRITICAL'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'notification_resolution_type'
  ) then
    create type public.notification_resolution_type as enum (
      'ROUTE',
      'INTERACTION'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'notification_recipient_status'
  ) then
    create type public.notification_recipient_status as enum (
      'unread',
      'resolved',
      'archived'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'notification_event_type'
  ) then
    create type public.notification_event_type as enum (
      'SHIFT_NEW',
      'CAREER_UPDATE',
      'NEW_APPLICATION',
      'SHIFT_CONFIRMATION',

      'SHIFT_JOB_POSTED',
      'CAREER_JOB_POSTED',
      'APPLICATION_RECEIVED',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'PROFILE_UPDATE_NEEDED',
      'OFFER_RECEIVED',
      'SHIFT_CONFIRMATION_REQUIRED',

      'SHIFT_APPLICATION_RECEIVED',
      'SHIFT_SHORTLISTED'
    );
  end if;
end $$;

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),

  product public.app_product not null default 'job_mitra',
  event_type public.notification_event_type not null,
  domain public.notification_domain not null,
  severity public.notification_severity not null,
  resolution_type public.notification_resolution_type not null,

  source_user_id uuid null references auth.users(id) on delete set null,
  source_role public.app_role null,

  target_path text not null,
  target_section_id text null,

  post_id text null,
  application_id text null,
  workspace_id text null,
  entity_type text null,

  title text null,
  message text null,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notification_events_target_path_not_empty
    check (length(trim(target_path)) > 0),

  constraint notification_events_interaction_requires_section
    check (
      resolution_type <> 'INTERACTION'
      or (
        target_section_id is not null
        and length(trim(target_section_id)) > 0
      )
    ),

  constraint notification_events_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.notification_recipients (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null references public.notification_events(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_role public.app_role not null,

  status public.notification_recipient_status not null default 'unread',

  first_seen_at timestamptz null,
  resolved_at timestamptz null,
  archived_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notification_recipients_unique_event_user
    unique (event_id, recipient_user_id),

  constraint notification_recipients_resolved_status_requires_time
    check (
      status <> 'resolved'
      or resolved_at is not null
    ),

  constraint notification_recipients_archived_status_requires_time
    check (
      status <> 'archived'
      or archived_at is not null
    )
);

create table if not exists public.notification_resolutions (
  id uuid primary key default gen_random_uuid(),

  recipient_id uuid not null references public.notification_recipients(id) on delete cascade,
  event_id uuid not null references public.notification_events(id) on delete cascade,
  resolver_user_id uuid null references auth.users(id) on delete set null,

  resolution_type public.notification_resolution_type not null,

  resolved_path text null,
  resolved_section_id text null,
  resolved_post_id text null,
  resolved_application_id text null,

  client_context jsonb not null default '{}'::jsonb,
  resolved_at timestamptz not null default now(),

  constraint notification_resolutions_unique_recipient
    unique (recipient_id),

  constraint notification_resolutions_client_context_is_object
    check (jsonb_typeof(client_context) = 'object')
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  product public.app_product not null default 'job_mitra',
  domain public.notification_domain null,

  actor_user_id uuid null references auth.users(id) on delete set null,
  actor_role public.app_role null,

  action text not null,
  entity_table text not null,
  entity_id text null,

  ip_address inet null,
  user_agent text null,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint audit_logs_action_not_empty
    check (length(trim(action)) > 0),

  constraint audit_logs_entity_table_not_empty
    check (length(trim(entity_table)) > 0),

  constraint audit_logs_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists idx_notification_events_event_type_created_at
  on public.notification_events (event_type, created_at desc);

create index if not exists idx_notification_events_domain_created_at
  on public.notification_events (domain, created_at desc);

create index if not exists idx_notification_events_post_application
  on public.notification_events (post_id, application_id);

create index if not exists idx_notification_recipients_user_status_created_at
  on public.notification_recipients (recipient_user_id, status, created_at desc);

create index if not exists idx_notification_recipients_event_id
  on public.notification_recipients (event_id);

create index if not exists idx_notification_recipients_unread
  on public.notification_recipients (recipient_user_id, created_at desc)
  where status = 'unread';

create index if not exists idx_notification_resolutions_recipient_id
  on public.notification_resolutions (recipient_id);

create index if not exists idx_notification_resolutions_event_id
  on public.notification_resolutions (event_id);

create index if not exists idx_audit_logs_actor_created_at
  on public.audit_logs (actor_user_id, created_at desc);

create index if not exists idx_audit_logs_entity
  on public.audit_logs (entity_table, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_notification_events_updated_at on public.notification_events;

create trigger set_notification_events_updated_at
before update on public.notification_events
for each row
execute function public.set_updated_at();

drop trigger if exists set_notification_recipients_updated_at on public.notification_recipients;

create trigger set_notification_recipients_updated_at
before update on public.notification_recipients
for each row
execute function public.set_updated_at();

alter table public.notification_events enable row level security;
alter table public.notification_recipients enable row level security;
alter table public.notification_resolutions enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "notification_events_select_for_source_or_recipient"
  on public.notification_events;

create policy "notification_events_select_for_source_or_recipient"
on public.notification_events
for select
to authenticated
using (
  source_user_id = auth.uid()
  or exists (
    select 1
    from public.notification_recipients nr
    where nr.event_id = notification_events.id
      and nr.recipient_user_id = auth.uid()
  )
);

drop policy if exists "notification_recipients_select_own"
  on public.notification_recipients;

create policy "notification_recipients_select_own"
on public.notification_recipients
for select
to authenticated
using (
  recipient_user_id = auth.uid()
);

drop policy if exists "notification_resolutions_select_own"
  on public.notification_resolutions;

create policy "notification_resolutions_select_own"
on public.notification_resolutions
for select
to authenticated
using (
  resolver_user_id = auth.uid()
  or exists (
    select 1
    from public.notification_recipients nr
    where nr.id = notification_resolutions.recipient_id
      and nr.recipient_user_id = auth.uid()
  )
);

create or replace function public.resolve_notification_recipient(
  p_recipient_id uuid,
  p_resolved_path text default null,
  p_resolved_section_id text default null,
  p_resolved_post_id text default null,
  p_resolved_application_id text default null,
  p_client_context jsonb default '{}'::jsonb
)
returns public.notification_recipients
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_user uuid;
  v_recipient public.notification_recipients;
  v_event public.notification_events;
begin
  v_current_user := auth.uid();

  if v_current_user is null then
    raise exception 'Authentication required to resolve notification.'
      using errcode = '28000';
  end if;

  if p_client_context is null or jsonb_typeof(p_client_context) <> 'object' then
    raise exception 'client_context must be a JSON object.'
      using errcode = '22023';
  end if;

  select *
  into v_recipient
  from public.notification_recipients
  where id = p_recipient_id
    and recipient_user_id = v_current_user
  for update;

  if not found then
    raise exception 'Notification recipient not found for current user.'
      using errcode = 'P0001';
  end if;

  select *
  into v_event
  from public.notification_events
  where id = v_recipient.event_id;

  if not found then
    raise exception 'Notification event not found.'
      using errcode = 'P0001';
  end if;

  update public.notification_recipients
  set
    status = 'resolved',
    first_seen_at = coalesce(first_seen_at, now()),
    resolved_at = coalesce(resolved_at, now()),
    updated_at = now()
  where id = v_recipient.id
  returning *
  into v_recipient;

  insert into public.notification_resolutions (
    recipient_id,
    event_id,
    resolver_user_id,
    resolution_type,
    resolved_path,
    resolved_section_id,
    resolved_post_id,
    resolved_application_id,
    client_context,
    resolved_at
  )
  values (
    v_recipient.id,
    v_event.id,
    v_current_user,
    v_event.resolution_type,
    p_resolved_path,
    p_resolved_section_id,
    p_resolved_post_id,
    p_resolved_application_id,
    p_client_context,
    now()
  )
  on conflict (recipient_id)
  do update set
    resolver_user_id = excluded.resolver_user_id,
    resolution_type = excluded.resolution_type,
    resolved_path = excluded.resolved_path,
    resolved_section_id = excluded.resolved_section_id,
    resolved_post_id = excluded.resolved_post_id,
    resolved_application_id = excluded.resolved_application_id,
    client_context = excluded.client_context,
    resolved_at = excluded.resolved_at;

  insert into public.audit_logs (
    product,
    domain,
    actor_user_id,
    actor_role,
    action,
    entity_table,
    entity_id,
    metadata
  )
  values (
    v_event.product,
    v_event.domain,
    v_current_user,
    v_recipient.recipient_role,
    'notification_resolved',
    'notification_recipients',
    v_recipient.id::text,
    jsonb_build_object(
      'event_id', v_event.id,
      'event_type', v_event.event_type,
      'resolution_type', v_event.resolution_type,
      'resolved_path', p_resolved_path,
      'resolved_section_id', p_resolved_section_id,
      'resolved_post_id', p_resolved_post_id,
      'resolved_application_id', p_resolved_application_id
    )
  );

  return v_recipient;
end;
$$;

grant usage on schema public to authenticated;

grant select on public.notification_events to authenticated;
grant select on public.notification_recipients to authenticated;
grant select on public.notification_resolutions to authenticated;

revoke all on public.audit_logs from anon;
revoke all on public.audit_logs from authenticated;

grant execute on function public.resolve_notification_recipient(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;

comment on table public.notification_events is
'Backend source of truth for Pulse Trail notification events. Stores what happened.';

comment on table public.notification_recipients is
'Per-user notification delivery state. Stores who should see each pulse and whether it is unresolved/resolved.';

comment on table public.notification_resolutions is
'Per-user view-to-resolve confirmation records. Stores how and when exact notification content was resolved.';

comment on table public.audit_logs is
'Security, trust, and debugging audit log for important backend actions.';

comment on function public.resolve_notification_recipient(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
) is
'Safely resolves a notification recipient for the current authenticated user and records a resolution + audit log.';

commit;