# HOMEFIX MITRA — HISTORICAL CLAIM AND CUSTOMER VAULT PRIVACY

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Historical Claim and Customer Vault Privacy defines how HomeFix Mitra handles old service records, possible matches, ownership verification, claim approval, customer vault privacy, household privacy and wrong-access protection.

Historical records are sensitive because they may include service history, customer identity, property, appliance, provider, complaint and bill / receipt context.

This architecture must remain:

- privacy-first
- customer-controlled
- claim-safe
- ownership-aware
- source-labelled
- provider-context-safe
- wrong-access protected
- Phase-0 demo-safe
- enterprise-grade

## 3. Core Principle

Old records must not be released by phone number alone.

Customer vault privacy wins over convenience.

Historical claim must protect both:

- customer access to own old service memory
- prevention of wrong customer / wrong household / wrong provider access

## 4. What Historical Claim Is

Historical Claim is:

- a safe old-record discovery flow
- a match review system
- an ownership verification process
- a customer-controlled claim experience
- a bridge between old records and customer service memory
- a privacy-protected migration path
- a future support-assisted review model

## 5. What Historical Claim Is Not

Historical Claim is not:

- automatic release by phone number
- provider-owned customer data dump
- public record lookup
- address-based exposure system
- legal proof system in Phase-0
- identity verification authority in Phase-0
- admin override without governance
- uncontrolled import of sensitive records

## 6. What Customer Vault Privacy Is

Customer Vault Privacy is the rule set that protects:

- customer profile memory
- property records
- appliance records
- service history
- bills / receipts
- complaints
- revisits
- historical claims
- household-sensitive information
- provider access boundaries

## 7. What Customer Vault Privacy Is Not

Customer Vault Privacy is not:

- provider convenience layer
- shop staff browsing permission
- customer data marketplace
- real cloud vault authority in Phase-0
- automatic household sharing
- unrestricted provider lookup

## 8. Hard Non-Mixing Rule

Historical claim must not mix records across:

- different customers
- different households
- unrelated phone numbers
- unrelated properties
- unrelated appliances
- Independent Technician source
- Shop Owner source
- Shop Technician assignment context
- admin hidden review data

Claimed old records must preserve original source labels.

## 9. Non-App Claim and Continuity Boundary Rule

Customer app installation must not be mandatory for basic complaint handling, service follow-up or provider-side continuity.

However, adding historical records into the customer vault requires customer-controlled claim action through an approved claim path.

A non-app customer may be supported through safe receipt link, service link, provider-side entry or future support-assisted continuity where supported.

Non-app continuity must not unlock:

- full customer vault
- historical records by phone match alone
- unrelated service history
- household records
- provider internal notes
- admin evidence

App installation may be invited as optional value:

- save service records
- find old bills later
- claim historical records safely
- manage service memory

App install must never be framed as mandatory pressure for complaint acceptance or basic service continuity.

## 10. Provider-Initiated Claim Boundary Rule

Provider may help create or identify a possible historical record, but provider must not force that record into the customer vault.

Provider may not claim customer ownership on behalf of the customer unless a future support-assisted process explicitly allows a limited, audited action.

Provider-initiated historical links must remain:

- customer-reviewable
- source-labelled
- privacy-safe
- limited to safe summary before claim
- non-final until customer action or approved verification

Provider must not use historical claim as:

- customer vault access shortcut
- marketing list builder
- old-customer data dump
- automatic repeat-service control
- proof of customer relationship without customer confirmation

# PART 1 — CLAIM ENTRY, FLOW AND VERIFICATION RULES

## 11. Claim Entry Points

Customer may start claim from:

- Customer Home
- Service History
- Bills / Receipts
- Claim Records page
- Provider Detail where safe
- appliance / property page where claim is context-linked
- onboarding / first-time setup where safe

Provider may not force old record claim into customer vault without customer action.

## 12. Claim Flow States

`historical_claim_status` allowed values:

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

## 13. Valid Claim Transitions

- not_started to search_started
- search_started to possible_match_found / no_match_found
- possible_match_found to customer_review_needed
- customer_review_needed to ownership_verification_needed / claim_submitted / skipped
- ownership_verification_needed to verification_pending
- verification_pending to claim_submitted / support_review_needed
- claim_submitted to claim_approved / claim_rejected / support_review_needed
- claim_approved to claim_success
- no_match_found to retry_later
- skipped to retry_later
- retry_later to search_started

## 14. Blocked Claim Transitions

Blocked:

- possible_match_found to claim_success without customer review
- phone_match_only to claim_success
- provider_suggested_record to customer vault added without customer action
- support_review_needed to claim_approved without audit in future production
- claim_rejected to claim_success without re-review
- old record to provider-owned new record without source label
- claimed record to legally verified in Phase-0
- customer app not installed to claim rejection automatically
- phone match to full historical record preview

## 15. Match Found Rule

Possible match found means:

- system found a possible old record
- record is not yet owned by the current customer account
- customer must review safe summary
- verification may be required
- full sensitive details should remain hidden until claim is safe

Possible match must show only safe preview:

- service category
- approximate date / period
- provider context
- appliance / property label if safe
- masked phone / partial reference where safe
- claim confidence label

Must not show:

- full address before verification
- other household member details
- provider private notes
- complaint sensitive details before claim
- unrelated customer data

## 16. No Match Found Rule

No match found means:

- no safe matching record found
- customer may retry later
- customer may add local record manually
- future support-assisted claim may be available where approved

No match must not imply:

- customer never had service
- provider has no record
- app failed permanently
- record is deleted

## 17. Ownership Verification Rule

Ownership verification may use multiple safe signals:

- customer unique ID
- masked / matched phone bridge
- bill / receipt reference
- service date / period
- appliance / product details
- property nickname / safe address clue
- provider context confirmation
- support-assisted review where future-approved

Phone number alone is not enough.

## 18. Phone Number Bridge Rule

Phone number may help connect old records to possible customer.

Phone number may be used as:

- match hint
- customer search signal
- support review clue
- partial confidence signal

Phone number must not be used as:

- sole ownership proof
- automatic release trigger
- full record unlock key
- household member exposure key

## 19. Customer Unique ID Logic

Customer unique ID may support continuity.

It should:

- identify customer account within app
- help link future records
- reduce duplicate customer profiles
- support safe claim matching
- avoid phone-only dependence

It must not:

- expose private records publicly
- replace verification for sensitive records
- allow provider to browse customer vault
- become legal identity proof in Phase-0

## 20. Support-Assisted Claim Review

Future support-assisted review may be used when:

- match confidence is low
- record has privacy sensitivity
- wrong-access risk exists
- customer and provider record details conflict
- household / shared phone ambiguity exists
- provider source is unclear

Support review must be:

- case-based
- evidence-aware
- audit-tracked
- privacy-limited
- appeal / re-review aware

Phase-0 may only simulate this safely.

## 21. Claim Success Rule

Claim success means:

- old record is linked into customer service memory
- source label is preserved
- provider context is preserved
- customer can review record
- record may appear in service history
- complaint / repeat-service / receipt detail may unlock where safe

Claim success does not mean:

- legal verification
- payment verification
- government verification
- provider liability confirmation
- admin final enforcement in Phase-0

## 22. Claim Rejection Rule

Claim may be rejected when:

- ownership cannot be established
- record appears to belong to someone else
- provider source conflicts
- privacy risk is too high
- customer details do not match enough
- support review rejects claim

Claim rejection must allow:

- safe explanation
- retry where allowed
- support review where future-approved
- local record creation where safe

## 23. Retry / Skip / Later Rule

Customer may:

- retry search
- skip match
- claim later
- add local record
- request support review where future-approved

Customer must not be forced to accept uncertain records.

Skipping must not delete original possible match unless user chooses local cleanup where safe.

# PART 2 — SAFE SUMMARY, CLAIM CONFLICT AND ACCESS-LEVEL RULES

## 24. Safe Summary Rule

Before successful verification, user must see only a safe summary.

Safe summary may include:

- provider or shop name
- service category
- approximate month or date
- count of possible records
- verification-required label
- masked phone fragment if safely needed
- generic property or appliance label if safely needed

Safe summary must not expose:

- full bill image
- full address
- detailed complaint history
- private provider notes
- household member details
- unrelated customer records

## 25. Duplicate Claim Conflict Rule

If the same historical record is claimed by multiple customers:

- do not auto-release
- preserve both claim attempts
- pause final release where needed
- review claim evidence
- avoid exposing one customer’s data to another
- approve, deny or escalate based on evidence

Do not auto-merge.

Do not auto-release.

## 26. Claim Access-Level Rule

Historical claim visibility may use access levels such as:

- preview_only
- customer_review_only
- verification_pending
- support_review_only
- claim_success_visible
- restricted_sensitive

Before verification, only preview-safe level is allowed.

After successful claim, customer-safe full history may be shown according to product rules.

# PART 3 — HOUSEHOLD, PROPERTY, APPLIANCE AND VAULT PRIVACY RULES

## 27. Household Privacy Rule

Home service records may involve households.

Household privacy risks:

- shared phone numbers
- family members
- rental homes
- old tenant records
- shared appliance service
- previous owner records
- shop customer records under same number

Rules:

- do not auto-release household records by phone
- use safe preview
- require confirmation
- avoid showing full address before ownership confidence
- protect previous tenant / owner privacy
- support support-assisted review where future-approved

## 28. Property Privacy Rule

Property records may include sensitive location details.

Customer vault should protect:

- full address
- property nickname
- service history
- appliance identity
- complaint history
- provider visit history

Provider access must be service-context-bound.

Provider must not browse all property history.

## 29. Appliance Privacy Rule

Appliance records may include:

- appliance type
- brand / model
- service history
- warranty notes
- complaint history
- repeat-service context

Provider may see only appliance details relevant to own service / request.

Provider must not see unrelated appliances.

## 30. Customer Vault Ownership Rule

Customer vault belongs to Customer.

Providers may access only:

- service records linked to their own service
- receipt records they issued / are responsible for
- complaint / revisit records linked to their service
- appliance / property context needed for assigned service
- customer-provided request details

Providers must not access:

- full customer vault
- unrelated property records
- unrelated appliance records
- other provider service history
- household-sensitive claim details
- admin / support review notes

## 31. Provider Context Privacy Rule

Independent Technician sees only independent-source records linked to self.

Shop Owner sees only shop-source records linked to own shop.

Shop Technician sees only assigned shop-context records.

Admin / support sees only case-scoped data where future-approved.

## 32. Record Access Level Rule

Record access levels may include:

- owner_only
- shared_property
- household_shared
- provider_limited
- admin_case_limited
- support_limited
- restricted_sensitive

Household sharing must remain permission-based, not assumed.

## 33. Private Note Safety Rule

Customer private notes must be treated as sensitive.

Provider must never see customer private notes.

Support or admin should not see private notes unless a case requires it and permission allows.

# PART 4 — WRONG-ACCESS PROTECTION, SUPPORT GOVERNANCE AND AUDIT RULES

## 34. Wrong-Access Protection Rule

Wrong-access risk must be considered when:

- phone number changed
- shared phone used
- property changed owner / tenant
- provider has duplicate customer
- old record imported from shop
- claim match confidence is low
- customer disputes source
- record contains sensitive complaint details

Wrong-access protection may include:

- masked preview
- verification required
- support review
- claim hold
- rejection
- audit event
- customer correction path

## 35. Wrong Record Access Review Rule

If customer sees a record that may not belong to them:

- pause final access where possible
- review source
- check claim or acceptance history
- preserve evidence
- remove or limit access if wrong
- notify safely
- audit before and after state

## 36. Support and Admin Governance Rule

Support or admin may review historical-claim or vault cases only when:

- a case exists
- the review is relevant to that case
- role permission allows access
- access is privacy-scoped
- review is audit-tracked

Support or admin must not browse customer vault casually.

## 37. Audit Rule

Sensitive claim and vault actions should preserve audit history such as:

- who viewed sensitive claim case
- who changed claim status
- who approved or rejected claim
- who limited access
- who restored access
- when decision changed
- why decision changed

# PART 5 — CLAIM NOTIFICATIONS, SAFE WORDING AND FINAL BOUNDARY RULES

## 38. Claim Notification Contract

Customer notifications:

- claim_search_started
- possible_match_found
- no_match_found
- ownership_verification_needed
- claim_submitted
- support_review_needed
- claim_approved
- claim_rejected
- claim_success
- retry_available

Provider notifications where future-approved:

- customer_claimed_record
- claim_source_review_needed
- claim_dispute_opened
- support_review_requested

Admin / support future notifications:

- claim_privacy_review_needed
- wrong_access_risk_detected
- low_confidence_claim_review
- claim_appeal_submitted

## 39. Safe Claim Wording

Good examples:

- A possible old service record was found.
- Please confirm this record belongs to you.
- This record needs review before it can be added.
- Your old service record was added to your service history.
- You can skip this and claim it later.

Avoid wording that implies:

- record unlocked by phone number
- legally verified record
- government verified ownership
- provider-approved ownership
- guaranteed claim success
- customer vault unlocked for provider
- app install required before any service follow-up

## 40. Final Boundary Rule

Historical claim and customer vault privacy must remain:

- privacy-first
- verification-aware
- customer-controlled
- source-truth preserving
- wrong-access protected
- provider-limited
- audit-friendly
- never phone-number-only for final ownership
