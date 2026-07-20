temporary / short-duration hiring
worker interest / application
shortlist / selection
waiting list / replacement
no-response / no-show
completion / rating
strict separation from Career Jobs<!-- App name: WorkMitra / Job Mitra
File name: 02_SHIFT_JOBS_ARCHITECTURE.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\02_SHIFT_JOBS_ARCHITECTURE.md -->

# 1. WORKMITRA / JOB MITRA — SHIFT JOBS ARCHITECTURE

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 1.2. Purpose

Shift Jobs is the temporary / short-duration work hiring pillar of Job Mitra.

It supports fast, practical, trust-aware, mobile-first temporary hiring without mixing with Career Jobs, Employment Lifecycle, hidden HR Section, Manager Console or Workforce Ops Hub.

## 1.3. Core Principle

Shift Jobs = temporary / short-duration work.

Shift Jobs must remain:

- fast
- practical
- trust-aware
- role-safe
- completion-based
- rating-connected
- separate from Career Jobs

## 1.4. What Shift Jobs Is

Shift Jobs is:

- a launch-visible core pillar
- a temporary work hiring flow
- a short-duration worker discovery and selection system
- a trust-aware hiring surface
- a completion-and-rating linked workflow

## 1.5. What Shift Jobs Is Not

Shift Jobs is not:

- Career Jobs
- Permanent Jobs
- Employment Lifecycle
- Mini-HR
- HR Section
- payroll
- full workforce ERP
- hidden Workforce Ops Hub
- Manager Console

## 1.6. Hard Non-Mixing Rule

Shift Jobs must never be treated as Career Jobs with a different label.

Shift Jobs must not use:

- offer / joined lifecycle
- resignation / notice lifecycle
- permanent employee tracking
- hidden HR workflows
- Career application pipeline states

Career Jobs must not use:

- shift completion states
- short-term replacement logic
- shift attendance-style completion
- urgent temporary worker assignment logic

## 1.7. User Reality

Shift Jobs is designed for practical real-world hiring where:

- employer needs worker quickly
- employee wants clear work details before accepting
- trust must be visible before action
- mobile-first use matters
- decision time is short
- workflow must be low-confusion

## 1.8. Role Fit

### 1.8.1. Employer

Employer uses Shift Jobs to:

- create temporary work
- view interested workers
- compare trust signals
- shortlist/select workers
- manage shift status
- close completed shift
- rate worker where required

Employer must not:

- silently convert a shift worker into a permanent employee
- access employee private Work Vault content without allowed path
- expose hidden HR / Manager / Workforce Ops controls in launch flow

### 1.8.2. Employee

Employee uses Shift Jobs to:

- discover short-duration work
- review employer trust
- apply / express interest
- accept selected shift where applicable
- track own shift status
- complete rating where required

Employee must not:

- see other workers
- access employer private notes
- access manager / workforce / admin tools
- be pushed into Career lifecycle from a Shift Job

### 1.8.3. Admin

Admin remains hidden in launch UI.

Admin may review shift abuse through separate hidden Admin governance.

Admin must not appear in normal Shift Jobs flow.

### 1.8.4. Hidden Workforce Ops / Manager Console

Hidden Workforce Ops / Manager Console may exist as future operational architecture.

They must not leak into launch-visible Shift Jobs flow.

## 1.9. Screen-by-Screen Architecture

### 1.9.1. Employer-Side Screens

#### 1.9.1.1. Shift Jobs Home

Shows:

- active shifts
- draft shifts
- completed shifts
- urgent / upcoming shifts
- worker response summary
- shift fill health indicator
- backup / standby risk summary

#### 1.9.1.2. Create Shift Job

Captures:

- title
- work type/category
- work date
- start/end time or duration
- location / work area
- number of workers needed
- pay/rate reference
- skill requirements
- work instructions
- safety notes where needed

Must support:

- Save as Draft
- resume draft
- preview before publish
- publish confirmation
- duplicate Shift Job warning
- unsaved changes warning
- local auto-save where supported

#### 1.9.1.3. Shift Job Detail

Shows:

- shift details
- visibility/status
- applicants/interested workers
- selected workers
- waiting list where supported
- trust checkpoints
- Smart Match Score for applicants where available
- shift fill health indicator
- completion status

#### 1.9.1.4. Worker Shortlist / Selection Screen

Shows:

- worker profile summary
- WM ID
- rating / trust level
- Work Vault verification availability
- relevant skill summary
- apply/interest timestamp
- Smart Match Score explanation
- reliability summary / low-data state

#### 1.9.1.5. Selected Workers Screen

Shows:

- selected worker list
- accepted / pending response
- replacement needed flag
- standby worker status
- pre-shift confirmation status
- completion readiness

#### 1.9.1.6. Shift Closure Screen

Used for:

- mark completed
- mark worker no-show
- mark cancelled
- confirm completion
- trigger rating where required

### 1.9.2. Employee-Side Screens

#### 1.9.2.1. Shift Jobs Discovery

Shows:

- relevant shift jobs
- date/time
- work type
- pay/rate reference
- employer trust summary
- location/work area summary

#### 1.9.2.2. Shift Job Detail

Shows:

- full work details
- employer trust visibility
- requirements
- schedule
- safety notes
- apply/interest action

#### 1.9.2.3. My Shift Applications

Shows:

- applied shifts
- selected shifts
- rejected/closed shifts
- completed shifts

#### 1.9.2.4. Shift Confirmation Screen

Shows:

- selected shift details
- accept/decline where applicable
- employer trust summary
- pre-shift confirmation checkpoint where required
- final work timing

#### 1.9.2.5. Shift Completion / Rating Screen

Used for:

- completion acknowledgement
- employer rating where required
- closure clarity

## 1.10. Shift Job Lifecycle / State Machine

> **Documentation layers (read in order):**
>
> - **§1.10 below** — long-term canonical / target state vocabulary for architecture and backend design.
> - **§1.30 Current Application Implementation Sync** — **Phase-0 implemented** status strings, routes, storage, and behaviour verified from code (**2026-07-16**).
>
> Do not treat §1.10 values as the live app enum without checking §1.30.

### 1.10.1. shift_job_status

Allowed values:

- draft
- draft_incomplete
- draft_ready
- preview_ready
- publish_confirmation_pending
- published
- applications_open
- selection_in_progress
- workers_selected
- waiting_for_worker_response
- confirmed
- in_progress
- completed_pending_rating
- completed
- cancelled_by_employer
- cancelled_by_system
- expired
- closed_no_selection

### 1.10.2. worker_shift_status

Allowed values:

- not_applied
- interested
- applied
- shortlisted
- selected
- waiting_response
- standby
- confirmation_pending
- confirmation_confirmed
- confirmation_missed
- accepted
- declined
- not_selected
- replaced
- no_response
- no_show
- completed_pending_rating
- completed
- cancelled

## 1.11. Valid Transitions

### 1.11.1. Employer

- draft → draft_incomplete
- draft_incomplete → draft_ready
- draft_ready → preview_ready
- preview_ready → publish_confirmation_pending
- publish_confirmation_pending → published
- draft_ready → published where preview is skipped by approved rule
- published → applications_open
- applications_open → selection_in_progress
- selection_in_progress → workers_selected
- workers_selected → waiting_for_worker_response
- waiting_for_worker_response → confirmed
- confirmed → in_progress
- in_progress → completed_pending_rating
- completed_pending_rating → completed

### 1.11.2. Employee

- not_applied → interested / applied
- applied → shortlisted
- shortlisted → selected
- selected → waiting_response
- waiting_response → accepted / declined
- waiting_response → standby where employer keeps backup worker
- accepted → confirmation_pending where pre-shift confirmation is required
- confirmation_pending → confirmation_confirmed / confirmation_missed
- accepted / confirmation_confirmed → completed_pending_rating
- completed_pending_rating → completed

## 1.12. Blocked Transitions

Blocked:

- draft → completed
- published → completed
- applied → completed
- selected → joined
- accepted → working as Career lifecycle
- shift completion → permanent employment lifecycle
- shift applicant → Career applicant without explicit Career flow

Rule:

Shift Jobs must not generate Career lifecycle states.

## 1.13. Shortlist / Selection Discipline

Employer may:

- review interested workers
- shortlist
- select required number of workers
- keep waiting list where supported
- replace declined/no-show worker where safe

Employer must not:

- silently convert shift worker into permanent employee
- bypass trust checkpoints
- access private Work Vault documents without allowed path
- over-select without clear worker count logic

## 1.14. Waiting List / Replacement Rule

Waiting list exists to support real-world temporary hiring uncertainty.

Waiting list may be used when:

- selected worker declines
- selected worker does not respond
- employer needs backup worker
- shift requires multiple workers

Replacement must preserve:

- original selected worker
- replacement worker
- reason
- timestamp
- final active selected worker state

Rule:

Replacement must not erase selection history.

## 1.15. No-Show / No-Response Rule

### 1.15.1. no_response

Worker selected but does not respond within expected time.

### 1.15.2. no_show

Worker accepted but does not attend / complete expected shift.

Rules:

- no_response and no_show must remain separate
- no_show should not be applied without enough workflow evidence
- disputed no-show should be reviewable later
- repeated no-show may affect trust only through fair logic
- If a worker disputes a no-show mark, the record should stay reviewable and must not be treated as final negative trust until resolved in future production.

## 1.16. Shift Completion Rule

Shift completion should require:

- employer closure action
- worker-side completion visibility
- required rating where workflow defines it
- final status lock

Completion must not:

- create Career employment state
- auto-create HR record
- silently mark permanent work
- bypass mandatory rating where required

## 1.17. Rating Connection

Shift completion may trigger rating flow.

Rules:

- rating is tied to completed shift context
- mandatory rating must not be bypassed where workflow requires it
- disputed/no-show/cancelled shift should not create normal positive trust
- rating edit rules must follow master trust system rules

## 1.18. Trust Checkpoints

### 1.18.1. Employer-side trust checkpoints

- worker WM ID
- worker rating/trust level
- Work Vault verification availability
- profile completeness

### 1.18.2. Employee-side trust checkpoints

- employer WM ID
- employer rating/trust level
- employer trust visibility before apply/accept

Rule:

Shift Jobs must not be trust-blind just because the flow is fast.

## 1.19. Advanced Shift Reliability System

This section adds the minimum advanced reliability layer required to make Shift Jobs feel enterprise-grade and market-ready without turning Phase 0 into fake production behavior.

The goal is to prevent the two biggest user failures in temporary hiring:

- employer cannot fill the shift on time
- employee or employer loses trust because the workflow feels weak or incomplete

### 1.19.1. Smart Match Score

Smart Match Score helps the employer quickly identify suitable workers for a Shift Job.

The score may consider:

- skill/category match
- worker rating/trust level
- shift completion history
- no-response / no-show history
- availability fit
- Work Vault readiness where relevant
- previous successful work with the same employer where available

Rules:

- Smart Match Score is advisory only.
- Employer makes the final selection.
- The system must not claim real AI or automated hiring authority in Phase 0.
- Low-data workers must not be unfairly hidden.
- The score must be explainable in simple wording.

Safe Phase-0 wording:

```txt
Suggested match based on available profile, trust and shift history.
```

Blocked wording:

```txt
AI approved worker.
Guaranteed best worker.
Verified hire decision.
```

### 1.19.2. Backup / Standby Worker System

Backup / Standby Worker System protects the employer when selected workers decline, do not respond, cancel or fail to attend.

Employer may keep workers in:

- selected list
- waiting list
- standby list

Standby worker may be used when:

- selected worker declines
- selected worker gives no response
- selected worker is replaced
- employer still has unfilled worker requirement

Rules:

- Standby status must be clear to the employee.
- Standby worker must not be shown as confirmed worker.
- Replacement must preserve original worker history.
- Standby flow must not become Workforce Ops Hub in launch.

Safe employee wording:

```txt
You are on standby for this shift. The employer may contact you if a selected worker is unavailable.
```

### 1.19.3. Worker Reliability Score

Worker Reliability Score helps employers understand practical shift dependability.

It may consider:

- completed shifts
- accepted shifts
- declined selected shifts
- no-response count
- no-show count
- cancellation pattern
- rating completion behavior

Rules:

- Reliability Score must be separate from general rating.
- Reliability Score must not be public shaming.
- Low-data state must be shown honestly.
- No-show must not be applied casually without workflow evidence.
- Disputed no-show must not damage trust as a final truth until resolved in future production.

Safe wording:

```txt
Reliability is based on available shift activity.
```

### 1.19.4. Pre-Shift Confirmation Reminder

Pre-Shift Confirmation Reminder reduces no-response and no-show risk.

Before the shift starts, the selected worker should have a clear confirmation checkpoint.

Confirmation states:

- confirmation_not_required
- confirmation_pending
- confirmation_confirmed
- confirmation_missed

Rules:

- Phase 0 may show local in-app reminders only.
- Do not claim real push notification, SMS, WhatsApp or email reminder unless implemented.
- Employer should see whether selected workers confirmed before shift start.
- Worker should see the action clearly in My Shift Applications and Shift Detail.

Safe wording:

```txt
Please confirm you can attend this shift.
```

### 1.19.5. Shift Fill Health Indicator

Shift Fill Health Indicator helps the employer know whether a shift is safe, risky or needs action.

Allowed fill health states:

- not_started
- low_response
- selection_needed
- backup_needed
- confirmation_pending
- ready_to_start
- closure_needed
- completed

It may consider:

- required worker count
- number of applicants
- selected workers
- accepted workers
- standby workers
- missed confirmations
- replacement need
- completion status

Rules:

- Fill Health is an employer guidance indicator.
- It must not expose other workers to employees.
- It must not become hidden Workforce Ops Hub.
- It must use simple action wording.

Good examples:

```txt
Backup needed
Select one more worker
Waiting for worker confirmation
Ready to start
```

## 1.20. Advanced Reliability Phase-0 Boundary

In Phase 0, these advanced features may work through local demo-safe logic.

Allowed:

- local calculated match score
- local reliability summary
- local standby list
- local confirmation status
- local fill health indicator
- demo-safe in-app alerts

Not allowed in Phase 0:

- real AI hiring claim
- real automated decision enforcement
- real push notification claim
- real SMS / WhatsApp / email reminder claim
- real legal attendance proof
- real payroll or payment linkage

Rule:

These features should improve user trust and workflow clarity without over-promising backend authority.

## 1.21. Action Catalog

### 1.21.1. Employer Allowed Actions

Employer may:

- create draft shift
- publish shift
- edit draft
- close applications
- shortlist worker
- select worker
- move worker to waiting list
- move worker to standby list
- replace selected worker
- view Smart Match Score
- view Shift Fill Health
- request pre-shift confirmation where supported
- cancel shift
- mark completed
- rate worker

### 1.21.2. Employee Allowed Actions

Employee may:

- view shift
- view employer trust
- apply / express interest
- withdraw before selection where allowed
- accept selected shift
- decline selected shift
- confirm pre-shift attendance where required
- view own shift status
- rate employer where required

### 1.21.3. Blocked Actions

Blocked:

- convert shift to Career Job silently
- convert selected worker to employee lifecycle
- access hidden HR Section
- access Workforce Ops Hub from launch UI
- bypass rating where mandatory
- access Work Vault private documents without OTP/allowed path

## 1.22. Notification / Alert Contract

### 1.22.1. Employer Notifications

- worker_applied_to_shift
- worker_shortlisted
- worker_accepted_shift
- worker_declined_shift
- worker_no_response
- replacement_needed
- standby_worker_available
- pre_shift_confirmation_pending
- shift_fill_health_low
- shift_ready_for_closure
- rating_required

### 1.22.2. Employee Notifications

- shift_application_received
- shortlisted_for_shift
- selected_for_shift
- shift_confirmed
- pre_shift_confirmation_required
- standby_status_updated
- shift_cancelled
- shift_completed
- rating_required

### 1.22.3. Safe Wording

Examples:

- “You were selected for this shift.”
- “Please confirm if you can attend.”
- “This shift was cancelled by the employer.”
- “Rating is required to close this shift.”

Notifications must not:

- expose other workers
- expose employer private notes
- mix Career Job messages
- use HR wording like joined / resigned / notice

## 1.23. Evidence / Audit / Correction Model

Evidence may include:

- shift post snapshot
- application timestamp
- selection timestamp
- worker response
- standby assignment status
- pre-shift confirmation status
- fill health status
- cancellation reason
- completion status
- rating status

Audit required for:

- publish
- selection
- replacement
- standby movement
- confirmation missed
- cancellation
- no-show marking
- completion
- rating edit

Correction must preserve:

- old value
- new value
- reason
- actor
- timestamp
- before/after state

## 1.24. Permission Matrix

Employer can control only own shift jobs.

Employee can control only own application / response / rating state.

Admin can review only through hidden governance tools.

Hidden Manager / Workforce / HR domains cannot control launch-visible Shift Jobs unless explicitly exposed in future version.

## 1.25. Data Model

### 1.25.1. SHIFT_JOB

Fields:

- shift_job_id
- employer_id
- title
- category
- work_date
- start_time_optional
- end_time_optional
- duration_optional
- location_summary
- worker_count_required
- pay_rate_reference
- requirements
- safety_notes_optional
- shift_job_status
- shift_fill_health_status_optional
- created_at
- updated_at

### 1.25.2. SHIFT_APPLICATION

Fields:

- shift_application_id
- shift_job_id
- employee_id
- application_status
- applied_at
- updated_at

### 1.25.3. SHIFT_SELECTION

Fields:

- shift_selection_id
- shift_job_id
- employee_id
- selection_status
- selected_by_employer_id
- selected_at
- worker_response_status
- response_at_optional
- standby_status_optional
- pre_shift_confirmation_status_optional
- replacement_of_selection_id_optional

### 1.25.4. SHIFT_TIMELINE_EVENT

Fields:

- shift_timeline_event_id
- shift_job_id
- actor_role
- actor_id
- event_type
- old_state_optional
- new_state_optional
- reason_optional
- created_at

### 1.25.5. SHIFT_MATCH_SCORE

Purpose:

Advisory worker suitability score for a specific Shift Job.

Fields:

- shift_match_score_id
- shift_job_id
- employee_id
- skill_match_score
- reliability_score_reference
- availability_fit_status
- trust_summary_reference
- low_data_state
- explanation_summary
- calculated_at

Rule:

Smart Match Score is advisory only and must not replace employer decision-making.

### 1.25.6. SHIFT_RELIABILITY_SNAPSHOT

Purpose:

Worker reliability snapshot based on available Shift Jobs activity.

Fields:

- shift_reliability_snapshot_id
- employee_id
- completed_shift_count
- accepted_shift_count
- no_response_count
- no_show_count
- cancellation_count
- rating_completion_status
- low_data_state
- calculated_at

Rule:

Reliability Score must remain fair, explainable and separate from general rating.

### 1.25.7. SHIFT_STANDBY_RECORD

Purpose:

Backup / standby worker record for a Shift Job.

Fields:

- shift_standby_record_id
- shift_job_id
- employee_id
- standby_status
- standby_reason
- activated_as_replacement
- replacement_of_selection_id_optional
- created_at
- updated_at

Rule:

Standby worker must not be shown as confirmed worker until activated and accepted.

### 1.25.8. SHIFT_CONFIRMATION_CHECK

Purpose:

Pre-shift worker confirmation checkpoint.

Fields:

- shift_confirmation_check_id
- shift_job_id
- employee_id
- confirmation_status
- requested_at
- confirmed_at_optional
- missed_at_optional
- created_at
- updated_at

Rule:

Phase-0 confirmation is local in-app confirmation only unless real notification infrastructure exists.

### 1.25.9. SHIFT_FILL_HEALTH_SNAPSHOT

Purpose:

Employer-facing shift readiness indicator.

Fields:

- shift_fill_health_snapshot_id
- shift_job_id
- required_worker_count
- applicant_count
- selected_count
- accepted_count
- standby_count
- missed_confirmation_count
- fill_health_status
- recommended_next_action
- calculated_at

Rule:

Fill Health must guide employer action without exposing private worker information.

## 1.26. Source Truth Labels

shift_source_type allowed values:

- employer_created
- employer_draft_saved
- employer_draft_resumed
- employer_previewed
- employer_publish_confirmed
- employer_duplicate_warning_shown
- employer_edited
- system_closed_expired
- worker_applied
- employer_selected
- worker_responded
- standby_assigned
- confirmation_requested
- confirmation_completed
- fill_health_calculated
- employer_completed

## 1.27. Employer Job Posting Draft Safety System

This section adds the required employer-side posting safety layer for Shift Jobs.

The goal is to prevent employer abandonment, accidental data loss, duplicate posting and accidental public publishing.

### 1.27.1. Save as Draft

Employer must be able to save a Shift Job before publishing.

Draft Shift Job rules:

- draft is owner-only
- draft is not visible to employees
- draft does not accept applications
- draft can be resumed later
- draft can be edited
- draft can be deleted by the owner
- draft can be published only after required fields are complete

Safe wording:

```txt
Saved as draft. This shift is not visible to workers yet.
```

### 1.27.2. Resume Draft

Employer must be able to continue an unfinished Shift Job.

Resume Draft should preserve:

- title
- work type/category
- date/time
- location/work area
- worker count
- pay/rate reference
- requirements
- instructions
- safety notes

Rules:

- resume draft must open in edit mode
- missing required fields must be clearly shown
- draft must not silently publish

### 1.27.3. Auto-save While Filling

Long Shift Job forms should support local auto-save where possible.

Auto-save may run when:

- employer types details
- employer moves between form sections
- app is backgrounded
- phone screen locks
- accidental back navigation happens

Rules:

- Phase 0 may use local/device storage
- do not claim cloud sync unless backend exists
- auto-save must not publish the job
- auto-save must not make the job visible to employees

Safe wording:

```txt
Draft saved on this device.
```

### 1.27.4. Preview Before Publish

Employer should be able to preview how the Shift Job will appear to employees before publishing.

Preview should show:

- employee-facing title
- date/time
- work details
- pay/rate reference
- location/work area
- requirements
- employer trust summary area
- safety notes

Rules:

- preview is not public
- preview must not create applications
- preview must not expose hidden employer/admin data

Safe wording:

```txt
Preview how workers will see this shift before publishing.
```

### 1.27.5. Duplicate Shift Job Warning

System should warn the employer when a similar Shift Job may already exist.

Duplicate check may compare:

- title
- date/time
- location/work area
- work type/category
- worker count
- employer ID

Rules:

- duplicate warning is advisory only
- employer may continue if intentional
- system must not block valid repeated shifts unfairly
- warning must not publish or delete anything automatically

Safe wording:

```txt
A similar shift may already exist. Review before publishing again.
```

### 1.27.6. Publish Confirmation

Before publishing, employer must see a clear confirmation.

Confirmation must explain:

- job will become visible to employees
- workers may apply / express interest
- employer should review details first

Safe wording:

```txt
This shift will be visible to workers. Continue?
```

Actions:

- Review Again
- Publish Shift

### 1.27.7. Incomplete Draft Reminder

Employer dashboard should show unfinished Shift Job drafts.

Reminder may show:

- number of unfinished drafts
- most recent draft
- continue editing action
- delete draft action

Safe wording:

```txt
You have unfinished Shift Job drafts.
```

### 1.27.8. Draft Safety Boundary

Draft safety must not:

- expose draft jobs to employees
- count draft jobs as active/public jobs
- accept worker applications
- trigger notifications to employees
- affect employer trust/rating
- appear in employee search/discovery

Rule:

Draft means private employer-owned preparation state only.

## 1.28. UX Quality Rules

Shift Jobs UX must be:

- fast to scan
- low typing
- trust-visible
- date/time clear
- worker count clear
- fill health clear for employer
- reliability signal clear where available
- action priority obvious
- visually separate from Career Jobs

Employee first-read must answer:

- What is the work?
- When is it?
- Where is it?
- What is the pay/rate reference?
- Can I trust this employer?
- What action can I take?

Employer first-read must answer:

- How many workers do I need?
- Who applied?
- Who looks trustworthy?
- Who is the best match?
- Who is selected?
- Do I need backup workers?
- Who accepted?
- What still needs closure?

## 1.29. Empty-State Rules

Employer empty state:

```txt
No Shift Jobs posted yet.
Create a shift when you need short-duration workers.
```

Employer no applicants empty state:

```txt
No workers have applied yet.
Keep this shift open or improve the work details so workers can understand it better.
```

Employer backup empty state:

```txt
No standby workers yet.
Add standby workers when this shift needs backup support.
```

Employee discovery empty state:

```txt
No Shift Jobs found yet.
Check again later or update your profile so employers can understand your skills better.
```

Employee applications empty state:

```txt
No Shift applications yet.
Apply for short-duration work when you find a suitable shift.
```

Employee selected shift empty state:

```txt
No selected shifts yet.
Selected shifts will appear here when an employer chooses you.
```

Rules:

- Empty states must not mention Career Jobs, HR Section, Workforce Ops Hub or Admin.
- Empty states must guide the user to the next safe action.
- Empty states must not claim production notification, payment, legal attendance or backend verification.
- Empty states must remain role-safe.

## 1.30. Current Application Implementation Sync (Evidence: 2026-07-16)

This section documents the **current implemented application** for Shift Jobs. Code is the evidence source. Labels use the taxonomy: **IMPLEMENTED**, **PARTIALLY IMPLEMENTED**, **DEMO / LOCAL STORAGE ONLY**, **BACKEND-CONNECTED**, **PLANNED**, **NOT IMPLEMENTED**.

### 1.30.1. Shift Jobs overview

| Item                 | Status                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Domain               | Shift Jobs — temporary / short-duration hiring                                                     |
| Implementation roots | `src/features/employee/shiftJobs/**` (127 files), `src/features/employer/shiftJobs/**` (168 files) |
| Router guard         | `RequireRole` + `EmployeeShell` / `EmployerShell`                                                  |
| Persistence          | **DEMO / LOCAL STORAGE ONLY** — no Shift REST API in feature code                                  |
| Employment creation  | **NOT IMPLEMENTED** — Shift Jobs **never** create Employment Lifecycle records                     |

### 1.30.2. Domain boundary (implemented)

- Shift and Career routes, storage keys, and UI are **strictly separated**.
- Shift confirmation creates **workspace** records only (`wm_employee_shift_workspaces_v1`), not `wm_career_employment_v1` or `wm_employment_lifecycle_v1`.
- Planner legacy routes under `/employee/shift/projects/**` include a Planner browse bridge and redirect segments to Planner — see §1.30.3a. Not core Shift Employment logic.
- `/employer/shift/demand-planner` → redirect to `/employer/planner` — **IMPLEMENTED** redirect; Planner does not execute hiring.

### 1.30.3. Current routes (from `routePaths.ts` + `AppRouter.tsx`)

**Employee (IMPLEMENTED)**

| Constant                    | Path                                     | Page                        |
| --------------------------- | ---------------------------------------- | --------------------------- |
| `employeeShiftCenter`       | `/employee/shift`                        | `ShiftControlCenterPage`    |
| `employeeShiftSearch`       | `/employee/shift/search`                 | `ShiftSearchPage`           |
| `employeeShiftPostDetails`  | `/employee/shift/post/:postId`           | `ShiftPostDetailsApplyPage` |
| `employeeShiftApplications` | `/employee/shift/applications`           | `MyShiftApplicationsPage`   |
| `employeeShiftWorkspaces`   | `/employee/shift/workspaces`             | `MyShiftWorkspacesPage`     |
| `employeeShiftWorkspace`    | `/employee/shift/workspace/:workspaceId` | `ShiftWorkspacePage`        |
| `employeeShiftEarnings`     | `/employee/shift/earnings`               | `EmployeeEarningsPage`      |

**Employer (IMPLEMENTED)**

| Constant                          | Path                                                            | Page                                  |
| --------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `employerShiftHome`               | `/employer/shift`                                               | `EmployerShiftHomePage`               |
| `employerShiftCreate`             | `/employer/shift/create`                                        | `EmployerShiftCreatePage`             |
| `employerShiftPosts`              | `/employer/shift/posts`                                         | `EmployerShiftPostsPage`              |
| `employerShiftPostDashboard`      | `/employer/shift/post/:postId`                                  | `EmployerShiftPostDashboardPage`      |
| `employerShiftShortlist`          | `/employer/shift/post/:postId/shortlist`                        | Same dashboard                        |
| `employerCandidateDetail`         | `/employer/shift/post/:postId/candidate/:appId`                 | `EmployerCandidateDetailPage`         |
| `employerCandidateDocumentAccess` | `/employer/shift/post/:postId/candidate/:appId/document-access` | `EmployerCandidateDocumentAccessPage` |
| `employerShiftWorkspaces`         | `/employer/shift/workspaces`                                    | `EmployerShiftWorkspacesPage`         |
| `employerShiftWorkspace`          | `/employer/shift/workspace/:workspaceId`                        | `EmployerShiftWorkspacePage`          |
| `employerShiftFavorites`          | `/employer/shift/favorites`                                     | `EmployerFavoritesPage`               |
| `employerShiftTemplates`          | `/employer/shift/templates`                                     | `EmployerShiftTemplatesPage`          |
| `employerShiftDemandPlanner`      | `/employer/shift/demand-planner`                                | Redirect → planner home               |

**Route count (core Shift, `routePaths.ts`):** 7 Employee + 12 Employer = **19** primary Shift routes in §1.30.3 tables above. Legacy compatibility routes below are **excluded** from that count.

### 1.30.3a. Legacy / compatibility Employee Shift routes (not core Shift Employment)

| Route source                          | Path                                        | Behaviour                                               | Label                  |
| ------------------------------------- | ------------------------------------------- | ------------------------------------------------------- | ---------------------- |
| `employeeShiftProjects`               | `/employee/shift/projects`                  | Planner browse bridge (`EmployeePlannerBrowsePage`)     | Legacy / compatibility |
| `employeeShiftProjectDetail`          | `/employee/shift/projects/:planId`          | Redirect to Planner (`LegacyShiftProjectRedirect`)      | Legacy / compatibility |
| `employeeShiftProjectApply`           | `/employee/shift/projects/:planId/apply`    | Redirect to Planner (`LegacyShiftProjectApplyRedirect`) | Legacy / compatibility |
| `employeeShiftPlanApplicationSummary` | `/employee/shift/applications/plan/:planId` | Redirect (`LegacyShiftPlanSummaryRedirect`)             | Legacy / compatibility |

Planner bridge routes are **not** core Shift hiring logic and **do not** mean Planner executes hiring or creates Employment.

### 1.30.3b. Planner workspace UI reuse (Shift page component only)

| Route source                   | Path                                       | Component            | Note                                                                                                                                                        |
| ------------------------------ | ------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EC.plannerWorkspace` (nested) | `/employee/planner/workspace/:workspaceId` | `ShiftWorkspacePage` | **UI reuse only** — same Shift workspace page component mounted on a Planner route segment. Does **not** merge Shift and Planner business-domain ownership. |

### 1.30.4. Employee Shift flow (IMPLEMENTED)

1. **Control center** (`ShiftControlCenterPage`) — hub tiles, stats, preview posts, 7-day availability calendar, direct-invite cards.
2. **Search** (`ShiftSearchPage`) — filters, smart matches, recently viewed, favorites, quick apply, save shift.
3. **Post detail / apply** (`ShiftPostDetailsApplyPage`) — must-have gate (`meets` / `not_sure` / `dont_meet`), quick questions (`yes`/`no`), notes, submit, withdraw.
4. **Applications** (`MyShiftApplicationsPage`) — tabs `all` / `active` / `confirmed` / `closed`; status timeline; attendance confirm.
5. **Workspaces** (`MyShiftWorkspacesPage`, `ShiftWorkspacePage`) — updates feed, employer reply, exit (`emergency`/`sick`/`travel`/`other`), rate employer when completed.
6. **Earnings** (`EmployeeEarningsPage`) — computed from confirmed shift applications — **DEMO / LOCAL STORAGE ONLY**; no payout API.

### 1.30.5. Employer Shift flow (IMPLEMENTED)

1. **Home** — KPIs, recent posts, local workers radar (blind WM IDs), draft reminder, create CTA.
2. **Create** (`EmployerShiftCreatePage`) — multi-step wizard; drafts (`wm_employer_shift_post_drafts_v1`); templates prefill; publish → `syncToEmployeeSearch`.
3. **Post dashboard** — smart analysis (`not_started` / `done`); shortlist; waitlist (`waiting`); reject; confirm (creates workspace); replace confirmed worker; hide/unhide; close/cancel post; activity log.
4. **Candidate detail** — requirement answers; document access when shortlisted/confirmed.
5. **Workspaces** — broadcast, direct reply, mark completed, rate worker.
6. **Favorites / templates / direct invite** — invite to shift; accept path merges into confirm pipeline.

### 1.30.6. Implemented status tables (exact code strings)

**Shift post status** (`ShiftPostStatus` in `employerShift.types.ts`) — **IMPLEMENTED**

| Status      | Meaning                   |
| ----------- | ------------------------- |
| `active`    | Open post                 |
| `completed` | Shift work completed      |
| `cancelled` | Closed by employer/system |

Display also uses **Expired** (past `endAt`) and **Closed** in dashboard header — UI labels, not separate enum values.

**Shift application status** (`ShiftApplicationStatus` / `ApplicantStatus`) — **IMPLEMENTED**

| Status        | UI label     |
| ------------- | ------------ |
| `applied`     | Applied      |
| `shortlisted` | Shortlisted  |
| `waiting`     | Backup       |
| `confirmed`   | Confirmed    |
| `rejected`    | Not selected |
| `withdrawn`   | Withdrawn    |
| `replaced`    | Replaced     |
| `exited`      | Exited       |

**Shift workspace status** (`ShiftWorkspaceStatus`) — **IMPLEMENTED**

| Status      | Badge     |
| ----------- | --------- |
| `active`    | ACTIVE    |
| `upcoming`  | UPCOMING  |
| `completed` | COMPLETED |
| `left`      | LEFT      |
| `replaced`  | REPLACED  |

**Direct invite status** — **IMPLEMENTED:** `pending`, `accepted`, `declined`, `expired`

**Payment stage UI** — **PLANNED / NOT CONNECTED:** `not_available`, `pending`, `processing`, `paid`, `failed` (timeline labels only)

### 1.30.7. Search, filter, and apply behaviour

| Feature                   | Status      | Evidence                                           |
| ------------------------- | ----------- | -------------------------------------------------- |
| Text/location filters     | IMPLEMENTED | `ShiftSearchFilterPanel`, `shiftSearch.storage.ts` |
| Recently viewed           | IMPLEMENTED | `wm_employee_shift_views_v1`                       |
| Saved / favorites         | IMPLEMENTED | `wm_employee_shift_favorites_v1`                   |
| Quick apply               | IMPLEMENTED | Search results → apply without full detail         |
| Must-have gate on apply   | IMPLEMENTED | All must-haves must be `meets`                     |
| Withdraw                  | IMPLEMENTED | Only from `applied`, `shortlisted`, `waiting`      |
| Hidden/expired post block | IMPLEMENTED | `isHiddenFromSearch`, `endAt < now`                |

### 1.30.8. Storage and data source (Phase-0)

| Key                                      | Writer                           | Reader                  | Label                                                              |
| ---------------------------------------- | -------------------------------- | ----------------------- | ------------------------------------------------------------------ |
| `wm_employer_shift_posts_v1`             | Employer                         | Both                    | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employee_shift_applications_v1`      | Employee create; Employer status | Both                    | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employee_shift_workspaces_v1`        | Employer on confirm              | Both                    | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employer_shift_post_drafts_v1`       | Employer                         | Employer                | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employer_shift_templates_v1`         | Employer                         | Employer                | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employer_shift_favorites_v1`         | Employer                         | Employer                | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employer_shift_activity_log_v1`      | Employer                         | Employer                | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employee_shift_views_v1`             | Employee                         | Employee                | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employee_availability_broadcast_v1`  | Employee                         | Employee                | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_all_availability_broadcasts_v1`      | Employee                         | Employer radar          | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_shift_direct_invites_v1`             | Employer                         | Both                    | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_shift_availability_pulse_queue_v1`   | System/employer pulse enqueue    | Employee pulse consumer | DEMO / LOCAL STORAGE ONLY                                          |
| `wm_employee_personal_calendar_shift_v1` | Shift confirmations              | Employee calendar UI    | DEMO / LOCAL STORAGE ONLY — Shift only; not Employment; not Career |
| `wm_pending_shift_template`              | Employer                         | Employer                | sessionStorage prefill                                             |

**Source-of-truth rule:** Frontend storage is a **demo/local sync layer**. Backend/database must be the production source of truth. Cross-role sync uses shared keys + custom events (`wm:employee-shift-applications-changed`, etc.).

### 1.30.9. Backend readiness

| Area                           | Status                                               |
| ------------------------------ | ---------------------------------------------------- |
| Shift REST API in feature code | **NOT IMPLEMENTED**                                  |
| Real-time sync                 | **NOT IMPLEMENTED**                                  |
| Production messaging           | **NOT IMPLEMENTED** — workspace chat is local demo   |
| Production OTP / notifications | **NOT IMPLEMENTED** — pulse/bell demo only           |
| Payment processing             | **NOT IMPLEMENTED** — UI stages only                 |
| Backend authorization          | **PLANNED** — Phase-0 uses `RequireRole` + role pick |

### 1.30.10. Security and privacy (implemented)

| Rule                                  | Status                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Employee vs Employer route separation | IMPLEMENTED (`RequireRole`)                                                                            |
| Shift vs Career separation            | IMPLEMENTED                                                                                            |
| Contact reveal                        | **BLOCKED** — `isShiftContactRevealed()` always false; platform lock strip                             |
| Work Vault on candidate               | **PARTIALLY IMPLEMENTED** — document access page for shortlisted/confirmed only; snapshot/OTP boundary |
| Availability radar                    | Blind WM IDs only — no full profile leak in create flow                                                |
| Audit log                             | Local activity log only — **NOT** production audit trail                                               |

### 1.30.11. Current limitations

- No post reopen after `cancelled` / `completed`.
- No backend enforcement of pipeline actions; race conditions possible in multi-tab demo.
- Draft auto-save is manual save, not continuous auto-save (see §1.27 target vs code).
- Preview-before-publish wizard step — **PARTIALLY IMPLEMENTED** / verify per post draft audit.
- Negative paths (withdraw, replace, direct invite) — code exists; limited E2E coverage.

### 1.30.12. Testing checklist (Shift)

| Test                                   | Path                                    | Status                          |
| -------------------------------------- | --------------------------------------- | ------------------------------- |
| Full circuit E2E                       | `tests/e2e/shift-full-circuit.spec.ts`  | **Yes verified**                |
| Availability calendar                  | `tests/e2e/availability-phase1.spec.ts` | **Yes verified**                |
| Withdraw / replace / direct invite E2E | —                                       | **Needs explicit verification** |
| Unit tests in `shiftJobs/**`           | —                                       | **NOT IMPLEMENTED**             |

### 1.30.13. Features implemented but previously under-documented

| Feature                                    | Role     | Evidence                                                                                                                                              |
| ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7-day availability broadcast + pulse queue | Employee | `availabilityStorage.ts`, `shiftAvailabilityPulseQueue.storage.ts` (`wm_shift_availability_pulse_queue_v1`), `shiftAvailabilityMatchPulse.service.ts` |
| Personal calendar shift blocks             | Employee | `personalCalendarShift.storage.ts` (`wm_employee_personal_calendar_shift_v1`) — DEMO / LOCAL STORAGE ONLY                                             |
| Direct invite accept/decline loop          | Both     | `shiftDirectInvite.service.ts`                                                                                                                        |
| Smart analysis scoring groups              | Employer | `employerShift.analysis.ts`, dashboard                                                                                                                |
| Post templates + session prefill           | Employer | `wm_employer_shift_templates_v1`, `wm_pending_shift_template`                                                                                         |
| Local workers radar (blind match)          | Employer | `LocalWorkersRadarCard`, `wm_all_availability_broadcasts_v1`                                                                                          |
| Attendance confirm on applications         | Employee | `shiftApplications.storage.ts`                                                                                                                        |
| Vault history finalize on shift complete   | Both     | `finalizeVaultShiftHistoryForPost` integration                                                                                                        |
| Earnings page (computed local)             | Employee | `earningsStorage.ts`                                                                                                                                  |

### 1.30.14. Explicit rule

**Shift Jobs never create Employment.** Confirmed in code: hire activation paths exist only under `careerJobs/**` and `activateCareerHire`. Shift confirm creates workspace + application status only.

## 1.31. Final Shift Jobs Lock Note

> **IMPORTANT — TARGET RULE, NOT CURRENT PHASE-0 BEHAVIOUR**
>
> Bullets below describe **approved architecture targets**. For **current implemented** Shift behaviour (routes, storage, demo limits), read **§1.30** first. Shift Jobs **never** create Employment in either target or current code.

Shift Jobs is approved as the temporary / short-duration hiring pillar.

Final locked boundaries (target architecture):

- Shift Jobs must stay separate from Career Jobs.
- Shift Jobs must not create Employment Lifecycle records.
- Shift Jobs must not expose hidden HR Section, Manager Console, Workforce Ops Hub or Admin System.
- Smart Match Score is advisory only.
- Backup / Standby is a launch-safe reliability feature, not Workforce Ops.
- Reliability Score is separate from rating.
- Pre-shift confirmation is local/in-app in Phase 0 unless real notification infrastructure exists.
- Shift Fill Health is employer guidance only.
- Drafts must remain owner-only and not visible to employees until published.
- Preview, duplicate warning, auto-save and publish confirmation must protect employer posting flow.
- Phase 0 must remain honest, local-first and Play Store safe.

— END OF SHIFT JOBS ARCHITECTURE —
