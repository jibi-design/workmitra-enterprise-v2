# HOMEFIX MITRA — CROSS-DOMAIN SYSTEM RULES

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Cross-Domain System Rules define the shared enterprise rules that apply across all HomeFix Mitra domains.

These rules protect:

- role separation
- provider-context separation
- identity and role-profile separation
- active role/workspace clarity
- role × action permissions
- canonical object truth
- lifecycle and state-transition discipline
- complaint / receipt / claim source truth
- customer vault privacy
- notification safety
- correction and audit discipline
- deferred item control
- version and change-control safety

## 3. Core Principle

Every HomeFix Mitra feature must remain:

- role-safe
- provider-context-safe
- identity-context-safe
- customer-privacy-safe
- source-linked
- complaint-aware
- receipt-aware
- correction-auditable
- Phase-0 demo-safe
- enterprise-grade

A domain document may define detailed behavior, but shared system rules must stay consistent across all domains.

# PART 1 — IDENTITY, ROLE PROFILE AND ACTIVE CONTEXT RULES

## 4. Identity Architecture Principle

HomeFix Mitra must use one permanent person/account identity with multiple role-specific profiles.

The system must not create separate duplicate permanent public identities for Customer, Independent Technician, Shop Owner or Shop Technician.

Final model:

- **Mitra Labs ID** (`mitraLabsId`, format `ML-XXXX-ABC-XXXX`) = permanent public person/account identity
- Legacy alias `hfmId` = **same value** as Mitra Labs ID (not a second ID) — see `19_UNIQUE_ID_STANDARD_AND_DISPLAY.md`
- `roleProfileId` = role-specific working profile identity
- `activeRoleContext` = the role/workspace currently being used
- `providerContext` / `sourceContext` = source truth for service, receipt, complaint, revisit, claim and record ownership
- Document/record refs = `HFX-<TYPE>-<OPAQUE>` (never labeled as Mitra Labs ID)

## 5. Permanent Person Identity Rule

The permanent person/account identity is the **Mitra Labs ID** (UniCard Option A).

Rules:

- Mitra Labs ID must remain stable over time
- Mitra Labs ID must not change only because phone number changes
- Mitra Labs ID may link to multiple role profiles
- Mitra Labs ID identifies the person/account, not the current work context
- Mitra Labs ID must not be treated as permission to mix customer and provider records
- phone number is not identity proof
- phone number is only a contact, login, continuity or matching signal where allowed
- do **not** mint or display a separate “HFM ID” / `HFM-…` person identity

Public UI must show the person ID as:

- Mitra Labs ID
- Your Mitra Labs ID

## 6. Role Profile Identity Rule

A person may have role-specific profiles under the same `hfmId`.

Allowed role profile IDs:

- `customerProfileId`
- `independentTechnicianProfileId`
- `shopOwnerProfileId`
- `shopTechnicianProfileId`

Meaning:

- `customerProfileId` = customer workspace/profile
- `independentTechnicianProfileId` = independent technician workspace/profile
- `shopOwnerProfileId` = shop owner workspace/profile
- `shopTechnicianProfileId` = shop-linked technician workspace/profile

Role profile IDs must not be treated as separate unrelated people.

Role profile IDs must not be merged into one generic provider/customer ID.

## 7. Active Role Context Rule

The app must never guess the active role automatically when multiple role profiles exist.

The user must explicitly enter or switch the active role/workspace.

Allowed `activeRoleContext` values:

- `customer`
- `independentTechnician`
- `shopOwner`
- `shopTechnician`

When `activeRoleContext = customer`:

- show customer vault
- show customer bills
- show customer services
- show customer complaints
- show customer properties and appliances

When `activeRoleContext = independentTechnician`:

- show independent technician receipts
- show independent technician services
- show independent technician customers where allowed
- show independent technician complaint responses
- show independent technician profile / card

When `activeRoleContext = shopOwner`:

- show shop-owned services
- show shop-issued receipts
- show shop complaints
- show shop technicians
- show shop profile and coordination controls

When `activeRoleContext = shopTechnician`:

- show assigned shop-context tasks only
- show assigned visit updates
- show assigned complaint / revisit work where allowed
- hide shop ownership controls
- hide independent technician ownership controls

## 8. Role Switch Rule

If only one role profile exists, the app may open that workspace directly.

If multiple role profiles exist, the app must provide explicit role/workspace switching.

Examples:

- Continue as Customer
- Continue as Independent Technician
- Continue as Shop Owner
- Continue as Shop Technician

Role switching must preserve:

- separate dashboard context
- separate navigation
- separate permissions
- separate profile identity
- separate source labels
- separate record visibility

Role switching must not allow:

- mixed role actions on the same screen
- silent conversion of role truth
- customer/provider data confusion
- hidden admin leakage

## 9. Record Context Preservation Rule

Every important record must preserve identity and source context.

Important records should store:

- `hfmId`
- `activeRoleContext`
- `roleProfileId`
- `providerContext`
- `sourceContext`
- `sourceRecordId` where needed
- `createdAt`
- `updatedAt`

Customer bill example:

- `hfmId`
- `activeRoleContext = customer`
- `roleProfileId = customerProfileId`
- `sourceContext = customer_vault`

Independent Technician receipt example:

- `hfmId`
- `activeRoleContext = independentTechnician`
- `roleProfileId = independentTechnicianProfileId`
- `providerContext = independent_technician_service`

Shop Owner receipt example:

- `hfmId`
- `activeRoleContext = shopOwner`
- `roleProfileId = shopOwnerProfileId`
- `providerContext = shop_owner_service`

Shop Technician assignment example:

- `hfmId`
- `activeRoleContext = shopTechnician`
- `roleProfileId = shopTechnicianProfileId`
- `providerContext = shop_technician_under_shop_service`
- `shopId` / `shopOwnerId` where applicable

## 10. Shop Technician Identity Boundary Rule

Shop Technician profile must always be shop-linked.

Shop Technician profile must include:

- `shopTechnicianProfileId`
- `hfmId`
- `shopId`
- `shopOwnerId`
- `technicianStatus`

Shop Technician may:

- view assigned shop work
- acknowledge assigned work
- submit updates
- complete assigned tasks
- support complaint / revisit work where assigned

Shop Technician must not:

- own shop receipt truth
- own shop complaint truth
- own customer relationship
- own shop provider identity
- convert shop work into independent work automatically
- use shop work as independent public provider proof unless explicitly approved later

## 11. Provider Context Source Truth Rule

`providerContext` must preserve original source truth.

Allowed provider context values include:

- `customer_local_record`
- `independent_technician_service`
- `shop_owner_service`
- `shop_technician_under_shop_service`
- `admin_support_hidden`
- `local_demo_record`

Rules:

- Independent Technician service remains independent-source service
- Shop Owner service remains shop-owned service
- Shop Owner personally doing service still remains `shop_owner_service`
- Shop Technician assigned work remains shop-context work
- old independent records must not become shop records later
- old shop technician records must not become independent technician records later
- active role context must not overwrite historical source context

## 12. Identity Non-Mixing Rule

Do not mix:

- person identity and role-specific working profiles
- active role context and historical source context
- customer vault and provider workspace
- independent technician profile and shop technician assignment profile
- shop owner service and independent technician service
- phone number and ownership proof
- customer app installation and record ownership

The system must remain:

- one permanent person identity
- multiple role-specific profiles
- explicit active workspace
- strict record-context separation

# PART 2 — ROLE ARCHITECTURE AND ROLE-SAFE EXPOSURE

## 13. Launch-Visible Role Contexts

Launch-visible role contexts:

1. Customer
2. Independent Technician
3. Shop Owner
4. Shop Technician under shop context

## 14. Hidden / Future Role Contexts

Hidden or future role contexts:

- Admin
- Support Reviewer
- Complaint Reviewer
- Receipt Integrity Reviewer
- Claim Privacy Reviewer
- Provider Trust Reviewer
- Security / Compliance Reviewer
- Future Manager / Dispatcher

Hidden roles must not appear as normal launch role choices unless explicitly approved later.

## 15. Customer Role Truth

Customer owns:

- own service memory
- own bills / receipts view
- own service history
- own complaints
- own revisits
- own historical claims
- own customer vault privacy
- own properties and appliances

Customer must not see:

- provider private notes
- shop internal notes
- technician staff-management data
- admin governance evidence
- other customer records
- hidden fraud / trust logic

## 16. Independent Technician Role Truth

Independent Technician owns:

- own independent service records
- own independent receipts
- own independent complaint responses
- own revisit scheduling
- own profile / availability
- own provider trust summary

Independent Technician must not:

- own shop service records
- own shop receipts
- act as Shop Technician without shop context
- browse customer vault
- access admin governance
- see unrelated customer records

## 17. Shop Owner Role Truth

Shop Owner owns:

- shop profile
- shop service records
- shop-issued receipts
- shop complaint responsibility
- shop revisit coordination
- shop technician assignment
- shop customer continuity

Shop Owner must not:

- own independent technician records
- make Shop Technician owner of shop receipt truth
- browse full customer vault
- access other shop records
- access admin governance from normal UI

## 18. Shop Technician Role Truth

Shop Technician is assignment-based under shop context.

Shop Technician may:

- view assigned shop service task
- acknowledge assignment
- submit service update
- participate in assigned complaint / revisit work

Shop Technician must not:

- own shop receipt truth
- own shop complaint truth
- become Independent Technician silently
- browse customer vault
- view unrelated shop customers
- manage shop profile
- access admin governance

## 19. Admin Role Truth

Admin is hidden governance.

Admin may future-review:

- provider issues
- complaints
- receipt integrity
- historical claims
- customer vault privacy
- trust / abuse
- appeals
- audit

Admin must not:

- appear in normal launch UI
- become provider workflow shortcut
- silently rewrite user truth
- bypass audit
- punish without case-based governance

## 20. Role Exposure Matrix

| Role / Context         |          Launch visible | Own dashboard |    Customer vault access |          Provider operations |  Admin powers |
| ---------------------- | ----------------------: | ------------: | -----------------------: | ---------------------------: | ------------: |
| Customer               |                     yes |           yes |           own vault only |                           no |            no |
| Independent Technician |                     yes |           yes |      service-linked only |     own independent services |            no |
| Shop Owner             |                     yes |           yes | shop-service-linked only |            own shop services |            no |
| Shop Technician        | yes, under shop context |       limited |    assigned-service only |     assigned shop tasks only |            no |
| Admin / Support        |                  hidden |   hidden only |  case-scoped future only | no normal provider operation | governed only |

## 21. Role-Safe Navigation Rule

Navigation must remain role-bounded.

Customer navigation must not show provider-only controls.

Independent Technician navigation must not show Shop Owner controls.

Shop Owner navigation must not show Independent Technician ownership controls unless separate future multi-role switch is explicitly designed.

Shop Technician navigation must remain assignment-context limited.

Admin must not appear in normal role navigation.

## 22. Multi-Role Rule

Multi-role account support must preserve:

- one permanent `hfmId`
- explicit role switch
- separate dashboard context
- separate role profile IDs
- separate permissions
- separate provider identity
- separate source labels
- separate audit where needed

It must not allow:

- mixed role actions on the same screen
- silent conversion of role truth
- customer/provider data confusion
- hidden admin leakage

# PART 3 — ROLE × ACTION PERMISSION MATRIX

## 23. Core Permission Principle

No important action is allowed just because a screen exists.

Every action must check:

- actor role
- active role context
- role profile ID
- provider context
- record ownership
- original source record
- lifecycle state
- customer privacy impact
- receipt / complaint / claim impact
- Phase-0 boundary
- hidden / future status

## 24. Customer Permissions

Customer can:

- view own service memory
- manage own properties and appliances
- view own bills / receipts
- accept / dispute / request correction for own receipts
- create complaint for own service record
- reply to provider questions
- confirm / reopen complaint where allowed
- view own revisits
- claim old records through safe claim flow
- repeat service where linked
- view own notifications

Customer cannot:

- access provider internal notes
- access admin evidence
- view other customer records
- force provider punishment
- claim records by phone number alone
- edit provider-issued receipt as provider
- change original service source silently

## 25. Independent Technician Permissions

Independent Technician can:

- manage own profile and availability
- accept / decline own service requests
- create own independent service records
- issue own independent receipts
- correct own receipts where allowed
- respond to own complaints
- schedule own revisits
- view own ratings / trust
- view own notifications

Independent Technician cannot:

- manage shop records
- issue shop receipt
- access customer vault broadly
- close complaint without customer confirmation rule where required
- claim legal bill verification in Phase-0
- process real payments in Phase-0
- access admin governance internals

## 26. Shop Owner Permissions

Shop Owner can:

- manage own shop profile
- manage own shop services
- issue own shop receipts
- correct own shop receipts where allowed
- respond to shop complaints
- assign / coordinate Shop Technicians
- schedule shop revisits
- view shop customer continuity where allowed
- view shop notifications

Shop Owner cannot:

- own Independent Technician records
- make Shop Technician owner of shop receipt truth
- access customer full vault
- access other shop records
- access admin governance internals
- process real payments in Phase-0
- claim legal bill verification in Phase-0

## 27. Shop Technician Permissions

Shop Technician can:

- view assigned shop services
- acknowledge assigned work
- submit assigned visit updates
- submit complaint / revisit updates where assigned
- view own assignment notifications
- view limited customer context needed for assigned task

Shop Technician cannot:

- issue final shop receipt independently
- correct shop receipt independently
- own shop complaint truth
- browse customer vault
- view unrelated shop customers
- manage shop profile
- convert assignment to independent service
- claim payroll / attendance authority in Phase-0

## 28. Admin / Support Permissions

Admin / Support future roles can:

- review case-scoped records where permitted
- review complaint escalations
- review receipt integrity issues
- review claim privacy issues
- review provider trust / abuse
- correct source labels where evidence supports it
- handle appeals / re-review
- audit high-impact actions

Admin / Support cannot:

- appear in public Phase-0 role picker
- browse customer vault without case scope
- punish provider without governance case
- erase audit history
- bypass least-privilege permissions
- convert Phase-0 demo labels into production authority

## 29. High-Impact Action Rule

High-impact actions require audit and stronger control.

High-impact actions include:

- receipt source correction
- complaint routing correction
- claim approval / rejection
- customer vault access correction
- provider restriction
- rating / trust correction
- role / provider context correction
- irreversible delete / restore
- admin permission changes

# PART 4 — CANONICAL OBJECT / ENTITY DEFINITIONS

## 30. Core Object Principle

Every important object must have:

- stable ID
- `hfmId` where person/account identity is relevant
- role profile ID where role context is relevant
- active role context at creation where relevant
- owner role
- provider context where relevant
- source domain
- source record
- status
- visibility scope
- created / updated timestamps
- correction / audit path where needed

## 31. Canonical Entities

### 31.1 PERSON_ACCOUNT

Purpose:

Permanent person/account identity.

Key fields:

- hfm_id
- display_name
- phone_optional
- email_optional
- account_status
- created_at
- updated_at

### 31.2 ROLE_PROFILE_LINK

Purpose:

Links one `hfmId` to one or more role-specific profiles.

Key fields:

- role_profile_link_id
- hfm_id
- role_context
- role_profile_id
- profile_status
- created_at
- updated_at

### 31.3 ACTIVE_ROLE_CONTEXT

Purpose:

Stores the currently selected role/workspace.

Key fields:

- active_context_id
- hfm_id
- active_role_context
- active_profile_id
- selected_at
- updated_at

### 31.4 CUSTOMER_PROFILE

Purpose:

Customer account-level service memory owner.

Key fields:

- customer_profile_id
- hfm_id
- customer_display_name
- profile_status
- created_at
- updated_at

### 31.5 CUSTOMER_PROPERTY

Purpose:

Customer-owned property memory.

Key fields:

- property_id
- customer_profile_id
- hfm_id
- property_label
- property_type
- property_status
- created_at
- updated_at

### 31.6 CUSTOMER_APPLIANCE

Purpose:

Customer-owned appliance memory.

Key fields:

- appliance_id
- customer_profile_id
- hfm_id
- property_id_optional
- appliance_type
- appliance_label
- brand_optional
- model_optional
- appliance_status
- created_at
- updated_at

### 31.7 SERVICE_RECORD

Purpose:

Canonical service memory record.

Key fields:

- service_record_id
- hfm_id
- customer_profile_id
- active_role_context
- role_profile_id
- provider_context
- provider_id
- property_id_optional
- appliance_id_optional
- original_service_source_id
- service_title
- service_date
- service_status
- source_label
- created_at
- updated_at

### 31.8 BILL_RECEIPT_RECORD

Purpose:

Bill / receipt source-truth record.

Key fields:

- bill_receipt_id
- hfm_id
- customer_profile_id
- active_role_context
- role_profile_id
- provider_context
- provider_id
- shop_technician_id_optional
- service_record_id_optional
- receipt_source_context
- receipt_status
- receipt_trust_state
- correction_version
- customer_review_status
- created_at
- updated_at

### 31.9 COMPLAINT_RECORD

Purpose:

Complaint linked to original service / receipt source.

Key fields:

- complaint_id
- hfm_id
- customer_profile_id
- service_record_id
- bill_receipt_id_optional
- provider_context
- original_service_source_id
- responsible_provider_id
- assigned_technician_id_optional
- complaint_reason_category
- complaint_status
- customer_confirmation_status
- created_at
- updated_at

### 31.10 REVISIT_RECORD

Purpose:

Revisit linked to complaint and original service source.

Key fields:

- revisit_id
- complaint_id
- service_record_id
- bill_receipt_id_optional
- hfm_id
- customer_profile_id
- provider_context
- responsible_provider_id
- assigned_technician_id_optional
- revisit_status
- scheduled_at_optional
- created_at
- updated_at

### 31.11 HISTORICAL_CLAIM_RECORD

Purpose:

Old record claim and ownership verification record.

Key fields:

- claim_record_id
- hfm_id
- customer_profile_id
- possible_source_record_id
- claim_status
- match_confidence_label
- verification_method
- support_review_status_optional
- created_at
- updated_at

### 31.12 VAULT_ACCESS_SCOPE

Purpose:

Defines safe customer vault access scope.

Key fields:

- vault_access_scope_id
- hfm_id
- customer_profile_id
- actor_role
- actor_id
- source_record_type
- source_record_id
- allowed_scope_summary
- access_status
- created_at
- updated_at

### 31.13 PROVIDER_PROFILE

Purpose:

Provider identity record for Independent Technician or Shop Owner.

Key fields:

- provider_id
- hfm_id
- provider_context
- role_profile_id
- display_name
- service_categories
- profile_status
- trust_summary_status
- created_at
- updated_at

### 31.14 SHOP_TECHNICIAN_PROFILE

Purpose:

Shop-linked technician context record.

Key fields:

- shop_technician_profile_id
- hfm_id
- shop_owner_id
- shop_id
- display_name
- technician_role_label
- technician_status
- created_at
- updated_at

### 31.15 OPS_ASSIGNMENT_RECORD

Purpose:

Shop operations / assignment coordination record.

Key fields:

- ops_assignment_id
- shop_owner_id
- shop_id
- shop_technician_profile_id_optional
- service_record_id
- complaint_id_optional
- revisit_id_optional
- assignment_status
- assigned_by_role
- assigned_by_id
- created_at
- updated_at

### 31.16 ADMIN_CASE

Purpose:

Hidden governance review case.

Key fields:

- admin_case_id
- case_type
- primary_domain
- affected_role
- target_record_type
- target_record_id
- severity
- case_status
- assigned_admin_id_optional
- created_at
- updated_at

### 31.17 TIMELINE_EVENT

Purpose:

Shared status / correction / audit event.

Key fields:

- timeline_event_id
- source_domain
- source_record_type
- source_record_id
- actor_role
- actor_id
- event_type
- old_state_optional
- new_state_optional
- reason_optional
- created_at

## 32. Active Role Context Values

active_role_context allowed values:

- customer
- independentTechnician
- shopOwner
- shopTechnician

## 33. Provider Context Values

provider_context allowed values:

- customer_local_record
- independent_technician_service
- shop_owner_service
- shop_technician_under_shop_service
- admin_support_hidden
- local_demo_record

## 34. Source Domain Values

source_domain allowed values:

- customer
- independent_technician
- shop_owner
- shop_technician_context
- complaint_revisit
- bill_receipt
- historical_claim
- customer_vault
- operations_dispatch
- admin_hidden
- release_status

## 35. Visibility Scope Values

visibility_scope allowed values:

- customer_owner_only
- provider_service_linked
- shop_owner_owned
- shop_technician_assigned_only
- admin_case_scoped
- public_safe_summary
- local_demo_only
- hidden_future

# PART 5 — LIFECYCLE / STATE-TRANSITION DISCIPLINE

## 36. Core State Principle

State is product truth.

A state change must mean something real in the product workflow.

Important state changes must preserve:

- old state
- new state
- actor
- role
- source record
- timestamp
- reason where needed
- timeline / audit event

## 37. Service Status Values

service_status allowed values:

- draft
- requested
- accepted
- scheduled
- in_progress
- service_completed
- receipt_pending
- receipt_sent
- customer_review_pending
- accepted_by_customer
- disputed_by_customer
- corrected
- closed
- cancelled
- archived

## 38. Complaint Status Values

complaint_status allowed values:

- draft
- submitted
- received
- acknowledged
- provider_questions
- customer_reply_pending
- technician_review_needed
- revisit_needed
- revisit_scheduled
- revisit_in_progress
- revisit_completed
- correction_pending
- resolved_by_provider
- customer_confirmation_pending
- resolved_confirmed
- reopened
- support_review_needed
- closed
- cancelled

## 39. Receipt Status Values

receipt_status allowed values:

- draft
- issued
- pending_customer_review
- accepted
- disputed
- correction_requested
- corrected
- rejected
- archived
- deleted_local

## 40. Claim Status Values

claim_status allowed values:

- not_started
- search_started
- possible_match_found
- no_match_found
- customer_review_needed
- ownership_verification_needed
- verification_pending
- support_review_needed
- claim_submitted
- claim_approved
- claim_rejected
- claim_success
- skipped
- retry_later
- cancelled
- archived

## 41. Operations Assignment Status Values

assignment_status allowed values:

- unassigned
- assignment_pending
- assigned
- acknowledgement_needed
- acknowledged
- visit_scheduled
- visit_started
- update_needed
- update_submitted
- visit_completed
- completion_review_needed
- completed
- reassignment_needed
- reassigned
- cancelled
- closed

## 42. Admin Case Status Values

admin_case_status allowed values:

- new
- triaged
- assigned
- in_review
- waiting_for_customer
- waiting_for_provider
- waiting_for_evidence
- escalated
- action_recommended
- action_taken
- appeal_open
- re_review
- resolved
- closed
- reopened

## 43. Blocked Global Transitions

Blocked:

- independent service to shop service silently
- shop service to independent service silently
- shop technician assignment to independent provider truth
- complaint to closed without resolution / confirmation where required
- receipt to legal verification in Phase-0
- visit update to payroll / attendance truth in Phase-0
- phone match to claim success automatically
- provider access to full customer vault browsing
- admin action to silent user truth rewrite
- correction to old history erased
- active role context to historical source context overwrite
- role switch to record ownership conversion

## 44. Correction Rule

Correction must preserve:

- original value
- corrected value
- correction reason
- actor role
- actor ID
- timestamp
- affected domain
- affected record
- customer / provider visibility impact

# PART 6 — DATA TRUST / PRIVACY / DELETION RULES

## 45. Core Data Trust Principle

HomeFix Mitra data must not become more authoritative than the product can honestly support.

Phase-0 local/demo data demonstrates UX and product workflow.

Future production may require backend security, permissions, recovery, immutable audit, support review and policy compliance.

## 46. Data Ownership Groups

1. Customer-owned data
2. Provider-owned data
3. Shared workflow data
4. Customer vault private data
5. Complaint / receipt trust data
6. Historical claim data
7. Operations data
8. Admin governance data
9. Audit / timeline data
10. Identity and role-profile data

## 47. Customer-Owned Data

Customer-owned data includes:

- customer profile
- properties
- appliances
- customer-local records
- customer complaint actions
- customer claim actions
- customer vault settings
- customer receipt acceptance / dispute

Customer-owned does not mean customer can rewrite provider-issued receipt truth silently.

## 48. Provider-Owned Data

Provider-owned data includes:

- provider profile
- provider-issued receipts
- provider service responses
- provider complaint replies
- provider revisit actions
- provider operational updates

Provider-owned does not mean provider can browse full customer vault.

## 49. Shared Workflow Data

Shared workflow data includes:

- service records
- receipt review state
- complaint lifecycle
- revisit lifecycle
- rating state
- claim review state

Shared workflow data must have clear action ownership.

## 50. Customer Vault Privacy

Customer vault privacy protects:

- properties
- appliances
- service history
- bills / receipts
- complaints
- revisits
- historical claims
- household-sensitive information

Providers may access only service-context-linked data.

## 51. Historical Continuity and App-Install Boundary Rule

Phone number may support continuity, lookup and customer recognition, but phone number alone must not prove ownership of historical records.

Historical record access must use a safe claim flow with stronger customer-controlled proof where required, such as HomeFix Mitra ID, support-assisted review or other approved verification methods.

Customer app installation must not be mandatory for accepting complaints, service follow-ups or basic service continuity.

A non-app customer may still be supported through safe provider-side or support-assisted continuity flows where the product scope allows it.

## 52. Deletion / Archive Rule

Deletion must distinguish between:

- local demo deletion
- archive
- revoke / unlink
- correction
- support removal
- future production deletion request
- audit retention

Important:

Delete must not erase complaint / receipt / claim history where audit is required.

## 53. Work / Service Record Deletion

Service records with receipts, complaints, revisits or claims should usually be archived / corrected rather than silently deleted.

## 54. Receipt Deletion

Receipt deletion must not erase:

- acceptance history
- dispute history
- correction history
- complaint link
- duplicate review
- provider source

## 55. Complaint Deletion

Complaints must not disappear after provider response, revisit or customer confirmation.

Closed complaints remain in service history.

## 56. Claim Deletion

Claim unlink / correction must preserve:

- claim attempt
- old linked state
- new state
- privacy reason
- actor
- timestamp

# PART 7 — NOTIFICATION / ALERT CONTRACT

## 57. Core Notification Principle

Notifications must be:

- role-safe
- source-linked
- privacy-safe
- low-noise
- action-oriented
- non-alarming
- Phase-0 honest

Notifications must not expose:

- provider private notes
- shop internal notes
- admin evidence
- other customer records
- hidden fraud logic
- full customer vault data

## 58. Customer Notifications

Customer notification types:

- service_request_sent
- visit_scheduled
- provider_update_available
- receipt_ready
- receipt_pending_review
- receipt_accepted
- receipt_disputed
- receipt_corrected
- complaint_submitted
- complaint_acknowledged
- provider_question_received
- revisit_scheduled
- revisit_completed
- complaint_resolved_by_provider
- customer_confirmation_needed
- complaint_reopened
- rating_required
- possible_claim_match_found
- claim_approved
- claim_rejected

## 59. Independent Technician Notifications

Independent Technician notification types:

- service_request_received
- visit_confirmed
- service_completed
- receipt_review_pending
- receipt_accepted
- receipt_disputed
- complaint_received
- revisit_requested
- revisit_scheduled
- complaint_reopened
- rating_received
- availability_needs_update

## 60. Shop Owner Notifications

Shop Owner notification types:

- shop_service_request_received
- technician_assignment_needed
- technician_acknowledged
- visit_update_submitted
- receipt_review_pending
- receipt_disputed
- complaint_received
- technician_review_needed
- revisit_scheduled
- complaint_reopened
- rating_received

## 61. Shop Technician Notifications

Shop Technician notification types:

- service_assigned
- acknowledgement_needed
- visit_scheduled
- visit_update_needed
- complaint_review_requested
- revisit_assigned
- completion_note_needed
- assignment_reassigned

## 62. Admin Hidden Notifications

Admin notification types:

- new_admin_case_created
- complaint_review_needed
- receipt_integrity_review_needed
- claim_privacy_review_needed
- provider_review_needed
- customer_vault_privacy_alert
- trust_abuse_signal
- appeal_submitted
- irreversible_action_requested
- audit_gap_detected

Admin notifications must remain hidden from normal launch UI.

## 63. Safe Notification Wording Rule

Good examples:

- A receipt is ready for review.
- A complaint was acknowledged.
- A revisit was scheduled.
- Please confirm if the issue is resolved.
- A possible old service record was found.

# PART 8 — SHARED GLOBAL SYSTEM, DATA AND CONTROL RULES

## 64. Currency Data Architecture Rule

Rules:

- amount must be stored as numeric value
- currency_code must be stored separately
- UI must render currency dynamically from stored currency context
- no GPS or location-based currency logic
- currency context must stay visible on bills, receipts, exports and trust-sensitive financial surfaces

## 65. Global-Neutral Content Rule

Shared system behavior must avoid region-only assumptions.

Shared entity and validation models must remain globally extensible.

## 66. Phone and Address Architecture Rule

Rules:

- phone fields must support international country codes
- address structure must not assume one local-only format
- validation must remain globally extensible

## 67. Neutral Sample and Demo Data Rule

System-level placeholder and sample content must prefer:

- neutral names
- neutral property labels
- neutral provider labels
- neutral appliance examples
- globally understandable wording

## 68. Correction and Risky Action Clarity Rule

High-impact actions must be understandable before confirmation.

User must understand consequence before risky action is confirmed.

## 69. Build Discipline Rule

If a feature is not clearly in:

- Build First
- Do Not Build Now
- Build Later

it must not enter implementation without re-approval.

## 70. Deferred-Item Control Rule

Deferred or future items must remain clearly labeled.

Deferred items must not silently behave like locked release scope.

They must not leak into Phase-0 implementation casually.

## 71. Version and Change-Control Rule

Shared governing rules must not drift casually after lock.

Rules:

- cross-domain changes require deliberate review
- global rule changes must be reflected consistently across dependent files
- no hidden wording drift after lock
- versioned update is required for future approved changes

## 72. Final Boundary Rule

This file must remain:

- shared
- governing
- stable
- cross-domain
- enterprise-grade
- stricter than domain-level convenience
