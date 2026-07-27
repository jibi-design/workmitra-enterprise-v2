-- Job Mitra | Phase 3 Calling — call_sessions
-- Server-side voice call session ledger (Agora primary, Twilio fallback).
-- DO NOT apply until founder says "apply" for this migration.
--
-- Notes:
--   - workspace_id / initiator_ml / receiver_ml are Mitra Lab IDs (text)
--   - status: ringing | answered | ended | declined | failed | fallback
--   - Secrets (AGORA_*, TWILIO_*, FCM_*) stay in server env only — never in SQL

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  channel_id text not null,
  initiator_ml text not null,
  receiver_ml text not null,
  status text not null default 'ringing',
  started_at timestamptz not null default now(),
  answered_at timestamptz,
  ended_at timestamptz,
  constraint call_sessions_status_chk check (
    status in ('ringing', 'answered', 'ended', 'declined', 'failed', 'fallback')
  )
);

create index if not exists call_sessions_workspace_idx
  on public.call_sessions (workspace_id);

create index if not exists call_sessions_channel_idx
  on public.call_sessions (channel_id);

create index if not exists call_sessions_status_started_idx
  on public.call_sessions (status, started_at desc);

create index if not exists call_sessions_parties_idx
  on public.call_sessions (initiator_ml, receiver_ml);

comment on table public.call_sessions is
  'Phase 3 in-app call sessions. Tokens issued by API; no PII phone numbers stored.';

-- Service role / API owns writes; authenticated clients do not select raw sessions by default.
alter table public.call_sessions enable row level security;

-- No anon/authenticated policies on purpose — API uses service role.
grant select, insert, update on public.call_sessions to service_role;
