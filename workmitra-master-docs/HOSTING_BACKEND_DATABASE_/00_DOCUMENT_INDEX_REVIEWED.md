# 00. Mitra Labs Master Documentation Index

> **Canonical brand & domain authority (2026-07-16):** For current Mitra Labs / Mitra Access Hub naming, `mitraaccesshub.com` domain family, and Master Admin hostname decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md). Older `*.mitralabs.app` / `jobmitra.app` references in hosting documents below are **LEGACY / SUPERSEDED** unless preserved as historical evidence.

**Last updated:** 2026-08-10 (doc 19 Pro-Level Assessment + Doc 18 §10 enhancements)  
**Scope:** Mitra Labs, Job Mitra, HomeFix Mitra, future products, backend, database, hosting, domains, admin, UI standards, and future migration planning.

## 1. Final Architecture Direction

### 1.1 Parent Brand

Mitra Labs is the parent brand.

### 1.2 Current Products

Job Mitra and HomeFix Mitra are separate products under Mitra Labs.

### 1.3 Starting Architecture

The system should start with:

- Frontend hosting: Cloudflare Pages
- Backend: Node.js + TypeScript
- Backend hosting: Render
- Database: Supabase PostgreSQL
- Admin: Master Admin at `admin.mitraaccesshub.com` — see [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md). Legacy doc `04_ADMIN_PORTAL_ARCHITECTURE_REVIEWED.md` retains historical `admin.mitralabs.app` wording.
- Future upgrade path: Google Cloud Run + Google Cloud SQL PostgreSQL

## 2. Master Document List

### 2.1 Index and Master Truth

0. `00_DOCUMENT_INDEX.md` — Master document index and approval tracker
1. `01_MASTER_TRUTH.md` — Parent brand, product structure, and master separation rules

### 2.2 Domain, Hosting, Backend, and Database

2. `02_DOMAIN_AND_BRAND_PLAN.md` — Domain strategy and brand naming rules
3. `03_HOSTING_BACKEND_DATABASE_PLAN.md` — Frontend, backend, hosting, database, storage, and provider plan

### 2.3 Admin, Auth, and Permissions

4. `04_ADMIN_PORTAL_ARCHITECTURE.md` — Central admin portal, Super Admin, product admins, and audit rules
5. `05_AUTH_AND_ROLE_PERMISSION_PLAN.md` — Authentication model, RBAC, sessions, and backend permission enforcement

### 2.4 Data, Migration, Cost, and Scaling

6. `06_DATABASE_SEPARATION_RULES.md` — Product-level table/data separation rules
7. `07_FUTURE_GOOGLE_CLOUD_MIGRATION.md` — Future migration path from Render/Supabase to Google Cloud
8. `08_COST_AND_SCALING_PLAN.md` — Early cost estimate, user scaling plan, and usage risks

### 2.5 UI, Security, Implementation, and Decisions

9. `09_PRODUCT_UI_STANDARD.md` — Global product UI standard covering Job Mitra, Career Jobs, Shift Jobs, Workforce Ops, HomeFix Mitra, Admin UI, color rules, empty states, KPI rules, and Play Store-safe UI wording
10. `10_SECURITY_AND_PLAY_STORE_RULES.md` — Security, Play Store safety, and public app compliance rules
11. `11_IMPLEMENTATION_PHASES.md` — Backend, database, auth, migration, admin, and production hardening phases
12. `12_DECISION_LOCKS.md` — Final locked architecture and product decisions

### 2.6 Backend Foundation Add-On

13. `13_BACKEND_FOUNDATION_MASTER.md` — Complete backend foundation source of truth covering API, storage, audit logs, backups, RBAC, hosting, cost, and migration

### 2.7 Job Mitra Application Architecture (Enterprise — July 2026)

16. `16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md` — **Ch 1–3 written**; domain boundaries locked in Ch 3.

### 2.8 Empirical load / edge certification (August 2026)

17. `17_AUTHENTICATED_LOAD_BENCHMARK_LOCK_2026-08-10.md` — **LOCKED**. Authenticated 1k VU findings: 0 application 5xx; rate-limit bypass PASS ≤200 VU; free Cloudflare quick-tunnel edge throttle above ~200 VU. Further 1k stress paused until named tunnel / durable API gateway. Machine record: `tests/load/authenticated-store-stress-FINAL-AUDIT-report.json`.

### 2.9 Owner phone-first Telegram governance (August 2026)

18. `18_BACKEND_INTEGRATION_BLUEPRINT.md` — **LOCKED**. Owner Telegram = primary awareness; Super Admin = secondary + Class C only. Extends existing Super Admin Defender Telegram plane (no second bot in Job Mitra). Includes founder must-haves, board advisory alerts, quick-action allow/forbid, Tier 0–3 checklist, Pro-Level §10 (fallback channel, weekly canary, RED ack loop, time-to-exhaustion), and WorkMitra+HFM scope with HFM provisioning gate.

19. `19_DOC18_PRO_LEVEL_ASSESSMENT.md` — **LOCKED**. Companion Pro-Level Assessment of Doc 18; records four critical gaps now locked into Doc 18 §10; confirms Phase 1 unblocked for WorkMitra; HFM Telegram streaming blocked until live provisioning.

## 3. Approval Workflow

### 3.1 Review Stages

Each document must move through this flow:

```txt
Draft → Reviewed → Approved → Locked
```

### 3.2 Lock Rule

No backend, login, database, admin, or production migration implementation should start until the required master documents are approved and locked.

### 3.3 Review Method

Each document should be reviewed separately.

Review should check:

- Missing architecture points
- Product/data separation
- Role and permission safety
- Admin boundary safety
- Backend and database readiness
- Security and Play Store risk
- Future migration safety
- Enterprise-grade clarity

## 4. Source of Truth Rule

### 4.1 Master Rule

This document set is the source of truth before backend, login, database, admin, and hosting implementation starts.

### 4.2 Conflict Rule

If a later implementation idea conflicts with these master documents, the document must be updated and approved before coding.

### 4.3 Product Separation Rule

Job Mitra and HomeFix Mitra must remain separated by:

- Product domain
- Data tables
- Backend modules
- Roles and permissions
- Admin permissions
- UI flows
- Storage boundaries
- Audit logs

## 5. Current Review Status

### 5.1 Current Status

```txt
Reviewed — infrastructure pack locked for follow (2026-07-04)
Application architecture: doc 16 (TOC pending PO approval)
Load certification: doc 17 LOCKED (2026-08-10) — pause 1k VU until durable gateway
Owner Telegram governance: docs 18+19 LOCKED (2026-08-10) — Phase 1 WorkMitra UNBLOCKED; HFM Telegram BLOCKED until provisioning
```

### 5.2 Current Review Position

```txt
Docs 01–15: infrastructure + foundation — reviewed and aligned with July 2026 enterprise gates.
Doc 16: Job Mitra application layer — TOC filed; chapters blocked until TOC sign-off.
Doc 17: Authenticated load benchmark — LOCKED; resume 1k stress only on durable API gateway.
Doc 18: Owner Telegram / Backend Integration Blueprint — LOCKED (+ §10 Pro-Level).
Doc 19: Pro-Level Assessment companion — LOCKED.
Next: Phase 1 Telegram Tier-1 + §10 in Super Admin BFF (WorkMitra); durable edge for metrics trust; HFM Telegram after HFM Phase 1 provisioning; continue doc 16 after TOC sign-off.
```

### 5.2.1 July 2026 supplements applied

| Doc | Change                                                             |
| --- | ------------------------------------------------------------------ |
| 03  | Mobile app vs Cloudflare website clarified                         |
| 06  | Employment, Planner, Vault tables + OWN/Career/Planner rules       |
| 11  | Executive §9/§9A gates before Phase 2 coding                       |
| 12  | Planner domain, OWN-001, OWN-004 locks                             |
| 16  | Canonical Backend Architecture (moved from architecture-audits/32) |

### 5.2.2 August 2026 load certification

| Doc | Change |
| --- | --- |
| 17  | Authenticated 1k VU lock: 0 app 5xx; API/DB ready ≤200 VU; quick-tunnel edge throttle >200 VU; stress paused |
| 12  | Decision lock: durable gateway required before 1k VU production certification |

### 5.2.3 August 2026 Owner Telegram governance

| Doc | Change |
| --- | --- |
| 18  | Backend Integration Blueprint LOCKED: phone-first Telegram, Tier 0–3, Class A/B vs C; §10 Pro-Level (fallback, canary, RED ack, TTE); WorkMitra+HFM scope; HFM provisioning gate |
| 19  | Pro-Level Assessment companion LOCKED; Phase 1 WorkMitra unblocked |
| 12  | §13B Owner Telegram phone-first; §13C Pro-Level + HFM gate |

### 5.3 Final Pack Rule

After all individual documents are reviewed and corrected, the full document pack must be reviewed again from `00_DOCUMENT_INDEX.md` to the final document before being locked.
