# HOMEFIX MITRA — CUSTOMER ARCHITECTURE

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Customer Architecture defines the customer-side product truth of HomeFix Mitra.

Customer side is the heart of HomeFix Mitra because the app exists to help customers remember, organize, understand and continue their home service history safely.

Customer Architecture must remain:

- customer-owned
- trust-first
- privacy-safe
- bill-linked
- complaint-aware
- revisit-aware
- provider-context-safe
- simple for low-tech users
- premium and enterprise-grade

## 3. Core Principle

Customer = owner of home service memory.

Customer must be able to see:

- what service happened
- who provided it
- which bill / receipt belongs to it
- whether a complaint exists
- whether a revisit happened
- what is resolved
- what is still pending
- which records are claimed / verified / local-demo only
- what action is safe next

## 4. What Customer Architecture Is

Customer Architecture is:

- the customer-facing product experience
- the customer service memory system
- the customer complaint and revisit view
- the customer bills / receipts view
- the customer service history timeline
- the historical claim experience
- the repeat-service continuity layer
- the customer notification surface
- the customer trust / safety layer

## 5. What Customer Architecture Is Not

Customer Architecture is not:

- provider operations dashboard
- shop owner control panel
- shop technician work queue
- admin governance console
- payment system in Phase-0
- legal bill verification system in Phase-0
- emergency dispatch authority system in Phase-0
- public social review feed
- provider surveillance system

## 6. Hard Non-Mixing Rule

Customer flow must not expose provider-side private operations.

Customer must not see:

- shop internal staff notes
- technician private operational notes
- admin review notes
- other customer records
- hidden provider risk logic
- provider-only assignment controls

Provider-side flows must not own customer vault.

Customer vault remains customer-controlled.

## 7. Customer Role Fit

Customer uses HomeFix Mitra to:

- store service records
- view bills / receipts
- remember appliance / property service history
- raise complaints
- track revisits
- claim historical records
- repeat service with the same provider where safe
- see provider continuity and trust context
- manage customer-owned service memory

Customer must be protected from:

- wrong provider access
- wrong historical claim release
- fake receipt confusion
- complaint routing confusion
- hidden provider overreach
- provider role mixing
- forced acceptance of records
- hidden data exposure

## 7.1 Customer Identity and Active Context Rule

Customer profile must link to the same permanent `hfmId` defined in Core Master Truth and Cross-Domain System Rules.

Customer side must treat:

- `hfmId` as the permanent person/account identity
- `customerProfileId` as the customer workspace/profile identity
- `activeRoleContext = customer` as the current customer-side workspace mode

Customer-side records must preserve customer context and must not mix with provider workspaces.

Customer records may store:

- `hfmId`
- `customerProfileId`
- `activeRoleContext = customer`
- `sourceContext`
- `sourceRecordId` where needed

Customer UI may show `hfmId` as:

- HomeFix Mitra ID
- Your HomeFix Mitra ID

Customer UI must not create or expose a second duplicate permanent customer-only public identity.

If the same person also has Independent Technician, Shop Owner or Shop Technician profiles, those profiles must remain separate role workspaces under the same `hfmId`.

Customer vault records must remain customer-context records even when the same person also uses provider roles.

# PART 1 — CUSTOMER VALUE-FIRST ACCESS, CONTINUITY AND TRUST GUIDANCE RULES

## 8. Value-First Entry Rule

Customer-side experience must deliver value before heavy setup.

Customer should first feel:

- my bill is safe
- my service is saved
- I can find this later
- I can continue this service relationship safely

Do not force full setup before first value.

## 9. Simple-Mode Customer Experience Rule

Customer-facing UI must remain simpler than the internal architecture.

Internal system may use:

- property
- appliance
- service record
- bill / receipt
- provider context
- complaint
- revisit
- claim

But customer first-touch experience should prioritize:

- service
- bill
- next action
- trust clarity

Complex structure may exist in the background, but must not overload first-touch screens.

## 10. Low-Overload Home Rule

Customer home must stay action-first and low-confusion.

Customer home should prioritize:

- recent service memory
- recent bills / receipts
- active complaints
- upcoming revisits / visits
- claim old records
- repeat service
- notifications
- trust / continuity summary

Customer home must not become:

- dense admin-like dashboard
- crowded architecture menu
- marketplace-style discovery screen
- noisy multi-card overload

## 11. Service-First Customer Conversion Rule

Customer adoption should remain service-first.

Rules:

- app install must not be mandatory for complaint handling
- app install must not be mandatory for service completion
- customer should first receive service value
- trust should build before deeper app commitment
- install invitation should feel helpful, not forced

## 12. Controlled Service Discovery Rule

Customer may use controlled service discovery only as a trust-first rescue layer.

Priority order should be:

1. My Saved Providers
2. Recent Providers
3. Near Me Providers
4. broader discovery only if future-approved

Discovery must not become:

- noisy open marketplace
- price-war search engine
- random raw technician listing
- trust-blind directory

## 13. Saved and Recent Provider Continuity Rule

Customer should be able to return to known providers safely.

Continuity layer may include:

- previously used provider
- repeat-service shortcut
- last service link
- complaint/revisit history
- provider context
- provider trust summary

Known-provider continuity should be stronger than blind new-provider discovery.

## 14. Customer Communication Guidance Rule

Customer-facing service communication should remain simple and trust-safe.

Customer communication may include:

- receipt ready
- complaint received
- complaint acknowledged
- revisit scheduled
- issue resolved
- claim review needed
- repeat service available
- install invitation where appropriate

Communication must remain:

- non-pushy
- source-linked
- privacy-safe
- easy to understand

## 15. Emergency and Retention Utility Rule

Customer architecture may include retention-support features that preserve app usefulness between service events.

Examples:

- emergency contacts
- fix-it list
- home calendar
- home expense reference

These features must remain:

- home-specific
- retention-supportive
- low-confusion
- secondary to core service-memory truth

They must not turn the app into a generic utility bundle.

## 16. Install Invitation Rule

Install invitation must follow value, not pressure.

Correct sequence:

- service happens
- bill / record value becomes visible
- trust and continuity become clear
- app install becomes meaningful

Wrong sequence:

- install first
- value later

## 17. Contact Method Neutrality Rule

Customer contact actions must remain globally extensible and not depend permanently on one messaging app or one local communication habit.

Customer contact actions may include:

- call provider
- use approved external contact method
- send repeat request where future-approved
- view provider contact details where safe

Customer architecture must not become an in-app chat system unless explicitly approved later.

## 18. Final Boundary Rule

Customer architecture must remain:

- value-first
- service-memory-first
- trust-first
- complaint-aware
- revisit-aware
- low-confusion
- simple on first touch
- rich in background structure only where needed

# PART 2 — CUSTOMER HOME / DASHBOARD ARCHITECTURE

## 19. Customer Home / Dashboard Architecture

Customer Home must show a simple trust-first overview.

### 19.1 Customer Home Should Show

- customer welcome / memory summary
- active complaints
- upcoming visits / revisits
- recent bills / receipts
- recent service records
- appliance / property shortcuts
- repeat-service shortcuts
- historical claim status
- notification summary
- trust-first continuity strip

### 19.2 Customer Home Must Not Show

- provider private operations
- admin governance controls
- hidden review flags
- fake verification claims
- payment claims in Phase-0
- emergency dispatch guarantee
- other customer records

### 19.3 Customer Home First-Read Goal

Customer should immediately understand:

- what needs attention
- what service happened recently
- which complaint is active
- which bill needs review
- which revisit is upcoming
- which provider is linked
- what safe action can be taken next

## 20. Customer Dashboard Cards

Recommended customer dashboard cards:

1. Active Complaints
2. Upcoming Visits
3. Recent Bills
4. Service History
5. My Appliances
6. My Properties
7. Claim Old Records
8. Repeat Service
9. Notifications
10. Trust / Continuity Summary

# PART 3 — CUSTOMER DASHBOARD PRIORITY, ATTENTION AND QUICK-ACTION RULES

## 21. Customer Dashboard Principle

Customer Home must feel like a trust and continuity dashboard.

It should help customer answer:

- what needs attention now
- where is my bill
- is complaint still open
- when is revisit
- what can I do next

It must not feel like a business dashboard.

## 22. Dashboard Priority Order Rule

Customer Home must prioritize information in this order:

1. attention needed
2. quick actions
3. upcoming visits and revisits
4. recent bills and receipts
5. recent service history
6. repeat-service shortcuts
7. trust summary

## 23. Attention Needed Rule

Attention Needed must show only the most important unresolved customer actions.

Examples:

- receipt waiting for your confirmation
- complaint response received
- revisit scheduled for tomorrow
- provider requested correction approval
- old records found, verify before claiming

Attention items must be action-first, not data-heavy.

## 24. Quick Actions Rule

Quick actions may include:

- add service
- upload bill
- view bills
- book again
- raise complaint

Quick actions must stay simple and high-value.

## 25. Active Complaint Display Rule

Customer Home may show:

- complaint title or category
- provider or technician name
- current status
- next action
- last update

It must not show:

- internal shop staff notes
- technician private notes
- manager-only decision signals
- backend status jargon

## 26. Upcoming Visits Rule

Customer Home may show:

- visit or revisit date
- time window
- provider or technician
- status
- call or contact action

Safe statuses may include:

- requested
- confirmed
- rescheduled
- delayed
- on_the_way
- arrived
- completed
- revisit_needed

## 27. Recent Bills and Receipts Rule

Customer Home may show:

- provider name
- service category
- amount
- date
- receipt state

Receipt states may include:

- pending confirmation
- accepted
- disputed
- corrected
- linked to service
- saved in vault

## 28. Repeat Shortcut Rule

Repeat shortcuts may come from:

- accepted receipt
- completed service
- trusted provider contact
- customer’s own saved supplier list

Repeat shortcut actions may include:

- call
- approved external contact method
- book again
- view last service

Customer remains in control.

## 29. Empty Dashboard Rule

If customer has no records, show:

- simple promise
- first useful action

Suggested direction:

- save your first service bill and find it anytime
- add service
- upload bill

## 30. Final Boundary Rule

Customer dashboard must remain:

- trust-first
- action-first
- service-history-aware
- low-confusion
- non-business in feel

# PART 4 — CUSTOMER SCREEN-BY-SCREEN ARCHITECTURE

## 31. Customer Screen-by-Screen Architecture

### 31.1 Customer Home

Shows:

- summary tiles
- active complaint highlight
- recent service memory
- recent bills / receipts
- repeat-service shortcut
- pending claim status
- safe next actions

### 31.2 Complaints

Shows:

- open complaints
- acknowledged complaints
- revisit scheduled complaints
- resolved complaints
- reopened complaints
- closed complaints

### 31.3 Complaint Detail

Shows:

- original bill / service source
- complaint reason
- provider response
- status timeline
- revisit status
- customer confirmation action
- resolution / reopen options where allowed

### 31.4 Bills / Receipts

Shows:

- pending receipts
- accepted receipts
- disputed receipts
- corrected receipts
- linked property / appliance
- linked provider
- linked complaint status where applicable

### 31.5 Bill / Receipt Detail

Shows:

- receipt source
- provider context
- customer acceptance state
- correction / dispute state
- linked service record
- linked complaint / revisit chain
- trust-safe source labels

### 31.6 Service History

Shows:

- clean timeline of services
- bill-linked history
- complaint-linked history
- revisit chain
- provider-wise continuity
- appliance / property filters

### 31.7 Service Record Detail

Shows:

- service date
- provider context
- original service source
- bill / receipt link
- complaint status
- revisit history
- repeat-service option
- rating option where allowed

### 31.8 Claim Records

Shows:

- match found flow
- ownership verification
- claim old records
- claim success
- retry / skip / later behavior
- support-assisted review where future-approved

### 31.9 Provider Detail

Shows:

- provider type
- service relationship
- bills / services linked to this provider
- complaint / revisit history
- repeat-service option
- safe trust / continuity context

### 31.10 Notification Center

Shows:

- complaint received
- provider acknowledged
- visit confirmed
- delayed
- completed
- receipt ready
- correction requested
- revisit scheduled
- resolved
- reopened

### 31.11 Customer Vault / Profile

Shows:

- customer-owned profile memory
- property records
- appliance records
- service continuity
- claim status
- privacy controls where applicable

# PART 5 — CUSTOMER COMPLAINT UX, TIMELINE AND REOPEN SAFETY RULES

## 32. Customer Complaint Lifecycle

Customer complaint lifecycle states:

- draft
- submitted
- received
- acknowledged
- provider_questions
- technician_assigned
- visit_scheduled
- in_progress
- revisit_needed
- correction_pending
- resolved_by_provider
- customer_confirmation_pending
- resolved_confirmed
- reopened
- closed
- cancelled

## 33. Complaint Created

Customer can create complaint from:

- bill / receipt
- service record
- appliance detail
- property detail
- provider detail where linked record exists

Complaint must capture:

- original bill / service source
- complaint reason
- short description
- optional image / attachment in future-approved mode
- customer contact preference where safe
- affected appliance / property where relevant

## 34. Complaint Acknowledged

Provider acknowledgement means:

- provider has seen complaint
- provider accepts responsibility to respond
- next step is pending

Acknowledgement must not mean:

- complaint is solved
- customer has accepted resolution
- rating is unlocked
- revisit is completed

## 35. Technician Assigned

Technician assignment depends on original service source.

If Independent Technician source:

- assigned provider is the Independent Technician

If Shop Owner / shop source:

- complaint owner is Shop Owner
- relevant Shop Technician may be assigned / informed where applicable

Rule:

Customer UI must show who owns responsibility and who may visit.

## 36. Complaint In Progress

Complaint in progress means:

- provider is working on issue
- revisit / clarification / correction may be active
- customer should see status clearly

Customer must not be forced to close complaint while provider action is incomplete.

## 37. Revisit Needed

Revisit needed means:

- issue requires another visit
- revisit should link to original complaint
- revisit should preserve original service source
- customer should see scheduled / pending / completed status

## 38. Resolved by Provider

Provider may mark complaint as resolved.

But final closure may require customer confirmation where product rules require it.

Resolved by provider does not automatically mean closed.

## 39. Customer Confirmation Logic

Customer confirmation should be requested after provider resolution.

Customer may:

- confirm resolved
- request clarification
- reopen if issue remains
- close complaint where satisfied

Customer confirmation must not be hidden.

## 40. Closed

Complaint may close when:

- customer confirms resolved
- allowed closure rule is satisfied
- rating unlock condition is handled where applicable
- unresolved states are not hidden

Closed complaint must remain visible in service history.

## 41. Complaint UX Principle

Customer complaint UX must remain service-linked, customer-safe and simple.

It must help customer understand:

- which service this complaint is about
- who is responsible to respond
- what is current status
- whether revisit is needed
- whether issue is resolved
- whether it can be reopened

It must not become legal dispute handling, payment settlement, provider punishment automation or public review drama.

## 42. Complaint Start Points Rule

Customer may start complaint from:

- service detail
- bill detail
- receipt detail
- provider detail
- complaint list
- non-app receipt link
- support-assisted path later

Best path should remain:

- service, receipt or bill detail to raise complaint

## 43. Complaint Creation Screen Rule

Complaint creation should show:

- linked service or receipt summary
- provider, technician or shop name
- complaint reason selector
- issue description
- photo upload optional
- urgency selector optional
- preferred revisit time optional

Complaint creation must stay short and easy.

## 44. Complaint Created Success Rule

After complaint submission, show:

- complaint ID or reference
- linked service or receipt
- provider route
- current status
- expected next action

Do not promise:

- guaranteed refund
- legal action
- automatic provider penalty
- payment settlement

## 45. Complaint Detail Rule

Complaint detail must show:

- complaint reason
- issue description
- linked service or receipt
- provider, technician or shop
- current status
- timeline
- provider response
- revisit details
- customer actions

Customer actions may include:

- add more details
- upload photo
- reply to clarification
- view linked receipt
- call provider
- confirm resolved
- reopen issue
- contact support later

## 46. Complaint Timeline Rule

Timeline must show customer-safe events only.

Examples:

- complaint created
- complaint received
- provider acknowledged
- provider requested clarification
- technician assigned
- revisit scheduled
- revisit completed
- provider marked resolved
- customer confirmed resolved
- customer reopened issue
- support escalated
- complaint closed

Timeline must not show:

- internal staff notes
- hidden provider scoring
- payroll or attendance details
- shop internal dispatch comments

## 47. Provider Response Rule

Provider response may include:

- explanation
- clarification request
- proposed revisit
- resolution note
- correction note

Provider response must not close complaint automatically.

Customer must remain able to:

- accept response
- reply
- request revisit
- keep complaint open

## 48. Revisit UX Rule

If revisit is needed, customer should see:

- proposed date and time
- confirmed date and time
- provider or technician name
- status
- reason for revisit

Revisit must stay linked to original complaint and original service.

## 49. Resolution Rule

When provider marks complaint as resolved, customer must see:

- resolution note
- completed or revisit details if any
- confirmation question

Customer choices may include:

- yes, resolved
- not resolved or reopen
- need more help

Strong closure should require customer confirmation.

Weak closure must not become strong positive provider trust proof.

## 50. Reopen Rule

Customer may reopen complaint when:

- same issue continues
- revisit did not solve problem
- provider marked resolved too early
- correction was not accepted

Reopen must preserve:

- original complaint ID
- linked service or receipt
- previous resolution attempt
- reopen reason
- timeline history

## 51. Rating Rule

Rating prompt should appear only after:

- complaint is closed
- service is accepted or confirmed
- active dispute is not pending

Do not ask for rating while complaint is active, revisit is pending or receipt dispute is unresolved.

## 52. Non-App Complaint Continuity Rule

If customer does not have app, complaint may still be created through secure receipt or service link where supported.

App install prompt must remain optional and value-first.

## 53. Final Boundary Rule

Customer complaint UX must remain:

- linked to original service
- easy to submit
- provider-routed
- timeline-visible
- revisit-capable
- customer-confirmed
- reopen-safe
- rating only after closure

# PART 6 — CUSTOMER SERVICE HISTORY / RECORD TIMELINE

## 54. Customer Service History / Record Timeline

Service History must show all past services in a clean timeline.

Timeline should support:

- bill-linked service history
- complaint-linked history
- revisit chain
- provider-wise continuity
- appliance-wise filtering
- property-wise filtering
- claim-source labels
- corrected receipt labels
- disputed receipt labels

## 55. Service Timeline Event Types

service_timeline_event_type allowed values:

- service_created
- receipt_added
- receipt_accepted
- receipt_disputed
- receipt_corrected
- complaint_submitted
- complaint_acknowledged
- provider_replied
- revisit_scheduled
- revisit_completed
- complaint_resolved
- complaint_reopened
- rating_submitted
- record_claimed
- record_corrected

# PART 7 — CUSTOMER BILL, RECEIPT, ACCEPTANCE AND CORRECTION EXPERIENCE RULES

## 56. Customer Bill / Receipt Experience

Customer receipt states:

- pending_review
- accepted
- disputed
- correction_requested
- corrected
- rejected
- archived

Customer must be able to understand:

- who issued the bill
- which provider context issued it
- which service it belongs to
- whether it is accepted / disputed / corrected
- whether a complaint is linked
- whether it is claimed historical record or new record

## 57. Customer Bill Principle

Customer owns the vault.

A bill or receipt may come from:

- uploaded by customer
- sent by Independent Technician
- sent by Shop
- imported bill later
- claimed old record
- shared household record

The app must always explain why this bill or receipt is shown.

## 58. Receipt Source Label Rule

Every bill or receipt must show a clear source label.

Examples:

- uploaded by you
- sent by Independent Technician
- sent by Shop
- imported bill
- claimed old record
- shared household record

Customer must never wonder why a receipt appeared.

## 59. Receipt Trust Strip Rule

Every provider-sent receipt should show a trust strip with:

- provider name
- provider type
- HFM ID or Shop ID if available
- verification state
- receipt source
- receipt status

Allowed provider types:

- Independent Technician
- Shop
- Shop Technician under Shop
- Passive supplier or contact

Never fake verification.

## 60. Pending Receipt

Pending receipt means:

- provider submitted / created receipt
- customer has not accepted or disputed yet
- service memory is not fully confirmed by customer

Pending receipt must not be shown as final customer-approved truth.

Pending receipt should show:

- provider trust strip
- service category
- work description
- service date
- amount
- payment status reference
- proof or photo if available
- receipt number
- created date and time

Primary customer actions:

- accept
- report issue
- reject
- save for later

Safety text direction:

- accept this receipt only if it matches the service you received

Pending receipt must not enter strong history and must not strongly boost provider trust.

## 61. Accepted Receipt

Accepted receipt means:

- customer agrees receipt belongs to service
- record can become part of customer memory
- rating / complaint options may unlock depending on rules

Accepted does not mean legal verification in Phase-0.

After acceptance, customer may:

- save in vault
- link property
- link appliance
- raise complaint
- book again
- add private note

Accepted receipt should become part of customer history safely.

## 62. Disputed Receipt

Disputed receipt means:

- customer does not agree with receipt details
- correction / provider response may be needed
- dispute must preserve original receipt snapshot

Disputed receipt must not disappear.

Customer may dispute for reasons such as:

- I did not receive this service
- amount is wrong
- description is wrong
- payment status is wrong
- wrong customer
- duplicate receipt
- provider not recognized
- other

Disputed receipt:

- must stay visible
- must not become strong history
- must not boost provider trust strongly
- may later be corrected or voided

## 63. Corrected Receipt

Corrected receipt means:

- provider or allowed actor corrected receipt details
- before / after state must be preserved
- customer should review corrected version

If provider corrects receipt:

- customer must see correction summary
- old version remains audit-visible
- customer may accept corrected version
- customer may keep dispute open

Corrected receipt must not silently replace old receipt.

## 64. Rejected Receipt Rule

Rejected receipt must not become final customer vault truth.

It should remain audit-visible where required, but not become strong accepted history.

## 65. Property and Appliance Linking Rule

Customer may link accepted receipt to:

- property
- appliance
- service category

Linking may happen later.

Do not force customer to organize before saving value.

## 66. Safe Vault Storage Rule

Customer vault may store as final:

- accepted receipts
- customer-uploaded bills
- claimed historical records after verification
- complaint and revisit history linked to service

Customer vault must not treat as final:

- rejected receipt
- disputed unresolved receipt
- phone-match-only historical record
- provider-created receipt not accepted by customer

## 67. Final Boundary Rule

Customer bill and receipt UX must remain:

- source-clear
- customer-controlled
- correction-safe
- dispute-capable
- audit-aware
- vault-safe

# PART 8 — CUSTOMER CLAIM, REPEAT SERVICE, ALERTS AND DATA-SAFETY RULES

## 68. Customer Claim / Historical Record Experience

Historical claim supports old records that may exist before app adoption.

Claim flow states:

- not_started
- match_found
- verification_needed
- customer_review
- claim_submitted
- support_review_needed
- claim_approved
- claim_rejected
- claim_success
- skipped
- retry_later

## 69. Match Found Flow

Match found means:

- possible old record appears
- record must not be released automatically
- customer must review safe summary
- ownership verification may be required

## 70. Ownership Verification

Ownership verification may use:

- HomeFix Mitra ID / `hfmId`
- phone number bridge
- service details
- bill / receipt reference
- property / appliance context
- support-assisted review where future-approved

Phone number alone must not auto-release old records.

## 71. Claim Success Experience

Claim success should:

- import / link old record into customer service history
- preserve source label
- show provider context
- show confidence / claim status where needed
- allow customer to review

## 72. Retry / Skip / Later Claim

Customer may:

- retry claim
- skip claim
- claim later
- request support review where future-approved

Customer must not be forced to accept wrong records.

## 73. Historical Claim Experience Rule

Historical claim flow must remain:

- safe match summary first
- ownership verification next
- claim success, partial success or failure after verification
- customer-controlled save into history

Phone number may help discovery.

Phone number must not unlock old records by itself.

## 74. Match Summary Rule

Before verification, customer may see only safe summary such as:

- provider or shop name
- service category
- approximate month or date
- count of possible records

Must not show before verification:

- full bill image
- full address
- private notes
- detailed service history
- household data

## 75. Claim Verification Rule

Allowed stronger verification signals may include:

- HomeFix Mitra ID / `hfmId`
- secure claim link token
- receipt code or short code
- provider-issued claim code
- customer account confirmation
- support-assisted verification

## 76. Claim Outcome Rule

Claim outcomes may include:

- claim_success
- partial_claim_success
- claim_failed
- skipped
- claim_later
- support_required

Claim flow must not block normal app use.

Customer must be able to retry, skip or claim later.

## 77. Customer Repeat Service Experience

Repeat service helps customer continue with known provider.

Repeat service may start from:

- previous service record
- provider detail
- appliance detail
- property detail
- closed complaint
- completed revisit

Repeat service must show:

- original provider context
- previous service memory
- provider type
- customer control
- safe next action

## 78. Repeat Same Independent Technician

If previous service came from Independent Technician:

- repeat service targets that Independent Technician
- customer sees independent provider context
- complaint ownership remains independent source if complaint is linked

## 79. Repeat Shop Service

If previous service came from Shop Owner / shop:

- repeat service targets Shop Owner / shop
- Shop Owner owns relationship
- Shop Technician may be assigned later under shop context

Customer UI must not imply Shop Technician is independent provider.

## 80. Customer Control Rule

Customer control remains primary.

Customer must be able to:

- choose repeat service
- skip provider
- review provider context
- view past service before action
- avoid forced acceptance

## 81. Repeat Service Rule

Repeat service must remain customer-controlled.

Customer may start repeat service from:

- service detail
- bill detail
- receipt detail
- provider detail
- dashboard shortcut
- service history timeline

Customer may choose:

- call provider
- use approved external contact method
- send repeat request
- schedule revisit or request
- save reminder

Provider must not force repeat booking into customer flow.

## 82. Provider Continuity Rule

Customer must clearly see who they are contacting:

- Independent Technician
- Shop
- Shop Technician under shop
- Passive supplier or contact

Do not confuse shop-owned relationship with independent technician relationship.

## 83. Repeat Request State Rule

Customer repeat request states may include:

- draft
- sent
- provider_viewed
- provider_contacted
- appointment_proposed
- appointment_confirmed
- rescheduled
- cancelled_by_customer
- cancelled_by_provider
- completed
- expired

Cancelled and expired requests should remain in history.

## 84. Customer Notifications / Alerts Contract

Customer notification types:

- complaint_received
- complaint_acknowledged
- provider_question_received
- technician_assigned
- visit_confirmed
- visit_delayed
- revisit_scheduled
- revisit_completed
- receipt_ready
- receipt_correction_requested
- receipt_corrected
- receipt_disputed
- service_completed
- complaint_resolved
- complaint_reopened
- rating_required
- claim_match_found
- claim_approved
- claim_rejected
- claim_review_needed

## 85. Customer Notification Rule

Customer notifications must stay:

- helpful
- not noisy
- privacy-safe
- customer-controlled
- non-promotional
- simple
- source-linked
- non-alarming
- action-oriented
- role-safe

Customer notifications must not expose:

- provider private notes
- admin review notes
- shop internal staff notes
- other customer data
- hidden fraud logic

Allowed alert types may include:

- complaint received
- complaint acknowledged
- technician assigned
- visit confirmed
- visit delayed
- technician on the way
- service completed
- receipt ready
- correction available
- revisit scheduled
- complaint resolved
- complaint reopened
- claim match found
- claim success

## 86. Lock-Screen Privacy Rule

Customer alerts must avoid:

- full phone number
- full address
- detailed complaint description
- sensitive bill detail where unsafe
- provider internal notes

Use only customer-safe summaries.

## 87. Provider Spam Block Rule

Customer alerts must not become provider promotional spam.

No forced install pressure.

No provider follow-up spam.

No marketplace-style push noise.

## 88. Customer Trust / Safety Layer

Customer trust / safety layer must explain:

- why this record is shown
- which provider source created it
- what is verified vs not verified
- whether customer accepted it
- whether complaint / dispute exists
- whether the record is claimed / historical / demo-local

## 89. Verified vs Not Verified

In Phase-0, avoid fake verification claims.

Use safe wording:

- local record
- customer accepted
- provider-issued receipt
- claim pending
- claim approved in demo
- disputed
- corrected

Do not say:

- legally verified
- government verified
- payment verified
- identity verified

unless implemented safely in future production.

## 90. Privacy-Safe Linking

Customer records may link:

- bill to service
- service to property
- service to appliance
- complaint to bill
- revisit to complaint
- provider to service

Records must not link:

- unrelated customer data
- other household records without permission
- provider internal notes
- admin hidden data

## 91. Customer Data Safety Rule

Customer data must protect:

- customer ownership
- source truth
- receipt acceptance control
- complaint continuity
- claim safety
- repeat-service control

Customer can access only own records and allowed shared records.

Customer must not see:

- provider private notes
- shop internal dashboard data
- staff attendance
- provider earnings
- other customers’ records

## 92. Customer Data Model

### 92.1 CUSTOMER_PROFILE

Fields:

- customer_profile_id
- hfm_id
- customer_display_name
- profile_status
- created_at
- updated_at

### 92.2 CUSTOMER_PROPERTY

Fields:

- property_id
- customer_profile_id
- hfm_id
- property_label
- property_type
- property_status
- created_at
- updated_at

### 92.3 CUSTOMER_APPLIANCE

Fields:

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

### 92.4 CUSTOMER_SERVICE_RECORD

Fields:

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

### 92.5 CUSTOMER_COMPLAINT_RECORD

Fields:

- complaint_id
- hfm_id
- customer_profile_id
- service_record_id
- bill_receipt_id_optional
- provider_context
- original_service_source_id
- complaint_reason
- complaint_status
- customer_confirmation_status
- created_at
- updated_at

### 92.6 CUSTOMER_CLAIM_RECORD

Fields:

- claim_record_id
- hfm_id
- customer_profile_id
- possible_source_record_id
- claim_status
- match_confidence_label
- verification_method
- created_at
- updated_at

## 93. Customer Permission Rules

Customer can:

- view own records
- create local service memory
- review bills / receipts
- accept / dispute receipts
- create complaint
- reopen complaint where allowed
- claim old records
- repeat service
- manage own properties / appliances
- view own notifications

Customer cannot:

- access provider private operations
- change provider-owned receipt truth silently
- view other customers
- access admin governance
- force provider internal assignment
- claim old records by phone number alone

## 94. Customer UX Quality Rules

Customer UX must be:

- memory-first
- calm
- premium
- readable
- trust-safe
- low-confusion
- action-clear
- provider-context-visible

Customer first-read must answer:

- What happened?
- Who provided service?
- Which bill is linked?
- Is anything pending?
- Is complaint active?
- Is revisit scheduled?
- What can I do now?

## 95. Customer Empty States

Customer home empty state:

- Your home service memory will appear here.
- Add a bill, service record, appliance, or property to get started.

## 96. Final Boundary Rule

Customer-side advanced flow must remain:

- trust-first
- claim-safe
- repeat-service ready
- alert-safe
- privacy-safe
- customer-controlled
