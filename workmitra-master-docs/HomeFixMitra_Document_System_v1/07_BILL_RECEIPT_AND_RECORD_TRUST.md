# HOMEFIX MITRA — BILL RECEIPT AND RECORD TRUST

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Bill Receipt and Record Trust defines the receipt-first service memory, source truth, correction, dispute, duplicate protection and record-trust architecture of HomeFix Mitra.

Bills and receipts are the backbone of HomeFix Mitra because they connect:

- customer memory
- provider source
- service history
- complaints
- revisits
- repeat service
- rating
- historical claim
- trust continuity

## 3. Core Principle

Receipt truth must protect service memory.

A bill / receipt is not just a document. It is a source-linked service memory anchor.

Every receipt must clearly answer:

- who issued it
- which customer it belongs to
- which service it belongs to
- which provider context owns it
- whether customer accepted it
- whether it was disputed
- whether it was corrected
- whether complaint / revisit exists
- whether it is local demo, claimed, imported or provider-issued

## 4. What Bill / Receipt Trust Is

Bill / Receipt Trust is:

- receipt-first service memory
- provider source truth
- customer review and acceptance flow
- correction and dispute control
- duplicate / fake protection
- complaint and revisit linking
- service history anchor
- trust-impact foundation

## 5. What Bill / Receipt Trust Is Not

Bill / Receipt Trust is not:

- real legal invoice verification in Phase-0
- payment proof system in Phase-0
- tax filing system
- accounting system
- provider-controlled customer vault
- fake verified bill system
- irreversible truth without correction
- public dispute wall

## 6. Hard Non-Mixing Rule

A receipt must not lose its provider context.

Independent Technician receipt remains independent-source receipt.

Shop Owner receipt remains shop-source receipt.

Shop Technician may contribute service updates but does not own shop receipt truth.

Customer local receipt remains customer-local record until linked / accepted / claimed through allowed rules.

## 7. Phone Number and Receipt Ownership Boundary Rule

Phone number may support receipt delivery, continuity lookup and customer contact reference.

Phone number must not be used as final ownership proof.

Phone number must not automatically unlock:

- historical records
- full customer vault
- property records
- appliance records
- household records
- other-provider service history

A receipt created or shared using a phone number must not become strong customer-owned history until the customer accepts it or it passes an approved claim / verification flow.

Phone number is a continuity bridge, not proof of receipt ownership.

## 8. Non-App Receipt Continuity Rule

Customer app installation must not be mandatory for a receipt, bill, complaint link or service follow-up to exist.

A non-app customer may receive or review a receipt through a secure receipt link, service link, provider-side entry or future support-assisted flow where supported.

Non-app receipt continuity must remain:

- source-linked
- limited to the relevant receipt or service
- privacy-safe
- value-first
- not pressure-based

Non-app receipt continuity must not unlock:

- full customer vault
- historical records by phone match alone
- unrelated service history
- household data
- provider internal notes
- admin evidence

App install invitation may be shown only as optional value:

- save receipts
- find bills later
- track complaints more easily
- preserve service memory

## 9. Receipt Source Contexts

`receipt_source_context` allowed values:

- customer_local_record
- independent_technician_issued
- shop_owner_issued
- historical_claimed_record
- imported_demo_record
- support_corrected_future

## 10. Receipt Status Model

`receipt_status` allowed values:

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

## 11. Receipt Trust State

`receipt_trust_state` allowed values:

- local_demo
- customer_entered
- provider_issued
- customer_accepted
- disputed
- corrected
- claimed_historical
- support_reviewed_future
- invalid_or_rejected

## 12. Receipt Lifecycle

Typical receipt lifecycle:

- draft
- issued
- pending_customer_review
- accepted
- archived

Dispute / correction lifecycle:

- issued
- pending_customer_review
- disputed
- correction_requested
- corrected
- pending_customer_review
- accepted

Historical claim lifecycle:

- possible_match
- customer_review
- verification_needed
- claim_submitted
- claim_approved
- claimed_historical
- accepted / disputed / archived

## 13. Valid Transitions

- draft to issued
- issued to pending_customer_review
- pending_customer_review to accepted
- pending_customer_review to disputed
- disputed to correction_requested
- correction_requested to corrected
- corrected to pending_customer_review
- accepted to archived
- disputed to rejected where allowed
- customer_entered to archived / deleted_local
- claimed_historical to accepted / disputed / archived

## 14. Blocked Transitions

Blocked:

- disputed to accepted without customer review
- corrected to accepted without customer review where required
- shop receipt to independent receipt silently
- independent receipt to shop receipt silently
- technician update to final shop receipt truth
- receipt accepted to legally verified in Phase-0
- receipt issued to payment completed in Phase-0
- receipt deleted to complaint history deleted silently
- receipt corrected to old receipt snapshot erased
- phone match to historical receipt release automatically
- customer app not installed to receipt rejection automatically
- provider-issued receipt to full customer vault access

## 15. Receipt Ownership Rules

### 15.1 Customer Local Record

Customer may create local service memory or receipt note.

Customer local record:

- belongs to customer
- may not be provider-confirmed
- may be used for memory
- may later link to provider / claim flow where allowed

### 15.2 Independent Technician Receipt

Independent Technician owns receipt issue / correction responsibility for independent service.

Customer owns acceptance / dispute / complaint action.

### 15.3 Shop Owner Receipt

Shop Owner owns receipt issue / correction responsibility for shop service.

Shop Technician may contribute details where allowed but does not own receipt truth.

### 15.4 Historical Claimed Record

Historical claimed record must preserve:

- source label
- claim confidence
- verification path
- customer acceptance / dispute state
- provider context where known

## 16. Receipt-First Service Memory Rule

A completed service should preferably link to a receipt / bill record.

Receipt may link to:

- customer
- provider
- service record
- property
- appliance
- complaint
- revisit
- rating
- claim record

Receipt must not link to:

- unrelated customer data
- unrelated provider internal notes
- admin hidden evidence
- other customer records

## 17. Service Linking Logic

Receipt should link to service record through:

- service_record_id
- customer_id
- provider_context
- original_service_source_id
- property_id_optional
- appliance_id_optional
- service_date
- source_label

If service record does not exist:

- receipt may create local service memory
- receipt may remain pending link
- user may attach to property / appliance later

## 18. Complaint Linking Logic

Complaint may link to receipt when:

- complaint is about bill / receipt issue
- complaint is about service tied to receipt
- revisit is linked to complaint
- dispute / correction is active

Receipt detail should show:

- complaint exists
- complaint status
- revisit status
- resolution status

## 19. Correction Rules

Receipt correction must preserve:

- original receipt snapshot
- corrected receipt version
- correction reason
- actor
- timestamp
- customer review status
- linked complaint / dispute if any

Correction must not:

- overwrite accepted truth silently
- erase dispute history
- erase provider source
- erase old amount / service detail snapshot
- auto-close complaint unless rule allows

## 20. Dispute Rules

Customer may dispute receipt when:

- amount / detail appears wrong
- wrong appliance / property linked
- wrong provider source
- service not recognized
- duplicate / fake concern
- correction needed

Dispute must preserve:

- disputed field / summary
- customer reason
- provider response where applicable
- correction / re-review state

Dispute must not become public accusation automatically.

## 21. Duplicate Protection Rules

Possible duplicate receipt may be detected by:

- same provider
- same customer
- same service date
- same appliance / property
- same amount reference
- same receipt number / label where available
- similar service title

Duplicate handling states:

- no_duplicate
- possible_duplicate
- customer_review_needed
- provider_review_needed
- merged_reference
- kept_separate
- rejected_duplicate

Duplicate handling must not:

- merge records without customer clarity
- delete receipt history silently
- mix independent and shop receipt sources
- hide complaint / dispute linkage

## 22. Fake / Suspicious Receipt Rules

Suspicious receipt handling may apply when:

- customer denies receipt
- provider source does not match
- same receipt appears for multiple customers
- service source is unclear
- claim request appears unsafe
- receipt metadata conflicts

Phase-0 may only label demo/local suspicion safely.

Future production requires:

- support / admin review
- evidence
- audit
- appeal / correction path

## 23. Customer Acceptance Rule

Customer acceptance means:

- customer agrees receipt belongs to service memory
- record can appear as accepted service memory
- complaint / rating / repeat-service options may unlock where rules allow

Customer acceptance does not mean:

- legal verification
- payment verification
- tax validation
- provider identity verification
- warranty guarantee unless separately recorded

## 24. Provider Receipt Responsibility Rule

Provider must not issue misleading receipt.

Provider receipt should preserve:

- service summary
- customer link
- property / appliance link where known
- provider context
- correction history
- customer review state

Provider must not:

- force customer acceptance
- change accepted receipt silently
- delete disputed receipt history
- claim legal bill authority in Phase-0
- use receipt delivery as customer app install pressure
- use receipt phone number to browse the customer vault

## 25. Provider and Customer Vault Boundary Rule

Receipt sharing does not give the provider ownership of the customer vault.

Provider may access only receipt-linked and service-linked context needed for the relevant workflow.

Provider must not access:

- unrelated customer records
- household data
- other-provider service history
- private customer notes
- historical records before approved claim / verification
- admin evidence

Customer vault remains customer-controlled.

# PART 2 — RECEIPT DETAIL, TRUST STRIP, VERSION HISTORY AND REVIEW SAFETY RULES

## 26. Receipt Detail UX Rule

Receipt detail must help the user understand:

- why this receipt exists
- who created or issued it
- which provider context owns it
- what service it belongs to
- whether customer accepted it
- whether complaint or revisit exists
- whether correction happened
- what safe next action is available

Receipt detail must stay source-clear and low-confusion.

## 27. Receipt Trust Strip Rule

Provider-issued receipt should show a trust strip containing only safe truth such as:

- provider name
- provider type
- provider context
- receipt source label
- receipt review state
- complaint-linked indicator where applicable
- claimed / local / imported label where applicable

Trust strip must not fake:

- legal verification
- payment guarantee
- government validation
- hidden admin certainty

## 28. Version History Rule

Material correction should preserve visible version history.

Version-aware receipt history may include:

- original version
- corrected version
- changed fields
- actor
- timestamp
- correction reason
- customer review state after correction

Version history must not be silently erased.

## 29. Review Safety Rule

Receipt review must remain customer-safe.

Customer should never be pushed into blind acceptance.

Safe actions may include:

- accept
- dispute
- request correction
- save for later
- view linked service
- view linked complaint

## 30. Rating and Trust Impact

Receipt may affect rating / trust when:

- service completed
- receipt accepted
- complaint resolved
- revisit completed
- correction handled properly

Receipt dispute may affect trust only through fair, evidence-aware logic.

Receipt issue alone must not punish provider automatically without context.

# PART 3 — RECEIPT SCREENS, ADMIN REVIEW AND DATA MODEL RULES

## 31. Bill / Receipt Screens

### 31.1 Customer Bills / Receipts

Shows:

- pending receipts
- accepted receipts
- disputed receipts
- corrected receipts
- rejected / archived receipts
- linked service / complaint status

### 31.2 Customer Receipt Detail

Shows:

- receipt source
- provider context
- service link
- appliance / property link
- review status
- correction history
- dispute action
- complaint link
- trust-safe source label

### 31.3 Provider Receipt Center

Shows:

- draft receipts
- issued receipts
- customer pending review
- accepted receipts
- disputed receipts
- correction requested
- corrected receipts
- archived receipts

### 31.4 Provider Receipt Detail

Shows:

- receipt source
- customer review state
- linked service
- dispute / correction state
- complaint link
- allowed provider actions

### 31.5 Admin / Support Receipt Review

Hidden future governance screen for:

- suspicious receipt
- duplicate review
- claim privacy issue
- source correction
- dispute escalation

## 32. Admin / Support Review Boundary

Admin or support review may later be needed when:

- duplicate suspicion cannot be resolved normally
- fake receipt concern exists
- wrong provider source is suspected
- claim/privacy issue intersects with receipt
- customer and provider disagree after correction
- repeated unsafe receipt pattern exists

This review must remain:

- hidden from normal user UI
- case-based
- evidence-aware
- audit-tracked

Admin / support receipt review must not become:

- public accusation
- automatic punishment
- payment settlement
- legal invoice certification
- visible normal user workflow

## 33. Receipt Data Model

### 33.1 BILL_RECEIPT_RECORD

Fields:

- bill_receipt_id
- customer_id
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

### 33.2 RECEIPT_CORRECTION_HISTORY

Fields:

- receipt_correction_id
- bill_receipt_id
- changed_fields
- previous_values
- new_values
- correction_reason
- actor_role
- actor_id
- created_at

### 33.3 RECEIPT_DUPLICATE_REVIEW

Fields:

- duplicate_review_id
- bill_receipt_id
- duplicate_status
- compared_record_refs
- review_reason
- actor_role_optional
- created_at
- updated_at

## 34. Notification / Alert Contract

Customer notifications:

- receipt_ready
- receipt_pending_review
- receipt_accepted
- receipt_disputed
- correction_requested
- receipt_corrected
- receipt_rejected
- duplicate_review_needed
- receipt_linked_to_service
- receipt_claim_approved

Provider notifications:

- receipt_review_pending
- receipt_accepted_by_customer
- receipt_disputed_by_customer
- correction_requested_by_customer
- corrected_receipt_review_pending
- duplicate_review_needed
- complaint_linked_to_receipt

Admin / Support future notifications:

- suspicious_receipt_review_needed
- duplicate_receipt_review_needed
- receipt_source_dispute_opened
- claim_receipt_privacy_review_needed

## 35. Safe Receipt Wording

Good examples:

- Receipt is ready for review.
- Customer accepted this receipt.
- Customer requested a correction.
- Corrected receipt is waiting for customer review.
- This record is linked to a service complaint.

Avoid wording that implies:

- legally verified
- payment guaranteed
- tax approved
- government verified
- customer vault unlocked
- complaint rejected because app is not installed
- receipt accepted by phone match alone

## 36. Final Boundary Rule

Bill, receipt and record-trust governance must remain:

- source-linked
- correction-safe
- dispute-capable
- duplicate-aware
- version-preserved
- customer-review aware
- trust-safe
- customer-vault-safe
- not a payment or legal-verification system
