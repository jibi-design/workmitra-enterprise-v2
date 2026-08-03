-- Job Mitra / WorkMitra Enterprise v2
-- Migration: Shift Ops Phase 1 — Onboarding, Manager Approval Gate, Ready Routing
-- File: supabase/migrations/202607240002_shift_ops_phase1_onboarding_approval.sql
--
-- Scope: Phase 1 ONLY (depends on 202607240001 Phase 0)
-- - Site QR / Smart-link invites
-- - Dual OTP (work mobile + work email)
-- - Pending Manager Approval → Ready for Assignment
-- - Post-approval routing + Test Alert rate limit (1 / 24h)

begin;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_membership_status'
  ) then
    create type shift_ops.so_membership_status as enum (
      'pending_manager_approval',
      'ready_for_assignment',
      'rejected',
      'revoked'
    );
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_invite_kind'
  ) then
    create type shift_ops.so_invite_kind as enum ('smart_link', 'site_qr');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_otp_purpose'
  ) then
    create type shift_ops.so_otp_purpose as enum (
      'onboard',
      'channel_update',
      'recover'
    );
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_assignment_status'
  ) then
    create type shift_ops.so_assignment_status as enum (
      'pending_accept',
      'accepted',
      'declined',
      'expired',
      'cancelled'
    );
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'shift_ops' and t.typname = 'so_post_approval_route'
  ) then
    create type shift_ops.so_post_approval_route as enum (
      'accept_decline',
      'ready_state'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Sites (manager owns site for QR / invites)
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  manager_user_id uuid not null references shift_ops.users (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists so_sites_manager_idx on shift_ops.sites (manager_user_id);

-- ---------------------------------------------------------------------------
-- Invites — store token HASH only (raw token shown once to manager / printed QR)
-- Invite TTL separate from 15m action tokens (default 7 days)
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.invites (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references shift_ops.sites (id) on delete cascade,
  kind shift_ops.so_invite_kind not null default 'smart_link',
  token_hash text not null unique,
  expires_at timestamptz not null,
  max_uses int not null default 100 check (max_uses > 0),
  use_count int not null default 0 check (use_count >= 0),
  created_by uuid not null references shift_ops.users (id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint so_invites_hash_len check (char_length(token_hash) = 64)
);

create index if not exists so_invites_site_idx on shift_ops.invites (site_id);

-- ---------------------------------------------------------------------------
-- OTP challenges — otp_hash only; plaintext never stored
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.channel_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references shift_ops.communication_channels (id) on delete cascade,
  purpose shift_ops.so_otp_purpose not null default 'onboard',
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint so_otp_hash_len check (char_length(otp_hash) = 64)
);

create index if not exists so_otp_channel_idx
  on shift_ops.channel_otp_challenges (channel_id, created_at desc);

-- Outbox for Edge Function / provider (service_role only) — Phase 1 scaffold
-- delivery_ciphertext: pgp_sym_encrypt(plaintext OTP, channel_pepper) so Edge can
-- decrypt + send; NEVER grant to anon/authenticated. Cleared after successful send.
create table if not exists shift_ops.otp_delivery_outbox (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references shift_ops.channel_otp_challenges (id) on delete cascade,
  channel_id uuid not null references shift_ops.communication_channels (id) on delete cascade,
  kind shift_ops.so_channel_kind not null,
  status text not null default 'queued'
    check (status in ('queued', 'sending', 'sent', 'failed')),
  delivery_ciphertext bytea,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

comment on column shift_ops.otp_delivery_outbox.delivery_ciphertext is
  'Encrypted OTP for Edge dispatch only. Null after send. Never expose to clients.';

revoke all on table shift_ops.otp_delivery_outbox from anon, authenticated;
grant all on table shift_ops.otp_delivery_outbox to service_role;

-- ---------------------------------------------------------------------------
-- Site membership — Manager Approval Gate
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.site_memberships (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references shift_ops.sites (id) on delete cascade,
  worker_user_id uuid not null references shift_ops.users (id) on delete cascade,
  invite_id uuid references shift_ops.invites (id) on delete set null,
  status shift_ops.so_membership_status not null default 'pending_manager_approval',
  decided_by uuid references shift_ops.users (id),
  decided_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, worker_user_id)
);

create index if not exists so_memberships_manager_queue_idx
  on shift_ops.site_memberships (site_id, status)
  where status = 'pending_manager_approval';

create index if not exists so_memberships_worker_idx
  on shift_ops.site_memberships (worker_user_id);

-- ---------------------------------------------------------------------------
-- Minimal pending shift assignments (routing only — not full shift product)
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.pending_shift_assignments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references shift_ops.sites (id) on delete cascade,
  worker_user_id uuid not null references shift_ops.users (id) on delete cascade,
  title text not null default 'Shift assignment',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status shift_ops.so_assignment_status not null default 'pending_accept',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint so_pending_shift_window check (ends_at > starts_at)
);

create index if not exists so_pending_assign_worker_idx
  on shift_ops.pending_shift_assignments (worker_user_id, status);

-- ---------------------------------------------------------------------------
-- Ready-state: availability + test alert rate limit
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.worker_availability (
  user_id uuid primary key references shift_ops.users (id) on delete cascade,
  is_available boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists shift_ops.alert_test_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references shift_ops.users (id) on delete cascade,
  tested_at timestamptz not null default now()
);

create index if not exists so_alert_test_user_time_idx
  on shift_ops.alert_test_log (user_id, tested_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists so_sites_touch on shift_ops.sites;
create trigger so_sites_touch
  before update on shift_ops.sites
  for each row execute function shift_ops.tg_touch_updated_at();

drop trigger if exists so_memberships_touch on shift_ops.site_memberships;
create trigger so_memberships_touch
  before update on shift_ops.site_memberships
  for each row execute function shift_ops.tg_touch_updated_at();

drop trigger if exists so_pending_assign_touch on shift_ops.pending_shift_assignments;
create trigger so_pending_assign_touch
  before update on shift_ops.pending_shift_assignments
  for each row execute function shift_ops.tg_touch_updated_at();

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

create or replace function shift_ops.hash_invite_token(p_token text)
returns text
language sql
immutable
as $$
  select encode(digest(trim(p_token), 'sha256'), 'hex');
$$;

create or replace function shift_ops.create_site_invite(
  p_site_id uuid,
  p_kind shift_ops.so_invite_kind default 'smart_link',
  p_ttl_hours int default 168
)
returns table (invite_id uuid, raw_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  mid uuid := shift_ops.current_so_user_id();
  tok text := encode(gen_random_bytes(24), 'hex');
  exp timestamptz := now() + make_interval(hours => greatest(p_ttl_hours, 1));
  iid uuid;
begin
  if mid is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from shift_ops.sites s
    where s.id = p_site_id and s.manager_user_id = mid and s.is_active
  ) then
    raise exception 'not_site_manager';
  end if;

  insert into shift_ops.invites (site_id, kind, token_hash, expires_at, created_by)
  values (p_site_id, p_kind, shift_ops.hash_invite_token(tok), exp, mid)
  returning id into iid;

  invite_id := iid;
  raw_token := tok;
  expires_at := exp;
  return next;
end;
$$;

revoke all on function shift_ops.create_site_invite(uuid, shift_ops.so_invite_kind, int) from public;
grant execute on function shift_ops.create_site_invite(uuid, shift_ops.so_invite_kind, int) to authenticated;

-- Request OTP for a channel owned by current user
create or replace function shift_ops.request_channel_otp(
  p_channel_id uuid,
  p_purpose shift_ops.so_otp_purpose default 'onboard'
)
returns uuid
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  uid uuid := shift_ops.current_so_user_id();
  ch record;
  code text;
  cid uuid;
  pepper text;
  raw bytea;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  select * into ch
  from shift_ops.communication_channels
  where id = p_channel_id and user_id = uid;

  if ch.id is null then raise exception 'channel_not_found'; end if;
  if ch.status = 'revoked' then raise exception 'channel_revoked'; end if;

  -- Invalidate prior open challenges
  update shift_ops.channel_otp_challenges
  set consumed_at = now()
  where channel_id = p_channel_id and consumed_at is null;

  -- Cryptographically stronger than random(); still 6 decimal digits for SMS/email UX
  raw := gen_random_bytes(4);
  code := lpad(
    (
      (
        (get_byte(raw, 0)::bigint << 24)
        | (get_byte(raw, 1)::bigint << 16)
        | (get_byte(raw, 2)::bigint << 8)
        | get_byte(raw, 3)::bigint
      ) % 1000000
    )::text,
    6,
    '0'
  );
  select value into pepper from shift_ops.config where key = 'channel_pepper';
  pepper := coalesce(nullif(pepper, ''), 'dev-only-pepper');

  insert into shift_ops.channel_otp_challenges (
    channel_id, purpose, otp_hash, expires_at
  ) values (
    p_channel_id,
    p_purpose,
    encode(digest(code || '|' || pepper, 'sha256'), 'hex'),
    now() + interval '10 minutes'
  )
  returning id into cid;

  insert into shift_ops.otp_delivery_outbox (
    challenge_id, channel_id, kind, delivery_ciphertext
  ) values (
    cid,
    p_channel_id,
    ch.kind,
    pgp_sym_encrypt(code, pepper)
  );

  -- Plaintext OTP is NOT returned to client.
  -- Edge Function (shift-ops-otp-dispatch) decrypts delivery_ciphertext + channel_secrets.
  return cid;
end;
$$;

revoke all on function shift_ops.request_channel_otp(uuid, shift_ops.so_otp_purpose) from public;
grant execute on function shift_ops.request_channel_otp(uuid, shift_ops.so_otp_purpose) to authenticated;

create or replace function shift_ops.verify_channel_otp(
  p_channel_id uuid,
  p_otp text
)
returns boolean
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  uid uuid := shift_ops.current_so_user_id();
  ch record;
  chal record;
  pepper text;
  expect text;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  select * into ch from shift_ops.communication_channels
  where id = p_channel_id and user_id = uid;
  if ch.id is null then raise exception 'channel_not_found'; end if;

  select * into chal
  from shift_ops.channel_otp_challenges
  where channel_id = p_channel_id
    and consumed_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if chal.id is null then raise exception 'otp_expired_or_missing'; end if;
  if chal.attempts >= chal.max_attempts then raise exception 'otp_locked'; end if;

  select value into pepper from shift_ops.config where key = 'channel_pepper';
  pepper := coalesce(nullif(pepper, ''), 'dev-only-pepper');
  expect := encode(digest(trim(p_otp) || '|' || pepper, 'sha256'), 'hex');

  update shift_ops.channel_otp_challenges
  set attempts = attempts + 1
  where id = chal.id;

  if expect <> chal.otp_hash then
    return false;
  end if;

  update shift_ops.channel_otp_challenges
  set consumed_at = now()
  where id = chal.id;

  update shift_ops.communication_channels
  set status = 'verified', verified_at = now()
  where id = p_channel_id;

  return true;
end;
$$;

revoke all on function shift_ops.verify_channel_otp(uuid, text) from public;
grant execute on function shift_ops.verify_channel_otp(uuid, text) to authenticated;

-- Edge-only: decrypt OTP + destination for one outbox row (service_role).
-- Never grant to anon/authenticated. Never log return value in client apps.
create or replace function shift_ops.otp_dispatch_decrypt_bundle(p_outbox_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  ob record;
  pepper text;
  code text;
  dest text;
  mask text;
begin
  select * into ob
  from shift_ops.otp_delivery_outbox
  where id = p_outbox_id;

  if ob.id is null then raise exception 'outbox_not_found'; end if;
  if ob.delivery_ciphertext is null then raise exception 'missing_delivery_ciphertext'; end if;

  select value into pepper from shift_ops.config where key = 'channel_pepper';
  pepper := coalesce(nullif(pepper, ''), 'dev-only-pepper');

  code := pgp_sym_decrypt(ob.delivery_ciphertext, pepper);

  select pgp_sym_decrypt(s.ciphertext, pepper) into dest
  from shift_ops.channel_secrets s
  where s.channel_id = ob.channel_id;

  if dest is null then raise exception 'missing_channel_secret'; end if;

  select c.mask_hint into mask
  from shift_ops.communication_channels c
  where c.id = ob.channel_id;

  return jsonb_build_object(
    'otp', code,
    'destination', dest,
    'kind', ob.kind,
    'destination_mask', coalesce(mask, ''),
    'channel_id', ob.channel_id,
    'challenge_id', ob.challenge_id
  );
end;
$$;

revoke all on function shift_ops.otp_dispatch_decrypt_bundle(uuid) from public;
grant execute on function shift_ops.otp_dispatch_decrypt_bundle(uuid) to service_role;

-- Join via invite → always Pending Manager Approval (even if returning worker)
create or replace function shift_ops.join_site_via_invite(p_raw_token text)
returns uuid
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  uid uuid := shift_ops.ensure_so_user('worker');
  inv record;
  mid uuid;
  mobile_ok boolean;
  email_ok boolean;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  select * into inv
  from shift_ops.invites i
  where i.token_hash = shift_ops.hash_invite_token(p_raw_token)
    and i.revoked_at is null
    and i.expires_at > now()
    and i.use_count < i.max_uses;

  if inv.id is null then raise exception 'invite_invalid'; end if;

  select exists (
    select 1 from shift_ops.communication_channels c
    where c.user_id = uid and c.kind = 'work_mobile' and c.status = 'verified'
  ) into mobile_ok;

  select exists (
    select 1 from shift_ops.communication_channels c
    where c.user_id = uid and c.kind = 'work_email' and c.status = 'verified'
  ) into email_ok;

  if not mobile_ok or not email_ok then
    raise exception 'dual_verification_required';
  end if;

  insert into shift_ops.site_memberships (site_id, worker_user_id, invite_id, status)
  values (inv.site_id, uid, inv.id, 'pending_manager_approval')
  on conflict (site_id, worker_user_id) do update
    set status = 'pending_manager_approval',
        invite_id = excluded.invite_id,
        decided_by = null,
        decided_at = null,
        reject_reason = null,
        updated_at = now()
  returning id into mid;

  update shift_ops.invites
  set use_count = use_count + 1
  where id = inv.id;

  return mid;
end;
$$;

revoke all on function shift_ops.join_site_via_invite(text) from public;
grant execute on function shift_ops.join_site_via_invite(text) to authenticated;

create or replace function shift_ops.manager_decide_membership(
  p_membership_id uuid,
  p_approve boolean,
  p_reject_reason text default null
)
returns shift_ops.so_membership_status
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  mid uuid := shift_ops.current_so_user_id();
  membership_id uuid;
  manager_id uuid;
  current_status shift_ops.so_membership_status;
  new_status shift_ops.so_membership_status;
begin
  if mid is null then raise exception 'not_authenticated'; end if;

  select sm.id, s.manager_user_id, sm.status
  into membership_id, manager_id, current_status
  from shift_ops.site_memberships sm
  join shift_ops.sites s on s.id = sm.site_id
  where sm.id = p_membership_id;

  if membership_id is null then raise exception 'membership_not_found'; end if;
  if manager_id <> mid then raise exception 'not_site_manager'; end if;
  if current_status <> 'pending_manager_approval' then raise exception 'not_pending'; end if;

  if p_approve then
    new_status := 'ready_for_assignment';
  else
    new_status := 'rejected';
  end if;

  update shift_ops.site_memberships
  set status = new_status,
      decided_by = mid,
      decided_at = now(),
      reject_reason = case when p_approve then null else coalesce(p_reject_reason, 'rejected') end
  where id = p_membership_id;

  return new_status;
end;
$$;

revoke all on function shift_ops.manager_decide_membership(uuid, boolean, text) from public;
grant execute on function shift_ops.manager_decide_membership(uuid, boolean, text) to authenticated;

-- Zero-dead-end routing after approval (or when already ready)
create or replace function shift_ops.get_post_approval_route(p_site_id uuid default null)
returns table (
  route shift_ops.so_post_approval_route,
  pending_assignment_id uuid,
  membership_status shift_ops.so_membership_status
)
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  uid uuid := shift_ops.current_so_user_id();
  mstatus shift_ops.so_membership_status;
  aid uuid;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  select sm.status into mstatus
  from shift_ops.site_memberships sm
  where sm.worker_user_id = uid
    and (p_site_id is null or sm.site_id = p_site_id)
  order by
    case sm.status
      when 'ready_for_assignment' then 0
      when 'pending_manager_approval' then 1
      else 2
    end,
    sm.updated_at desc
  limit 1;

  if mstatus is null then
    raise exception 'no_membership';
  end if;

  if mstatus = 'pending_manager_approval' then
    raise exception 'awaiting_manager_approval';
  end if;

  if mstatus <> 'ready_for_assignment' then
    raise exception 'membership_not_ready';
  end if;

  select psa.id into aid
  from shift_ops.pending_shift_assignments psa
  where psa.worker_user_id = uid
    and psa.status = 'pending_accept'
    and (p_site_id is null or psa.site_id = p_site_id)
    and psa.starts_at > now() - interval '1 day'
  order by psa.starts_at asc
  limit 1;

  if aid is not null then
    route := 'accept_decline';
    pending_assignment_id := aid;
  else
    route := 'ready_state';
    pending_assignment_id := null;
  end if;

  membership_status := mstatus;
  return next;
end;
$$;

revoke all on function shift_ops.get_post_approval_route(uuid) from public;
grant execute on function shift_ops.get_post_approval_route(uuid) to authenticated;

create or replace function shift_ops.respond_pending_assignment(
  p_assignment_id uuid,
  p_accept boolean
)
returns shift_ops.so_assignment_status
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  uid uuid := shift_ops.current_so_user_id();
  st shift_ops.so_assignment_status;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  update shift_ops.pending_shift_assignments
  set status = case when p_accept then 'accepted'::shift_ops.so_assignment_status
                    else 'declined'::shift_ops.so_assignment_status end
  where id = p_assignment_id
    and worker_user_id = uid
    and status = 'pending_accept'
  returning status into st;

  if st is null then raise exception 'assignment_not_found_or_not_pending'; end if;
  return st;
end;
$$;

revoke all on function shift_ops.respond_pending_assignment(uuid, boolean) from public;
grant execute on function shift_ops.respond_pending_assignment(uuid, boolean) to authenticated;

create or replace function shift_ops.set_my_availability(p_available boolean)
returns boolean
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  uid uuid := shift_ops.current_so_user_id();
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  insert into shift_ops.worker_availability (user_id, is_available)
  values (uid, p_available)
  on conflict (user_id) do update
    set is_available = excluded.is_available,
        updated_at = now();

  return p_available;
end;
$$;

revoke all on function shift_ops.set_my_availability(boolean) from public;
grant execute on function shift_ops.set_my_availability(boolean) to authenticated;

-- STRICT: max 1 test alert per user per 24 hours
create or replace function shift_ops.request_test_alert()
returns timestamptz
language plpgsql
security definer
set search_path = shift_ops, public
as $$
declare
  uid uuid := shift_ops.current_so_user_id();
  last_at timestamptz;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  select atl.tested_at into last_at
  from shift_ops.alert_test_log atl
  where atl.user_id = uid
  order by atl.tested_at desc
  limit 1;

  if last_at is not null and last_at > now() - interval '24 hours' then
    raise exception 'test_alert_rate_limited'
      using detail = format('Next allowed after %s', last_at + interval '24 hours');
  end if;

  insert into shift_ops.alert_test_log (user_id) values (uid)
  returning tested_at into last_at;

  -- Delivery is out of Phase 1 scope (push/SMS providers). Log is the rate-limit source of truth.
  return last_at;
end;
$$;

revoke all on function shift_ops.request_test_alert() from public;
grant execute on function shift_ops.request_test_alert() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table shift_ops.sites enable row level security;
alter table shift_ops.invites enable row level security;
alter table shift_ops.channel_otp_challenges enable row level security;
alter table shift_ops.site_memberships enable row level security;
alter table shift_ops.pending_shift_assignments enable row level security;
alter table shift_ops.worker_availability enable row level security;
alter table shift_ops.alert_test_log enable row level security;

-- sites: managers see own sites
drop policy if exists so_sites_manager_all on shift_ops.sites;
create policy so_sites_manager_select on shift_ops.sites
  for select to authenticated
  using (
    manager_user_id = shift_ops.current_so_user_id()
    or exists (
      select 1 from shift_ops.site_memberships sm
      where sm.site_id = sites.id
        and sm.worker_user_id = shift_ops.current_so_user_id()
        and sm.status in ('pending_manager_approval', 'ready_for_assignment')
    )
  );

drop policy if exists so_sites_manager_insert on shift_ops.sites;
create policy so_sites_manager_insert on shift_ops.sites
  for insert to authenticated
  with check (manager_user_id = shift_ops.current_so_user_id());

drop policy if exists so_sites_manager_update on shift_ops.sites;
create policy so_sites_manager_update on shift_ops.sites
  for update to authenticated
  using (manager_user_id = shift_ops.current_so_user_id())
  with check (manager_user_id = shift_ops.current_so_user_id());

-- invites: manager of site only
drop policy if exists so_invites_manager_select on shift_ops.invites;
create policy so_invites_manager_select on shift_ops.invites
  for select to authenticated
  using (
    exists (
      select 1 from shift_ops.sites s
      where s.id = invites.site_id and s.manager_user_id = shift_ops.current_so_user_id()
    )
  );

-- OTP challenges: clients must use otp_challenges_safe only (no otp_hash).
-- CRIT-3: do not grant SELECT on the base table to authenticated.
drop policy if exists so_otp_select_own on shift_ops.channel_otp_challenges;

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

-- Safe view: metadata only (no otp_hash). Base table SELECT revoked below.
grant select on shift_ops.otp_challenges_safe to authenticated;

-- memberships
drop policy if exists so_memberships_select on shift_ops.site_memberships;
create policy so_memberships_select on shift_ops.site_memberships
  for select to authenticated
  using (
    worker_user_id = shift_ops.current_so_user_id()
    or exists (
      select 1 from shift_ops.sites s
      where s.id = site_memberships.site_id
        and s.manager_user_id = shift_ops.current_so_user_id()
    )
  );

-- pending assignments
drop policy if exists so_pending_select on shift_ops.pending_shift_assignments;
create policy so_pending_select on shift_ops.pending_shift_assignments
  for select to authenticated
  using (
    worker_user_id = shift_ops.current_so_user_id()
    or exists (
      select 1 from shift_ops.sites s
      where s.id = pending_shift_assignments.site_id
        and s.manager_user_id = shift_ops.current_so_user_id()
    )
  );

drop policy if exists so_pending_manager_insert on shift_ops.pending_shift_assignments;
create policy so_pending_manager_insert on shift_ops.pending_shift_assignments
  for insert to authenticated
  with check (
    exists (
      select 1 from shift_ops.sites s
      where s.id = site_id and s.manager_user_id = shift_ops.current_so_user_id()
    )
  );

-- availability
drop policy if exists so_avail_select on shift_ops.worker_availability;
create policy so_avail_select on shift_ops.worker_availability
  for select to authenticated
  using (user_id = shift_ops.current_so_user_id());

-- alert test log: user sees own
drop policy if exists so_alert_test_select on shift_ops.alert_test_log;
create policy so_alert_test_select on shift_ops.alert_test_log
  for select to authenticated
  using (user_id = shift_ops.current_so_user_id());

grant select on shift_ops.sites to authenticated;
grant insert, update on shift_ops.sites to authenticated;
grant select on shift_ops.invites to authenticated;
grant select on shift_ops.site_memberships to authenticated;
grant select on shift_ops.pending_shift_assignments to authenticated;
grant insert on shift_ops.pending_shift_assignments to authenticated;
grant select on shift_ops.worker_availability to authenticated;
grant select on shift_ops.alert_test_log to authenticated;
-- CRIT-3: revoke base-table SELECT so otp_hash is not client-readable
revoke select on shift_ops.channel_otp_challenges from authenticated;

commit;
