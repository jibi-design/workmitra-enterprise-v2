# 12. Decision Locks

> **LEGACY DOMAIN PLAN:** This document contains historical domain assumptions (`mitralabs.app`, `jobmitra.app`, `admin.mitralabs.app`). For current canonical decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md).

## 1. Final Decision

### 1.1 Purpose

This document records the locked Mitra Labs architecture, product, backend, database, admin, UI, and safety decisions.

### 1.2 Lock Rule

These decisions must not be changed casually.

Any future change must be reviewed, approved, and documented before implementation.

### 1.3 Implementation Rule

Backend, login, database, admin, hosting, and production work must follow these locked decisions.

## 2. Brand and Product Locks

### 2.1 Parent Company Brand

Locked decision:

```txt
Mitra Labs
```

### 2.1A UniCard / Mitra Labs ID (Option A — 2026-08-08)

Canonical lock:

```txt
../architecture/UNICARD_MITRA_LABS_ID_OPTION_A_LOCK_v1.0.md
```

Locked decisions:

```txt
Public UniCard ID format: ML-XXXX-ABC-XXXX
No product codes (JM / WM / etc.) inside the public ID string
Product provenance: source_app metadata in user DB schema
ML ID minting: client → server during backend DB migration
Auth UUID remains the security principal
```

### 2.2 Products

Locked products:

```txt
Job Mitra
HomeFix Mitra
```

### 2.3 Correct App Name

Correct product name:

```txt
Job Mitra
```

Do not use:

```txt
Mitra Jobs
```

### 2.4 Future Product Rule

Future products can be added under Mitra Labs, but they must follow product separation, admin separation, and data separation rules.

## 3. Domain and Admin Locks

### 3.1 Company Domain Direction

Recommended company domain direction:

```txt
mitralabs.app
```

### 3.2 Product Domain Direction

Recommended product domain direction:

```txt
jobmitra.app
homefixmitra.app
```

### 3.3 Admin Portal

Locked decision:

```txt
admin.mitralabs.app
```

### 3.4 Admin Domain Rule

Admin does not need a separate domain.

Admin must be a private and secure subdomain under Mitra Labs.

### 3.5 Public App Rule

Admin must not be inside public mobile apps.

## 4. Admin Role Locks

### 4.1 Super Admin

Locked decision:

```txt
Super Admin must exist.
```

Super Admin can manage:

```txt
all products
all websites
all admins
all permissions
all reports
all audit logs
global settings
```

### 4.2 Product Admin

Product Admin can manage only the assigned product.

Examples:

```txt
Job Mitra Admin = Job Mitra only
HomeFix Mitra Admin = HomeFix Mitra only
```

### 4.3 Website Admin

Website Admin can manage only assigned website content.

### 4.4 Support / Moderator

Support or Moderator can manage only assigned support/moderation tasks.

## 5. Backend and Hosting Locks

### 5.1 Backend Technology

Locked decision:

```txt
Node.js + TypeScript
```

### 5.2 Backend Hosting

Locked initial hosting:

```txt
Render
```

### 5.3 Frontend Hosting

Locked frontend hosting direction:

```txt
Cloudflare Pages
```

### 5.4 Storage Direction

Initial storage direction:

```txt
Supabase Storage
```

### 5.5 Backend Ownership Rule

Backend must own:

```txt
auth
role checks
permissions
business rules
database access
admin actions
audit logs
```

### 5.6 Architecture pattern lock (2026-07-04)

Locked decision:

```txt
Modular monolith on Render (single Node.js + TypeScript deployable)
```

**Not approved for current stage:**

```txt
Kubernetes
Microservices split
Multiple databases
Kafka
Redis cluster
```

Migrate or split only when scale justifies — via new DEC entry.

### 5.7 Global infrastructure abstraction rule (2026-07-04 — expanded)

**Global rule:** Business and Domain layers must **never** depend directly on infrastructure providers (Supabase, Render, SendGrid, etc.).

Only the **Infrastructure layer** imports vendor SDKs. All other layers depend on **ports (interfaces)**.

| Port (interface)              | Adapter (v1 implementation)              | Notes                                  |
| ----------------------------- | ---------------------------------------- | -------------------------------------- |
| `StorageService`              | `SupabaseStorageAdapter`                 | Vault files, profile images            |
| `EmailService`                | `ProviderAdapter` (e.g. SendGrid/Resend) | Transactional email                    |
| `NotificationService`         | `PushProviderAdapter`                    | FCM/APNs when live push added          |
| `QueueService`                | `BackgroundJobAdapter`                   | In-process → queue later               |
| `SearchService`               | `SearchProviderAdapter`                  | Postgres FTS → dedicated search later  |
| `SecretsService`              | `EnvironmentProvider`                    | Render env vars; Secret Manager later  |
| `CacheService`                | `CacheProvider`                          | **Future** — in-memory first if needed |
| `DatabaseRepository` / Prisma | `SupabasePostgresAdapter`                | Via Prisma — not raw SDK in domain     |

```txt
❌ domain/career/hireCandidate.ts → supabase.from('employment').insert(...)
✅ domain/career/hireCandidate.ts → employmentRepository.create(...)
✅ infrastructure/supabase/...Adapter.ts → supabase / Prisma client
```

**Folder rule:**

```txt
src/modules/*/domain/       ← no vendor imports
src/modules/*/application/  ← orchestrates domain; uses ports only
src/infrastructure/adapters/ ← vendor SDKs allowed here only
```

Violation = architecture review **FAIL**.

### 5.8 Locked request flow (2026-07-04 — layered)

```txt
React (Play Store app + web client)
        │
Cloudflare Pages (marketing / web shell where used)
        │
        ▼
REST API  (/v1/...)
        │
        ▼
┌───────────────────────────────────────┐
│  APPLICATION LAYER (use-cases)        │  hireCandidate, applyToShift, …
├───────────────────────────────────────┤
│  DOMAIN LAYER (rules + entities)      │  OWN rules, state machines
├───────────────────────────────────────┤
│  INFRASTRUCTURE LAYER (adapters)      │  Supabase*, Prisma, FCM, …
└───────────────────────────────────────┘
        │
        ▼
Render (hosting — runs the Node.js process)
        │
 ┌──────┴──────┬──────────────┐
 ▼             ▼              ▼
PostgreSQL   Object Storage   Background jobs
(Supabase)   (Supabase)       (in-process → queue)
```

Confidence: **98%** — locked for documentation and future implementation.

## 6. Database Locks

### 6.1 Database Type

Locked decision:

```txt
PostgreSQL
```

### 6.2 Initial Database Provider

Locked initial provider:

```txt
Supabase PostgreSQL
```

### 6.3 Future Database Upgrade

Future upgrade path:

```txt
Google Cloud SQL PostgreSQL
```

### 6.4 ORM Direction

Recommended ORM:

```txt
Prisma
```

### 6.5 Data Separation Lock

Job Mitra and HomeFix Mitra data must never mix.

## 7. Future Google Cloud Lock

### 7.1 Future Backend Upgrade

Future backend upgrade path:

```txt
Render -> Google Cloud Run
```

### 7.2 Future Database Upgrade

Future database upgrade path:

```txt
Supabase PostgreSQL -> Google Cloud SQL PostgreSQL
```

### 7.3 Future Storage Upgrade

Future storage upgrade path:

```txt
Supabase Storage -> Google Cloud Storage
```

### 7.4 Migration Rule

Do not migrate to Google Cloud too early.

Migrate only when scale, cost, security, or operations justify it.

## 8. Product Separation Locks

### 8.1 Job Mitra and HomeFix Mitra Separation

Never mix:

```txt
Job Mitra data
HomeFix Mitra data
Job Mitra roles
HomeFix Mitra roles
Job Mitra admin permissions
HomeFix Mitra admin permissions
```

### 8.2 Job Mitra Role Separation

Never mix:

```txt
Employee flow
Employer flow
Admin flow
```

### 8.3 Job Mitra Domain Separation

Never mix:

```txt
Career Jobs
Shift Jobs
Demand Planner (Workforce Intelligence domain)
Employment Lifecycle
Work Vault
Workforce Ops
HR Management
Manager Console
Admin
```

### 8.3.1 Demand Planner domain lock (2026-07-04)

Locked decision:

```txt
Planner = separate Workforce Intelligence domain
Planner ≠ Shift Jobs feature
Planner ≠ Career Jobs feature
```

Planner may **orchestrate** recommendations to Shift/Career — must **not** execute shift confirm, hire, payroll, attendance, or HR ops.

Reference: `planner/02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`

### 8.3.2 Employment ownership lock (OWN-001, 2026-07-04)

Locked decision:

```txt
One Employment row per Career hire
Hire only after employee offer accept
Shift Jobs never create Employment records
```

Reference: `architecture-audits/30_DATA_OWNERSHIP_ENTERPRISE_AUDIT_v1.1.md`, `second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`

### 8.3.3 Work Vault ownership lock (OWN-004, 2026-07-04)

```txt
Employee owns vault document bytes
Employer access = time-boxed AccessGrant (OTP) only
```

### 8.4 HomeFix Mitra Role Separation

Never mix:

```txt
Customer / Home Owner
Independent Technician
Shop Technician
Shop Owner
```

## 9. Career Jobs UI Locks

### 9.1 Career Jobs UI Hierarchy

Locked hierarchy:

```txt
Shift Jobs < Employee Career Jobs < Employer Career Jobs
```

### 9.2 Career Jobs Color

Locked color direction:

```txt
Blue-only family
```

Allowed:

```txt
Career blue
Deep blue
Soft blue
Blue-tinted white/gray
Neutral slate/gray text
White card surfaces
```

Avoid:

```txt
orange
green
mixed domain colors
Shift Jobs colors
HR colors
Admin colors
```

### 9.3 Career Workspace

Career workspace must stay visible and separate from:

```txt
HR
Payroll
Shift Jobs
Admin
Manager Console
```

### 9.4 Career Workspace Meaning

Career workspace means:

```txt
Career Job വഴി hire ചെയ്ത employee-യുടെ ongoing work record area.
```

Workspace is for:

```txt
joined status
working status
notice
resignation
completion
rating follow-up later
```

## 10. Security and Play Store Locks

### 10.1 No Fake Claims

Do not use fake:

```txt
OTP
payment
notification
verification
AI ranking
interview scheduling
offer confirmation
employer confirmation
real-time messaging
cloud sync
admin action
```

unless the backend feature actually exists.

### 10.2 Public App Safety

Public apps must not expose:

```txt
Admin controls
Future hidden domains
Full HR system unless approved
Manager Console unless approved
Admin routes/cards/buttons
Unfinished backend-dependent workflows
```

### 10.3 Frontend Security Warning

Never trust:

```txt
localStorage
sessionStorage
frontend role selection
frontend route guards
hidden buttons
```

Backend must enforce permissions.

### 10.4 Storage Security

Private files must not be public by default.

Files must be stored in storage, not directly inside database rows.

## 11. Cost and Scaling Locks

### 11.1 Starting Cost Strategy

Start low-cost but production-safe.

### 11.2 Initial Stack

Locked starting stack:

```txt
Cloudflare Pages
Render
Supabase PostgreSQL
Supabase Storage
```

### 11.3 Production Budget Expectation

Early production budget should expect:

```txt
Approx $30-$60/month
```

### 11.4 Scaling Rule

Upgrade in this order:

```txt
Render plan
Supabase plan
database indexes
API pagination
query performance
monitoring
Google Cloud later if needed
```

## 12. Implementation Locks

### 12.1 Architecture-First Rule

Do not start backend coding randomly.

### 12.2 Required Before Backend

Before backend implementation, approve:

```txt
domain plan
backend architecture
database separation rules
auth and permission plan
admin portal architecture
security rules
implementation phases
backend foundation master document
```

### 12.3 Stop Rule

Stop implementation if:

```txt
role boundary is unclear
data ownership is unclear
admin permission is unclear
backend security depends only on frontend
feature wording creates fake claims
database schema mixes products
migration risk is not documented
```

## 13. Do Not Do

### 13.1 Admin Mistakes

Do not:

```txt
add Admin into Job Mitra public app
add Admin into HomeFix Mitra public app
treat admin as normal public website page
```

### 13.2 Data Mistakes

Do not:

```txt
mix HomeFix Mitra and Job Mitra data
mix Career Jobs and Shift Jobs data
mix public app data with admin data
```

### 13.3 Backend Mistakes

Do not:

```txt
build backend without schema/role documents
trust frontend-only security
hardcode secrets
store files directly in database rows
```

### 13.4 UI / Trust Mistakes

Do not:

```txt
use fake OTP/payment/notification claims
use mixed domain colors in Career Jobs
hide important workspace meaning from employer users
show future features as active
```

## 13A. Authenticated load gateway lock (2026-08-10)

Canonical record:

```txt
17_AUTHENTICATED_LOAD_BENCHMARK_LOCK_2026-08-10.md
tests/load/authenticated-store-stress-FINAL-AUDIT-report.json
```

Locked empirical findings:

```txt
Application HTTP 5xx on authenticated 1k ramp: 0
Client timeouts: 0
WM_LOAD_TEST_RELAX_RATE_LIMIT bypass: PASS through 200 concurrent VUs
Free Cloudflare quick tunnel (*.trycloudflare.com): edge throttle above ~200 VUs
```

Locked operational rule:

```txt
PAUSE further authenticated 1k VU store-stress until a Named Cloudflare Tunnel
or durable API / production edge gateway is attached.
Do not certify 500–1000 VU production readiness on trycloudflare quick tunnels.
```

Resume command (after durable gateway):

```txt
WM_API_BASE=<durable-https> K6_VUS_MAX=1000 K6_CHAOS=0 npm run test:load:store-stress:auth
```

## 13B. Owner Telegram phone-first lock (2026-08-10)

Canonical record:

```txt
18_BACKEND_INTEGRATION_BLUEPRINT.md
```

Locked intent:

```txt
Telegram (owner personal chat) = primary real-time awareness
Super Admin dashboard         = secondary console + Class C actions only
Extend Super Admin Defender Telegram plane — do NOT add a second bot inside Job Mitra
```

Locked quick-action rule:

```txt
Class A/B (Telegram buttons OK, audit-logged): employer/worker approve-reject,
  dispute ack, mute, digest-now, deep-link read
Class C (Super Admin Owner HITL only): lockdown, kill, LKG, IP blacklist, shield,
  mass delete, high-value payout/refund, billing/DNS/SSL changes
```

Locked implementation gate:

```txt
Phase 1 WorkMitra Telegram collectors / digests / §10 enhancements: UNBLOCKED
  (Docs 18 + 19 LOCKED).
HFM Telegram event streaming: BLOCKED until Doc 18 §1.4 HFM Phase 1 live provisioning clears.
Metrics/health probes must use durable origins (not trycloudflare quick tunnels).
```

## 13C. Pro-Level Owner-alert enhancements lock (2026-08-10)

Canonical records:

```txt
18_BACKEND_INTEGRATION_BLUEPRINT.md §10
19_DOC18_PRO_LEVEL_ASSESSMENT.md
```

Locked enhancements:

```txt
1. Telegram delivery-failure telemetry → SMS or Email fallback for Tier 0 / RED only
2. Weekly synthetic canary (All Clear / System Heartbeat)
3. RED Acknowledge quick-action + re-notify loop (default every 15 minutes)
4. Capacity alerts include time-to-exhaustion alongside 75/85/95%
```

Locked multi-product rule:

```txt
Doc 18 principles apply to WorkMitra Enterprise AND HomeFix Mitra.
HFM live Telegram emits require HFM Phase 1 Supabase/Cloudflare provisioning first.
```

## 14. Approval Status

### 14.1 Current Status

```txt
Reviewed — July 2026 Job Mitra locks added (§8.3.1–8.3.3)
Load gateway lock — August 2026 (§13A) LOCKED with doc 17
Owner Telegram governance — August 2026 (§13B) LOCKED with doc 18
Pro-Level owner-alert enhancements — August 2026 (§13C) LOCKED with docs 18§10 + 19
```

### 14.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 14.3 Lock Rule

This decision lock document must be approved before backend, database, admin, hosting, UI-standard, or production implementation begins.
