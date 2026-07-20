# HOMEFIX MITRA — COMPLAINT AND REVISIT GOVERNANCE

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Complaint and Revisit Governance defines the cross-provider complaint, revisit, resolution, reopen, confirmation and re-review truth of HomeFix Mitra.

Complaints and revisits must stay linked to the original bill / receipt / service source so customer trust, provider responsibility and record continuity remain clear.

This document applies across:

- Customer
- Independent Technician
- Shop Owner
- Shop Technician under shop context
- Admin / support governance where future-approved

## 3. Core Principle

Complaint ownership follows original service source.

Revisit ownership follows complaint source.

Resolution requires clear provider action and customer-safe closure.

Complaint history must not disappear from service memory.

## 4. What Complaint Governance Is

Complaint Governance is:

- bill-linked complaint routing
- original service source responsibility
- provider response discipline
- revisit linkage
- customer confirmation logic
- reopen logic
- resolution history
- rating unlock control
- correction and re-review model

## 5. What Complaint Governance Is Not

Complaint Governance is not:

- public shaming system
- uncontrolled social review system
- provider punishment without evidence
- admin enforcement in Phase-0
- legal dispute arbitration
- payment refund system in Phase-0
- hidden provider surveillance system

## 6. Hard Non-Mixing Rule

Complaint must not be routed by guesswork.

Complaint must not be routed only by:

- who visited last
- who is currently logged in
- who is nearest
- who is free
- who the customer remembers casually
- who the app guesses from phone number

Complaint must be routed by:

- original bill / receipt source
- original service record source
- provider context
- linked service relationship

Phone number may help continuity lookup, but it must not decide complaint ownership by itself.

Phone number is not final ownership proof.

## 7. Provider Context Routing Rule

### 7.1 Independent Technician Source

If original service source is Independent Technician:

- complaint owner = Independent Technician
- revisit owner = Independent Technician
- response responsibility = Independent Technician
- receipt correction responsibility = Independent Technician where receipt issue exists

### 7.2 Shop Owner / Shop Source

If original service source is Shop Owner / shop:

- complaint owner = Shop Owner
- revisit owner = Shop Owner
- response responsibility = Shop Owner
- Shop Technician may be assigned / informed where applicable
- receipt correction responsibility = Shop Owner

### 7.3 Shop Technician Under Shop Context

If Shop Technician performed the visit under shop:

- technician may be involved in revisit / clarification
- technician may submit update
- technician may help execute revisit
- Shop Owner remains owner of complaint truth

## 8. Complaint Entry Points

Complaint may be created from:

- bill / receipt detail
- service record detail
- appliance detail where linked service exists
- property detail where linked service exists
- provider detail where linked service exists
- service history timeline item
- customer notification where linked record exists
- secure receipt or service link where supported for non-app customers

Complaint must not be created without enough source context unless it becomes a draft / support-needed complaint.

Customer app installation must not be mandatory for complaint acceptance, revisit handling or basic service follow-up.

## 9. Complaint Required Source Fields

Every complaint must preserve:

- complaint_id
- customer_id
- service_record_id
- bill_receipt_id_optional
- provider_context
- original_service_source_id
- complaint_reason
- complaint_status
- customer_confirmation_status
- created_at
- updated_at

## 10. Complaint Reason Categories

`complaint_reason_category` allowed values:

- issue_not_fixed
- same_issue_returned
- new_issue_after_service
- wrong_part_or_work
- bill_or_receipt_issue
- delayed_service
- provider_no_response
- revisit_not_completed
- safety_or_trust_concern
- other

## 11. Complaint Lifecycle

`complaint_status` allowed values:

- draft
- submitted
- received
- acknowledged
- provider_questions
- customer_reply_pending
- technician_review_needed
- technician_assigned
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

## 12. Valid Complaint Transitions

- draft to submitted
- submitted to received
- received to acknowledged
- acknowledged to provider_questions
- provider_questions to customer_reply_pending
- customer_reply_pending to acknowledged
- acknowledged to revisit_needed
- revisit_needed to revisit_scheduled
- revisit_scheduled to revisit_in_progress
- revisit_in_progress to revisit_completed
- revisit_completed to resolved_by_provider
- acknowledged to correction_pending
- correction_pending to resolved_by_provider
- resolved_by_provider to customer_confirmation_pending
- customer_confirmation_pending to resolved_confirmed / reopened
- resolved_confirmed to closed
- reopened to acknowledged / revisit_needed / support_review_needed

## 13. Blocked Complaint Transitions

Blocked:

- submitted to closed without provider / customer flow
- acknowledged to closed without resolution
- resolved_by_provider to closed without customer confirmation where required
- reopened to closed without new resolution state
- shop complaint to technician-owned complaint
- independent complaint to shop-owned complaint silently
- complaint to admin enforcement without governance case
- complaint deletion that hides history from service memory
- phone match to complaint ownership
- customer app not installed to complaint rejection

## 14. Complaint Created Rule

Complaint creation must capture:

- original record source
- customer reason
- safe description
- optional image / attachment only where future-approved
- affected appliance / property where relevant
- linked bill / receipt where available

Complaint creation must not:

- expose provider private notes
- notify unrelated staff
- create public negative review automatically
- trigger real legal / refund flow in Phase-0
- force app installation before complaint is accepted

## 15. Non-App Complaint Continuity Rule

A customer who has not installed HomeFix Mitra may still have a complaint, revisit or follow-up path where supported through a secure receipt link, service link, provider-side entry or future support-assisted flow.

Non-app continuity must remain:

- source-linked
- privacy-safe
- limited to the relevant service or receipt
- value-first
- not pressure-based

Non-app continuity must not unlock:

- full customer vault
- historical records by phone match alone
- unrelated service history
- household data
- provider internal notes
- admin evidence

App install invitation may be shown only as optional value:

- save records
- find bills later
- follow complaint status more easily
- preserve service memory

## 16. Complaint Acknowledgement Rule

Acknowledgement means:

- provider has received complaint
- provider is responsible to respond
- customer can track that complaint is not ignored

Acknowledgement does not mean:

- issue solved
- complaint closed
- revisit completed
- customer satisfied
- rating unlocked

## 17. Provider Questions Rule

Provider may ask questions when:

- issue is unclear
- appliance / property context is missing
- revisit needs more detail
- receipt correction needs clarification

Provider questions must be:

- specific
- respectful
- source-linked
- not used to delay unfairly
- visible to customer where appropriate

## 18. Revisit Needed Rule

Revisit needed means:

- issue requires another visit / inspection / correction
- revisit links to complaint
- revisit links to original service
- revisit preserves provider context

Revisit needed must not:

- erase original complaint
- create unrelated new service by default
- change provider ownership silently
- close complaint automatically

## 19. Revisit Lifecycle

`revisit_status` allowed values:

- not_required
- requested
- proposed
- scheduled
- reschedule_requested
- confirmed
- visit_pending
- in_progress
- completed
- customer_confirmation_pending
- failed
- cancelled
- closed

## 20. Valid Revisit Transitions

- requested to proposed
- proposed to scheduled
- scheduled to confirmed
- confirmed to visit_pending
- visit_pending to in_progress
- in_progress to completed
- completed to customer_confirmation_pending
- customer_confirmation_pending to closed / failed / reschedule_requested
- reschedule_requested to proposed / scheduled

## 21. Revisit Must Preserve

Every revisit must preserve:

- revisit_id
- complaint_id
- service_record_id
- bill_receipt_id_optional
- customer_id
- provider_context
- responsible_provider_id
- assigned_technician_id_optional
- scheduled_at_optional
- revisit_status
- completion_note_optional
- customer_confirmation_status
- created_at
- updated_at

## 22. Revisit Completion Rule

Revisit completion means:

- provider / technician says revisit work is completed
- customer should review result
- complaint may move toward resolution

Revisit completion does not automatically mean:

- complaint closed
- customer satisfied
- rating unlocked
- bill correction accepted
- provider fully cleared

## 23. Customer Confirmation Rule

Customer confirmation is the customer-side closure control.

Customer may:

- confirm resolved
- say issue remains
- request clarification
- reopen complaint where allowed
- accept corrected receipt where linked

Customer confirmation must be visible, simple and non-forced.

## 24. Resolution Rule

Complaint may be resolved when:

- provider response is recorded
- revisit completed where required
- receipt correction completed where required
- customer confirmation is completed where required
- no active reopen condition exists

Resolved complaint must stay visible in service history.

## 25. Reopen Rule

Complaint may be reopened when:

- same issue remains
- revisit did not fix issue
- corrected receipt is still wrong
- provider response is incomplete
- customer confirmation fails
- support / admin review is needed

Reopen must preserve:

- original complaint
- previous resolution state
- reopen reason
- actor
- timestamp
- next required action

# PART 2 — COMPLAINT DETAIL, TIMELINE, EVIDENCE AND FAIRNESS RULES

## 26. Complaint Detail UX Rule

Complaint detail must help customer and provider understand:

- which original service this complaint belongs to
- who owns response responsibility
- whether revisit is needed
- what is the current status
- what action is pending next
- whether correction is linked
- whether support review is needed later

Complaint detail must not expose:

- unrelated customer history
- provider private internal notes
- hidden admin scoring
- irrelevant shop operations notes
- punishment language without governance review

## 27. Complaint Timeline Rule

Complaint timeline should preserve customer-safe and provider-safe event history such as:

- complaint created
- complaint received
- provider acknowledged
- provider asked question
- customer replied
- technician assigned
- revisit scheduled
- revisit completed
- correction pending
- provider marked resolved
- customer confirmed
- complaint reopened
- support review needed
- complaint closed

Timeline must remain:

- source-linked
- audit-friendly
- non-manipulative
- visible enough for trust
- safe from internal-only leakage

## 28. Evidence and Context Rule

Complaint handling may rely on evidence such as:

- service record link
- bill / receipt link
- customer explanation
- provider response
- revisit completion note
- corrected receipt state
- linked property / appliance context
- timeline events

Evidence must support fair review.

Evidence must not be treated as automatic punishment by itself.

## 29. Weak Closure Rule

Weak closure may exist when:

- provider marked resolved
- customer did not respond for a defined period
- case is closed as inactive or no-response

Weak closure must:

- stay visibly weaker than customer-confirmed closure
- not become strong positive provider trust proof
- preserve reopen path where allowed

## 30. Strong Closure Rule

Strong closure should mean:

- provider completed response or revisit
- customer confirmed issue resolved
- required correction is handled
- complaint timeline remains preserved

Strong closure may unlock rating where applicable.

# PART 3 — APPEAL, RE-REVIEW, ADMIN SUPPORT AND GOVERNANCE BOUNDARY RULES

## 31. Appeal / Re-review Logic

Future support / admin re-review may apply when:

- customer and provider disagree
- repeated unresolved complaint exists
- wrong provider source is suspected
- receipt correction is disputed
- privacy / claim issue affects complaint
- abuse / fake complaint concern exists

Re-review must be:

- case-based
- evidence-aware
- audit-tracked
- not automatic punishment
- hidden from public UI

## 32. Support Review Trigger Rule

Support or admin review may be needed when:

- complaint source appears wrong
- provider and customer histories conflict
- repeated reopen pattern exists
- revisit completion is disputed
- linked receipt appears unsafe or wrong
- claim/privacy issue intersects with complaint
- customer or provider requests escalation later

## 33. Fairness Rule

Complaint governance must remain fairness-based.

Rules:

- one complaint alone does not prove abuse
- provider must have response opportunity where appropriate
- customer must have reopen path where appropriate
- timeline must not be rewritten to force closure
- evidence must be reviewed in context
- resolution language must not imply legal judgment in Phase-0

## 34. Governance Boundary Rule

Complaint governance may later connect to hidden admin system, but this file must not turn into a visible admin workflow.

Normal complaint UX must remain:

- customer-safe
- provider-routed
- source-linked
- revisit-capable
- closure-safe

Admin/support actions must remain hidden, case-scoped, audit-aware and future-approved.

Admin/support review must not become visible punishment, public shaming or normal provider workflow shortcut.

## 35. Rating Unlock Rule

Rating may unlock only when:

- service is completed
- complaint is resolved / closed where complaint exists
- revisit is completed where required
- customer confirmation rule is satisfied where applicable

Rating must not unlock during:

- active complaint
- active revisit
- unresolved dispute
- correction pending
- support review pending

## 36. Complaint Notification Contract

Customer notifications:

- complaint_submitted
- complaint_received
- complaint_acknowledged
- provider_question_received
- customer_reply_needed
- revisit_needed
- revisit_scheduled
- revisit_reschedule_requested
- revisit_completed
- correction_pending
- complaint_resolved_by_provider
- customer_confirmation_needed
- complaint_reopened
- complaint_closed
- support_review_needed

Provider notifications:

- complaint_received
- customer_reply_received
- revisit_needed
- revisit_schedule_needed
- revisit_completed
- customer_confirmation_pending
- complaint_reopened
- correction_needed
- support_review_needed

Shop Technician notifications where assigned:

- complaint_review_requested
- revisit_assigned
- revisit_update_needed
- revisit_completed_update_needed

## 37. Safe Complaint Wording

Good examples:

- Complaint received.
- Provider acknowledged your complaint.
- A revisit was scheduled.
- Please confirm if the issue is resolved.
- Complaint reopened because the issue still remains.

Avoid wording that implies:

- legal judgment
- guaranteed refund
- automatic provider punishment
- payment settlement
- government or official verification
- complaint rejection only because app is not installed

## 38. Final Boundary Rule

Complaint and revisit governance must remain:

- source-linked
- provider-responsibility aware
- revisit-aware
- correction-aware
- customer-confirmation safe
- reopen-safe
- fairness-based
- audit-friendly
- not a legal or payment judgment system
