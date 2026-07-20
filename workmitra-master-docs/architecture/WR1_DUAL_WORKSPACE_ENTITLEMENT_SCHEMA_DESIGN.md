---
title: WR1 Dual-Workspace Entitlement Schema Design
project: WorkMitra / Job Mitra
packet: PHASE-WR1A-DESIGN-001
date: 2026-07-16
status: DESIGN ONLY — runtime implementation not approved
---

# WR1 Dual-Workspace Entitlement Schema Design

**Packet:** PHASE-WR1A-DESIGN-001  
**Repository:** `C:\projects\WorkMitra_Enterprise_v2`  
**Authority:** Architecture design document only. No runtime code, migration execution, or API changes are authorized by this document.

---

## A. Executive decision

Job Mitra adopts **Option A: extend the existing `auth_user_roles` table** as the sole entitlement store for Employee and Employer workspaces.

| Decision                     | Choice                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| Entitlement storage          | Extend `auth_user_roles` (no parallel `workspace_entitlements` table) |
| Active workspace context     | `auth_sessions.active_workspace`                                      |
| Default workspace preference | New `user_workspace_preferences` table                                |
| `is_primary`                 | Retained temporarily for backward compatibility only                  |
| Admin                        | Separate from Employee/Employer workspace switching                   |
| Runtime implementation       | **Not yet approved** — this document is WR1A design only              |

**Locked product rules preserved:**

- One user may hold employee entitlement, employer entitlement, or both (verified independently).
- No database `absent` status — absence of a row means absent.
- Rejected onboarding is audit/review metadata, not a permanent entitlement status.
- Account-level suspension on `auth_users` overrides all workspace entitlements.
- Workspace deactivation is soft archive; domain data is not hard-deleted.
- Preferences never grant entitlement. Backend, session, and database remain authority.

---

## B. Current-state summary

### Existing `auth_user_roles` (migration `001_auth_persistence.sql`)

| Column          | Type                   | Notes                               |
| --------------- | ---------------------- | ----------------------------------- |
| `id`            | UUID PK                | Surrogate key                       |
| `user_id`       | UUID FK → `auth_users` | CASCADE delete                      |
| `role`          | TEXT                   | `employee` \| `employer` \| `admin` |
| `product_scope` | TEXT                   | Default `jobmitra`                  |
| `is_primary`    | BOOLEAN                | Default `true`                      |
| `granted_at`    | TIMESTAMPTZ            | Creation timestamp                  |

**Constraints:** `UNIQUE (user_id, role, product_scope)`  
**Index:** `idx_auth_user_roles_user_scope` on `(user_id, product_scope) WHERE is_primary = true`

### Multi-row structural capability

The unique constraint allows **one row per role per user per product scope**. A single user may therefore have both an `employee` row and an `employer` row for `product_scope = jobmitra`. Duplicate same-role rows are prevented.

### Single-role runtime limitation

Current server code reads **only one primary role**:

- `auth.repository.getPrimaryRole()` — `SELECT role … WHERE is_primary = true LIMIT 1`
- `auth.repository.toAuthUser()` — builds `AuthUser` with single `role` field
- `GET /v1/jobmitra/auth/me` — returns `{ user: { id, email, fullName, role } }`
- `auth_sessions` stores `user_id` only — no workspace context

Seed script (`server/db/seed.ts`) creates **two separate users** (one employee, one employer), not dual entitlements on one account.

### Current `/me` single-role contract

Frontend (`authService.fetchMe`, `authStore`) expects:

```ts
{ id, email, fullName, role: "employee" | "employer" | "admin" }
```

`RequireRole` (backend mode) compares `authUser.role` to the route role. No entitlements array exists.

### Current session limitation

Sessions identify the user only. There is no server-side `activeWorkspace`. CR1 removed unsafe client role switching from the account menu; demo mode still uses `roleStorage` (sessionStorage) as a non-authoritative UX bridge.

### localStorage domain-isolation risk

Employee and Employer business data currently lives in **browser localStorage** (Phase-0 demo architecture). Same browser profile shares storage regardless of `userId` or workspace. Dual-workspace users in demo mode risk **cross-domain data bleed** until server-scoped APIs and storage replace client-only persistence. Entitlement schema does not fix this alone — WR4+ action-level authorization and domain scoping are required.

---

## C. Target entitlement model

### One user identity

- Single row in `auth_users` per account (`id`, `email`, account-level `status`).
- Account-level `status = suspended` or `deleted` blocks all workspace access regardless of entitlement rows.

### Employee entitlement

- Represented by `auth_user_roles` row with `role = employee` and lifecycle `status`.
- Grants access to `/employee/**` routes and employee-scoped APIs **only when `status = verified`** and session `active_workspace = employee` (once WR2+ implemented).
- Employee domain data scoped to this workspace (profile, CV, Work Vault, applications, etc.).

### Employer entitlement

- Represented by `auth_user_roles` row with `role = employer` and lifecycle `status`.
- Grants access to `/employer/**` routes and employer-scoped APIs **only when `status = verified`** and session `active_workspace = employer`.
- Employer domain data scoped separately (company, jobs, candidates, workforce, etc.).

### Dual verified account

- User holds two rows: `employee` + `employer`, each `status = verified`.
- Workspace switcher appears when **two verified workspace entitlements** exist (WR3).
- `active_workspace` on session selects which shell/routes are active.
- `default_workspace` in preferences selects post-login landing among verified workspaces.
- Domain records remain isolated despite shared `user_id`.

### Admin separation

- `role = admin` row is **not** a workspace entitlement for switching.
- Admin uses `AdminShell` and admin routes — outside Employee/Employer workspace switcher.
- `auth_sessions.active_workspace` must **not** reference `admin`.
- Admin may coexist on an account with employee/employer rows; admin access is governed by separate admin authorization policy (future).

### Absent entitlement

- No row for a workspace type = **absent**.
- UI may show “Add Employee Workspace” / “Add Employer Workspace” CTA (WR5).
- Onboarding creates row with `status = pending` only after explicit flow — never from checkbox or preference.

---

## D. `auth_user_roles` target schema

### Planning-level columns

| Column                | Type        | Nullable | Purpose                                                         |
| --------------------- | ----------- | -------- | --------------------------------------------------------------- |
| `id`                  | UUID        | NO       | Primary key (existing)                                          |
| `user_id`             | UUID        | NO       | FK → `auth_users(id)`                                           |
| `role`                | TEXT        | NO       | `employee` \| `employer` \| `admin`                             |
| `product_scope`       | TEXT        | NO       | Default `jobmitra`                                              |
| `status`              | TEXT        | NO       | `pending` \| `verified` \| `suspended` \| `deactivated`         |
| `is_primary`          | BOOLEAN     | NO       | **Backward compat only** — default workspace hint; not security |
| `verification_method` | TEXT        | YES      | e.g. `manual`, `kyc`, `business_review`, `seed_backfill`        |
| `verified_at`         | TIMESTAMPTZ | YES      | Set when `status` becomes `verified`                            |
| `suspended_at`        | TIMESTAMPTZ | YES      | Set when `status` becomes `suspended`                           |
| `deactivated_at`      | TIMESTAMPTZ | YES      | Set when `status` becomes `deactivated`                         |
| `granted_at`          | TIMESTAMPTZ | NO       | Row creation (existing)                                         |
| `updated_at`          | TIMESTAMPTZ | NO       | Last lifecycle change                                           |

### Keys and constraints

| Constraint                 | Definition                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary key**            | `id`                                                                                                                                                  |
| **Foreign key**            | `user_id` → `auth_users(id) ON DELETE CASCADE`                                                                                                        |
| **Unique**                 | `(user_id, role, product_scope)` — retain existing                                                                                                    |
| **CHECK role**             | `role IN ('employee', 'employer', 'admin')`                                                                                                           |
| **CHECK status**           | `status IN ('pending', 'verified', 'suspended', 'deactivated')`                                                                                       |
| **CHECK workspace status** | For `role = admin`, lifecycle rules may treat `verified` as implicit on grant; admin rows do not participate in workspace switch (service-layer rule) |

### Recommended indexes

| Index                                                | Purpose                                         |
| ---------------------------------------------------- | ----------------------------------------------- |
| `(user_id, product_scope, status)`                   | List entitlements for user                      |
| `(user_id, product_scope) WHERE is_primary = true`   | Retain existing partial index during transition |
| `(user_id, product_scope) WHERE status = 'verified'` | Resolve verified workspaces quickly             |

### Optional partial unique (service-enforced initially; DB optional later)

At most one `is_primary = true` per `(user_id, product_scope)` among rows with `status = 'verified'`. Enforce in repository until DB constraint is approved.

### Account suspension precedence

When `auth_users.status IN ('suspended', 'deleted', 'locked')` (per existing account rules):

1. Login and session validation **fail or restrict** regardless of entitlement `status`.
2. Workspace entitlements are **not evaluated** for route/API access until account is active.
3. Account suspension **overrides** all workspace entitlements.

Workspace-level `suspended` applies only when account is `active`.

---

## E. Status model

### Legal states

| Status        | Meaning                                                               |
| ------------- | --------------------------------------------------------------------- |
| `pending`     | Onboarding / verification in progress; **no workspace route access**  |
| `verified`    | Workspace may be selected as `active_workspace` / `default_workspace` |
| `suspended`   | Temporarily blocked (compliance, abuse); no access                    |
| `deactivated` | User-initiated or admin soft archive; no access; data retained        |

**Absent** is not stored — no row.

### Legal transitions and actors

| Transition                 | Actor                          | Notes                                                               |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| absent → `pending`         | User                           | Starts onboarding (`POST /workspace/:type/onboarding`); creates row |
| `pending` → `verified`     | Admin / automated verification | Sets `verified_at`, `verification_method`                           |
| `verified` → `suspended`   | Admin / system                 | Sets `suspended_at`; audit event                                    |
| `suspended` → `verified`   | Admin                          | Clears suspension; audit event                                      |
| `verified` → `deactivated` | User / admin                   | Sets `deactivated_at`; soft archive                                 |
| `deactivated` → `pending`  | User                           | Reapply flow; new verification required                             |

### Rejected onboarding

**Rejected is not a permanent `status` value.**

On verification failure:

- Store outcome in `auth_audit_events` (e.g. `workspace_onboarding_rejected`) with metadata: `workspace`, `reason`, `reviewer_id`, `reviewed_at`.
- Row may remain `pending` (awaiting resubmission) or be **deleted** per policy — never `rejected` as long-lived status.
- User may restart onboarding (`deactivated` → `pending` or delete + recreate) per product policy.

---

## F. Session workspace model

### Column: `auth_sessions.active_workspace`

| Property                  | Rule                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| Type                      | `TEXT NULL`                                                                                   |
| Allowed values            | `employee`, `employer`, or `NULL`                                                             |
| Admin                     | **Must not** be stored as `active_workspace`                                                  |
| Nullable during migration | **Yes** — existing sessions have `NULL` until first resolution                                |
| Authority                 | Server-written only via validated API                                                         |
| Lifetime                  | Cleared/revoked with session logout or revocation                                             |
| Cannot create entitlement | Setting `active_workspace` never inserts or upgrades entitlement rows                         |
| Switching                 | Requires `POST /workspace/active` (WR2): validate verified entitlement, update session, audit |

### Resolution when `active_workspace` IS NULL (transition)

On `/me` or first protected request after deploy:

1. If account not active → deny.
2. Else if `user_workspace_preferences.default_workspace` is verified → set session `active_workspace` to that value.
3. Else if exactly one verified employee/employer entitlement → set to that workspace.
4. Else if legacy `is_primary` row is verified → set to that role (if employee/employer).
5. Else → no active workspace; user remains on public/account settings until explicit switch or onboarding.

### Switching rules

- Dual verified user: switch only between verified workspaces.
- Single verified user: no switcher; `active_workspace` equals sole verified workspace.
- Pending/suspended/deactivated targets: **403** on switch attempt.

---

## G. Default workspace model

### Table: `user_workspace_preferences`

| Column              | Type        | Nullable | Purpose                                 |
| ------------------- | ----------- | -------- | --------------------------------------- |
| `user_id`           | UUID        | NO       | FK → `auth_users(id) ON DELETE CASCADE` |
| `product_scope`     | TEXT        | NO       | Default `jobmitra`                      |
| `default_workspace` | TEXT        | NO       | `employee` \| `employer`                |
| `created_at`        | TIMESTAMPTZ | NO       | Row creation                            |
| `updated_at`        | TIMESTAMPTZ | NO       | Last preference change                  |

### Keys and constraints

| Constraint      | Definition                                      |
| --------------- | ----------------------------------------------- |
| **Primary key** | `(user_id, product_scope)`                      |
| **Foreign key** | `user_id` → `auth_users(id) ON DELETE CASCADE`  |
| **CHECK**       | `default_workspace IN ('employee', 'employer')` |

### Rules

- **One row per user per product scope.**
- `default_workspace` may only reference a workspace type for which the user has a **`verified`** entitlement at update time.
- Updating default **does not** grant entitlement or change `active_workspace` on other sessions.
- Preference is **non-authoritative** for security — backend re-validates on login and on `PATCH /workspace/default`.
- Dual verified users: selector visible in Settings (WR3). Single verified user: no selector.

---

## H. Backward compatibility

| Mechanism             | Transition strategy                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `user.role` in API    | **Retain temporarily** in `/me` and login response                                                                            |
| `user.role` semantics | Maps to **verified active workspace** during transition; server computes from `active_workspace` or sole verified entitlement |
| `is_primary`          | **Retain temporarily**; backfill matches first/only verified row; deprecate after `user_workspace_preferences` populated      |
| Existing sessions     | `active_workspace NULL` → safe fallback chain (Section F)                                                                     |
| Existing users        | All current `auth_user_roles` rows backfill to `status = 'verified'`, `verified_at = granted_at`                              |
| `RequireRole`         | **No change in WR1A** — continues `authUser.role` until WR1C/WR2 gate                                                         |
| `roleStorage` (demo)  | Remains UX bridge only; not authority when backend enabled                                                                    |
| Seed script           | Future update: optional dual-row test user behind explicit staging flag (not WR1A)                                            |

---

## I. Draft SQL design

**DESIGN DRAFT ONLY — DO NOT EXECUTE**

The following SQL is for architecture review and future migration authoring. It must not be run against any database as part of WR1A.

```sql
-- DESIGN DRAFT ONLY
-- DO NOT EXECUTE
-- Packet: PHASE-WR1A-DESIGN-001
-- Purpose: Dual-workspace entitlement schema (additive, non-destructive)

-- ─── 1. Extend auth_user_roles with lifecycle columns ─────────────────────

ALTER TABLE auth_user_roles
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS verification_method TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Backfill existing rows before NOT NULL enforcement
UPDATE auth_user_roles
SET
  status = COALESCE(status, 'verified'),
  verified_at = COALESCE(verified_at, granted_at),
  verification_method = COALESCE(verification_method, 'seed_backfill'),
  updated_at = COALESCE(updated_at, granted_at)
WHERE status IS NULL;

ALTER TABLE auth_user_roles
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE auth_user_roles
  DROP CONSTRAINT IF EXISTS auth_user_roles_status_check;

ALTER TABLE auth_user_roles
  ADD CONSTRAINT auth_user_roles_status_check
  CHECK (status IN ('pending', 'verified', 'suspended', 'deactivated'));

-- Retain existing role check and unique constraint from 001_auth_persistence.sql

CREATE INDEX IF NOT EXISTS idx_auth_user_roles_user_scope_status
  ON auth_user_roles (user_id, product_scope, status);

CREATE INDEX IF NOT EXISTS idx_auth_user_roles_verified
  ON auth_user_roles (user_id, product_scope)
  WHERE status = 'verified' AND role IN ('employee', 'employer');

-- ─── 2. Add active_workspace to auth_sessions ─────────────────────────────

ALTER TABLE auth_sessions
  ADD COLUMN IF NOT EXISTS active_workspace TEXT;

ALTER TABLE auth_sessions
  DROP CONSTRAINT IF EXISTS auth_sessions_active_workspace_check;

ALTER TABLE auth_sessions
  ADD CONSTRAINT auth_sessions_active_workspace_check
  CHECK (
    active_workspace IS NULL
    OR active_workspace IN ('employee', 'employer')
  );

CREATE INDEX IF NOT EXISTS idx_auth_sessions_active_workspace
  ON auth_sessions (user_id, active_workspace)
  WHERE revoked_at IS NULL;

-- Existing sessions remain active_workspace = NULL until resolved by application layer

-- ─── 3. Create user_workspace_preferences ─────────────────────────────────

CREATE TABLE IF NOT EXISTS user_workspace_preferences (
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  product_scope TEXT NOT NULL DEFAULT 'jobmitra',
  default_workspace TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_scope),
  CONSTRAINT user_workspace_preferences_workspace_check
    CHECK (default_workspace IN ('employee', 'employer'))
);

CREATE INDEX IF NOT EXISTS idx_user_workspace_preferences_scope
  ON user_workspace_preferences (product_scope);

-- ─── 4. Safe backfill: default_workspace from is_primary (concept) ────────

-- Application-level backfill (preferred for validation):
-- For each user with exactly one verified employee OR employer entitlement,
-- insert preference row if missing.
--
-- For users with is_primary = true on a verified employee/employer row,
-- set default_workspace to that role.
--
-- Do not backfill default_workspace to a pending or suspended entitlement.

-- Example sketch (run only after application validation in WR1B):
-- INSERT INTO user_workspace_preferences (user_id, product_scope, default_workspace)
-- SELECT ur.user_id, ur.product_scope, ur.role
-- FROM auth_user_roles ur
-- WHERE ur.is_primary = true
--   AND ur.status = 'verified'
--   AND ur.role IN ('employee', 'employer')
-- ON CONFLICT (user_id, product_scope) DO NOTHING;

-- ─── 5. No destructive changes ────────────────────────────────────────────
-- - No DROP TABLE
-- - No DROP COLUMN on existing tables
-- - No modification to 001_auth_persistence.sql
-- - No hard delete of domain data on deactivation
```

---

## J. Data-isolation rules

Same `user_id` does **not** merge Employee and Employer domain records. Each record must carry workspace scope and owner identity appropriate to its domain.

### Employee workspace (scoped to verified employee entitlement)

| Domain             | Isolation rule                                                       |
| ------------------ | -------------------------------------------------------------------- |
| Profile            | Employee personal identity; not employer company profile             |
| CV                 | Employee-owned documents                                             |
| Work Vault         | Employee-owned; employer access only via approved time-limited grant |
| Applications       | Applicant identity; shift vs career pipelines separate               |
| Notifications      | Employee notification preferences                                    |
| Employment history | Career employment only after offer → accept → hire confirm           |

### Employer workspace (scoped to verified employer entitlement)

| Domain                | Isolation rule                                           |
| --------------------- | -------------------------------------------------------- |
| Company               | Business entity profile and branding                     |
| Job posts             | Shift Jobs and Career Jobs remain separate stores        |
| Candidates            | Pipeline data; no implicit access to employee Work Vault |
| Workforce / HR / team | Organization-scoped operational data                     |
| Analytics             | Employer business metrics only                           |
| Settings              | Employer workspace preferences                           |

### Cross-workspace prohibitions

- Employer APIs **must not** read employee profile, CV, or Work Vault without explicit grant.
- Employee workspace **must not** expose employer candidate pipelines, billing, or business analytics.
- Planner: recommend / propose / monitor only — **must not execute** operational commands on behalf of employer or employee domains.

### Deactivation

Workspace `deactivated` status is **soft archive**. Domain rows are retained for compliance and potential reactivation; access is denied at API layer.

---

## K. Security rules

1. **Frontend state is not authority** — `roleStorage`, `localStorage`, Zustand, and UI selection do not grant permissions.
2. **Hidden UI is not security** — removing buttons does not protect APIs.
3. **Route guards alone are insufficient** — `RequireRole` is necessary UX; every protected write/read must validate entitlement server-side (WR4).
4. **Backend checks entitlement on every protected action** — validate `user_id`, account status, entitlement `status = verified`, and session `active_workspace` match for workspace-scoped resources.
5. **Public previews grant no entitlement** — `/employee-preview` and `/employer-preview` are informational only.
6. **Simple checkbox cannot grant second workspace** — second row created only through onboarding with `pending` status; verification is admin/automated.
7. **Preferences never grant entitlement** — `default_workspace` and `active_workspace` select among verified entitlements only.
8. **Session and database are authority** — cookie session + DB entitlement rows define access.

---

## L. Migration sequence (planning only)

| Step | Phase | Activity                                                                                             |
| ---- | ----- | ---------------------------------------------------------------------------------------------------- |
| 1    | WR1A  | **This document** — schema design approval                                                           |
| 2    | WR1B  | Author executable migration `002_*` from draft; run in controlled environment                        |
| 3    | WR1B  | Backfill existing rows to `status = verified`                                                        |
| 4    | WR1B  | Repository: `listEntitlements`, status transitions, account override checks                          |
| 5    | WR1C  | Additive `/me` response: `entitlements[]`, `activeWorkspace`, `defaultWorkspace`; retain `user.role` |
| 6    | WR2   | Session `active_workspace` read/write; `POST /workspace/active`                                      |
| 7    | WR2   | `user_workspace_preferences` API; `PATCH /workspace/default`                                         |
| 8    | WR3   | Frontend switcher visibility and Settings UX                                                         |
| 9    | WR4   | Action-level API authorization per workspace                                                         |
| 10   | WR5   | Second-workspace onboarding and verification flows                                                   |
| 11   | WR6   | Deactivation, reactivation, account deletion                                                         |
| 12   | WR7   | Security regression suite                                                                            |

**WR1A does not execute step 2 or beyond.**

---

## M. Rollback strategy

### Additive-first

- New columns nullable or backfilled before `NOT NULL`.
- New table `user_workspace_preferences` can remain empty or be dropped if unused.
- `active_workspace` nullable — application ignores column if feature flag off.

### Feature flags (recommended)

| Flag                          | Purpose                       |
| ----------------------------- | ----------------------------- |
| `WM_ENTITLEMENTS_API`         | Serve extended `/me` fields   |
| `WM_SESSION_ACTIVE_WORKSPACE` | Read/write `active_workspace` |
| `WM_WORKSPACE_SWITCHER`       | Frontend switcher (WR3)       |

### Fallback to current primary role

When flags disabled:

- `getPrimaryRole()` behaviour unchanged.
- `user.role` from primary verified row.
- `active_workspace` ignored.

### No destructive rollback assumptions

- Rollback does **not** assume dropping columns in production without migration plan.
- Domain data is never hard-deleted on entitlement deactivation rollback.

---

## N. Open decisions

1. **Admin + dual workspace on one account** — allowed or forbidden in v1?
2. **DB-enforced single `is_primary`** — partial unique constraint now or service-only until WR2?
3. **Rejected onboarding row** — keep `pending` vs delete row vs `deactivated`?
4. **Reactivation from `deactivated`** — always `pending` or admin may restore `verified`?
5. **Staging dual-entitlement seed user** — single test account for QA?
6. **Timeline for localStorage → server domain APIs** — blocks true isolation in demo.
7. **WR1C Phase 2 unlock date** — when `/me` contract change is approved.

---

## O. Approval gates

| Gate     | Scope                            | Prerequisite                  | Outcome                                                             |
| -------- | -------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| **WR1A** | This design document             | CR1 containment PASS          | Operator approves schema design                                     |
| **WR1B** | Repository + migration execution | WR1A approved                 | Entitlement CRUD and backfill in DB                                 |
| **WR1C** | Phase 2 auth unlock              | WR1B + explicit operator gate | Extend `/me`, session resolution; **touches locked auth internals** |
| **WR2**  | Active/default workspace APIs    | WR1C                          | Session and preference persistence                                  |
| **WR3**  | Frontend switcher + Settings     | WR2                           | UX visibility rules                                                 |
| **WR4**  | Action-level authorization       | WR1B minimum                  | All domain APIs enforce entitlements                                |
| **WR5**  | Onboarding / verification        | WR1B                          | Second workspace flows                                              |
| **WR6**  | Lifecycle / deletion             | WR4                           | Deactivate, reactivate, delete account                              |
| **WR7**  | Security regression              | WR3–WR6                       | Full test matrix                                                    |

**Runtime implementation is not approved until the relevant gate is explicitly passed.**

---

## Document control

| Field       | Value                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Created     | 2026-07-16                                                                |
| Packet      | PHASE-WR1A-DESIGN-001                                                     |
| Supersedes  | Informal WR1 audit recommendations                                        |
| Next packet | WR1B — migration authoring and repository support (pending WR1A approval) |

---

## AI STUDIO COPY

```text
PHASE-WR1A-DESIGN-001 COMPLETE — PASS

Created: workmitra-master-docs/architecture/WR1_DUAL_WORKSPACE_ENTITLEMENT_SCHEMA_DESIGN.md

Decisions: Option A extend auth_user_roles; auth_sessions.active_workspace; user_workspace_preferences for default; is_primary temporary; admin separate; no absent status in DB; rejected = audit metadata; account suspension overrides; soft deactivation; preferences non-authoritative.

Draft SQL included in doc (DESIGN DRAFT ONLY — DO NOT EXECUTE).

No runtime code changed. No migration file created. No SQL executed. No git commit.

Verdict: PASS
```
