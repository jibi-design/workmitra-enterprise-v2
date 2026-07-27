-- Job Mitra - Schema Migrations Tracker
-- File: server/db/migrations/000_schema_migrations.sql
--
-- Purpose: Record which SQL migration files have been applied.
-- Note: migrate.ts does not yet write to this table automatically.
-- Future work: wire runMigrations() to INSERT after each successful file.
--
-- MIG-006 - Phase-DB-Migration-Readiness-Audit-001

CREATE TABLE IF NOT EXISTS schema_migrations (
  id          BIGSERIAL   PRIMARY KEY,
  filename    TEXT        NOT NULL UNIQUE,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at
  ON schema_migrations (applied_at DESC);