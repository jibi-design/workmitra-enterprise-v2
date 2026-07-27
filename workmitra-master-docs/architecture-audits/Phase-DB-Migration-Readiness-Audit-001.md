# WorkMitra — Phase-DB-Migration-Readiness-Audit-001

| Field   | Value                                                                                                                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status  | **LOCKED FINDINGS** — Phases 1–3 remediation applied where approved                                                                                                                           |
| Date    | 2026-07-20                                                                                                                                                                                    |
| Mode    | Original audit: read-only. Remediation: Phase 1–3 as approved                                                                                                                                 |
| Repo    | `C:\projects\WorkMitra_Enterprise_v2`                                                                                                                                                         |
| Verdict | **NOT READY for full DB cutover.** Auth + Career gate + Vault OTP schemas exist; ~90–95% product logic still localStorage. Shift/Planner/HR had no schema (design SQL added, not executable). |

---

## Executive Summary

| Area                    | Status                                                       |
| ----------------------- | ------------------------------------------------------------ |
| Client storage SoT      | Dominant (~110 keys, ~420 localStorage call sites)           |
| Backend                 | Custom Node `http` + `pg` (no Express/ORM)                   |
| Auth DB                 | Ready (optional via `VITE_AUTH_BACKEND_ENABLED`)             |
| Career DB               | Partial gate only; UI unwired (MIG-003 deferred)             |
| Vault DB                | OTP/sessions only; documents still local                     |
| Shift / Planner / HR    | Design SQL only (`004_shift_lifecycle.sql` — DO NOT EXECUTE) |
| Scale to 100k employees | Impossible on localStorage                                   |

---

## TASK A — Storage Inventory

| Metric                      | Count                                                       |
| --------------------------- | ----------------------------------------------------------- |
| `localStorage` call sites   | ~420 / ~155 files                                           |
| `sessionStorage` call sites | ~30 / 8 files                                               |
| Unique keys                 | ~110                                                        |
| `*Storage*.ts` modules      | ~75                                                         |
| Zustand persist             | 1 — `authStore` → `wm-auth-storage` (when auth backend off) |

**Central helpers:** `careerStorageUtils`, `vaultStorageUtils`, `plannerSafeStorage`, `employerShift.keys`, `employmentStorageHelpers`, `workforceStorageUtils`, `pulseStorage`.

**Top risks (pre–MIG-004):**

1. Hot keys touched from many files without one gate
2. Key alias orphans (reader ≠ writer)
3. Admin nuclear `localStorage.clear()`
4. Mixed naming: `wm_*_v1`, `wm:`, `wm-`, `jm_*`

**MIG-004 remediation:** alias orphans standardized (see Remediation Log).

---

## TASK B — Backend Framework / API / Auth / DB

| Item      | Finding                                                       |
| --------- | ------------------------------------------------------------- |
| Framework | None — raw `http.createServer` (`server/index.ts`, port 3001) |
| Adapter   | `pg` Pool only — no Prisma/Drizzle                            |
| Auth      | Cookie `wm_session` (opaque); Argon2id; no JWT                |
| Modes     | `AUTH_USER_SOURCE=memory\|db`                                 |

**APIs live:** `/v1/jobmitra/auth/{login,logout,me}`, Career offer/accept/decline/confirm-hire, Vault OTP generate/verify/sessions  
**APIs stub (501):** Career jobs list/create/apply/shortlist  
**Missing:** Shift, Planner, HR, Admin routes

**Actual Career gate paths (not the early plan paths):**

- `POST /v1/jobmitra/employer/career/applications/:applicationId/offer`
- `POST /v1/jobmitra/employer/career/applications/:applicationId/confirm-hire`
- `POST /v1/jobmitra/employee/career/applications/:applicationId/offer/accept`
- `POST /v1/jobmitra/employee/career/applications/:applicationId/offer/decline`

---

## TASK C — Schema Readiness

| Migration                   | Tables                                                     | Status                                                   |
| --------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| `000_schema_migrations.sql` | `schema_migrations` tracker                                | Added (MIG-006); migrator not yet writing rows           |
| `001_auth_persistence.sql`  | users, roles, sessions, audit, login_attempts              | Ready                                                    |
| `002_career_lifecycle.sql`  | posts, applications, offers, employments, lifecycle_events | Gate ready; CRUD incomplete                              |
| `003_work_vault.sql`        | otps, sessions, access_log                                 | Authz ready; no document/blob tables                     |
| `004_shift_lifecycle.sql`   | shift_posts, applications, workspaces, events              | **Design only — DO NOT EXECUTE** (MIG-002)               |
| `supabase/...pulse...`      | notification_* + RLS                                       | Schema only; FKs to Supabase `auth.users` ≠ `auth_users` |

**Gaps remaining:** No automatic migration version ledger wiring in `migrate.ts`; Career UI unwired; no vault blob tables; Shift SQL must not be applied until Phase 5.

---

## TASK D — Frontend Migration-Readiness

| Item            | Finding                                                      |
| --------------- | ------------------------------------------------------------ |
| API client      | `apiService.ts` — native `fetch`, Vite proxy `/v1` → `:3001` |
| Consumers       | Only `authService`                                           |
| Domain services | ~50 — almost all localStorage                                |
| Estimate        | ~90–95% still client-local                                   |

---

## TASK E — Domain Migration Map

| Domain             | Backend         | Risk     | Notes                                 |
| ------------------ | --------------- | -------- | ------------------------------------- |
| Auth               | Yes             | Low–Med  | Opt-in flag                           |
| Career             | Partial         | High     | UI unwired; MIG-003 deferred          |
| Employment         | Partial         | High     | Hire fan-out multi-store              |
| Work Vault         | Partial         | High     | Docs local; dual OTP (MIG-008 warned) |
| Shift              | Design SQL only | High     | Not executable                        |
| Planner            | No              | High     | Coupled to Shift confirm              |
| HR / Workforce     | No              | High     | Employer-scoped, not a role           |
| Pulse / Notifs     | Schema only     | Med–High | Identity mismatch (MIG-005)           |
| Profile / Settings | No              | Med      |                                       |
| Admin              | No              | Med      | Clear guarded (MIG-010)               |

---

## TASK F — Auth & RBAC

- Roles: `employee` \| `employer` \| `admin` only — no `hr` role
- Frontend: `RequireRole` + `ProtectedRoute`
- Backend: `requireAuth` + `requireRole*` — never trust client role
- Phase-2 UI gated by `showPhase2Features = DEV` only

**Blockers:** demo IDs vs auth UUIDs; shared LS dual-tab model; Career/Vault API ahead of UI; Shift not API-ready; Pulse uses different auth identity.

---

## TASK G & H — Career / Shift Lifecycle Safety

**Separation:** Confirmed (separate trees/keys; SQL forbids Shift on Career tables).

**Career (client):** `applied → … → offer_accepted → hired` via `canTransition`; multi-key activation + rollback.  
**Career (server):** Parallel 3-step gate — UI not calling it.  
**Shift (client only):** `confirmCandidate` saga with compensation — no server.

**Status mapping (MIG-009):** Client enums preserved. Maps live at `src/features/career/utils/careerStatusMapping.ts`.

---

## TASK I — Work Vault Migration

| Layer                   | Status                                                            |
| ----------------------- | ----------------------------------------------------------------- |
| Client folders/docs/OTP | localStorage (plaintext OTP path)                                 |
| Server OTP/sessions/log | Argon2 hash + transactional verify                                |
| Document blobs          | Not in DB                                                         |
| History                 | `wm_vault_career_history_v1`, `wm_vault_shift_history_v1` — local |

**MIG-008:** Client vault OTP files marked with DEC-012 / MIG-008 warning comments.

---

## TASK J — Demo Data Handling

| Source                       | Behavior                                  |
| ---------------------------- | ----------------------------------------- |
| Memory auth                  | Demo users when `AUTH_USER_SOURCE=memory` |
| `shiftWorkspace.demoSeed.ts` | Seeds employee workspaces once            |
| Home / shift demo keys       | Local demo content                        |
| `db:seed` / `db:seed:career` | Staging users + career gate fixtures      |

**Recommendation:** Treat all LS demo as non-migratable. Production cutover = empty DB + seed scripts only.

---

## TASK K — Proposed API Plan (phased)

```
Phase 0  Auth (done) — stabilize UUID identity
Phase 1  Career gate UI wire + finish stubs (jobs/apply/list)  ← MIG-003 deferred until blockers clear
Phase 2  Employment projections (staff/HR/lifecycle from hire event)
Phase 3  Vault OTP UI → server; then document storage
Phase 4  Pulse/notifications (unify identity first — MIG-005)
Phase 5  Shift schema + confirm saga as server transaction (then apply 004)
Phase 6  Planner (after Shift SoT)
Phase 7  HR/Workforce/Admin APIs
```

---

## TASK L — Scale & Performance

| Constraint                     | Impact at 100k / 50k            |
| ------------------------------ | ------------------------------- |
| localStorage ~5MB              | Hard fail long before 100k      |
| O(n) JSON.parse of full arrays | UI freezes at thousands of apps |
| No indexes client-side         | Full scan “queries”             |
| Dual-tab shared LS             | Not multi-tenant                |

**Bottlenecks (predicted):** Shift applications list, notification bag, vault aggregators, planner public index, confirm saga multi-key writes.

---

## TASK M — Recommended Migration Strategy

1. Strangler fig — domain by domain, not big-bang
2. Auth-first — all new rows FK to `auth_users.id`
3. Career gate first (schema already matches product V2) — wire UI only after UUID + auth
4. No dual-write longer than one release
5. Shift last among P0 product — apply `004` only in Phase 5
6. Idempotent hire/confirm on server
7. Key aliases fixed (MIG-004 done)
8. Wire `migrate.ts` to `schema_migrations` table (future)
9. `.env.example` restored (MIG-007 done)

---

## TASK N — Verification Plan

| Gate        | Check                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Pre-migrate | Inventory keys; types/lint/build                                        |
| Auth        | `db:migrate` (001–003 only) + seed + login E2E                          |
| Career      | seed:career + offer → accept → confirm-hire against API (after MIG-003) |
| Vault       | OTP against DB; remove client plaintext path                            |
| Shift       | Apply 004 only after Phase 5 approval + API                             |
| Regression  | `npm run test:e2e:headless` → 15/15 on LS path until cutover            |
| Scale       | API load 1k → 10k → 100k after SoT is server-side                       |

---

## Issues Register

| ID      | Severity | Issue                                             | Remediation                                             |
| ------- | -------- | ------------------------------------------------- | ------------------------------------------------------- |
| MIG-001 | P0       | ~95% domains still LS SoT                         | Strategy only — ongoing                                 |
| MIG-002 | P0       | No Shift schema                                   | Design SQL `004_shift_lifecycle.sql` (DO NOT EXECUTE)   |
| MIG-003 | P0       | Career/Vault UI unwired                           | **DEFERRED** — auth UUID, hire fan-out, cookie blockers |
| MIG-004 | P1       | Storage key alias orphans                         | **DONE** — standardized to `wm_*_v1`                    |
| MIG-005 | P1       | Dual auth identity (`auth.users` vs `auth_users`) | Comment on Supabase pulse migration                     |
| MIG-006 | P1       | No migration version ledger                       | **DONE** — `000_schema_migrations.sql`                  |
| MIG-007 | P1       | Missing `.env.example`                            | **DONE**                                                |
| MIG-008 | P2       | Vault dual OTP stacks                             | Warning comments on 16 client vault OTP files           |
| MIG-009 | P2       | Career status enum drift                          | Mapping file only — no client rename                    |
| MIG-010 | P2       | Admin `localStorage.clear`                        | Confirm guard + DANGER comments                         |

---

## Remediation Log (Phases 1–3)

### Phase 1

- **MIG-007:** `.env.example` created (placeholders only)
- **MIG-006:** `server/db/migrations/000_schema_migrations.sql` (`id`, `filename`, `applied_at NOT NULL DEFAULT NOW()`)
- **MIG-004 aliases:**
  - `wm_career_applications_v1` → `wm_employee_career_applications_v1`
  - `wm:employer-profile` → `wm_employer_profile_v1` (legacy migrate-on-read)
  - `wm_task_assignments_v1` / `wm_hr_task_assignments_v1` → `wm_task_assignment_v1`
  - `wm_hr_incident_reports_v1` → `wm_incident_reports_v1`
  - `wm_work_vault_documents_v1` → `wm_employee_vault_documents_v1`
  - `wm_employer_ratings_v1` → `wm_ratings_worker_to_employer_v1` (`stars`)
- Also: `stress-test-simulation.ts` lint cleanup

### Phase 2 (Option C)

- **MIG-003:** Deferred (blockers listed above)
- **MIG-009:** `src/features/career/utils/careerStatusMapping.ts` — `SERVER_TO_CLIENT_STATUS` / `CLIENT_TO_SERVER_STATUS`

### Phase 3

- **MIG-002:** `server/db/migrations/004_shift_lifecycle.sql` — 4 tables + DO NOT EXECUTE header
- **MIG-005:** Comment on `supabase/migrations/202606210001_create_pulse_notification_tables.sql`
- **MIG-008:** 16 client vault OTP files commented
- **MIG-010:** `AdminSettingsPage.tsx` + `AdminHomePage.tsx` — `window.confirm` before `localStorage.clear()`

---

## Contract Snapshot (Career gate — why MIG-003 deferred)

| Concern            | Server                            | Client                  | Match   |
| ------------------ | --------------------------------- | ----------------------- | ------- |
| Paths              | `.../applications/:id/offer` etc. | No HTTP                 | NO      |
| Offer body         | `{ terms?, expires_at? }`         | `CareerOfferInput` flat | PARTIAL |
| Accept key         | `applicationId`                   | `jobId`                 | NO      |
| Status after offer | `offer_issued`                    | `offered`               | NO      |
| Decline status     | `offer_declined`                  | `withdrawn`             | NO      |
| Hire side effects  | `career_employments`              | Multi-store fan-out     | NO      |
| Identity           | `auth_users` UUID                 | Demo string IDs         | NO      |

Overall contract match: **NO**

---

## Overall Recommendation

**Do not start full DB migration coding until:**

1. Auth UUID identity locked for all new work
2. Career UI wired only after identity + hire projection plan (MIG-003)
3. Shift schema (`004`) applied only after Phase 5 API approval
4. Client vault OTP path removed (MIG-008)
5. Pulse identity unified with `auth_users` (MIG-005)

**Safer order:** Auth stable → Career API+UI → Employment/HR projections → Vault OTP → Pulse → Shift/Planner.

---

## Document Control

| Version | Date       | Notes                                                              |
| ------- | ---------- | ------------------------------------------------------------------ |
| 001     | 2026-07-20 | Initial audit + Phase 1–3 remediation recorded from Cursor session |

_Generated from chat audit findings (Option B). Source session: Phase-DB-Migration-Readiness-Audit-001._
