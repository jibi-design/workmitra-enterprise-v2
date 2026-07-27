-- Job Mitra | Shift Ops — Static Group Link + Daily OTP (Group Join Step 1)
-- Schema: shift_ops only. Group ID = sites.id (operational group/site).
-- DO NOT apply until founder says "apply" for this migration.
--
-- Product:
--   - Static link/QR never expires (until revoked/rotated)
--   - Final join requires today's Active Daily OTP bound to site (Group ID)
--   - Yesterday's link works today if worker enters today's OTP

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Static group access links (token HASH only; raw shown once on create/rotate)
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.site_static_links (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references shift_ops.sites (id) on delete cascade,
  token_hash text not null,
  created_by uuid not null references shift_ops.users (id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint so_static_link_hash_len check (char_length(token_hash) = 64)
);

create unique index if not exists so_static_links_active_site_uidx
  on shift_ops.site_static_links (site_id)
  where revoked_at is null;

create unique index if not exists so_static_links_active_hash_uidx
  on shift_ops.site_static_links (token_hash)
  where revoked_at is null;

create index if not exists so_static_links_site_idx
  on shift_ops.site_static_links (site_id);

comment on table shift_ops.site_static_links is
  'Non-expiring group/site access links for QR/smart-link. Join still requires daily OTP.';

-- ---------------------------------------------------------------------------
-- Daily OTP bound to Group ID (site_id) — hash only; plaintext returned once to manager
-- ---------------------------------------------------------------------------

create table if not exists shift_ops.site_daily_otps (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references shift_ops.sites (id) on delete cascade,
  otp_day date not null,
  otp_hash text not null,
  created_by uuid not null references shift_ops.users (id),
  created_at timestamptz not null default now(),
  constraint so_daily_otp_hash_len check (char_length(otp_hash) = 64),
  constraint so_daily_otp_site_day unique (site_id, otp_day)
);

create index if not exists so_daily_otp_site_day_idx
  on shift_ops.site_daily_otps (site_id, otp_day desc);

comment on table shift_ops.site_daily_otps is
  'Employer Active Daily OTP per site (Group ID). Valid for otp_day (UTC date).';

alter table shift_ops.site_static_links enable row level security;
alter table shift_ops.site_daily_otps enable row level security;

drop policy if exists so_static_links_manager_select on shift_ops.site_static_links;
create policy so_static_links_manager_select on shift_ops.site_static_links
  for select to authenticated
  using (
    exists (
      select 1 from shift_ops.sites s
      where s.id = site_static_links.site_id
        and s.manager_user_id = shift_ops.current_so_user_id()
    )
  );

drop policy if exists so_daily_otps_manager_select on shift_ops.site_daily_otps;
create policy so_daily_otps_manager_select on shift_ops.site_daily_otps
  for select to authenticated
  using (
    exists (
      select 1 from shift_ops.sites s
      where s.id = site_daily_otps.site_id
        and s.manager_user_id = shift_ops.current_so_user_id()
    )
  );

grant select on shift_ops.site_static_links to authenticated;
grant select on shift_ops.site_daily_otps to authenticated;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function shift_ops.assert_site_manager(p_site_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = shift_ops, public
as $$
declare
  mid uuid := shift_ops.current_so_user_id();
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
  return mid;
end;
$$;

revoke all on function shift_ops.assert_site_manager(uuid) from public;
grant execute on function shift_ops.assert_site_manager(uuid) to authenticated;

create or replace function shift_ops.hash_daily_otp(p_otp text)
returns text
language plpgsql
stable
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  pepper text;
begin
  select value into pepper from shift_ops.config where key = 'channel_pepper';
  pepper := coalesce(nullif(pepper, ''), 'dev-only-pepper');
  return encode(digest(trim(p_otp) || '|' || pepper, 'sha256'), 'hex');
end;
$$;

revoke all on function shift_ops.hash_daily_otp(text) from public;

-- ---------------------------------------------------------------------------
-- Ensure / rotate static group link
-- ---------------------------------------------------------------------------

create or replace function shift_ops.ensure_site_static_link(p_site_id uuid)
returns table (
  link_id uuid,
  group_id uuid,
  raw_token text,
  created_new boolean
)
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  mid uuid;
  existing record;
  tok text;
  lid uuid;
begin
  mid := shift_ops.assert_site_manager(p_site_id);

  select * into existing
  from shift_ops.site_static_links
  where site_id = p_site_id and revoked_at is null
  limit 1;

  if existing.id is not null then
    link_id := existing.id;
    group_id := p_site_id;
    raw_token := null; -- raw only returned on create/rotate
    created_new := false;
    return next;
    return;
  end if;

  tok := encode(gen_random_bytes(24), 'hex');
  insert into shift_ops.site_static_links (site_id, token_hash, created_by)
  values (p_site_id, shift_ops.hash_invite_token(tok), mid)
  returning id into lid;

  link_id := lid;
  group_id := p_site_id;
  raw_token := tok;
  created_new := true;
  return next;
end;
$$;

revoke all on function shift_ops.ensure_site_static_link(uuid) from public;
grant execute on function shift_ops.ensure_site_static_link(uuid) to authenticated;

create or replace function shift_ops.rotate_site_static_link(p_site_id uuid)
returns table (
  link_id uuid,
  group_id uuid,
  raw_token text,
  created_new boolean
)
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  mid uuid;
  tok text;
  lid uuid;
begin
  mid := shift_ops.assert_site_manager(p_site_id);

  update shift_ops.site_static_links
  set revoked_at = now()
  where site_id = p_site_id and revoked_at is null;

  tok := encode(gen_random_bytes(24), 'hex');
  insert into shift_ops.site_static_links (site_id, token_hash, created_by)
  values (p_site_id, shift_ops.hash_invite_token(tok), mid)
  returning id into lid;

  link_id := lid;
  group_id := p_site_id;
  raw_token := tok;
  created_new := true;
  return next;
end;
$$;

revoke all on function shift_ops.rotate_site_static_link(uuid) from public;
grant execute on function shift_ops.rotate_site_static_link(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Rotate / mint today's Active Daily OTP (manager sees plaintext once)
-- ---------------------------------------------------------------------------

create or replace function shift_ops.rotate_site_daily_otp(p_site_id uuid)
returns table (
  group_id uuid,
  otp_day date,
  daily_otp text
)
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  mid uuid;
  code text;
  raw bytea;
  day_utc date := (timezone('utc', now()))::date;
begin
  mid := shift_ops.assert_site_manager(p_site_id);

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

  insert into shift_ops.site_daily_otps (site_id, otp_day, otp_hash, created_by)
  values (p_site_id, day_utc, shift_ops.hash_daily_otp(code), mid)
  on conflict (site_id, otp_day) do update
    set otp_hash = excluded.otp_hash,
        created_by = excluded.created_by,
        created_at = now();

  group_id := p_site_id;
  otp_day := day_utc;
  daily_otp := code;
  return next;
end;
$$;

revoke all on function shift_ops.rotate_site_daily_otp(uuid) from public;
grant execute on function shift_ops.rotate_site_daily_otp(uuid) to authenticated;

create or replace function shift_ops.site_daily_otp_status(p_site_id uuid)
returns table (
  group_id uuid,
  otp_day date,
  has_active_otp boolean
)
language plpgsql
stable
security definer
set search_path = shift_ops, public
as $$
declare
  mid uuid;
  day_utc date := (timezone('utc', now()))::date;
begin
  mid := shift_ops.assert_site_manager(p_site_id);
  group_id := p_site_id;
  otp_day := day_utc;
  has_active_otp := exists (
    select 1 from shift_ops.site_daily_otps d
    where d.site_id = p_site_id and d.otp_day = day_utc
  );
  return next;
end;
$$;

revoke all on function shift_ops.site_daily_otp_status(uuid) from public;
grant execute on function shift_ops.site_daily_otp_status(uuid) to authenticated;

-- Peek group from static link (no join) — for worker UI before OTP
create or replace function shift_ops.peek_group_from_static_link(p_raw_token text)
returns table (
  group_id uuid,
  group_name text,
  is_active boolean
)
language plpgsql
stable
security definer
set search_path = shift_ops, public
as $$
declare
  link record;
  site record;
begin
  select * into link
  from shift_ops.site_static_links l
  where l.token_hash = shift_ops.hash_invite_token(p_raw_token)
    and l.revoked_at is null
  limit 1;

  if link.id is null then
    raise exception 'group_link_invalid';
  end if;

  select * into site from shift_ops.sites s where s.id = link.site_id;
  if site.id is null then
    raise exception 'group_deleted';
  end if;

  group_id := site.id;
  group_name := site.name;
  is_active := site.is_active;
  return next;
end;
$$;

revoke all on function shift_ops.peek_group_from_static_link(text) from public;
grant execute on function shift_ops.peek_group_from_static_link(text) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Join via static group link + today's daily OTP (+ dual channel verify)
-- ---------------------------------------------------------------------------

create or replace function shift_ops.join_site_via_group_link(
  p_raw_token text,
  p_daily_otp text
)
returns uuid
language plpgsql
security definer
set search_path = shift_ops, public, extensions
as $$
declare
  uid uuid := shift_ops.ensure_so_user('worker');
  link record;
  site record;
  day_utc date := (timezone('utc', now()))::date;
  otp_row record;
  mid uuid;
  mobile_ok boolean;
  email_ok boolean;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  if p_daily_otp is null or length(trim(p_daily_otp)) <> 6 then
    raise exception 'daily_otp_invalid';
  end if;

  select * into link
  from shift_ops.site_static_links l
  where l.token_hash = shift_ops.hash_invite_token(p_raw_token)
    and l.revoked_at is null
  limit 1;

  if link.id is null then
    raise exception 'group_link_invalid';
  end if;

  select * into site from shift_ops.sites s where s.id = link.site_id;
  if site.id is null then
    raise exception 'group_deleted';
  end if;
  if not site.is_active then
    raise exception 'group_inactive';
  end if;

  select * into otp_row
  from shift_ops.site_daily_otps d
  where d.site_id = site.id and d.otp_day = day_utc
  limit 1;

  if otp_row.id is null then
    raise exception 'daily_otp_missing';
  end if;

  if otp_row.otp_hash <> shift_ops.hash_daily_otp(p_daily_otp) then
    raise exception 'daily_otp_invalid';
  end if;

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
  values (site.id, uid, null, 'pending_manager_approval')
  on conflict (site_id, worker_user_id) do update
    set status = 'pending_manager_approval',
        invite_id = null,
        decided_by = null,
        decided_at = null,
        reject_reason = null,
        updated_at = now()
  returning id into mid;

  return mid;
end;
$$;

revoke all on function shift_ops.join_site_via_group_link(text, text) from public;
grant execute on function shift_ops.join_site_via_group_link(text, text) to authenticated;
