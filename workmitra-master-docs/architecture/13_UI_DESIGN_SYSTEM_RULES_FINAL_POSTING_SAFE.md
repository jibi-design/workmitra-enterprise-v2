<!-- App name: WorkMitra / Job Mitra
File name: 13_UI_DESIGN_SYSTEM_RULES.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\13_UI_DESIGN_SYSTEM_RULES.md -->

# 1. WORKMITRA / JOB MITRA — PREMIUM ENTERPRISE UI DESIGN SYSTEM RULES

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `02_SHIFT_JOBS_ARCHITECTURE.md`
- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `05_EMPLOYER_TRUST_VISIBILITY.md`
- `06_EMPLOYMENT_LIFECYCLE.md`
- `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
- `08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md`
- `09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE.md`
- `10_FULL_INSIGHTS_HIDDEN_ARCHITECTURE.md`
- `11_ADMIN_SYSTEM_ARCHITECTURE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

This document defines the premium enterprise visual design, screen architecture, mobile navigation behavior, component system, status language, empty states, readability rules and role-safe UI boundaries for WorkMitra / Job Mitra.

This document is only for UI / UX / design-system truth.

Product logic belongs in:

- domain architecture documents
- cross-domain system rules
- backend/login architecture
- core master truth

## 1.3. Core UI Principle

UI is not decoration.

UI is part of trust, clarity, safety, conversion and workflow control.

Every visual pattern must help users understand:

- who they are acting as
- which domain they are in
- what status the record has
- what can be done next
- what is private
- what is shared
- what is launch-active
- what is hidden/future-only

## 1.4. Final Design Standard

Job Mitra must feel:

- premium
- serious
- trustworthy
- modern
- calm
- mobile-first
- high-readability
- enterprise-grade
- non-confusing for low-tech users
- simple enough for non-professional workers
- strong enough for employers and future admin use

Job Mitra must not feel:

- sample/demo-like
- toy-like
- generic job board
- crowded
- noisy
- social-media-like
- government-form-heavy
- weak dark theme
- basic template UI
- unfinished future-product mockup

## 1.5. Design Direction Lock

Final visual direction:

```txt
Premium dark enterprise interface
High contrast
Clean cards
Strong typography
Deep background layers
Clear status system
Role-safe navigation
Mobile-first interaction
Low-noise premium motion
```

Rule:

Every launch-visible page must feel production-grade, not demo-grade.

---

# 2. PREMIUM BRAND AND VISUAL IDENTITY

## 2.1. Brand Feel

Job Mitra should visually communicate:

- trust
- work opportunity
- professional simplicity
- safety
- worker respect
- employer confidence
- clean modern technology

## 2.2. Theme Personality

The theme should feel:

- dark premium
- warm enough for human trust
- sharp enough for enterprise use
- not overly colorful
- not dull grey
- not neon-heavy
- not playful or cartoonish

## 2.3. Color System

### 2.3.1. Background Colors

Use deep layered dark backgrounds:

- App background: near-black navy / charcoal
- Page background: dark gradient or solid dark surface
- Card background: elevated dark slate
- Secondary card background: softer dark surface
- Divider: subtle dark border

Rules:

- never use flat pure black for all surfaces
- use layered depth
- cards must be visible without harsh borders
- background must not reduce text readability

### 2.3.2. Primary Accent Colors

Primary accent should support trust and action.

Recommended accents:

- premium blue for trust and platform actions
- emerald/green for positive status and completion
- amber for pending/warning
- red only for critical/error/destructive

Rules:

- do not overuse bright accent colors
- primary CTA should be visually strong but not noisy
- warning and danger colors must be controlled

### 2.3.3. Text Colors

Text hierarchy:

- main heading: high contrast white/off-white
- body text: readable soft white
- secondary text: muted but still readable
- disabled text: visible but clearly inactive
- warning text: amber with dark-safe contrast
- error text: red with dark-safe contrast

Rule:

No text should look faint on mobile.

### 2.3.4. Domain Color Identity Preservation

Existing domain color identity must be preserved unless a dedicated redesign decision is approved.

Each major domain should keep its own recognizable color family:

- Shift Jobs: fast/action temporary-work identity
- Career Jobs: calm/professional longer-form hiring identity
- Work Vault: privacy/trust document-control identity
- Employer Trust: trust/safety identity
- Employment Lifecycle: status/timeline identity
- Workforce Ops Hub: operations/control identity
- Manager Console: approval/control identity
- HR Section: professional records/workflow identity
- Admin System: governance/critical-control identity
- Full Insights: analytics/summary identity

Rules:

- do not randomly change existing domain colors
- refine colors into a premium dark-theme palette
- keep strong contrast and readability
- avoid cheap neon colors
- avoid using the same accent for every domain
- keep domain colors consistent across cards, badges, headings and detail pages

## 2.4. Typography Rules

Typography must be:

- clean
- readable
- modern
- not decorative
- not cramped

Recommended hierarchy:

- page title: large and strong
- section title: medium-bold
- card title: clear and readable
- body: comfortable reading size
- helper text: smaller but still readable
- status labels: short and semibold

Rules:

- avoid tiny grey labels
- avoid long all-caps text
- use line height generously
- avoid dense paragraphs in mobile UI

## 2.5. Spacing and Layout

Spacing must feel premium.

Rules:

- enough padding inside cards
- enough gap between sections
- strong vertical rhythm
- no crowded buttons
- no touching text and borders
- no overloaded first screen

Recommended layout rhythm:

- page padding: consistent
- card padding: generous
- section gap: visibly separated
- button height: easy to tap
- icon-to-text gap: readable

## 2.6. Shape, Radius and Depth

Cards should feel modern and premium.

Rules:

- use soft rounded cards
- use subtle shadows/glow only where needed
- avoid hard square panels
- avoid heavy border boxes everywhere
- avoid too many identical white/grey cards
- use group containers for separation

## 2.7. Motion and Feedback

Motion should be:

- subtle
- fast
- helpful
- not decorative-only

Allowed:

- button press feedback
- card hover/press feedback
- page transition fade/slide where smooth
- status change feedback

Blocked:

- distracting animations
- loading animations that feel childish
- excessive bounce
- motion that hides important status

---

# 3. LANDING PAGE PREMIUM DESIGN

## 3.1. Landing Page Importance

The Landing Page is the first trust checkpoint.

It must create the first impression that Job Mitra is:

- real
- premium
- safe
- professional
- simple to understand
- built for both workers and employers

Rule:

Landing Page must never look like a basic sample page.

## 3.2. Landing Page Purpose

Landing Page must:

- show the brand clearly
- explain the app in one short idea
- let user choose Employer or Employee safely
- prevent role confusion
- protect hidden-domain boundaries
- feel premium before login/backend is added

## 3.3. Landing Page Structure

Recommended structure:

1. Premium brand header
2. Short value proposition
3. Two role selection cards
4. Trust/support highlights
5. Safe footer note

## 3.4. Landing Page Visual Style

Landing Page should use:

- deep premium background
- subtle brand glow or gradient
- strong app logo / wordmark area
- clean hero text
- two large role cards
- strong role icons or simple visual markers
- minimal clutter

## 3.5. Landing Role Cards

Only two role cards:

1. Employer
2. Employee

Employer card should feel:

- business-like
- controlled
- hiring-focused
- professional

Employee card should feel:

- friendly
- opportunity-focused
- simple
- trust-focused

## 3.6. Landing Page Copy

Employer copy:

```txt
Post jobs, review applicants and manage hiring with clear steps.
```

Employee copy:

```txt
Find work, apply safely and manage your work profile.
```

Main hero copy:

```txt
A simple work platform for jobs, trust and clear hiring.
```

## 3.7. Landing Page Must Not Show

Landing must not show:

- Admin
- Super Admin
- HR Section
- Manager Console
- Workforce Ops Hub
- Full Insights
- Payroll
- backend/server details
- policy-heavy text
- coming soon hidden modules

## 3.8. Landing Page First-Impression Rule

Landing Page must pass this test:

```txt
Would a new user believe this is a serious app within 5 seconds?
```

If not, redesign.

---

# 4. EMPLOYEE EXPERIENCE DESIGN

## 4.1. Employee Design Goal

Employee UI must be:

- simple
- readable
- supportive
- trust-first
- low-confusion
- action-clear
- not recruiter-heavy
- not corporate-heavy

## 4.2. Employee Home/Dashboard

Employee dashboard should show:

- next important action
- recent applications
- Shift Jobs entry
- Career Jobs entry
- Work Vault readiness
- Employer trust reminders where relevant

Design style:

- clear cards
- large touch targets
- short text
- strong status labels
- no cluttered analytics

## 4.3. Employee Page Tone

Tone should feel:

- respectful
- clear
- calm
- non-technical

Avoid:

- HR jargon
- ATS jargon
- payroll/legal wording
- scary warnings
- long explanations

## 4.4. Employee Bottom Navigation

Employee bottom nav should prioritize:

- Home
- Shift Jobs
- Career Jobs
- Work Vault
- More/Profile

Rules:

- active tab must be obvious
- bottom nav must not hide main CTA
- icon and label must be readable
- do not place hidden domains in bottom nav

---

# 5. EMPLOYER EXPERIENCE DESIGN

## 5.1. Employer Design Goal

Employer UI must feel:

- professional
- business-ready
- controlled
- clear
- efficient
- premium but not complicated

## 5.2. Employer Dashboard

Employer dashboard should show:

- active jobs
- pending applicants
- selected workers/candidates
- action-needed cards
- trust/profile summary
- job posting CTA

Design style:

- business command style
- clean grouped sections
- strong status badges
- clear CTA hierarchy
- no hidden Manager/Admin/HR leakage

## 5.3. Employer Page Tone

Tone should be:

- professional
- direct
- concise
- action-oriented

Avoid:

- playful text
- social-media language
- legal overclaim
- payroll wording
- hidden-domain terms

## 5.4. Employer Bottom Navigation

Employer bottom nav should prioritize:

- Home
- Shift Jobs
- Career Jobs
- Applicants/Jobs
- More/Profile

Rules:

- do not show Admin
- do not show HR Section
- do not show Manager Console
- do not show Workforce Ops Hub
- do not show Payroll

---

# 6. SHIFT JOBS DESIGN

## 6.1. Shift Jobs Visual Goal

Shift Jobs must feel:

- fast
- clear
- temporary-work focused
- status-first
- reliability-aware
- low-confusion

## 6.2. Shift Job Cards

Shift Job card should show:

- job title
- date/time or duration
- pay/rate text where allowed
- location/work area
- employer trust summary
- application/selection status
- fill-health or standby hint where relevant

## 6.3. Shift Jobs Status Badges

Recommended badges:

- Open
- Applied
- Selected
- Standby
- Confirm Required
- Confirmed
- Completed
- No Response
- Replaced
- Closed

Rules:

- no-show and no-response must look different
- standby must not look like selected
- completed must not look like Career joined
- use short labels

## 6.4. Shift Jobs CTA Rules

Primary CTAs:

- Apply
- Confirm Shift
- View Details
- Mark Completed where allowed
- Rate Employer/Worker where required

Blocked wording:

- Joined
- Resigned
- Notice
- Permanent employee
- Payroll attendance

---

# 7. CAREER JOBS DESIGN

## 7.1. Career Jobs Visual Goal

Career Jobs must feel:

- calmer than Shift Jobs
- structured
- longer-form hiring focused
- simple for non-professional candidates
- not ATS/CV-heavy

## 7.2. Career Job Cards

Career Job card should show:

- role title
- employer
- location/work area
- job type
- trust summary
- application status
- simple fit/support hint where relevant

## 7.3. Career Jobs Status Badges

Recommended badges:

- Open
- Applied
- Under Review
- Shortlisted
- Discussion
- Offer Sent
- Offer Accepted
- Joined Pending
- Working
- Completed
- Closed

Rules:

- Accept and Joined must be visually different
- Career statuses must not use Shift replacement/no-show labels
- avoid ATS-style score labels

## 7.4. Career Jobs CTA Rules

Primary CTAs:

- Apply
- Answer Questions
- View Status
- Accept Offer
- Decline Offer
- View Lifecycle

Blocked wording:

- ATS approved
- AI selected
- legal employment verified
- payroll active

---

# 8. EMPLOYMENT LIFECYCLE DESIGN

## 8.1. Lifecycle Visual Goal

Employment Lifecycle must show:

- accepted vs joined difference
- current status
- timeline
- next action
- stuck/force-complete protection
- work-history confidence

## 8.2. Lifecycle Timeline

Timeline should show:

- Offer Sent
- Offer Accepted
- Joined Pending
- Working
- Notice
- Resigned
- Completed

Rules:

- timeline must be easy to read
- current step must be visually strong
- completed/force-completed/disputed labels must be clear
- do not use payroll/legal language

## 8.3. Force Complete UI

Force Complete UI must be:

- calm
- protective
- not blaming
- clear about employer not confirming

Safe wording:

```txt
You may complete this record if the employer does not respond after the waiting period.
```

---

# 9. WORK VAULT DESIGN

## 9.1. Work Vault Visual Goal

Work Vault must feel:

- private
- secure-looking
- employee-controlled
- calm
- premium
- not scary
- not fake-secure

## 9.2. Work Vault Home

Should show:

- Work Vault readiness
- profile strength
- document folders
- active access
- expiry/revoke status
- access history shortcut

## 9.3. Document Cards

Document cards should show:

- document type
- status
- visibility
- version status where supported
- active/expired/revoked access label

## 9.4. Work Vault Privacy UI

Privacy UI must clearly separate:

- hidden
- shared
- active access
- expired access
- revoked access
- archived
- deleted local

## 9.5. Work Vault Must Not Claim

Do not claim:

- secure encrypted vault
- legal verification
- cloud recovery
- permanent document hosting
- payroll document locker

unless implemented and approved.

---

# 10. EMPLOYER TRUST VISIBILITY DESIGN

## 10.1. Trust Design Goal

Employer Trust must be:

- visible at decision points
- simple
- non-scary
- non-accusatory
- confidence-building
- low-data honest

## 10.2. Trust Summary Pattern

Small trust summary should show:

- employer WM ID
- trust level
- rating count
- low-data label where needed

## 10.3. Trust Breakdown View

Trust breakdown should show:

- rating average
- rating count
- completed work count where supported
- profile completeness
- low-data state
- short explanation

## 10.4. Trust Warning Style

Warnings must be calm.

Good:

```txt
This employer has limited history on Job Mitra. Review the job details carefully before applying.
```

Bad:

```txt
This employer may be unsafe.
```

## 10.5. Trust UI Must Not Show

Do not show:

- hidden Admin risk notes
- fraud accusation
- public shaming
- legal verification claim
- internal risk score

---

# 11. INSIGHTS DESIGN

## 11.1. Launch Insights Summary

Launch Insights must be summary-only.

It may show:

- profile completion
- pending actions
- application status summary
- Work Vault readiness hint
- rating required
- simple next action

## 11.2. Full Insights Hidden Design

Full Insights future UI should feel:

- analytical
- calm
- role-safe
- filtered
- confidence-labelled

Rules:

- do not show full analytics in launch
- do not show hidden Admin/HR/Manager/Workforce metrics
- do not show surveillance-style metrics
- do not show payroll reports

---

# 12. HIDDEN FUTURE SECTIONS DESIGN

## 12.1. Hidden Sections

Hidden sections:

- HR Section
- Manager Console
- Workforce Ops Hub
- Full Insights
- Admin System
- Future Payroll

## 12.2. Hidden UI Rule

Hidden sections may have design architecture, but must not appear in launch UI.

They must not appear as:

- dashboard cards
- bottom nav items
- public role options
- teaser banners
- broken pages
- “coming soon” modules

## 12.3. HR Section Future Design

HR Section future design should feel:

- professional
- records-focused
- workflow-based
- permission-aware
- payroll-boundary clear

## 12.4. Manager Console Future Design

Manager Console future design should feel:

- command-center style
- queue-based
- approval-focused
- audit-aware
- premium operational

## 12.5. Workforce Ops Future Design

Workforce Ops future design should feel:

- live operations style
- assignment-focused
- exception-focused
- field-use friendly
- privacy-safe

## 12.6. Admin System Future Design

Admin future design should feel:

- premium command center
- evidence-first
- severity-prioritized
- audit-visible
- permission-scoped
- high-risk action protected

---

# 13. MOBILE NAVIGATION AND BACK BEHAVIOR SYSTEM

## 13.1. Core Mobile Navigation Principle

Most mobile users will use the phone back button or back gesture more than the app top back button.

Therefore, Job Mitra must support:

- Android phone back button
- Android back gesture / swipe-back
- predictable app back routing
- safe modal closing
- safe unsaved form warnings
- wrong-role prevention
- hidden-page prevention

## 13.2. Top Back Button Rule

Top back button is useful but secondary.

It should:

- appear on deep/detail pages
- use clear placement
- use readable icon/label
- return to the correct previous screen
- not be the only working back method

Rule:

Phone/system back must behave safely even if user never taps the top back button.

## 13.3. Phone Back Button Rule

When phone back is used:

- close modal/bottom sheet first
- close drawer/filter panel before leaving page
- warn before losing unsaved form data
- return to the previous safe same-role route
- avoid jumping between Employer and Employee flows
- avoid opening hidden/future routes
- avoid exiting the app unexpectedly from deep pages

## 13.4. Back Gesture Rule

Back gesture must follow the same rules as phone back.

It must not:

- discard unsaved forms silently
- skip confirmation screens incorrectly
- send user to wrong role dashboard
- open hidden domains
- break workflow state

## 13.5. Unsaved Form Back Rule

Unsaved warning required for:

- create Shift Job
- edit Shift Job
- create Career Job
- edit Career Job
- profile edit
- Work Vault sharing
- document metadata edit
- application form
- eligibility questions
- resignation / lifecycle action
- Admin/hidden future sensitive forms

Safe wording:

```txt
You have unsaved changes. Do you want to leave this page?
```

Buttons:

- Stay
- Leave

## 13.6. Modal and Bottom Sheet Back Rule

Phone back should close:

1. modal
2. bottom sheet
3. drawer
4. filter panel
5. keyboard where appropriate

before leaving the page.

Rule:

Back should not exit app while a modal is open.

## 13.7. Bottom Navigation Back Rule

Bottom navigation behavior must be predictable.

Rules:

- switching tabs should preserve main tab route
- phone back from a detail page should return to the correct list/tab
- phone back from a main tab should follow safe app-level back behavior
- hidden tabs must not exist
- role-specific tabs must not mix

## 13.8. App Exit Protection

From root/home/landing:

- accidental exit should be avoided where platform pattern supports it
- user should not lose data
- do not show aggressive exit prompts everywhere

Safe option:

```txt
Press back again to exit.
```

Use only where appropriate.

## 13.9. Back Stack Safety Rule

Back stack must not contain:

- wrong role screens
- hidden Admin/HR/Manager/Workforce routes
- old sensitive forms after logout
- Work Vault shared document screens after revoke
- employer private screens after role switch

## 13.10. Backend/Login Future Back Rule

After backend/login:

- logged-out users must not return to private pages using back
- role switch must clear unsafe history
- account deletion/logout must clear private navigation stack
- expired session must redirect safely

---

# 14. GLOBAL COMPONENT SYSTEM

## 14.1. Card Rules

Cards must be:

- readable
- well-spaced
- touch-friendly
- status-aware
- role-safe

Card types:

- job card
- applicant card
- employee card
- employer trust card
- Work Vault document card
- lifecycle status card
- admin case card future-hidden
- insight summary card

## 14.2. Button Rules

Button hierarchy:

1. Primary CTA
2. Secondary CTA
3. Tertiary/text action
4. Destructive action

Rules:

- one dominant primary action per section
- destructive actions must be visually separate
- disabled buttons must explain why
- button text must be short and clear

## 14.3. Badge Rules

Badges must be:

- short
- consistent
- readable
- color-coded carefully
- role/domain correct

Badge types:

- status badge
- trust badge
- privacy badge
- warning badge
- hidden future badge only in internal/future screens

## 14.4. Form Rules

Forms must be:

- short where possible
- grouped into sections
- mobile-friendly
- validation-clear
- unsaved-back protected

Rules:

- show required fields clearly
- use readable error messages
- do not show long form blocks without grouping
- avoid unnecessary fields for non-professional users

## 14.5. Employer Long Form Draft and Publish UI Rules

Employer job creation forms must protect the user from losing work.

This applies to:

- Create Shift Job
- Edit Shift Job
- Create Career Job
- Edit Career Job

### 14.5.1. Save Draft Button

Long employer forms should show a clear Save Draft action.

Rules:

- Save Draft must not publish
- Save Draft must be visually secondary to Publish
- Save Draft should be reachable before the final step
- saved draft status must be visible

Safe wording:

```txt
Save Draft
```

### 14.5.2. Auto-save Feedback

Where local auto-save exists, show calm feedback.

Safe wording:

```txt
Draft saved on this device.
```

Rules:

- do not claim cloud save before backend exists
- do not show noisy saving messages repeatedly
- auto-save must not replace deliberate Save Draft / Publish actions

### 14.5.3. Resume Draft UI

Employer dashboard should show unfinished drafts in a premium, non-noisy card.

Safe wording:

```txt
You have unfinished drafts.
Continue editing when you are ready.
```

Actions:

- Continue
- Delete Draft

### 14.5.4. Preview Before Publish UI

Preview screen must show the employee-facing version.

Rules:

- label preview clearly
- show only public-safe content
- hide employer private notes
- hide admin/hidden domain content
- show Review Again and Publish actions

Safe wording:

```txt
Preview how workers will see this job.
```

### 14.5.5. Duplicate Warning UI

Duplicate warning must be calm and advisory.

Safe wording:

```txt
A similar job may already exist. Review before publishing again.
```

Actions:

- Review Existing
- Continue Anyway

Rules:

- do not scare the employer
- do not block valid repeated jobs unfairly
- do not auto-delete or auto-merge

### 14.5.6. Publish Confirmation UI

Publish confirmation must clearly explain visibility.

Safe wording:

```txt
This job will be visible to employees. Continue?
```

Actions:

- Review Again
- Publish

Rules:

- Publish must be the final deliberate public action
- destructive/irreversible-looking styling must be avoided
- use strong but calm primary CTA

## 14.6. Empty State Rules

Empty states must:

- be helpful
- be short
- show next safe action
- not expose hidden features
- not overclaim backend/secure/legal capability

## 14.7. Loading State Rules

Loading states must:

- be calm
- avoid fake complexity
- not block too long
- not hide errors
- not pretend backend loading in local Phase 0

## 14.8. Error State Rules

Error states must:

- explain what happened
- avoid blaming user
- offer retry or safe back
- not expose technical/security internals

---

# 15. STATUS AND MICROCOPY SYSTEM

## 15.1. Status Language Rule

Status text must be clear and domain-safe.

Do not reuse status labels across domains if meaning differs.

## 15.2. Shift Status Language

Use:

- Applied
- Selected
- Standby
- Confirm Required
- Confirmed
- Completed
- No Response
- Replaced

Do not use:

- Joined
- Resigned
- Notice

## 15.3. Career Status Language

Use:

- Applied
- Under Review
- Shortlisted
- Discussion
- Offer Sent
- Offer Accepted
- Joined Pending
- Working
- Completed

Do not use:

- No-show replacement
- Standby worker
- Shift closed

## 15.4. Work Vault Status Language

Use:

- Private
- Shared
- Active Access
- Expiring Soon
- Expired
- Revoked
- Archived

Do not use:

- Employer owns
- Legally verified
- Secure encrypted unless implemented

## 15.5. Trust Status Language

Use:

- New Employer
- Limited History
- Trust Level
- Rating Count
- Review Carefully

Do not use:

- Fraud risk
- Verified safe
- Guaranteed trusted

---

# 16. ACCESSIBILITY AND READABILITY

## 16.1. Mobile Readability Rule

All screens must be readable on real mobile devices.

Rules:

- avoid tiny text
- avoid low contrast grey
- avoid dense paragraphs
- avoid small tap targets
- avoid icons without labels for critical actions

## 16.2. Contrast Rule

Text and important UI must have strong contrast.

Dark theme must not become dim theme.

## 16.3. Touch Target Rule

Buttons, tabs and important clickable cards must be easy to tap.

Rules:

- avoid small icon-only actions
- keep enough spacing between actions
- destructive action must not be placed too close to primary action

## 16.4. Focus and Keyboard Rule

Future web/app accessibility should support:

- visible focus state
- keyboard navigation where applicable
- screen-reader-friendly labels where applicable
- form error association

---

# 17. PHASE-0 DESIGN SAFETY

## 17.1. Phase-0 Allowed UI

Allowed:

- local/demo cards
- local status states
- local summaries
- local reminders
- local trust labels
- local document metadata
- hidden future architecture notes

## 17.2. Phase-0 Blocked UI Claims

Blocked:

- real OTP sent
- real payment
- real payroll
- real secure encrypted vault
- real backend sync
- real legal verification
- real live GPS tracking
- real push/SMS/email notification
- real Admin enforcement

## 17.3. Demo-Safe Wording

Use:

```txt
Saved on this device.
Local demo data.
This feature is prepared for future secure backend support.
```

Avoid:

```txt
Verified by server.
Payment processed.
Officially approved.
Secure cloud vault active.
```

---

# 18. FINAL UI DESIGN LOCK NOTE

UI Design System is approved as the premium enterprise visual design master document.

Final locked boundaries:

- Job Mitra must not look like a demo/sample app.
- Landing Page must create a premium first impression.
- Employer and Employee UI must remain visually and functionally separate.
- Shift Jobs and Career Jobs must have different visual/status language.
- Work Vault must feel private and employee-controlled.
- Employer Trust must appear before important commitment actions.
- Employment Lifecycle must visually protect Accept vs Joined.
- Hidden sections must not leak into launch UI.
- Mobile phone back button and back gesture must be supported safely.
- Unsaved forms must protect user data.
- Employer job forms must support Save Draft, resume draft, preview, duplicate warning and publish confirmation.
- Phase 0 must not overclaim backend, payment, payroll, legal, GPS, OTP or secure vault capability.
- All launch screens must be readable, touch-friendly and premium.

— END OF UI DESIGN SYSTEM RULES —
