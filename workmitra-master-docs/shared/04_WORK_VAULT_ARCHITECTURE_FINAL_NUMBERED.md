<!-- App name: WorkMitra / Job Mitra
File name: 04_WORK_VAULT_ARCHITECTURE.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\04_WORK_VAULT_ARCHITECTURE.md -->

# 1. WORKMITRA / JOB MITRA — WORK VAULT ARCHITECTURE

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `03_CAREER_JOBS_ARCHITECTURE.md`
- `05_EMPLOYER_TRUST_VISIBILITY.md`
- `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

Work Vault is the employee-controlled work identity and document-control pillar of Job Mitra.

It strengthens employee work identity while keeping document visibility controlled, intentional, revocable, access-bounded, audit-aware and trust-supportive.

## 1.3. Core Principle

Work Vault = employee-controlled work identity and document trust.

Work Vault must remain:

- privacy-first
- employee-controlled
- access-bounded
- document-specific where possible
- time-bounded where applicable
- revoke-aware
- audit-visible where supported
- trust-supportive
- separate from hiring workflow ownership
- separate from HR ownership
- separate from payroll document storage

## 1.4. What Work Vault Is

Work Vault is:

- a launch-visible core pillar
- an employee identity foundation
- a document-control system
- a trust-support system for hiring
- an access-log and revoke-aware privacy layer
- the base for controlled employer verification
- a future-ready document metadata and sharing architecture

## 1.5. What Work Vault Is Not

Work Vault is not:

- uncontrolled file storage
- employer document warehouse
- permanent public profile
- social profile
- payroll document locker
- full HR document system
- hidden HR Section
- document-browsing tool for employers
- proof that employer can access everything
- legal verification authority
- secure/encrypted vault claim unless implemented

## 1.6. Hard Non-Mixing Rule

Work Vault supports hiring trust.

Work Vault is not the hiring workflow itself.

Shift Jobs and Career Jobs may request verification context.

They must not own Work Vault documents.

Employer access must be:

- explicit
- purpose-bound
- document/folder-scoped where supported
- time-bounded where applicable
- revocable where supported
- logged where supported

## 1.7. Role Fit

### 1.7.1. Employee

Employee uses Work Vault to:

- create stronger work identity
- manage profile truth
- add / manage document metadata
- control folder / document visibility
- share through allowed OTP or verification paths
- grant selected access
- revoke access where supported
- review access history where supported
- improve document readiness

### 1.7.2. Employer

Employer uses Work Vault access only to:

- verify employee identity / documents through allowed path
- review documents shared by employee
- support hiring decision where workflow allows
- understand access expiry / revoke status

Employer must not:

- browse all employee documents
- keep hidden permanent access
- access unrelated folders
- bypass OTP / permission path
- use Work Vault as private employer database
- treat Work Vault as payroll or legal verification system

### 1.7.3. Admin

Admin remains hidden in launch UI.

Admin may review misuse through separate hidden Admin governance.

Admin must not browse employee vault casually.

### 1.7.4. Hidden HR / Payroll Future

Hidden HR may request documents only through future approved Work Vault paths.

Future Payroll must not receive Work Vault documents unless explicitly approved by a future payroll architecture and privacy review.

## 1.8. Screen-by-Screen Architecture

### 1.8.1. Employee-Side Screens

#### 1.8.1.1. My Work Vault Home

Shows:

- identity summary
- WM ID
- profile completion
- document readiness score
- document folders
- recent access / sharing summary where supported
- quick share profile
- access expiry reminders where relevant

#### 1.8.1.2. Profile Tab

Shows:

- personal work profile
- skill / category summary
- work experience summary
- profile completion state
- trust-relevant identity fields

#### 1.8.1.3. Documents Tab

Shows:

- document folders
- document list
- visibility state
- uploaded / demo document metadata
- folder access controls
- document readiness status
- document version status where supported

#### 1.8.1.4. Document Detail

Shows:

- document title / type
- source
- version history where supported
- visibility state
- access status
- revoke option where applicable
- expiry status where applicable
- audit / access note where supported

#### 1.8.1.5. Verify Employer / Sharing Screen

Shows:

- employer lookup / verification context
- OTP access state
- selected folders / documents being shared
- expiry / revoke rules
- access scope explanation
- privacy-safe confirmation

#### 1.8.1.6. Access Log Screen

Shows:

- employer access events
- what was viewed where supported
- access reason / path
- timestamp
- active / expired / revoked access

#### 1.8.1.7. Profile Completion / Quick Share

Supports:

- guided completion
- quick controlled profile sharing
- low-confusion identity improvement
- readiness guidance

#### 1.8.1.8. Revoke / Delete / Retention Screen

Shows:

- revoke access
- hide document
- local delete where supported
- expired access
- retained audit/access history explanation

Rule:

Delete, revoke, hide and expire must not be treated as the same action.

### 1.8.2. Employer-Side Screens

#### 1.8.2.1. Applicant Verification Entry

Shows:

- employee WM ID
- available verification option
- OTP / request access status
- limited access explanation

#### 1.8.2.2. Shared Work Vault View

Shows only:

- employee-approved shared profile / document fields
- allowed folder / document content
- access expiry / revoke state
- viewed document list where supported

#### 1.8.2.3. Verification Result Screen

Shows:

- verification completed / pending / expired / revoked
- documents viewed where allowed
- access scope
- next hiring action where relevant

## 1.9. Work Vault Data Areas

Work Vault may include:

- identity profile
- skill profile
- document folders
- individual documents
- document versions
- visibility settings
- OTP access grants
- access logs
- revoke records
- expiry reminders
- readiness signals
- profile completion signals
- work-history continuity summaries

## 1.10. Document Category Model

document_category allowed values may include:

- identity
- address
- skill_certificate
- experience
- education
- license
- reference
- other

Rule:

Categories are for employee organization and controlled employer verification. They must not become uncontrolled mandatory collection.

## 1.11. Document Status Model

document_status allowed values:

- draft
- active
- hidden
- shared
- revoked
- expired
- archived
- deleted_local

## 1.12. Access Grant State Machine

vault_access_status allowed values:

- not_requested
- requested
- otp_pending
- otp_verified
- access_active
- access_expiring_soon
- access_expired
- access_revoked
- access_denied
- access_cancelled

## 1.13. Valid Access Transitions

- not_requested → requested
- requested → otp_pending
- otp_pending → otp_verified
- otp_verified → access_active
- access_active → access_expiring_soon
- access_expiring_soon → access_expired
- access_active → access_expired
- access_active → access_revoked
- requested → access_denied
- requested → access_cancelled

## 1.14. Blocked Access Transitions

Blocked:

- not_requested → access_active
- otp_pending → access_active without verification
- access_revoked → access_active without new grant
- access_expired → access_active without new grant
- employer direct access without employee-controlled path
- expired access → employer viewing document
- revoked access → employer viewing document

## 1.15. OTP Path Separation

Locked OTP paths remain separate:

1. Shift / Career shortlist path
2. Work Vault employer lookup path
3. HR System path — Phase 2 / hidden

Rule:

Storage keys, access grants and UI messages must not mix between OTP paths.

## 1.16. Revoke Rule

Employee may revoke access where supported.

Revoke should:

- end employer access
- update access status
- preserve access history
- not erase past audit / access event

Rule:

Revoke blocks future access; it does not rewrite that access happened.

## 1.17. Access Log Rule

Access log should preserve:

- employer ID
- employee ID
- document / folder accessed
- access path
- timestamp
- status
- revoked / expired state

Rule:

Access logs build trust and transparency.

## 1.18. Advanced Work Vault Control System

This section adds the enterprise-grade privacy and document-control layer required for Work Vault.

The goal is to make Work Vault feel trustworthy, employee-controlled and future backend-ready without over-claiming secure production vault behavior in Phase 0.

### 1.18.1. Document Version History

Document Version History helps preserve document changes.

It may track:

- document version number
- previous metadata
- updated metadata
- changed_at
- changed_by_role
- change reason where needed

Rules:

- version history must not expose deleted private content to employers
- employer sees only the currently shared approved version where permitted
- version history must remain employee-owned
- Phase 0 may track metadata version only

### 1.18.2. Granular Access Control

Granular Access Control allows employee to share only selected content.

Allowed access scopes:

- profile_summary_only
- selected_document
- selected_folder
- selected_documents
- selected_folders
- full_shared_profile_limited

Rules:

- employer must see only granted scope
- access must be purpose-bound
- access must be revocable
- employer must not infer hidden documents exist
- full vault access must not be a default

### 1.18.3. Access Expiry Reminder

Access Expiry Reminder helps both sides understand access time limits.

It may show:

- active access
- expiring soon
- expired
- revoked

Rules:

- Phase 0 may show local in-app status only
- do not claim push/SMS/email reminder unless implemented
- expired access must block future employer viewing where supported
- employee should understand what employer can still see

### 1.18.4. Document Readiness Score

Document Readiness Score helps employee improve profile/document trust.

It may consider:

- profile completion
- skill summary
- required document metadata
- visibility setup
- access readiness
- expired / missing document status

Allowed readiness states:

- ready
- can_improve
- missing_basic_details
- low_data

Rules:

- readiness must guide, not shame
- readiness must not force document upload unless job-specific requirement exists
- readiness must not claim legal verification
- Work Vault must remain employee-controlled

### 1.18.5. Access Audit Trail Detail

Access Audit Trail Detail helps employee understand employer access.

It may show:

- who requested access
- which employer accessed
- what document/folder was viewed where supported
- when access occurred
- whether access is active / expired / revoked

Rules:

- audit trail must be readable
- audit trail must not expose hidden admin/security logic
- employer must not edit employee access history
- access history should remain even after revoke where supported

### 1.18.6. Retention / Delete / Revoke Boundary

Work Vault must clearly separate:

- hide document
- revoke employer access
- expire access
- archive document
- local delete
- future production deletion request
- retained audit/access history

Rules:

- delete must not silently erase access history where audit exists
- revoke means access stops, not history deletion
- expired means time ended, not document deleted
- archive means not active, not necessarily erased

### 1.18.7. Secure Future Upload Boundary

Phase 0 may support local/demo metadata only.

Future production upload requires:

- backend login
- object storage
- access-controlled URLs
- scoped employer access
- audit logs
- privacy policy update
- Play Store data safety update
- deletion/revoke rules
- secure transport

Rules:

- do not claim secure encrypted vault unless implemented and reviewed
- do not claim legal identity verification unless implemented and reviewed
- do not store files in unsafe public paths
- do not expose documents through permanent public links

## 1.19. Advanced Control Phase-0 Boundary

Allowed in Phase 0:

- local document metadata
- local readiness score
- local access grant simulation
- local expiry/revoke status
- local access log simulation
- local version metadata
- demo-safe sharing UI

Not allowed in Phase 0:

- real secure vault claim
- real encrypted storage claim
- real legal verification claim
- real cloud recovery claim
- real permanent document hosting
- real employer unrestricted access
- real payroll document locker claim

Rule:

Work Vault must improve trust while staying honest about local/demo boundaries.

## 1.20. Action Catalog

### 1.20.1. Employee Allowed Actions

Employee may:

- create / update profile
- add document metadata
- organize document folders
- set visibility
- approve access where supported
- deny access
- revoke access
- view access history
- view document readiness
- view version history where supported
- quick share profile

### 1.20.2. Employer Allowed Actions

Employer may:

- request verification where workflow allows
- submit OTP / verify access
- view shared documents only
- view verification result
- view access expiry status

### 1.20.3. Blocked Actions

Blocked:

- employer browses full vault
- employer accesses hidden folders
- employer keeps permanent hidden access
- employer views expired/revoked access
- admin browses vault without case
- hidden HR path leaks into launch
- document access bypasses OTP / grant logic
- payroll system uses Work Vault documents without future approval

## 1.21. Notification / Alert Contract

### 1.21.1. Employee Notifications

- employer_requested_vault_access
- otp_verification_started
- employer_access_active
- employer_access_expiring
- employer_access_expired
- employer_access_revoked
- document_visibility_changed
- document_readiness_can_improve

### 1.21.2. Employer Notifications

- access_requested_pending_otp
- access_granted
- access_expiring
- access_expired
- access_revoked
- verification_completed

### 1.21.3. Safe Wording

Examples:

- “An employer requested document verification.”
- “Access is active for the shared documents only.”
- “You revoked access to shared documents.”
- “Access will expire soon.”

Notifications must not:

- expose unrelated folders
- imply full vault access
- mix HR hidden path
- use scary security wording unnecessarily
- claim real push/SMS/email unless implemented

## 1.22. Evidence / Audit / Correction Model

Evidence may include:

- document metadata
- document version metadata
- visibility state
- access grant
- OTP path
- access log
- access expiry
- revoke event
- employer verification request
- readiness calculation

Audit / access log should exist for:

- access granted
- access revoked
- access expired
- employer viewed shared content
- visibility changed
- OTP verification completed
- document version changed
- access scope changed

Correction must preserve:

- old visibility state
- new visibility state
- old access scope
- new access scope
- reason / source
- actor
- timestamp

## 1.23. Permission Matrix

### 1.23.1. Employee

Employee:

- owns own Work Vault
- controls visibility and sharing
- controls revoke where supported
- sees own access history

### 1.23.2. Employer

Employer:

- sees only explicitly shared / verified content
- cannot access non-shared folders
- cannot access expired/revoked content
- cannot own employee Work Vault documents

### 1.23.3. Admin

Admin:

- hidden governance role only
- case-linked review only in future Admin System

### 1.23.4. Hidden HR Section

Hidden HR Section:

- must use separate Phase 2 path
- must not reuse launch OTP path without explicit future integration
- must not take ownership of employee documents

### 1.23.5. Future Payroll

Future Payroll:

- must not use Work Vault as payroll document locker unless separately approved
- must not receive private documents without explicit future consent/path
- must follow separate payroll architecture and privacy review

## 1.24. Data Model

### 1.24.1. WORK_VAULT_PROFILE

Fields:

- work_vault_profile_id
- employee_id
- wm_id
- profile_completion_score
- document_readiness_status_optional
- visibility_summary
- created_at
- updated_at

### 1.24.2. WORK_VAULT_DOCUMENT

Fields:

- document_id
- employee_id
- document_category
- document_title
- document_status
- folder_id_optional
- source_type
- current_version_id_optional
- created_at
- updated_at

### 1.24.3. WORK_VAULT_DOCUMENT_VERSION

Purpose:

Metadata version record for a Work Vault document.

Fields:

- document_version_id
- document_id
- employee_id
- version_number
- version_status
- change_summary_optional
- created_at
- updated_at

Rule:

Version records remain employee-owned and must not expose hidden document history to employers.

### 1.24.4. WORK_VAULT_ACCESS_GRANT

Fields:

- access_grant_id
- employee_id
- employer_id
- source_workflow_type
- source_record_id_optional
- otp_path_type
- vault_access_status
- access_scope
- allowed_document_ids_or_folder_ids
- expires_at_optional
- revoked_at_optional
- created_at
- updated_at

### 1.24.5. WORK_VAULT_ACCESS_EVENT

Fields:

- access_event_id
- access_grant_id
- employee_id
- employer_id
- event_type
- document_id_optional
- folder_id_optional
- access_scope_optional
- created_at

### 1.24.6. WORK_VAULT_READINESS_SNAPSHOT

Purpose:

Employee-facing document/profile readiness summary.

Fields:

- readiness_snapshot_id
- employee_id
- profile_completion_score
- document_readiness_status
- missing_items_summary_optional
- work_vault_prompt_optional
- calculated_at

Rule:

Readiness Snapshot must guide the employee and must not shame or block unfairly.

## 1.25. Source Truth Labels

source_workflow_type allowed values:

- shift_job_shortlist
- career_job_application
- work_vault_employer_lookup
- hidden_hr_future_path
- employee_quick_share

otp_path_type allowed values:

- shift_career_shortlist_path
- work_vault_lookup_path
- hr_system_hidden_path

access_scope allowed values:

- profile_summary_only
- selected_document
- selected_folder
- selected_documents
- selected_folders
- full_shared_profile_limited

## 1.26. Privacy / Retention / Deletion Rules

### 1.26.1. Phase-0 Local-First

- documents are demo / local metadata only
- deletion can be local deletion
- no cloud recovery authority
- no secure storage claim unless implemented

### 1.26.2. Future Production

Deletion / revoke must distinguish between:

- deleting own local copy
- revoking employer access
- expiring access
- archiving document
- retaining audit / access logs where required
- compliance retention if applicable

Rule:

Deleting a document must not silently erase historical access logs.

## 1.27. UX Quality Rules

Work Vault UX must be:

- trust-first
- calm
- privacy-clear
- low-confusion
- employee-controlled
- access-scope clear
- expiry/revoke clear
- premium and readable

Employee first-read must answer:

- What is my identity strength?
- What documents do I have?
- What is visible?
- Who has access?
- Can I revoke access?
- Is anything expiring?
- Is my Work Vault ready?

Employer first-read must answer:

- What was shared with me?
- Is access active?
- What can I verify?
- When does access expire?
- What is outside my access?

## 1.28. Empty-State Rules

### 1.28.1. Empty Work Vault

```txt
Build your Work Vault to strengthen your work identity.
You control what employers can see.
Add documents when you are ready.
```

### 1.28.2. Empty Access Log

```txt
No employer access yet.
Access history will appear here when you share Work Vault details.
```

### 1.28.3. Empty Documents

```txt
No documents added yet.
Add document details when you are ready to support your work profile.
```

### 1.28.4. Empty-state safety rules

- Empty states must not pressure users to upload sensitive documents.
- Empty states must not claim secure cloud storage unless implemented.
- Empty states must not imply employer can view all documents.
- Empty states must remain employee-controlled and privacy-safe.

## 1.29. Final Work Vault Lock Note

Work Vault is approved as the employee-controlled work identity and document-control pillar.

Final locked boundaries:

- Work Vault must remain employee-controlled.
- Employers may see only explicitly shared content.
- Revoke, delete, expire and archive must remain separate concepts.
- Access history should be preserved where supported.
- Document Readiness is guidance only.
- Version history is employee-owned and scope-safe.
- Work Vault must not become HR document ownership.
- Work Vault must not become payroll document locker.
- Work Vault must not claim secure/encrypted vault unless implemented.
- Future upload requires backend, object storage, permissions, audit, privacy and Play Store review.
- Phase 0 must remain honest, local-first and Play Store safe.

— END OF WORK VAULT ARCHITECTURE —
