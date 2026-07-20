# HOMEFIX MITRA — SHOP TECHNICIAN CONTEXT ARCHITECTURE

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

Shop Technician Context Architecture defines the technician role under a Shop Owner / shop service context.

Shop Technician is not the same as Independent Technician.

A Shop Technician may execute service visits, submit service updates, participate in complaint or revisit work, and coordinate under shop authority, but the Shop Owner / shop remains the owner of shop-side service relationship, bill / receipt truth, complaint ownership and customer continuity.

Shop Technician Context Architecture must remain:

- shop-context-bound
- assignment-based
- execution-focused
- privacy-limited
- receipt-limited
- complaint-involvement-aware
- separate from Independent Technician
- separate from Shop Owner ownership truth
- Phase-0 demo-safe

## 3. Core Principle

Shop Technician = technician under shop context.

Shop Technician may help execute work.

Shop Technician does not automatically own:

- shop receipt truth
- shop complaint responsibility
- shop customer relationship
- shop provider profile
- shop trust identity
- customer vault access
- independent provider identity

## 4. What Shop Technician Context Is

Shop Technician Context is:

- a shop-linked execution role
- a technician assignment context
- a visit / service update flow
- a complaint / revisit involvement flow
- a limited visibility role under Shop Owner
- a future-ready operational role

## 5. What Shop Technician Context Is Not

Shop Technician Context is not:

- Independent Technician domain
- Shop Owner domain
- shop receipt ownership
- shop complaint ownership
- customer vault ownership
- admin governance console
- payment processing system in Phase-0
- legal service verification authority
- public provider profile by default
- uncontrolled staff surveillance system

## 6. Hard Non-Mixing Rule

Shop Technician must not be silently converted into Independent Technician.

A service performed by a Shop Technician under shop assignment remains shop-context service.

Shop Technician can be involved in:

- assigned service visit
- revisit
- complaint clarification
- service update
- completion note

Shop Technician must not become owner of:

- shop receipt
- shop complaint
- shop customer relationship
- shop service source

Shop Technician work must not silently become:

- independent technician service truth
- Shop Owner personal-service truth
- customer-owned provider truth
- admin-governance truth without case reason

## 7. Role Fit

### 7.1 Shop Technician

Shop Technician uses HomeFix Mitra to:

- view assigned shop services
- acknowledge assignment
- see visit details needed for work
- update visit status where allowed
- submit completion note where allowed
- participate in complaint / revisit work
- view own assignment notifications
- manage own limited work context where future-approved

### 7.2 Shop Owner

Shop Owner uses Shop Technician context to:

- assign service work
- monitor acknowledgement
- receive service updates
- coordinate complaint / revisit work
- keep customer continuity under shop ownership
- issue / correct shop receipts

### 7.3 Customer

Customer may see Shop Technician only as:

- assigned technician under shop service
- involved visit technician
- revisit technician where shown safely

Customer must still understand:

- Shop Owner / shop owns the service source
- shop receipt belongs to shop
- complaint routes to Shop Owner
- technician involvement is under shop context

### 7.4 Independent Technician

Independent Technician remains separate.

A Shop Technician may become Independent Technician only through explicit separate independent provider setup in future, not silently from shop assignment.

### 7.5 Admin

Admin may review Shop Technician issues only through Admin governance.

Admin must not appear inside normal Shop Technician flow.

## 8. Shop Technician Customer-App Boundary Rule

Shop Technician flow must not imply that customer app installation is mandatory for service execution, complaint handling, revisit completion or basic follow-up.

Shop Technician may support a shop-owned service flow where the customer has not installed the app.

Any customer install invitation must remain shop-controlled, value-first and optional.

Shop Technician must not imply:

- complaint cannot proceed without customer app
- revisit cannot happen without customer app
- old records are unlocked by phone number
- technician can access the full customer vault after install

## 9. Phone Number and Customer Lookup Boundary Rule

Phone number may appear only where needed for assigned task coordination and shop-approved customer contact.

Phone number must not be used as final ownership proof.

Phone number must not unlock customer vault data.

Phone number must not reveal:

- full customer service history
- property list
- appliance list
- household records
- other-provider records
- historical records before safe claim verification

Shop Technician may see only the customer context required for the assigned shop task.

Phone number remains a continuity bridge, not ownership proof.

## 9.1 Shop Technician Identity and Active Context Rule

Shop Technician profile must link to the same permanent `hfmId` defined in Core Master Truth and Cross-Domain System Rules.

Shop Technician side must treat:

- `hfmId` as the permanent person/account identity
- `shopTechnicianProfileId` as the shop-linked technician workspace/profile identity
- `activeRoleContext = shopTechnician` as the current shop technician workspace mode
- `providerContext = shop_technician_under_shop_service` as the source truth for shop technician assignment work

Shop Technician records must preserve shop-linked technician context and must not mix with Customer, Independent Technician or Shop Owner workspaces.

Shop Technician records may store:

- `hfmId`
- `shopTechnicianProfileId`
- `shopId`
- `shopOwnerId`
- `activeRoleContext = shopTechnician`
- `providerContext = shop_technician_under_shop_service`
- `sourceContext`
- `sourceRecordId` where needed

Shop Technician UI may show `hfmId` as:

- HomeFix Mitra ID
- Your HomeFix Mitra ID

Shop Technician UI may show shop-specific technician reference where needed, but must not create a second duplicate public permanent person identity.

If the same person also has Customer, Independent Technician or Shop Owner profiles, those profiles must remain separate role workspaces under the same `hfmId`.

Shop Technician work must remain shop-context assignment work even when the same person later creates an Independent Technician profile.

Shop Technician work must not become independent technician service truth automatically.

# PART 1 — SHOP TECHNICIAN SCREEN-BY-SCREEN ARCHITECTURE

## 10. Shop Technician Screen-by-Screen Architecture

### 10.1 Shop Technician Home

Shows:

- assigned services
- today’s visits
- acknowledgement needed
- complaint / revisit assignments
- pending updates
- completion notes needed
- notification summary

### 10.2 Assigned Services

Shows:

- service assigned by Shop Owner
- customer-safe service summary
- property / appliance context where needed
- scheduled time
- assignment status
- next action

### 10.3 Assignment Detail

Shows:

- shop service source
- Shop Owner / shop identity
- assigned task
- service location summary where safe
- appliance / property context where allowed
- visit instructions
- update actions

### 10.4 Visit Update Screen

Allows:

- acknowledge assignment
- mark visit started where allowed
- submit update
- mark visit completed where allowed
- add completion note
- flag issue / needs revisit

### 10.5 Complaint / Revisit Assignment

Shows:

- complaint-linked task
- original shop service source
- issue summary
- revisit schedule
- required technician action
- completion update

### 10.6 Technician Notification Center

Shows:

- service assigned
- acknowledgement needed
- visit scheduled
- update needed
- revisit assigned
- complaint clarification needed
- completion note needed

### 10.7 Limited Technician Profile / Context

May show:

- technician display name inside shop
- assigned categories
- work availability under shop where future-approved
- shop-linked role status

Must not become public Independent Technician profile unless explicitly created separately.

# PART 2 — SHOP TECHNICIAN LIFECYCLE AND STATE RULES

## 11. Shop Technician Assignment Lifecycle

`shop_technician_assignment_status` allowed values:

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
- completion_note_submitted
- revisit_assigned
- reassigned
- cancelled
- closed

## 12. Shop Technician Complaint Involvement Lifecycle

`shop_technician_complaint_involvement_status` allowed values:

- not_involved
- review_requested
- clarification_needed
- revisit_assigned
- revisit_scheduled
- revisit_in_progress
- revisit_completed
- update_submitted
- returned_to_shop_owner
- closed

## 13. Valid Transitions

### 13.1 Assignment transitions

- assignment_pending to assigned
- assigned to acknowledgement_needed
- acknowledgement_needed to acknowledged
- acknowledged to visit_scheduled
- visit_scheduled to visit_started
- visit_started to update_needed
- update_needed to update_submitted
- update_submitted to visit_completed
- visit_completed to completion_note_submitted
- completion_note_submitted to closed

### 13.2 Complaint / revisit transitions

- review_requested to clarification_needed
- clarification_needed to returned_to_shop_owner
- revisit_assigned to revisit_scheduled
- revisit_scheduled to revisit_in_progress
- revisit_in_progress to revisit_completed
- revisit_completed to update_submitted
- update_submitted to returned_to_shop_owner
- returned_to_shop_owner to closed

## 14. Blocked Transitions

Blocked:

- shop technician assignment to independent service record
- shop technician update to shop receipt final truth without Shop Owner review
- shop technician involvement to complaint closed without Shop Owner / customer closure rule
- shop technician visit completion to customer accepted receipt automatically
- shop technician role to Shop Owner role silently
- shop technician role to Independent Technician role silently
- assignment state to payroll / legal attendance truth in Phase-0
- phone match to customer vault access
- shop technician completion to provider trust ownership

## 15. Assignment Acknowledgement Rule

Shop Technician acknowledgement means:

- technician has seen assignment
- technician accepts awareness of task
- shop can track task readiness

Acknowledgement does not mean:

- service completed
- customer accepted work
- receipt issued
- complaint resolved
- legal attendance proof

## 16. Service Update Rule

Shop Technician may submit service updates where allowed.

Service update may include:

- visit started
- visit completed
- issue observed
- parts / work note where safe
- revisit needed
- unable to complete
- customer not available where safe

Service update must not:

- rewrite customer bill
- close complaint alone
- access full customer vault
- become payment proof
- become legal attendance proof

## 17. Complaint Involvement Rule

Shop Technician may be involved in complaint handling when:

- original service was shop-owned
- Shop Owner assigns technician
- technician is relevant to service / revisit
- customer-facing context remains shop-owned

Shop Technician may:

- inspect issue
- provide technical note
- complete revisit
- submit update to Shop Owner

Shop Technician must not:

- own complaint responsibility
- directly close complaint without allowed shop process
- bypass Shop Owner
- access unrelated complaint history

## 18. Revisit Involvement Rule

Revisit assigned to Shop Technician must link to:

- original shop complaint
- original shop service record
- original shop receipt where applicable
- Shop Owner responsibility owner
- assigned Shop Technician

Revisit completion must return status to Shop Owner / customer confirmation flow.

## 19. Receipt Visibility Rule

Shop Technician may see receipt-related context only where needed for assigned work.

Shop Technician may see:

- service summary
- work issue
- part / appliance context
- visit notes relevant to assignment

Shop Technician must not see by default:

- full billing control
- correction approval controls
- customer payment information
- unrelated receipt history
- customer vault
- shop financial notes

## 20. Customer Visibility Rule

Customer may see Shop Technician only in a safe shop context.

Customer-facing wording should say:

- Assigned technician under shop service

Customer-facing wording must not imply:

- technician owns the service relationship
- technician owns the receipt
- technician owns complaint responsibility
- technician is an independent provider

# PART 3 — SHOP TECHNICIAN IDENTITY, SERVICE-PROOF AND ROLE-SAFE EXECUTION RULES

## 21. HomeFix Mitra ID and Shop Technician Profile Rule

HomeFix Mitra ID is the person/account identity anchor.

The Shop Technician profile is the shop-linked technician workspace/profile under that same `hfmId`.

This identity may include:

- technician name
- HomeFix Mitra ID
- shop association
- assigned work history
- completed work count
- basic role-safe trust reference

Rules:

- `hfmId` is generated by the system
- `hfmId` stays stable over time
- `hfmId` may be shown as HomeFix Mitra ID where safe
- `shopTechnicianProfileId` identifies the shop-linked technician workspace/profile
- Shop Technician profile must stay linked to `shopId` / `shopOwnerId`
- neither `hfmId` nor historical assignment ownership should be casually editable
- `hfmId` must not be reused by another person/account
- Shop Technician profile must not be silently converted into Independent Technician or Shop Owner context

This identity must remain shop-context-bound while active under shop technician mode.

## 22. Work-Proof Trail Rule

Shop Technician may build a work-proof trail under shop context.

This trail may include:

- assigned jobs completed
- visit completion history
- complaint and revisit task completion
- service-proof records
- shop-linked work evidence

This work-proof trail must remain:

- shop-context-bound
- role-safe
- non-independent in presentation
- customer-safe in visibility

## 23. Shop-Service Proof Rule

Shop Technician may upload bill-supporting or service-proof records on behalf of shop where allowed.

Examples may include:

- visit completion proof
- before and after service proof
- work update proof
- complaint revisit proof
- task completion note

This does not make Shop Technician the owner of shop receipt truth.

Shop Owner remains owner of shop receipt and complaint truth.

## 24. No Separate Freelancer Identity While Under Shop Rule

While active under shop context, Shop Technician must not build a separate public freelancer business identity from the same shop-context work.

Rules:

- shop-context work stays shop-context work
- shop trust remains shop-owned
- technician public projection must remain role-safe
- no silent conversion into Independent Technician identity

Future separate independent setup may exist only through explicit new context creation.

## 25. Trust Presentation under Shop Context Rule

Shop Technician trust visibility must remain controlled by shop context.

Allowed trust-facing visibility may include:

- technician name
- HFM ID
- shop association
- completed work count
- assigned-role status

Not allowed by default:

- independent public provider card
- independent repeat-customer ownership
- independent rating projection from shop-context work
- independent receipt ownership claim

## 26. Task Clarity over Profile Richness Rule

Shop Technician UX must prioritize task clarity over profile richness.

Priority order:

1. assigned task
2. next action
3. visit/update status
4. complaint or revisit involvement
5. completion action
6. limited identity context

Profile depth must never weaken work-speed clarity.

## 27. Completion-First Action Rule

Shop Technician screens must stay completion-oriented.

Core actions may include:

- acknowledge assignment
- start visit
- submit update
- complete visit
- add completion note
- flag issue
- mark revisit update

These actions must remain faster and more visible than profile or decorative surfaces.

## 28. Role-Safe Visibility Rule

Customer-facing visibility of Shop Technician must stay limited and safe.

Customer may understand:

- a technician was assigned
- technician visited
- revisit technician is involved

Customer must still clearly understand:

- shop owns the relationship
- shop owns receipt truth
- shop owns complaint responsibility

## 29. Assignment Privacy Rule

Shop Technician assignment view must show only the minimum data required to complete the assigned shop task.

Assignment view may show:

- customer-safe name or contact reference
- service category
- visit time
- service location summary where safe
- appliance or property context where required for the task
- complaint or revisit summary where assigned

Assignment view must not show:

- full customer vault
- unrelated service history
- household records
- other-provider records
- hidden complaint review notes
- shop financial notes
- admin evidence

## 30. Final Boundary Rule

Shop Technician architecture must remain:

- identity-safe
- shop-context-bound
- task-first
- service-proof capable
- non-independent in shop mode
- separate from Shop Owner ownership truth
- separate from Independent Technician public identity
