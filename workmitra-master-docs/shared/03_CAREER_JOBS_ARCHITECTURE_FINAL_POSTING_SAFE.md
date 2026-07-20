<!-- App name: WorkMitra / Job Mitra
File name: 03_CAREER_JOBS_ARCHITECTURE.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\03_CAREER_JOBS_ARCHITECTURE.md -->

# 1. WORKMITRA / JOB MITRA — CAREER JOBS ARCHITECTURE

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 1.2. Purpose

Career Jobs is the structured longer-form hiring pillar of Job Mitra.

It supports structured job posting, employee applications, applicant progression, selection, offer handling and controlled Employment Lifecycle entry without mixing with Shift Jobs or the hidden HR Section.

## 1.3. Core Principle

Career Jobs = structured longer-form hiring for practical, non-professional and low-confusion employment discovery.

Career Jobs must remain:

- structured
- simple to understand
- trust-aware
- role-safe
- application-based
- lifecycle-aware
- separate from Shift Jobs
- separate from hidden HR Section
- separate from ATS / CV-heavy recruiter systems

## 1.4. What Career Jobs Is

Career Jobs is:

- a launch-visible core pillar
- a structured job posting and application flow
- the only launch-visible entry point into Employment Lifecycle
- a trust-aware employer / employee decision surface
- a controlled mini-HR bridge after valid selection
- a simple hiring workflow for non-professional and practical career users

## 1.5. What Career Jobs Is Not

Career Jobs is not:

- Shift Jobs
- temporary / daily work flow
- urgent worker dispatch
- Workforce Ops Hub
- Manager Console
- full HR Section
- payroll
- recruiter ERP
- ATS platform
- CV parsing system
- resume ranking system
- uncontrolled staff management system

## 1.6. Hard Non-Mixing Rule

Career Jobs must never be treated as Shift Jobs with longer duration.

Career Jobs must not use:

- shift completion states
- no-show replacement logic from temporary work
- short-term worker assignment logic
- daily / urgent shift closure logic

Career Jobs may use Employment Lifecycle only after structured selection, offer, acceptance and joined confirmation logic.

Career Jobs must not become hidden HR Section, Manager Console, Workforce Ops Hub, payroll, legal employment proof, ATS or recruiter ERP.

## 1.7. Non-Professional User Fit Rule

Career Jobs must be designed for users who may not have:

- professional CV
- formal resume
- ATS-ready profile
- recruiter-style hiring knowledge
- advanced job-application experience

The workflow should rely on:

- simple profile
- skills
- experience summary
- availability
- location/work-area fit
- employer trust
- Work Vault readiness where relevant
- clear application status
- simple next action

Rule:

Career Jobs must stay advanced in workflow quality but simple in user experience.

## 1.8. Role Fit

### 1.8.1. Employer

Employer uses Career Jobs to:

- create structured job posts
- review applicants
- shortlist applicants
- compare suitable candidates simply
- progress candidates
- request discussion / interview where needed
- make selection / offer decisions
- confirm joined where allowed
- manage launch-scope Employment Lifecycle states

Employer must not:

- silently mark an applicant as working without valid prior state
- access private Work Vault documents without allowed access
- expose hidden HR Section in launch flow
- use Career Jobs as payroll / full HR system
- force ATS / CV-heavy process on non-professional users

### 1.8.2. Employee

Employee uses Career Jobs to:

- discover structured jobs
- view employer trust
- understand simple eligibility
- apply without needing a professional CV
- track application status
- respond to discussion / offer where applicable
- accept / decline offer where applicable
- understand selected / working / notice / resigned / completed states

Employee must not:

- self-confirm joined
- see other applicants
- see employer private notes
- access employer management controls
- enter hidden HR Section from Career Jobs
- be forced into ATS / CV-heavy application flow

### 1.8.3. Admin

Admin remains hidden in launch UI.

Admin may review abuse, fake jobs or disputes through hidden Admin System only.

### 1.8.4. Hidden HR Section

Hidden HR Section must remain separate.

It must not appear as Career Jobs launch UI.

## 1.9. Screen-by-Screen Architecture

### 1.9.1. Employer-Side Screens

#### 1.9.1.1. Career Jobs Home

Shows:

- active Career Jobs
- draft jobs
- applicants needing review
- selected / offered candidates
- Employment Lifecycle follow-ups
- simple application quality summary
- offer response reminders where applicable

#### 1.9.1.2. Create Career Job

Captures:

- job title
- job category
- job description
- role requirements
- location / work area
- salary / pay range reference where shown
- employment type wording
- basic eligibility questions where needed
- required documents where relevant
- trust / safety notes where needed

Must support:

- Save as Draft
- resume draft
- preview before publish
- publish confirmation
- duplicate Career Job warning
- unsaved changes warning
- local auto-save where supported

#### 1.9.1.3. Career Job Detail

Shows:

- full job details
- visibility / status
- applicant count
- applicant pipeline
- basic eligibility summary
- employer-side next actions

#### 1.9.1.4. Applicant Pipeline

Shows applicants grouped by state:

- applied
- under review
- shortlisted
- discussion requested
- discussion scheduled
- discussion completed
- selected
- offered
- accepted
- joined
- rejected
- withdrawn

#### 1.9.1.5. Applicant Detail

Shows:

- employee profile summary
- WM ID
- rating / trust level
- simple applicant fit signal
- application strength indicator
- basic eligibility answers
- Work Vault verification options
- application details
- timeline
- allowed employer actions

#### 1.9.1.6. Candidate Comparison View

Shows shortlisted applicants side by side using simple decision signals:

- skill fit
- experience summary
- location / work-area fit
- availability fit
- trust level / rating summary
- Work Vault readiness where relevant
- application strength
- discussion / offer status

Rules:

- comparison must be simple and readable
- comparison must not expose private documents
- comparison must not become ATS ranking
- employer makes the final decision

#### 1.9.1.7. Discussion / Interview Screen

Used for:

- request discussion
- set discussion status
- mark discussion scheduled
- mark discussion completed
- continue to selection where allowed

Rule:

This must remain a simple discussion workflow, not a complex calendar or recruiter scheduling system unless future-approved.

#### 1.9.1.8. Offer / Selection Screen

Used for:

- select candidate
- issue offer state
- set offer expiry where applicable
- wait for employee response
- remind employee where safe
- confirm joined after actual start

#### 1.9.1.9. Employment Lifecycle Detail

Used only after valid Employment Lifecycle entry.

### 1.9.2. Employee-Side Screens

#### 1.9.2.1. Career Jobs Discovery

Shows:

- relevant Career Jobs
- employer trust summary
- role title
- requirements
- location / work area
- salary / pay reference where shown

#### 1.9.2.2. Career Job Detail

Shows:

- full job details
- employer trust visibility
- requirements
- basic eligibility questions where applicable
- application action
- Work Vault sharing / verification context where relevant

#### 1.9.2.3. Apply Career Job Screen

Shows:

- simple application form
- basic eligibility questions
- profile readiness reminder
- Work Vault optional support where relevant
- final apply action

Rules:

- CV upload must not be mandatory
- ATS-style resume scoring must not be used
- wording must remain low-confusion

#### 1.9.2.4. My Career Applications

Shows:

- applied jobs
- shortlisted jobs
- discussion requested / scheduled jobs
- selected / offered jobs
- accepted / working jobs
- rejected / withdrawn / closed jobs

#### 1.9.2.5. Application Detail

Shows:

- current application state
- employer decision status
- required next action
- discussion status where applicable
- offer / acceptance status where applicable
- offer expiry / response deadline where applicable

#### 1.9.2.6. Employment Lifecycle Status

Shows:

- selected
- offer pending
- offer accepted
- joined confirmation pending
- working
- notice
- resigned
- completed
- force-complete availability where allowed

## 1.10. Career Job Lifecycle / State Machine

> **Documentation layers (read in order):**
>
> - **§1.10 below** — long-term canonical / target state vocabulary.
> - **§1.28 Current Application Implementation Sync** — **Phase-0 implemented** status strings, routes, storage, and behaviour verified from code (**2026-07-16**).
>
> §1.10.2–1.10.3 values such as `offer_accepted`, `joined_confirmed`, `discussion_scheduled` are **target** states. Live app uses the simpler pipeline in §1.28.6.

### 1.10.1. career_job_status

Allowed values:

- draft
- draft_incomplete
- draft_ready
- preview_ready
- publish_confirmation_pending
- published
- applications_open
- applications_paused
- review_in_progress
- candidate_selected
- offer_pending
- position_filled
- closed_by_employer
- closed_no_hire
- expired
- cancelled_by_employer

### 1.10.2. career_application_status

Allowed values:

- not_applied
- applied
- under_review
- shortlisted
- discussion_requested
- discussion_scheduled
- discussion_completed
- selected
- offer_pending
- offer_sent
- offer_accepted
- offer_declined
- joined_confirmed
- rejected
- withdrawn
- expired
- closed

### 1.10.3. employment_lifecycle_status

Allowed values:

- selected
- working
- notice
- resigned
- completed

Completion variants:

- completed + exitType = resigned
- completed + exitType = terminated
- completed + forceCompleted = true

## 1.11. Valid Transitions

### 1.11.1. Job

- draft → draft_incomplete
- draft_incomplete → draft_ready
- draft_ready → preview_ready
- preview_ready → publish_confirmation_pending
- publish_confirmation_pending → published
- draft_ready → published where preview is skipped by approved rule
- published → applications_open
- applications_open → review_in_progress
- review_in_progress → candidate_selected
- candidate_selected → offer_pending
- offer_pending → position_filled
- applications_open → closed_no_hire
- applications_open → cancelled_by_employer

### 1.11.2. Application

- not_applied → applied
- applied → under_review
- under_review → shortlisted
- shortlisted → discussion_requested / discussion_scheduled
- discussion_requested → discussion_scheduled
- discussion_scheduled → discussion_completed
- discussion_completed → selected
- shortlisted → selected where discussion is not required
- selected → offer_pending
- offer_pending → offer_sent
- offer_sent → offer_accepted / offer_declined
- offer_sent → expired where deadline passes
- offer_accepted → joined_confirmed
- joined_confirmed → Employment Lifecycle working state

## 1.12. Blocked Transitions

Blocked:

- applied → joined_confirmed
- selected → working
- offer_accepted → working without employer joined confirmation
- Career Job → Shift completion
- Career applicant → Shift worker assignment
- Career Jobs → hidden full HR Section without explicit future migration
- application quality score → automatic rejection
- simple applicant fit score → automatic hiring decision

## 1.13. Accept vs Joined Rule

Accept does not mean Joined.

Accept:

- employee agrees to offer / selection

Joined:

- employer confirms actual start / working state

Rule:

Career Jobs must never collapse Accept and Joined into one state.

> **Phase-0 implementation note (2026-07-16):** The live app uses stage `hired` and `activateCareerHire()` on **either** employee offer accept (`acceptCareerOffer`) **or** employer **Mark as Hired** (`hireCandidate`) from `offered` — without a distinct `offer_accepted` stage or mandatory employer confirm-hire gate before employment side-effects. See **§1.28.11**. Target backend behaviour remains in `second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`. **CRITICAL** architecture/code gap.

## 1.14. Employment Lifecycle Entry Rule

Employment Lifecycle may start only when:

- Career Job exists
- employee was selected / offered
- employee accepted where required
- employer confirms joined / working state

Rule:

Shift Jobs must never create Employment Lifecycle state.

## 1.15. Advanced Simple Career Hiring Support

This section adds the minimum advanced support layer required to make Career Jobs feel enterprise-grade and user-ready without turning it into ATS, CV parsing, recruiter ERP or hidden HR Section.

The goal is to prevent the biggest user failures in longer-form hiring:

- employee does not understand whether they are suitable
- employer cannot quickly identify practical candidates
- application status feels unclear
- offer response becomes stale
- discussion / selection flow feels incomplete

### 1.15.1. Simple Applicant Fit Score

Simple Applicant Fit Score helps the employer quickly understand whether an applicant may fit the job.

It may consider:

- skill/category match
- experience summary
- location / work-area fit
- availability fit
- employer-required eligibility answers
- rating / trust level
- Work Vault readiness where relevant
- profile completion state

Allowed fit labels:

- good_fit
- possible_fit
- needs_review
- low_data

Rules:

- This is advisory only.
- Employer makes the final decision.
- It must not claim AI hiring, ATS ranking or automated candidate approval.
- Low-data applicants must not be unfairly hidden.
- The explanation must be simple and readable.

Safe wording:

```txt
Suggested fit based on available profile, skills and job requirements.
```

Blocked wording:

```txt
ATS approved candidate.
AI selected candidate.
Guaranteed best applicant.
```

### 1.15.2. Basic Eligibility Questions

Basic Eligibility Questions help employers collect simple job-relevant answers without making the application feel professional or difficult.

Examples:

- Can you work weekends?
- Do you have experience in this work type?
- Can you travel to this work area?
- Are you available to start from the expected date?
- Do you have the required basic skill or certificate where applicable?

Rules:

- Questions must be simple.
- Questions must be job-relevant.
- Questions must not become discriminatory or invasive.
- Questions must not ask unnecessary sensitive personal data.
- Questions must not become a complex ATS questionnaire.

Safe wording:

```txt
Answer a few simple questions so the employer can understand your fit for this job.
```

### 1.15.3. Application Strength Indicator

Application Strength Indicator helps the employee improve the application before applying.

It may show:

- profile is ready
- skills missing
- experience summary missing
- Work Vault optional support available
- basic eligibility answers incomplete
- employer trust reviewed

Allowed strength states:

- ready_to_apply
- can_improve
- missing_basic_details
- low_data

Rules:

- This must guide the employee, not shame the employee.
- It must not block application unless required fields are missing.
- Work Vault must remain optional unless job-specific document proof is required and approved.
- CV upload must not be required.

Safe wording:

```txt
Your application is ready, but adding skills may help the employer understand you better.
```

### 1.15.4. Interview / Discussion Scheduling Flow

Career Jobs may support a simple discussion flow before selection.

Allowed discussion states:

- discussion_not_required
- discussion_requested
- discussion_scheduled
- discussion_completed
- discussion_cancelled

Rules:

- This is a simple hiring discussion status.
- It must not become full calendar scheduling unless future-approved.
- It must not expose employer private notes.
- It must not become Manager Console or HR Section.
- Employee must clearly see the next action where discussion is required.

Safe wording:

```txt
The employer requested a discussion before the next decision.
```

### 1.15.5. Offer Expiry / Response Reminder

Offer Expiry / Response Reminder keeps offer handling clear and prevents stale applications.

Offer may include:

- offer_sent_at
- response_deadline_optional
- reminder_status
- expired status where deadline passes

Rules:

- Employee must clearly see accept / decline options.
- Offer expiry must not silently become rejection.
- Employer must see pending / accepted / declined / expired status.
- Phase 0 may use in-app local reminders only.
- Do not claim push, SMS, WhatsApp or email reminder unless implemented.

Safe wording:

```txt
Please respond to this offer before the deadline.
```

### 1.15.6. Candidate Comparison View

Candidate Comparison View helps employer compare shortlisted applicants without creating an ATS system.

It may compare:

- skills
- experience summary
- location / work-area fit
- availability
- trust level / rating
- application strength
- eligibility answers
- Work Vault readiness where relevant

Rules:

- It must stay simple.
- It must not rank candidates as automatic winners.
- It must not expose private Work Vault documents.
- It must not expose other applicants to employees.
- Employer remains responsible for the decision.

Safe wording:

```txt
Compare shortlisted applicants using simple hiring signals.
```

## 1.16. Advanced Support Phase-0 Boundary

In Phase 0, these advanced Career Jobs features may work through local demo-safe logic.

Allowed:

- local simple applicant fit signal
- local application strength indicator
- local eligibility answers
- local discussion status
- local offer expiry / reminder status
- local candidate comparison view

Not allowed in Phase 0:

- ATS claim
- CV parsing claim
- real AI hiring decision claim
- automatic rejection based on score
- real push notification claim
- real SMS / WhatsApp / email reminder claim
- payroll / legal employment proof
- hidden HR Section exposure
- Manager Console exposure

Rule:

These features should improve clarity and decision quality without making Career Jobs feel like professional recruiter software.

## 1.17. Action Catalog

### 1.17.1. Employer Allowed Actions

Employer may:

- create draft Career Job
- publish Career Job
- edit draft
- pause applications
- add basic eligibility questions
- review applicant
- view simple applicant fit signal
- view application strength indicator
- compare shortlisted candidates
- request discussion
- mark discussion scheduled / completed
- shortlist applicant
- reject applicant
- select candidate
- send / mark offer
- set offer response deadline where supported
- confirm joined
- mark lifecycle transition where allowed
- close job
- rate employee where workflow requires

### 1.17.2. Employee Allowed Actions

Employee may:

- view Career Job
- view employer trust
- answer basic eligibility questions
- improve application strength where possible
- apply
- withdraw application where allowed
- view discussion status
- accept offer
- decline offer
- view lifecycle state
- resign where allowed
- force complete where allowed
- rate employer where workflow requires

### 1.17.3. Blocked Actions

Blocked:

- employer silently marks employee working without valid prior state
- employee self-joins without employer confirmation
- hidden HR actions from launch UI
- Shift Job replacement logic
- payroll / salary processing
- uncontrolled document access
- mandatory CV upload for normal Career Jobs
- ATS-style automatic rejection
- AI hiring approval claim

## 1.18. Offer / Response Rules

Offer flow must preserve:

- offer created / sent state
- employee response
- acceptance / decline timestamp
- response deadline where used
- reminder status where used
- employer joined confirmation
- lifecycle entry state

Offer expiry / stale response:

- may be marked expired
- must not silently become rejection
- must preserve timeline
- must remain visible as expired / no response where appropriate

## 1.19. Withdrawal / Rejection Rules

Employee withdrawal:

- should preserve application history
- should not delete employer-side audit context

Employer rejection:

- should preserve candidate state
- should use safe wording
- should not expose internal employer notes
- should not say rejected by AI / ATS / system score

## 1.20. Notification / Alert Contract

### 1.20.1. Employer Notifications

- new_career_application
- applicant_withdrew
- discussion_response_pending
- applicant_accepted_offer
- applicant_declined_offer
- offer_response_pending
- offer_expired
- joined_confirmation_pending
- lifecycle_action_needed
- rating_required

### 1.20.2. Employee Notifications

- application_received
- application_under_review
- shortlisted
- discussion_requested
- discussion_scheduled
- selected
- offer_sent
- offer_expiring
- offer_expired
- joined_confirmed
- lifecycle_status_updated
- rating_required

### 1.20.3. Notification Safety Rules

Notifications must not:

- use Shift Job wording
- expose other applicants
- expose employer private notes
- imply full HR Section is active
- claim real push / SMS / WhatsApp / email unless implemented
- use ATS / AI approval wording

## 1.21. Evidence / Audit / Correction Model

Evidence may include:

- job post snapshot
- application timestamp
- eligibility answers
- shortlist timestamp
- discussion status
- selection decision
- offer record
- offer deadline / expiry status
- employee response
- joined confirmation
- lifecycle transition
- rating completion

Audit required for:

- publish
- eligibility question change after applications exist
- shortlist
- rejection
- selection
- discussion status update
- offer
- offer acceptance / decline
- offer expiry
- joined confirmation
- lifecycle transition
- resignation
- force complete
- completion
- rating edit

Correction must preserve:

- old state
- new state
- reason
- actor
- timestamp
- before / after state

## 1.22. Permission Matrix

### 1.22.1. Employer

Employer:

- can manage own Career Jobs and own applicants only
- can confirm Joined only for selected / accepted candidates
- can view applicant fit signal only for applicants to own jobs
- can compare only applicants to own jobs

### 1.22.2. Employee

Employee:

- can manage own applications and own lifecycle actions only
- can accept / decline offer for self only
- can view own application strength only
- cannot view other applicants or comparison lists

### 1.22.3. Admin

Admin:

- hidden launch role
- reviews through separate Admin governance only

### 1.22.4. Hidden HR Section

Hidden HR Section:

- cannot control launch Career Jobs unless a future version explicitly exposes migration / integration

## 1.23. Data Model

### 1.23.1. CAREER_JOB

Fields:

- career_job_id
- employer_id
- title
- category
- description
- requirements
- location_summary
- salary_reference_optional
- employment_type_reference
- career_job_status
- eligibility_questions_enabled
- created_at
- updated_at

### 1.23.2. CAREER_APPLICATION

Fields:

- career_application_id
- career_job_id
- employee_id
- application_status
- application_strength_status_optional
- applicant_fit_status_optional
- applied_at
- updated_at
- withdrawn_at_optional
- rejection_reason_category_optional

### 1.23.3. CAREER_ELIGIBILITY_QUESTION

Purpose:

Simple employer-defined question for a Career Job.

Fields:

- eligibility_question_id
- career_job_id
- question_text
- answer_type
- required
- display_order
- created_at
- updated_at

Rule:

Eligibility questions must remain simple, job-relevant and privacy-safe.

### 1.23.4. CAREER_ELIGIBILITY_ANSWER

Purpose:

Employee answer to a job-specific eligibility question.

Fields:

- eligibility_answer_id
- career_application_id
- eligibility_question_id
- answer_value
- created_at
- updated_at

Rule:

Answers belong to the application and must not become general public profile data automatically.

### 1.23.5. CAREER_APPLICANT_FIT_SIGNAL

Purpose:

Advisory applicant suitability signal for a specific Career Job.

Fields:

- applicant_fit_signal_id
- career_job_id
- career_application_id
- employee_id
- fit_status
- skill_fit_summary
- experience_fit_summary_optional
- location_fit_status
- availability_fit_status_optional
- trust_summary_reference_optional
- work_vault_readiness_optional
- low_data_state
- explanation_summary
- calculated_at

Rule:

Applicant Fit Signal is advisory only and must not replace employer decision-making.

### 1.23.6. CAREER_APPLICATION_STRENGTH

Purpose:

Employee-facing readiness indicator before or after applying.

Fields:

- application_strength_id
- career_application_id_optional
- employee_id
- career_job_id
- strength_status
- missing_profile_fields_optional
- missing_skill_summary
- work_vault_optional_prompt
- eligibility_answer_completion_status
- calculated_at

Rule:

Application Strength must guide the employee and must not shame or block unfairly.

### 1.23.7. CAREER_DISCUSSION_RECORD

Purpose:

Simple discussion / interview status record for a Career application.

Fields:

- career_discussion_record_id
- career_application_id
- employer_id
- employee_id
- discussion_status
- requested_at_optional
- scheduled_at_optional
- completed_at_optional
- cancelled_at_optional
- created_at
- updated_at

Rule:

Discussion Record must remain Career Jobs launch workflow only and must not become hidden HR Section or Manager Console.

### 1.23.8. CAREER_OFFER

Fields:

- career_offer_id
- career_application_id
- employer_id
- employee_id
- offer_status
- offered_at
- employee_response_status
- employee_response_at_optional
- response_deadline_optional
- reminder_status_optional
- expires_at_optional

Offer_status allowed values:

- draft
- sent
- accepted
- declined
- expired
- cancelled

### 1.23.9. EMPLOYMENT_LIFECYCLE_RECORD

Fields:

- employment_lifecycle_record_id
- career_job_id
- career_application_id
- employer_id
- employee_id
- lifecycle_status
- exit_type_optional
- force_completed
- current_state_since
- created_at
- updated_at

### 1.23.10. CAREER_TIMELINE_EVENT

Fields:

- career_timeline_event_id
- career_job_id
- career_application_id_optional
- actor_role
- actor_id
- event_type
- old_state_optional
- new_state_optional
- reason_optional
- created_at

## 1.24. Source Truth Labels

career_source_type allowed values:

- employer_created
- employer_draft_saved
- employer_draft_resumed
- employer_previewed
- employer_publish_confirmed
- employer_duplicate_warning_shown
- employer_edited
- employee_applied
- eligibility_answered
- application_strength_calculated
- applicant_fit_calculated
- employer_shortlisted
- discussion_requested
- discussion_scheduled
- discussion_completed
- employer_selected
- employer_offer_sent
- offer_reminder_created
- offer_expired
- employee_responded
- employer_joined_confirmed
- lifecycle_transition
- system_expired

## 1.25. Employer Job Posting Draft Safety System

This section adds the required employer-side posting safety layer for Career Jobs.

The goal is to prevent employer abandonment, accidental data loss, duplicate posting and accidental public publishing, especially because Career Job forms may be longer than Shift Job forms.

### 1.25.1. Save as Draft

Employer must be able to save a Career Job before publishing.

Draft Career Job rules:

- draft is owner-only
- draft is not visible to employees
- draft does not accept applications
- draft can be resumed later
- draft can be edited
- draft can be deleted by the owner
- draft can be published only after required fields are complete

Safe wording:

```txt
Saved as draft. This job is not visible to applicants yet.
```

### 1.25.2. Resume Draft

Employer must be able to continue an unfinished Career Job.

Resume Draft should preserve:

- job title
- category
- description
- role requirements
- location/work area
- salary/pay reference
- employment type wording
- eligibility questions
- required documents where relevant
- trust/safety notes

Rules:

- resume draft must open in edit mode
- missing required fields must be clearly shown
- draft must not silently publish

### 1.25.3. Auto-save While Filling

Long Career Job forms should support local auto-save where possible.

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

### 1.25.4. Preview Before Publish

Employer should be able to preview how the Career Job will appear to employees before publishing.

Preview should show:

- employee-facing title
- employer trust summary area
- location/work area
- role requirements
- pay/salary reference where shown
- eligibility questions
- application expectations
- safety/trust notes

Rules:

- preview is not public
- preview must not create applications
- preview must not expose employer private notes
- preview must not expose hidden HR/Admin data

Safe wording:

```txt
Preview how applicants will see this job before publishing.
```

### 1.25.5. Duplicate Career Job Warning

System should warn the employer when a similar Career Job may already exist.

Duplicate check may compare:

- title
- category
- location/work area
- employment type
- employer ID
- active/published status

Rules:

- duplicate warning is advisory only
- employer may continue if intentional
- system must not block valid repeated hiring unfairly
- warning must not publish or delete anything automatically

Safe wording:

```txt
A similar Career Job may already exist. Review before publishing again.
```

### 1.25.6. Publish Confirmation

Before publishing, employer must see a clear confirmation.

Confirmation must explain:

- job will become visible to employees
- applicants may apply
- employer should review details first

Safe wording:

```txt
This Career Job will be visible to applicants. Continue?
```

Actions:

- Review Again
- Publish Job

### 1.25.7. Incomplete Draft Reminder

Employer dashboard should show unfinished Career Job drafts.

Reminder may show:

- number of unfinished drafts
- most recent draft
- continue editing action
- delete draft action

Safe wording:

```txt
You have unfinished Career Job drafts.
```

### 1.25.8. Draft Safety Boundary

Draft safety must not:

- expose draft jobs to employees
- count draft jobs as active/public jobs
- accept applications
- trigger notifications to employees
- affect employer trust/rating
- appear in employee search/discovery

Rule:

Draft means private employer-owned preparation state only.

## 1.26. UX Quality Rules

Career Jobs UX must be:

- structured
- calm
- clear
- trust-visible
- pipeline-readable
- non-professional-user-friendly
- visually separate from Shift Jobs
- visually separate from HR Section
- free from ATS / CV-heavy language

Employee first-read must answer:

- What is the role?
- Who is the employer?
- Can I trust this employer?
- What are the requirements?
- Am I a possible fit?
- What is my application status?
- What is my next action?

Employer first-read must answer:

- Who applied?
- Who may be a good fit?
- Who needs review?
- Who is shortlisted?
- Is discussion needed?
- Who is selected / offered?
- Who accepted?
- Who actually joined?

## 1.27. Empty-State Rules

### 1.27.1. Employer empty state

```txt
No Career Jobs posted yet.
Create a Career Job for longer-term hiring.
```

### 1.27.2. Employer no applicants empty state

```txt
No applicants yet.
Keep the job open or improve the job details so workers can understand the role better.
```

### 1.27.3. Employer shortlist empty state

```txt
No shortlisted applicants yet.
Shortlist applicants when you find workers who may fit this role.
```

### 1.27.4. Employee discovery empty state

```txt
No Career Jobs found yet.
Check again later or update your profile so employers can understand your skills better.
```

### 1.27.5. Employee applications empty state

```txt
No Career applications yet.
Apply for longer-term jobs when you find a suitable role.
```

### 1.27.6. Employee offer empty state

```txt
No offers yet.
Offers will appear here when an employer selects you and sends an offer.
```

### 1.27.7. Empty-state safety rules

- Empty states must not mention Shift Jobs, hidden HR Section, Manager Console, Workforce Ops Hub or Admin.
- Empty states must guide the user to the next safe action.
- Empty states must not claim production notification, payment, legal employment proof or backend verification.
- Empty states must remain role-safe.
- Empty states must not use ATS / CV-heavy wording.

## 1.28. Current Application Implementation Sync (Evidence: 2026-07-16)

This section documents the **current implemented application** for Career Jobs. Code is the evidence source.

### 1.28.1. Career Jobs overview

| Item                 | Status                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Domain               | Career Jobs — structured longer-form hiring                                                         |
| Implementation roots | `src/features/employee/careerJobs/**` (52 files), `src/features/employer/careerJobs/**` (112 files) |
| Router guard         | `RequireRole` + shells                                                                              |
| Persistence          | **DEMO / LOCAL STORAGE ONLY** — no Career REST API in feature code                                  |
| Employment entry     | **PARTIALLY IMPLEMENTED** — see §1.28.11                                                            |

### 1.28.2. Domain boundary (implemented)

- Career and Shift routes, storage, and UI are **strictly separated**.
- Career is the **only** launch-visible path that writes employment-related stores (`wm_career_employment_v1`, `wm_employment_lifecycle_v1`, staff/HR bridges).
- **Shift Jobs never create Employment** — not present in shift code paths.
- Work Vault review (`work-vault-review` route) is **pre-hire candidate screening** — not public access; OTP/session boundary in doc access modal.
- Planner does **not** execute hiring or employment — out of Career scope.

### 1.28.3. Current routes

Most public route constants come from `routePaths.ts`. Some nested route segments — including Employee Career workspaces — are registered through `AppRouter.tsx` internal `EC` route constants (not top-level `ROUTE_PATHS` keys).

**Employee (IMPLEMENTED)**

| Route source                                         | Path                                      | Page                                 |
| ---------------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| `employeeCareerHome`                                 | `/employee/career`                        | `EmployeeCareerHomePage`             |
| `employeeCareerSearch`                               | `/employee/career/search`                 | `EmployeeCareerSearchPage`           |
| `employeeCareerPostDetails`                          | `/employee/career/post/:postId`           | `EmployeeCareerPostDetailsPage`      |
| `employeeCareerApplications`                         | `/employee/career/applications`           | `EmployeeCareerApplicationsPage`     |
| `EC.careerWorkspaces` (nested; no `ROUTE_PATHS` key) | `/employee/career/workspaces`             | `EmployeeCareerWorkspacesPage`       |
| `employeeCareerWorkspace`                            | `/employee/career/workspace/:workspaceId` | `EmployeeCareerWorkspacePage`        |
| `employeeCareerCompletedRecords`                     | `/employee/career/completed-records`      | `EmployeeCareerCompletedRecordsPage` |

All Employee Career routes: `RequireRole role="employee"` + `EmployeeShell`.

**Employer (IMPLEMENTED)**

| Constant                                 | Path                                                               | Page                                         |
| ---------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| `employerCareerHome`                     | `/employer/career`                                                 | `EmployerCareerHomePage`                     |
| `employerCareerCreate`                   | `/employer/career/create`                                          | `EmployerCareerCreatePage`                   |
| `employerCareerPosts`                    | `/employer/career/posts`                                           | `EmployerCareerPostsPage`                    |
| `employerCareerPostDashboard`            | `/employer/career/post/:postId`                                    | `EmployerCareerPostDashboardPage`            |
| `employerCareerCandidateDetail`          | `/employer/career/post/:postId/candidate/:appId`                   | `EmployerCareerCandidateDetailPage`          |
| `employerCareerCandidateWorkVaultReview` | `/employer/career/post/:postId/candidate/:appId/work-vault-review` | `EmployerCareerCandidateWorkVaultReviewPage` |
| `employerCareerCompletedRecords`         | `/employer/career/completed-records`                               | `EmployerCareerCompletedRecordsPage`         |

### 1.28.4. Employee Career flow (IMPLEMENTED)

1. **Home** — hub, availability banner, completed records section.
2. **Search** (`EmployeeCareerSearchPage`) — tabs **Search / Recent / Saved / Applied**; filters; save job; recently viewed (`wm_employee_career_recent_jobs_v1`, `wm_employee_career_saved_jobs_v1`).
3. **Post detail** — view post, apply (`applyToCareerJob`) with cover note, salary expectation, notice period, screening answers.
4. **Applications** — tabs `active` / `interview` / `offers` / `closed` / `all`; accept/decline offer; interview RSVP; withdraw.
5. **Workspace** (post-`hired`) — onboarding updates, employment section, resign flow.
6. **Completed records** — employment history display.

### 1.28.5. Employer Career flow (IMPLEMENTED)

1. **Home** — KPIs, recent posts, draft reminder.
2. **Create** — multi-step wizard; draft `wm_employer_career_create_draft_v1`; publish.
3. **Posts list** — pause/resume/close; open dashboard.
4. **Post dashboard** — pipeline tabs: `applied`, `backup`, `shortlisted`, `interview`, `offered`, `hired`, `rejected`.
5. **Candidate actions** — shortlist, reject, schedule interview, record round result, send offer, **Mark as Hired**, employment actions (mark joined, confirm resignation, terminate).
6. **Work Vault review** — candidate profile + OTP doc access (pre-hire).
7. **Completed records** — employer-side completed career records.

### 1.28.6. Implemented status tables (exact code strings)

**Career post status** (`careerTypes.ts`) — **IMPLEMENTED**

| Status   |
| -------- |
| `draft`  |
| `active` |
| `paused` |
| `closed` |
| `filled` |

**Career application stage** — **IMPLEMENTED**

| Stage         | UI label (examples) |
| ------------- | ------------------- |
| `applied`     | Applied             |
| `shortlisted` | Shortlisted         |
| `interview`   | In Interview        |
| `offered`     | Offer Received      |
| `hired`       | Confirmed           |
| `rejected`    | Not Selected        |
| `withdrawn`   | Withdrawn           |

**Valid transitions** (`careerValidation.ts` `VALID_STAGE_TRANSITIONS`) — **IMPLEMENTED:**

- `applied` → `shortlisted`, `rejected`, `withdrawn`
- `shortlisted` → `interview`, `rejected`, `withdrawn`
- `interview` → `offered`, `rejected`, `withdrawn`
- `offered` → `hired`, `rejected`, `withdrawn`
- `hired` → terminal

**Interview round result** — **IMPLEMENTED:** `scheduled`, `pending`, `passed`, `failed`, `skipped`, `cancelled`

**Interview RSVP** — **IMPLEMENTED:** `pending`, `accepted`, `declined`

**Career workspace status** — **IMPLEMENTED:** `active`, `onboarding`, `completed`, `terminated`

**Shared employment status** (`employmentTypes.ts`) — **IMPLEMENTED:** `selected`, `working`, `notice`, `resigned`, `completed`

**Legacy lifecycle bridge** — **IMPLEMENTED:** `joining_pending`, `active`, `probation`, `resignation_pending`, `notice_period`, `exited` (via `employmentLifecycle.storage.ts` + sync services)

### 1.28.7. Search / Recent / Saved / Applied behaviour

| Tab / feature             | Status      | Storage                                    |
| ------------------------- | ----------- | ------------------------------------------ |
| Search + filters          | IMPLEMENTED | `wm_employee_career_posts_search_v1`       |
| Recent jobs               | IMPLEMENTED | `wm_employee_career_recent_jobs_v1`        |
| Saved jobs                | IMPLEMENTED | `wm_employee_career_saved_jobs_v1`         |
| Applied tab (search page) | IMPLEMENTED | reads `wm_employee_career_applications_v1` |
| Applications page tabs    | IMPLEMENTED | `careerApplicationTypes.ts` tab enums      |

### 1.28.8. Candidate pipeline, screening, interview (IMPLEMENTED)

| Step                         | Status                | Evidence                                     |
| ---------------------------- | --------------------- | -------------------------------------------- |
| Shortlist / reject           | IMPLEMENTED           | `careerCandidateActionService.ts`            |
| Schedule interview           | IMPLEMENTED           | `careerInterviewService.ts`                  |
| Record round result          | IMPLEMENTED           | `recordInterviewResult`                      |
| Screening questions on apply | IMPLEMENTED           | post questions + answers on application      |
| Send offer                   | IMPLEMENTED           | `sendOffer` → `stage: offered`               |
| Work Vault review            | IMPLEMENTED           | `EmployerCareerCandidateWorkVaultReviewPage` |
| Compare candidates           | PARTIALLY IMPLEMENTED | dashboard compare UI                         |

### 1.28.9. Offer lifecycle (IMPLEMENTED — demo)

**Status distinction (do not merge):**

| Status      | Actor    | Meaning                                                             |
| ----------- | -------- | ------------------------------------------------------------------- |
| `withdrawn` | Employee | Employee declines offer (`declineCareerOffer`) or withdraws earlier |
| `rejected`  | Employer | Employer rejects in pipeline (`rejectCandidate`)                    |

| Action                  | Actor                            | Result                                                                                               |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Send offer              | Employer                         | `stage: offered`, `offerDetails` embedded                                                            |
| Accept offer            | Employee                         | `stage: hired` + `activateCareerHire()` — **current Phase-0 only**                                   |
| Decline offer           | Employee                         | `stage: withdrawn` via `declineCareerOffer()` from `offered`                                         |
| Mark as Hired           | Employer                         | `stage: hired` + `activateCareerHire()` **without** employee accept check — **current Phase-0 only** |
| Withdraw offer          | NOT IMPLEMENTED as separate flow | —                                                                                                    |
| Offer expiry automation | PLANNED                          | doc §1.15.5 target                                                                                   |

### 1.28.10. Storage and data source

| Key                                  | Purpose               | Label                     |
| ------------------------------------ | --------------------- | ------------------------- |
| `wm_employer_career_posts_v1`        | Job posts             | DEMO / LOCAL STORAGE ONLY |
| `wm_employee_career_applications_v1` | Applications (shared) | DEMO / LOCAL STORAGE ONLY |
| `wm_employee_career_workspaces_v1`   | Post-hire workspaces  | DEMO / LOCAL STORAGE ONLY |
| `wm_employer_career_activity_log_v1` | Activity log          | DEMO / LOCAL STORAGE ONLY |
| `wm_employee_career_posts_search_v1` | Search index          | DEMO / LOCAL STORAGE ONLY |
| `wm_employee_career_saved_jobs_v1`   | Saved jobs            | DEMO / LOCAL STORAGE ONLY |
| `wm_employee_career_recent_jobs_v1`  | Recently viewed       | DEMO / LOCAL STORAGE ONLY |
| `wm_employer_career_create_draft_v1` | Create wizard draft   | DEMO / LOCAL STORAGE ONLY |
| `wm_career_employment_v1`            | Shared employment     | DEMO / LOCAL STORAGE ONLY |
| `wm_employment_lifecycle_v1`         | Legacy lifecycle      | DEMO / LOCAL STORAGE ONLY |
| `wm_employer_staff_v1`               | My Staff              | DEMO / LOCAL STORAGE ONLY |
| `wm_hr_management_v1`                | HR records            | DEMO / LOCAL STORAGE ONLY |
| `wm_vault_career_history_v1`         | Vault career history  | DEMO / LOCAL STORAGE ONLY |

Session keys (analysis UI): `jm_employer_career_analysis_state_{postId}`, `jm_employer_career_analysis_lock_{postId}`, `jm_employer_career_backup_suggestions_{postId}`

**Source-of-truth rule:** Frontend storage is demo/local sync. Backend/database must be production source of truth.

### 1.28.11. Employment creation boundary — CRITICAL

**Architecture target:** Employment records created only after Employer offer → Employee accepts → Employer confirms hire.

**Phase-0 implemented behaviour:**

| Trigger                | Code                                             | Employment side-effects                                                                  |
| ---------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Employee accepts offer | `acceptCareerOffer()` in `careerApplyService.ts` | Immediate `offered` → `hired` + `activateCareerHire()`                                   |
| Employer Mark as Hired | `hireCandidate()` in `careerOfferHireService.ts` | Immediate `offered` → `hired` + `activateCareerHire()` — **no employee accept required** |

`activateCareerHire()` (**IMPLEMENTED**) writes:

1. Career workspace (`onboarding`)
2. `myStaffStorage` — `joining_pending`
3. `employmentLifecycleStorage` — `joining_pending`
4. `employmentStorage` — `selected` (both `offeredAt` and `acceptedAt` set to now)
5. `hrActivateFromCareerHire` — HR `hired`

**Later step (separate from creation):** `markAsJoined()` moves `selected` → `working` — **IMPLEMENTED**; this is **not** the architecture-target “employer confirm hire before employment exists” gate.

**Verdict:** **DOMAIN RULE CONFLICT** between §1.13–1.14 target and live demo code. Backend must implement V2 event chain before production.

### 1.28.12. Backend readiness

| Area                                  | Status                                               |
| ------------------------------------- | ---------------------------------------------------- |
| Career REST API in feature code       | NOT IMPLEMENTED                                      |
| Server `CareerHireState`              | PLANNED (`02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`)     |
| Real-time sync / production messaging | NOT IMPLEMENTED                                      |
| Production OTP for vault review       | PARTIALLY IMPLEMENTED (local `vaultOtpService` demo) |
| Idempotent hire enforcement           | PARTIALLY IMPLEMENTED                                |

### 1.28.13. Security and role safety (implemented)

| Rule                            | Status                                         |
| ------------------------------- | ---------------------------------------------- |
| Employee vs Employer separation | IMPLEMENTED                                    |
| Shift vs Career separation      | IMPLEMENTED                                    |
| Work Vault review pre-hire only | IMPLEMENTED — not public                       |
| Candidate PII in comparison     | Advisory UI — no automated ranking enforcement |
| Frontend-only hire gates        | **NOT PRODUCTION SAFE** — dual hire path       |
| Backend authorization           | PLANNED                                        |

### 1.28.14. Current limitations

- Dual hire path (employer hire without employee accept).
- Four parallel employment-related stores on hire activation.
- No `offer_accepted` intermediate application stage in code.
- Offer expiry/reminder — target doc only.
- No unit tests under `careerJobs/**` folders.

### 1.28.15. Testing checklist

| Test                          | Path                                    | Status                          |
| ----------------------------- | --------------------------------------- | ------------------------------- |
| Full career circuit E2E       | `tests/e2e/career-full-circuit.spec.ts` | **Yes verified**                |
| Employment storage unit tests | `src/shared/employment/__tests__/`      | **Yes verified**                |
| Hire-race negative E2E        | —                                       | **Needs explicit verification** |
| Vault aggregator test         | `vaultCareerAggregator.test.ts`         | **Yes verified**                |

### 1.28.16. Features implemented but previously under-documented

| Feature                                  | Evidence                                                     |
| ---------------------------------------- | ------------------------------------------------------------ |
| Search page Recent/Saved/Applied tabs    | `EmployeeCareerSearchPage`                                   |
| Interview multi-round + RSVP             | `careerInterviewService.ts`, `careerInterviewRsvpService.ts` |
| Backup pipeline tab                      | `CareerPipelineTabs.tsx` `backup`                            |
| Employer Work Vault review route         | `EmployerCareerCandidateWorkVaultReviewPage`                 |
| Completed records (both roles)           | `*CompletedRecordsPage`                                      |
| Dashboard analysis session state         | sessionStorage analysis keys                                 |
| `markAsJoined` / resign / terminate sync | `careerEmploymentSideSyncService.ts`                         |

## 1.29. Final Career Jobs Lock Note

> **IMPORTANT — TARGET RULE, NOT CURRENT PHASE-0 BEHAVIOUR**
>
> Bullets below describe **approved architecture targets**. Current Phase-0 may call `activateCareerHire()` on employee offer accept or employer Mark as Hired **before** a mandatory employer confirm-hire gate — see **§1.28.11** (CRITICAL). Do not read this section as describing live hire timing.

Career Jobs is approved as the structured longer-form hiring pillar.

Final locked boundaries (target architecture):

- Career Jobs must stay separate from Shift Jobs.
- Career Jobs must stay separate from hidden HR Section.
- Career Jobs must not become ATS, CV parsing system, recruiter ERP or full HR platform.
- Career Jobs is the only launch-visible entry point into Employment Lifecycle.
- Accept does not mean Joined (**target**; Phase-0 creates employment records earlier — §1.28.11).
- Joined requires employer confirmation (**target**; `markAsJoined` is a later `selected` → `working` step, not the pre-employment gate).
- Applicant Fit Signal is advisory only.
- Application Strength guides the employee only.
- Basic Eligibility Questions must remain simple and job-relevant.
- Discussion / Interview status must remain simple and launch-safe.
- Offer expiry must not silently become rejection.
- Candidate Comparison must not expose private data or become automated ranking.
- Work Vault privacy must remain controlled by the Work Vault architecture.
- Employer Trust Visibility must remain embedded at decision points.
- Drafts must remain owner-only and not visible to employees until published.
- Preview, duplicate warning, auto-save and publish confirmation must protect employer posting flow.
- Phase 0 must remain honest, local-first and Play Store safe.

— END OF CAREER JOBS ARCHITECTURE —
