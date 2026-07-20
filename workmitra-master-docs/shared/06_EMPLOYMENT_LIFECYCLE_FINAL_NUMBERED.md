Career Jobs-only mini-HR state machine
selected / offer / accepted / joined / working / notice / resigned / completed
force-complete protection
rating unlock
strict separation from hidden HR Section<!-- App name: WorkMitra / Job Mitra
File name: 06_EMPLOYMENT_LIFECYCLE.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\06_EMPLOYMENT_LIFECYCLE.md -->

# 1. WORKMITRA / JOB MITRA — EMPLOYMENT LIFECYCLE ARCHITECTURE

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

Employment Lifecycle is the Career Jobs-only mini-HR state machine of Job Mitra.

It provides controlled post-selection employment-state clarity without becoming the hidden HR Section, full HRMS, payroll system, workforce ERP, attendance system or legal employment authority.

## 1.3. Core Principle

Employment Lifecycle = Career Jobs mini-HR state clarity.

It must remain:

- Career Jobs-only
- mini-HR only
- state-controlled
- trust-sensitive
- rating-connected
- force-complete protected
- timeline-auditable
- work-history confidence aware
- separate from hidden HR Section
- separate from payroll / legal employment proof

## 1.4. What Employment Lifecycle Is

Employment Lifecycle is:

- a launch-visible core pillar
- a controlled state machine inside Career Jobs
- a post-selection clarity layer
- an offer / accepted / joined separation layer
- a resignation / notice / completion support system
- a force-complete protection flow
- a trust and rating unlock support flow
- a Work Vault work-history support signal where safe

## 1.5. What Employment Lifecycle Is Not

Employment Lifecycle is not:

- full HR Section
- payroll
- salary management
- attendance system
- legal employment contract system
- legal termination system
- workforce ERP
- Manager Console
- Workforce Ops Hub
- Shift Jobs completion logic
- recruiter operating suite

## 1.6. Hard Non-Mixing Rule

Employment Lifecycle must never mix with:

- Shift Jobs
- hidden HR Section
- Manager Console
- Workforce Ops Hub
- payroll / salary logic
- attendance / legal proof
- legal termination authority

Rule:

Employment Lifecycle belongs only to Career Jobs after valid selection, offer / acceptance and joined confirmation flow.

## 1.7. Role Fit

### 1.7.1. Employer

Employer uses Employment Lifecycle to:

- confirm Joined / Working state
- view current lifecycle status
- acknowledge resignation / notice where allowed
- mark completion where allowed
- respond to stuck lifecycle where needed
- complete rating where required

Employer must not:

- confirm Joined before valid offer / accepted state
- submit resignation for employee
- use lifecycle as payroll or legal attendance
- use lifecycle as legal termination proof
- expose hidden HR Section from lifecycle screens

### 1.7.2. Employee

Employee uses Employment Lifecycle to:

- see own employment status
- accept / understand lifecycle transition
- submit resignation where allowed
- track notice / completion status
- use force-complete protection where employer is inactive
- view work-history confidence where shown
- rate employer where required

Employee must not:

- self-confirm Joined
- edit employer confirmation
- access hidden HR Section
- turn Career lifecycle into Shift Job completion
- claim legal employment proof from lifecycle alone

### 1.7.3. Admin

Admin remains hidden in launch UI.

Admin may review disputes only through hidden Admin governance.

Admin must not appear in normal lifecycle flow.

### 1.7.4. Hidden HR Section

Hidden HR Section must remain separate future domain.

It must not appear as the same system.

Future HR migration requires separate approval, audit and employee visibility where needed.

## 1.8. Screen-by-Screen Architecture

### 1.8.1. Employer-Side Screens

#### 1.8.1.1. Lifecycle Entry Point

Appears only inside Career applicant / selected candidate flow.

Shows:

- selected candidate
- offer / acceptance state
- joined confirmation readiness
- invalid-state warning where applicable

#### 1.8.1.2. Employment Status Detail

Shows:

- current lifecycle status
- status timeline
- employee identity summary
- related Career Job
- allowed employer actions
- work-history confidence label where relevant

#### 1.8.1.3. Joined Confirmation Screen

Used to confirm actual start / working state.

Must not appear before valid prior states.

#### 1.8.1.4. Notice / Resignation Review Screen

Shows:

- resignation request
- notice state
- expected completion path
- employer response where allowed
- force-complete risk where employer delay exists

#### 1.8.1.5. Completion / Rating Screen

Used to:

- close employment lifecycle
- complete required rating
- preserve completion state
- show completion variant

#### 1.8.1.6. Lifecycle Correction Review Entry

Future hidden/admin-governed entry only.

Shows safe correction request status where future-approved.

### 1.8.2. Employee-Side Screens

#### 1.8.2.1. My Career Status Detail

Shows:

- Career Job
- employer
- current status
- next action
- lifecycle timeline
- work-history confidence label where shown

#### 1.8.2.2. Offer / Acceptance Status

Shows:

- offer state
- accept / decline state
- expiry / no-response state where applicable
- joined confirmation pending if accepted

#### 1.8.2.3. Working Status Screen

Shows:

- employer-confirmed working state
- lifecycle meaning
- available actions

#### 1.8.2.4. Resignation / Notice Screen

Used by employee to:

- submit resignation
- view notice progression
- understand expected closure
- understand grace period / force-complete availability where applicable

#### 1.8.2.5. Force Complete Screen

Appears only when:

- employer is inactive after allowed grace period
- employee is stuck in lifecycle
- product rules allow protective closure

#### 1.8.2.6. Completion / Rating Screen

Used to:

- view completed state
- complete employer rating where required
- understand completion confidence label

## 1.9. Lifecycle States

employment_lifecycle_status allowed values:

- selected
- offer_pending
- offer_sent
- offer_accepted
- offer_declined
- offer_expired
- offer_no_response
- joined_pending_employer_confirmation
- working
- notice
- resigned
- completed
- force_completed
- disputed_future_review

## 1.10. Completion Variants

completed may include:

- exitType = resigned
- exitType = terminated_future_hr_only
- exitType = mutual_completion
- exitType = employer_completed
- forceCompleted = true
- employerConfirmed = true / false
- disputeStatus = none / disputed_future_review
- workHistoryConfidence = confirmed / force_completed / disputed / low_data

Rule:

Completion variant must not create payroll, attendance or legal employment proof.

## 1.11. Valid Transitions

### 1.11.1. Offer / Entry

- selected → offer_pending
- offer_pending → offer_sent
- offer_sent → offer_accepted
- offer_sent → offer_declined
- offer_sent → offer_expired
- offer_sent → offer_no_response

### 1.11.2. Joined / Working

- offer_accepted → joined_pending_employer_confirmation
- joined_pending_employer_confirmation → working

### 1.11.3. Notice / Resignation / Completion

- working → notice
- notice → resigned
- resigned → completed
- working → completed
- notice → completed

### 1.11.4. Force Complete

- working → force_completed where allowed
- notice → force_completed where allowed
- resigned → force_completed where allowed
- joined_pending_employer_confirmation → force_completed only where protective rule allows and wording remains safe

### 1.11.5. Future Review

- any important lifecycle state → disputed_future_review where governed review exists
- disputed_future_review → corrected state only through future governed correction path

## 1.12. Blocked Transitions

Blocked:

- selected → working without accepted / joined confirmation
- offer_accepted → working without employer joined confirmation
- offer_declined → working
- offer_expired → working without new valid offer path
- offer_no_response → working without new valid offer path
- Shift Job completed → Employment Lifecycle working
- employee self-joins without employer confirmation
- employer marks resigned on behalf of employee without allowed path
- completed → working without reactivation rule
- force_completed → working without new approved Career flow
- Employment Lifecycle → hidden HR Section without future migration rule
- Employment Lifecycle → payroll / legal employment proof
- lifecycle correction → silent history deletion

## 1.13. Accept vs Joined Rule

Accept does not mean Joined.

Accept:

- employee says yes to offer / opportunity

Joined:

- employer confirms actual start / working state

Rule:

Employment Lifecycle must protect this difference everywhere:

- UI
- state machine
- notifications
- audit
- ratings
- Work Vault continuity

## 1.14. Joined Confirmation Rule

Employer can confirm Joined only when:

- Career Job exists
- employee was selected / offered
- employee accepted where required
- application state is valid

Joined confirmation must record:

- employer ID
- employee ID
- Career Job ID
- previous state
- new state
- timestamp
- actor
- source application

## 1.15. Advanced Lifecycle Protection System

This section adds the enterprise-grade safety layer required for Employment Lifecycle.

The goal is to prevent lifecycle confusion, stuck records, false work-history claims and improper HR/payroll interpretation.

### 1.15.1. Offer Declined / Offer Expired Handling

Offer handling must distinguish:

- offer accepted
- offer declined
- offer expired
- offer no-response
- offer cancelled

Rules:

- declined offer must not become rejection automatically
- expired offer must not silently become rejection
- no-response must remain visible as no-response / expired where applicable
- expired/declined offer must not enter working state
- new offer requires valid new offer path

Safe wording:

```txt
This offer is no longer active.
```

### 1.15.2. Employer Inactive Grace Period Rule

Force Complete may unlock only after a defined grace period.

Grace period must consider:

- lifecycle state
- last employer action
- employee resignation / closure request
- allowed waiting period
- unresolved employer response

Rules:

- grace period must be visible to employee where relevant
- force-complete must not punish employer silently
- force-complete must not pretend employer confirmed
- grace period rules must be configurable in future backend

Safe wording:

```txt
You may complete this record if the employer does not respond after the waiting period.
```

### 1.15.3. Lifecycle Dispute / Correction Boundary

Wrong lifecycle state may need correction in future production.

Examples:

- wrong joined confirmation
- wrong completion state
- disputed resignation status
- incorrect force-complete
- mistaken rating unlock

Rules:

- correction must go through future governed/Admin review
- correction must preserve before/after state
- correction must not delete original timeline
- normal employer/employee UI must not silently rewrite lifecycle truth

### 1.15.4. Work History Confidence Label

Work Vault / work-history continuity must show confidence honestly.

Allowed labels:

- confirmed
- force_completed
- disputed
- low_data

Rules:

- employer-confirmed completed work may be shown as confirmed
- force-completed record must be labelled clearly
- disputed record must not be overstated
- Work Vault must not overclaim unconfirmed employment

Safe wording:

```txt
Work history status: force-completed by employee protection flow.
```

### 1.15.5. Reactivation / Rejoin Control Rule

Completed lifecycle must not casually reopen.

Rules:

- completed → working is blocked
- force_completed → working is blocked
- resigned/completed employee returning must use new approved Career flow or future HR rehire rule
- reactivation requires explicit future architecture
- timeline must preserve old lifecycle record

### 1.15.6. Lifecycle Timeline Detail

Every important lifecycle change should preserve timeline detail.

Timeline event should include:

- old state
- new state
- actor role
- actor ID
- reason optional
- source record
- timestamp
- correction reference where applicable

Rules:

- timeline must be readable
- timeline must not expose hidden Admin notes
- timeline must not be editable through normal UI
- timeline supports trust, rating and Work Vault continuity

## 1.16. Advanced Lifecycle Phase-0 Boundary

Allowed in Phase 0:

- local lifecycle state
- local offer declined / expired status
- local grace period display
- local force-complete protection
- local work-history confidence label
- local timeline events
- local rating unlock state

Not allowed in Phase 0:

- legal employment proof claim
- payroll claim
- attendance claim
- formal HR termination claim
- hidden HR Section exposure
- real Admin dispute resolution claim unless implemented
- automatic legal work-history verification

Rule:

Employment Lifecycle must clarify status without over-promising legal, HR or payroll authority.

## 1.17. Resignation Rule

Employee may submit resignation only when:

- lifecycle is working or allowed active state
- Career lifecycle record exists
- employee is the linked employee

Resignation must record:

- resignation reason category optional
- submitted by employee
- submitted at
- previous state
- new state
- timeline event

Rule:

Resignation must not delete lifecycle history.

## 1.18. Notice Rule

Notice state means:

- resignation / progression is active
- completion not yet finalized
- both sides need clarity

Notice must not become:

- payroll notice system
- legal notice enforcement
- full HR workflow

It is launch-scope status clarity only.

## 1.19. Completion Rule

Completion means lifecycle is closed.

Completion may be:

- normal completion
- resigned completion
- employer-completed closure
- future HR termination-labelled completion only where approved
- force-completed protective closure

Completion must:

- preserve timeline
- trigger rating where required
- stop active lifecycle actions
- keep Work Vault / work-history continuity where supported
- record work-history confidence label

## 1.20. Force Complete Rule

Force Complete is a protective employee-side closure path.

It may unlock when:

- employee has resigned / requested closure
- employer does not respond within allowed grace period
- lifecycle is stuck
- system rules allow protective closure

Force Complete must record:

- forceCompleted = true
- employerConfirmed = false where applicable
- reason
- timestamp
- grace period evidence
- previous state
- new state

Force Complete must not:

- silently punish employer
- delete employer-side record
- pretend employer confirmed
- become hidden HR termination
- become payroll or legal proof

## 1.21. Rating Unlock Rule

Rating may unlock when:

- lifecycle reaches completed state
- force-complete protective closure happens where allowed
- workflow requires rating from both sides

Rules:

- mandatory rating must not be bypassed where required
- force-completed state should show completion context clearly
- rating must remain tied to Career lifecycle record
- disputed lifecycle may hold or label rating where future governance requires it

## 1.22. Work Vault / Work History Connection

Completed lifecycle may contribute to Work Vault continuity.

Rules:

- completed employment can support work-history summary
- disputed or force-completed record must show clear confidence label
- Work Vault must not overstate unconfirmed employment
- lifecycle record must not expose hidden HR notes
- work-history summary is not legal employment proof

## 1.23. Action Catalog

### 1.23.1. Employer Allowed Actions

Employer may:

- confirm joined
- view lifecycle status
- acknowledge resignation / notice where allowed
- mark completion where allowed
- respond to lifecycle closure where applicable
- complete rating

### 1.23.2. Employee Allowed Actions

Employee may:

- view lifecycle status
- accept / decline offer before lifecycle
- submit resignation
- track notice
- view grace period / force-complete availability
- force complete where allowed
- complete rating

### 1.23.3. Admin Allowed Actions

Admin remains hidden.

Future Admin may:

- review lifecycle dispute
- correct wrong lifecycle state
- preserve correction audit
- review abuse/misuse where governed

### 1.23.4. Blocked Actions

Blocked:

- employer bypasses accept / joined flow
- employee self-confirms joined
- hidden HR controls in launch UI
- payroll / salary actions
- attendance proof actions
- legal termination actions
- Shift Job lifecycle conversion
- silent reactivation after completion
- lifecycle correction without audit

## 1.24. Notification / Alert Contract

### 1.24.1. Employer Notifications

- employee_accepted_offer
- employee_declined_offer
- offer_expired
- joined_confirmation_needed
- employee_resigned
- notice_state_started
- force_complete_available_warning
- lifecycle_completed
- lifecycle_dispute_future_review
- rating_required

### 1.24.2. Employee Notifications

- offer_status_updated
- offer_expiring
- offer_expired
- joined_confirmed
- lifecycle_working_started
- resignation_submitted
- notice_started
- force_complete_available
- lifecycle_completed
- lifecycle_dispute_future_review
- rating_required

### 1.24.3. Safe Wording

Examples:

```txt
Employer confirmed you as working.
Your resignation request has been recorded.
You can complete this record if there is no employer response after the waiting period.
This work-history record was force-completed for closure clarity.
Rating is required to close this employment record.
```

Notifications must not:

- use payroll wording
- claim legal employment proof
- expose hidden HR Section
- imply employee self-joined
- imply employer confirmed when force-complete happened

## 1.25. Evidence / Audit / Correction Model

Evidence may include:

- Career Job ID
- Career application ID
- offer record
- offer response
- joined confirmation
- resignation record
- notice state
- grace period evidence
- force-complete record
- completion status
- rating status
- work-history confidence label

Audit required for:

- offer sent
- offer accepted / declined / expired
- joined confirmation
- resignation
- notice
- completion
- force complete
- rating unlock
- lifecycle correction

Correction must preserve:

- old state
- new state
- reason
- actor
- timestamp
- source record
- before / after state

Rule:

Correction must not delete original timeline.

## 1.26. Permission Matrix

### 1.26.1. Employer

Employer:

- can confirm Joined only for own selected / accepted candidates
- can complete own lifecycle records where allowed
- cannot resign on behalf of employee unless future approved exceptional path exists
- cannot use lifecycle as payroll/legal proof

### 1.26.2. Employee

Employee:

- can view own lifecycle only
- can resign own lifecycle where allowed
- can force complete own stuck lifecycle where allowed
- cannot self-confirm Joined
- cannot edit employer confirmation

### 1.26.3. Admin

Admin:

- hidden governance role only
- can review lifecycle dispute in future Admin System
- can correct only with audit

### 1.26.4. Hidden HR Section

Hidden HR Section:

- cannot control launch Employment Lifecycle unless future integration is explicitly approved
- must not silently absorb lifecycle records

## 1.27. Data Model

### 1.27.1. EMPLOYMENT_LIFECYCLE_RECORD

Fields:

- employment_lifecycle_record_id
- career_job_id
- career_application_id
- employer_id
- employee_id
- lifecycle_status
- exit_type_optional
- force_completed
- employer_confirmed
- dispute_status_optional
- work_history_confidence_label
- current_state_since
- created_at
- updated_at

### 1.27.2. CAREER_OFFER_LIFECYCLE_LINK

Purpose:

Connects offer response to lifecycle entry.

Fields:

- career_offer_lifecycle_link_id
- career_offer_id
- employment_lifecycle_record_id_optional
- offer_status
- employee_response_status
- response_deadline_optional
- response_at_optional
- expired_at_optional
- created_at
- updated_at

Rule:

Offer declined/expired must not create working lifecycle.

### 1.27.3. LIFECYCLE_TIMELINE_EVENT

Fields:

- lifecycle_timeline_event_id
- employment_lifecycle_record_id
- actor_role
- actor_id
- event_type
- old_state_optional
- new_state_optional
- reason_optional
- source_record_id_optional
- created_at

### 1.27.4. LIFECYCLE_FORCE_COMPLETE_RECORD

Purpose:

Protective closure record when employer is inactive.

Fields:

- lifecycle_force_complete_record_id
- employment_lifecycle_record_id
- employee_id
- employer_id
- previous_state
- force_complete_reason
- grace_period_started_at
- force_completed_at
- employer_confirmed
- created_at

Rule:

Force Complete must not pretend employer confirmed.

### 1.27.5. LIFECYCLE_CORRECTION_RECORD

Purpose:

Future governed correction record.

Fields:

- lifecycle_correction_record_id
- employment_lifecycle_record_id
- correction_type
- old_state
- new_state
- correction_reason
- actor_role
- actor_id
- created_at

Rule:

Correction record is governed and must not expose hidden Admin internals in normal UI.

## 1.28. Source Truth Labels

lifecycle_source_type allowed values:

- career_offer_sent
- employee_offer_response
- employer_joined_confirmation
- employee_resignation
- employer_completion
- employee_force_complete
- rating_unlock
- lifecycle_correction_hidden
- system_expired

work_history_confidence_label allowed values:

- confirmed
- force_completed
- disputed
- low_data

## 1.29. UX Quality Rules

Employment Lifecycle UX must be:

- clear
- calm
- status-first
- timeline-readable
- low-confusion
- trust-aware
- role-safe
- visually separate from HR Section
- visually separate from Shift Jobs

Employee first-read must answer:

- What is my current employment status?
- Did I accept an offer?
- Has the employer confirmed Joined?
- Am I working, in notice, resigned or completed?
- Can I force complete if stuck?
- What will show in my work history?

Employer first-read must answer:

- Who accepted?
- Who needs joined confirmation?
- Who is working?
- Who resigned / is in notice?
- What needs completion?
- What rating is required?

## 1.30. Empty / Stuck State Rules

### 1.30.1. No lifecycle state

```txt
No employment lifecycle record yet.
Lifecycle starts only after a valid Career Job selection and offer flow.
```

### 1.30.2. Joined pending state

```txt
Waiting for employer joined confirmation.
Accepted offer does not mean joined until the employer confirms the actual start.
```

### 1.30.3. Force complete available state

```txt
You may complete this record if the employer does not respond after the waiting period.
```

### 1.30.4. Empty-state safety rules

- Empty states must not mention payroll.
- Empty states must not claim legal employment proof.
- Empty states must not expose hidden HR Section.
- Empty states must preserve Accept vs Joined clarity.

## 1.31. Phase-0 Implementation Sync — Career Hire Entry (Evidence: 2026-07-16)

Records **current app behaviour** for Employment creation from Career Jobs (see also `shared/03_CAREER_JOBS_ARCHITECTURE_FINAL_POSTING_SAFE.md` §1.28.11).

| Trigger                | Code                                       | Side-effects                            | Label                                   |
| ---------------------- | ------------------------------------------ | --------------------------------------- | --------------------------------------- |
| Employee accepts offer | `acceptCareerOffer` → `activateCareerHire` | Workspace + 4 employment-related stores | IMPLEMENTED — DEMO / LOCAL STORAGE ONLY |
| Employer Mark as Hired | `hireCandidate` → `activateCareerHire`     | Same — no employee accept required      | IMPLEMENTED — CRITICAL gap vs §1.13     |
| Mark as joined (later) | `markAsJoined`                             | `selected` → `working`                  | IMPLEMENTED                             |

**Shift boundary:** Shift code does not call `activateCareerHire` — verified 2026-07-16.

**Production target (V2):** Server events before employment row — PLANNED / NOT IMPLEMENTED in Phase-0 app.

## 1.32. Final Employment Lifecycle Lock Note

> **IMPORTANT — TARGET RULE, NOT CURRENT PHASE-0 BEHAVIOUR**
>
> Bullets below describe **approved architecture targets**. Current Phase-0 may create employment-related records when the employee accepts an offer or when the employer marks hired — **before** mandatory employer confirm-hire. See **§1.31** and Career architecture **§1.28.11** (CRITICAL).

Employment Lifecycle is approved as the Career Jobs-only mini-HR state machine.

Final locked boundaries (target architecture):

- Employment Lifecycle must stay inside Career Jobs only.
- Accept does not mean Joined (**target**; Phase-0 may create records at accept/hire — §1.31).
- Joined requires employer confirmation (**target**; not enforced as pre-employment gate in Phase-0).
- Offer declined/expired/no-response must not enter Working state.
- Force Complete is protective closure, not employer confirmation.
- Work history must show correct confidence label.
- Completed lifecycle must not reactivate directly into Working.
- Lifecycle correction must be governed and audit-preserving.
- Employment Lifecycle must not become HR Section, payroll, attendance, legal employment proof, Manager Console or Workforce Ops.
- Phase 0 must remain honest, local-first and Play Store safe.

— END OF EMPLOYMENT LIFECYCLE ARCHITECTURE —
