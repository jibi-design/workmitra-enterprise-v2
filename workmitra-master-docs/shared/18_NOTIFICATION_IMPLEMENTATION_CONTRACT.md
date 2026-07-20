<!-- App name: WorkMitra / Job Mitra
File name: 18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md -->

# 1. WORKMITRA / JOB MITRA — NOTIFICATION IMPLEMENTATION CONTRACT

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `00_DOCUMENT_INDEX_AND_SPLIT_MAP.md`
- `02_SHIFT_JOBS_ARCHITECTURE.md`
- `03_CAREER_JOBS_ARCHITECTURE.md`
- `04_WORK_VAULT_ARCHITECTURE.md`
- `05_EMPLOYER_TRUST_VISIBILITY.md`
- `06_EMPLOYMENT_LIFECYCLE.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- `16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md`
- `17_END_TO_END_WORKFLOW_CHECKLIST.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

This document defines the notification contract for Job Mitra.

It tells developers:

- which notification can exist
- who receives it
- when it is created
- which route it opens
- whether it is local/demo-safe or backend-required
- which notifications must stay hidden/future-only

This document is an implementation safety document.

It does not replace domain architecture documents.

## 1.3. Core Principle

Every notification must be:

- role-safe
- domain-safe
- action-linked
- privacy-safe
- route-safe
- hidden-domain safe
- Phase-0 honest
- Play Store safe

A notification must never expose private data, hidden domains, wrong-role screens, Admin internals, HR internals, Manager internals, Workforce Ops internals or backend-only claims before implementation.

## 1.4. Notification Status Labels

Use only these implementation labels:

- local_demo_safe
- backend_required
- hidden_future_only
- blocked_until_policy_review

## 1.5. Notification Delivery Labels

Use only these delivery labels:

- in_app_local
- in_app_backend
- push_future
- email_future
- sms_future

Phase-0 must use only:

```txt
in_app_local
```

Do not claim push, SMS or email until real infrastructure exists.

---

# 2. GLOBAL NOTIFICATION DATA CONTRACT

## 2.1. Notification Record Fields

Every notification should have:

- notification_id
- target_role
- target_user_or_local_profile_id
- source_domain
- source_record_id
- notification_type
- title
- message
- action_route
- read_status
- delivery_mode
- implementation_status
- created_at
- read_at_optional

## 2.2. Required Source Domain Values

Allowed launch/foundation source domains:

- shift_jobs
- career_jobs
- employment_lifecycle
- work_vault
- employer_trust
- account_backend_future
- local_system

Hidden/future-only source domains:

- hr_section
- manager_console
- workforce_ops_hub
- full_insights
- admin_system
- payroll_future

Hidden/future-only source domains must not create launch-visible notifications.

## 2.3. Required Target Role Values

Allowed launch target roles:

- employer
- employee

Hidden/future target roles:

- admin
- super_admin
- hr_user
- manager
- workforce_ops_user

Hidden/future roles must not appear in launch notification UI.

## 2.4. Read State

Allowed read states:

- unread
- read
- archived

Rules:

- read/unread must be local-working in Phase-0 if shown
- archived must not delete the underlying workflow record
- notification delete/archive must not change job/application/lifecycle truth unless explicitly allowed elsewhere

## 2.5. Action Route Rule

Every notification with an action must open a safe route.

Route must match:

- target role
- source domain
- source record
- current workflow state
- launch visibility

If route is no longer valid, notification must open a safe fallback page.

Safe fallback examples:

- Employer Home
- Employee Home
- relevant job list
- relevant application list
- Work Vault Home

## 2.6. Notification Text Rule

Notification text must be short, safe and non-sensitive.

Must not include:

- private document names unless safe and owner-facing
- hidden Admin risk notes
- other applicant names
- other worker names
- employer private notes
- sensitive identity data
- legal/payroll/security claims
- real push/SMS/email claim in local mode

---

# 3. SHIFT JOBS NOTIFICATION CONTRACT

## 3.1. Shift Draft Saved

Target role:

- employer

Trigger:

- employer saves Shift Job draft manually
- local auto-save may update draft status silently without noisy repeated notification

Delivery:

- in_app_local

Implementation status:

- local_demo_safe

Action route:

```txt
/employer/shift-jobs/drafts/:shiftJobId
```

Safe title:

```txt
Shift draft saved
```

Safe message:

```txt
Your shift draft is saved and not visible to workers yet.
```

Rules:

- must not notify employees
- must not publish the job
- must not claim backend/cloud sync in Phase-0

## 3.2. Shift Draft Reminder

Target role:

- employer

Trigger:

- employer has unfinished Shift Job draft

Delivery:

- in_app_local

Implementation status:

- local_demo_safe

Action route:

```txt
/employer/shift-jobs/drafts
```

Safe title:

```txt
Unfinished shift draft
```

Safe message:

```txt
You have an unfinished Shift Job draft.
```

Rules:

- reminder must be owner-only
- draft details must not appear to employees

## 3.3. Shift Published

Target role:

- employer

Trigger:

- employer confirms publish

Delivery:

- in_app_local now
- in_app_backend future

Implementation status:

- local_demo_safe now
- backend_required for real employee visibility across accounts

Action route:

```txt
/employer/shift-jobs/:shiftJobId
```

Safe title:

```txt
Shift published
```

Safe message:

```txt
Your shift is now visible in the app.
```

Rules:

- in local mode, visibility means local/demo visibility only
- must not claim push/email/SMS

## 3.4. New Shift Available

Target role:

- employee

Trigger:

- new published Shift Job matches employee discovery scope

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employee/shift-jobs/:shiftJobId
```

Safe title:

```txt
New shift available
```

Safe message:

```txt
A new Shift Job may match your work preferences.
```

Rules:

- do not send in Phase-0 unless local/demo feed clearly supports it
- must not expose hidden employer data

## 3.5. Shift Application Received

Target role:

- employer

Trigger:

- employee applies / expresses interest

Delivery:

- in_app_local where local demo has both roles
- in_app_backend future

Implementation status:

- local_demo_safe for same-device demo
- backend_required for real cross-account use

Action route:

```txt
/employer/shift-jobs/:shiftJobId/applicants
```

Safe title:

```txt
New shift application
```

Safe message:

```txt
A worker has applied for your Shift Job.
```

Rules:

- do not expose employee private Work Vault data
- other workers must not receive this

## 3.6. Shift Worker Selected

Target role:

- employee

Trigger:

- employer selects worker

Delivery:

- in_app_local where same-device demo supports it
- in_app_backend future

Implementation status:

- backend_required for real users

Action route:

```txt
/employee/shift-jobs/:shiftJobId/confirmation
```

Safe title:

```txt
You were selected
```

Safe message:

```txt
You were selected for a Shift Job. Review and respond.
```

Rules:

- must not show other selected workers
- must not say joined or employed

## 3.7. Shift Standby Status

Target role:

- employee

Trigger:

- employer places worker on standby

Delivery:

- in_app_local where supported
- in_app_backend future

Implementation status:

- backend_required for real users

Action route:

```txt
/employee/shift-jobs/:shiftJobId
```

Safe title:

```txt
Standby status
```

Safe message:

```txt
You are on standby for this Shift Job.
```

Rules:

- standby must not look like selected/confirmed
- must not overpromise work

## 3.8. Shift Confirmation Needed

Target role:

- employee

Trigger:

- selected worker must confirm before shift

Delivery:

- in_app_local where supported
- in_app_backend future
- push_future only after infrastructure and permission

Implementation status:

- local_demo_safe for local reminder
- backend_required for real cross-device reminder

Action route:

```txt
/employee/shift-jobs/:shiftJobId/confirmation
```

Safe title:

```txt
Confirm your shift
```

Safe message:

```txt
Please confirm whether you can attend this Shift Job.
```

Rules:

- no SMS/push claim in Phase-0
- must not mark no-show only from notification failure

## 3.9. Shift Completed / Rating Needed

Target roles:

- employer
- employee

Trigger:

- shift reaches completed_pending_rating

Delivery:

- in_app_local
- in_app_backend future

Implementation status:

- local_demo_safe where local completion exists
- backend_required for real cross-account rating

Action route:

```txt
/ratings/:sourceRecordId
```

Safe title:

```txt
Rating needed
```

Safe message:

```txt
Please complete the rating for this completed Shift Job.
```

Rules:

- rating must be tied to valid completed shift
- cancelled/disputed/no-show workflows must follow trust rules

---

# 4. CAREER JOBS NOTIFICATION CONTRACT

## 4.1. Career Draft Saved

Target role:

- employer

Trigger:

- employer saves Career Job draft

Delivery:

- in_app_local

Implementation status:

- local_demo_safe

Action route:

```txt
/employer/career-jobs/drafts/:careerJobId
```

Safe title:

```txt
Career Job draft saved
```

Safe message:

```txt
Your Career Job draft is saved and not visible to applicants yet.
```

Rules:

- must not notify employees
- must not publish job

## 4.2. Career Draft Reminder

Target role:

- employer

Trigger:

- employer has unfinished Career Job draft

Delivery:

- in_app_local

Implementation status:

- local_demo_safe

Action route:

```txt
/employer/career-jobs/drafts
```

Safe title:

```txt
Unfinished Career Job draft
```

Safe message:

```txt
You have an unfinished Career Job draft.
```

Rules:

- owner-only
- not public

## 4.3. Career Job Published

Target role:

- employer

Trigger:

- employer confirms publish

Delivery:

- in_app_local now
- in_app_backend future

Implementation status:

- local_demo_safe now
- backend_required for real public visibility across accounts

Action route:

```txt
/employer/career-jobs/:careerJobId
```

Safe title:

```txt
Career Job published
```

Safe message:

```txt
Your Career Job is now visible in the app.
```

Rules:

- local mode must not claim backend sync

## 4.4. New Career Job Available

Target role:

- employee

Trigger:

- new published Career Job matches discovery scope

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employee/career-jobs/:careerJobId
```

Safe title:

```txt
New Career Job available
```

Safe message:

```txt
A new Career Job may match your profile.
```

Rules:

- no push/email claim before infrastructure
- must not rank user unfairly

## 4.5. Career Application Received

Target role:

- employer

Trigger:

- employee applies to Career Job

Delivery:

- in_app_local where same-device demo supports it
- in_app_backend future

Implementation status:

- local_demo_safe for same-device demo
- backend_required for real users

Action route:

```txt
/employer/career-jobs/:careerJobId/applicants
```

Safe title:

```txt
New Career application
```

Safe message:

```txt
An applicant has applied for your Career Job.
```

Rules:

- must not expose private documents
- must not expose other applicants to employee

## 4.6. Application Shortlisted

Target role:

- employee

Trigger:

- employer shortlists application

Delivery:

- in_app_local where supported
- in_app_backend future

Implementation status:

- backend_required for real users

Action route:

```txt
/employee/career-applications/:applicationId
```

Safe title:

```txt
Application update
```

Safe message:

```txt
Your application status has been updated.
```

Rules:

- do not overpromise job offer
- do not say selected unless actual selected state exists

## 4.7. Discussion Requested

Target role:

- employee

Trigger:

- employer requests discussion/interview

Delivery:

- in_app_local where supported
- in_app_backend future

Implementation status:

- backend_required for real users

Action route:

```txt
/employee/career-applications/:applicationId
```

Safe title:

```txt
Discussion requested
```

Safe message:

```txt
The employer requested a discussion for your application.
```

Rules:

- must remain simple discussion flow
- do not claim calendar invite unless implemented

## 4.8. Offer Sent

Target role:

- employee

Trigger:

- employer sends offer state

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employee/career-applications/:applicationId/offer
```

Safe title:

```txt
Offer received
```

Safe message:

```txt
You have received an offer. Review and respond.
```

Rules:

- accept must not mean joined
- no legal employment proof claim

## 4.9. Offer Response Received

Target role:

- employer

Trigger:

- employee accepts or declines offer

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employer/career-jobs/:careerJobId/applicants/:applicationId
```

Safe title:

```txt
Offer response received
```

Safe message:

```txt
The applicant has responded to your offer.
```

Rules:

- accepted offer still needs joined confirmation where required

## 4.10. Joined Confirmation Needed

Target role:

- employer

Trigger:

- employee accepted offer and job requires joined confirmation

Delivery:

- in_app_local where supported
- in_app_backend future

Implementation status:

- backend_required for real users

Action route:

```txt
/employer/employment-lifecycle/:lifecycleId
```

Safe title:

```txt
Joined confirmation needed
```

Safe message:

```txt
Confirm joined only after the employee has actually started.
```

Rules:

- must protect Accept vs Joined
- employee cannot self-confirm joined

---

# 5. EMPLOYMENT LIFECYCLE NOTIFICATION CONTRACT

## 5.1. Lifecycle Started

Target role:

- employee

Trigger:

- employer confirms joined after valid Career flow

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employee/employment-lifecycle/:lifecycleId
```

Safe title:

```txt
Employment status updated
```

Safe message:

```txt
Your work status has been updated.
```

Rules:

- must not claim legal employment proof
- must not appear for Shift Jobs

## 5.2. Resignation Submitted

Target role:

- employer

Trigger:

- employee submits resignation where allowed

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employer/employment-lifecycle/:lifecycleId
```

Safe title:

```txt
Resignation update
```

Safe message:

```txt
An employee has submitted a resignation update.
```

Rules:

- must not become payroll/legal termination record by itself

## 5.3. Force Complete Available

Target role:

- employee

Trigger:

- lifecycle is stuck beyond approved waiting/grace condition

Delivery:

- in_app_local where supported
- in_app_backend future

Implementation status:

- backend_required for real users

Action route:

```txt
/employee/employment-lifecycle/:lifecycleId
```

Safe title:

```txt
Completion option available
```

Safe message:

```txt
You may complete this record if the employer does not respond after the waiting period.
```

Rules:

- must not blame employer
- must follow lifecycle force-complete rules

## 5.4. Lifecycle Rating Needed

Target roles:

- employer
- employee

Trigger:

- lifecycle reaches valid completed/rating state

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/ratings/:sourceRecordId
```

Safe title:

```txt
Rating needed
```

Safe message:

```txt
Please complete the rating for this completed work record.
```

Rules:

- rating must be tied to valid completed workflow
- must not unlock rating early

---

# 6. WORK VAULT NOTIFICATION CONTRACT

## 6.1. Work Vault Readiness Reminder

Target role:

- employee

Trigger:

- Work Vault metadata/profile is incomplete

Delivery:

- in_app_local

Implementation status:

- local_demo_safe

Action route:

```txt
/employee/work-vault
```

Safe title:

```txt
Work Vault update
```

Safe message:

```txt
You can improve your Work Vault by adding basic work details.
```

Rules:

- must not shame user
- must not require documents unless job-specific and approved

## 6.2. Work Vault Access Requested

Target role:

- employee

Trigger:

- employer requests Work Vault access through allowed path

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employee/work-vault/access-requests/:requestId
```

Safe title:

```txt
Work Vault access request
```

Safe message:

```txt
An employer requested access to selected Work Vault information.
```

Rules:

- must show what is requested
- must not auto-grant access
- employer must not see private data before approval

## 6.3. Work Vault Access Granted

Target role:

- employer

Trigger:

- employee grants access

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employer/work-vault-access/:accessGrantId
```

Safe title:

```txt
Work Vault access granted
```

Safe message:

```txt
The employee has granted access to selected Work Vault information.
```

Rules:

- only allowed content should open
- access must be scoped and revocable

## 6.4. Work Vault Access Revoked

Target role:

- employer

Trigger:

- employee revokes access

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/employer/work-vault-access
```

Safe title:

```txt
Work Vault access updated
```

Safe message:

```txt
Access to selected Work Vault information has changed.
```

Rules:

- revoked access must block future viewing
- do not expose employee private reason unless explicitly entered and safe

## 6.5. Work Vault Access Expiring

Target roles:

- employer
- employee

Trigger:

- access grant is near expiry

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/work-vault/access/:accessGrantId
```

Safe title:

```txt
Work Vault access expiring
```

Safe message:

```txt
A Work Vault access permission is close to expiry.
```

Rules:

- must not extend access automatically
- employee remains in control

---

# 7. EMPLOYER TRUST NOTIFICATION CONTRACT

## 7.1. Rating Submitted

Target role:

- employer or employee depending on rating target

Trigger:

- valid rating submitted after completed workflow

Delivery:

- in_app_backend future

Implementation status:

- backend_required

Action route:

```txt
/trust/ratings/:ratingId
```

Safe title:

```txt
Rating received
```

Safe message:

```txt
A rating was submitted for a completed work record.
```

Rules:

- must not expose private notes publicly
- must not allow manual trust inflation

## 7.2. Low-Data Trust Reminder

Target role:

- employee

Trigger:

- employee views employer with limited platform history

Delivery:

- in_app_local as contextual card, not necessarily notification

Implementation status:

- local_demo_safe

Action route:

```txt
/employee/employers/:employerId/trust
```

Safe title:

```txt
Limited employer history
```

Safe message:

```txt
This employer has limited history on Job Mitra. Review the job details carefully before applying.
```

Rules:

- calm wording only
- no fraud accusation

---

# 8. ACCOUNT / BACKEND FUTURE NOTIFICATION CONTRACT

## 8.1. Account Security Update

Target role:

- employer
- employee

Trigger:

- password reset, login change, session change, account deletion request

Delivery:

- in_app_backend future
- email_future where implemented

Implementation status:

- backend_required

Action route:

```txt
/account/security
```

Safe title:

```txt
Account update
```

Safe message:

```txt
There was an update to your account.
```

Rules:

- do not expose tokens
- do not reveal security internals
- email only when real email infrastructure exists

## 8.2. Account Deletion Request Status

Target role:

- employer
- employee

Trigger:

- account deletion request submitted or status changed

Delivery:

- in_app_backend future
- email_future where implemented

Implementation status:

- backend_required

Action route:

```txt
/account/deletion
```

Safe title:

```txt
Account deletion update
```

Safe message:

```txt
Your account deletion request status has been updated.
```

Rules:

- must align with privacy policy
- must not delete audit records incorrectly

---

# 9. HIDDEN / FUTURE NOTIFICATION RULES

## 9.1. Hidden Domain Notifications

The following notification groups are hidden/future-only:

- HR Section notifications
- Manager Console notifications
- Workforce Ops Hub notifications
- Full Insights full analytics notifications
- Admin System notifications
- Payroll notifications

Status:

```txt
hidden_future_only
```

Rules:

- must not appear in launch notification list
- must not appear in role picker
- must not appear in dashboard cards
- must not appear as coming-soon tease
- must not create broken routes

## 9.2. Admin Notification Boundary

Admin notifications may exist only in future hidden Admin System.

Admin notifications must not be visible to:

- employer normal user
- employee normal user
- public app screens

## 9.3. Payroll Notification Boundary

Payroll notifications must not exist in current Job Mitra launch.

Future payroll notifications require separate payroll product/module architecture.

---

# 10. NOTIFICATION ROUTE SAFETY CHECKLIST

Every notification route must pass:

1. Target role matches active role.
2. Target user owns or can access the record.
3. Source domain is launch-visible or allowed.
4. Hidden domain route is not exposed.
5. Source record exists.
6. Source record state still allows action.
7. Route fallback is safe if record is missing.
8. Phone back/back gesture does not expose wrong-role page.
9. Logged-out/future expired session redirects safely.
10. Local mode does not claim backend delivery.

---

# 11. NOTIFICATION UI RULES

## 11.1. Notification List UI

Notification list must show:

- title
- short message
- source domain label where useful
- read/unread state
- time/date where available
- action link/card tap

Must not show:

- hidden Admin/HR/Manager/Workforce labels in launch
- sensitive private details
- long technical errors
- push/SMS/email claims in local mode

## 11.2. Empty State

Safe empty state:

```txt
No notifications yet.
Updates about your jobs and work activity will appear here.
```

Do not say:

```txt
No HR alerts.
No Admin cases.
No payroll messages.
```

## 11.3. Error State

Safe error state:

```txt
Notifications could not be loaded. Please try again.
```

Do not expose:

- API internals
- security rules
- hidden route names

---

# 12. PHASE-0 NOTIFICATION BOUNDARY

Phase-0 may support:

- local in-app notifications
- local read/unread
- local action route
- local reminders
- local dashboard notification count

Phase-0 must not claim:

- push notification
- SMS notification
- email notification
- backend notification sync
- real-time server delivery
- cross-device unread sync

Safe Phase-0 wording:

```txt
Saved on this device.
Local notification.
```

---

# 13. FINAL NOTIFICATION CONTRACT LOCK NOTE

This document is approved as the notification implementation contract.

Final locked decisions:

- Notifications must be role-safe and domain-safe.
- Notifications must always have a safe action route.
- Local/demo notifications must not claim backend, push, SMS or email.
- Draft notifications must be owner-only.
- Work Vault notifications must preserve employee control.
- Rating notifications must unlock only after valid workflow completion.
- Hidden HR, Manager, Workforce, Full Insights, Admin and Payroll notifications must not appear in launch UI.
- Notification implementation must follow this contract before coding notification logic.

— END OF NOTIFICATION IMPLEMENTATION CONTRACT —
