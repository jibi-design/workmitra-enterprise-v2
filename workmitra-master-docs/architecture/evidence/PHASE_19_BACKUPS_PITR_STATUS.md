# Phase 19 — Disaster Recovery / Backups Status

**Date:** 2026-07-20  
**Blocker:** Phase 18 NO-GO — DB backups / PITR not cleared from Cursor

## Operator action required (Supabase Dashboard)

Cursor / this repo **cannot** enable Supabase project backups or PITR via API from this environment (no Supabase management MCP / service role for dashboard settings).

### Checklist (human)

1. Open Supabase Dashboard → your production project
2. **Project Settings → Database → Backups** (or **Settings → Add-ons → Point-in-Time Recovery**)
3. Enable **daily backups** (minimum)
4. Enable **PITR** (requires Pro plan or higher on most projects)
5. **Test restore:** create a temporary branch / restore to a new project from a backup snapshot; verify `auth_users` + one career/shift table row count
6. Record restore test evidence (timestamp, backup id, pass/fail) below

### Evidence log

| Item                   | Status               | Notes                     |
| ---------------------- | -------------------- | ------------------------- |
| Daily backups enabled  | **PENDING_OPERATOR** | Not verifiable from repo  |
| PITR enabled           | **PENDING_OPERATOR** | Not verifiable from repo  |
| Restore test completed | **PENDING_OPERATOR** | Must be done in dashboard |

## Code / process readiness

- DR plan (Phase 18): `workmitra-master-docs/architecture/evidence/PHASE_18_DISASTER_RECOVERY_PLAN.md`
- App dual-write / LS cache does **not** replace DB backups

## Gate impact

Until the operator checklist is **PASS**, Phase 19 / production launch remains **NO-GO** for DR even if application blockers are fixed.
