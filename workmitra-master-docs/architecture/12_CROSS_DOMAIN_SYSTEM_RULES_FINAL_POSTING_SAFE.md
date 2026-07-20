<!-- App name: WorkMitra / Job Mitra
File name: 12_CROSS_DOMAIN_SYSTEM_RULES.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\12_CROSS_DOMAIN_SYSTEM_RULES.md -->

# 1. WORKMITRA / JOB MITRA — CROSS-DOMAIN SYSTEM RULES

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document controls shared rules across:

- `02_SHIFT_JOBS_ARCHITECTURE.md`
- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `05_EMPLOYER_TRUST_VISIBILITY.md`
- `06_EMPLOYMENT_LIFECYCLE.md`
- `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
- `08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md`
- `09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

This document defines the shared system rules that apply across all WorkMitra / Job Mitra domains.

These rules protect:

- role separation
- permission safety
- object/entity truth
- lifecycle state discipline
- data trust and privacy
- notification safety
- hidden-domain control
- advisory feature safety
- backend/login readiness
- version/change-control discipline

## 1.3. Core Principle

Every major feature must remain:

- domain-safe
- role-safe
- privacy-safe
- trust-safe
- hidden-boundary safe
- Phase-0 safe
- Play Store-safe
- backend-ready without pretending backend authority exists

A domain document may define detailed behavior, but shared system rules must stay consistent across all domains.

## 1.4. Covered Areas

This document covers:

1. Role Architecture and Role-Safe Exposure
2. Role × Action Permission Matrix
3. Domain Ownership and Boundary Rules
4. Canonical Entity and Object Rules
5. Lifecycle and State-Transition Rules
6. Advisory Intelligence and Automation Safety
7. Data Trust, Privacy, Deletion and Retention Rules
8. Notification and Alert Contract
9. Backend/Login, Account and Production Readiness Rules
10. Hidden Future-Domain Activation Rules
11. Deferred Items, Change-Control and Release Safety Rules
12. Final Cross-Domain Lock Note

---

# 2. ROLE ARCHITECTURE AND ROLE-SAFE EXPOSURE

## 2.1. Core Role Principle

The right role must see the right surface, the right action, the right data and the right next step.

The wrong role must not see:

- hidden controls
- private data
- internal logic
- future-domain actions
- other role data
- governance-only information

## 2.2. Launch-Visible Roles

Launch-visible primary roles:

1. Employer
2. Employee

These are the only normal public role experiences in launch.

## 2.3. Hidden / Non-Launch Roles and Domains

Hidden / non-launch role surfaces:

- Admin
- Super Admin
- HR Section
- Manager Console
- Workforce Ops Hub
- Full Insights advanced analytics
- Future Payroll system/module

Rule:

Hidden roles / domains may exist in architecture but must not appear as normal launch role choices, dashboard modules, navigation tabs, teaser cards or broken placeholder screens.

## 2.4. Employer Role Truth

Employer is the launch-visible role for:

- creating Shift Jobs
- creating Career Jobs
- reviewing applicants
- selecting / shortlisting workers
- accessing allowed Work Vault verification
- managing allowed Career Employment Lifecycle actions
- rating employees where required
- viewing own public trust summary

Employer must not see:

- employee private Work Vault documents without access
- employee-only actions
- hidden HR Section
- hidden Manager Console
- hidden Workforce Ops Hub
- Admin controls
- Future Payroll controls
- other employer data

## 2.5. Employee Role Truth

Employee is the launch-visible role for:

- discovering Shift Jobs
- discovering Career Jobs
- viewing Employer Trust Visibility
- applying / expressing interest
- managing My Work Vault
- accepting / declining where allowed
- viewing own Employment Lifecycle status
- rating employers where required

Employee must not see:

- employer private operational notes
- other applicants
- employer management controls
- hidden HR Section
- hidden Manager Console
- hidden Workforce Ops Hub
- Admin controls
- Future Payroll controls
- other employee Work Vault data

## 2.6. Admin Role Truth

Admin is hidden launch architecture.

Admin may support future:

- moderation
- trust review
- fake review review
- appeal / re-review
- audit control
- compliance governance
- high-risk correction

Admin must not:

- appear in landing
- appear in normal role picker
- appear in public launch explanation
- become employer workflow shortcut
- become employee workflow shortcut
- silently rewrite user truth
- bypass audit

## 2.7. Role Exposure Matrix

### 2.7.1. Employer

- visible in launch: yes
- dashboard: employer dashboard
- can create jobs: yes
- can apply to jobs: no, unless future explicit multi-role context exists
- can manage Work Vault owner controls: no
- can verify shared Work Vault content: yes, only through allowed path
- can access hidden Admin: no
- can access hidden HR / Manager / Workforce: no in launch

### 2.7.2. Employee

- visible in launch: yes
- dashboard: employee dashboard
- can create jobs: no
- can apply to jobs: yes
- can manage own Work Vault: yes
- can access employer management controls: no
- can access hidden Admin: no
- can access hidden HR / Manager / Workforce: no in launch

### 2.7.3. Admin / Super Admin

- visible in launch: no
- dashboard: hidden governance dashboard only
- can silently edit truth: no
- high-risk actions require audit and approval

### 2.7.4. HR / Manager / Workforce / Full Insights / Payroll

- visible in launch: no
- normal dashboard cards: no
- public role picker: no
- future exposure: only after explicit versioned approval

## 2.8. Role-Safe Navigation Rule

Navigation must be role-bounded.

Employer navigation must not show employee-only pages.

Employee navigation must not show employer-only pages.

Hidden domains must not show in normal launch navigation.

If user changes role context in future:

- clear role-specific navigation state
- avoid mixed dashboard state
- avoid wrong-role back navigation
- preserve user safety and clarity

## 2.9. Role-Safe Screen Rule

Every screen must answer:

- Which role owns this screen?
- Which role can open it?
- Which role can act here?
- Which data is visible?
- Which actions are blocked?
- Is this launch-visible or hidden?
- Does this screen expose future-only logic?

## 2.10. Role-Safe Empty State Rule

Empty states must not expose hidden features.

Bad examples:

```txt
No HR records yet.
No Workforce Ops active.
No payroll handoff is active.
```

Good examples:

```txt
No Career applications yet.
No Shift Jobs posted yet.
No Work Vault documents added yet.
```

## 2.11. Role-Safe Microcopy Rule

Wording must match role truth.

Employer copy:

- “Review applicants”
- “Select worker”
- “Confirm joined”

Employee copy:

- “Apply”
- “Accept offer”
- “Manage My Work Vault”

Avoid in launch:

- Admin wording
- HR Section wording
- Manager Console wording
- Workforce Ops wording
- Payroll wording
- legal proof wording

## 2.12. Hidden-Domain Exposure Control

Hidden domains may be referenced only in:

- internal documentation
- architecture notes
- disabled/future placeholders only if explicitly approved
- admin/governance planning

Hidden domains must not appear as:

- public module cards
- clickable dashboard actions
- role options
- teaser features
- incomplete broken screens

---

# 3. ROLE × ACTION PERMISSION MATRIX

## 3.1. Core Permission Principle

No important action is allowed just because a screen exists.

Every important action must be checked against:

- authenticated user where backend exists
- active role context
- domain
- record ownership
- workflow state
- visibility scope
- launch vs hidden status
- trust / privacy sensitivity
- audit requirement
- stronger approval requirement

## 3.2. Permission Decision Model

Before allowing an action, system must answer:

1. Who is acting?
2. What role context are they in?
3. Which domain owns the action?
4. Which record is affected?
5. Does the actor own or have access to that record?
6. Is the current state valid for this action?
7. Is this action launch-visible or hidden/future-only?
8. Does it affect privacy/trust/lifecycle?
9. Is audit required?
10. Is stronger approval required?

## 3.3. Employer Permissions

Employer can:

- create own Shift Jobs
- edit own draft Shift Jobs
- publish own Shift Jobs
- view applicants for own Shift Jobs
- shortlist / select workers for own Shift Jobs
- manage standby/replacement where allowed
- view Shift Fill Health where allowed
- rate employees where workflow requires
- create own Career Jobs
- edit own draft Career Jobs
- publish own Career Jobs
- view applicants for own Career Jobs
- shortlist / reject / select applicants
- send / mark offer where allowed
- confirm Joined only after valid accepted state
- manage Career Employment Lifecycle actions where allowed
- request Work Vault verification through allowed path
- view only shared Work Vault content
- view own employer trust summary

Employer cannot:

- apply to jobs as employee in employer context
- access employee private Work Vault documents without grant
- confirm Joined without accepted / valid prior state
- submit employee resignation
- force complete employee-side lifecycle
- manually edit rating / trust level
- access hidden Admin
- access hidden HR Section in launch
- access hidden Manager Console in launch
- access hidden Workforce Ops Hub in launch
- process payroll
- treat Shift worker as Career employee without Career flow

## 3.4. Employee Permissions

Employee can:

- view Shift Jobs
- apply / express interest in Shift Jobs
- withdraw where allowed
- accept / decline selected Shift where allowed
- confirm pre-shift attendance where supported
- view own Shift status
- rate employer where workflow requires
- view Career Jobs
- apply to Career Jobs
- answer basic eligibility questions
- withdraw application where allowed
- accept / decline offer
- view own application state
- view own Employment Lifecycle status
- submit resignation where allowed
- force complete where allowed
- manage own My Work Vault
- add / manage document metadata
- approve / deny / revoke document sharing
- view own access history
- view Employer Trust Visibility at decision points

Employee cannot:

- create employer job posts
- view other applicants
- access employer private notes
- confirm Joined
- edit employer trust / rating
- access hidden Admin
- access hidden HR Section
- access Manager Console
- access Workforce Ops Hub
- see other employees’ Work Vaults
- access payroll controls in launch

## 3.5. Hidden Future Role Permissions

### 3.5.1. HR Section

Future HR user may:

- manage HR pipeline records
- create onboarding tasks
- update HR employee records
- manage HR notes where allowed
- prepare payroll-handoff readiness where future-approved

HR Section cannot in launch:

- appear in public UI
- control Career mini-HR directly
- access Work Vault documents without allowed path
- convert Shift Jobs into HR records
- become payroll / legal authority

### 3.5.2. Manager Console

Future manager may:

- view assigned work items
- approve / reject operational steps
- add manager notes
- escalate exceptions
- use bulk action with safety where permitted

Manager cannot:

- grant own permissions
- access Admin powers
- access hidden HR records unless permitted
- access employee Work Vault privately
- suspend users
- rewrite audit logs
- process payroll

### 3.5.3. Workforce Ops Hub

Future ops user may:

- manage assigned ops items
- assign workers where approved
- handle exceptions
- carry forward unresolved work
- close operational items

Workforce Ops cannot:

- appear in launch UI
- become Career Employment Lifecycle
- become payroll / attendance truth
- expose other workers to employees
- become Admin enforcement layer

### 3.5.4. Future Payroll

Future Payroll may exist as a separate Mitra Labs product/module.

Payroll cannot:

- be active in launch
- be hidden inside HR Section
- use lifecycle or ops status as legal payroll truth
- receive Work Vault documents without future approved consent/path
- claim payment/tax/payslip support before implementation

## 3.6. Action Sensitivity Levels

action_sensitivity allowed values:

- normal
- trust_sensitive
- privacy_sensitive
- document_sensitive
- lifecycle_sensitive
- hidden_domain_sensitive
- location_sensitive
- irreversible

## 3.7. Stronger Approval Required For

Stronger approval required for:

- irreversible account / action change
- Admin role grant / removal
- hidden domain exposure
- Work Vault privacy override
- rating / trust correction
- lifecycle correction after completion
- bulk action
- payroll integration
- location tracking
- incident mode activation

## 3.8. Blocked Cross-Domain Actions

Blocked:

- Shift Job → Career lifecycle
- Career Job → Shift completion
- Employment Lifecycle → hidden HR without migration rule
- Work Vault access → employer permanent access
- Work Vault → payroll document locker
- Trust Visibility → public shaming / legal verification
- Manager Console → Admin action
- Workforce Ops → payroll / legal attendance
- Admin → silent user truth rewrite
- Backend/Login → product logic rewrite without domain approval

## 3.9. State-Based Permission Rule

Role permission alone is not enough.

Some actions are allowed only in valid states.

Examples:

- publish job only from draft after validation, preview/confirmation where applicable
- select worker only after application / interest
- confirm Joined only after valid offer acceptance
- force complete only after allowed stuck / grace condition
- rate only after workflow completion state
- revoke access only for active access grant
- payroll handoff only after future approved payroll architecture

## 3.10. Permission Denied UX

Denied actions should explain safely:

```txt
This action is not available in your current role.
This record is not available from this account.
This action is available only after the current step is complete.
This feature is not active in the current launch.
```

Must not expose:

- hidden Admin features
- private records
- security logic
- future-domain internals

---

# 4. DOMAIN OWNERSHIP AND BOUNDARY RULES

## 4.1. Domain Ownership Principle

Every feature, state, action and data record must have one clear owning domain.

Supporting domains may assist, but must not take ownership silently.

## 4.2. Domain Ownership Map

1. Shift Jobs owns temporary/short-duration hiring.
2. Career Jobs owns structured longer-form hiring.
3. Employment Lifecycle owns Career Jobs-only mini-HR state clarity.
4. Work Vault owns employee-controlled document/profile sharing.
5. Employer Trust Visibility owns embedded employer trust signals.
6. HR Section owns future hidden full-HR workflows.
7. Manager Console owns future hidden manager control queues.
8. Workforce Ops Hub owns future hidden operational execution.
9. Backend/Login owns account, auth, API, database, permissions and sync.
10. Admin System owns future hidden governance.
11. Future Payroll owns payroll only after separate approval.

## 4.3. Global Advisory Feature Rule

The following are advisory/support signals only:

- Smart Match Score
- Simple Applicant Fit Score
- Application Strength Indicator
- Smart Assignment Recommendation
- Shift Fill Health Indicator
- Worker Reliability Score
- Document Readiness Score
- Employer Trust Breakdown
- Work History Confidence Label
- Ops Performance Summary
- Manager Activity Audit Summary

Rule:

Advisory/support signals must not become automatic approval, automatic rejection, legal proof, payroll truth, Admin enforcement or hidden punishment.

## 4.4. AI / Automation Claim Safety Rule

Blocked wording:

```txt
AI approved worker.
AI selected candidate.
Guaranteed best worker.
ATS approved candidate.
Verified hire decision.
Fraud-proof employer.
Legal employment verified.
```

Allowed wording:

```txt
Suggested based on available profile and workflow history.
This is a guidance signal only.
Employer makes the final decision.
```

Rule:

Do not claim real AI, automated hiring authority, fraud detection, legal verification or guaranteed accuracy unless implemented, reviewed and approved.

## 4.5. Payroll Global Boundary

Payroll is a future separate Mitra Labs product/module.

Current Job Mitra documents may be payroll-ready but must not process payroll.

Blocked now:

- salary processing
- wage calculation
- payslip generation
- tax calculation
- bank payment
- statutory payroll reporting
- legal payroll proof

Allowed now:

- future payroll boundary notes
- payroll-handoff readiness concept inside HR Section
- blocked payroll wording
- future integration requirements

## 4.6. Location / Tracking Safety Rule

Location/work-area support may exist as:

- location summary
- work area
- reporting point
- travel readiness
- route/location readiness note

Blocked unless future-approved and implemented:

- live GPS tracking claim
- precise worker tracking
- attendance proof through location
- legal attendance claim
- hidden worker surveillance

## 4.7. Backend Authority Boundary

Backend/Login enforces product truth.

Backend/Login must not redefine domain behavior.

Example:

- Shift Jobs defines `standby`.
- Backend stores and permission-checks `standby`.

Rule:

Backend implementation must follow domain documents, not silently change product meaning.

## 4.8. Draft / Preview / Publish Safety Rule

Draft, preview and publish flows apply globally to employer-created job records.

This rule applies to:

- Shift Jobs
- Career Jobs
- future employer-created public records where approved

### 4.8.1. Draft Record Rule

Draft records are owner-only.

Draft records must not:

- appear in employee discovery
- accept applications/interests
- trigger public notifications
- affect trust/rating
- count as active public jobs
- appear as public vacancies

Allowed draft actions:

- save draft
- resume draft
- edit draft
- delete draft
- preview draft
- publish draft after validation

### 4.8.2. Auto-save Rule

Auto-save protects long forms from accidental data loss.

Rules:

- auto-save must not publish records
- auto-save must not make records public
- Phase 0 may use local/device storage
- backend sync must not be claimed before implemented
- user must still perform a deliberate publish action

### 4.8.3. Preview Before Publish Rule

Preview allows the owner to see the employee-facing version before publishing.

Rules:

- preview is private
- preview must not trigger notifications
- preview must not expose hidden/admin/employer-private data
- preview must clearly indicate that the job is not public yet

### 4.8.4. Duplicate Public Record Warning

Duplicate warnings are advisory safety checks.

The system may warn when a similar Shift Job or Career Job may already exist.

Rules:

- warning must not block valid repeated work unfairly
- warning must not delete/merge records automatically
- warning must not publish records
- owner must decide whether to continue

### 4.8.5. Publish Confirmation Rule

Before a draft becomes public, the owner must confirm publish.

Safe wording:

```txt
This job will be visible to employees. Continue?
```

Rules:

- publish must be deliberate
- required fields must be validated before publish
- wrong-role publish must be blocked
- hidden/future domain publish must be blocked in launch

### 4.8.6. Incomplete Draft Reminder Rule

Employer dashboard may show unfinished drafts.

Rules:

- reminder is visible only to the draft owner
- reminder must not expose private draft details to employees
- reminder must open the correct edit/resume flow
- reminder must not pressure accidental publishing

---

# 5. CANONICAL ENTITY AND OBJECT RULES

## 5.1. Core Object Principle

Every object must have:

- stable ID
- owner role
- source domain
- lifecycle/status
- visibility scope
- trust/privacy sensitivity
- created/updated timestamps
- audit/correction path where needed

## 5.2. Canonical Entity Groups

1. Identity entities
2. Employer entities
3. Employee entities
4. Shift Jobs entities
5. Career Jobs entities
6. Employment Lifecycle entities
7. Work Vault entities
8. Employer Trust / Rating entities
9. Hidden HR entities
10. Manager Console entities
11. Workforce Ops entities
12. Backend/Login entities
13. Admin / Governance entities
14. Future Payroll boundary entities
15. Audit / Timeline entities

## 5.3. Required Source Domain Values

source_domain allowed values:

- shift_jobs
- career_jobs
- employment_lifecycle
- work_vault
- employer_trust_visibility
- hr_section_hidden
- manager_console_hidden
- workforce_ops_hidden
- backend_login
- admin_system_hidden
- future_payroll
- insights_future

## 5.4. Visibility Scope Values

visibility_scope allowed values:

- owner_only
- role_limited
- workflow_limited
- employer_owned
- employee_owned
- shared_by_employee
- admin_hidden
- hidden_future
- public_safe_summary

## 5.5. Sensitivity Values

sensitivity_level allowed values:

- normal
- trust_sensitive
- privacy_sensitive
- document_sensitive
- lifecycle_sensitive
- location_sensitive
- admin_sensitive
- hidden_future_sensitive
- payroll_future_sensitive

## 5.6. Object Relationship Rules

Shift Job may link to:

- employer
- shift applications
- shift selections
- standby records
- reliability/fill-health snapshots
- ratings

Shift Job must not link directly to:

- Employment Lifecycle record
- HR employee record
- Payroll record

Career Job may link to:

- employer
- career applications
- eligibility answers
- discussions
- offers
- Employment Lifecycle record
- ratings

Career Job must not silently link to:

- hidden HR records
- Workforce Ops items
- Payroll records

Work Vault may link to:

- employee
- document metadata
- document versions
- access grants
- access events
- readiness snapshots

Work Vault must not be owned by:

- employer
- HR Section
- Manager Console
- Workforce Ops
- Payroll

Employment Lifecycle may link to:

- Career Job
- Career Application
- Career Offer
- Work Vault work-history summary where safe
- ratings

Employment Lifecycle must not link to:

- Shift Job
- payroll truth
- legal employment proof

---

# 6. LIFECYCLE AND STATE-TRANSITION RULES

## 6.1. Core State Principle

State is product truth.

A state change must mean something real in the product workflow.

No major state may change silently, randomly or without a valid previous state.

## 6.2. State Change Must Define

Every important state transition must define:

- source domain
- source record ID
- previous state
- next state
- actor role
- actor ID
- allowed trigger
- timestamp
- reason where needed
- audit / timeline event where required

## 6.3. Shift Jobs State Lock

Shift Jobs must follow the Shift Jobs Architecture.

Global hard rules:

- Shift Jobs must not create Employment Lifecycle.
- Shift Jobs must not use Career application pipeline states.
- Shift completion must not mean Joined.
- Standby/backup must not erase original worker history.
- No-response and no-show must remain separate.
- Shift Fill Health is guidance only.

## 6.4. Career Jobs State Lock

Career Jobs must follow the Career Jobs Architecture.

Global hard rules:

- Career Jobs must not become Shift Jobs.
- Career Jobs must not become ATS/CV-heavy recruiter ERP.
- Applicant Fit is advisory only.
- Candidate comparison is guidance only.
- Offer expired/declined must not silently become working.
- Career Jobs is the only launch-visible entry point into Employment Lifecycle.

## 6.5. Employment Lifecycle State Lock

Employment Lifecycle must follow the Employment Lifecycle Architecture.

Global hard rules:

- Accept does not mean Joined.
- Joined requires employer confirmation.
- Force Complete is protective closure, not employer confirmation.
- Work History Confidence Label must be honest.
- Completed must not directly reactivate into working.
- Employment Lifecycle must not become HR Section, Payroll, Attendance or legal proof.

## 6.6. Work Vault Access State Lock

Work Vault must follow the Work Vault Architecture.

Global hard rules:

- Employee controls Work Vault.
- Employer sees only explicitly shared content.
- Revoked/expired access must block future viewing where supported.
- Delete, revoke, expire and archive must remain separate.
- Secure/encrypted vault must not be claimed unless implemented.
- Work Vault must not become payroll document locker.

## 6.7. Employer Trust State Lock

Employer Trust Visibility must follow its architecture.

Global hard rules:

- Trust must be visible before commitment.
- Low-data state must be honest.
- Trust Breakdown is explanatory only.
- Review Authenticity Guard is future governance support, not public accusation.
- Employer cannot manually edit own trust/rating.
- Trust must not become legal verification or fraud guarantee.

## 6.8. Hidden HR State Lock

HR Section must remain hidden until future approved activation.

Global hard rules:

- HR Section must not appear in launch UI.
- HR Section must not silently absorb Career mini-HR.
- HR Section must not own Work Vault documents.
- HR Section must be future payroll-ready but must not become payroll.

## 6.9. Manager Console State Lock

Manager Console must remain hidden until future approved activation.

Global hard rules:

- Manager Console must not replace Employer Dashboard.
- Manager approval must not become Admin enforcement.
- Bulk actions must be controlled, confirmed and audited.
- Manager notes must not appear to employees.
- Manager Console must not become payroll/legal attendance proof.

## 6.10. Workforce Ops State Lock

Workforce Ops Hub must remain hidden until future approved activation.

Global hard rules:

- Workforce Ops must not appear in launch UI.
- Smart Assignment is advisory only.
- Route/location readiness must not become live tracking.
- Checklist completion is not payroll/legal proof.
- Employee-to-employee messaging remains blocked.

## 6.11. High-Impact Transition Audit

Audit required for:

- Shift selection / standby / replacement / no-show / completion
- Career shortlist / rejection / selection / discussion / offer / joined confirmation
- Employment Lifecycle resignation / force complete / completion / correction
- Work Vault access grant / revoke / expiry / scope change
- Rating edit
- Trust correction
- Hidden HR migration
- HR payroll-handoff readiness change
- Manager permission change / bulk action
- Workforce Ops carry-forward / replacement / closure / escalation
- Admin restriction / restore / appeal / irreversible action
- Backend account deletion request

## 6.12. Correction Rule

State correction must preserve:

- wrong state
- corrected state
- correction reason
- actor
- timestamp
- before / after state
- affected domain
- source record

Rule:

Correction must not delete the original timeline.

## 6.13. Blocked Global Transitions

Globally blocked:

- Shift Jobs → Career Jobs silently
- Career Jobs → Shift Jobs silently
- Career mini-HR → hidden HR Section silently
- Work Vault access → permanent employer access silently
- Employer Trust → public shaming or legal verification
- Manager Console → Admin power
- Workforce Ops → payroll / legal proof
- HR Section → payroll processing
- Backend/Login → hidden domain exposure without approval
- Admin → silent data rewrite

---

# 7. DATA TRUST, PRIVACY, DELETION AND RETENTION RULES

## 7.1. Core Data Trust Principle

Data must not become more authoritative than the product can honestly support.

In Phase 0:

- local/demo state is useful for product demonstration.

In future production:

- backend-secured state, audit, permissions and recovery may provide stronger authority.

Rule:

Product wording and system behavior must not over-promise Phase-0 data authority.

## 7.2. Data Ownership Groups

1. Employer-owned data
2. Employee-owned data
3. Shared workflow data
4. Work Vault private data
5. Trust/rating data
6. Employment lifecycle data
7. Hidden future-domain data
8. Platform governance data
9. Audit/timeline data
10. Backend/account data

## 7.3. Employer-Owned Data

Employer-owned data includes:

- employer profile
- own Shift Jobs
- own Career Jobs
- applicant review records for own jobs
- employer-side lifecycle actions
- employer trust summary

Employer must not edit:

- employee Work Vault data
- employee-owned ratings
- employee resignation record
- Admin governance records
- hidden platform trust calculations directly

## 7.4. Employee-Owned Data

Employee-owned data includes:

- employee profile
- own applications
- own Work Vault
- document visibility choices
- access revoke actions
- own lifecycle actions
- own rating submissions

Employee must not edit:

- employer job records
- employer rating records
- employer private notes
- joined confirmation
- Admin governance records

## 7.5. Shared Workflow Data

Shared workflow data includes:

- applications
- selections
- offers
- accepted / declined responses
- lifecycle records
- ratings
- Work Vault access grants

Rule:

Shared workflow data needs clear ownership and action rights.

No single side should silently rewrite the other side’s action.

## 7.6. Work Vault Private Data

Work Vault is employee-controlled.

Employer sees only:

- explicitly shared content
- active allowed access
- verification result within allowed scope

Employer must not see:

- unshared folders
- revoked documents
- expired documents
- unrelated documents
- hidden/private notes
- permanent access after revoke/expiry

## 7.7. Trust / Rating Data

Trust / rating data is trust-sensitive.

Rules:

- ratings must be linked to valid workflow context
- trust level must not be manually faked
- rating edits must preserve edit history
- trust corrections must be audited
- low-data state must not be misrepresented as high trust

Trust data must not become:

- public shaming feed
- hidden punishment without evidence
- manually editable marketing badge
- legal verification

## 7.8. Hidden Future-Domain Data

Hidden domain data includes:

- HR Section data
- Manager Console data
- Workforce Ops data
- Full Insights future analytics
- Admin governance data
- future Payroll data

Rule:

Hidden domain data must not appear in launch-visible UI.

Hidden domain records must not be created silently from launch flows unless future migration/integration is explicitly approved.

## 7.9. Deletion Principles

Deletion must distinguish between:

- local demo deletion
- user-visible removal
- revoke access
- expire access
- archive
- audit retention
- production deletion request
- account deletion request

Rule:

Delete is not always the same as erase forever.

## 7.10. Account Deletion Readiness Rule

When backend/login launches, account deletion must support:

- in-app account deletion path
- web deletion request link
- privacy policy alignment
- Play Store data safety alignment
- session revocation
- clear explanation of retained/anonymized records where applicable

## 7.11. Privacy Claim Safety Rule

Do not claim:

- verified identity
- secure document vault
- encrypted storage
- legal employment proof
- official background check
- payroll processing
- live GPS tracking
- real push/SMS/email notifications

unless implemented, reviewed and approved.

---

# 8. NOTIFICATION AND ALERT CONTRACT

## 8.1. Notification Principle

Notifications must be:

- role-safe
- domain-safe
- action-linked
- privacy-safe
- launch-scope safe
- not misleading about real infrastructure

## 8.2. Notification Must Define

Every notification must define:

- source domain
- target role
- target user/account
- source record
- notification type
- safe title
- safe message
- action route
- read/unread state
- launch vs future status

## 8.3. Notification Privacy Rules

Notifications must not:

- expose other applicants
- expose other workers
- expose Work Vault private folders
- expose employer private notes
- expose hidden Admin logic
- expose hidden HR/Manager/Workforce internals
- claim real push/SMS/WhatsApp/email unless implemented

## 8.4. Domain Notification Separation

Shift Jobs notifications must not use Career/HR wording.

Career Jobs notifications must not use Shift replacement/no-show wording.

Employment Lifecycle notifications must not use payroll/legal wording.

Work Vault notifications must not imply full vault access.

Employer Trust notifications must not publicly accuse employer.

Hidden HR/Manager/Workforce notifications must not appear in launch UI.

## 8.5. Safe Notification Examples

```txt
You were selected for this shift.
Please confirm you can attend this shift.
Your application is under review.
An employer requested document verification.
Access will expire soon.
Review employer trust before continuing.
```

## 8.6. Blocked Notification Examples

```txt
You are legally employed.
Your attendance is verified for payroll.
AI approved this worker.
Employer is fraud risk.
Admin restricted this employer.
Your secure encrypted vault is active.
```

---

# 9. BACKEND/LOGIN, ACCOUNT AND PRODUCTION READINESS RULES

## 9.1. Backend/Login Separation Rule

Backend/Login is a shared foundation layer.

It must support all domains safely through:

- accounts
- sessions
- role context
- APIs
- database persistence
- permissions
- audit
- sync
- privacy controls

It must not rewrite product domain truth.

## 9.2. Role Context Rule

Every production API action must know:

- authenticated user
- active role context
- target domain
- record ownership
- workflow state
- visibility scope

Frontend hiding is not security.

Backend must enforce permissions.

## 9.3. Local-to-Backend Migration Rule

Current local/demo data must not be silently uploaded into production accounts.

Allowed approach:

```txt
Keep local demo data separate from logged-in production data.
```

Rule:

User must understand what data is local/demo and what data belongs to logged-in backend account.

## 9.4. Backend Save Truth Rule

If backend save fails:

- do not show fake success
- preserve draft where possible
- show retry path
- keep sync status clear

## 9.5. Production No-Go Conditions

Do not launch backend/login if:

- account deletion path is missing
- sessions cannot be revoked
- wrong-role APIs can access private data
- password/OTP secrets are logged
- production data can be overwritten by demo data
- Play Store data safety form is not updated
- privacy policy does not match backend behavior
- Work Vault private data access is not permission-safe

---

# 10. HIDDEN FUTURE-DOMAIN ACTIVATION RULES

## 10.1. Hidden Domain Activation Principle

Hidden domains may be architected now but must not activate casually.

Hidden domain exposure requires:

- explicit product decision
- backend login
- role permission model
- audit model
- privacy review
- UI/UX review
- Play Store/data safety review where needed
- migration/integration plan
- rollback plan

## 10.2. HR Section Activation Rule

HR Section may activate only after:

- backend identity exists
- employer/HR roles exist
- Work Vault boundaries are safe
- Career mini-HR migration rule exists
- employee-facing HR visibility is defined
- payroll boundary remains separate

## 10.3. Manager Console Activation Rule

Manager Console may activate only after:

- manager role permissions exist
- work queue ownership exists
- audit exists
- bulk action safety exists
- employee-private notes remain hidden

## 10.4. Workforce Ops Activation Rule

Workforce Ops may activate only after:

- ops role permissions exist
- source domain integration exists
- worker privacy rules exist
- route/location claim safety exists
- ops actions do not become payroll/legal proof

## 10.5. Payroll Activation Rule

Future Payroll requires separate architecture.

Payroll cannot activate from HR/Workforce/Career documents alone.

Payroll activation requires:

- separate payroll master document
- backend security review
- legal/policy review
- payroll data model
- payment/tax/payslip rules
- privacy policy update
- Play Store data safety update
- explicit Go/No-Go decision

---

# 11. DEFERRED ITEMS, CHANGE-CONTROL AND RELEASE SAFETY RULES

## 11.1. Change Request Template

Every major future change should answer:

- What is changing?
- Which domain owns it?
- Which roles are affected?
- Is it launch-visible or hidden?
- Does it affect Shift/Career separation?
- Does it affect Work Vault privacy?
- Does it affect trust/rating/lifecycle?
- Does it require backend?
- Does it require Play Store/policy review?
- Does the master document need an update?

## 11.2. Locked Boundary Review

Before approving future change, confirm:

- Shift Jobs and Career Jobs remain separate
- Mini-HR and HR Section remain separate
- Employer and Employee exposure remain separate
- hidden domains remain hidden unless explicitly approved
- Work Vault privacy is not weakened
- trust/rating meaning is not weakened
- advisory signals remain advisory
- payroll/legal/location claims are not over-promised
- Phase-0 does not over-promise production capability

## 11.3. Release / Current Status Document Separation

Master Product Documents should contain:

- product truth
- architecture truth
- scope truth
- feature boundaries
- long-term decisions

Release / Current Status Documents should contain:

- Play Console status
- production status
- tester status
- freeze state
- release blockers
- go / no-go decisions
- current operational progress

Rule:

Do not mix live release operations into master product truth casually.

## 11.4. Master Integration Rule

New advanced sections must not be merged blindly.

Before final master lock:

- place sections in correct order
- remove unnecessary duplicate wording
- preserve intentional safety repetition
- apply final numbering once
- check hidden-domain boundaries
- check Phase-0 safety wording
- check role-safe consistency
- check backend readiness references

## 11.5. Phase-0 Demo-Safe Boundary

Phase 0 may include:

- localStorage
- demo data
- local state machines
- demo notifications
- demo trust/rating states
- hidden route guards
- local audit simulation
- local confidence checks
- local advisory scores

Phase 0 must not include claims of:

- real backend authority
- real identity verification
- real OTP/SMS sending
- real payment processing
- real payroll
- real legal employment proof
- real production Admin enforcement
- real irreversible actions
- real background messaging
- real push/SMS/WhatsApp/email reminders
- real live GPS tracking
- real secure encrypted document vault

---

# 12. FINAL CROSS-DOMAIN LOCK NOTE

Cross-Domain System Rules are approved as shared product safety rules.

Final locked boundaries:

- Employer and Employee must stay separate.
- Shift Jobs and Career Jobs must stay separate.
- Employment Lifecycle must stay Career Jobs-only.
- Work Vault must stay employee-controlled.
- Employer Trust Visibility must stay embedded and decision-point safe.
- Hidden HR Section must stay hidden until approved future activation.
- Manager Console must stay hidden until approved future activation.
- Workforce Ops Hub must stay hidden until approved future activation.
- Payroll must remain a separate future Mitra Labs product/module.
- Backend/Login must enforce product truth, not redefine it.
- Advisory signals must stay advisory.
- Phase 0 must not over-promise production capability.
- Future changes must follow change-control discipline.

— END OF CROSS-DOMAIN SYSTEM RULES —
