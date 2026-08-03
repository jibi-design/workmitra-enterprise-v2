-- Job Mitra / WorkMitra Enterprise v2
-- Migration: Shift Ops Phase 0 — Identity & Privacy Core (Option A Supabase)
-- File: supabase/migrations/202607240001_shift_ops_phase0_identity.sql
--
-- Scope: Phase 0 ONLY
-- - Immutable User_ID (GUID)
-- - Dynamic communication channels (hashed / vaulted — never raw in client queries)
-- - platform_locks with is_shift_contact_revealed DEFAULT false
--
-- Domain: Shift Operations ONLY (isolated schema). Do not mix with Career.

begin;

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

create schema if not exists shift_ops;

comment on schema shift_ops is
  'Ultra-Enterprise Shift Operations (greenfield). Isolated from Career and legacy public pulse tables.';

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_role'
  ) then
    create type shift_ops.so_role as enum ('worker', 'manager', 'admin');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_channel_kind'
  ) then
    create type shift_ops.so_channel_kind as enum ('work_mobile', 'work_email');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_channel_status'
  ) then
    create type shift_ops.so_channel_status as enum (
      'pending',
      'verified',
      'revoked',
      'recycled'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Config (pepper for channel hashing — set via dashboard / vault; never expose to clients)
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table shift_ops.config enable row level security;

revoke all on table shift_ops.config from anon, authenticated;
-- service_role bypasses RLS; no policies for clients

insert into shift_ops.config (key, value)
values ('channel_pepper', 'REPLACE_ME_SET_VIA_VAULT_BEFORE_PROD')
on conflict (key) do nothing;

-- Boolean-only readiness check — NEVER returns the pepper value.
-- Operator / service_role after T2-4 apply. Safe to paste result in chat (true/false only).
create or replace function shift_ops.is_channel_pepper_ready()
returns boolean
language sql
stable
security definer
set search_path = shift_ops, public
as $$
  select exists (
    select 1
    from shift_ops.config c
    where c.key = 'channel_pepper'
      and c.value is not null
      and length(trim(c.value)) >= 32
      and c.value not in (
        'REPLACE_ME_SET_VIA_VAULT_BEFORE_PROD',
        'dev-only-pepper'
      )
  );
$$;

revoke all on function shift_ops.is_channel_pepper_ready() from public;
grant execute on function shift_ops.is_channel_pepper_ready() to service_role;

comment on function shift_ops.is_channel_pepper_ready() is
  'Returns true only when channel_pepper is set to a non-placeholder value (>=32 chars). Never exposes the pepper.';

-- ---------------------------------------------------------------------------
-- users — immutable User_ID
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  role shift_ops.so_role not null default 'worker',
  display_name text,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists so_users_auth_user_id_idx
  on shift_ops.users (auth_user_id);

comment on table shift_ops.users is
  'Immutable Shift Ops identity. Phone/email NEVER stored on this row.';

-- ---------------------------------------------------------------------------
-- communication_channels — metadata + hash only (no raw value column)
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.communication_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references shift_ops.users (id) on delete cascade,
  kind shift_ops.so_channel_kind not null,
  status shift_ops.so_channel_status not null default 'pending',
  is_primary boolean not null default false,
  -- SHA-256 hex of normalize(value) || pepper — for server-side lookup only
  value_hash text not null,
  -- Safe UI hint only, e.g. ****3210 or j***@firm.com — never full value
  mask_hint text not null,
  shared_device boolean not null default false,
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint so_channels_hash_len check (char_length(value_hash) = 64)
);

create unique index if not exists so_channels_kind_hash_active_uidx
  on shift_ops.communication_channels (kind, value_hash)
  where status in ('pending', 'verified');

create index if not exists so_channels_user_id_idx
  on shift_ops.communication_channels (user_id);

comment on table shift_ops.communication_channels is
  'Dynamic work channels. Raw phone/email NEVER stored here. See channel_secrets.';

-- ---------------------------------------------------------------------------
-- channel_secrets — ciphertext vault (service_role / SECURITY DEFINER only)
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.channel_secrets (
  channel_id uuid primary key references shift_ops.communication_channels (id) on delete cascade,
  -- pgp_sym_encrypt output; decrypt only in SECURITY DEFINER / Edge Functions
  ciphertext bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table shift_ops.channel_secrets is
  'PII vault. No SELECT for anon/authenticated. Used only to send OTP/SMS via service role.';

revoke all on table shift_ops.channel_secrets from anon, authenticated;
grant all on table shift_ops.channel_secrets to service_role;

-- ---------------------------------------------------------------------------
-- platform_locks — Shift peer contact never revealed by default
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.platform_locks (
  user_id uuid primary key references shift_ops.users (id) on delete cascade,
  -- Product invariant: must remain false for Shift peer-to-peer contact
  shift_contact_revealed boolean not null default false,
  notes text,
  updated_at timestamptz not null default now(),
  constraint so_platform_lock_shift_never_true check (shift_contact_revealed = false)
);

comment on table shift_ops.platform_locks is
  'Enforces isShiftContactRevealed() === false. CHECK constraint blocks true.';

comment on column shift_ops.platform_locks.shift_contact_revealed is
  'Always false in Phase 0–1. Raw peer contact exposure is forbidden.';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function shift_ops.current_so_user_id()
returns uuid
language sql
stable
security definer
set search_path = shift_ops, public
as $$
  select u.id
  from shift_ops.users u
  where u.auth_user_id = auth.uid()
  limit 1;
$$;

revoke all on function shift_ops.current_so_user_id() from public;
grant execute on function shift_ops.current_so_user_id() to authenticated;

create or replace function shift_ops.normalize_channel_value(
  p_kind shift_ops.so_channel_kind,
  p_value text
)
returns text
language plpgsql
immutable
as $$
declare
  v text := trim(p_value);
begin
  if v is null or length(v) < 3 then
    raise exception 'invalid_channel_value';
  end if;
  if p_kind = 'work_email' then
    return lower(v);
  end if;
  -- work_mobile: keep digits and leading +
  v := regexp_replace(v, '[^\d+]', '', 'g');
  return v;
end;
$$;

create or replace function shift_ops.hash_channel_value(
  p_kind shift_ops.so_channel_kind,
  p_value text
)
returns text
language plpgsql
stable
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  pepper text;
  normalized text;
begin
  select c.value into pepper from shift_ops.config c where c.key = 'channel_pepper';
  if pepper is null or pepper = 'REPLACE_ME_SET_VIA_VAULT_BEFORE_PROD' then
    -- Allow local/dev; production must rotate pepper via vault
    pepper := coalesce(pepper, 'dev-only-pepper');
  end if;
  normalized := shift_ops.normalize_channel_value(p_kind, p_value);
  return encode(digest(normalized || '|' || pepper, 'sha256'), 'hex');
end;
$$;

revoke all on function shift_ops.hash_channel_value(shift_ops.so_channel_kind, text) from public;
grant execute on function shift_ops.hash_channel_value(shift_ops.so_channel_kind, text) to service_role;

create or replace function shift_ops.mask_channel_value(
  p_kind shift_ops.so_channel_kind,
  p_value text
)
returns text
language plpgsql
immutable
as $$
declare
  n text := shift_ops.normalize_channel_value(p_kind, p_value);
begin
  if p_kind = 'work_email' then
    return left(n, 1) || '***@' || split_part(n, '@', 2);
  end if;
  if length(n) <= 4 then
    return '****';
  end if;
  return '****' || right(regexp_replace(n, '\D', '', 'g'), 4);
end;
$$;

-- Product API parity with frontend isShiftContactRevealed()
create or replace function shift_ops.is_shift_contact_revealed(p_user_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = shift_ops, public
as $$
  select coalesce(
    (
      select pl.shift_contact_revealed
      from shift_ops.platform_locks pl
      where pl.user_id = coalesce(p_user_id, shift_ops.current_so_user_id())
    ),
    false
  );
$$;

revoke all on function shift_ops.is_shift_contact_revealed(uuid) from public;
grant execute on function shift_ops.is_shift_contact_revealed(uuid) to authenticated, anon;

-- Ensure lock row exists for every user
create or replace function shift_ops.tg_users_ensure_platform_lock()
returns trigger
language plpgsql
security definer
set search_path = shift_ops, public
as $$
begin
  insert into shift_ops.platform_locks (user_id, shift_contact_revealed)
  values (new.id, false)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists so_users_ensure_platform_lock on shift_ops.users;
create trigger so_users_ensure_platform_lock
  after insert on shift_ops.users
  for each row execute function shift_ops.tg_users_ensure_platform_lock();

create or replace function shift_ops.tg_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists so_users_touch on shift_ops.users;
create trigger so_users_touch
  before update on shift_ops.users
  for each row execute function shift_ops.tg_touch_updated_at();

drop trigger if exists so_channels_touch on shift_ops.communication_channels;
create trigger so_channels_touch
  before update on shift_ops.communication_channels
  for each row execute function shift_ops.tg_touch_updated_at();

-- Bootstrap / link auth user → shift_ops.users + lock
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

  -- Existing row: return id (role already assigned; no client-side elevation path).
  select id into uid from shift_ops.users where auth_user_id = aid;
  if uid is not null then
    return uid;
  end if;

  -- CRIT-2: clients may only self-register as 'worker'. Elevations require service_role / ops SQL.
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

-- Upsert work channel: stores hash + mask + encrypted secret; returns safe row id
create or replace function shift_ops.upsert_work_channel(
  p_kind shift_ops.so_channel_kind,
  p_value text,
  p_make_primary boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  uid uuid := shift_ops.ensure_so_user('worker');
  v_hash text;
  v_mask text;
  v_norm text;
  pepper text;
  ch_id uuid;
begin
  if shift_ops.is_shift_contact_revealed(uid) then
    raise exception 'platform_lock_violation';
  end if;

  v_norm := shift_ops.normalize_channel_value(p_kind, p_value);
  v_hash := shift_ops.hash_channel_value(p_kind, p_value);
  v_mask := shift_ops.mask_channel_value(p_kind, p_value);

  select c.value into pepper from shift_ops.config c where c.key = 'channel_pepper';
  pepper := coalesce(nullif(pepper, ''), 'dev-only-pepper');

  begin
    insert into shift_ops.communication_channels (
      user_id, kind, status, is_primary, value_hash, mask_hint
    )
    values (
      uid, p_kind, 'pending', p_make_primary, v_hash, v_mask
    )
    returning id into ch_id;
  exception
    when unique_violation then
      select id into ch_id
      from shift_ops.communication_channels
      where kind = p_kind
        and value_hash = v_hash
        and status in ('pending', 'verified')
      limit 1;
  end;

  if ch_id is null then
    raise exception 'channel_upsert_failed';
  end if;

  if p_make_primary then
    update shift_ops.communication_channels
    set is_primary = (id = ch_id)
    where user_id = uid and kind = p_kind;
  end if;

  insert into shift_ops.channel_secrets (channel_id, ciphertext)
  values (ch_id, pgp_sym_encrypt(v_norm, pepper))
  on conflict (channel_id) do update
    set ciphertext = excluded.ciphertext,
        updated_at = now();

  return ch_id;
end;
$$;

revoke all on function shift_ops.upsert_work_channel(shift_ops.so_channel_kind, text, boolean) from public;
grant execute on function shift_ops.upsert_work_channel(shift_ops.so_channel_kind, text, boolean) to authenticated;

-- Safe client-facing view — NEVER exposes value_hash or secrets
create or replace view shift_ops.channels_safe
with (security_invoker = true)
as
select
  c.id,
  c.user_id,
  c.kind,
  c.status,
  c.is_primary,
  c.mask_hint,
  c.shared_device,
  c.verified_at,
  c.created_at,
  c.updated_at
from shift_ops.communication_channels c;

comment on view shift_ops.channels_safe is
  'Client-safe channel projection. No raw values, no hashes, no ciphertext.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table shift_ops.users enable row level security;
alter table shift_ops.communication_channels enable row level security;
alter table shift_ops.platform_locks enable row level security;

-- users
drop policy if exists so_users_select_self on shift_ops.users;
create policy so_users_select_self
  on shift_ops.users for select
  to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists so_users_update_self on shift_ops.users;
create policy so_users_update_self
  on shift_ops.users for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- No direct INSERT for clients (use ensure_so_user)
-- No DELETE for clients

-- communication_channels: owners can SELECT metadata rows, but apps should use channels_safe
drop policy if exists so_channels_select_own on shift_ops.communication_channels;
create policy so_channels_select_own
  on shift_ops.communication_channels for select
  to authenticated
  using (user_id = shift_ops.current_so_user_id());

-- Block client INSERT/UPDATE/DELETE on base table (mutations via SECURITY DEFINER RPCs only)
-- (no insert/update/delete policies for authenticated)

-- platform_locks: read own lock only; never update to true (CHECK + no update policy)
drop policy if exists so_locks_select_own on shift_ops.platform_locks;
create policy so_locks_select_own
  on shift_ops.platform_locks for select
  to authenticated
  using (user_id = shift_ops.current_so_user_id());

grant usage on schema shift_ops to anon, authenticated, service_role;
grant select on shift_ops.channels_safe to authenticated;
grant select on shift_ops.users to authenticated;
grant select on shift_ops.platform_locks to authenticated;
grant select on shift_ops.communication_channels to authenticated;

-- Explicit: channel_secrets stays revoked from authenticated/anon

commit;
