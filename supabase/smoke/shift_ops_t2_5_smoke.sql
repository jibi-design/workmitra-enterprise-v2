-- Job Mitra | Shift Ops T2-5 smoke (safe — no secrets returned)
-- Run in Supabase SQL Editor on jobmitra-enterprise-v2-dev as postgres.
-- Paste entire file → Run → screenshot Results (no keys/pepper).
-- Expected highlights: schema_ok true, pepper_ready true, anon_can_select_secrets false,
--   anon_can_select_outbox false, core_fn_count >= 8, table_count >= 10

select
  exists (
    select 1 from pg_namespace where nspname = 'shift_ops'
  ) as schema_ok,
  (
    select count(*)::int
    from information_schema.tables
    where table_schema = 'shift_ops'
      and table_type = 'BASE TABLE'
  ) as table_count,
  shift_ops.is_channel_pepper_ready() as pepper_ready,
  (
    select count(*)::int
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'shift_ops'
      and p.proname in (
        'ensure_so_user',
        'upsert_work_channel',
        'is_shift_contact_revealed',
        'is_channel_pepper_ready',
        'request_channel_otp',
        'verify_channel_otp',
        'otp_dispatch_decrypt_bundle',
        'join_site_via_invite',
        'manager_decide_membership',
        'get_post_approval_route',
        'respond_pending_assignment',
        'set_my_availability',
        'request_test_alert'
      )
  ) as core_fn_count,
  coalesce(
    (
      select c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'shift_ops'
        and c.relname = 'channel_secrets'
    ),
    false
  ) as channel_secrets_rls,
  coalesce(
    (
      select c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'shift_ops'
        and c.relname = 'otp_delivery_outbox'
    ),
    false
  ) as otp_outbox_rls,
  has_table_privilege('anon', 'shift_ops.channel_secrets', 'SELECT') as anon_can_select_secrets,
  has_table_privilege('authenticated', 'shift_ops.channel_secrets', 'SELECT') as auth_can_select_secrets,
  has_table_privilege('anon', 'shift_ops.otp_delivery_outbox', 'SELECT') as anon_can_select_outbox,
  has_table_privilege('authenticated', 'shift_ops.otp_delivery_outbox', 'SELECT') as auth_can_select_outbox,
  has_table_privilege('authenticated', 'shift_ops.channels_safe', 'SELECT') as auth_can_select_channels_safe,
  exists (
    select 1
    from information_schema.views
    where table_schema = 'shift_ops'
      and table_name = 'channels_safe'
  ) as channels_safe_view_ok;
