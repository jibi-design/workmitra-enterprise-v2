# HOMEFIX MITRA — ADMIN SYSTEM ARCHITECTURE

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Admin System Architecture defines the hidden HomeFix Mitra governance, moderation, review, correction, appeal, privacy, trust, security and audit-control layer.

Admin System protects platform integrity without becoming a normal user workflow.

Admin System must remain:

- hidden from normal launch UI
- least-privilege
- case-based
- evidence-aware
- privacy-safe
- action-bounded
- audit-traceable
- appeal-aware
- Phase-0 demo-safe

## 3. Core Principle

Admin System = hidden governance and safety layer.

Admin System is not:

- Customer dashboard
- Independent Technician dashboard
- Shop Owner dashboard
- Shop Technician workspace
- payment system
- legal authority system
- uncontrolled super-user backdoor
- shortcut to rewrite user truth

## 4. What Admin System Is

Admin System is:

- provider review system
- complaint review system
- bill / receipt integrity review system
- historical claim privacy review system
- customer vault privacy protection system
- trust / abuse review system
- appeal / re-review system
- audit and correction system
- hidden platform governance architecture

## 5. What Admin System Is Not

Admin System is not:

- launch-visible role
- public role option
- normal provider operations panel
- provider punishment button
- customer support chat in Phase-0
- legal dispute court
- payment refund system
- payroll system
- receipt legal verification authority in Phase-0

## 6. Hard Non-Mixing Rule

Admin System must not appear in:

- customer dashboard
- provider dashboard
- shop technician workspace
- landing role selection
- normal service flow
- complaint normal flow
- receipt normal flow
- historical claim normal flow

Admin may review only through hidden governance surfaces.

Admin actions must not silently rewrite customer / provider truth.

Admin System must not:

- force customer app installation before complaint or service continuity
- treat phone number as ownership proof
- unlock historical records by phone match alone
- give providers customer vault access
- convert Shop Technician context into Independent Technician truth
- convert Shop Owner service into Independent Technician truth
- use payment, payroll or legal-verification claims in Phase-0

## 7. Admin Customer-App and Phone Boundary Rule

Admin governance must preserve the product rule that customer app installation is not mandatory for basic complaint handling, service follow-up or provider-side continuity.

Admin may review cases involving non-app customers only through safe, source-linked, case-scoped records.

Phone number may support continuity lookup, evidence review and customer contact matching.

Phone number must not be used as:

- final ownership proof
- customer vault unlock key
- historical record release key
- complaint ownership decision by itself
- receipt acceptance proof
- provider trust proof by itself

Admin must treat phone number as a continuity bridge, not ownership proof.

## 8. Admin Screen-by-Screen Architecture

### 8.1 Admin Dashboard

Shows:

- open review cases
- high-priority privacy cases
- complaint escalation cases
- receipt integrity cases
- provider trust cases
- claim review cases
- audit warnings
- pending irreversible actions

### 8.2 Admin Case Queue

Shows:

- case type
- affected role
- affected provider context
- affected record
- severity
- assigned admin
- status
- next action

### 8.3 Admin Case Detail

Shows:

- case summary
- linked customer / provider / record
- evidence summary
- timeline
- allowed actions
- appeal / re-review status
- audit log

### 8.4 Provider Review Center

Reviews:

- Independent Technician issues
- Shop Owner issues
- Shop Technician context misuse
- fake / duplicate provider profiles
- role-mixing concerns
- trust abuse

### 8.5 Complaint Review Center

Reviews:

- unresolved complaints
- wrong routing
- repeated reopen
- provider no-response
- customer abuse concern
- shop technician ownership confusion

### 8.6 Receipt Integrity Review

Reviews:

- suspicious receipts
- duplicate receipts
- fake receipt concern
- wrong provider source
- correction disputes
- customer acceptance disputes

### 8.7 Historical Claim Privacy Review

Reviews:

- low-confidence claim
- phone-number-only risk
- household privacy risk
- wrong access concern
- provider source conflict
- support-assisted claim review

### 8.8 Customer Vault Privacy Review

Reviews:

- provider over-access
- wrong record exposure
- household data risk
- unrelated appliance / property access
- support / admin evidence access

### 8.9 Trust / Abuse Review

Reviews:

- suspicious ratings
- repeated complaint pattern
- fake service history concern
- provider trust manipulation
- customer false complaint concern
- duplicate / coordinated abuse

### 8.10 Appeal / Re-review Center

Handles:

- provider appeal
- customer appeal
- receipt decision appeal
- complaint decision appeal
- claim rejection review
- restriction review

### 8.11 Permission Management

Controls:

- admin role scopes
- support role scopes
- review access
- irreversible action approval
- sensitive evidence view

### 8.12 Audit Log Viewer

Shows:

- admin actions
- evidence access
- corrections
- review decisions
- permission changes
- irreversible actions

### 8.13 Incident / Crisis Mode

Reserved for severe platform risk.

Must remain Super Admin / senior-governance controlled in future production.

## 9. Admin Case Types

`admin_case_type` allowed values:

- provider_profile_review
- independent_technician_review
- shop_owner_review
- shop_technician_context_review
- complaint_escalation_review
- complaint_wrong_routing_review
- receipt_integrity_review
- duplicate_receipt_review
- fake_receipt_review
- historical_claim_privacy_review
- customer_vault_privacy_review
- trust_abuse_review
- rating_abuse_review
- role_mixing_review
- appeal_review
- compliance_review
- incident_response

## 10. Admin Case Status

`admin_case_status` allowed values:

- new
- triaged
- assigned
- in_review
- waiting_for_customer
- waiting_for_provider
- waiting_for_evidence
- waiting_for_support
- escalated
- action_recommended
- action_taken
- appeal_open
- re_review
- resolved
- closed
- reopened

## 11. Admin Action Catalog

Allowed actions:

- no_action
- monitor
- request_clarification
- request_correction
- warn
- hold_visibility
- restrict_feature
- correct_source_label
- correct_record_link
- open_re_review
- escalate
- restore
- close_case

High-risk actions:

- provider_suspension
- customer_restriction
- permanent_provider_restriction
- claim_approval_override
- receipt_source_correction_after_acceptance
- customer_vault_access_correction
- admin_permission_grant_or_removal
- incident_mode_activation

Rule:

High-risk actions require stronger permission, second approval or Super Admin review in future production.

# PART 1 — ADMIN CASE LIFECYCLE, QUEUE AND GOVERNED ACTION SYSTEM

## 12. Admin Case Lifecycle Rule

Every meaningful admin review must be case-based.

Admin flow must follow:

- intake
- triage
- assignment
- evidence review
- bounded action
- audit
- closure
- appeal or re-review where allowed

Admin must not use casual hidden actions outside case flow.

## 13. Admin Case Types Rule

Admin case types may include:

- customer_support_case
- provider_identity_review
- independent_technician_review
- shop_owner_review
- shop_technician_context_review
- passive_supplier_conflict_review
- complaint_escalation_review
- complaint_closure_dispute
- complaint_reopen_review
- bill_receipt_integrity_review
- receipt_dispute_review
- record_correction_review
- historical_claim_review
- customer_vault_privacy_review
- trust_abuse_review
- rating_abuse_review
- fraud_investigation
- compliance_review
- incident_response

## 14. Admin Case Status Rule

Admin case status may include:

- new
- triaged
- assigned
- in_review
- waiting_for_customer
- waiting_for_provider
- waiting_for_evidence
- escalated
- action_taken
- appeal_open
- re_review
- resolved
- closed
- closed_no_action
- reopened

## 15. Required Admin Queues Rule

Admin queue system may include:

- new intake queue
- triage queue
- provider review queue
- complaint governance queue
- bill and receipt integrity queue
- historical claim queue
- record correction queue
- trust and abuse queue
- appeal and re-review queue
- compliance and security queue
- incident queue

## 16. Triage Rule

Every case must be triaged for:

- case type
- affected role
- affected record
- severity
- privacy sensitivity
- evidence availability
- immediate customer or provider risk
- required admin role
- escalation need

## 17. Case Detail Minimum Rule

Every admin case should preserve:

- admin_case_id
- case_type
- severity
- status
- affected_customer_id_optional
- affected_provider_id_optional
- provider_context_type_optional
- affected_service_record_id_optional
- affected_bill_receipt_id_optional
- affected_complaint_id_optional
- affected_claim_id_optional
- evidence_summary
- assigned_admin_id_optional
- decision_note_required
- created_at
- updated_at

## 18. Bounded Action Rule

Admin may act only after:

- case exists
- evidence reviewed
- permission allows action
- privacy boundary is respected
- action can be audit-traced

## 19. Closure Rule

Case may close only when:

- evidence has been reviewed
- decision or no-action reason is recorded
- customer or provider notice is handled where needed
- audit log is complete
- appeal or re-review path is recorded where applicable

## 20. Final Boundary Rule

Admin case system must remain:

- case-based
- permission-bounded
- evidence-linked
- privacy-safe
- audit-traceable
- appeal-aware

# PART 2 — PROVIDER VERIFICATION, ROLE SAFETY AND ABUSE REVIEW RULES

## 21. Provider Context Separation Rule

Admin must preserve strict provider-context separation between:

- Independent Technician
- Shop Owner
- Shop Technician under shop
- Passive Supplier or Contact

Admin must not mix these contexts casually.

## 22. Provider Review Trigger Rule

Provider review may start from:

- fake provider report
- duplicate provider profile
- suspicious receipt pattern
- repeated complaint pattern
- role confusion report
- shop technician misrepresentation
- shop owner acting as independent technician without clear context
- customer complaint
- rating abuse signal
- claim or link mismatch
- support escalation

## 23. Provider Risk Level Rule

Provider risk level may include:

- clear
- watch
- flagged
- restricted
- suspended
- escalated

## 24. Provider Action Ladder Rule

Level 0:

- no_action
- monitor

Level 1:

- warning
- education
- correction guidance

Level 2:

- profile_hold
- receipt_hold
- context_review_hold

Level 3:

- feature_restriction
- limited_provider_capability
- trust_impact_restriction

Level 4:

- provider_suspension
- review_lock

Level 5:

- final_removal
- permanent_restriction

Higher-risk actions require stronger review and audit control.

## 25. Independent Technician Review Rule

Independent Technician:

- owns independent service and receipt context
- must not claim shop-owned work as independent work
- must remain separate from shop-owned trust projection

## 26. Shop Owner Review Rule

Shop Owner:

- owns shop and business context
- if personally doing service, still remains Shop Owner context
- must not silently shift customer trust into technician-owned or independent context

## 27. Shop Technician Review Rule

Shop Technician under shop:

- remains shop-context work
- must not silently convert shop work into personal customer list
- must not project shop-context proof as independent public work

## 28. Passive Supplier Rule

Passive Supplier or Contact:

- may exist as customer-saved contact
- may support continuity and linking
- must not be treated as verified provider without proper verification

## 29. Provider Review Boundaries Rule

Admin must not:

- merge provider contexts casually
- rewrite provider identity without audit
- expose customer vault to provider
- convert shop technician work into independent work
- show fake verification
- remove provider history silently
- use customer app non-installation as provider or customer fault
- use phone match alone as provider-customer relationship proof

## 30. Provider Restore Rule

Provider access may be restored when:

- verification issue resolved
- correction completed
- appeal accepted
- admin error found
- risk no longer exists

Restore must log:

- restore reason
- restored features
- admin ID
- timestamp

## 31. Final Boundary Rule

Provider governance must remain:

- role-safe
- context-safe
- audit-traceable
- customer-trust-protective
- non-mixing across provider types

# PART 3 — COMPLAINT FAIRNESS, CLOSURE, REOPEN AND APPEAL OVERSIGHT RULES

## 32. Complaint Review Ladder

Complaint review levels:

- monitor
- clarification
- provider response request
- revisit review
- routing correction review
- support review
- admin escalation
- closure / re-review

Admin must check:

- original service source
- provider context
- receipt link
- customer claim
- provider response
- revisit history
- customer confirmation
- reopen reason

Rule:

Admin must not punish provider from one complaint without context.

## 33. Complaint Source Governance Rule

Admin complaint oversight must preserve original service-source truth.

Complaint ownership must remain linked to original provider context:

- Independent Technician service
- Shop Owner or shop service
- Shop Technician under shop context
- customer-side passive supplier note where provider is not yet linked

Admin must not reroute complaint across provider contexts without evidence, reason and audit.

## 34. Complaint Review Trigger Rule

Admin complaint review may start from:

- customer escalates complaint
- provider marks resolved but customer disagrees
- complaint repeatedly reopened
- provider does not respond
- revisit not completed
- wrong provider was routed
- linked bill or receipt is disputed
- complaint linked to wrong service record
- potential provider abuse
- potential customer misuse
- support escalation

## 35. Complaint Oversight Status Rule

Complaint admin review status may include:

- new
- triaged
- evidence_review
- waiting_for_customer
- waiting_for_provider
- revisit_review
- closure_review
- appeal_review
- action_recommended
- action_taken
- resolved
- closed
- reopened

## 36. Allowed Complaint Admin Actions Rule

Admin may:

- request more customer details
- request provider response
- mark complaint for manual review
- correct routing if wrong
- reopen complaint for fairness reason
- escalate provider review
- link complaint to receipt dispute
- link complaint to provider trust case
- close complaint admin review with explanation

## 37. Complaint Admin Boundaries Rule

Admin must not:

- force customer to accept closure
- force provider guilt without evidence
- delete complaint timeline
- hide reopen history
- replace provider response with admin-written response
- decide legal refund or payment settlement
- expose customer private vault to provider
- reject complaint only because customer app is not installed
- decide complaint routing by phone match alone

## 38. Revisit Oversight Rule

Admin may review revisit cases when:

- revisit was promised but not completed
- revisit date repeatedly changes
- provider marks revisit completed but customer disputes
- revisit is linked to wrong complaint
- revisit completion is used to inflate provider trust

Revisit must remain linked to original complaint and original service.

## 39. Closure Review Rule

Strong complaint closure should require:

- provider marks resolved
- customer confirms resolved
- complaint timeline preserved

Weak closure may exist when:

- provider marks resolved
- customer does not respond for a defined period
- case closes as inactive with a clear weak-closure label

Weak closure must not become strong positive provider trust proof.

## 40. Reopen Rule

Complaint may reopen when:

- same issue continues
- revisit did not solve problem
- provider closed too early
- receipt correction unresolved
- new evidence appears

Admin must preserve:

- original complaint ID
- previous closure attempt
- reopen reason
- new evidence
- full timeline

## 41. Appeal and Re-review Rule

Customer or provider may request re-review where allowed.

Appeal review should check:

- original complaint evidence
- provider response
- customer confirmation state
- revisit history
- closure reason
- fairness of action
- whether new evidence changes outcome

Possible outcomes may include:

- uphold_closure
- reopen_complaint
- request_more_info
- escalate_provider_review
- correct_record_link
- close_no_change

## 42. Trust Impact Rule

Complaint may affect provider trust only after fair review.

Rules:

- one complaint does not prove provider abuse
- repeated unresolved complaints may trigger provider review
- confirmed abusive closure patterns may restrict provider
- resolved complaint with customer confirmation may protect trust
- active complaint should block strong trust boost for that job

## 43. Final Boundary Rule

Complaint admin governance must remain:

- fairness-based
- source-linked
- revisit-aware
- closure-safe
- reopen-safe
- appeal-aware
- audit-traceable
- not a legal or payment judgement system

# PART 4 — BILL, RECEIPT, CORRECTION AND FRAUD REVIEW RULES

## 44. Receipt Integrity Review Ladder

Receipt review levels:

- no_issue
- correction_requested
- duplicate_review
- source_review
- customer_dispute_review
- provider_response_review
- suspicious_receipt_hold
- admin_correction_or_rejection

Admin must preserve:

- original receipt snapshot
- corrected version
- dispute reason
- provider response
- customer review state
- source label

Rule:

Admin correction must not erase receipt history.

## 45. Receipt Integrity Trigger Rule

Admin bill or receipt review may start from:

- customer disputes receipt
- provider correction request
- duplicate receipt detected
- fake receipt report
- wrong customer linked
- wrong provider linked
- wrong property linked
- wrong appliance linked
- historical record claim conflict
- bill inbox ingestion mismatch
- repeated suspicious provider receipt pattern
- support escalation

## 46. Receipt Integrity Status Rule

Receipt integrity status may include:

- clear
- pending_review
- disputed
- correction_requested
- corrected_pending_customer_review
- duplicate_suspected
- duplicate_confirmed
- fake_suspected
- fake_confirmed
- voided
- restored
- closed

## 47. Allowed Receipt Admin Actions Rule

Admin may:

- request provider clarification
- request customer clarification
- hold receipt trust impact
- mark duplicate suspected
- mark fake suspected
- approve correction flow
- link to correct service, property or appliance
- unlink wrong record with audit
- void receipt where justified
- restore receipt after review
- escalate provider trust review
- close no-action

## 48. Receipt Admin Boundaries Rule

Admin must not:

- silently accept receipt for customer
- silently edit accepted receipt without correction history
- erase old receipt version
- make payment settlement judgement
- expose customer vault to provider
- convert provider-created receipt into customer truth without consent
- delete disputed receipt history
- reject receipt only because customer app is not installed
- accept receipt by phone match alone

## 49. Correction Rule

Receipt correction must preserve:

- old value
- new value
- correction reason
- requested by
- reviewed by
- timestamp
- customer review state where relevant

Corrected receipt must not silently replace old receipt.

## 50. Duplicate Review Rule

Duplicate review should check:

- same provider
- same customer
- same service date
- same amount
- same service description
- same uploaded file or hash where available later
- same historical claim source

Possible outcomes may include:

- not_duplicate
- duplicate_suspected
- duplicate_confirmed
- merge_recommended
- keep_separate
- manual_review_needed

Do not merge automatically if customer, provider or source differs.

## 51. Fake Receipt Review Rule

Fake receipt suspicion may come from:

- customer report
- repeated provider pattern
- impossible service details
- mismatched customer or provider
- suspicious proof image
- duplicate receipt number pattern
- provider identity concern

Suspicion alone must not equal confirmed fake.

## 52. Customer Acceptance Safety Rule

If receipt is not accepted by customer:

- do not treat it as strong customer history
- do not strongly boost provider trust
- keep pending or disputed state visible

If customer accepted receipt:

- correction needs customer review where material
- complaint may still be raised
- accepted state must remain audit-visible

## 53. Trust Impact Rule

Receipt integrity issue may affect provider trust only when justified by fair review and evidence.

Examples:

- fake receipt confirmed
- repeated duplicate abuse confirmed
- provider repeatedly sends wrong-customer receipts
- provider manipulates correction flow
- disputed receipts remain unresolved repeatedly

## 54. Final Boundary Rule

Receipt admin governance must remain:

- customer-safe
- correction-traceable
- duplicate-aware
- fraud-aware
- audit-preserved
- not a payment-settlement system

# PART 5 — HISTORICAL CLAIM, CUSTOMER UNIQUE ID AND VAULT PRIVACY OVERSIGHT RULES

## 55. Historical Claim Privacy Review Ladder

Claim review levels:

- safe_claim
- verification_needed
- support_review_needed
- privacy_risk_hold
- wrong_access_risk
- claim_rejected
- claim_approved
- re_review_opened

Admin / support must check:

- phone number match is not sole proof
- customer unique ID
- service date / period
- provider context
- property / appliance clue
- household privacy risk
- previous owner / tenant risk
- claim confidence

## 56. Historical Claim Governance Rule

Admin must treat historical claim as a high-trust flow.

Possible match is not ownership proof.

Phone number may help discovery, but phone number alone must never unlock historical records.

## 57. Claim Review Trigger Rule

Admin historical claim review may start from:

- customer cannot claim old records
- customer says records are wrong
- phone match finds multiple possible customers
- provider uploaded old records with weak customer proof
- duplicate claim attempt
- record already claimed by another customer
- expired or invalid claim token
- customer unique ID mismatch
- support-assisted claim request
- provider claim-code dispute
- possible privacy leak

## 58. Claim Admin Status Rule

Claim admin status may include:

- new
- triaged
- verification_review
- waiting_for_customer
- waiting_for_provider
- support_verification_needed
- approved_for_claim
- partial_claim_approved
- claim_denied
- escalated_privacy_review
- action_taken
- closed
- reopened

## 59. Safe Summary Rule

Before verification, only safe summary may be shown.

Safe summary may include:

- provider or shop name
- service category
- approximate month or date
- count of possible records
- verification-required label

Must not expose before verification:

- full bill image
- full address
- detailed service notes
- household data
- other customer records
- provider private notes

## 60. Customer Unique ID Rule

Customer unique ID is stronger than phone number for historical claim continuity.

Admin may use customer unique ID to support:

- historical record linking
- support-assisted verification
- resolving phone-number collision
- provider and customer claim-code matching

Admin must not:

- create fake unique ID
- merge customer IDs without review
- expose unique ID publicly
- use unique ID without proper review where required

## 61. Support-Assisted Claim Rule

Support-assisted claim may be used when:

- customer changed phone number
- token expired
- claim code invalid
- provider entered wrong phone
- duplicate claim conflict exists
- old record ownership is unclear

High-risk support-assisted claim should escalate to Trust or Security Admin.

## 62. Duplicate Claim Rule

If same historical record is claimed by multiple customers:

- pause final release
- review claim evidence
- preserve both attempts
- avoid exposing one customer’s data to another
- approve, deny or escalate based on evidence

Do not auto-merge.

Do not auto-release.

## 63. Vault Privacy Oversight Rule

Admin must protect customer vault from:

- wrong-record release
- phone-match-only exposure
- provider overreach
- household leakage
- excessive admin browsing

Admin may review vault-related issues only through case-linked, permission-bounded access.

## 64. Final Boundary Rule

Historical claim and vault oversight must remain:

- privacy-first
- verification-aware
- customer-safe
- audit-traceable
- non-casual
- never phone-number-only for final ownership

# PART 6 — CUSTOMER VAULT, HOUSEHOLD, RECORD ACCESS AND PRIVACY GOVERNANCE RULES

## 65. Customer Vault Privacy Review Ladder

Privacy review levels:

- no_issue
- access_clarification
- access_correction
- provider_access_revoke
- wrong_record_unlink
- privacy_hold
- admin_escalation
- incident_review

Admin must protect:

- household records
- full address
- unrelated appliances
- unrelated provider records
- claim review evidence
- provider internal notes
- other customer records

## 66. Customer Vault Ownership Rule

Customer owns the vault.

Provider-created records may be offered to customer through safe flows.

Admin may review vault-related issues only through case-linked, permission-bounded access.

Admin must never treat customer vault as a general searchable back-office database.

## 67. Vault Source Truth Rule

Every vault record must preserve a source label.

Examples may include:

- added by customer
- uploaded by customer
- sent by Independent Technician
- sent by Shop
- accepted receipt
- claimed old record
- imported bill
- shared household record

Admin must not remove or overwrite source truth casually.

## 68. Admin Vault Access Rule

Admin may access vault-related data only when:

- an admin case exists
- the record is relevant to that case
- admin role has permission
- sensitivity level allows access
- access is audit-logged where sensitive

Admin must not browse:

- full customer vault without case reason
- household members
- unrelated bills
- unrelated provider history
- customer private notes
- property or appliance list unrelated to case

## 69. Provider Access Boundary Rule

Provider may see only:

- records they created or sent
- customer response to their receipt where allowed
- complaint linked to their service
- correction request linked to their receipt

Provider must not see:

- customer full vault
- other provider records
- household records
- customer private notes
- unaccepted old records
- claim attempts involving other providers
- property or appliance list unless customer shares or links it

## 70. Household Access Governance Rule

Household sharing must remain permission-based.

Household visibility may depend on:

- property ownership or member role
- shared property permission
- record owner
- bill uploader
- complaint owner
- privacy setting

Admin must not assume all household members can see all records.

## 71. Record Access Level Rule

Record access levels may include:

- owner_only
- shared_property
- household_shared
- provider_limited
- admin_case_limited
- support_limited
- restricted_sensitive

## 72. Private Note Safety Rule

Customer private notes must be treated as sensitive.

Provider must never see customer private notes.

Support Admin should not see private notes unless needed for a support case and permission allows.

## 73. Wrong Record Access Review Rule

If customer sees record that may not belong to them, admin must:

- pause final access where possible
- review source
- check claim or acceptance history
- preserve evidence
- remove or limit access if wrong
- notify safely
- audit before and after state

## 74. Final Boundary Rule

Customer vault governance must remain:

- customer-owned
- source-truth-preserving
- household-privacy-safe
- provider-limited
- admin least-privilege
- correction-auditable

# PART 7 — TRUST, ABUSE, RATING AND PROVIDER PENALTY GOVERNANCE RULES

## 75. Trust Governance Principle

Trust must be earned through verified or customer-accepted service behaviour.

Admin must not create fake trust.

Admin must not apply hidden punishment without evidence.

## 76. Trust Review Trigger Rule

Trust review may start from:

- repeated unresolved complaints
- fake receipt concern
- duplicate bill abuse
- rating manipulation
- suspicious review pattern
- repeated wrong-customer receipts
- provider overreach into customer vault
- repeated correction misuse
- complaint closure abuse
- customer safety report
- support escalation

## 77. Trust Risk Level Rule

Trust risk level may include:

- clear
- watch
- flagged
- restricted
- suspended
- escalated

## 78. Provider Penalty Ladder Rule

Level 0:

- no_action
- monitor

Level 1:

- warning
- education
- correction guidance

Level 2:

- trust_impact_hold
- provider_under_review
- affected_trust_surface_limited

Level 3:

- feature_restriction
- restrict_receipt_issuing_where_justified
- restrict_public_profile_visibility_where_justified
- restrict_repeat_service_prompts_where_justified
- restrict_claim_code_creation_where_justified

Level 4:

- provider_suspension
- review_lock
- public_trust_surface_freeze

Level 5:

- final_removal
- permanent_restriction

Higher-risk actions require stronger approval and audit control.

## 79. Rating Abuse Rule

Rating abuse signals may include:

- repeated suspicious high ratings
- repeated negative-rating attacks
- ratings from unverified service records
- ratings before complaint closure
- provider pressure for rating
- rating clusters from linked accounts

Suspicion alone must not equal confirmed abuse.

## 80. Complaint-Based Trust Impact Rule

Rules:

- active complaint blocks strong positive trust boost for that service
- customer-confirmed resolved complaint may reduce negative trust impact
- provider-marked resolved without customer confirmation must not become strong positive trust proof
- repeated unresolved complaints may trigger provider trust review

## 81. Receipt-Based Trust Impact Rule

Strong trust signal may include:

- customer accepted receipt
- no active dispute
- provider or source clear

Weak or blocked trust signal may include:

- pending receipt
- disputed receipt
- rejected receipt
- fake or duplicate suspected receipt
- phone-match-only record

## 82. Provider Overreach Rule

Provider overreach may include:

- trying to access customer vault
- forcing receipt acceptance
- repeated unsolicited follow-up
- claiming old records without customer verification
- using customer data beyond linked service context
- converting shop technician relationship into personal provider list

Such cases may trigger warning, restriction, review lock or escalation.

## 83. Customer Misuse Review Rule

Customer-side misuse may include:

- repeated false complaints
- rating attack pattern
- fake dispute pattern
- harassment of provider
- duplicate claim misuse

Lack of evidence alone does not automatically mean customer abuse.

## 84. Restore Rule

Restore may happen when:

- evidence insufficient
- correction completed
- appeal accepted
- admin error found
- trust risk resolved

Restore must not delete trust review history.

## 85. Final Boundary Rule

Trust governance must remain:

- evidence-based
- proportional
- reversible where possible
- appeal-aware
- audit-traceable
- never hidden punishment without trace

# PART 8 — ADMIN PERMISSION MATRIX, LEAST-PRIVILEGE AND HIGH-RISK APPROVAL RULES

## 86. Permission Matrix

Admin roles:

- Support Reviewer
- Complaint Reviewer
- Receipt Integrity Reviewer
- Claim Privacy Reviewer
- Provider Trust Reviewer
- Security / Compliance Reviewer
- Super Admin

Rule:

Admin must follow least privilege.

No admin should access all sensitive customer vault / claim / complaint evidence unless permission scope requires it.

## 87. Least-Privilege Rule

Admin permissions must be explicit, role-bounded, case-linked, privacy-safe and audit-traceable.

Admin must not receive broad vault, provider, complaint or evidence access just because it is convenient.

## 88. Support Admin Rule

Support Admin may access:

- support cases
- safe customer summary
- safe provider summary
- basic bill visibility issue
- basic claim or link guidance

Support Admin may perform:

- create support case
- request customer clarification
- request provider clarification
- add support note
- close low-risk support case
- escalate to correct admin role

Support Admin must not perform:

- provider suspension
- trust penalty
- complaint final decision
- vault privacy override
- historical record release
- bill or receipt ownership correction without review
- admin permission change

## 89. Trust Admin Rule

Trust Admin may access:

- provider review cases
- trust abuse cases
- receipt integrity summaries
- rating or review pattern summaries
- provider trust history

Trust Admin may perform:

- warn provider
- hold trust impact
- recommend feature restriction
- request provider clarification
- escalate to Security or Audit Admin
- restore low-risk trust hold where allowed

Trust Admin must not perform alone:

- permanent provider removal
- sensitive vault access
- compliance lock release
- admin permission grant or removal
- irreversible trust deletion

## 90. Complaint Review Admin Rule

Complaint Review Admin may access:

- complaint governance queue
- complaint timeline
- linked receipt or service summary
- customer or provider responses
- revisit status

Complaint Review Admin may perform:

- request more evidence
- request provider response
- reopen complaint for fairness reason
- mark closure review
- link complaint to trust case
- close complaint admin review with reason

Complaint Review Admin must not perform:

- provider final removal
- payment or legal dispute judgement
- customer vault browsing
- receipt ownership transfer
- security or privacy incident closure

## 91. Security and Audit Admin Rule

Security or Audit Admin may access:

- audit logs
- privacy cases
- vault access review cases
- sensitive evidence where needed
- high-risk claim conflicts
- incident review cases

Security or Audit Admin may perform:

- apply security review lock
- review privacy incident
- audit suspicious admin access
- escalate to Super Admin
- approve high-risk correction where allowed

Security or Audit Admin must not perform casually:

- rewrite customer history
- delete audit logs
- grant themselves permissions
- bypass customer consent
- release old records without verification

## 92. Super Admin / Irreversible Action Rules

Super Admin is final governance authority.

Super Admin may access:

- admin permission management
- governance settings
- high-risk cases
- irreversible action requests
- incident mode approval

Super Admin may perform:

- grant admin roles
- remove admin roles
- approve irreversible actions where policy allows
- approve incident mode
- approve high-risk governance changes

Super Admin must not:

- bypass audit
- delete audit history
- casually rewrite user truth
- use broad unrestricted action without case reason
- approve own high-risk action without secondary review
- use production powers for testing
- bypass evidence review

## 93. High-Risk Action Rule

High-risk actions require stronger control.

Examples:

- permanent provider removal
- irreversible claim override
- sensitive vault correction
- admin role grant or removal
- incident mode activation
- high-risk bulk action
- final trust penalty lock

High-risk actions should require:

- evidence review
- permission check
- stronger approval
- audit
- appeal path where allowed

## 94. Bulk Action Safety Rules

Bulk actions must be rare.

Bulk action requires:

- clear target filter
- preview
- affected count
- rollback / recovery plan where possible
- second approval
- audit
- post-action review

Bulk action must not:

- delete customer vault data
- close complaints blindly
- restrict providers without case
- approve claims automatically
- correct receipts without review

## 95. Incident / Crisis Response

Incident mode may apply to:

- large fake receipt attack
- mass wrong-access claim risk
- provider fraud cluster
- serious customer privacy exposure
- coordinated complaint abuse
- admin permission misuse
- app-wide trust issue

Incident mode must:

- be time-bounded
- be senior-governed
- preserve audit
- avoid permanent bulk punishment without review
- include post-incident review

## 96. Final Boundary Rule

Admin permission system must remain:

- least-privilege
- role-bounded
- case-linked
- privacy-safe
- audit-traceable
- never broad-access by default

# PART 9 — EVIDENCE, AUDIT, DATA MODEL, NOTIFICATIONS AND UX RULES

## 97. Evidence / Proof Review Model

Evidence may include:

- service record
- bill / receipt snapshot
- complaint record
- revisit record
- customer confirmation
- provider response
- technician update
- historical claim match
- customer unique ID
- phone bridge evidence
- duplicate record signal
- rating record
- audit / timeline event

Evidence classification:

- normal
- privacy_sensitive
- customer_vault_sensitive
- receipt_sensitive
- complaint_sensitive
- admin_sensitive
- incident_sensitive

Rule:

Evidence supports decision.

Evidence does not automatically decide outcome.

## 98. Audit Log Requirement

Audit required for:

- case creation
- evidence view
- correction
- source label change
- receipt decision
- complaint routing correction
- claim approval / rejection
- provider warning
- provider restriction
- restore
- appeal decision
- permission change
- incident activation
- irreversible action

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

## 99. Data Model

### 99.1 ADMIN_CASE

Fields:

- admin_case_id
- case_type
- primary_domain
- affected_role
- affected_provider_context_optional
- target_record_type
- target_record_id
- severity
- case_status
- assigned_admin_id_optional
- evidence_summary
- created_at
- updated_at

### 99.2 ADMIN_ACTION

Fields:

- admin_action_id
- admin_case_id
- action_type
- target_type
- target_id
- admin_id
- admin_role
- reason
- before_state_optional
- after_state_optional
- created_at

### 99.3 ADMIN_EVIDENCE

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

### 99.4 ADMIN_APPEAL_REVIEW

Fields:

- appeal_id
- original_admin_case_id
- original_action_id_optional
- appellant_role
- appellant_user_id
- appeal_reason
- new_evidence_refs_optional
- appeal_status
- assigned_reviewer_admin_id
- appeal_outcome_optional
- created_at
- updated_at

### 99.5 ADMIN_AUDIT_LOG

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

## 100. Source Truth Labels

`admin_source_type` allowed values:

- customer_report
- provider_report
- system_flag_future
- support_review_future
- admin_created_case
- appeal_submitted
- privacy_review_needed
- receipt_integrity_review_needed
- local_demo_record

## 101. Notification / Alert Contract

Admin alerts:

- new_admin_case_created
- complaint_review_needed
- receipt_integrity_review_needed
- claim_privacy_review_needed
- provider_review_needed
- customer_vault_privacy_alert
- trust_abuse_signal
- appeal_submitted
- irreversible_action_requested
- permission_change_requested
- incident_mode_requested
- audit_gap_detected

Admin alerts must remain hidden from normal user UI.

Customer / provider should receive only safe case-status notifications where future-approved.

## 102. Privacy / Data Boundary

Admin System must protect:

- customer vault data
- household privacy
- provider private data
- complaint sensitive details
- receipt sensitive details
- claim review evidence
- audit records

Admin evidence access must be:

- role-scoped
- case-scoped
- audit-tracked
- least-privilege

## 103. UX Quality Rules

Admin UX must be:

- queue-based
- evidence-aware
- permission-aware
- audit-visible
- non-emotional
- action-bounded
- privacy-first
- enterprise-grade

Admin first-read must answer:

- What case needs review?
- Which record is affected?
- What evidence exists?
- What action is allowed?
- What action requires escalation?
- What privacy risk exists?
- What audit will be recorded?

## 104. Empty States

Admin case queue empty state:

- No admin cases open.
- Governance, privacy, receipt, complaint, and provider review cases will appear here.

## 105. Final Boundary Rule

Admin System must remain:

- hidden
- case-based
- evidence-aware
- least-privilege
- audit-traceable
- appeal-aware
- privacy-safe
- enterprise-grade
