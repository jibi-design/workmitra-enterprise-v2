<!-- App name: WorkMitra / Job Mitra
File name: 16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md
Full file path: C:\projects\WorkMitra_Enterprise_v2\workmitra-master-docs\HOSTING_BACKEND_DATABASE_\16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md
Canonical location: HOSTING_BACKEND_DATABASE_ pack (doc 16)
Audit pointer: architecture-audits/32_BACKEND_ARCHITECTURE_v1.0.md
Status: Ch 1–22 + Appendices drafted — pending PO final approve -->

# JOB MITRA — BACKEND ARCHITECTURE v1.0

> **LEGACY DOMAIN PLAN:** This document contains historical domain assumptions (including `admin.mitralabs.app`). For current canonical decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md). API path conventions (`/v1/admin/*`, `/v1/jobmitra/*`) remain architectural reference unless superseded by a future phase.

## Document control

| Field                                       | Value                                                                                                                                                                                                                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document**                                | Job Mitra Backend Architecture v1.0 (application layer)                                                                                                                                                                                                                                       |
| **Pack**                                    | `HOSTING_BACKEND_DATABASE_` — doc **16**                                                                                                                                                                                                                                                      |
| **Status**                                  | **Ch 1–22 + Appendices drafted — pending PO final approve**                                                                                                                                                                                                                                   |
| **Content chapters**                        | **Ch 1–22 complete (draft)** — PO review before implementation                                                                                                                                                                                                                                |
| **Implementation**                          | **BLOCKED** — no login, API, DB, or auth code until full doc approved                                                                                                                                                                                                                         |
| **Date**                                    | 2026-07-04                                                                                                                                                                                                                                                                                    |
| **Inherits — infrastructure (this folder)** | `03_HOSTING_BACKEND_DATABASE_PLAN_REVIEWED.md`, `05_AUTH_AND_ROLE_PERMISSION_PLAN_REVIEWED.md`, `06_DATABASE_SEPARATION_RULES_REVIEWED.md`, `13_BACKEND_FOUNDATION_MASTER_REVIEWED.md`                                                                                                        |
| **Inherits — enterprise gates**             | `EXECUTIVE_MASTER_DECISION_DOCUMENT_v1.1.md` (v1.4+), `architecture-audits/30_DATA_OWNERSHIP_ENTERPRISE_AUDIT_v1.1.md`, `second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`, `planner/02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`, `architecture/15_BACKEND_LOGIN_MASTER_DOCUMENT_POSTING_SAFE.md` |

### Layer rule

```txt
Docs 03–13 (this folder)  = hosting, providers, foundation, Mitra Labs infra
Doc 16 (this file)        = Job Mitra application architecture (domains, entities, APIs)
Do not duplicate Render/Supabase/Cost content — reference doc 03 and 13 in Ch 21.
```

### STOP rule (this phase)

```txt
✅ Allowed now:    Architecture documentation (TOC → chapters)
❌ Not allowed:    Login pages, API code, database, auth code, backend services
```

Full document review & approval required before any implementation.

---

## Table of Contents (structure only)

> **Rule:** Chapter numbers and titles are frozen after PO + Architect sign-off.  
> Reorder only via new Decision Log entry (DEC-xxx).

| #      | Chapter                          | One-line scope (structure hint only — not final content)                                             |
| ------ | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **1**  | **Purpose, Scope & Governance**  | Why this doc exists; relationship to doc 13 + Executive Constitution §9                              |
| **2**  | **Architecture Principles**      | Non-negotiables: single SoT, idempotency, domain isolation, fail-closed security, API-first          |
| **3**  | **Domain Boundaries**            | Shift Jobs ≠ Career Jobs ≠ Planner ≠ Employment ≠ Vault ≠ Notifications; no cross-domain writes      |
| **4**  | **Service Topology**             | Logical services, boundaries, orchestration (Employer → Planner → execution domains)                 |
| **5**  | **Authentication**               | Identity, sessions, tokens; inherits doc 05; migration `roleStorage` → `authStore` (plan only)       |
| **6**  | **Authorization & RBAC**         | Roles, permissions, company scope; inherits doc 05 + doc 13 §6                                       |
| **7**  | **Entity Ownership Model**       | OWN-001..008 mapped to server records, writers, delete cascades                                      |
| **8**  | **Entity Relationships**         | ER overview: User, Shift, Career, Employment, Planner, Vault, Notification graphs                    |
| **9**  | **Career Hire State Machine**    | `CareerHireRecord` + `employment.lifecycle.created` — locked V2 contract as server truth             |
| **10** | **API Design Standards**         | REST conventions, versioning, pagination, idempotency keys, error envelope                           |
| **11** | **Event Bus & Domain Events**    | Canonical event names, ordering, delivery guarantees, cross-service contracts                        |
| **12** | **Notifications & Pulse Bridge** | Server `NotificationEvent` per user; pulse subset; domain tags (`shift` \| `career` \| `employment`) |
| **13** | **Storage & Persistence**        | PostgreSQL strategy per doc 06; tenancy; migrations; retention (OWN-007/008)                         |
| **14** | **File & Vault Handling**        | Employee-owned documents; `AccessGrant` OTP; Supabase Storage per doc 03 §5                          |
| **15** | **Audit Logs & Compliance**      | Inherits doc 13 §11; GDPR delete flow                                                                |
| **16** | **Background Jobs & Async Work** | Forecast jobs, notification dispatch, migration batches, AI inference queues                         |
| **17** | **Error Handling & Resilience**  | Retries, dead-letter, client vs server errors, observability hooks                                   |
| **18** | **Offline & Sync Strategy**      | Device cache rules, conflict resolution, read models vs write paths                                  |
| **19** | **Phase-0 Migration Path**       | localStorage keys → API endpoints; domain-by-domain cutover order                                    |
| **20** | **AI Readiness**                 | Extension points for Planner V2 (`second-update/04_...`); no AI in core path v1                      |
| **21** | **Deployment & Environments**    | **Inherits doc 03 §4** — Cloudflare Pages, Render, Supabase; dev/staging/prod                        |
| **22** | **Future Expansion Guardrails**  | Planner execution creep prevention; Shift+Career slice ban; doc 07 migration path                    |

**Chapter count:** 22 _(PO may approve 18–22 range; merge via DEC entry only)_

---

## Appendix placeholders (not numbered chapters — filled after TOC lock)

| Appendix | Purpose                                                            |
| -------- | ------------------------------------------------------------------ |
| **A**    | Entity catalog (table per entity — draft from doc 30)              |
| **B**    | API endpoint index (skeleton — no implementation)                  |
| **C**    | Event catalog (`career.*`, `shift.*`, `employment.*`, `planner.*`) |
| **D**    | localStorage key → server entity mapping matrix                    |
| **E**    | Open questions / Architect TBD (requires DEC before chapter write) |

---

## TOC approval gate

| Role               | TOC approved?                                  | Date       | Notes                                       |
| ------------------ | ---------------------------------------------- | ---------- | ------------------------------------------- |
| **Product Owner**  | ☑ TOC approved (Foundation audit PASS)         | 2026-07-04 | Ch 1 released                               |
| **Architect**      | ☑ Foundation PASS — documentation may continue | 2026-07-04 |                                             |
| **Decision Maker** | ☑ Authorized doc completion (2026-07-04)       | 2026-07-04 | Implementation after full doc + §9 sign-off |

**Draft status:** Chapters 1–22 + Appendices A–E written 2026-07-04 — **pending Product Owner final approve** before backend code.

**After all ☑:** Write chapters **in order 1 → 22**, one chapter per review cycle if needed.

**Do not start:** login UI, `apiService` live calls, database schema migration scripts, auth wiring.

---

## Version history

| Version         | Date       | Change                                                                           |
| --------------- | ---------- | -------------------------------------------------------------------------------- |
| **v1.0-toc**    | 2026-07-04 | TOC filed in `architecture-audits/32_...`                                        |
| **v1.0-toc-b**  | 2026-07-04 | **Canonical move** to `HOSTING_BACKEND_DATABASE_/16_...` (PO approved)           |
| **v1.0-ch1**    | 2026-07-04 | Chapter 1 written; stack + abstraction locked; Foundation audit PASS             |
| **v1.0-ch2**    | 2026-07-04 | Chapter 2 — Architecture Principles; global abstraction rule expanded            |
| **v1.0-ch3b**   | 2026-07-04 | Ch 3 patch — Planner propose-only; cross-domain ports; OWN-007/008 note          |
| **v1.0-p0**     | 2026-07-04 | P0 audit fixes — API prefix Option A; DEC-027 locked; OWN-007/008 aligned doc 30 |
| **v1.0-ch4-22** | 2026-07-04 | Chapters 4–22 + Appendices A–E — Decision Maker authorized completion            |

---

## Chapter 1 — Purpose, Scope & Governance

### 1.1 Purpose

This document is the **Job Mitra application-layer backend architecture**. It defines how domains, entities, APIs, events, and migrations work on top of the infrastructure pack (docs 03–13).

It exists so that:

- Backend implementation does **not** contradict OWN-001..008, Career V2 hire rules, or Planner domain scope.
- Developers have one blueprint for **what to build** after infrastructure is provisioned.
- Product Owner can approve architecture **before** any login, API, or database code ships.

**This document does not replace** doc 13 (foundation) or doc 03 (hosting providers). It **extends** them with Job Mitra-specific application design.

### 1.2 Foundation audit result (2026-07-04)

```txt
AUDIT: Backend Foundation — PASS
VERDICT: Foundation architecture approved for documentation phase.
Confidence: 98%
```

**Strengths recorded:** practical enterprise stack, vendor portability, domain separation, ownership alignment, realistic cost/scaling.

**Implementation:** Still **BLOCKED** until all chapters of this document are written, reviewed, and approved.

### 1.3 Scope — in scope

| Area                  | Covered in this document                                 |
| --------------------- | -------------------------------------------------------- |
| Domain boundaries     | Shift, Career, Planner, Employment, Vault, Notifications |
| Entity ownership      | OWN-001..008 on server                                   |
| API & event standards | REST, versioning, domain events                          |
| Auth migration plan   | `roleStorage` → server session (plan only)               |
| Phase-0 migration     | localStorage → API cutover order                         |
| Deployment reference  | Points to doc 03/21 — no duplicate provider prose        |

### 1.4 Scope — out of scope

| Area                                            | Where it lives                                          |
| ----------------------------------------------- | ------------------------------------------------------- |
| Render / Supabase / Cloudflare setup steps      | Doc 03, 07, 08                                          |
| HomeFix Mitra business logic detail             | HomeFix modules (future); separation in doc 06          |
| Planner V2 AI forecast implementation           | `second-update/04_PLANNER_...`                          |
| UI / motion / pulse component rules             | App theme + pulse registry                              |
| Kubernetes, microservices, Kafka, Redis cluster | **Explicitly rejected** for current stage (doc 12 §5.6) |

### 1.5 Locked architecture pattern

**Modular monolith** on Render with explicit layers:

```txt
React
  ↓
Cloudflare Pages (web / marketing where used)
  ↓
REST API
  ↓
Application Layer   (use-cases: apply, hire, post shift, …)
  ↓
Domain Layer        (OWN rules, Career hire state machine, invariants)
  ↓
Infrastructure Layer (adapters only — Supabase SDK lives here)
  ↓
Render (hosting)
  ↓
PostgreSQL (Supabase)  |  Object Storage (Supabase)  |  Jobs (later)
```

Locked providers (doc 12): **Render + Supabase PostgreSQL + Supabase Storage + Cloudflare Pages**. Technology stack unchanged.

### 1.6 Global infrastructure abstraction rule (mandatory)

See **Chapter 2 §2.4** for full port/adapter table. Summary: Domain/Application **never** import `supabase`, `@supabase/*`, or vendor SDKs.

Violation = architecture review fail. Doc 12 §5.7, doc 13 §9.4.

### 1.7 Governance

| Role                       | Authority                                             |
| -------------------------- | ----------------------------------------------------- |
| **Product Owner**          | Business rules, domain boundaries, approve chapters   |
| **Architect**              | Schema, API, events, security patterns                |
| **Decision Maker**         | Backend **implementation** phase start (Executive §9) |
| **Executive Constitution** | Overrides all — §9 + §9A gates                        |

**Chapter workflow:**

```txt
Write chapter N → review → approve → write chapter N+1
No skipping chapters. No implementation until full doc approved.
```

**Change control:** Structure changes (TOC) require DEC log entry. Provider changes require doc 12 + doc 03 update before code.

### 1.8 Relationship to other documents

| Document                        | Relationship                                                |
| ------------------------------- | ----------------------------------------------------------- |
| `03_HOSTING_...`                | Infrastructure providers — **inherit, do not copy**         |
| `06_DATABASE_...`               | Table naming and separation — authoritative for prefixes    |
| `13_BACKEND_FOUNDATION_...`     | Parent foundation — this doc is Job Mitra application layer |
| `30_DATA_OWNERSHIP_...`         | OWN-001..008 — authoritative for writers/delete             |
| `02_CAREER_OFFICIAL_HIRING_...` | Hire state machine — authoritative for employment create    |
| `EXECUTIVE_...`                 | Release gates — backend coding blocked until §9 complete    |

### 1.9 P1 improvements backlog (not blockers)

Document fully in later chapters; tracked here for audit:

| #    | Topic                                                    | Target chapter        |
| ---- | -------------------------------------------------------- | --------------------- |
| P1-1 | Observability (logging, metrics, tracing, health checks) | Ch 17 + Ch 21         |
| P1-2 | API versioning policy (`/v1/...`)                        | Ch 10                 |
| P1-3 | Background job / queue architecture                      | Ch 16                 |
| P1-4 | Search / index strategy for job lists                    | Ch 8 appendix + Ch 13 |
| P1-5 | Backup / restore RPO / RTO                               | Ch 15 + doc 14        |

### 1.10 Chapter 1 acceptance

- [x] Purpose and audience defined
- [x] Foundation audit PASS recorded
- [x] Scope in/out listed
- [x] Modular monolith + stack locked
- [x] Infrastructure abstraction rule stated
- [x] Governance and document map linked
- [x] Implementation remains BLOCKED

---

## Chapter 2 — Architecture Principles

### 2.1 Purpose of this chapter

Non-negotiable rules every backend module must follow. If code or a design doc violates these principles, it does not merge — regardless of schedule pressure.

### 2.2 Core principles (locked)

| #   | Principle                  | Rule                                                                                                      |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| P1  | **Single source of truth** | One server-owned record per entity (OWN-001..008). No duplicate employment, no dual notification writers. |
| P2  | **Domain isolation**       | Shift ≠ Career ≠ Planner ≠ Employment ≠ Vault. No cross-domain Zustand-style sharing on server.           |
| P3  | **Backend owns truth**     | Frontend/`localStorage` is cache or Phase-0 demo only. Permissions enforced on server.                    |
| P4  | **Fail closed**            | Missing auth, invalid role, or ambiguous ownership → reject request; never guess.                         |
| P5  | **Idempotency**            | Hire, apply, pay-adjacent, notification emit — safe to retry without duplicate rows.                      |
| P6  | **API-first**              | All product actions via REST API; no direct DB access from React app.                                     |
| P7  | **Explicit events**        | State changes emit named domain events (`career.offer.sent`, …) for notifications and audit.              |
| P8  | **Auditability**           | Admin and sensitive employer actions logged immutably (doc 13 §11).                                       |
| P9  | **Privacy by design**      | Vault bytes employee-owned; employer access via time-boxed grant only (OWN-004).                          |
| P10 | **Phase honesty**          | No fake cloud, OTP, or payment until backend exists (doc 10).                                             |

### 2.3 Layered architecture (mandatory)

All server code inside the Render deployable follows **four layers** (top to bottom):

```txt
┌─────────────────────────────────────────┐
│  API / Presentation (REST controllers)   │  HTTP, validation, auth middleware
├─────────────────────────────────────────┤
│  Application Layer                       │  Use-cases, orchestration, transactions
├─────────────────────────────────────────┤
│  Domain Layer                              │  Entities, invariants, state machines
├─────────────────────────────────────────┤
│  Infrastructure Layer                      │  Adapters, Prisma, Supabase SDK, email SDK
└─────────────────────────────────────────┘
           ↓
    PostgreSQL · Storage · (queue later)
```

**Dependency rule:** Dependencies point **downward only**.

```txt
API → Application → Domain → Infrastructure
Domain must NOT import Infrastructure implementations (use interfaces/ports).
```

### 2.4 Global infrastructure abstraction rule

**Business and Domain layers must never depend directly on infrastructure providers.**

| Port (interface)      | Adapter (v1)             | Used for                           |
| --------------------- | ------------------------ | ---------------------------------- |
| `StorageService`      | `SupabaseStorageAdapter` | Vault docs, images                 |
| `EmailService`        | `ProviderAdapter`        | Password reset, alerts             |
| `NotificationService` | `PushProviderAdapter`    | Push when enabled                  |
| `QueueService`        | `BackgroundJobAdapter`   | Async work, migration batches      |
| `SearchService`       | `SearchProviderAdapter`  | Job search / filters at scale      |
| `SecretsService`      | `EnvironmentProvider`    | API keys via Render env            |
| `CacheService`        | `CacheProvider`          | **Future** — optional in-memory v1 |
| `*Repository`         | Prisma repositories      | All SQL — no raw SDK in domain     |

**Enforcement:**

- ESLint / CI rule (future): forbid `@supabase/supabase-js` imports outside `infrastructure/`
- Code review checklist: any `supabase.` in `domain/` or `application/` = block

**Migration benefit:** Swapping Supabase Storage → Google Cloud Storage changes **one adapter file**, not hire/shift/career logic.

### 2.5 Modular monolith (not microservices)

One Node.js process on Render. Internal modules by bounded context:

```txt
modules/auth
modules/jobmitra/shift
modules/jobmitra/career
modules/jobmitra/employment
modules/jobmitra/planner
modules/jobmitra/vault
modules/jobmitra/notifications
modules/admin
infrastructure/adapters/
```

**Rejected for current stage:** Kubernetes, service mesh, Kafka, Redis cluster, multiple databases (doc 12 §5.6).

Split into separate deployables only via **DEC log entry** when metrics justify it.

### 2.6 Product and tenancy boundaries

| Boundary            | Rule                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| Job Mitra ↔ HomeFix | Never share tables or APIs without explicit product context header         |
| Employer ↔ Employee | Company-scoped data; employee cannot read other companies' pipelines       |
| Career ↔ Shift      | Separate application entities; shared `User` identity only                 |
| Planner             | Orchestration and recommendations only — no execution (hire/confirm shift) |
| Admin               | Separate auth path; never embedded in Play Store app binary                |

### 2.7 Data and transaction principles

- **Use database transactions** when one user action updates multiple rows (hire → employment + notification + audit).
- **Optimistic UI on client** is allowed; server remains authoritative on conflict.
- **Soft delete** for company/user where OWN-007/008 require grace periods; hard delete after retention rules.
- **Pagination required** on all list endpoints used by job search and applicant review.

### 2.8 Security principles

- Passwords: bcrypt/argon2; never store plaintext.
- Tokens: short-lived access + refresh rotation (detail in Ch 5).
- Rate limits on auth, OTP (when added), and apply endpoints.
- No secrets in repo; `SecretsService` / Render env only.
- UK/EU users: prefer **EU Supabase region** when project created (London/Frankfurt).

### 2.9 Observability principles (P1 — expand in Ch 17)

Even at v1, every deploy must expose:

```txt
GET /health        → liveness
GET /health/ready  → DB + storage connectivity
Structured JSON logs with requestId
```

Metrics and tracing — document fully in Ch 17; not a blocker for Ch 2 approval.

### 2.10 Principle compliance checklist

Before any module ships:

- [ ] Domain layer free of vendor SDK imports
- [ ] OWN rules respected for entity writers
- [ ] Shift/Career/Planner boundaries preserved
- [ ] Idempotent mutations where required
- [ ] Errors mapped to safe client envelope (Ch 17)
- [ ] No security by frontend route hide alone

### 2.11 Chapter 2 acceptance

- [x] Ten core principles locked
- [x] Four-layer stack defined
- [x] Global abstraction rule with full port table
- [x] Modular monolith confirmed; anti-patterns listed
- [x] Tenancy and security principles stated
- [x] Technology stack unchanged (audit PASS)

---

## Chapter 3 — Domain Boundaries

### 3.1 Purpose

Define **hard walls** between Job Mitra product domains on the server. Backend modules, database tables, API routes, and events must respect these walls — same discipline as Phase-0 frontend (Shift ≠ Career), enforced in PostgreSQL and API permissions.

**Authority:** This chapter implements Ch 2 principle **P2 (Domain isolation)** and maps to OWN-001..008.

### 3.2 Launch-visible domain map

```txt
                    ┌─────────────────┐
                    │  Platform User   │
                    │  (auth identity) │
                    └────────┬────────┘
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   EmployeeProfile    EmployerCompany      AdminUser (separate)
         │                   │
         │            ┌──────┴──────┐
         │            ▼             ▼
         │      SHIFT JOBS    CAREER JOBS
         │      (execution)   (execution)
         │            │             │
         │            └──────┬──────┘
         │                   ▼
         │            EMPLOYMENT (Career hire only)
         │
         ▼
   WORK VAULT ◄─── NOTIFICATIONS (per user)
         ▲
         │
   DEMAND PLANNER (Workforce Intelligence — orchestration only)
```

**Excluded from this chapter (not launch-visible):** Workforce Ops, HR purple domain, Manager Console, in-app Admin — separate modules; no shared tables with Shift/Career pipelines.

### 3.3 Domain catalogue

| Domain                   | Tag                                 | Primary owner                       | Server module                    | Creates employment?                        |
| ------------------------ | ----------------------------------- | ----------------------------------- | -------------------------------- | ------------------------------------------ |
| **Shift Jobs**           | `shift`                             | Company                             | `modules/jobmitra/shift`         | ❌ Never                                   |
| **Career Jobs**          | `career`                            | Company (+ employee on application) | `modules/jobmitra/career`        | ❌ (offer/hire triggers Employment domain) |
| **Employment Lifecycle** | `employment`                        | Platform Employment row             | `modules/jobmitra/employment`    | ✅ One row per Career hire                 |
| **Demand Planner**       | `planner`                           | Company                             | `modules/jobmitra/planner`       | ❌ Never                                   |
| **Work Vault**           | `vault`                             | Employee (bytes)                    | `modules/jobmitra/vault`         | ❌                                         |
| **Notifications**        | `shift` \| `career` \| `employment` | Recipient user                      | `modules/jobmitra/notifications` | ❌                                         |
| **Profile**              | `user`                              | User                                | `modules/users`                  | ❌                                         |
| **Auth**                 | —                                   | Platform                            | `modules/auth`                   | ❌                                         |

### 3.4 Shift Jobs boundary

**In scope:**

- Shift posts, applications, workspaces, completion, ratings (shift domain)
- Vault **shift history** summary write on complete (employee-owned copy)

**Hard rules:**

| Rule | Requirement                                                                          |
| ---- | ------------------------------------------------------------------------------------ |
| S1   | No `career_*` table writes from shift module                                         |
| S2   | No employment row creation from shift confirm/complete                               |
| S3   | Shift application: company owns pipeline; employee owns submission payload (OWN-002) |
| S4   | API prefix: `/v1/jobmitra/shift-jobs/...` only                                       |

**Phase-0 debt to remove:** `employerShift.employeeBridge.ts` localStorage cross-writes → replace with API reads.

### 3.5 Career Jobs boundary

**In scope:**

- Career posts, applications, offers, workspaces, pipeline stages
- Offer accept/decline (employee); hire confirm (employer) — **orchestrates** Employment create

**Hard rules:**

| Rule | Requirement                                                                   |
| ---- | ----------------------------------------------------------------------------- |
| C1   | No `shift_*` table writes from career module                                  |
| C2   | Hire blocked until `offer_accepted` (Career V2 §5.2 Q3)                       |
| C3   | `employment.lifecycle.created` fires **once** on hire confirm (idempotent)    |
| C4   | Career application: company owns pipeline; employee owns submission (OWN-003) |
| C5   | API prefix: `/v1/jobmitra/career-jobs/...`                                    |

**Forbidden:** `offered → hired` without employee accept (Phase-0 bug — server must enforce).

### 3.6 Employment Lifecycle boundary

**In scope:**

- Single `Employment` record per hire (OWN-001)
- Work diary, lifecycle events, resignation, completion — **Career-sourced only**

**Hard rules:**

| Rule | Requirement                                                                                |
| ---- | ------------------------------------------------------------------------------------------ |
| E1   | **Only** Career hire confirm creates Employment                                            |
| E2   | Shift Jobs may append vault shift history — not employment rows                            |
| E3   | No dual storage (`wm_career_employment` + `wm_employment_lifecycle` on server — one table) |
| E4   | API prefix: `/v1/jobmitra/employment/...`                                                  |

### 3.7 Demand Planner boundary

**In scope:** Plan → Predict → Recommend → Monitor (decision support)

**Hard rules:**

| Rule | Requirement                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PL1  | Planner is **separate domain** — not a sub-module of shift                                                                                                               |
| PL2  | May **recommend/propose draft** shift posts with `planId` + `source: planner`; **final post creation** by **Shift Jobs application service** after employer confirmation |
| PL3  | Must **not** confirm workers, run workspace chat, hire, payroll, attendance                                                                                              |
| PL4  | Planner tables prefixed `jobmitra_planner_*` — never columns on `jobmitra_shift_posts`                                                                                   |
| PL5  | API prefix: `/v1/jobmitra/planner/...`                                                                                                                                   |

Reference: `planner/02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`

### 3.8 Work Vault boundary

**Hard rules:**

| Rule | Requirement                                                                                   |
| ---- | --------------------------------------------------------------------------------------------- |
| V1   | Employee owns document bytes (OWN-004)                                                        |
| V2   | Employer access via `AccessGrant` + OTP — time-boxed, no permanent copy                       |
| V3   | Shift/Career history entries are **employee display copies** — system writes on domain events |
| V4   | API prefix: `/v1/jobmitra/vault/...`                                                          |
| V5   | Unify vault OTP stacks into one grant service at backend (DEC-012)                            |

### 3.9 Notifications & Pulse boundary

| Rule | Requirement                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------- |
| N1   | Server `NotificationEvent` per `recipientUserId` (OWN-005)                                      |
| N2   | Every row has `domainTag`: `shift` \| `career` \| `employment` — never mixed in one UI contract |
| N3   | Pulse is client subset of events — same server stream                                           |
| N4   | `notifyCrossRole` localStorage injection **removed** at migration — server push only            |
| N5   | API prefix: `/v1/jobmitra/notifications/...`                                                    |

### 3.10 Profile & identity boundary

| Rule | Requirement                                          |
| ---- | ---------------------------------------------------- |
| U1   | Employee profile: employee user edits only (OWN-006) |
| U2   | Employer company profile: company account only       |
| U3   | Employers cannot PATCH employee profile fields       |
| U4   | `WM ID` immutable after first issue                  |

### 3.10.1 Employee vs Employer separation (backend)

Every authenticated request carries **context**:

```txt
userId, role (employee | employer), companyId (employer only), productScope (jobmitra)
```

| Surface                     | Employee token may                                     | Employer token may                      |
| --------------------------- | ------------------------------------------------------ | --------------------------------------- |
| Shift search / apply        | ✅ Read posts, create own application                  | ❌                                      |
| Shift post / pipeline       | ❌                                                     | ✅ Own company posts + applicants       |
| Career search / apply       | ✅ Read posts, create own application                  | ❌                                      |
| Career post / hire pipeline | ❌                                                     | ✅ Own company posts + candidates       |
| Employment detail           | ✅ **Own** employment rows only                        | ✅ Employments for **own company** only |
| Vault documents             | ✅ Own vault read/write                                | ❌ Direct read — `AccessGrant` only     |
| Planner plans               | ❌ (employee uses shift/plan bundles via shift domain) | ✅ Own company plans                    |
| Notifications               | ✅ Own inbox                                           | ✅ Own company-scoped inbox             |
| Admin APIs                  | ❌                                                     | ❌                                      |

**Hard rule:** Employer APIs must **never** return another company's shift posts, applications, or employments. Employee APIs must **never** mutate employer pipeline state.

### 3.11 Cross-domain interaction matrix

**Allowed (read, event, or delegated command — never direct cross-domain repository write):**

| From → To                      | Allowed action                                                           | Mechanism                            |
| ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------ |
| Planner → Shift                | Recommend/propose **draft** posts with `planId`; Shift owns final create | App-service command → Shift use-case |
| Career hire → Employment       | Create employment row (after offer accept)                               | Event `employment.lifecycle.created` |
| Shift complete → Vault         | Shift history summary                                                    | Event → Vault service                |
| Career resign/complete → Vault | Career history summary                                                   | Event → Vault service                |
| Any domain → Notifications     | Emit with `domainTag`                                                    | Event bus                            |
| Auth → All                     | Attach `userId`, `role`, `companyId`                                     | Auth middleware                      |

**Rule:** Cross-domain actions use ports, events, read models, or app orchestration only. Direct cross-domain repository writes forbidden.

**Forbidden (hard block — return 403 or domain error):**

| Attempt                                              | Why forbidden         |
| ---------------------------------------------------- | --------------------- |
| Shift module writes Career application               | Domain violation      |
| Career module writes Shift workspace state           | Domain violation      |
| Planner confirms shift worker / sends hire           | Execution creep       |
| Employer API reads vault bytes without `AccessGrant` | OWN-004               |
| Career hire without offer accept                     | Career V2 + OWN-001   |
| Notification row with `domainTag: mixed`             | UI/contract violation |
| Admin routes in Play Store app token scope           | Security (doc 04)     |

### 3.12 API and database naming boundaries

```txt
/v1/jobmitra/auth/*            → platform auth tables
/v1/jobmitra/shift-jobs/*      → jobmitra_shift_* tables only
/v1/jobmitra/career-jobs/*     → jobmitra_career_* tables only
/v1/jobmitra/employment/*      → jobmitra_employment* tables only
/v1/jobmitra/planner/*         → jobmitra_planner_* tables only
/v1/jobmitra/vault/*           → jobmitra_vault_* tables only
/v1/jobmitra/notifications/*   → jobmitra_notification_* tables only
/homefix/*                     → homefix_* tables only (future)
/v1/admin/*                    → admin_* tables; separate auth middleware
```

**Foreign keys:** Cross-domain links use stable IDs (`userId`, `companyId`, `employmentId`, `planId`) — not embedded JSON blobs from another domain.

### 3.13 HomeFix Mitra & Admin (reference only)

| Area                | Rule                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------- |
| HomeFix             | Same PostgreSQL instance; **never** `jobmitra_*` ↔ `homefix_*` joins in product queries |
| Admin               | `admin.mitralabs.app` only; Super Admin vs Product Admin scoped (doc 04)                |
| Hidden HR/Workforce | Not in Play Store build; no API exposure in public mobile client                        |

### 3.14 Phase-0 localStorage bridges — retirement plan

| Phase-0 bridge                             | Server replacement                                       |
| ------------------------------------------ | -------------------------------------------------------- |
| `employerShift.employeeBridge.ts`          | Employee reads via shift API only                        |
| `syncToEmployeeCareerSearch`               | Employer publish → server read model for employee search |
| `careerEmploymentSideSyncService`          | Single Employment SoT — remove dual sync                 |
| `notifyCrossRole`                          | Server notification dispatch                             |
| Employer reads employee vault localStorage | Vault API + `AccessGrant`                                |

Detail in **Chapter 19 (Migration)**.

### 3.15 Domain violation examples (forbidden)

| #     | Scenario                                                             | Why violation             | Server response                          |
| ----- | -------------------------------------------------------------------- | ------------------------- | ---------------------------------------- |
| VX-1  | Shift service inserts into `jobmitra_career_applications`            | Cross-domain write        | `403 DOMAIN_VIOLATION`                   |
| VX-2  | Career `confirmHire()` when application state ≠ `offer_accepted`     | OWN-001 + Career V2       | `409 OFFER_NOT_ACCEPTED`                 |
| VX-3  | Planner endpoint sets shift workspace member to `confirmed`          | Planner execution creep   | `403 PLANNER_EXECUTION_FORBIDDEN`        |
| VX-4  | Employer downloads vault file without active `AccessGrant`           | OWN-004                   | `403 GRANT_REQUIRED`                     |
| VX-5  | Shift complete handler creates `jobmitra_employment` row             | Employment is Career-only | `403 DOMAIN_VIOLATION`                   |
| VX-6  | Play Store JWT calls `/admin/users`                                  | Admin outside public app  | `403 ADMIN_SCOPE_FORBIDDEN`              |
| VX-7  | Notification emitted with `domainTag: "mixed"`                       | Contract violation        | Reject at event bus validate             |
| VX-8  | Employer PATCH `/users/{employeeId}/profile`                         | OWN-006                   | `403 NOT_PROFILE_OWNER`                  |
| VX-9  | `careerEmploymentSideSync`-style dual write to two employment tables | Single SoT (OWN-001)      | Blocked at repository layer              |
| VX-10 | HR API exposed on same route prefix as `/jobmitra/shift-jobs`        | Hidden domain leak        | Route not registered in public app build |

### 3.16 Backend enforcement rules (mandatory)

Domain boundaries are **not** documentation-only — server must enforce:

| Layer                          | Enforcement                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| **API gateway / router**       | Route prefixes per domain; admin routes separate middleware stack                    |
| **Auth middleware**            | Attach `role`, `companyId`; reject role mismatch before handler                      |
| **Application services**       | No imports across domain modules except via published **ports** or **domain events** |
| **Repositories**               | Table access scoped to module; cross-module writes forbidden in CI lint rules        |
| **Database**                   | Foreign keys by ID only; optional DB triggers for audit — not primary enforcement    |
| **Event bus**                  | Validate `domainTag` + schema per event type before persist                          |
| **Integration tests**          | §3.18 scenarios must fail with expected error codes                                  |
| **Cross-domain orchestration** | §3.11 allowed paths only — no direct cross-module repository writes                  |

**Principle:** If enforcement exists only in React routes or localStorage, it **does not count**. Backend must fail closed.

### 3.17 Domain ownership table (OWN mapping)

| Domain entity      | Canonical owner (OWN)    | Who may write pipeline | Who may write payload |
| ------------------ | ------------------------ | ---------------------- | --------------------- |
| Shift application  | OWN-002                  | Company                | Employee (at apply)   |
| Career application | OWN-003                  | Company                | Employee (at apply)   |
| Career offer       | OWN-003                  | Company                | —                     |
| Employment         | OWN-001                  | Platform on hire event | —                     |
| Vault document     | OWN-004                  | Employee               | —                     |
| Vault grant        | OWN-004                  | System on OTP consent  | —                     |
| Notification       | OWN-005                  | System per event       | —                     |
| Employee profile   | OWN-006                  | Employee               | —                     |
| Employer company   | OWN-006                  | Company account        | —                     |
| Planner plan       | Company (planner domain) | Company                | —                     |

**OWN-007 / OWN-008:** User/company delete cascades — governed in **Chapter 15**; non-applicable to Ch 3 domain walls (explicit deferral).

### 3.18 Domain boundary tests (future QA)

- [ ] Shift API cannot POST to career application endpoints with shift token context
- [ ] Hire API returns 409 if offer not accepted
- [ ] Planner API cannot PATCH shift workspace member status
- [ ] Vault download without grant returns 403
- [ ] Employment create is idempotent on duplicate hire confirm
- [ ] Notification list filtered by `domainTag` never crosses domains in one aggregated employer feed without explicit UI merge (client concern — server still tags correctly)

### 3.19 Chapter 3 acceptance

- [x] Launch-visible domains defined with modules and API prefixes
- [x] **Employee vs Employer** separation (§3.10.1)
- [x] Shift, Career, Employment, Planner, Vault, Notifications walls documented
- [x] Planner ≠ Shift feature; Shift ≠ Career
- [x] Employment Career-only; Admin outside public app
- [x] Workforce Ops / HR / Manager hidden boundary (§3.2, §3.13)
- [x] Cross-domain allow/forbid matrix + **violation examples** (§3.15)
- [x] **Backend enforcement rules** (§3.16)
- [x] **Domain ownership table** OWN-001..008 (§3.17)
- [x] Phase-0 bridge retirement listed
- [x] HomeFix/Admin referenced without scope creep

---

## Chapter 4 — Service Topology

### 4.1 Purpose

Define how the **modular monolith** deploys on Render, how HTTP reaches domain modules, and how boundaries are enforced without microservices.

### 4.2 Runtime topology (locked)

```txt
[Browser / Capacitor Android] → HTTPS → [Cloudflare Pages] → [Render Web Service]
  → auth │ shift │ career │ employment │ planner │ vault │ notifications │ admin
  → Infrastructure adapters → [Supabase PostgreSQL] [Supabase Storage] [Email*] [Jobs*]
```

### 4.3 Module map (canonical API prefixes — Option A, aligned with Ch 3)

| Module        | API prefix                   | Owns                                                           |
| ------------- | ---------------------------- | -------------------------------------------------------------- |
| auth          | `/v1/jobmitra/auth`          | sessions, credentials                                          |
| shift         | `/v1/jobmitra/shift-jobs`    | posts, applications, workspaces                                |
| career        | `/v1/jobmitra/career-jobs`   | posts, applications, offers                                    |
| employment    | `/v1/jobmitra/employment`    | records, diary, resignation                                    |
| planner       | `/v1/jobmitra/planner`       | plans, drafts (propose-only)                                   |
| vault         | `/v1/jobmitra/vault`         | documents, grants                                              |
| notifications | `/v1/jobmitra/notifications` | bell + pulse feed                                              |
| admin         | `/v1/admin`                  | oversight (separate middleware; not in public app token scope) |

**Rule:** All Job Mitra product APIs use `/v1/jobmitra/{domain}/...`. Version major bump → `/v2/jobmitra/...`. Admin remains `/v1/admin/...` outside public mobile client scope.

Modules communicate via **application services + domain events** — no cross-module repository imports (Ch 3 §3.11).

### 4.4 Request lifecycle

HTTP → middleware (requestId, cors, rateLimit) → auth → rbac → domain router → use-case → domain validation → repository → response envelope.

### 4.5 Health: `GET /health` (liveness), `GET /ready` (DB + storage).

### 4.6 Chapter 4 acceptance

- [x] Modular monolith · [x] API prefix map · [x] No K8s/microservices · [x] Ports/events only

---

## Chapter 5 — Authentication & Session

### 5.1 Purpose

Replace Phase-0 **role pick** (`wm_app_role_v1` / `roleStorage`) with backend-verified identity. **Inherits doc 05.**

### 5.2 Auth model (v1)

| Item                     | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login                    | Email + password                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Session                  | **DEC-027 LOCKED (2026-07-04).** v1 default: **HTTP-only `Secure` cookie session** for web. **Capacitor:** use the same cookie session when the WebView cookie jar is reliable; if cookies are unsafe/unreliable on a target build, use **JWT + refresh** in **secure native storage only** (Capacitor Preferences / Keychain), never `localStorage`. Document per-platform result in implementation checklist before first login deploy. |
| Google OAuth / Phone OTP | Deferred (doc 05)                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Capacitor                | Same API; session transport per §5.4 — no `localStorage` for tokens                                                                                                                                                                                                                                                                                                                                                                       |

### 5.3 DEC-027 implementation gate

**DEC-027 / OQ-001: RESOLVED** — session model locked in §5.2 (cookie-first; Capacitor fallback documented above).

**Login implementation remains BLOCKED** until Doc 16 receives **final Product Owner approval** (Executive §9A item 11 + DEC-008).

Backend login code (`/v1/jobmitra/auth/login`, `/v1/jobmitra/auth/me`, login page, database auth schema, `roleStorage` → `authStore` wiring) must not start until that gate passes.

**Security rules (non-negotiable):**

- Frontend role state is **not** security — backend must verify identity, role, product access, and resource ownership on every protected action.
- **Admin** remains outside the public app auth flow (separate shell + routes).
- Play Store build must make **no fake login, cloud, or security claims** beyond Phase-0 honesty until real backend auth ships.

### 5.4 Session rules (required before login code)

Session design must explicitly define:

| Rule                         | Requirement                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Expiry**                   | Absolute session lifetime + idle timeout (document both values at DEC-027 lock)                      |
| **Logout**                   | Server-side session invalidation; client clears all auth artifacts                                   |
| **Refresh / rotation**       | If JWT path: refresh token rotation; if cookie path: rolling session renewal policy                  |
| **Role change**              | Any role or context binding change **invalidates** active sessions                                   |
| **Blocked / suspended user** | Immediate invalidation; `403` on all protected APIs                                                  |
| **CSRF / SameSite**          | Cookie path: `SameSite` + CSRF strategy documented; JWT path: CSRF N/A but origin checks required    |
| **Audit logging**            | Login, logout, failed login, session refresh, and forced invalidation events logged with `requestId` |

### 5.5 Entities

`User`, `UserCredential`, `Session`, `UserRoleBinding` → links to `EmployeeProfile` / `CompanyAccount`.

### 5.6 Migration plan

| Step | Phase-0                      | Target                                      |
| ---- | ---------------------------- | ------------------------------------------- |
| 1    | `wm_app_role_v1`             | Server session role                         |
| 2    | `wm_auth_token` placeholder  | Real session from `/v1/jobmitra/auth/login` |
| 3    | `ProtectedRoute` client-only | + server 401                                |
| 4    | Landing role pick            | Marketing or post-login context switch      |
| 5    | God Mode                     | Dev-only; never production APK              |

### 5.7 Fail-closed

401 unauthenticated, 403 wrong role or ownership; rate-limit login. Server authority on every protected action.

### 5.8 Frontend contract

`authStore` ← `GET /v1/jobmitra/auth/me`; `apiService` sends cookie automatically (or `Authorization` only on Capacitor JWT fallback per DEC-027). **Client mirrors UX only.**

### 5.9 Chapter 5 acceptance

- [x] Email/password locked as v1
- [x] roleStorage retirement steps listed
- [x] Fail-closed rules documented
- [x] Capacitor path tied to DEC-027 (no localStorage tokens)
- [x] **DEC-027 session model locked** (cookie-first; Capacitor fallback defined)

---

## Chapter 6 — RBAC

### 6.1 Roles: `employee`, `employer`, `admin` (launch). HomeFix roles in doc 05 — out of launch API.

### 6.2 Permissions: `resource:action:domain` (e.g. `career:offer:send`). Enforced in use-case + row scope (`company_id` / `user_id`).

### 6.3 Dual role user: `X-JobMitra-Context: employer|employee`. Admin impersonation **forbidden** v1.

### 6.4 Chapter 6 acceptance

- [x] Role separation · [x] Permission pattern · [x] Context header · [x] doc 05 aligned

---

## Chapter 7 — Entity Ownership (OWN-001..008)

| ID      | Entity                   | Writer                           |
| ------- | ------------------------ | -------------------------------- |
| OWN-001 | Employment               | Platform on hire event           |
| OWN-002 | Shift application        | Employee create; Company update  |
| OWN-003 | Career application/offer | Employee apply; Company pipeline |
| OWN-004 | Vault doc/grant          | Employee doc; System on OTP      |
| OWN-005 | Notification             | System from events               |
| OWN-006 | Profile/Company          | Self-service                     |
| OWN-007 | User delete              | User + admin (Ch 15)             |
| OWN-008 | Company delete           | Owner + cooling (Ch 15)          |

Enforcement: `assert owns → state machine → write → publish event`. DEC-011 dual-storage merges in Ch 19.

### 7.5 Chapter 7 acceptance

- [x] OWN mapped · [x] OWN-007/008 in Ch 15 · [x] enforcement pattern

---

## Chapter 8 — Entity Relationships

```txt
User → EmployeeProfile | CompanyAccount → Company
  → ShiftPost → ShiftApplication → ShiftWorkspace
  → CareerPost → CareerApplication → CareerOffer
CareerOffer (accepted) → Employment → WorkDiaryEntry
EmployeeProfile → VaultDocument → AccessGrant
```

No cross-domain FK `shift_*` ↔ `career_*`; link via `user_id` / employment only. Soft-delete preferred.

### 8.5 Chapter 8 acceptance

- [x] Hire path · [x] Shift≠Career tables · [x] Vault grants

---

## Chapter 9 — Career Hire State Machine

Implements **Career V2 §5.2**. States: `applied` → `shortlisted` → `interview?` → `offered` → `offer_accepted` → `hired`.

**409:** hire before accept (`OFFER_NOT_ACCEPTED`), duplicate hire (`ALREADY_HIRED` idempotent OK), expired offer (`OFFER_EXPIRED`), shift token on career (`DOMAIN_MISMATCH`).

Event chain: `career.offer.sent` → `career.offer.accepted_by_employee` → `career.hire.confirmed_by_employer` → `employment.lifecycle.created` → `career.workspace.opened`.

`POST /v1/jobmitra/career-jobs/applications/{id}/hire` requires `Idempotency-Key`.

### 9.6 Chapter 9 acceptance

- [x] V2 §5.2 · [x] 409 cases · [x] events · [x] idempotency

---

## Chapter 10 — API Standards

- **Canonical prefix (Option A):** `/v1/jobmitra/{domain}/...` for all Job Mitra product APIs (Ch 3 §3.12, Ch 4 §4.3). Admin: `/v1/admin/...` only.
- Breaking change → `/v2/jobmitra/...` — never silent break.
- Success: `{ data, meta }`. Error: `{ error: { code, message, details, requestId } }`.
- Codes: 401/403/404/409/422/429.
- Cursor pagination; `?domain=shift|career` on cross-cutting lists.
- OpenAPI 3.1 from routes → Appendix B.

### 10.6 Chapter 10 acceptance

- [x] versioning · [x] envelopes · [x] pagination · [x] OpenAPI

---

## Chapter 11 — Event Bus

v1 in-process; scale via Postgres **outbox** + worker (no Kafka). Naming: `{domain}.{entity}.{action}`. Payload includes `domainTag`. Consumers: NotificationService, PulseBridge, AuditLogger, EmploymentProjector. Idempotent on `eventId`.

### 11.6 Chapter 11 acceptance

- [x] transport · [x] naming · [x] domainTag · [x] outbox

---

## Chapter 12 — Notifications & Pulse

Bell = info-only. Pulse = action-required only (existing registry). Server generates from events; `domainTag` on every row. FCM/email Phase-2.

### 12.6 Chapter 12 acceptance

- [x] Bell/Pulse · [x] domainTag · [x] server-only create

---

## Chapter 13 — Storage

**StorageService** port → Supabase adapter. Buckets: `vault-private`, `company-assets`, `shift-evidence`. Flow: init → PUT → complete. No service-role in client.

### 13.5 Chapter 13 acceptance

- [x] abstraction · [x] vault private · [x] secure upload

---

## Chapter 14 — Vault & AccessGrant

OWN-004. OTP consent flow; signed URL while grant valid; revoke anytime; merge dual OTP (DEC-012). `DocAccessLog` append-only.

### 14.4 Chapter 14 acceptance

- [x] OWN-004 · [x] OTP · [x] DEC-012

---

## Chapter 15 — Audit, GDPR & Deletes (OWN-007 / OWN-008)

**Inherits:** `architecture-audits/30_DATA_OWNERSHIP_ENTERPRISE_AUDIT_v1.1.md` — locked rules below must match exactly.

### 15.1 Audit log

Append-only `audit_events`: actor, action, `aggregateId`, `before`/`after` hash, `requestId`, timestamp. Retained per §15.4.

### 15.2 OWN-007 — User delete (employee or employer account)

| Rule                       | Locked behavior                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **Delete request**         | User-initiated; **irreversible after 30-day grace**                                    |
| **Active employment**      | **Block** delete until employment `completed` or legally transferred                   |
| **Applications in flight** | Auto-withdraw; anonymize applicant PII on employer-visible copies                      |
| **Cascade**                | Profile, vault documents, device caches, pending notifications removed per policy      |
| **Anonymized retain**      | Completed employment summaries + audit logs — **7 years** (configurable), PII stripped |
| **Sessions**               | All sessions revoked immediately on delete confirm; grace period allows restore once   |

Export (GDPR): `GET /v1/jobmitra/auth/me/export` — JSON bundle.

### 15.3 OWN-008 — Company (employer) delete

| Rule                   | Locked behavior                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| **Trigger**            | Employer admin delete company account                                                     |
| **Active employments** | **Block** company delete until **all** resolved (complete or transfer) — HTTP **409**     |
| **Active posts**       | Archive (not hard delete); hidden from search                                             |
| **Applications**       | Freeze pipeline; notify employees via bell                                                |
| **Grace period**       | **30-day soft-delete**; restore allowed **once**                                          |
| **After grace**        | Hard delete company data; employee-owned vault and employment history handled per OWN-007 |

### 15.4 Retention (aligned with doc 30 §5)

| Data class                                | Retention                |
| ----------------------------------------- | ------------------------ |
| Rejected applications                     | 12 months then anonymize |
| Completed employment (anonymized summary) | **7 years**              |
| Vault documents                           | Until user deletes       |
| Notifications                             | 90 days on server        |
| OTP / access grants                       | 30 minutes session max   |

### 15.5 Chapter 15 acceptance

- [x] OWN-007 matches doc 30 (30-day grace, 7-year anonymized retain, employment block)
- [x] OWN-008 matches doc 30 (30-day soft-delete, employment block, archive posts)
- [x] Audit append-only
- [x] Export path documented

---

## Chapter 16 — Background Jobs

Outbox dispatcher (1m), offer/grant expiry (hourly), notification/session cleanup (daily). Render cron + `QueueService` port. No long work on HTTP thread.

### 16.4 Chapter 16 acceptance

- [x] job list · [x] cron · [x] QueueService

---

## Chapter 17 — Error Handling & Observability

JSON logs with requestId; metrics: latency, 4xx/5xx, outbox lag; alerts on 5xx spike / DB / backlog. Client maps `error.code` — no stack traces.

### 17.5 Chapter 17 acceptance

- [x] logging · [x] metrics · [x] safe errors

---

## Chapter 18 — Offline & Sync

Online-first. Cached read lists OK; apply/hire/vault grant require network. Work diary optional offline queue (P1). Conflicts: server wins on employment/hire.

### 18.4 Chapter 18 acceptance

- [x] online-first · [x] no offline hire · [x] conflict rule

---

## Chapter 19 — Phase-0 Migration

| Wave         | Keys                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| 0 Auth       | `wm_app_role_v1`, `wm_auth_token`                                                                    |
| 1 Shift      | `wm_employer_shift_posts_v1`, `wm_employee_shift_applications_v1`, `wm_employee_shift_workspaces_v1` |
| 2 Career     | `wm_career_applications_v1`, profiles                                                                |
| 3 Employment | lifecycle storage → API                                                                              |
| 4 Vault      | `wm_work_vault_documents_v1`, `wm_doc_access_log_v1`                                                 |
| 5 HR hidden  | `wm_hr_*`, attendance, etc.                                                                          |

READ: API first → localStorage fallback during flag → remove. WRITE: API only when flag on. Import: `POST /v1/migrate/import-local` (staging). Flags: `shift.backend_enabled`, `career.backend_enabled`.

### 19.5 Chapter 19 acceptance

- [x] waves · [x] keys · [x] no dual-write · [x] flags

---

## Chapter 20 — AI Readiness

AI uses read models / planner proposals only. Allowed: smart match, forecast, screening assist (audited). Forbidden: auto-hire, cross-domain training without anonymization, vault without grant.

### 20.4 Chapter 20 acceptance

- [x] boundaries documented

---

## Chapter 21 — Deployment

Inherits **doc 03**. Envs: development, staging, production. Secrets via `SecretsService` / Render env. CI: lint+test PR; staging auto; prod manual DM approve.

### 21.5 Chapter 21 acceptance

- [x] doc 03 · [x] envs · [x] deploy gates

---

## Chapter 22 — Future Guardrails

Rejected now: microservices, K8s, Kafka, Redis cluster, GraphQL-only, shared Shift+Career tables. Changes need DEC + doc 16 version bump. HomeFix separate namespace (doc 06). HR/Workforce hidden until launch flags.

### 22.5 Chapter 22 acceptance

- [x] rejection list · [x] change control

---

## Appendix A — Entity Catalog (draft)

`users`, `shift_posts`, `shift_applications`, `shift_workspaces`, `career_posts`, `career_applications`, `career_offers`, `employments`, `work_diary_entries`, `vault_documents`, `access_grants`, `notifications`, `planner_plans` — fields from doc 30 at migration time.

---

## Appendix B — API Index (skeleton)

| Method   | Path                                                      | Module        |
| -------- | --------------------------------------------------------- | ------------- |
| POST     | `/v1/jobmitra/auth/register`                              | auth          |
| POST     | `/v1/jobmitra/auth/login`                                 | auth          |
| POST     | `/v1/jobmitra/auth/logout`                                | auth          |
| GET      | `/v1/jobmitra/auth/me`                                    | auth          |
| GET/POST | `/v1/jobmitra/shift-jobs/posts`                           | shift         |
| POST     | `/v1/jobmitra/shift-jobs/applications`                    | shift         |
| GET/POST | `/v1/jobmitra/career-jobs/posts`                          | career        |
| POST     | `/v1/jobmitra/career-jobs/applications`                   | career        |
| POST     | `/v1/jobmitra/career-jobs/applications/{id}/offer`        | career        |
| POST     | `/v1/jobmitra/career-jobs/applications/{id}/accept-offer` | career        |
| POST     | `/v1/jobmitra/career-jobs/applications/{id}/hire`         | career        |
| GET      | `/v1/jobmitra/employment/{id}`                            | employment    |
| POST     | `/v1/jobmitra/vault/documents`                            | vault         |
| POST     | `/v1/jobmitra/vault/grants/confirm`                       | vault         |
| GET      | `/v1/jobmitra/notifications`                              | notifications |
| GET/POST | `/v1/jobmitra/planner/plans`                              | planner       |

_Full OpenAPI generated at implementation — expand after prefix lock (P1)._

---

## Appendix C — Event Catalog (draft)

`shift.application.submitted`, `career.offer.sent`, `career.offer.accepted_by_employee`, `career.hire.confirmed_by_employer`, `employment.lifecycle.created`, `vault.grant.issued`, `planner.plan.proposed` — see Ch 11.

---

## Appendix D — localStorage Mapping

| Key                                 | Entity              | Wave |
| ----------------------------------- | ------------------- | ---- |
| `wm_app_role_v1`                    | Session             | 0    |
| `wm_employer_shift_posts_v1`        | ShiftPost[]         | 1    |
| `wm_employee_shift_applications_v1` | ShiftApplication[]  | 1    |
| `wm_career_applications_v1`         | CareerApplication[] | 2    |
| `wm_work_vault_documents_v1`        | VaultDocument[]     | 4    |
| `wm_employee_profile_v1`            | EmployeeProfile     | 2    |
| `wm_employer_profile_v1`            | Company             | 2    |

---

## Appendix E — Open Questions

| ID     | Question               | DEC                                                       |
| ------ | ---------------------- | --------------------------------------------------------- |
| OQ-001 | Cookie vs JWT session  | **DEC-027 LOCKED** — cookie-first; Capacitor JWT fallback |
| OQ-002 | Diary offline queue    | PO                                                        |
| OQ-003 | Offer expiry days      | PO                                                        |
| OQ-004 | pg_cron vs Render jobs | Architect                                                 |
| OQ-005 | Migration flag scope   | DM                                                        |

---

## Document completion checklist

| Item                                    | Status                               |
| --------------------------------------- | ------------------------------------ |
| Ch 1–22                                 | ☑ Draft + P0 fixes 2026-07-04        |
| Appendices A–E                          | ☑ Draft (B expanded per prefix lock) |
| P0 fixes (prefix, DEC-027, OWN-007/008) | ☑ Applied                            |
| PO final approve                        | ☐ Pending                            |
| Backend code                            | ☐ BLOCKED until PO + §9              |

**After PO approve:** DEC-008 → login + `/v1/jobmitra/auth` per Ch 5.

---

_End of Job Mitra Backend Architecture v1.0 — draft pending Product Owner sign-off._
