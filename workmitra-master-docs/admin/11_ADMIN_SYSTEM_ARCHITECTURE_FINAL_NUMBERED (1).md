<!-- App name: WorkMitra / Job Mitra
File name: 11_ADMIN_SYSTEM_ARCHITECTURE.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\11_ADMIN_SYSTEM_ARCHITECTURE.md -->

# 1. WORKMITRA / JOB MITRA — ADMIN SYSTEM ARCHITECTURE

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `02_SHIFT_JOBS_ARCHITECTURE.md`
- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `05_EMPLOYER_TRUST_VISIBILITY.md`
- `06_EMPLOYMENT_LIFECYCLE.md`
- `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
- `08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md`
- `09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE.md`
- `10_FULL_INSIGHTS_HIDDEN_ARCHITECTURE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

Admin System is the hidden platform-owner governance architecture of Job Mitra.

It supports moderation, trust governance, fraud review, fake job review, user safety review, evidence handling, appeals, re-review, audit, permission control, incident response and irreversible action governance.

Admin must remain hidden from normal launch UI.

## 1.3. Core Principle

Admin System = hidden platform governance and control layer.

It must be:

- hidden from normal launch users
- evidence-led
- permission-scoped
- audit-first
- privacy-safe
- appeal-aware
- proportional
- high-risk action protected
- separate from normal Employer / Employee workflows

Admin System is not:

- public launch role
- Employer dashboard
- Employee dashboard
- Manager Console
- HR Section
- Workforce Ops Hub
- normal user workflow
- payroll system
- legal authority system
- uncontrolled super-user backdoor

## 1.4. What Admin System Is

Admin System is:

- hidden in launch UI
- platform owner governance console
- moderation and review layer
- case / queue / evidence system
- fraud and abuse investigation workspace
- trust/rating correction governance layer
- appeal and re-review control layer
- admin audit and permission-control system
- incident / crisis response architecture
- irreversible action safety layer

## 1.5. What Admin System Is Not

Admin System is not:

- launch-visible feature
- user-facing role
- employer operation manager
- employee workflow tool
- payroll system
- legal court / police authority
- uncontrolled super-user backdoor
- shortcut to rewrite user truth
- replacement for Manager Console
- replacement for HR Section
- replacement for Workforce Ops Hub

## 1.6. Hard Non-Mixing Rule

Admin must not appear in:

- landing page
- role picker
- employer dashboard
- employee dashboard
- Shift Jobs flow
- Career Jobs flow
- Work Vault flow
- Employment Lifecycle screens
- public launch explanation
- normal app navigation

Rule:

Admin may exist architecturally, but must remain hidden from normal launch-visible product truth.

## 1.7. Admin Governance Domains

Admin System may govern:

1. Employer moderation
2. Employee safety / complaint review
3. Job moderation
4. Temporary vs Career workflow integrity
5. Work Vault misuse review
6. Rating / trust abuse review
7. Fraud / fake job / fake employer investigation
8. Duplicate / coordinated abuse review
9. Appeal / re-review
10. Audit log and permission review
11. Incident / crisis response
12. Compliance / policy review
13. Hidden-domain misuse review
14. Backend/account governance where future-approved

## 1.8. Admin Role Fit

### 1.8.1. Platform Owner / Super Admin

Super Admin may:

- configure admin roles
- approve high-risk actions
- review severe cases
- activate incident mode
- approve irreversible restrictions
- review admin permission changes

Super Admin must not:

- casually browse private data
- bypass audit
- silently rewrite user truth
- use Admin as personal editing tool

### 1.8.2. Trust & Safety Admin

Trust & Safety Admin may:

- review safety reports
- review fraud / fake job signals
- review rating / trust abuse
- recommend restrictions
- handle appeals where permitted

### 1.8.3. Moderation Admin

Moderation Admin may:

- review job content
- request edits
- hold visibility
- approve / reject corrected jobs
- escalate high-risk cases

### 1.8.4. Support Admin

Support Admin may:

- view limited support cases
- request clarification
- add support notes
- escalate to higher admin role
- close low-risk cases where permitted

### 1.8.5. Compliance / Security Admin

Compliance / Security Admin may:

- review privacy/security cases
- review Work Vault misuse
- review incident mode
- handle compliance-sensitive cases
- approve sensitive evidence handling where permitted

## 1.9. Admin Screen-by-Screen Architecture

### 1.9.1. Admin Command Center

Shows:

- open cases
- high-risk cases
- overdue reviews
- pending appeals
- incident status
- admin actions needing second approval
- permission review alerts
- trust / fraud / safety queues

### 1.9.2. Case Queue Center

Shows:

- case type
- affected domain
- severity
- priority
- assigned admin
- case status
- SLA / due status
- next action

### 1.9.3. Case Detail

Shows:

- case summary
- linked user / job / workflow
- evidence list
- evidence sensitivity
- timeline
- affected records
- allowed actions
- audit log
- appeal / re-review state
- decision recommendation where permitted

### 1.9.4. Employer Moderation Center

Reviews:

- suspicious employer profile
- repeated fake job concern
- trust / rating abuse
- posting misuse
- low-data trust misuse
- employer identity inconsistency

### 1.9.5. Employee Safety / Complaint Review Center

Reviews:

- employee complaints
- safety reports
- harassment / contact abuse
- fake job reports
- privacy concerns
- Work Vault misuse reports

### 1.9.6. Job Moderation Center

Reviews:

- Shift Job risk
- Career Job risk
- wrong domain classification
- unsafe / misleading wording
- prohibited content
- hidden-domain leakage
- payroll/legal overclaim

### 1.9.7. Work Vault / Privacy Review

Reviews:

- document access misuse
- OTP path misuse
- unauthorized access concern
- privacy complaint
- revoke / expiry dispute
- employer over-requesting documents

### 1.9.8. Fraud / Abuse Investigation Workspace

Reviews:

- fake employer
- fake job
- duplicate account abuse
- coordinated abuse
- suspicious rating patterns
- repeated report clusters
- trust manipulation

### 1.9.9. Appeals / Re-review Center

Handles:

- employer appeal
- employee appeal
- job rejection appeal
- visibility hold appeal
- account restriction appeal
- trust / rating action appeal

### 1.9.10. Audit Log Viewer

Shows immutable admin action history.

Must support:

- filter by admin
- filter by target record
- filter by action type
- filter by date
- high-risk action review

### 1.9.11. Permission Management

Super Admin-only role and permission control.

Shows:

- admin users
- admin role
- permission scope
- status
- last access
- high-risk permission changes

### 1.9.12. Incident / Crisis Mode

Reserved for severe platform risk.

Shows:

- incident type
- affected domain
- active restrictions
- owner admin
- start/end time
- action log
- resolution plan

## 1.10. Admin Case Type Model

admin_case_type allowed values:

- employer_profile_review
- employer_abuse_review
- employee_safety_complaint
- employee_fraud_review
- shift_job_moderation
- career_job_moderation
- workflow_integrity_review
- work_vault_privacy_review
- rating_trust_abuse_review
- fraud_investigation
- fake_job_review
- fake_employer_review
- duplicate_account_review
- appeal_review
- compliance_review
- admin_permission_review
- incident_response
- backend_account_governance_future

## 1.11. Admin Case Status Model

admin_case_status allowed values:

- new
- triaged
- assigned
- in_review
- waiting_for_user
- waiting_for_employer
- waiting_for_employee
- waiting_for_evidence
- escalated
- action_recommended
- second_approval_required
- action_taken
- appeal_open
- re_review
- resolved
- closed
- reopened

## 1.12. Severity and Priority Model

### 1.12.1. Severity

admin_case_severity allowed values:

- low
- medium
- high
- critical

### 1.12.2. Priority

admin_case_priority allowed values:

- normal
- urgent
- time_sensitive
- safety_critical
- platform_critical

### 1.12.3. Severity Rules

Low:

- minor wording issue
- first-time low-risk correction
- incomplete profile concern

Medium:

- repeated misleading wording
- repeated low-quality reports
- moderate privacy concern
- rating dispute requiring review

High:

- likely fake job
- repeated employer misuse
- Work Vault privacy risk
- repeated rating manipulation
- safety complaint with credible evidence

Critical:

- severe safety risk
- mass fake job attack
- platform security/compliance issue
- admin permission misuse
- coordinated fraud cluster

## 1.13. Advanced Admin Governance System

This section adds the enterprise-grade future Admin control layer.

It is hidden for launch and may only be activated in a future approved version with backend login, permission enforcement, audit, privacy review and release approval.

### 1.13.1. Admin Command Center

Admin Command Center gives the platform owner a single high-level control surface.

It must show:

- open cases
- critical cases
- overdue reviews
- appeals pending
- high-risk actions waiting second approval
- incident status
- trust/fraud/privacy queues

Rules:

- command center is hidden
- command center is permission-scoped
- command center must not expose private evidence unless user has permission
- command center must not allow silent irreversible actions

### 1.13.2. Case Severity + Priority System

Each case must have severity and priority.

Rules:

- severity describes risk level
- priority describes urgency
- critical cases require stronger handling
- severity/priority changes must be audited
- priority must not be used to bypass evidence review

### 1.13.3. Evidence Vault for Admin Cases

Evidence Vault stores case-linked evidence references.

Evidence may include:

- job snapshot
- user report
- employer response
- employee response
- Work Vault access event
- rating record
- workflow history
- system flag
- appeal submission
- screenshot/reference metadata where future-supported

Rules:

- evidence must be case-linked
- evidence must have sensitivity label
- private evidence must be view-permission controlled
- evidence does not automatically decide outcome
- evidence access must be audit logged where sensitive
- Admin must not casually browse private Work Vault data

### 1.13.4. Two-Person Approval for High-Risk Actions

High-risk actions require second approval or Super Admin review.

High-risk actions include:

- permanent suspension
- irreversible restore
- platform-wide restriction
- admin permission grant / removal
- incident mode activation
- compliance lock release
- trust correction with major impact
- bulk action affecting many users/jobs

Rules:

- first admin recommends action
- second authorized admin approves/rejects
- both decisions are audited
- action cannot complete without required approval
- emergency action must be time-bounded and reviewed later

### 1.13.5. Admin Role Permission Levels

Admin must follow least privilege.

Admin roles:

- support_admin
- moderation_admin
- trust_safety_admin
- operations_admin
- compliance_security_admin
- super_admin

Rules:

- not every admin can view every case
- not every admin can take every action
- sensitive evidence needs higher permission
- admin cannot grant own permission
- permission changes require audit and stronger approval where high-risk

### 1.13.6. Appeal / Re-review Workflow

Appeal and re-review must exist for important actions.

Appeal may apply to:

- job rejection
- visibility hold
- feature restriction
- account suspension
- trust / rating action
- fake job / fake employer outcome
- Work Vault misuse decision

Rules:

- appeal must preserve original decision
- appeal must compare old evidence and new evidence
- appeal reviewer should not casually delete original outcome
- appeal outcome must be audited
- restore/change action must preserve before/after state

### 1.13.7. Fraud / Fake Job / Fake Employer Review System

Fraud review may cover:

- suspicious employer
- fake job pattern
- duplicate account abuse
- repeated false applications
- rating manipulation
- Work Vault misuse
- coordinated reports

Rules:

- fraud review is evidence-led
- one report alone is not final proof
- hidden fraud signals must not appear in launch UI
- fraud detection must not be claimed as real/automatic unless implemented
- restrictions must be proportional

### 1.13.8. Privacy-Safe Evidence Viewing

Admin evidence viewing must be permission-scoped.

Rules:

- Work Vault data cannot be browsed casually
- private documents require case-linked reason
- sensitive evidence view must be audit logged
- admins should see summary first where possible
- evidence visibility must match admin role and case type

### 1.13.9. Admin Action Audit Trail

Every meaningful admin action must write audit.

Audit must include:

- admin ID
- admin role
- action
- target type
- target ID
- reason
- evidence reference
- before state
- after state
- timestamp

Rules:

- audit log is immutable
- normal admins cannot edit audit
- correction adds new audit event, not edit old event
- audit must survive appeal/re-review

### 1.13.10. Incident / Crisis Mode

Incident mode is reserved for severe platform risk.

Examples:

- mass fake job attack
- severe employee safety event
- fake employer cluster
- coordinated abuse
- compliance / security issue
- admin permission misuse

Rules:

- incident mode must be time-bounded
- Super Admin governed
- audit required
- avoid permanent bulk punishment without review
- incident mode must have resolution note
- post-incident review required

### 1.13.11. Restriction Ladder

Restriction ladder:

1. monitor
2. warning / correction request
3. visibility hold
4. feature restriction
5. suspension / review lock
6. permanent restriction

Rules:

- use proportional action
- preserve evidence
- allow appeal where appropriate
- permanent restriction needs strong evidence and stronger approval
- restriction must not erase history

### 1.13.12. Admin No-Silent-Edit Rule

Admin must not silently rewrite user/job/trust/lifecycle truth.

Allowed correction:

- create correction record
- preserve old state
- preserve new state
- record reason
- record admin actor
- record timestamp

Blocked:

- deleting rating history silently
- editing lifecycle without correction record
- hiding Work Vault access event
- changing trust level manually without audit
- restoring/suspending without action record

## 1.14. Admin Action Catalog

### 1.14.1. Normal Actions

Allowed actions:

- no_action
- monitor
- add_case_note
- request_clarification
- request_correction
- warn
- hold_visibility
- restrict_feature
- escalate
- close_case

### 1.14.2. High-Risk Actions

High-risk actions:

- suspend
- restore
- permanent_suspension
- irreversible_restore
- platform_wide_restriction
- admin_permission_grant
- admin_permission_removal
- incident_mode_activation
- compliance_lock_release
- major_trust_correction

Rule:

High-risk actions require stronger permission, second approval or Super Admin review.

## 1.15. Admin Permission Model

### 1.15.1. support_admin

May:

- view assigned low-risk support cases
- add notes
- request clarification
- escalate

Cannot:

- view sensitive evidence unless permitted
- restrict features
- suspend users
- change trust/rating
- manage permissions

### 1.15.2. moderation_admin

May:

- review job content
- request edits
- hold/release job visibility where permitted
- escalate risk cases

Cannot:

- permanently suspend account
- change admin permissions
- browse Work Vault casually

### 1.15.3. trust_safety_admin

May:

- review safety/fraud/trust cases
- recommend restrictions
- review rating/trust abuse
- handle selected appeals

Cannot:

- grant admin permissions
- override Super Admin-only actions
- bypass second approval

### 1.15.4. operations_admin

May:

- review workflow integrity
- review operational misuse signals
- review Manager/Workforce future escalations where permitted

Cannot:

- run employer operations directly
- act as Manager Console
- process payroll

### 1.15.5. compliance_security_admin

May:

- review privacy/security cases
- review Work Vault misuse
- review compliance-sensitive cases
- support incident review

Cannot:

- bypass audit
- expose private evidence outside case scope

### 1.15.6. super_admin

May:

- approve high-risk actions
- manage admin permissions
- activate incident mode
- approve permanent restriction
- review compliance/security cases

Cannot:

- silently rewrite truth
- bypass audit
- casually browse private user records

## 1.16. Evidence / Proof Review Model

Evidence may include:

- job snapshot
- user report
- employer response
- employee response
- Work Vault access event
- rating record
- workflow history
- system flag
- appeal submission
- timeline event
- account activity reference where future-approved

Evidence must be classified by:

- source
- reliability
- sensitivity
- related domain
- visibility permission
- retention requirement

Rule:

Evidence supports admin decision.

Evidence does not automatically decide outcome.

## 1.17. Evidence Sensitivity Model

evidence_sensitivity_level allowed values:

- public_safe
- role_limited
- private_user_data
- work_vault_sensitive
- trust_sensitive
- admin_sensitive
- security_sensitive
- legal_policy_sensitive_future

Rules:

- higher sensitivity requires stronger permission
- evidence access should be minimized
- sensitive evidence view should be logged
- private documents should not be copied into unrelated cases

## 1.18. Audit Log Requirement

Audit required for:

- case creation
- case assignment
- evidence view where sensitive
- warning
- correction request
- visibility hold
- restriction
- suspension
- restore
- appeal decision
- permission change
- incident activation
- irreversible action
- trust correction
- lifecycle correction
- Work Vault privacy override where future-approved

Audit must preserve:

- admin ID
- admin role
- action
- target
- reason
- evidence reference
- before state
- after state
- timestamp

## 1.19. Appeal / Re-review Rule

Appeal may apply to:

- job rejection
- visibility hold
- feature restriction
- account suspension
- trust / rating action
- fraud review outcome
- Work Vault misuse decision

Appeal review must check:

- original evidence
- original decision
- new evidence
- proportionality
- permission correctness
- process correctness
- restore / change need

Rules:

- appeal must not erase original action
- appeal outcome must be logged
- restored state must preserve history
- repeated appeals may require case-control rules

## 1.20. Incident / Crisis Mode

Incident mode may apply to:

- mass fake job attack
- severe employee safety event
- fake employer cluster
- coordinated abuse
- compliance / security issue
- admin permission misuse

Incident mode must:

- be time-bounded
- be Super Admin governed
- preserve audit
- avoid permanent bulk punishment without review
- define affected domain
- define resolution owner
- define exit condition
- require post-incident review

## 1.21. Employer Moderation Ladder

### 1.21.1. Level 0 — No Action / Monitor

Use when:

- evidence is weak
- issue is isolated
- no clear platform risk exists

Actions:

- monitor
- add case note
- close no-action where appropriate

### 1.21.2. Level 1 — Warning / Correction Request

Use when:

- employer made correctable mistake
- job wording is unclear
- profile content needs correction
- first-time misuse is minor

Actions:

- warn
- request correction
- hold publish where needed

### 1.21.3. Level 2 — Visibility Hold

Use when:

- job may mislead users
- employer profile needs review
- trust signal needs checking
- complaint / report needs evidence

Actions:

- hold job visibility
- hold employer trust boost where future-approved
- request response

### 1.21.4. Level 3 — Feature Restriction

Use when:

- repeated misuse appears
- employer posts unsafe / misleading jobs
- Work Vault access misuse appears
- rating abuse pattern appears

Actions:

- restrict job posting
- restrict verification request
- restrict trust visibility boost where future-approved
- escalate to Trust & Safety

### 1.21.5. Level 4 — Suspension / Review Lock

Use when:

- serious fake employer concern
- serious employee safety risk
- repeated abuse after warnings
- fraud pattern likely

Actions:

- suspend selected employer capability
- freeze high-risk actions
- preserve evidence
- require higher review

### 1.21.6. Level 5 — Permanent Restriction

Use only when:

- severe confirmed abuse
- repeated fraud
- serious safety / compliance risk
- platform integrity risk

Requirements:

- strong evidence
- Super Admin approval
- appeal path where allowed
- audit lock

## 1.22. Employee Safety / Complaint / Fraud Review Ladder

### 1.22.1. Level 0 — No Action / Monitor

Use when:

- report is unclear
- evidence is insufficient
- no immediate risk is visible

### 1.22.2. Level 1 — Support / Clarification

Use when:

- employee needs help
- employer/job details need clarification
- safety report is incomplete

### 1.22.3. Level 2 — Job / Employer Review

Use when:

- employee reports suspicious job
- employer communication appears unsafe
- job detail is misleading
- Work Vault request seems excessive

### 1.22.4. Level 3 — Protective Action

Use when:

- repeated employee reports exist
- employer behavior appears risky
- fraudulent job pattern appears
- privacy boundary may be breached

### 1.22.5. Level 4 — Escalation / Restriction

Use when:

- employee safety risk is serious
- fake employer likely
- repeated fraud signal exists
- urgent platform risk exists

Rule:

Employee safety review must protect the reporter and must not expose reporter identity casually.

## 1.23. Job Moderation Decision Matrix

Job moderation must check:

- domain classification
- role fit
- wording clarity
- pay / rate reference safety
- location / work area safety
- prohibited content
- misleading claims
- hidden-domain leakage
- Phase-0 safety
- payroll / legal overclaim
- employee privacy risk

### 1.23.1. Shift Job Moderation

Shift Job must not include:

- permanent employment wording
- Joined / resigned / notice lifecycle wording
- hidden Workforce Ops wording
- payroll / legal attendance claims
- employee-to-employee chat claims

### 1.23.2. Career Job Moderation

Career Job must not include:

- urgent shift replacement wording
- no-show shift handling logic
- payroll / legal employment claims
- hidden HR Section exposure
- ATS/AI hiring approval claims

### 1.23.3. Moderation Outcomes

Allowed outcomes:

- approve
- request_edit
- hold_visibility
- reject
- escalate_review
- restore_after_correction

## 1.24. Temporary vs Career Workflow Integrity Matrix

Admin must protect separation between:

- Shift Jobs = temporary / short-duration work
- Career Jobs = structured longer-form hiring

Blocked integrity violations:

- Shift Job creates Employment Lifecycle
- Career Job uses shift no-show replacement logic
- Shift application becomes Career application silently
- Career applicant becomes shift worker silently
- Shift completion creates HR record
- Career lifecycle exposes hidden HR Section

## 1.25. Workforce Ops Admin Oversight Boundaries

Admin may review Workforce Ops misuse in future.

Admin must not:

- run employer operations directly
- assign workers as employer
- close daily ops items casually
- use Workforce Ops as enforcement shortcut
- turn ops state into payroll / legal proof

Rule:

Workforce Ops is future hidden operational domain.

Admin is governance domain.

They must not merge.

## 1.26. Work Vault Privacy Review

Admin may review:

- unauthorized access concern
- OTP path misuse
- employer over-requesting documents
- access log dispute
- revoke issue
- hidden HR path misuse

Admin must not:

- browse full employee vault casually
- expose employee documents to employer
- override employee control without future governed process
- treat Work Vault as employer-owned storage

## 1.27. Rating / Trust Abuse Review

Admin may review:

- suspicious rating pattern
- fake rating cluster
- rating pressure complaint
- rating edit misuse
- trust level manipulation
- low-data trust misrepresentation

Rules:

- trust action must be evidence-based
- one report does not prove abuse
- hidden trust risk notes must not appear in launch UI
- rating correction must preserve old/new state

## 1.28. Data Model

### 1.28.1. ADMIN_CASE

Fields:

- admin_case_id
- case_type
- primary_domain
- severity
- priority
- case_status
- assigned_admin_id_optional
- evidence_summary
- second_approval_required
- created_at
- updated_at

### 1.28.2. ADMIN_ACTION

Fields:

- admin_action_id
- admin_case_id
- action_type
- target_type
- target_id
- admin_id
- reason
- before_state_optional
- after_state_optional
- second_approval_status_optional
- created_at

### 1.28.3. ADMIN_EVIDENCE

Fields:

- evidence_id
- admin_case_id
- evidence_source_type
- evidence_category
- submitted_by_role_optional
- submitted_by_user_id_optional
- related_record_type
- related_record_id
- reliability_level
- sensitivity_level
- visibility_scope
- evidence_summary
- created_at

### 1.28.4. ADMIN_APPEAL_REVIEW

Fields:

- appeal_id
- original_admin_case_id
- original_action_id
- appellant_role
- appellant_user_id
- appeal_reason
- new_evidence_refs_optional
- appeal_status
- assigned_reviewer_admin_id
- appeal_outcome_optional
- created_at
- updated_at

### 1.28.5. ADMIN_AUDIT_LOG

Fields:

- audit_log_id
- audit_event_type
- admin_case_id_optional
- admin_action_id_optional
- admin_user_id
- admin_role
- target_type
- target_id
- before_state_optional
- after_state_optional
- reason
- evidence_refs_optional
- created_at

### 1.28.6. ADMIN_SECOND_APPROVAL

Purpose:

Second approval record for high-risk admin action.

Fields:

- admin_second_approval_id
- admin_action_id
- requested_by_admin_id
- approved_by_admin_id_optional
- approval_status
- approval_reason_optional
- requested_at
- decided_at_optional

Rule:

Requested admin and approving admin must not be the same user unless emergency Super Admin override is explicitly approved and audited.

### 1.28.7. ADMIN_INCIDENT

Purpose:

Incident / crisis mode record.

Fields:

- admin_incident_id
- incident_type
- affected_domain
- severity
- status
- activated_by_admin_id
- approved_by_admin_id_optional
- started_at
- ended_at_optional
- resolution_summary_optional

Rule:

Incident must be time-bounded and post-reviewed.

## 1.29. Source Domain Values

admin_source_domain allowed values:

- shift_jobs
- career_jobs
- employment_lifecycle
- work_vault
- employer_trust_visibility
- hr_section_hidden
- manager_console_hidden
- workforce_ops_hidden
- full_insights_hidden
- backend_login
- admin_system

## 1.30. Phase-0 / Launch Boundary

Phase 0 may include:

- hidden admin architecture note
- local demo admin case examples
- simulated audit log
- simulated permission labels
- disabled admin route placeholder

Phase 0 must not include:

- visible Admin launch entry
- real production moderation
- real user suspension
- real sensitive evidence processing
- real admin permission grants
- real irreversible action
- real incident controls
- fake claim that Admin enforcement is active

## 1.31. UX Quality Rules

Admin UX must be:

- premium
- calm
- evidence-first
- queue-based
- high-readability
- permission-aware
- audit-visible
- severity-prioritized
- privacy-safe
- low-noise
- action-safe

Admin first-read must answer:

- What is most urgent?
- What case needs review?
- What evidence exists?
- What action is allowed?
- Is second approval required?
- What is the audit impact?
- Is appeal/re-review active?

## 1.32. Empty / First-Time State

### 1.32.1. No cases state

```txt
No admin cases need review.
New governance cases will appear here when review is required.
```

### 1.32.2. No evidence state

```txt
No evidence has been added yet.
Add or review evidence before taking a sensitive action.
```

### 1.32.3. Second approval waiting state

```txt
This action requires second approval before it can be completed.
```

### 1.32.4. Empty-state safety rules

- Empty states must not appear in launch UI.
- Empty states must not expose Admin to normal users.
- Empty states must not claim active enforcement in Phase 0.
- Empty states must remain internal and permission-safe.

## 1.33. Final Admin System Lock Note

Admin System is approved only as hidden platform-owner governance architecture in launch.

Final locked boundaries:

- Admin must remain hidden from normal launch UI.
- Admin must not mix with Employer / Employee normal flows.
- Admin must not replace Manager Console.
- Admin must not replace HR Section.
- Admin must not run Workforce Ops directly.
- Admin must not process payroll.
- Admin must not create uncontrolled super-user powers.
- Admin must not silently edit user/job/trust/lifecycle truth.
- Evidence must be case-linked and privacy-safe.
- High-risk actions require stronger permission and second approval.
- Appeals/re-review must preserve original evidence and action history.
- Audit must be immutable.
- Phase 0 must remain honest, hidden-scope safe and Play Store safe.

— END OF ADMIN SYSTEM ARCHITECTURE —
