<!-- App name: WorkMitra / Job Mitra
File name: 16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md -->

# 1. WORKMITRA / JOB MITRA — FEATURE IMPLEMENTATION PRIORITY MAP

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `00_DOCUMENT_INDEX_AND_SPLIT_MAP.md`
- `02_SHIFT_JOBS_ARCHITECTURE.md`
- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `05_EMPLOYER_TRUST_VISIBILITY.md`
- `06_EMPLOYMENT_LIFECYCLE.md`
- `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
- `08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md`
- `09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE.md`
- `10_FULL_INSIGHTS_HIDDEN_ARCHITECTURE.md`
- `11_ADMIN_SYSTEM_ARCHITECTURE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

This document converts the final product architecture into safe implementation priority.

It tells developers which features can be built now, which features require backend/login, which features must stay hidden/future-only, and which features need extra safety review before coding.

This document does not replace product architecture.

## 1.3. Core Principle

Do not build features randomly just because they exist in documents.

Every feature must be classified before coding.

Classification must answer:

1. Can this be implemented safely now with local/demo storage?
2. Does this require backend/login?
3. Is this hidden/future-only?
4. Does this create Play Store or privacy risk?
5. Does this risk mixing Employer/Employee or Shift/Career flows?
6. Does this need route/session/permission guard first?

---

# 2. IMPLEMENTATION CLASSIFICATIONS

## 2.1. Classification A — Local/Demo-Safe Now

These features may be implemented in Phase-0/local mode if they are honest, local-only and do not claim backend authority.

Allowed examples:

- local job draft save
- local resume draft
- local preview before publish
- local duplicate warning
- local publish confirmation
- local application state
- local status badges
- local Work Vault metadata
- local access history demo
- local rating demo after valid completion
- local dashboard summaries
- local safe empty states
- local UI premium upgrade

Rules:

- must save/load correctly
- app close/reopen continuity must be verified
- must not claim real backend sync
- must not claim real OTP/payment/push/SMS/email
- must not expose hidden domains

## 2.2. Classification B — Backend/Login Required

These features must wait for real backend/login or be built only as local demo without production claims.

Backend required examples:

- real account creation
- real login/logout/session
- real role-bound account ownership
- server-side job publishing
- multi-device draft sync
- real document upload/storage
- real Work Vault access grants
- real revocation enforcement across devices
- real notifications across accounts
- server-side audit logs
- account deletion
- real rating/trust persistence across users
- real admin governance
- real hidden role permissions

Rules:

- do not expose as production-active before backend exists
- do not fake server authority
- do not use localStorage as production security
- backend must enforce permissions, not only UI hiding

## 2.3. Classification C — Hidden/Future Only

These features are architecture-ready but must remain hidden from launch UI.

Hidden/future only:

- HR Section
- Manager Console
- Workforce Ops Hub
- Full Insights full analytics
- Admin System
- Future Payroll
- advanced support cases
- incident/crisis mode
- two-person admin approval
- full analytics export
- real admin moderation queues

Rules:

- no dashboard cards
- no bottom-nav items
- no landing-page role option
- no coming-soon teaser
- no broken hidden route
- no public screenshot/listing claim

## 2.4. Classification D — Play Store / Policy Risk

These features require special review before launch or production activation.

Risk areas:

- real OTP
- payments
- payroll
- salary/wage calculation
- tax/statutory reporting
- live GPS tracking
- background location
- real push/SMS/email messaging
- real secure/encrypted vault claim
- legal employment proof
- identity verification claim
- automated hiring/AI decision claim
- public fraud/safety accusations

Rules:

- do not claim unless implemented and policy reviewed
- update Play Store Data Safety if backend/data behavior changes
- update privacy policy before real data collection
- avoid legal/payroll/security overclaim

## 2.5. Classification E — Role/Domain Risk

These features need extra review because they can accidentally mix domains or roles.

Risk areas:

- Employer vs Employee role switch
- Shift Job to Career Job conversion
- Career Job to Employment Lifecycle entry
- Work Vault employer access
- rating/trust unlock
- force-complete lifecycle
- Admin hidden review
- Manager/Workforce future activation
- backend route guards
- phone back / route history behavior

Rules:

- check active role
- check owning domain
- check record owner
- check workflow state
- check hidden/launch status
- check navigation/back-stack safety

---

# 3. LAUNCH-VISIBLE FEATURE PRIORITY

## 3.1. Priority 1 — Safe Foundation Before Backend

Implement or verify first:

1. Landing page premium redesign
2. Employer/Employee role-safe navigation
3. Shift Jobs draft/preview/publish safety
4. Career Jobs draft/preview/publish safety
5. Unsaved form warning
6. Phone back/back gesture safety
7. Local persistence verification for launch-visible features
8. Safe empty/error/loading states
9. Employer Trust visibility at decision points
10. Work Vault metadata and privacy wording safety

Reason:

These improve first impression, reduce user abandonment and do not require backend if kept local/demo-safe.

## 3.2. Priority 2 — Backend/Login Foundation

Do after Priority 1 is stable:

1. Auth model decision
2. Backend platform decision
3. Account/signup/login/logout
4. Role profile model
5. Route guard/session system
6. Account deletion plan
7. Privacy policy/data safety update
8. Backend-ready service interface

Reason:

Backend must not be added before role/session flow is safe.

## 3.3. Priority 3 — Domain Data Migration

Move to backend gradually:

1. Shift Jobs
2. Career Jobs
3. Applications
4. Work Vault metadata
5. Employer Trust/rating
6. Notifications
7. Employment Lifecycle

Reason:

These require ownership, permission and cross-account persistence.

## 3.4. Priority 4 — Advanced Hidden/Future Activation

Only after backend, permissions, audit and privacy are ready:

1. HR Section
2. Manager Console
3. Workforce Ops Hub
4. Full Insights
5. Admin System
6. Payroll integration/product

Reason:

These are enterprise/future domains and must not leak into launch UI.

---

# 4. DOMAIN IMPLEMENTATION MAP

## 4.1. Shift Jobs

### Local/Demo-Safe Now

- create Shift Job locally
- Save Draft / Resume Draft
- local auto-save
- Preview Before Publish
- Duplicate Shift Job Warning
- Publish Confirmation
- local applications/interests
- local shortlist/select
- local standby/waiting list
- local status badges
- local completion/rating demo

### Backend Required

- real employer-owned published jobs
- employee applications across accounts
- real selection notification
- real standby/replacement persistence
- server-side audit/timeline
- real trust/rating update
- multi-device draft sync

### Hidden/Future Only

- Workforce Ops live assignment execution
- Manager Console approval queue
- Admin fraud moderation queue

### No-Go

- Shift Job must not create Employment Lifecycle.
- Shift Job must not use Joined/Resigned/Notice statuses.
- Shift Job must not claim payroll/attendance proof.

## 4.2. Career Jobs

### Local/Demo-Safe Now

- create Career Job locally
- Save Draft / Resume Draft
- local auto-save
- Preview Before Publish
- Duplicate Career Job Warning
- Publish Confirmation
- local apply flow
- local application status
- simple eligibility questions
- application strength indicator
- simple applicant fit support
- offer status demo
- joined pending/working status demo where safe

### Backend Required

- real employer-owned Career Jobs
- real employee applications across accounts
- real applicant pipeline
- real offer response across accounts
- real Employment Lifecycle persistence
- real rating/trust update
- audit timeline

### Hidden/Future Only

- full ATS/recruiter ERP
- hidden HR Section
- payroll handoff
- Manager Console controls

### No-Go

- Career Jobs must not become Shift Jobs.
- Career Jobs must not force ATS/CV-heavy flow.
- Career Jobs must not claim legal employment proof.

## 4.3. Work Vault

### Local/Demo-Safe Now

- profile metadata
- document metadata
- folder UI
- local readiness score
- local visibility labels
- local access history demo
- revoke/expired labels as demo-safe UI

### Backend Required

- real document upload
- real object storage
- real employer access grant
- real revocation across accounts
- signed URLs
- real access audit logs
- account-linked document ownership

### Hidden/Future Only

- HR document request path
- payroll document transfer
- admin privacy review

### No-Go

- Do not claim secure encrypted vault unless implemented.
- Do not make Work Vault employer-owned.
- Do not expose all employee documents to employer.

## 4.4. Employer Trust Visibility

### Local/Demo-Safe Now

- employer WM ID display
- rating/trust label demo
- low-data warning
- decision-point trust card
- trust breakdown UI

### Backend Required

- real rating aggregation
- real trust snapshots
- fake review detection
- dispute/review correction
- cross-account trust persistence

### Hidden/Future Only

- Admin trust correction queue
- fraud investigation notes
- internal risk scoring

### No-Go

- Do not show hidden Admin risk notes.
- Do not claim fraud-proof or legally verified employer.
- Do not allow employer to manually inflate trust.

## 4.5. Employment Lifecycle

### Local/Demo-Safe Now

- selected/offer/accepted/joined pending/working statuses
- Accept vs Joined UI
- timeline display
- force-complete UI concept
- local work-history confidence label

### Backend Required

- real employer joined confirmation
- real employee resignation
- real force-complete after waiting/grace rule
- real rating unlock
- audit/correction timeline

### Hidden/Future Only

- full HR record
- payroll handoff
- legal termination proof

### No-Go

- Accept must not mean Joined.
- Employee must not self-confirm Joined.
- Employment Lifecycle must not apply to Shift Jobs.

## 4.6. Notifications

### Local/Demo-Safe Now

- local in-app notification list
- read/unread state
- action route demo
- local reminders
- safe wording

### Backend Required

- cross-user notification delivery
- push notifications
- email/SMS notifications
- unread sync across devices
- server-generated reminders

### Hidden/Future Only

- Admin incident notifications
- HR/Manager/Workforce internal notifications

### No-Go

- Do not claim push/SMS/email unless implemented.
- Notification must not leak hidden domains.

## 4.7. UI Design

### Local/Demo-Safe Now

- premium landing page
- dark theme polish
- domain color preservation
- card/button/badge consistency
- mobile back behavior
- empty/loading/error states
- unsaved form warning UI

### Backend Required

- authenticated account settings
- private account security pages
- server sync status

### Hidden/Future Only

- Admin UI
- HR UI
- Manager Console UI
- Workforce Ops UI
- Full Insights full UI

### No-Go

- Hidden sections must not appear in launch UI.
- Landing page must not show Admin/HR/Manager/Workforce/Payroll.

---

# 5. BACKEND/LOGIN PRE-CODING GATES

Before backend/login coding starts, these must be decided:

1. Backend platform
2. Database
3. Auth method
4. Hosting
5. API structure
6. Role/session model
7. Account deletion path
8. Privacy policy update requirement
9. Play Store data safety update requirement
10. Local-to-backend migration plan
11. Route guard strategy
12. Current app file audit list

No backend coding should start before these are decided.

---

# 6. NO-GO CONDITIONS

Do not code or expose a feature if:

1. It mixes Employer and Employee flows.
2. It mixes Shift Jobs and Career Jobs.
3. It exposes hidden HR/Manager/Workforce/Admin/Full Insights.
4. It claims backend sync before backend exists.
5. It claims real OTP/payment/payroll/messaging before implemented.
6. It claims secure encrypted vault before implemented.
7. It creates Work Vault employer ownership.
8. It treats local demo data as production user data.
9. It changes domain meaning from backend side.
10. It lacks route/session/role safety.
11. It lacks save/load/reopen verification for local launch features.
12. It creates Play Store data safety mismatch.

---

# 7. FINAL IMPLEMENTATION PRIORITY LOCK NOTE

This document is approved as the implementation priority control map.

Final locked decisions:

- Architecture documents are final product truth.
- This document only controls coding priority and safety.
- Local/demo-safe features may be built only with honest local wording.
- Backend-required features must wait for backend/login or remain clearly local/demo.
- Hidden/future domains must not appear in launch UI.
- Play Store-risky features require review before activation.
- Role/domain-risky features require route/session/permission guard before coding.
- Backend/login coding must not start before platform, role/session and migration decisions are locked.
- Feature implementation must follow 16, 17, 18, 19 and 20 before large backend work.

— END OF FEATURE IMPLEMENTATION PRIORITY MAP —
