<!-- App name: WorkMitra / Job Mitra
File name: 00_DOCUMENT_INDEX_AND_SPLIT_MAP.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\00_DOCUMENT_INDEX_AND_SPLIT_MAP.md -->

# 1. WORKMITRA / JOB MITRA — DOCUMENT INDEX AND SPLIT MAP

## 1.1. Purpose

This folder is the official split documentation system for WorkMitra / Job Mitra.

**Canonical brand & domain (2026-07-16):** [`MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](./MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md) — Mitra Labs, Mitra Access Hub, `mitraaccesshub.com` family, Job Mitra as application, Smart Tag and Mitra Business QR as websites/services, Master Admin at `admin.mitraaccesshub.com`. In-app `/admin` routes are **deprecated-candidate**, not final production architecture.

**UniCard / Mitra Labs ID — Option A LOCKED (2026-08-08):** [`UNICARD_MITRA_LABS_ID_OPTION_A_LOCK_v1.0.md`](./UNICARD_MITRA_LABS_ID_OPTION_A_LOCK_v1.0.md) — public ID format `ML-XXXX-ABC-XXXX` across all Mitra Labs products; no JM/WM (or other product codes) inside the public ID; product provenance via `source_app` metadata; ML ID minting moves client → server during backend DB migration. Cross-ref: [`22_MITRA_ECOSYSTEM_ROADMAP_AND_BOUNDARIES.md`](./22_MITRA_ECOSYSTEM_ROADMAP_AND_BOUNDARIES.md) §6 / §14.1.

**Super Admin / Master Control Hub (2026-07-28 LOCKED):** Canonical **standalone app + docs** under `C:\projects\Admin\Super Admin\` — start at `docs/MASTER_CONTROL_HUB_DECISION_RECORD_v1.0.md`. Host: `admin.mitraaccesshub.com`. Role: `master_admin`. UI law: plain-English + G/Y/R gauges only; `platform_ops` RLS + BFF. **Not** inside `mithra-access-hub` or Job Mitra `src/features/admin/**`. Domain admins later under `C:\projects\Admin\<Domain>\`. Independent Co-worker (no direct DB): `C:\projects\Admin\CoWorker\` + Super Admin `docs/COWORKER_BFF_TRUST_BOUNDARY.md`.

The goal is to keep the product documentation easy to understand, easy to update and safe for future development without weakening the master product truth.

This split system does not replace the Core Master Truth.

It organizes the product truth into clear domain documents.

## 1.2. Current Project Truth

Project:

```txt
Job Mitra / WorkMitra_Enterprise_v2
```

Current production status:

```txt
Google Play production release is live and approved.
```

Current next major phase:

```txt
Architecture-first backend/login preparation.
```

Current document phase:

```txt
Enterprise-grade domain document upgrade and final lock.
```

## 1.3. Source Documents

The split documentation system is based on:

1. Original good Master Document
2. Advanced enterprise-grade Master Document
3. Final locked product decisions from WorkMitra / Job Mitra planning
4. Updated domain-by-domain enterprise reviews
5. Play Store safety decisions
6. Mitra Labs Universal Working Agreement v3.1.2

The advanced domain documents are the main source for future development.

The original master document remains as backup/reference only.

## 1.4. Core Rule

Core Master Truth controls all domain documents.

If any domain document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

Every domain document inherits:

- launch scope
- role separation
- hidden-domain rules
- Phase-0 demo-safe rules
- Play Store safety rules
- privacy and trust rules
- WorkMitra internal / Job Mitra public launch naming rule
- strict Employer vs Employee separation
- strict Shift Jobs vs Career Jobs separation
- backend/login readiness boundary

## 1.5. Final Documentation Standard

All final documents must be:

- numbered clearly
- domain-separated
- role-safe
- Play Store safe
- Phase-0 honest
- backend-ready
- hidden-domain safe
- enterprise-grade
- suitable for future implementation planning

---

# 2. FINAL DOCUMENT LIST

## 2.1. 00 — Document Index and Split Map

File:

```txt
00_DOCUMENT_INDEX_AND_SPLIT_MAP.md
```

Purpose:

Official folder index and split map.

Status:

```txt
Final upgraded index document.
```

Launch visibility:

```txt
Internal documentation only.
```

## 2.2. 01 — Core Master Truth

File:

```txt
01_CORE_MASTER_TRUTH.md
```

Purpose:

Controls core product truth, naming, launch boundaries, Phase-0 truth, Play Store safety, role separation and master decisions.

Status:

```txt
Master controlling document.
```

Launch visibility:

```txt
Internal documentation only.
```

## 2.3. 02 — Shift Jobs Architecture

File:

```txt
02_SHIFT_JOBS_ARCHITECTURE.md
```

Purpose:

Launch-visible temporary/short-duration work domain.

Covers:

- shift job posting
- Save Draft / Resume Draft
- local auto-save while filling
- Preview Before Publish
- Duplicate Shift Job Warning
- Publish Confirmation
- Incomplete Draft Reminder
- shift discovery
- worker application/interest
- shortlist/selection
- standby/waiting list
- confirmation
- no-response/no-show distinction
- completion/rating
- reliability/fill-health support

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Launch-visible core domain.
```

Boundary:

```txt
Must not create Employment Lifecycle or Career Jobs states.
```

## 2.4. 03 — Career Jobs Architecture

File:

```txt
03_CAREER_JOBS_ARCHITECTURE.md
```

Purpose:

Launch-visible structured longer-form hiring domain for non-professional workers.

Covers:

- structured job posting
- Save Draft / Resume Draft
- local auto-save while filling
- Preview Before Publish
- Duplicate Career Job Warning
- Publish Confirmation
- Incomplete Draft Reminder
- simple apply flow
- eligibility questions
- simple applicant fit support
- application strength guidance
- discussion/interview state
- offer expiry/response reminder
- candidate comparison view
- non-ATS hiring approach

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Launch-visible core domain.
```

Boundary:

```txt
Must not become ATS/CV-heavy recruiter ERP.
```

## 2.5. 04 — Work Vault Architecture

File:

```txt
04_WORK_VAULT_ARCHITECTURE.md
```

Purpose:

Employee-controlled work identity and document-control pillar.

Covers:

- employee-owned profile/document metadata
- document folders
- granular access control
- revoke/expiry
- access audit trail
- document readiness score
- version history metadata
- secure future upload boundary

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Launch-visible core pillar.
```

Boundary:

```txt
Must not become employer-owned document warehouse, HR document ownership or payroll document locker.
```

## 2.6. 05 — Employer Trust Visibility

File:

```txt
05_EMPLOYER_TRUST_VISIBILITY.md
```

Purpose:

Embedded decision-point employer trust layer.

Covers:

- trust summary
- trust breakdown
- low-data/new-employer warning
- review authenticity guard
- decision-point trust reminder
- trust change timeline
- trust dispute/correction boundary

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Launch-visible embedded trust layer.
```

Boundary:

```txt
Must not become public shaming, fraud guarantee, legal verification or Admin risk leak.
```

## 2.7. 06 — Employment Lifecycle

File:

```txt
06_EMPLOYMENT_LIFECYCLE.md
```

Purpose:

Career Jobs-only mini-HR state machine.

Covers:

- selected
- offer sent
- offer accepted
- offer declined/expired/no-response
- joined pending employer confirmation
- working
- notice
- resigned
- completed
- force-complete protection
- work-history confidence label
- lifecycle correction boundary

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Launch-visible only inside Career Jobs flow.
```

Boundary:

```txt
Accept does not mean Joined. Employment Lifecycle must not become HR, payroll, attendance or legal proof.
```

## 2.8. 07 — HR Section Hidden Architecture

File:

```txt
07_HR_SECTION_HIDDEN_ARCHITECTURE.md
```

Purpose:

Future hidden full-HR architecture.

Covers:

- onboarding readiness
- employee record lifecycle
- HR document request flow
- internal HR notes
- exit/offboarding workflow
- permission-based HR users
- payroll-handoff readiness

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Hidden future domain.
```

Boundary:

```txt
Must stay hidden in launch. Must be payroll-ready but must not become payroll.
```

## 2.9. 08 — Manager Console Hidden Architecture

File:

```txt
08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md
```

Purpose:

Future hidden employer-side manager control architecture.

Covers:

- manager workload dashboard
- smart exception queue
- approval workflow
- manager permission levels
- SLA/due-time tracking
- safe bulk action
- manager activity audit summary

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Hidden future domain.
```

Boundary:

```txt
Must not replace Employer Dashboard, Admin System, HR Section, Workforce Ops or payroll/legal proof.
```

## 2.10. 09 — Workforce Ops Hub Hidden Architecture

File:

```txt
09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE.md
```

Purpose:

Future hidden operational execution and exception-control architecture.

Covers:

- live operations dashboard
- worker availability/capacity
- smart assignment recommendation
- route/location readiness
- operational checklist
- escalation ladder
- ops performance summary

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Hidden future domain.
```

Boundary:

```txt
Must not become launch Shift Jobs, payroll, legal attendance proof, employee-to-employee chat or Admin enforcement.
```

## 2.11. 10 — Full Insights Hidden Architecture

File:

```txt
10_FULL_INSIGHTS_HIDDEN_ARCHITECTURE.md
```

Purpose:

Future hidden analytics and decision-support architecture.

Covers:

- role-safe insight dashboard
- actionable insights
- data confidence labels
- insight privacy filter
- trend/bottleneck detection
- insights export boundary

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Launch summary only. Full Insights hidden.
```

Boundary:

```txt
Must not become public ranking, surveillance, employer spy dashboard, Admin risk leak or payroll/legal report.
```

## 2.12. 11 — Admin System Architecture

File:

```txt
11_ADMIN_SYSTEM_ARCHITECTURE.md
```

Purpose:

Hidden platform-owner governance architecture.

Covers:

- Admin Command Center
- case severity and priority
- evidence vault
- two-person approval
- admin role permission levels
- appeal/re-review
- fraud/fake job/fake employer review
- privacy-safe evidence viewing
- admin audit trail
- incident/crisis mode
- restriction ladder
- no-silent-edit rule

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Hidden governance domain.
```

Boundary:

```txt
Must not become public role, employer dashboard, employee workflow, payroll control, legal authority or uncontrolled super-user backdoor.
```

## 2.13. 12 — Cross-Domain System Rules

File:

```txt
12_CROSS_DOMAIN_SYSTEM_RULES.md
```

Purpose:

Shared system-control rules across all domains.

Covers:

- role separation
- permission safety
- object/entity rules
- lifecycle state discipline
- advisory-only signals
- privacy/deletion/retention
- notification safety
- backend/login readiness
- hidden-domain activation rules
- payroll boundary
- AI/automation/location overclaim safety

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Internal documentation only.
```

Boundary:

```txt
Controls global safety across all documents.
```

## 2.14. 13 — UI Design System Rules

File:

```txt
13_UI_DESIGN_SYSTEM_RULES.md
```

Purpose:

Premium enterprise UI/UX design master document.

Covers:

- premium dark enterprise visual identity
- landing page first-impression design
- domain color identity preservation
- Employee/Employer UI separation
- Shift/Career design separation
- Work Vault privacy design
- Employer Trust design
- Employment Lifecycle timeline design
- hidden section design boundaries
- mobile phone back/back gesture behavior
- unsaved form warning rules
- cards/buttons/badges/forms/empty states
- accessibility/readability
- Phase-0 safe UI wording

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Internal UI design master document.
```

Boundary:

```txt
Controls premium visual consistency but must not redefine product logic.
```

## 2.15. 14 — Release / Current Status

File:

```txt
14_RELEASE_CURRENT_STATUS.md
```

Purpose:

Stores current Play Console, production release, app identity, testing and operational status only.

Status:

```txt
Current operational status document.
```

Launch visibility:

```txt
Internal documentation only.
```

Boundary:

```txt
Release status is temporary operational truth. It must not replace product architecture truth.
```

Rule:

```txt
Backend/Login final file remains 15_BACKEND_LOGIN_MASTER_DOCUMENT.md.
```

---

## 2.16. 15 — Backend and Login Master Document

File:

```txt
15_BACKEND_LOGIN_MASTER_DOCUMENT.md
```

Purpose:

Backend/login/auth/account/database/API/permissions/migration master foundation.

Covers:

- backend architecture
- auth model
- role context
- sessions
- API/domain policy layer
- database
- job draft records / draft metadata
- owner-only draft permission
- preview / duplicate warning / publish confirmation backend support
- audit logs
- privacy
- Play Store data safety
- account deletion
- local-to-backend migration
- feature flags
- production no-go checklist

Status:

```txt
Enterprise upgraded and final-lock approved.
```

Launch visibility:

```txt
Internal backend architecture document.
```

Boundary:

```txt
Backend/Login enforces domain truth but does not redefine product meaning.
```

## 2.17. 16 — Feature Implementation Priority Map

File:

```txt
16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md
```

Purpose:

Defines which features can be implemented now, which require backend/login, which must stay hidden/future-only, and which features need Play Store or role/domain safety review before coding.

Covers:

- local/demo-safe now
- backend required
- hidden/future only
- Play Store-risky
- role/domain-risky
- implementation order
- no-go conditions before coding

Status:

```txt
Required before backend/login code work.
```

Launch visibility:

```txt
Internal implementation safety document only.
```

Boundary:

```txt
This document does not replace product architecture. It only converts final architecture into safe coding priority.
```

## 2.18. 17 — End-to-End Workflow Checklist

File:

```txt
17_END_TO_END_WORKFLOW_CHECKLIST.md
```

Purpose:

Defines complete user journey checklists for Shift Jobs, Career Jobs, Work Vault, Employment Lifecycle, Employer Trust and notifications.

Status:

```txt
Required before large workflow implementation.
```

Launch visibility:

```txt
Internal implementation safety document only.
```

## 2.19. 18 — Notification Implementation Contract

File:

```txt
18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md
```

Purpose:

Defines each notification type, sender/source, receiver, trigger condition, target route, message text and local/backend status.

Status:

```txt
Required before notification implementation.
```

Launch visibility:

```txt
Internal implementation safety document only.
```

## 2.20. 19 — Role Session Route Guard Workflow

File:

```txt
19_ROLE_SESSION_ROUTE_GUARD_WORKFLOW.md
```

Purpose:

Defines Employee/Employer role selection, session state, wrong-role route blocking, logout, role switch, back navigation and future backend login migration.

Status:

```txt
Required before backend/login code work.
```

Launch visibility:

```txt
Internal implementation safety document only.
```

## 2.21. 20 — Local Persistence Verification Matrix

File:

```txt
20_LOCAL_PERSISTENCE_VERIFICATION_MATRIX.md
```

Purpose:

Verifies each launch-visible feature by save, load, app close/reopen continuity and linked-page reflection.

Status:

```txt
Required before declaring any local/demo feature launch-ready.
```

Launch visibility:

```txt
Internal QA / verification document only.
```

## 2.22. Planner Folder (Demand Planner — Approved Build Now)

Folder:

```txt
planner/
```

Index file:

```txt
planner/00_PLANNER_INDEX.md
```

Purpose:

Stores the **Shift Demand Planner** master specification — a launch-visible, pillar-level employer subdomain for multi-day demand planning, plan calendar, budget visibility, and agency-style post + manage loops.

**Not** Workforce Ops Hub. **Not** HR Roster. **Not** Career Jobs.

Current documents:

| File                                         | Topic                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `01_SHIFT_DEMAND_PLANNER_MASTER_DOCUMENT.md` | Full IA, data model, screens, phases P0–P4, E2E matrix, audit hardening Section 17 (v1.3) |

Status:

```txt
Locked for implementation (v1.3). Coding starts only after PO approves v1.3. P1 includes employer + employee + workspace in one release. P1 requires Section 17.10 F1–F18 pass.
```

Launch visibility:

```txt
Launch-visible employer feature when P0+ ships. Teal visual subdomain.
```

## 2.23. Second Update Folder (V2 Roadmap — Planned, Not MVP)

Folder:

```txt
second-update/
```

Index file:

```txt
second-update/00_SECOND_UPDATE_INDEX_AND_WORKFLOW.md
```

Purpose:

Stores **Second Update (Version 2.0)** product specifications — features approved for the product but **must not be built during the current MVP / Phase 1 pass**.

Enforces the two-pass workflow:

1. **First Update** — build now (MVP, no platform leakage).
2. **Second Update** — document now, implement only after Product Owner approves the V2 file.

Current V2 documents:

| File                                 | Topic                                                              |
| ------------------------------------ | ------------------------------------------------------------------ |
| `01_SHIFT_WORKER_AVAILABILITY_V2.md` | Talent Radar, Direct Invite list, Magic Alert (Shift availability) |
| `_TEMPLATE_SECOND_UPDATE_FEATURE.md` | Copy template for future V2 specs                                  |

Status:

```txt
Active planning folder. Internal only. Not launch-visible copy.
```

Launch visibility:

```txt
Internal documentation only. Do not claim V2 features as live in Play Store materials.
```

Rule:

Every page audit must produce both a First Update list and a Second Update backlog. Second Update items must be recorded in this folder before V2 coding begins.

---

# 3. LAUNCH-VISIBLE VS HIDDEN DOCUMENT MAP

## 3.1. Launch-Visible Core Product Domains

Launch-visible domains:

1. Shift Jobs
2. Career Jobs
3. Work Vault
4. Employer Trust Visibility
5. Employment Lifecycle inside Career Jobs
6. Limited launch Insights summary only
7. UI Design System rules for all launch screens

## 3.2. Hidden / Future Domains

Hidden future domains:

1. HR Section
2. Manager Console
3. Workforce Ops Hub
4. Full Insights full analytics
5. Admin System
6. Future Payroll system/module

Rule:

Hidden domains may be architected now, but must not appear in launch UI unless a future explicit activation decision is approved.

## 3.3. Internal Control Documents

Internal control documents:

1. Core Master Truth
2. Document Index and Split Map
3. Cross-Domain System Rules
4. UI Design System Rules
5. Backend/Login Master Document
6. Feature Implementation Priority Map
7. End-to-End Workflow Checklist
8. Notification Implementation Contract
9. Role Session Route Guard Workflow
10. Local Persistence Verification Matrix
11. Mitra Labs Working Agreement

---

# 4. FINAL UPGRADE STATUS SUMMARY

## 4.1. Final-Lock Approved Documents

Final-lock approved architecture documents:

1. `02_SHIFT_JOBS_ARCHITECTURE.md`
2. `03_CAREER_JOBS_ARCHITECTURE.md`
3. `04_WORK_VAULT_ARCHITECTURE.md`
4. `05_EMPLOYER_TRUST_VISIBILITY.md`
5. `06_EMPLOYMENT_LIFECYCLE.md`
6. `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
7. `08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md`
8. `09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE.md`
9. `10_FULL_INSIGHTS_HIDDEN_ARCHITECTURE.md`
10. `11_ADMIN_SYSTEM_ARCHITECTURE.md`
11. `12_CROSS_DOMAIN_SYSTEM_RULES.md`
12. `13_UI_DESIGN_SYSTEM_RULES.md`
13. `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`

## 4.2. Required Implementation Safety Documents

Required before backend/login coding:

1. `16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md`
2. `17_END_TO_END_WORKFLOW_CHECKLIST.md`
3. `18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md`
4. `19_ROLE_SESSION_ROUTE_GUARD_WORKFLOW.md`
5. `20_LOCAL_PERSISTENCE_VERIFICATION_MATRIX.md`

Status:

```txt
Required implementation bridge documents. Create before backend/login code work.
```

## 4.3. Pending / Not Covered in This Index

Pending future master document:

```txt
Future Payroll Master Document
```

Reason:

Payroll is planned as a future separate Mitra Labs product/module.

It must not be merged into HR Section, Employment Lifecycle, Workforce Ops or Backend/Login without a separate payroll architecture review.

---

# 5. DOMAIN BOUNDARY SUMMARY

## 5.1. Shift Jobs Boundary

Shift Jobs = temporary/short-duration work.

Must not become:

- Career Jobs
- Employment Lifecycle
- HR Section
- Workforce Ops full execution
- payroll/attendance proof

## 5.2. Career Jobs Boundary

Career Jobs = structured longer-form hiring.

Must not become:

- Shift Jobs
- ATS/CV-heavy recruiter ERP
- full HR Section
- payroll/legal employment proof

## 5.3. Employment Lifecycle Boundary

Employment Lifecycle = Career Jobs-only mini-HR.

Must not become:

- full HR
- payroll
- attendance
- legal employment proof
- Shift completion logic

## 5.4. Work Vault Boundary

Work Vault = employee-controlled document/profile trust.

Must not become:

- employer document warehouse
- HR-owned document storage
- payroll document locker
- legal verification authority
- fake secure/encrypted claim

## 5.5. Employer Trust Boundary

Employer Trust = embedded decision-point trust layer.

Must not become:

- public shaming feed
- fraud guarantee
- legal verification
- Admin risk note display
- employer-controlled marketing badge

## 5.6. Hidden HR Boundary

HR Section = future hidden full-HR architecture.

Must not become:

- launch-visible
- Career mini-HR
- payroll app
- Work Vault owner

## 5.7. Manager Console Boundary

Manager Console = future hidden manager control layer.

Must not become:

- Employer Dashboard
- Admin System
- HR Section
- Workforce Ops execution layer
- payroll/legal proof

## 5.8. Workforce Ops Boundary

Workforce Ops = future hidden operational execution layer.

Must not become:

- launch Shift Jobs
- employee-to-employee chat
- Admin enforcement
- payroll/legal attendance proof

## 5.9. Full Insights Boundary

Full Insights = future hidden analytics.

Must not become:

- launch full analytics
- public ranking
- surveillance
- employer spy dashboard
- Admin risk leak
- payroll/legal report

## 5.10. Admin System Boundary

Admin System = hidden platform governance.

Must not become:

- public app role
- employer/employee workflow
- uncontrolled super-user power
- payroll/legal authority
- silent data editor

## 5.11. Backend/Login Boundary

Backend/Login = account/auth/API/database/permission foundation.

Must not:

- redefine domain product truth
- merge Employer/Employee flows
- expose hidden domains
- fake security/OTP/payment/messaging capability

---

# 6. IMPLEMENTATION ORDER GUIDANCE

## 6.1. Current Recommended Order Before Backend Coding

Before backend/login coding:

1. Save all final architecture documents.
2. Create `16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md`.
3. Create `17_END_TO_END_WORKFLOW_CHECKLIST.md`.
4. Create `18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md`.
5. Create `19_ROLE_SESSION_ROUTE_GUARD_WORKFLOW.md`.
6. Create `20_LOCAL_PERSISTENCE_VERIFICATION_MATRIX.md`.
7. Keep `15_BACKEND_LOGIN_MASTER_DOCUMENT.md` as backend source.
8. Audit current app routing/auth/storage files.
9. Lock auth model and backend stack.
10. Create backend implementation plan.
11. Start backend only after route/session/role plan is approved.

## 6.2. Backend Coding Must Start From

Backend coding should begin from:

```txt
15_BACKEND_LOGIN_MASTER_DOCUMENT.md
12_CROSS_DOMAIN_SYSTEM_RULES.md
01_CORE_MASTER_TRUTH.md
```

Then inspect current code files:

- router
- app entry
- role/session state
- local storage layer
- route guards
- notifications
- profile/account placeholders

## 6.3. UI Upgrade Must Start From

UI upgrade should begin from:

```txt
13_UI_DESIGN_SYSTEM_RULES.md
```

Recommended first page:

```txt
Landing Page
```

Reason:

Landing Page is the first trust checkpoint and current first-impression risk.

## 6.4. Domain Implementation Must Start From

Each domain implementation must use its domain document plus:

```txt
12_CROSS_DOMAIN_SYSTEM_RULES.md
13_UI_DESIGN_SYSTEM_RULES.md
15_BACKEND_LOGIN_MASTER_DOCUMENT.md
```

---

# 7. FILE NAMING RULES

## 7.1. Final File Names

Use clean original file names for final saved documents.

Example:

```txt
03_CAREER_JOBS_ARCHITECTURE.md
```

Avoid keeping delivery suffixes in the final folder:

```txt
_FINAL_NUMBERED
_FINAL_
```

Rule:

Generated delivery files may use suffixes, but final saved project documents should use clean canonical names.

## 7.2. Backend/Login Number Rule

Final backend/login file is:

```txt
15_BACKEND_LOGIN_MASTER_DOCUMENT.md
```

Document 14 is reserved for release/current operational status:

```txt
14_RELEASE_CURRENT_STATUS.md
```

Do not use any `14_BACKEND_LOGIN_MASTER_DOCUMENT.md` reference as the final backend/login document.

## 7.3. Old Backend 14 Reference Rule

If `14_BACKEND_LOGIN_MASTER_DOCUMENT.md` appears in old references:

- treat that backend reference as deprecated
- do not add backend/login content to any 14 backend draft
- update backend/login references to `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- keep document 14 reserved for `14_RELEASE_CURRENT_STATUS.md`

---

# 8. PLAY STORE AND PHASE-0 SAFETY SUMMARY

## 8.1. Phase-0 Allowed

Allowed:

- local/demo data
- local state machines
- local readiness indicators
- local trust display
- local document metadata
- local demo notifications
- hidden future architecture planning

## 8.2. Phase-0 Blocked Claims

Blocked:

- real OTP sent
- real payment
- real payroll
- real legal employment proof
- real secure encrypted document vault
- real background messaging
- real push/SMS/email notifications
- real live GPS tracking
- real Admin enforcement
- real backend sync before implemented

## 8.3. Play Store Safety Rule

All user-visible wording, screenshots, app content and future privacy declarations must match actual implemented behavior.

Rule:

Do not show or claim future-only behavior as active.

---

# 9. FINAL INDEX LOCK NOTE

This document index is approved as the final split-map for the upgraded Job Mitra / WorkMitra document system.

Final locked decisions:

- All major domains have separate documents.
- Launch-visible and hidden/future domains are separated.
- Number 14 is Release / Current Status, not Backend/Login.
- Backend/Login is document 15.
- Payroll remains future separate Mitra Labs product/module.
- UI Design System is the premium enterprise visual design master.
- Cross-Domain System Rules is the global safety/control document.
- Domain documents must not be merged casually.
- Future changes must update this index when file structure changes.
- Final saved files should use clean canonical names without delivery suffixes.
- **Second Update (V2) specs live in `second-update/` — document before build, never mix with MVP passes.**
- **Non-developer E2E check kit:** `operator-testing-guide/` — Malayalam step-by-step, double-click `.cmd` runners, robot copy-paste prompts.

— END OF DOCUMENT INDEX AND SPLIT MAP —
