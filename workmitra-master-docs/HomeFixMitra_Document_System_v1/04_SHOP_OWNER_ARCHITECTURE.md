# HOMEFIX MITRA — SHOP OWNER ARCHITECTURE

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Shop Owner Architecture defines the shop-side provider domain of HomeFix Mitra.

Shop Owner is the provider context where the shop owns the service relationship, receipt / bill truth, complaint responsibility, customer continuity and technician coordination for services performed under shop context.

Shop Owner Architecture must remain:

- shop-owned
- bill / receipt responsible
- customer-continuity focused
- complaint-responsible
- technician-coordination aware
- service-memory aware
- role-separated
- trust-first
- privacy-safe
- Phase-0 demo-safe

## 3. Core Principle

Shop Owner = shop-side service source and relationship owner.

The Shop Owner owns:

- shop profile truth
- shop-issued bill / receipt truth
- shop service record ownership
- shop customer relationship continuity
- shop complaint ownership
- shop revisit coordination
- Shop Technician assignment context
- shop-side service trust

A Shop Owner who personally performs service still remains Shop Owner in product truth.

## 4. What Shop Owner Architecture Is

Shop Owner Architecture is:

- the shop-side provider flow
- the shop receipt / bill ownership model
- the shop complaint ownership model
- the shop technician coordination model
- the shop service history continuity model
- the shop customer relationship layer
- the shop trust / profile / public-card model
- the shop-side operations entry point

## 5. What Shop Owner Architecture Is Not

Shop Owner Architecture is not:

- Independent Technician architecture
- Shop Technician personal provider ownership
- customer vault ownership
- admin governance console
- payment processing system in Phase-0
- legal bill verification system in Phase-0
- unrestricted staff surveillance
- public social review feed
- hidden dispatch system unless explicitly enabled later

## 6. Hard Non-Mixing Rule

Shop Owner must never be silently treated as Independent Technician.

Shop Technician must never become the owner of shop service truth just because they performed the visit.

If a Shop Owner personally performs the service, the provider context remains:

- `shop_owner_service`

Shop service truth must not silently become:

- independent technician service truth
- shop technician-owned service truth
- customer-owned provider truth
- admin-governance truth without case reason

## 7. Role Fit

### 7.1 Shop Owner

Shop Owner uses HomeFix Mitra to:

- manage shop profile
- manage shop-side service records
- issue and correct shop receipts
- manage complaint response under shop ownership
- assign or coordinate Shop Technicians
- preserve repeat-customer continuity
- manage revisit follow-up under shop ownership
- view operational status where allowed
- preserve shop trust and service memory

### 7.2 Customer

Customer sees Shop Owner / shop as:

- shop-side service source
- receipt issuer for shop service
- complaint owner for shop service
- revisit owner for shop service
- repeat-service destination for shop service

### 7.3 Shop Technician

Shop Technician may perform work under shop authority, but does not own:

- shop receipt truth
- shop complaint truth
- shop customer relationship
- shop provider identity

### 7.4 Independent Technician

Independent Technician remains separate from shop-owned service truth.

### 7.5 Admin

Admin may review Shop Owner issues only through hidden governance flow.

Admin must not appear inside normal Shop Owner workflow.

## 8. Shop Owner Customer-App Boundary Rule

Shop Owner flow must not require the customer to install HomeFix Mitra before a service, receipt, complaint or follow-up can exist.

Shop Owner may invite the customer to install the app only after value is clear.

Safe invitation sequence:

1. service happens
2. shop bill, receipt or service record is created
3. customer sees value
4. app install becomes optional and useful

Shop Owner must not use app install as pressure.

Do not imply:

- complaint cannot be accepted without the customer app
- service follow-up is impossible without the customer app
- old records are automatically unlocked by phone number
- shop can view the full customer vault after customer install

## 9. Phone Number and Customer Lookup Boundary Rule

Phone number may be used for receipt delivery, customer contact continuity and shop service recall.

Phone number must not be used as final ownership proof.

Phone number must not unlock customer vault data.

Phone number must not reveal:

- full customer service history
- property list
- appliance list
- household records
- other-provider records
- historical records before safe claim verification

If a phone match exists, the system may show only safe continuity labels where approved.

Phone number remains a continuity bridge, not ownership proof.

## 9.1 Shop Owner Identity and Active Context Rule

Shop Owner profile must link to the same permanent `hfmId` defined in Core Master Truth and Cross-Domain System Rules.

Shop Owner side must treat:

- `hfmId` as the permanent person/account identity
- `shopOwnerProfileId` as the shop owner workspace/profile identity
- `activeRoleContext = shopOwner` as the current shop owner workspace mode
- `providerContext = shop_owner_service` as the source truth for shop-owned service records

Shop Owner records must preserve shop context and must not mix with Customer, Independent Technician or Shop Technician workspaces.

Shop Owner records may store:

- `hfmId`
- `shopOwnerProfileId`
- `activeRoleContext = shopOwner`
- `providerContext = shop_owner_service`
- `sourceContext`
- `sourceRecordId` where needed

Shop Owner UI may show `hfmId` as:

- HomeFix Mitra ID
- Your HomeFix Mitra ID

Shop Owner UI may show shop-specific profile reference where needed, but must not create a second duplicate public permanent person identity.

If the same person also has Customer, Independent Technician or Shop Technician profiles, those profiles must remain separate role workspaces under the same `hfmId`.

Shop Owner service records must remain shop-context records even when the same person previously worked as Independent Technician or Shop Technician.

A Shop Owner who personally performs service still remains under `activeRoleContext = shopOwner` and `providerContext = shop_owner_service`.

# PART 1 — SHOP OWNER SCREEN-BY-SCREEN ARCHITECTURE

## 10. Shop Owner Screen-by-Screen Architecture

### 10.1 Shop Owner Home

Shows:

- today’s work summary
- pending service queue
- pending receipt actions
- complaint / revisit status
- technician activity summary
- repeat-customer continuity summary
- trust / profile readiness
- quick links to bills, jobs and customers

### 10.2 Shop Service Requests / Jobs

Shows:

- new requests
- accepted jobs
- scheduled work
- in-progress work
- completed work
- cancelled or expired items
- complaint-linked jobs
- revisit-linked jobs

### 10.3 Shop Schedule / Coordination View

Shows:

- daily service list
- assigned technicians
- pending assignment items
- revisit commitments
- customer time commitments
- blocked or delayed jobs where relevant

### 10.4 Shop Receipt / Bill Center

Shows:

- draft shop receipts
- issued receipts
- pending customer review
- accepted receipts
- disputed receipts
- correction requested
- corrected receipts
- archived receipts

### 10.5 Shop Receipt Detail

Shows:

- receipt source
- customer review state
- linked shop service
- linked complaint / revisit if any
- correction history
- allowed owner actions

### 10.6 Complaint Center

Shows:

- new complaints
- acknowledged complaints
- provider questions
- technician review needed
- revisit needed
- resolved by shop
- customer confirmation pending
- reopened complaints
- closed complaints

### 10.7 Complaint Detail

Shows:

- original shop service source
- customer complaint reason
- linked bill / receipt
- provider response
- assigned technician where relevant
- revisit state
- customer confirmation state
- resolution history

### 10.8 Revisit Coordination Screen

Shows:

- complaint-linked revisit
- original service source
- assigned technician if any
- date / time
- customer status
- revisit completion state

### 10.9 Customer Continuity View

Shows:

- repeat customers
- recent customers
- customer service history under shop
- complaint / revisit history under shop
- repeat-service opportunities
- continuity-safe customer memory

### 10.10 Shop Team / Technician Coordination

Shows:

- active technicians
- assigned jobs
- acknowledgement state
- pending updates
- technician workload summary
- reassignment need where applicable

### 10.11 Shop Profile / Public Trust Surface

Shows:

- shop display name
- shop identity summary
- service categories
- service area summary
- trust summary
- rating summary where supported
- repeat-customer continuity indicators where safe

### 10.12 Notifications

Shows:

- new service request
- technician acknowledgement needed
- receipt disputed
- complaint received
- revisit needed
- revisit completed
- customer confirmation pending
- rating received
- profile action needed

# PART 2 — SHOP OWNER SERVICE, RECEIPT, COMPLAINT AND REVISIT LIFECYCLE RULES

## 11. Shop Service Lifecycle

`shop_service_status` allowed values:

- draft
- request_received
- accepted
- scheduled
- technician_assignment_pending
- assigned
- in_progress
- service_completed
- receipt_pending
- receipt_sent
- customer_review_pending
- accepted_by_customer
- disputed_by_customer
- correction_requested
- corrected
- closed
- cancelled
- archived

## 12. Shop Assignment Lifecycle

`shop_assignment_status` allowed values:

- not_assigned
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
- reassignment_needed
- reassigned
- cancelled
- closed

## 13. Shop Complaint Lifecycle

`shop_complaint_status` allowed values:

- submitted
- received
- acknowledged
- provider_questions
- technician_review_needed
- revisit_needed
- revisit_scheduled
- in_progress
- resolved_by_shop
- customer_confirmation_pending
- resolved_confirmed
- reopened
- closed
- cancelled

## 14. Shop Receipt Lifecycle

`shop_receipt_status` allowed values:

- draft
- issued
- pending_customer_review
- accepted
- disputed
- correction_requested
- corrected
- rejected
- archived

## 15. Valid Service Transitions

- request_received to accepted
- accepted to scheduled
- scheduled to technician_assignment_pending / assigned
- assigned to in_progress
- in_progress to service_completed
- service_completed to receipt_pending
- receipt_pending to receipt_sent
- receipt_sent to customer_review_pending
- customer_review_pending to accepted_by_customer / disputed_by_customer
- disputed_by_customer to correction_requested
- correction_requested to corrected
- corrected to customer_review_pending
- accepted_by_customer to closed

## 16. Blocked Transitions

Blocked:

- shop service to independent service silently
- shop receipt to technician-owned receipt
- shop complaint to technician-owned complaint
- technician completion to customer acceptance automatically
- receipt_sent to payment completed in Phase-0
- service_completed to legally verified bill in Phase-0
- complaint closed without allowed resolution / confirmation flow
- phone match to customer vault access
- shop technician assignment to independent provider truth

## 17. Shop Complaint Ownership Rule

If original service source is Shop Owner / shop:

- complaint owner = Shop Owner
- revisit owner = Shop Owner
- receipt correction responsibility = Shop Owner
- Shop Technician may assist under assignment
- customer-facing ownership remains shop-owned

## 18. Shop Revisit Rule

Revisit must link to:

- original complaint
- original shop service record
- original shop receipt where applicable
- shop responsibility owner
- assigned technician if applicable

Revisit must not silently create independent technician ownership.

## 19. Customer Confirmation Rule

Shop Owner may mark complaint resolved.

But closure may require:

- customer confirmation
- revisit completion where needed
- receipt correction where needed
- rating gate handling where applicable

Resolved by shop does not automatically mean closed.

# PART 3 — SHOP OWNER BUSINESS-MODE, BILLING BRIDGE AND CUSTOMER RETENTION RULES

## 20. One Role with Adaptive Business Modes Rule

Shop Owner remains one role.

This one role may operate in different business modes:

- sales_only
- sales_and_service
- service_only

These are not separate roles.

They are adaptive business modes under one Shop Owner role.

## 21. Adaptive Dashboard Emphasis Rule

Shop Owner dashboard must adapt based on business mode.

Sales-only mode should prioritize:

- revenue summary
- bills sent
- pending amounts reference
- repeat customers

Sales and service mode should prioritize:

- collections
- pending services
- technician activity
- complaint and revisit visibility

Service-only mode should prioritize:

- jobs
- technician coordination
- today plan
- completion queue
- receipt and complaint flow

## 22. Billing-Software Bridge Rule

Shop Owner future architecture may support existing billing-software bridge integration.

This is for shops already using external billing systems.

Examples may include:

- external billing software
- shop billing tools
- email-based bill routing
- customer-phone-linked bill intake
- export bill flow

Bridge direction may include:

- export bill flow
- email-based bill routing
- customer-phone-linked bill intake
- shop-source preservation
- low-behavior-change workflow

This bridge must remain:

- shop-owned
- customer-safe
- privacy-safe
- optional
- future-approved

It must not become:

- forced billing migration
- payment gateway
- tax authority replacement
- legal invoice certification system in Phase-0
- customer vault access shortcut

## 23. Repeat-Customer Retention Rule

Shop Owner architecture must preserve repeat-customer retention.

This retention layer may include:

- repeat service memory
- customer continuity
- shop-linked past service visibility
- receipt continuity
- complaint and revisit continuity
- book-again path
- customer return signals

Shop value must include:

- customer remembers the shop
- customer returns to the shop
- shop trust grows from service history
- technician change does not break shop continuity

## 24. Instant Value on Join Rule

Shop Owner adoption should support instant value when possible.

If prior service links already exist through customer-side records, shop onboarding may show immediate value such as:

- linked customers
- linked service history
- linked receipt history
- repeat-customer continuity

This must remain trust-safe and privacy-safe.

Instant value must not expose customer vault data only because phone number matches.

## 25. Revenue Reference Rule

Shop Owner may have simple business-reference visibility.

This layer may include:

- daily collection reference
- pending amount reference
- bills created count
- services completed count
- repeat customer count

This exists only for shop-side reference.

It must not become:

- accounting system
- tax system
- payroll system
- financial compliance tool in Phase-0

## 26. Shop Continuity over Technician Memory Rule

For shop-context services, customer continuity must remain shop-owned.

Rules:

- customer should remember the shop first
- shop technician involvement may be visible where safe
- technician change must not break shop continuity
- repeat-service path must remain shop-linked

# PART 4 — SHOP OWNER RECEIPT, CUSTOMER CONTINUITY AND TRUST SURFACE RULES

## 27. Shop Receipt Ownership Rule

Shop-issued receipt truth belongs to the Shop Owner / shop.

Shop Technician may help with service proof or update context, but does not own final shop receipt truth.

## 28. Shop Receipt Correction Rule

Shop Owner may correct receipt when:

- amount was wrong
- service description was wrong
- wrong customer was linked
- wrong property / appliance context was linked
- correction is needed after dispute

Correction must preserve:

- original version
- corrected version
- reason
- actor
- timestamp
- customer review state

## 29. Customer Continuity Rule

Shop customer continuity may include:

- past services under shop
- accepted receipts under shop
- complaint history under shop
- revisit history under shop
- repeat-customer marker
- book-again path
- shop-trust memory

Shop continuity must not silently become technician-owned memory.

## 30. Shop Public Trust Surface Rule

Shop public trust surface may show only safe signals such as:

- shop name
- service categories
- service area
- rating summary where allowed
- accepted receipt count where safe
- repeat-customer signals where safe
- complaint response quality where supported
- member-since marker where supported

It must not show:

- fake verification
- shop internal notes
- payroll or staff-control data
- unresolved disputed receipt as positive trust proof
- hidden admin review data

## 31. Technician Visibility under Shop Rule

Customer may see technician involvement under shop where safe.

But customer must still clearly understand:

- shop owns the relationship
- shop owns the receipt
- shop owns complaint responsibility
- technician is acting under shop context

## 32. Contact Method Neutrality Rule

Shop Owner contact actions must remain globally extensible and not depend permanently on one messaging app or one local communication habit.

Shop Owner contact actions may include:

- call customer
- use approved external contact method
- send service update where future-approved
- share receipt link where future-approved
- show customer-safe contact summary where safe

Shop Owner architecture must not become an in-app chat system unless explicitly approved later.

# PART 5 — SHOP OWNER DATA MODEL AND CONTROL RULES

## 33. Shop Owner Data Model

### 33.1 SHOP_PROFILE

Fields:

- shop_owner_profile_id
- hfm_id
- shop_display_name
- shop_profile_status
- service_categories
- service_area_summary
- created_at
- updated_at

### 33.2 SHOP_SERVICE_RECORD

Fields:

- service_record_id
- hfm_id
- customer_profile_id
- active_role_context
- role_profile_id
- provider_context
- shop_owner_profile_id
- shop_technician_profile_id_optional
- property_id_optional
- appliance_id_optional
- original_service_source_id
- service_title
- service_date
- shop_service_status
- source_label
- created_at
- updated_at

### 33.3 SHOP_RECEIPT_RECORD

Fields:

- bill_receipt_id
- hfm_id
- customer_profile_id
- active_role_context
- role_profile_id
- provider_context
- shop_owner_profile_id
- shop_technician_profile_id_optional
- service_record_id_optional
- receipt_status
- receipt_trust_state
- correction_version
- customer_review_status
- created_at
- updated_at

### 33.4 SHOP_COMPLAINT_RECORD

Fields:

- complaint_id
- hfm_id
- customer_profile_id
- service_record_id
- bill_receipt_id_optional
- provider_context
- original_service_source_id
- responsible_provider_id
- shop_technician_profile_id_optional
- complaint_reason
- complaint_status
- customer_confirmation_status
- created_at
- updated_at

### 33.5 SHOP_REVISIT_RECORD

Fields:

- revisit_id
- complaint_id
- service_record_id
- bill_receipt_id_optional
- hfm_id
- customer_profile_id
- provider_context
- responsible_provider_id
- shop_technician_profile_id_optional
- revisit_status
- scheduled_at_optional
- created_at
- updated_at

## 34. Shop Owner Permission Rules

Shop Owner can:

- manage own shop profile
- manage shop-side service records
- issue and correct shop receipts
- manage shop complaint responses
- coordinate shop revisits
- assign and review Shop Technician work
- view shop-linked customer continuity where allowed
- view shop notifications

Shop Owner cannot:

- own Independent Technician records
- browse full customer vault
- access other shops
- rewrite customer acceptance silently
- claim legal verification in Phase-0
- access admin governance internals
- use phone number as final ownership proof
- convert Shop Technician work into independent service truth

# PART 6 — SHOP OWNER NOTIFICATION, OPERATIONAL SAFETY AND FINAL BOUNDARY RULES

## 35. Notification / Alert Contract

Shop Owner notification types:

- shop_service_request_received
- technician_assignment_needed
- technician_acknowledgement_needed
- technician_acknowledged
- visit_update_submitted
- receipt_review_pending
- receipt_disputed
- complaint_received
- technician_review_needed
- revisit_scheduled
- revisit_completed
- complaint_reopened
- complaint_resolved
- rating_received
- profile_action_needed

## 36. Safe Notification Wording

Good examples:

- A new service request was received for your shop.
- A technician acknowledgement is pending.
- A customer disputed a shop receipt.
- A complaint was received for a shop service.
- A revisit was completed and needs review.

## 37. Operational Safety Rule

Shop Owner operational view may help coordinate service work.

It must not become:

- payroll system
- legal attendance tool
- hidden staff surveillance
- punishment automation
- customer-visible internal control board

## 38. Final Boundary Rule

Shop Owner architecture must remain:

- one role
- mode-adaptive
- receipt-responsible
- complaint-responsible
- customer-retention aware
- technician-coordination aware
- trust-first
- privacy-safe
- separate from Independent Technician
- separate from Shop Technician ownership truth
