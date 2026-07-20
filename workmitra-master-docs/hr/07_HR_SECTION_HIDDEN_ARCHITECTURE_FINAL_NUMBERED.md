<!-- App name: WorkMitra / Job Mitra
File name: 07_HR_SECTION_HIDDEN_ARCHITECTURE.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\07_HR_SECTION_HIDDEN_ARCHITECTURE.md -->

# 1. WORKMITRA / JOB MITRA — HR SECTION HIDDEN ARCHITECTURE

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

HR Section is the future hidden full-HR workflow architecture of Job Mitra.

It is not part of the current launch-visible app.

It exists to prepare a clean, enterprise-grade HR foundation for future employer HR workflows without weakening Career Jobs, Employment Lifecycle, Work Vault, Manager Console, Workforce Ops Hub, Admin System or future Payroll integration boundaries.

## 1.3. Core Principle

HR Section = future hidden full-HR / recruiter / employee-record workflow domain.

Employment Lifecycle = launch-visible mini-HR only inside Career Jobs.

Payroll = future separate Mitra Labs system or module, not current HR Section.

These are not the same system.

## 1.4. What HR Section Is

HR Section is:

- hidden in launch UI
- future full HR workflow architecture
- future professional employer / recruiter workflow domain
- future candidate-to-employee record management layer
- future onboarding and exit workflow layer
- future HR document request coordination layer
- future internal HR note and audit layer
- future payroll-handoff-ready employee record foundation
- separate from Career Jobs mini-HR

## 1.5. What HR Section Is Not

HR Section is not:

- launch-visible
- Career Jobs
- Employment Lifecycle mini-HR
- Shift Jobs
- Work Vault
- Manager Console
- Workforce Ops Hub
- Admin System
- payroll app
- salary payment system
- payslip generator
- tax / legal payroll authority
- public role-selection option

## 1.6. Hard Non-Mixing Rule

HR Section must not appear in:

- landing page
- normal employer dashboard
- normal employee dashboard
- Career Jobs launch screens
- Shift Jobs launch screens
- Work Vault launch screens
- public role selection
- normal launch navigation

Rule:

Hidden HR Section must not leak into launch-visible UI.

## 1.7. Mini-HR vs HR Section Lock

### 1.7.1. Employment Lifecycle

Employment Lifecycle is:

- launch-active
- inside Career Jobs only
- limited to selected / working / notice / resigned / completed
- connected to offer accepted and employer joined confirmation
- not full HR

### 1.7.2. HR Section

HR Section is:

- future hidden domain
- deeper professional workflow
- broader HR / recruiter administration
- employee record and onboarding system
- not exposed in launch

Rule:

No screen, wording, state, storage key or route should make Employment Lifecycle and HR Section look like one system.

## 1.8. Future Payroll Boundary Rule

Mitra Labs may build a future Payroll application or payroll module.

HR Section must be future payroll-ready, but it must not become payroll.

HR Section may prepare:

- clean employee records
- active / exited employee status
- role / job reference
- onboarding completion status
- exit status
- payroll handoff eligibility flag
- audit-ready employment timeline

HR Section must not perform now:

- salary processing
- wage calculation
- payslip generation
- tax calculation
- statutory payroll reporting
- bank payment
- payroll approval
- legal payroll proof

Rule:

Future payroll integration requires separate architecture, backend security, policy/legal review, permission model, audit model and explicit versioned approval.

## 1.9. Future HR Domain Purpose

Future HR Section may support:

- structured candidate management
- recruiter-style applicant pipeline
- professional employer hiring operations
- onboarding readiness workflow
- employee HR record lifecycle
- HR document request coordination
- employer internal HR notes
- exit / offboarding workflow
- HR task tracking
- HR audit trail
- payroll-handoff readiness
- role-based HR permissions

## 1.10. Future HR Non-Goals

HR Section must not become:

- uncontrolled employee surveillance
- payroll engine unless separately approved
- legal employment authority by default
- hidden employee data exposure
- generic ERP
- casual employer note-taking without privacy controls
- replacement for Work Vault ownership
- replacement for Career Jobs launch hiring
- replacement for Admin governance

## 1.11. Role Fit

### 1.11.1. Employer Owner

Future Employer Owner may use HR Section to:

- enable approved HR workspace
- assign HR users
- review HR records
- manage permission scope
- approve sensitive HR actions
- review payroll-handoff readiness where future-approved

Employer Owner must not:

- bypass Work Vault ownership
- silently migrate Career records to HR
- use HR as payroll without payroll system approval
- expose HR screens to launch users

### 1.11.2. HR / Recruiter User

Future HR / Recruiter User may use HR Section to:

- manage assigned candidate records
- update HR pipeline states
- create onboarding tasks
- request documents through allowed path
- add internal HR notes where permitted
- manage exit / offboarding tasks where permitted

HR / Recruiter User must not:

- access unrelated employer records
- access employee private Work Vault content without allowed grant
- change payroll data
- act as Admin
- edit audit logs

### 1.11.3. Employee

Employee may see only:

- employee-facing HR actions explicitly approved later
- own onboarding tasks
- own document requests
- own safe HR status summary
- own exit/offboarding tasks where approved

Employee must not see:

- employer internal HR notes
- recruiter-private notes
- other candidates
- other employees
- hidden HR settings
- payroll-internal records unless future payroll system permits it

### 1.11.4. Admin

Admin may govern HR misuse through hidden Admin System.

Admin must not appear in normal HR user flow.

## 1.12. Future Screen-by-Screen Architecture

### 1.12.1. HR Section Home

Shows:

- HR pipeline summary
- onboarding items
- employee records needing attention
- exit / closure items
- document request status
- payroll-handoff readiness summary where future-approved
- compliance-safe reminders

### 1.12.2. Candidate Pipeline

Shows:

- candidates by status
- source Career Job
- application source
- recruiter / HR status
- next action
- document readiness where permitted

### 1.12.3. Candidate Detail

Shows:

- candidate profile summary
- source Career Job
- application history
- Work Vault access status
- eligibility / screening summary where imported safely
- internal HR notes
- allowed HR actions

### 1.12.4. Onboarding Workspace

Shows:

- onboarding checklist
- pending employee actions
- pending employer actions
- document requests
- confirmation steps
- readiness status
- payroll-handoff readiness flag where future-approved

### 1.12.5. Employee HR Record

Shows:

- active employee profile
- source Career Job or HR source
- role / title
- employee status
- HR timeline
- onboarding status
- internal notes
- document request summary
- exit / closure history

### 1.12.6. HR Document Request Workspace

Shows:

- requested document type
- reason / purpose
- due date where needed
- Work Vault sharing path
- employee response status
- access status
- revoke / expiry state where supported

Rule:

HR document requests must respect Work Vault ownership.

### 1.12.7. Internal HR Notes / Timeline

Shows:

- HR notes
- action timeline
- status changes
- correction history

Rules:

- internal notes must not appear in employee launch UI
- notes must be permission-scoped
- sensitive notes require audit discipline

### 1.12.8. Exit / Offboarding Workspace

Shows:

- resignation / exit state
- exit checklist
- final handover tasks where future-approved
- completion state
- archive readiness
- payroll-handoff stop/exit signal where future-approved

### 1.12.9. HR Settings / Permissions

Restricted to Employer Owner or approved controller.

Shows:

- HR user access
- permission scope
- role assignments
- sensitive action controls
- audit visibility

### 1.12.10. Employee-Facing HR Tasks

Future employee-facing screens may show:

- onboarding tasks
- document requests
- HR status detail
- exit/offboarding tasks
- safe timeline summary

Rule:

Employee-facing HR must remain limited, privacy-safe and non-confusing.

## 1.13. HR Lifecycle / State Model

### 1.13.1. future_hr_candidate_status

Allowed values:

- sourced
- applied
- screened
- shortlisted
- interview
- selected
- offer_pending
- offer_accepted
- onboarding
- active_employee
- on_hold
- rejected
- withdrawn
- archived

### 1.13.2. future_hr_employee_status

Allowed values:

- onboarding
- active
- probation
- notice
- exited
- archived

### 1.13.3. future_hr_task_status

Allowed values:

- not_started
- pending_employee
- pending_employer
- pending_hr
- in_review
- completed
- skipped
- cancelled

### 1.13.4. future_hr_document_request_status

Allowed values:

- draft
- requested
- employee_submitted
- access_granted
- in_review
- accepted
- rejected_needs_update
- cancelled
- expired
- revoked

### 1.13.5. future_payroll_handoff_status

Allowed values:

- not_required
- not_ready
- ready_for_future_payroll
- sent_to_future_payroll
- blocked
- cancelled

Rule:

Payroll handoff status is only a readiness signal. It is not payroll processing.

## 1.14. Valid Transitions

### 1.14.1. Candidate

- applied → screened
- screened → shortlisted
- shortlisted → interview
- interview → selected
- selected → offer_pending
- offer_pending → offer_accepted
- offer_accepted → onboarding
- onboarding → active_employee
- any valid review state → rejected / withdrawn / archived

### 1.14.2. Employee HR Record

- onboarding → active
- active → probation
- probation → active
- active → notice
- notice → exited
- exited → archived

### 1.14.3. HR Task

- not_started → pending_employee / pending_employer / pending_hr
- pending_employee / pending_employer / pending_hr → in_review
- in_review → completed / rejected_needs_update
- any open state → cancelled
- completed → archived where supported

### 1.14.4. Document Request

- draft → requested
- requested → employee_submitted
- employee_submitted → access_granted / in_review
- in_review → accepted / rejected_needs_update
- requested / employee_submitted / in_review → cancelled
- access_granted → expired / revoked

### 1.14.5. Payroll Handoff Readiness

- not_required → not_ready
- not_ready → ready_for_future_payroll
- ready_for_future_payroll → sent_to_future_payroll where future payroll integration exists
- not_ready / ready_for_future_payroll → blocked / cancelled

## 1.15. Blocked Transitions

Blocked:

- launch Career applicant → HR employee without explicit migration
- Shift worker → HR employee through Shift flow
- Employment Lifecycle record → full HR record silently
- Work Vault document → employer-owned HR file without employee consent
- hidden HR state → launch UI display
- HR record → payroll payment without payroll system
- payroll readiness → salary processed
- HR note → employee-visible truth without review
- HR task → Admin action without Admin case

## 1.16. Future Migration / Integration Rule

Career Jobs may integrate with HR Section only in a future approved phase.

Migration must require:

- explicit product decision
- clear source Career Job
- employee consent / visibility where needed
- employer authorization
- before / after state
- audit trail
- no silent data movement
- Work Vault access boundary review
- payroll boundary review where relevant

Rule:

Career Jobs mini-HR may feed HR Section later, but must not silently become HR Section.

## 1.17. Future Payroll Integration Readiness Rule

HR Section may prepare clean data for future Payroll only after:

- backend login exists
- role permissions exist
- employer ownership is clear
- employee record status is valid
- Work Vault and HR documents are permission-safe
- audit trail exists
- payroll system architecture is approved
- privacy policy and user data declarations are updated where needed

HR Section may pass future payroll-safe references such as:

- employee record ID
- employer ID
- role/title reference
- active / exited status
- start date / exit date where recorded
- payroll eligibility flag
- audit reference

HR Section must not pass casually:

- private Work Vault documents
- internal HR notes
- unrelated candidate data
- hidden Admin records
- unverified legal claims

## 1.18. Advanced HR Readiness System

This section defines the enterprise-grade future HR support layer.

It is hidden for launch and may only be activated in a future approved version.

### 1.18.1. Onboarding Readiness System

Onboarding Readiness helps employer/HR know whether an employee is ready to become active.

May include:

- profile readiness
- required task completion
- document request completion
- Work Vault sharing status
- role confirmation
- start-date readiness
- payroll-handoff readiness where future-approved

Rules:

- must not become payroll
- must not fake legal employment proof
- must not expose private Work Vault data without access
- must remain employer-owned and employee-visible only where safe

### 1.18.2. Employee Record Lifecycle

Employee Record Lifecycle tracks future HR employee state.

Lifecycle:

- onboarding
- active
- probation
- notice
- exited
- archived

Rules:

- lifecycle must not be created from Shift Jobs
- lifecycle must not silently replace Career Jobs Employment Lifecycle
- state changes require timeline/audit where important
- active employee state must not imply payroll is active

### 1.18.3. HR Document Request Flow

HR Document Request Flow allows future HR users to ask employees for documents.

Rules:

- employee controls Work Vault sharing
- document request must state purpose
- access must be scoped
- access must be revocable where supported
- access history must be preserved
- employer must not own employee documents by default

### 1.18.4. Internal HR Notes with Privacy Control

Internal HR Notes help employer/HR manage context.

Rules:

- notes are employer-side internal data
- employees do not see internal notes
- notes must not contain unnecessary sensitive data
- notes must not become hidden punishment
- notes must be permission-scoped
- note edits should preserve timeline where sensitive

### 1.18.5. Exit / Offboarding Workflow

Exit / Offboarding manages future employee exit flow.

May include:

- resignation / exit state
- final task checklist
- document return request where approved
- employer closure note
- final status
- archive readiness
- future payroll stop/handoff signal

Rules:

- must not become legal termination authority by default
- must not process final payment
- must not erase audit history
- employee-facing wording must be safe and clear

### 1.18.6. Permission-Based HR Users

Future HR Section must support permission separation.

Possible roles:

- employer_owner
- hr_admin
- recruiter
- hr_viewer
- employee_facing_hr_user

Rules:

- least privilege
- assigned scope only
- sensitive actions require stronger permission
- employer owner controls HR user access
- Admin remains separate

### 1.18.7. Payroll-Handoff Readiness

Payroll-Handoff Readiness prepares HR data for a future payroll app/module.

May show:

- not ready
- ready for payroll setup
- blocked
- sent to payroll system where future integration exists

Rules:

- readiness is not payment
- readiness is not payslip generation
- readiness is not tax filing
- readiness must not appear in launch UI
- future payroll app owns payroll calculations and payment logic

## 1.19. Action Catalog

### 1.19.1. Future Employer Owner Allowed Actions

Employer Owner may:

- enable HR Section where future-approved
- assign HR users
- revoke HR users
- review HR activity
- approve sensitive HR actions
- review payroll-handoff readiness where future-approved

### 1.19.2. Future HR / Recruiter Allowed Actions

Future HR / Recruiter may:

- create HR pipeline record
- move candidate status
- create onboarding task
- request document
- add internal HR note
- complete onboarding task
- mark active employee where permitted
- start exit workflow
- update payroll-handoff readiness where permitted
- archive HR record

### 1.19.3. Future Employee Allowed Actions

Employee may:

- view own approved HR tasks
- respond to document requests
- share Work Vault content through allowed path
- view safe HR status summary
- complete employee-side onboarding/offboarding steps

### 1.19.4. Blocked in Launch

Blocked in launch:

- expose HR Section publicly
- convert mini-HR into full HR
- access employee Work Vault without allowed path
- use HR notes inside public Career Jobs flow
- use HR status as payroll / legal truth
- silently migrate Career records to HR records
- show payroll readiness to public launch users
- process salary / payslip / tax

## 1.20. Notification / Alert Contract

### 1.20.1. Future Employer / HR Alerts

- candidate_ready_for_hr_review
- onboarding_task_pending
- employee_document_request_pending
- document_review_needed
- exit_workflow_started
- hr_record_needs_review
- payroll_handoff_not_ready
- payroll_handoff_ready_future

### 1.20.2. Future Employee Alerts

- onboarding_task_assigned
- hr_document_request_received
- hr_status_updated
- exit_request_received
- document_update_needed

### 1.20.3. Notification Safety Rules

Notifications must not:

- appear in launch before HR Section is exposed
- mix with Career Jobs mini-HR alerts
- use payroll / legal wording unless future-approved
- expose internal HR notes
- claim salary processing
- claim payslip availability
- expose hidden Admin information

## 1.21. Evidence / Audit / Correction Model

Evidence may include:

- source Career Job
- candidate status history
- onboarding tasks
- employee responses
- Work Vault access grants
- document request state
- HR notes
- status transitions
- payroll-handoff readiness status

Audit required for:

- candidate status change
- HR note creation / edit
- document request
- Work Vault access request
- onboarding completion
- active employee marking
- payroll-handoff readiness change
- exit workflow start
- archive
- permission grant / revoke

Correction must preserve:

- old state
- new state
- reason
- actor
- timestamp
- affected record
- before / after state

Rule:

Correction must not delete original timeline.

## 1.22. Permission Matrix

### 1.22.1. Employer Owner

Employer Owner:

- can configure HR access where future-approved
- can review HR activity
- can approve sensitive HR settings
- can view employer-owned HR records

### 1.22.2. HR / Recruiter User

HR / Recruiter User:

- can manage assigned HR pipeline records
- can manage assigned HR tasks
- can view only permitted HR records
- cannot access all employer settings unless granted
- cannot access employee private Work Vault content without grant

### 1.22.3. Employee

Employee:

- sees only employee-facing HR tasks/status
- cannot view employer internal HR notes
- cannot view other employees or candidates
- controls Work Vault sharing path

### 1.22.4. Admin

Admin:

- hidden governance review only
- does not become daily HR user
- cannot silently rewrite HR truth

### 1.22.5. Payroll System Future

Future Payroll System:

- may receive approved payroll-handoff data
- must not receive private HR notes
- must not receive Work Vault documents unless explicitly approved
- must use separate payroll permissions and audit

### 1.22.6. Launch Normal User

Launch normal user:

- cannot access HR Section
- cannot access payroll-handoff readiness
- cannot see HR screens or HR role choices

## 1.23. Data Model

### 1.23.1. HR_PIPELINE_RECORD

Fields:

- hr_pipeline_record_id
- employer_id
- source_career_job_id_optional
- source_application_id_optional
- employee_id_optional
- candidate_status
- created_by_user_id
- created_at
- updated_at

### 1.23.2. HR_EMPLOYEE_RECORD

Fields:

- hr_employee_record_id
- employer_id
- employee_id
- source_hr_pipeline_record_id_optional
- employee_status
- role_title_optional
- current_state_since
- onboarding_status_optional
- payroll_handoff_status_optional
- created_at
- updated_at

### 1.23.3. HR_TASK

Fields:

- hr_task_id
- employer_id
- hr_employee_record_id_optional
- hr_pipeline_record_id_optional
- task_type
- task_status
- assigned_to_role
- due_at_optional
- created_at
- updated_at

### 1.23.4. HR_DOCUMENT_REQUEST

Purpose:

Future HR request for employee-controlled document sharing.

Fields:

- hr_document_request_id
- employer_id
- employee_id
- hr_employee_record_id_optional
- requested_document_category
- request_reason
- request_status
- work_vault_access_grant_id_optional
- due_at_optional
- created_at
- updated_at

Rule:

HR document request must not transfer Work Vault ownership to employer.

### 1.23.5. HR_INTERNAL_NOTE

Purpose:

Employer/HR internal note with permission control.

Fields:

- hr_internal_note_id
- employer_id
- target_record_type
- target_record_id
- author_user_id
- note_visibility_scope
- note_sensitivity_level
- note_status
- created_at
- updated_at

Rule:

Internal notes must not appear in normal employee UI.

### 1.23.6. HR_PAYROLL_HANDOFF_RECORD

Purpose:

Future readiness bridge between HR Section and future Payroll system.

Fields:

- payroll_handoff_record_id
- employer_id
- employee_id
- hr_employee_record_id
- handoff_status
- readiness_summary
- blocked_reason_optional
- future_payroll_reference_optional
- created_at
- updated_at

Rule:

Payroll handoff is not payroll processing.

### 1.23.7. HR_AUDIT_EVENT

Fields:

- hr_audit_event_id
- employer_id
- target_record_type
- target_record_id
- actor_role
- actor_id
- event_type
- old_state_optional
- new_state_optional
- reason_optional
- created_at

## 1.24. Source Truth Labels

hr_source_type allowed values:

- manually_created_future_hr
- migrated_from_career_job_future
- imported_future_hr
- employee_document_response
- payroll_handoff_future
- admin_correction_hidden

## 1.25. Privacy / Data Boundary

HR Section must protect:

- employee private data
- Work Vault ownership
- employer internal notes
- candidate privacy
- hidden-scope separation
- payroll-handoff privacy
- Admin separation

Rules:

- HR Section must not become unrestricted employee surveillance.
- HR notes must not be public employee-facing truth.
- Payroll handoff must not expose private HR notes.
- Document requests must use controlled Work Vault path.
- Hidden HR data must stay hidden from launch UI.

## 1.26. Payroll Boundary and Future App Integration

Future Payroll under Mitra Labs should be treated as a separate payroll product/module.

Possible future relationship:

```txt
HR Section
→ payroll handoff readiness
→ future Payroll app/module
→ payroll calculation/payment/compliance workflow
```

HR Section owns:

- employee HR record
- onboarding status
- active/exited status
- payroll readiness signal
- HR audit trail

Future Payroll owns:

- salary/wage setup
- payroll rules
- pay calculation
- payslip generation
- payment processing
- payroll compliance
- payroll reports

Rule:

Do not mix payroll business logic into HR Section.

## 1.27. UX Quality Rules

Future HR UX must be:

- professional
- controlled
- permission-aware
- quiet
- structured
- audit-friendly
- privacy-clear
- clearly separate from launch mini-HR
- clearly separate from payroll

Launch UI must not show HR screens.

HR first-read must answer:

- What records need action?
- Which employee/candidate is affected?
- What task is pending?
- Is onboarding ready?
- Is document request pending?
- Is exit/offboarding active?
- Is payroll handoff ready or blocked?

Employee first-read must answer only:

- What task is assigned to me?
- What document is requested?
- What status is safe for me to see?
- What action can I take?

## 1.28. Empty / First-Time State

### 1.28.1. HR Section inactive state

```txt
No HR workspace is active.
HR Section is for approved future employer HR workflows.
```

### 1.28.2. No candidate records state

```txt
No HR candidate records yet.
Future HR records will appear here after approved HR setup.
```

### 1.28.3. No onboarding tasks state

```txt
No onboarding tasks yet.
Create onboarding tasks only when this HR workspace is active.
```

### 1.28.4. No payroll handoff readiness state

```txt
No payroll handoff is active.
Payroll will be handled by a separate approved future system.
```

### 1.28.5. Empty-state safety rules

- Empty states must not appear in launch UI.
- Empty states must not imply payroll is active.
- Empty states must not mention salary processing, payslips or tax unless future payroll is approved.
- Empty states must remain permission-safe.

## 1.29. Final HR Section Lock Note

HR Section is approved as hidden future full-HR architecture.

Final locked boundaries:

- HR Section must remain hidden in current launch.
- HR Section must stay separate from Career Jobs mini-HR.
- HR Section must stay separate from Shift Jobs.
- HR Section must stay separate from Work Vault ownership.
- HR Section must stay separate from Manager Console.
- HR Section must stay separate from Workforce Ops Hub.
- HR Section must stay separate from Admin System.
- HR Section must be future payroll-ready but must not become payroll.
- Payroll must be a separate future Mitra Labs product/module or separately approved system.
- No salary, payslip, tax, payment or legal payroll claim is active now.
- Future HR exposure requires backend login, permissions, audit, privacy and release review.
- Phase 0 must remain honest, hidden-scope safe and Play Store safe.

— END OF HR SECTION HIDDEN ARCHITECTURE —
