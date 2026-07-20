# HOMEFIX MITRA — INDEPENDENT TECHNICIAN ARCHITECTURE

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Independent Technician Architecture defines the self-employed technician provider domain of HomeFix Mitra.

Independent Technician is a provider who personally owns the service relationship, receipt responsibility, complaint handling, revisit continuity, repeat-service relationship and availability truth for services performed under independent context.

Independent Technician Architecture must remain:

- self-owned
- receipt-first
- service-memory-aware
- complaint-responsible
- revisit-aware
- customer-trust-focused
- profile / public-card controlled
- separate from Shop Owner
- separate from Shop Technician under shop context
- Phase-0 demo-safe

## 3. Core Principle

Independent Technician = self-employed provider context.

The Independent Technician personally owns:

- service execution truth
- receipt / bill responsibility
- customer relationship continuity
- complaint response
- revisit handling
- repeat-service continuity
- own availability / schedule
- own trust profile

## 4. What Independent Technician Architecture Is

Independent Technician Architecture is:

- the self-employed provider flow
- the independent receipt-first service workflow
- the independent complaint and revisit responsibility model
- the independent repeat-service model
- the independent provider profile / public-card model
- the independent technician availability and scheduling model
- the independent provider notification model

## 5. What Independent Technician Architecture Is Not

Independent Technician Architecture is not:

- Shop Owner architecture
- Shop Technician context
- shop team operations
- shop bill ownership
- admin governance console
- customer vault ownership
- payment processing system in Phase-0
- legal service verification authority in Phase-0
- emergency dispatch guarantee in Phase-0
- uncontrolled customer data access system

## 6. Hard Non-Mixing Rule

Independent Technician must never be silently treated as Shop Owner or Shop Technician.

Independent Technician service record must not become:

- shop-owned service record
- shop technician assignment
- shop bill
- shop complaint
- shop team operation
- admin case without governance reason

If an Independent Technician later becomes a Shop Owner, the app must support upgrade path without rewriting older independent service truth.

Old Independent Technician records must remain independent-source records.

## 7. Role Fit

### 7.1 Independent Technician

Independent Technician uses HomeFix Mitra to:

- create / manage own service receipts
- record completed services
- view customer-linked service history where allowed
- handle own complaints
- schedule revisits
- manage repeat-service requests
- maintain own availability
- maintain own trust / profile / public card
- receive own service notifications

### 7.2 Customer

Customer sees Independent Technician as:

- direct service provider
- receipt issuer for independent service
- complaint owner for that service
- revisit owner for that service
- repeat-service target where safe

### 7.3 Shop Owner

Shop Owner must not control Independent Technician service truth unless a separate future migration / association rule is explicitly approved.

### 7.4 Shop Technician

Shop Technician must not be confused with Independent Technician.

A Shop Technician working under a shop does not own independent service truth.

### 7.5 Admin

Admin may review Independent Technician issues only through Admin governance.

Admin must not appear inside normal Independent Technician workflow.

## 8. Independent Technician Customer-App Boundary Rule

Independent Technician flow must not require the customer to install HomeFix Mitra before a service, receipt, complaint or follow-up can exist.

Independent Technician may invite the customer to install the app only after value is clear.

Safe invitation sequence:

1. service happens
2. receipt or service record is created
3. customer sees value
4. app install becomes optional and useful

Independent Technician must not use app install as pressure.

Do not imply:

- complaint cannot be accepted without the customer app
- service follow-up is impossible without the customer app
- old records are automatically unlocked by phone number
- provider can view the full customer vault after customer install

## 9. Phone Number and Customer Lookup Boundary Rule

Phone number may be used for receipt delivery, contact continuity and service recall.

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

## 9.1 Independent Technician Identity and Active Context Rule

Independent Technician profile must link to the same permanent `hfmId` defined in Core Master Truth and Cross-Domain System Rules.

Independent Technician side must treat:

- `hfmId` as the permanent person/account identity
- `independentTechnicianProfileId` as the independent technician workspace/profile identity
- `activeRoleContext = independentTechnician` as the current independent technician workspace mode
- `providerContext = independent_technician_service` as the source truth for independent technician service records

Independent Technician records must preserve independent technician context and must not mix with Customer, Shop Owner or Shop Technician workspaces.

Independent Technician records may store:

- `hfmId`
- `independentTechnicianProfileId`
- `activeRoleContext = independentTechnician`
- `providerContext = independent_technician_service`
- `sourceContext`
- `sourceRecordId` where needed

Independent Technician UI may show `hfmId` as:

- HomeFix Mitra ID
- Your HomeFix Mitra ID

Independent Technician UI may show technician-specific profile reference where needed, but must not create a second duplicate public permanent person identity.

If the same person also has Customer, Shop Owner or Shop Technician profiles, those profiles must remain separate role workspaces under the same `hfmId`.

Independent Technician service records must remain independent-context records even when the same person later becomes Shop Owner or Shop Technician.

# PART 1 — INDEPENDENT TECHNICIAN SCREEN-BY-SCREEN ARCHITECTURE

## 10. Independent Technician Screen-by-Screen Architecture

### 10.1 Independent Technician Home

Shows:

- today’s services
- upcoming visits
- pending receipts
- active complaints
- revisit requests
- repeat-service requests
- profile / trust readiness
- availability summary
- notification summary

### 10.2 Service Requests / Jobs

Shows:

- new customer requests
- accepted requests
- scheduled visits
- completed services
- cancelled / expired requests

### 10.3 Appointment / Schedule

Shows:

- daily schedule
- accepted visits
- revisit appointments
- availability blocks
- customer contact context where safe
- service location summary where safe

### 10.4 Create Receipt / Service Record

Captures:

- customer context
- property / appliance if available
- service title
- service date
- service description
- parts / labor notes where safe
- amount reference where Phase-0 display-only
- warranty / revisit note if applicable
- receipt status

### 10.5 Receipt Detail

Shows:

- receipt source
- customer acceptance / dispute state
- linked service record
- linked complaint if exists
- correction history
- customer-visible receipt summary

### 10.6 Complaint Center

Shows:

- new complaints
- acknowledged complaints
- provider questions
- revisit needed
- resolved by provider
- customer confirmation pending
- reopened complaints
- closed complaints

### 10.7 Complaint Detail

Shows:

- original bill / service source
- customer complaint reason
- customer notes / image placeholder where future-approved
- provider reply
- revisit status
- resolution state
- customer confirmation status

### 10.8 Revisit Scheduler

Shows:

- complaint-linked revisit
- selected date / time
- visit reason
- customer confirmation
- revisit completion state

### 10.9 Repeat Service Requests

Shows:

- customer repeat requests
- linked previous service
- customer memory context
- accept / decline / schedule actions
- provider availability impact

### 10.10 Profile / Public Card

Shows:

- technician display name
- service categories
- service area summary
- availability summary
- rating / trust summary
- receipt / complaint response quality indicators where supported
- public-safe contact / request action where future-approved

### 10.11 Availability

Shows:

- available days / time windows
- unavailable blocks
- same-day availability where supported
- revisit capacity
- emergency / urgent availability only if safely supported

### 10.12 Notifications

Shows:

- service request received
- visit confirmed
- receipt accepted / disputed
- complaint received
- complaint reopened
- revisit scheduled
- rating received
- profile action needed

## 11. Daily Work Control Rule

Independent Technician must have a simple daily work-control layer.

This layer may include:

- today’s pending services
- pending receipt queue
- pending revisit queue
- customer clarification queue
- no-response follow-up queue
- urgent callback reminder where safely supported
- carry-forward work from previous day
- day-end self-review

This layer exists for the technician’s own work control only.

It must not become:

- shop dispatch console
- staff attendance system
- payroll system
- surveillance system
- manager control panel
- emergency dispatch authority in Phase-0

# PART 2 — INDEPENDENT TECHNICIAN LIFECYCLE AND STATE RULES

## 12. Independent Technician Service Lifecycle

`independent_service_status` allowed values:

- draft
- request_received
- accepted
- scheduled
- visit_pending
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

## 13. Appointment Lifecycle

`independent_appointment_status` allowed values:

- not_scheduled
- proposed
- confirmed
- reschedule_requested
- scheduled
- visit_started
- visit_completed
- no_visit
- cancelled_by_customer
- cancelled_by_technician
- expired

## 14. Complaint Lifecycle

`independent_complaint_status` allowed values:

- submitted
- received
- acknowledged
- provider_questions
- revisit_needed
- revisit_scheduled
- in_progress
- resolved_by_technician
- customer_confirmation_pending
- resolved_confirmed
- reopened
- closed
- cancelled

## 15. Receipt Lifecycle

`independent_receipt_status` allowed values:

- draft
- issued
- pending_customer_review
- accepted
- disputed
- correction_requested
- corrected
- rejected
- archived

## 16. Valid Service Transitions

- request_received to accepted
- accepted to scheduled
- scheduled to visit_pending
- visit_pending to in_progress
- in_progress to service_completed
- service_completed to receipt_pending
- receipt_pending to receipt_sent
- receipt_sent to customer_review_pending
- customer_review_pending to accepted_by_customer / disputed_by_customer
- disputed_by_customer to correction_requested
- correction_requested to corrected
- corrected to customer_review_pending
- accepted_by_customer to closed

## 17. Blocked Transitions

Blocked:

- independent service to shop service silently
- independent receipt to shop receipt silently
- independent complaint to shop owner complaint without original source rule
- service_completed to legally verified bill in Phase-0
- receipt_sent to payment completed in Phase-0
- customer_review_pending to accepted without customer action unless rule explicitly allows
- complaint closed without resolution / customer confirmation where required

## 18. Receipt-First Flow

Independent Technician service should be receipt-first where service memory depends on bill / receipt truth.

Receipt-first flow means:

1. technician completes service
2. technician creates / issues receipt
3. customer reviews receipt
4. customer accepts / disputes / requests correction
5. accepted receipt links to service history
6. complaint / revisit can link to receipt

Receipt-first must not mean:

- fake legal invoice authority
- real payment proof in Phase-0
- customer forced acceptance
- receipt cannot be corrected
- provider can rewrite accepted truth silently

# PART 3 — INDEPENDENT TECHNICIAN COMPLAINT, REVISIT AND REPEAT-SERVICE RULES

## 19. Independent Complaint Ownership Rule

If original service source is Independent Technician, complaint routes to that Independent Technician.

Independent Technician owns:

- acknowledgement
- provider response
- revisit scheduling
- resolution proposal
- correction where receipt issue exists

Customer owns:

- complaint submission
- confirmation / reopen where allowed
- dispute / correction request
- rating after resolution where applicable

## 20. Provider Reply / Clarification Rule

Independent Technician may ask clarification when:

- complaint reason is unclear
- appliance / property context is missing
- revisit need must be understood
- receipt correction needs detail

Clarification must not be used to delay closure unfairly.

## 21. Revisit Rule

Revisit must link to:

- original complaint
- original service record
- original receipt where applicable
- Independent Technician provider source

Revisit must preserve:

- revisit scheduled date
- revisit status
- completion result
- customer confirmation
- complaint closure effect

## 22. Complaint Resolution Rule

Independent Technician may mark complaint resolved.

But closure may require:

- customer confirmation
- revisit completed
- receipt corrected where needed
- rating gate handled where applicable

Resolved by technician does not automatically mean closed.

## 23. Reopen Rule

Customer may reopen when:

- same issue remains
- revisit failed
- receipt correction was incomplete
- provider response did not solve issue

Reopened complaint must preserve original timeline.

## 24. Repeat Service Rule

Repeat service may start from:

- previous independent service record
- provider detail
- appliance detail
- property detail
- closed complaint
- completed revisit

Repeat service must preserve provider context:

- independent_technician_service

Customer must not be shown shop wording for independent repeat service.

## 25. Self-Availability Rule

Independent Technician availability may include:

- available days
- available time windows
- unavailable blocks
- revisit slots
- same-day availability indicator
- temporary unavailable state

Availability must not claim real-time dispatch authority in Phase-0.

## 26. Profile / Public Card Rule

Independent Technician public card may show:

- display name
- service categories
- service area summary
- profile completeness
- rating / trust summary
- response quality where supported
- repeat-service availability where safe

It must not show:

- fake verification badge
- real background check claim
- payment guarantee
- emergency guarantee
- private customer records
- admin review notes

## 27. Trust / Rating Rule

Independent Technician rating should link to:

- completed service
- accepted receipt
- resolved complaint
- completed revisit

Rating must not be:

- manually inflated
- public shaming
- disconnected from service memory
- hidden punishment without context

## 28. Notification / Alert Contract

Independent Technician notification types:

- service_request_received
- service_request_accepted
- visit_confirmed
- visit_reschedule_requested
- service_completed
- receipt_review_pending
- receipt_accepted
- receipt_disputed
- receipt_correction_requested
- complaint_received
- complaint_acknowledged
- provider_question_sent
- revisit_requested
- revisit_scheduled
- revisit_completed
- complaint_reopened
- complaint_resolved
- rating_received
- repeat_service_requested
- availability_needs_update
- follow_up_due_today
- no_response_follow_up_needed
- carry_forward_work_reminder

## 29. Safe Notification Wording

Good examples:

- A customer sent a service request.
- A receipt needs customer review.
- A complaint was received for your service record.
- A revisit was requested.
- The customer confirmed the complaint is resolved.

# PART 4 — INDEPENDENT TECHNICIAN PORTABLE IDENTITY, CUSTOMER MEMORY AND WORK-PROOF RULES

## 30. My Customers Relationship-Memory Rule

Independent Technician must have a customer-memory layer.

This layer exists to preserve repeat-service continuity, customer recall and technician-owned relationship value.

My Customers view may include:

- repeat customers
- recent customers
- customers with pending revisit
- customers with pending payment-status follow-up in future-approved mode
- customers who accepted receipts
- customers who requested repeat service

This view must not expose unrelated customer private data.

## 31. Portable Identity Rule

Independent Technician public identity must remain portable and self-owned.

Portable identity includes:

- technician name
- profile photo
- HFM ID
- skills
- service areas
- jobs completed
- repeat-customer rate
- rating summary where allowed
- member-since marker where supported
- public-safe work proof

This identity must not depend on shop ownership.

This identity must not be silently converted into shop-owned trust.

## 32. My Card Rule

Independent Technician must have a clear digital visiting-card layer.

My Card may include:

- display name
- HFM ID
- profile photo
- skills
- service areas
- approved external contact entry where future-approved
- trust summary
- shareable card / QR direction where future-approved

My Card exists to help technician stay memorable and reachable.

## 33. Work Portfolio and Proof Rule

Independent Technician may maintain work proof and portfolio records.

Allowed proof examples:

- before photo
- after photo
- job completion proof
- appliance/service proof
- receipt-linked proof
- customer-safe work summary

Proof visibility must be controlled.

Suggested proof visibility states:

- private_only
- receipt_visible
- portfolio_candidate
- public_portfolio
- removed

Proof must not expose customer-sensitive data.

## 34. Receipt Recovery and After-Send Actions Rule

After receipt creation, Independent Technician must have recovery actions.

Allowed recovery actions:

- resend receipt
- correct amount
- correct description
- void with reason
- re-share link where future-approved
- download / preview again where supported

Recovery must preserve:

- old receipt state
- corrected state
- actor
- timestamp
- reason where required

## 35. Payment-Status Reference Rule

Independent Technician may track simple payment-status reference for service memory.

Allowed states in future-safe architecture:

- paid
- pending
- partially_paid
- waived
- disputed_payment

This exists only as service-reference clarity.

It must not become:

- wallet system
- payroll system
- legal payment enforcement
- payment gateway in Phase-0

## 36. Repeat Service Request Rule

Independent Technician must support repeat-service continuity.

Repeat-service request states may include:

- new_request
- viewed
- accepted
- scheduled
- completed
- declined
- expired

Repeat-service request must preserve:

- customer link
- previous service link
- provider continuity
- action status

## 37. Earnings Reference Rule

Independent Technician may have simple earnings-reference visibility.

This layer may show:

- completed jobs count
- paid jobs reference
- pending amount reference in future-approved mode
- period summary
- customer count

This layer exists for technician self-reference only.

It must not become:

- accounting system
- tax system
- salary/payroll system
- settlement engine in Phase-0

## 38. Task-Speed Rule

Independent Technician flows must stay ultra-fast.

Rules:

- receipt creation must remain low-tap
- one-thumb usage must stay realistic
- schedule/update flows must stay short
- profile richness must not slow core work actions
- work-mode clarity must stay stronger than decorative UI depth

## 39. Final Boundary Rule

Independent Technician must remain:

- self-owned
- receipt-first
- customer-memory aware
- repeat-service ready
- trust-visible
- portable in identity
- separate from Shop Owner
- separate from Shop Technician under shop context

# PART 5 — INDEPENDENT TECHNICIAN RECEIPT STATUS, CORRECTION, DISPUTE AND TRUST-CONTROL RULES

## 40. Three-Layer Truth Rule

Every Independent Technician receipt must preserve three separate truths:

1. Technician record truth
2. Customer acceptance truth
3. Platform trust truth

These must not be merged blindly.

## 41. Receipt Status Rule

Independent Technician receipt status must support:

- draft
- created
- shared
- viewed_by_customer
- accepted_by_customer
- rejected_by_customer
- correction_requested
- corrected
- voided_by_technician
- locked

## 42. Receipt Correction Rule

Correction types may include:

- correct amount
- correct customer phone number
- correct service description
- correct payment status
- add missing photo or proof
- void receipt with reason

Rules:

- draft may be edited freely
- created receipt may be corrected before sharing
- shared receipt must preserve version history
- accepted receipt must not be silently changed
- voided receipt must require reason
- locked receipt must remain preserved for trust and audit history

## 43. Version History Rule

Shared or corrected receipt must preserve:

- receipt_version
- changed_fields
- previous_values
- new_values
- change_reason
- changed_at
- changed_by_role

Old version must remain audit-visible.

## 44. Customer Dispute Rule

Customer dispute reasons may include:

- I did not receive this service
- amount is wrong
- work description is wrong
- payment status is wrong
- wrong customer
- duplicate receipt
- I do not recognize this provider
- other

Dispute must not delete technician history automatically.

Dispute must block strong public trust boost until resolved.

## 45. Dispute Status Rule

Dispute status may include:

- none
- raised
- technician_responded
- corrected_by_technician
- accepted_after_correction
- rejected_after_review
- voided_by_technician
- support_escalated
- closed_unresolved

## 46. Customer Vault Linking Rule

Receipt must not enter customer permanent history only because:

- technician typed phone number
- phone number matches an account
- link was generated
- receipt was shared

Only accepted customer-side receipt should become strong customer-side history.

## 47. Trust Impact Rule

Strong trust boost requires signals such as:

- receipt created
- receipt shared
- customer viewed
- customer accepted
- no active dispute

No public trust boost for:

- draft
- voided
- active dispute
- rejected_by_customer
- duplicate
- test or demo receipt

## 48. Payment Reference Rule

Payment status is for service reference only.

Allowed display values:

- paid
- pending
- partially_paid

Required meaning:

- it is not wallet settlement
- it is not legal payment proof
- it is not payroll truth
- it is not tax truth

## 49. Final Boundary Rule

Independent Technician receipt system must remain:

- correction-safe
- dispute-aware
- audit-preserved
- customer-acceptance-aware
- trust-safe
- payment-independent

# PART 6 — INDEPENDENT TECHNICIAN SCREEN-BY-SCREEN UX AND OFFLINE-FIRST RULES

## 50. Global UX Rule

Independent Technician screens must support real field conditions:

- one-hand use
- low typing
- poor network
- customer waiting nearby
- fast receipt creation after service

Every main screen must answer one clear question such as:

- what should I do now
- which job did I complete
- which customer should I follow up
- how do I share my professional identity

## 51. Home Screen Rule

Independent Technician Home must show:

- technician identity strip
- HFM ID
- large primary action: Create Receipt
- recent jobs
- pending follow-ups
- repeat service requests
- simple today or month summary
- quick access to My Card

It must not show:

- shop team controls
- manager dispatch console
- staff attendance
- payroll or salary data
- public marketplace leads
- customer full vault data

## 52. Create Receipt Screen Rule

Create Receipt must show:

- customer phone number field
- service category selector
- short work description
- amount field
- payment status selector
- optional proof photo area
- create receipt button

Recommended order:

1. customer phone
2. service category
3. work description
4. amount
5. payment status
6. optional proof
7. create receipt

Phone number is only delivery and continuity bridge.

It must not reveal customer-owned data.

## 53. Receipt Preview Rule

Receipt Preview must show:

- receipt number
- technician name
- HFM ID
- service category
- work description
- amount
- payment status
- created date and time
- customer phone number
- proof photo indicator
- correction actions
- share actions

Primary actions may include:

- share through approved external contact method
- copy receipt link
- show QR
- save as PDF later
- correct receipt
- void receipt with reason

## 54. My Jobs Rule

My Jobs must show technician-owned work history only.

It may show:

- date
- service category
- customer phone or saved name
- amount
- payment status
- receipt status
- search and filter

It must not show customer full history, shop financials, salary or payroll controls.

## 55. Job Detail Rule

Job Detail must show:

- receipt or service ID
- date and time
- customer phone or saved name
- category
- description
- amount
- payment status
- proof photos
- receipt status
- share history indicator
- correction history indicator

Actions may include:

- reshare receipt
- correct receipt
- void receipt
- create follow-up reminder
- mark repeat opportunity

## 56. My Customers Rule

My Customers must remain lightweight technician memory only.

It may show:

- customer display name if manually entered
- phone number
- last service date
- last service category
- total jobs with this technician
- pending amount indicator
- follow-up status

It must not show customer private property list, household members, full vault or other-provider records.

## 57. Customer Detail Rule

Customer Detail must show technician’s own history with that customer only.

It may show:

- saved display name
- phone number
- total jobs with this technician
- last service date
- service history created by this technician
- pending amount summary
- follow-up notes

Actions may include:

- create new receipt
- call
- use approved external contact method
- add follow-up note

## 58. My Card Rule

My Card must show:

- technician name
- profile photo or placeholder
- HFM ID
- skills
- service areas if entered
- verification state
- jobs completed count where safe
- share button
- QR area

It must not show earnings, customer list, private receipt data or fake verification claim.

## 59. Portfolio Rule

Portfolio may show:

- selected completed work items
- before and after photos
- category
- short work note
- month and year

It must not show customer phone number, full address, private bill photo or customer identity without consent.

## 60. Earnings Reference Rule

Earnings Reference may show:

- today total
- this month total
- paid amount
- pending amount
- recent receipt values

It must include meaning equivalent to:

- for personal service reference only
- not accounting
- not tax
- not payroll
- not payment settlement

## 61. Profile Rule

Profile must show:

- name
- phone
- profile photo
- skills
- service areas
- HFM ID
- verification state

HFM ID and historical receipt ownership must not be casually editable.

## 62. Offline-First Rule

Independent Technician flow must work in poor network conditions.

Phase-0 or local-safe behavior may include:

- create receipt locally
- save draft locally
- save proof photos locally
- show receipt preview locally

Future synced states may include simple labels such as:

- saved on this phone
- shared
- synced

User must never lose entered receipt data because of network failure.

## 63. Final Boundary Rule

Independent Technician UX must remain:

- receipt-first
- one-thumb friendly
- low-typing
- poor-network tolerant
- customer-memory aware
- trust-proof aware
- separate from shop operations
- separate from payroll, wallet and marketplace logic

# PART 7 — INDEPENDENT TECHNICIAN DIGITAL CARD, PORTFOLIO, FOLLOW-UP AND ROLE-TRANSITION RULES

## 64. Digital Card Rule

Independent Technician must have a simple professional digital card.

It may show:

- technician display name
- profile photo or safe placeholder
- HFM ID
- primary skills
- service areas if entered
- verification state
- jobs completed count where safe
- share action
- QR code

It must not show:

- earnings
- private customer list
- private job notes
- customer phone numbers
- disputed receipt details
- shop team data

## 65. HomeFix Mitra ID and Technician Profile Rule

HomeFix Mitra ID is the person/account identity anchor.

The Independent Technician profile is the technician workspace/profile under that same `hfmId`.

Rules:

- `hfmId` is generated by the system
- `hfmId` stays stable over time
- `hfmId` may be shown as HomeFix Mitra ID on receipts, digital card, portfolio or profile
- `independentTechnicianProfileId` identifies the technician workspace/profile
- neither `hfmId` nor historical receipt ownership should be casually editable
- `hfmId` must not be reused by another person/account
- Independent Technician profile must not be silently converted into Shop Owner or Shop Technician context

## 66. Verification Display Rule

Verification states may include:

- not_started
- pending
- verified
- rejected
- expired

Phase-0 must not show fake verification.

Safe Phase-0 wording may include:

- demo profile
- verification available in a future version

## 67. Portfolio Rule

Portfolio exists to show capability safely.

Portfolio may show:

- service category
- short work note
- before and after photos
- month and year
- non-identifying area label if safe

Portfolio must not show:

- customer phone number
- full customer address
- bill photo with private details
- customer identity without consent
- private payment notes

## 68. Customer Consent Rule

If portfolio content identifies a customer, explicit consent is required.

Without consent:

- crop or remove identifying details
- blur private details
- keep item private
- show only non-identifying work summary

## 69. Follow-Up and Repeat Memory Rule

Independent Technician may maintain technician-owned customer memory for repeat service.

This memory may include:

- customer name if manually saved
- phone number
- last service date
- last service category
- total jobs with this technician
- follow-up due label
- repeat request badge
- private follow-up note

It must not become customer surveillance.

## 70. Repeat Request Rule

Repeat service sources may include:

- customer book-again request
- technician follow-up note
- service-category suggestion later
- accepted receipt-based continuity later

Repeat request states may include:

- new_request
- viewed_by_technician
- contacted
- scheduled
- completed
- cancelled_by_customer
- cancelled_by_technician
- expired

Technician must not spam customers.

No bulk promotional messaging.

No customer-profile lookup by phone number.

## 71. Public Trust Surface Rule

Public trust surface may show only safe signals such as:

- HFM ID
- verification state
- member since
- skills
- jobs completed count where safe
- accepted receipt count where safe
- repeat customer signal later
- rating summary later
- portfolio count

It must not show:

- draft receipts
- disputed jobs as successful
- voided receipts as completed jobs
- private earnings
- private customer names
- unverified claims as verified facts

## 72. Role-Transition Rule

Role transition is allowed later.

Role mixing is not allowed.

A person may move between professional contexts over time, but each service record must preserve the exact context in which it was created.

Examples of preserved source context:

- independent_self_employed
- shop_owner_performed
- shop_technician_assigned

Shop work must not silently become independent work.

Independent work must not silently become shop work.

## 73. Final Boundary Rule

Independent Technician public identity and growth path must remain:

- portable
- trust-safe
- consent-safe
- repeat-service friendly
- non-spam
- role-separated
- separate from Shop Owner
- separate from Shop Technician
