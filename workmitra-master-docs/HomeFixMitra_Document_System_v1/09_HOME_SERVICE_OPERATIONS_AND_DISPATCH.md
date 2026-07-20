# HOMEFIX MITRA — HOME SERVICE OPERATIONS AND DISPATCH

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Home Service Operations and Dispatch defines the future-ready service coordination, assignment, acknowledgement, reassignment, multi-staff handling, exception tracking, day-summary and light operational control architecture of HomeFix Mitra.

This document mainly supports Shop Owner and Shop Technician coordination, but must also respect Independent Technician boundaries.

Operations and dispatch must remain:

- provider-context-safe
- customer-privacy-safe
- assignment-aware
- complaint-linked
- revisit-linked
- receipt-aware
- non-payroll in Phase-0
- non-legal-attendance in Phase-0
- enterprise-grade

## 3. Core Principle

Operations / dispatch = service coordination support.

It is not payroll.

It is not legal attendance.

It is not admin punishment.

It is not customer surveillance.

It is not payment processing in Phase-0.

## 4. What Operations and Dispatch Is

Operations and Dispatch is:

- a service coordination layer
- an assignment management layer
- a shop technician work coordination model
- a revisit assignment model
- a complaint response coordination layer
- a day-summary and exception tracking model
- a future manager / dispatch integration-ready architecture

## 5. What Operations and Dispatch Is Not

Operations and Dispatch is not:

- Admin System
- payroll
- legal attendance system
- payment settlement system in Phase-0
- emergency dispatch guarantee
- unrestricted staff surveillance
- customer vault access system
- public customer-facing pressure tool
- replacement for complaint governance

## 6. Hard Non-Mixing Rule

Operations must not rewrite provider truth.

Independent Technician service remains independent.

Shop Owner service remains shop-owned.

Shop Technician assignment remains shop-context execution.

Operations / dispatch must not:

- convert Shop Technician into Independent Technician
- make technician owner of shop receipt
- make technician owner of shop complaint
- make assignment status into payroll proof
- expose shop internal operations to customer
- bypass complaint closure rules
- use phone number as customer vault access
- require customer app installation for basic service coordination

## 7. Scope

Operations / dispatch may support:

- shop service assignments
- technician acknowledgement
- visit status updates
- reassignment / transfer
- complaint revisit coordination
- multi-technician handling
- exception tracking
- day summary
- light operational attendance labels
- future manager / dispatcher roles

Operations / dispatch must avoid:

- real salary/payroll handling
- real payment settlement
- legal staff attendance claims
- real-time tracking without clear product/legal basis
- background monitoring
- hidden customer data access
- customer app-install pressure
- phone-number-based customer vault lookup

## 8. Customer App and Phone Boundary Rule

Operations / dispatch must not require the customer to install HomeFix Mitra before a service visit, revisit, complaint follow-up or basic provider coordination can happen.

Customer app installation may be invited only as optional value:

- save service records
- find bills later
- track complaints more easily
- preserve service memory

Phone number may support customer contact, service coordination and continuity lookup.

Phone number must not:

- prove customer ownership
- unlock customer vault
- reveal unrelated service history
- expose household records
- expose property or appliance lists
- decide complaint or receipt ownership by itself

Operations may show only the customer context required for the relevant service, revisit, complaint or receipt workflow.

## 9. Role Fit

### 9.1 Shop Owner

Shop Owner uses operations / dispatch to:

- assign service work
- assign revisits
- monitor acknowledgement
- review technician updates
- reassign work where needed
- handle exceptions
- view day summary
- keep customer service continuity clear

### 9.2 Shop Technician

Shop Technician uses operations / dispatch to:

- view assigned tasks
- acknowledge assignment
- update visit status
- flag issues
- complete assigned revisit update
- return work status to Shop Owner

### 9.3 Independent Technician

Independent Technician may use light self-operations only for own work.

Independent Technician is not part of shop dispatch unless separate future association is explicitly approved.

### 9.4 Customer

Customer may see only safe status:

- visit scheduled
- technician assigned where safe
- visit in progress where safe
- revisit scheduled
- service completed
- provider response pending

Customer must not see:

- shop internal dispatch notes
- staff performance notes
- reassignment reasons that are internal
- payroll / attendance labels
- admin / governance notes

### 9.5 Admin

Admin may review operational misuse only through Admin System.

Admin must not run provider operations directly.

# PART 1 — SCREEN-BY-SCREEN OPERATIONS ARCHITECTURE

## 10. Screen-by-Screen Architecture

### 10.1 Operations Home

Shows:

- today’s service work
- pending assignments
- technician acknowledgement needed
- active visits
- revisit assignments
- exception count
- day summary

### 10.2 Assignment Board

Shows:

- unassigned work
- assigned work
- acknowledged assignments
- pending updates
- completed assignments
- reassigned work
- cancelled assignments

### 10.3 Assignment Detail

Shows:

- source service record
- provider context
- customer-safe service summary
- assigned technician
- acknowledgement state
- visit state
- update timeline
- exception state
- allowed actions

### 10.4 Technician Acknowledgement Queue

Shows:

- assignments needing acknowledgement
- assignment age
- scheduled time
- urgency / priority label
- resend / reassign option where allowed

### 10.5 Reassignment / Transfer Screen

Used when:

- technician unavailable
- assignment not acknowledged
- customer rescheduled
- skill mismatch
- revisit needs different technician
- service priority changed

### 10.6 Multi-Technician Handling

Shows:

- primary technician
- assisting technician(s)
- task split
- update ownership
- completion responsibility
- Shop Owner final review

### 10.7 Exception Queue

Shows:

- not acknowledged
- delayed
- no update
- customer unavailable
- technician unavailable
- revisit failed
- complaint unresolved
- receipt blocked
- service closure pending

### 10.8 Day Summary

Shows:

- services completed
- visits pending
- complaints handled
- revisits completed
- receipts pending
- exceptions carried forward
- technician updates pending

### 10.9 Future Manager / Dispatch Integration

Reserved for future approved manager / dispatcher role.

Must remain hidden unless explicitly approved.

# PART 2 — OPERATIONS STATE MODELS AND TRANSITION RULES

## 11. Operations State Models

### 11.1 ops_assignment_status

Allowed values:

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

### 11.2 ops_exception_status

Allowed values:

- none
- detected
- queued
- in_review
- action_needed
- waiting_for_technician
- waiting_for_customer
- waiting_for_shop_owner
- resolved
- carried_forward
- closed

### 11.3 ops_day_summary_status

Allowed values:

- not_started
- active_day
- review_needed
- unresolved_items
- completed
- carried_forward

## 12. Valid Assignment Transitions

- unassigned to assignment_pending
- assignment_pending to assigned
- assigned to acknowledgement_needed
- acknowledgement_needed to acknowledged
- acknowledged to visit_scheduled
- visit_scheduled to visit_started
- visit_started to update_needed
- update_needed to update_submitted
- update_submitted to visit_completed
- visit_completed to completion_review_needed
- completion_review_needed to completed
- completed to closed

Exception paths:

- acknowledgement_needed to reassignment_needed
- assigned to cancelled
- visit_scheduled to cancelled
- update_needed to exception_open
- exception_open to resolved / carried_forward

## 13. Blocked Transitions

Blocked:

- assignment completed to receipt accepted automatically
- technician update to shop complaint closed automatically
- technician assignment to payroll proof
- visit started to legal attendance proof
- reassignment to erase original assignment history
- operations item to admin punishment without governance case
- operations item to customer vault access
- shop dispatch to independent technician service without explicit source rule
- customer app not installed to service coordination rejection
- phone match to customer vault access
- technician completion to provider ownership transfer

## 14. Assignment Rule

Assignment must preserve:

- assignment ID
- shop owner ID
- technician ID
- source service record
- source complaint / revisit if any
- assigned by
- assigned at
- acknowledgement state
- current status
- update timeline

Assignment must not erase original service source.

## 15. Acknowledgement Rule

Acknowledgement means technician has seen the task.

Acknowledgement does not mean:

- service completed
- customer accepted work
- receipt issued
- complaint resolved
- legal attendance recorded
- payment due / paid

## 16. Transfer / Reassignment Rule

Transfer or reassignment may happen when:

- assigned technician is unavailable
- no acknowledgement received
- customer rescheduled
- technician flagged inability
- skill mismatch
- revisit needs different technician
- operational priority changed

Reassignment must preserve:

- original assigned technician
- new assigned technician
- reassignment reason
- actor
- timestamp
- customer-safe status where needed

Reassignment must not:

- delete original assignment
- hide delay
- change service source
- change complaint owner
- change receipt owner

## 17. Multi-Staff Handling Rule

Multi-staff work may include:

- primary technician
- assisting technician
- shop owner involvement
- specialist handoff
- revisit technician

Rules:

- one responsible owner must remain clear
- Shop Owner remains shop service owner
- technicians are contributors / assignees
- customer-facing status must remain simple
- internal task split must not confuse customer

## 18. Exception Rules

Exception may be opened for:

- no acknowledgement
- technician unavailable
- visit delayed
- customer unavailable
- no update submitted
- revisit failed
- receipt blocked
- complaint unresolved
- closure pending
- reassignment needed

Exception must preserve:

- source record
- reason
- responsible role
- severity
- next action
- timestamp

Exception must not become:

- admin punishment automatically
- payroll deduction automatically
- public blame
- legal attendance claim

## 19. Day Summary Rule

Day Summary should support:

- review of completed work
- unresolved items
- carry-forward items
- pending receipt items
- pending complaint items
- pending technician updates
- next-day readiness

Day Summary must not:

- become payroll summary in Phase-0
- become legal attendance report
- expose internal staff notes to customer
- close unresolved complaints silently

## 20. Notification / Alert Contract

Shop Owner operation notifications:

- assignment_needed
- technician_acknowledgement_needed
- technician_acknowledged
- visit_started
- visit_update_submitted
- visit_completed
- reassignment_needed
- exception_opened
- day_summary_review_needed
- carry_forward_needed
- receipt_blocked
- complaint_revisit_blocked

Shop Technician operation notifications:

- assignment_received
- acknowledgement_needed
- visit_scheduled
- visit_update_needed
- reassigned
- revisit_assigned
- exception_needs_response
- completion_note_needed

Customer-safe operation notifications:

- visit_scheduled
- technician_assigned
- visit_delayed
- revisit_scheduled
- service_completed
- provider_update_available

Admin future notifications:

- operational_misuse_review_needed
- repeated_unresolved_exception_pattern
- dispatch_privacy_review_needed

## 21. Safe Notification Wording

Good examples:

- A technician was assigned to your shop service.
- Visit update was submitted.
- This service needs reassignment.
- Day summary has unresolved items.

Avoid wording that implies:

- payroll action
- legal attendance proof
- customer app required
- provider punishment
- customer vault access
- payment settlement

# PART 3 — LIGHT OPERATIONAL ATTENDANCE, READINESS AND MANAGER CONSOLE SAFETY RULES

## 22. Light Operational Attendance Rule

Operational attendance exists only to support same-day service planning.

It may help answer:

- who is available today
- who can be assigned now
- who is already busy
- who is on leave
- who needs replacement assignment
- which promised customer visit is at risk

It must not become HR attendance, payroll, salary truth, legal attendance proof, GPS surveillance or punishment automation.

## 23. Technician Daily Status Rule

Technician daily status may include:

- available
- assigned
- busy
- on_leave
- unavailable
- emergency_only
- no_response
- day_closed

These are operational planning states only.

## 24. Manager Console Daily Board Rule

Manager Console may show a daily technician board with:

- technician name
- role or context
- daily status
- active assignments count
- completed jobs today
- pending revisits
- no-response flag
- next available indicator

It must not show:

- salary calculation
- payroll amount
- legal attendance report
- biometric proof
- live GPS trail
- private absence reason unless voluntarily shared

## 25. Assignment Readiness Rule

Technician may be assigned only when status is:

- available
- emergency_only for urgent job only

Technician should not be assigned when status is:

- on_leave
- unavailable
- no_response
- day_closed

If assigned while busy, system should warn manager and allow override with reason.

## 26. Readiness Badge Rule

Manager Console may show simple readiness badges:

- ready_to_assign
- already_assigned
- busy_now
- emergency_only
- not_available_today
- no_response
- day_closed

Badge is decision support only.

Manager remains responsible for final assignment decision.

## 27. Override Reason Rule

Manager may override assignment warning only with reason.

Override reasons may include:

- emergency job
- technician agreed by phone
- customer requested same technician
- no alternative available
- revisit continuity required

Override is operational note only.

It must not become payroll or disciplinary proof.

## 28. No-Response Handling Rule

If technician does not respond to assignment or availability check, status may become:

- no_response

Manager may then:

- call technician
- reassign job
- mark unavailable for today
- keep assignment pending
- carry forward non-urgent job

No-response is operational state only.

It must not automatically become HR punishment or payroll deduction.

## 29. Day-End Operational Review Rule

At day end, manager may review:

- technicians available today
- jobs assigned
- jobs completed
- pending revisits
- no-response cases
- carried-forward jobs

Allowed actions:

- close operational day
- carry forward unfinished work
- mark revisit needed
- add operational note
- reschedule visit

Not allowed:

- calculate salary
- mark legal attendance
- create payroll deduction
- create disciplinary action automatically

## 30. Technician Self-Status Rule

Technician may update:

- available
- busy
- unavailable
- emergency_only
- day_closed

This is operational signal only.

It must not become automatic attendance or payroll truth.

## 31. Customer-Safe Status Translation Rule

Customer should see only service-relevant updates such as:

- visit confirmed
- technician assigned
- delayed
- rescheduled
- on the way
- completed
- provider will confirm timing

Customer must not see:

- technician attendance status
- internal leave status
- no-response internal label
- manager staffing issue
- override reason

## 32. Data Boundary Rule

Operational attendance records may store:

- date
- technician_id
- shop_id
- daily_status
- status_source
- active_assignment_count
- completed_assignment_count
- pending_revisit_count
- optional manager_note
- optional technician_note

Operational attendance records must not store:

- biometric data
- continuous GPS trail
- payroll amount
- salary deduction
- legal attendance certificate

## 33. Final Boundary Rule

Light operational attendance must remain:

- lightweight
- service-planning focused
- dispatch-supportive
- customer-service-safe

It must never become:

- HR
- payroll
- legal attendance
- surveillance
- punishment automation

# PART 4 — FUTURE PAYMENT COMPATIBILITY, PAYMENT-INDEPENDENT CORE AND SAFETY RULES

## 34. Payment-Independent Core Rule

HomeFix Mitra must remain primarily:

- home service memory
- bill vault
- receipt history
- complaint continuity
- repeat-service assistant

It must not become:

- wallet
- payment gateway
- escrow platform
- lending or credit system
- debt collection platform
- payroll system
- accounting or tax filing product

## 35. Payment Compatibility Rule

Future payment compatibility is allowed.

Payment ownership inside HomeFix Mitra core is not allowed.

If payment is added later, it should be handled by a separate Mitra Labs payment platform connected through a clean integration boundary.

## 36. Current Payment Scope Rule

Current app may store only service-reference payment status such as:

- paid
- pending
- partially_paid

This is memory/reference only.

It is not:

- payment settlement proof
- legal payment confirmation
- debt recovery record
- salary or payroll truth
- tax or accounting truth

## 37. Service, Receipt and Payment Separation Rule

These truths must remain separate:

- service record truth
- receipt truth
- payment reference truth
- external payment truth

One must not overwrite the other.

## 38. Optional External Payment Fields Rule

Future payment fields must remain optional.

Examples may include:

- external_payment_platform
- external_payment_reference_id
- external_payment_link_id
- external_payment_status_readonly
- external_settlement_status_readonly
- external_payment_receipt_reference

Core HomeFix Mitra flows must work without these fields.

## 39. Read-Only Payment Display Rule

HomeFix Mitra may later show payment status from connected payment platform as read-only reference.

Safe wording may include:

- Payment status is recorded for service reference only.
- Payment handled through connected payment service.

Avoid wording such as:

- payment legally confirmed
- debt cleared
- salary paid
- settlement guaranteed
- tax invoice filed
- payment enforced by HomeFix Mitra

## 40. Complaint and Payment Separation Rule

Complaint flow must not depend on payment integration.

Rules:

- customer can raise complaint even if payment is pending
- provider can respond even without payment integration
- service complaint and payment dispute remain separate concepts
- HomeFix Mitra must not act as payment dispute judge

## 41. UI Safety Rule

HomeFix Mitra UI may show:

- payment status reference
- pending amount reference
- external payment link later
- external payment status read-only later

HomeFix Mitra UI must not show:

- wallet balance
- escrow holding
- loan or credit offer
- salary payout
- legal debt collection
- tax filing report

## 42. Security Rule

HomeFix Mitra must not store:

- raw card data
- bank credentials
- payment gateway secrets
- wallet balance ledger
- settlement ledger

Future integration must use:

- external reference IDs
- scoped tokens
- permission checks

## 43. Final Boundary Rule

HomeFix Mitra must remain payment-compatible but payment-independent.

Core identity must remain:

- service memory
- bill vault
- receipt history
- complaint continuity
