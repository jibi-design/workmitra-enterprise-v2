-- Sprint 1 — Standalone Supabase paste (same logic as 013_auth_rls_revoke.sql)
-- Dashboard → SQL → New query → Run

BEGIN;

DO $$
DECLARE
  t text;
  policy_suffix text;
  has_anon boolean;
  has_authenticated boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') INTO has_anon;
  SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
    INTO has_authenticated;

  FOREACH t IN ARRAY ARRAY[
    'auth_users',
    'auth_user_roles',
    'auth_sessions',
    'auth_audit_events',
    'auth_login_attempts'
  ]
  LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      RAISE NOTICE 'skip missing table public.%', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    -- Do NOT FORCE RLS: Node API via DATABASE_URL (table owner) must keep working.
    -- anon/authenticated are denied by RESTRICTIVE policy + REVOKE below.

    policy_suffix := replace(t, 'auth_', '');
    EXECUTE format('DROP POLICY IF EXISTS auth_%s_no_direct_access ON public.%I', policy_suffix, t);

    IF has_anon AND has_authenticated THEN
      EXECUTE format(
        'CREATE POLICY auth_%s_no_direct_access ON public.%I
           AS RESTRICTIVE FOR ALL TO anon, authenticated
           USING (false) WITH CHECK (false)',
        policy_suffix, t
      );
    ELSIF has_anon THEN
      EXECUTE format(
        'CREATE POLICY auth_%s_no_direct_access ON public.%I
           AS RESTRICTIVE FOR ALL TO anon
           USING (false) WITH CHECK (false)',
        policy_suffix, t
      );
    ELSIF has_authenticated THEN
      EXECUTE format(
        'CREATE POLICY auth_%s_no_direct_access ON public.%I
           AS RESTRICTIVE FOR ALL TO authenticated
           USING (false) WITH CHECK (false)',
        policy_suffix, t
      );
    END IF;

    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', t);
    IF has_anon THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
    END IF;
    IF has_authenticated THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', t);
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role',
        t
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
