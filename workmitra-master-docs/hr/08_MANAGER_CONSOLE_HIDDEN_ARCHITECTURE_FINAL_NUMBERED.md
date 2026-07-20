future hidden employer-side manager control
work queues
approvals
exception review
manager permissions
no launch exposure<!-- App name: WorkMitra / Job Mitra
File name: 08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\08_MANAGER_CONSOLE_HIDDEN_ARCHITECTURE.md -->

# 1. WORKMITRA / JOB MITRA — MANAGER CONSOLE HIDDEN ARCHITECTURE

## 1.1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

This document also follows:

- `03_CAREER_JOBS_ARCHITECTURE.md`
- `07_HR_SECTION_HIDDEN_ARCHITECTURE.md`
- `09_WORKFORCE_OPS_HUB_HIDDEN_ARCHITECTURE.md` where future-created
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

Manager Console is the future hidden employer-side operational control architecture of Job Mitra.

It is not part of the current launch-visible app.

It exists to prepare a clean, enterprise-grade manager control foundation for future employer operations without weakening normal Employer Dashboard, Shift Jobs, Career Jobs, Employment Lifecycle mini-HR, hidden HR Section, Workforce Ops Hub or Admin System boundaries.

## 1.3. Core Principle

Manager Console = future hidden employer-side operational control surface.

It is not launch-visible.

It is not the same as Employer Dashboard.

It is not Admin.

It is not HR Section.

It is not Workforce Ops Hub.

It is not payroll or legal attendance proof.

## 1.4. What Manager Console Is

Manager Console is:

- hidden in launch UI
- future employer-side management workspace
- future operational review and coordination layer
- future manager-facing decision surface
- future work queue and approval layer
- future exception review layer
- future manager permission and audit layer
- possible bridge between employer activity and future operations

## 1.5. What Manager Console Is Not

Manager Console is not:

- launch-visible
- normal Employer Dashboard
- Admin governance console
- HR Section
- Workforce Ops Hub
- payroll
- legal attendance proof system
- employee-facing workflow
- public role-selection option
- unrestricted employer control panel

## 1.6. Hard Non-Mixing Rule

Manager Console must not appear in:

- landing page
- normal employer dashboard
- employee dashboard
- Shift Jobs launch screens
- Career Jobs launch screens
- Work Vault screens
- normal role picker
- public launch navigation

Rule:

Manager Console remains hidden until explicitly approved for a future product phase.

## 1.7. Domain Boundaries

### 1.7.1. Employer Dashboard

Employer Dashboard is the launch-visible surface for normal employer actions.

### 1.7.2. Manager Console

Manager Console is the hidden future manager workspace for deeper operational control.

### 1.7.3. Workforce Ops Hub

Workforce Ops Hub is the future operational execution / assignment architecture.

### 1.7.4. HR Section

HR Section is the future professional HR / recruiter workflow.

### 1.7.5. Admin System

Admin System is the platform owner governance / control layer.

Rule:

These areas must not be merged into one confusing control panel.

## 1.8. Role Fit

### 1.8.1. Future Manager User

Future Manager User may use Manager Console to:

- review operational workload
- monitor assigned jobs / workflows
- approve or coordinate operational steps
- view team / worker coordination state where approved
- see exception queues
- escalate to employer owner or Admin where needed
- manage assigned work items within permission scope

Future Manager User must not:

- access platform Admin powers
- access hidden HR records unless permitted
- access private Work Vault documents without allowed path
- suspend users
- rewrite audit logs
- act outside assigned scope

### 1.8.2. Employer Owner

Employer Owner may use Manager Console to:

- assign manager responsibilities
- review manager activity
- control manager permissions
- monitor operational summaries
- approve sensitive manager actions
- reassign or close manager work items where permitted

Employer Owner must not:

- use Manager Console as Admin System
- bypass privacy boundaries
- expose Manager Console to employees
- use Manager Console as payroll or legal attendance proof

### 1.8.3. Employee

Employee must not:

- access Manager Console
- see manager-private notes
- see other worker operational states
- receive manager-only alerts
- be controlled through hidden manager actions without safe workflow visibility

### 1.8.4. Admin

Admin may review misuse through hidden Admin governance.

Admin must not use Manager Console as Admin replacement.

## 1.9. Future Screen-by-Screen Architecture

### 1.9.1. Manager Console Home

Shows:

- today’s operational summary
- pending approvals
- assigned work items
- exceptions needing attention
- unresolved operational notes
- workload health summary
- overdue / blocked items where available

### 1.9.2. Work Queue

Shows:

- assigned jobs / workflows
- pending actions
- priority labels
- due / ageing labels
- status filters
- workload grouping by source domain

### 1.9.3. Job / Assignment Review Detail

Shows:

- related job / workflow
- assigned workers / applicants where allowed
- current status
- manager notes
- allowed manager actions
- audit-safe timeline

### 1.9.4. Approval Center

Shows:

- pending approvals
- requested action
- requester
- affected workflow
- approve / reject / escalate options
- reason capture for sensitive decisions

### 1.9.5. Exception Queue

Shows:

- delayed updates
- no-response items
- disputed items
- replacement-needed items
- closure-needed items
- blocked operational items

### 1.9.6. Manager Notes / Timeline

Shows:

- operational notes
- decision timeline
- status changes
- manager actions
- correction history where needed

### 1.9.7. Manager Permission Settings

Restricted to Employer Owner / authorized controller.

Shows:

- manager roles
- permission levels
- assigned scope
- active / suspended manager status
- permission audit summary

### 1.9.8. Escalation Screen

Used to escalate:

- to Employer Owner
- to Workforce Ops where future-approved
- to Admin governance where platform-risk exists

### 1.9.9. Manager Activity Audit Summary

Shows:

- actions approved
- actions rejected
- escalations created
- overdue items
- override history
- permission changes

Rule:

Audit summary is for employer owner / permitted controller only.

## 1.10. Manager Console State Model

### 1.10.1. manager_work_item_status

Allowed values:

- new
- assigned
- in_review
- waiting_for_manager
- waiting_for_employer_owner
- waiting_for_worker_response
- approved
- rejected
- escalated
- resolved
- closed
- reopened

### 1.10.2. manager_exception_status

Allowed values:

- detected
- queued
- in_review
- action_needed
- escalated
- resolved
- closed

### 1.10.3. manager_approval_status

Allowed values:

- not_required
- pending
- approved
- rejected
- escalated
- cancelled

### 1.10.4. manager_permission_level

Allowed values:

- employer_owner
- senior_manager
- manager
- viewer

### 1.10.5. manager_workload_health_status

Allowed values:

- clear
- normal
- busy
- overloaded
- blocked
- overdue_risk

## 1.11. Valid Transitions

### 1.11.1. Work Item

- new → assigned
- assigned → in_review
- in_review → approved / rejected / escalated
- approved → resolved
- resolved → closed
- closed → reopened where allowed

### 1.11.2. Exception

- detected → queued
- queued → in_review
- in_review → action_needed
- action_needed → resolved / escalated
- resolved → closed

### 1.11.3. Approval

- not_required → pending
- pending → approved / rejected / escalated
- pending → cancelled where source request is cancelled

### 1.11.4. Permission Level

- viewer → manager
- manager → senior_manager
- senior_manager → manager
- manager / senior_manager → viewer
- any active manager role → revoked / suspended where supported

Rule:

Permission changes require employer-owner authority and audit.

## 1.12. Blocked Transitions

Blocked:

- manager action → Admin enforcement without Admin case
- Manager Console → hidden HR record creation without HR approval
- Manager Console → payroll / legal attendance truth
- Manager Console → direct employee restriction
- Manager Console → Work Vault document access without allowed path
- Manager Console → launch UI exposure
- manager approval → salary/payment processing
- manager note → employee-visible truth without review
- bulk action → silent irreversible change

## 1.13. Advanced Manager Control System

This section adds the enterprise-grade future manager layer.

It is hidden for launch and may only be activated in a future approved version.

### 1.13.1. Manager Workload Dashboard

Manager Workload Dashboard helps managers and employer owners understand operational workload.

It may show:

- today’s pending items
- overdue items
- high-priority items
- blocked items
- assigned vs unassigned items
- source-domain grouping
- workload health status

Rules:

- workload dashboard must stay hidden
- it must not expose employee-private data
- it must not become Admin analytics
- it must not become payroll or legal attendance proof

### 1.13.2. Smart Exception Queue

Smart Exception Queue groups operational problems that need review.

Possible exception types:

- no_response
- delayed_closure
- dispute_open
- replacement_needed
- approval_stuck
- overdue_work_item
- permission_review_needed

Rules:

- exception queue is advisory and operational
- it must not automatically punish users
- it must not expose Admin risk logic
- it must not replace Workforce Ops execution logic
- escalation must preserve reason and timeline

### 1.13.3. Approval Workflow System

Approval Workflow System allows managers to approve, reject or escalate permitted actions.

Approval actions may include:

- approve operational step
- reject with reason
- escalate to Employer Owner
- escalate to Admin where platform-risk exists
- return for correction

Rules:

- approval must capture reason for sensitive decisions
- approval cannot bypass domain permission
- approval cannot become Admin enforcement
- approval cannot become payroll/payment approval unless future payroll system approves it separately

### 1.13.4. Manager Permission Levels

Manager Console must support permission separation.

Permission levels:

- employer_owner
- senior_manager
- manager
- viewer

Rules:

- least privilege
- assigned scope only
- sensitive actions require stronger permission
- manager cannot grant own permission
- employer owner controls access
- Admin remains separate

### 1.13.5. SLA / Due-Time Tracking

SLA / Due-Time Tracking helps managers see ageing and urgency.

It may track:

- due_at
- ageing_label
- overdue_status
- priority
- blocked_reason
- next_action_required

Rules:

- SLA is internal operational guidance
- SLA must not become legal proof
- SLA must not expose hidden data to employees
- overdue status must not automatically punish worker or employee

### 1.13.6. Bulk Action with Safety

Bulk Action with Safety allows controlled multi-item handling.

Possible future bulk actions:

- assign selected work items
- mark selected items reviewed
- close low-risk resolved items
- escalate selected exceptions

Rules:

- bulk action must require confirmation
- bulk action must respect permission scope
- bulk action must write audit events
- bulk action must not perform irreversible user-impacting actions casually
- bulk action must not process payroll, bans, or private document access

### 1.13.7. Manager Activity Audit Summary

Manager Activity Audit Summary helps employer owner review manager actions.

It may show:

- approved actions
- rejected actions
- escalated actions
- delayed actions
- reopened items
- permission changes
- override history

Rules:

- audit summary is employer-owner / permitted controller only
- audit summary must not expose employee-private data unnecessarily
- audit summary must not be editable through normal manager flow
- audit summary must not become public ranking or shaming

## 1.14. Action Catalog

### 1.14.1. Future Manager Allowed Actions

Future Manager may:

- view assigned work item
- add operational note
- approve operational step where permitted
- reject operational step with reason
- escalate to Employer Owner
- escalate to Admin where platform-risk exists
- mark exception reviewed
- close assigned work item where permitted
- update due-time status where permitted
- perform safe bulk action where permitted

### 1.14.2. Employer Owner Allowed Actions

Employer Owner may:

- assign manager permissions
- revoke manager permissions
- review manager activity
- reassign work items
- override manager decision where allowed
- approve sensitive manager actions
- review manager audit summary

### 1.14.3. Blocked Actions

Blocked:

- manager grants own permissions
- manager suspends employee / provider / platform account
- manager edits audit logs
- manager accesses hidden Admin System
- manager converts Shift Job to Career Job
- manager converts Career lifecycle into HR Section record silently
- manager accesses employee private Work Vault documents casually
- manager processes payroll / salary / payslip / tax
- manager performs legal attendance confirmation
- manager exposes hidden console actions to launch users

## 1.15. Notification / Alert Contract

### 1.15.1. Future Manager Alerts

- work_item_assigned
- approval_required
- exception_detected
- worker_response_pending
- closure_needed
- overdue_item_detected
- escalation_returned
- bulk_action_completed

### 1.15.2. Employer Owner Alerts

- manager_action_completed
- manager_escalation_received
- manager_permission_change_needed
- unresolved_manager_queue
- manager_overdue_items
- sensitive_action_approval_needed

### 1.15.3. Admin Alerts

- manager_misuse_signal
- suspicious_operational_override
- repeated_exception_pattern
- permission_abuse_signal

### 1.15.4. Notification Safety Rules

Notifications must not:

- alert employees with manager-internal notes
- expose Admin governance details
- mix with Career Jobs mini-HR alerts
- mix with Shift Jobs launch alerts unless future integration is approved
- claim payroll, payment, legal attendance or enforcement action
- reveal hidden Manager Console in launch UI

## 1.16. Evidence / Audit / Correction Model

Evidence may include:

- manager work item
- related job / workflow
- manager notes
- approval / rejection decision
- escalation reason
- timeline events
- permission state
- due-time status
- bulk action confirmation

Audit required for:

- manager permission grant / revoke
- work item assignment
- approval / rejection
- escalation
- exception closure
- operational note edit
- due-time override
- bulk action
- sensitive manager action

Correction must preserve:

- old value
- new value
- reason
- actor
- timestamp
- before / after state

Rule:

Correction must not delete original timeline.

## 1.17. Permission Matrix

### 1.17.1. Employer Owner

Employer Owner:

- can configure manager roles where future-approved
- can review manager activity
- can approve sensitive manager actions
- can access employer-owned manager audit summary

### 1.17.2. Senior Manager

Senior Manager:

- can manage assigned work queues
- can review assigned manager exceptions where permitted
- can approve higher-level operational items where permitted
- cannot grant own permission
- cannot access Admin powers

### 1.17.3. Manager

Manager:

- can act only within assigned scope
- can manage assigned work items
- can escalate exceptions
- cannot access unrelated employer records
- cannot access platform Admin powers

### 1.17.4. Viewer

Viewer:

- can view permitted work queues
- cannot approve, reject, escalate, bulk close or edit notes unless separately permitted

### 1.17.5. Employee

Employee:

- cannot access Manager Console
- sees only safe workflow outcomes where relevant
- cannot see manager notes or manager queues

### 1.17.6. Admin

Admin:

- can review misuse through hidden governance
- does not use Manager Console as moderation system
- cannot silently rewrite manager truth

## 1.18. Data Model

### 1.18.1. MANAGER_PROFILE

Fields:

- manager_profile_id
- employer_id
- user_id
- manager_role
- manager_status
- permission_scope
- permission_level
- created_at
- updated_at

### 1.18.2. MANAGER_WORK_ITEM

Fields:

- manager_work_item_id
- employer_id
- assigned_manager_id
- source_domain
- source_record_id
- work_item_type
- work_item_status
- priority
- due_at_optional
- ageing_status_optional
- blocked_reason_optional
- created_at
- updated_at

### 1.18.3. MANAGER_EXCEPTION

Fields:

- manager_exception_id
- employer_id
- related_work_item_id_optional
- source_domain
- source_record_id
- exception_type
- exception_status
- severity
- due_at_optional
- created_at
- updated_at

### 1.18.4. MANAGER_APPROVAL_REQUEST

Purpose:

Future approval workflow record for Manager Console.

Fields:

- manager_approval_request_id
- employer_id
- source_domain
- source_record_id
- requested_action
- requested_by_user_id
- assigned_approver_user_id_optional
- approval_status
- approval_reason_optional
- decided_at_optional
- created_at
- updated_at

Rule:

Approval Request must not bypass source-domain permission rules.

### 1.18.5. MANAGER_BULK_ACTION

Purpose:

Controlled record of safe bulk actions.

Fields:

- manager_bulk_action_id
- employer_id
- actor_user_id
- action_type
- affected_item_count
- confirmation_status
- result_status
- created_at
- completed_at_optional

Rule:

Bulk Action must write audit/timeline events for affected items where required.

### 1.18.6. MANAGER_ACTIVITY_SUMMARY

Purpose:

Employer-owner review summary of manager activity.

Fields:

- manager_activity_summary_id
- employer_id
- manager_user_id
- period_start
- period_end
- approved_count
- rejected_count
- escalated_count
- overdue_count
- reopened_count
- calculated_at

Rule:

Activity Summary is internal and must not become employee-facing ranking.

### 1.18.7. MANAGER_TIMELINE_EVENT

Fields:

- manager_timeline_event_id
- employer_id
- manager_work_item_id_optional
- actor_role
- actor_id
- event_type
- old_state_optional
- new_state_optional
- reason_optional
- created_at

## 1.19. Source Domain Values

source_domain allowed values:

- shift_jobs_future
- career_jobs_future
- workforce_ops_future
- hr_section_future
- employer_internal_future
- admin_escalation_hidden

Rule:

Source domain must be explicit to prevent hidden mixing.

## 1.20. Privacy / Data Boundary

Manager Console must protect:

- employee privacy
- Work Vault access boundaries
- employer internal notes
- Admin governance separation
- hidden-scope separation
- manager permission boundaries
- payroll/legal boundary

Rules:

- manager notes must not be exposed to employees
- unrelated managers must not see unrelated records
- Manager Console must not become surveillance
- Manager Console must not expose private Work Vault content without grant
- Manager Console must not become payroll or legal proof

## 1.21. UX Quality Rules

Future Manager Console UX must be:

- operational
- calm
- clear
- permission-aware
- queue-based
- exception-focused
- audit-friendly
- due-time visible
- visibly separate from normal Employer Dashboard
- visibly separate from Admin, HR Section and Workforce Ops Hub

Manager first-read must answer:

- What needs my action?
- What is pending?
- What is blocked?
- What is overdue?
- What is escalated?
- What can I do safely?

Employer owner first-read must answer:

- What are managers handling?
- What needs owner review?
- Are any manager actions risky?
- Are permissions correct?
- Are any manager queues overloaded?

## 1.22. Empty / First-Time State

### 1.22.1. No manager setup state

```txt
No manager workspace is active.
Manager Console is for approved future operational control.
```

### 1.22.2. No assigned work items state

```txt
No work items assigned.
Assigned operational items will appear here when Manager Console is active.
```

### 1.22.3. No exception items state

```txt
No exceptions need review.
Operational exceptions will appear here when review is required.
```

### 1.22.4. Empty-state safety rules

- Empty states must not appear in launch UI.
- Empty states must not expose Admin, HR Section or Workforce Ops internals.
- Empty states must not imply payroll, payment or legal attendance.
- Empty states must remain permission-safe.

## 1.23. Final Manager Console Lock Note

Manager Console is approved as hidden future employer-side operational control architecture.

Final locked boundaries:

- Manager Console must remain hidden in current launch.
- Manager Console must stay separate from normal Employer Dashboard.
- Manager Console must stay separate from Admin System.
- Manager Console must stay separate from HR Section.
- Manager Console must stay separate from Workforce Ops Hub.
- Manager Console must stay separate from Work Vault ownership.
- Manager Console must not become payroll, legal attendance or enforcement system.
- Manager actions must be permission-scoped and audit-visible.
- Bulk actions must be controlled, confirmed and audited.
- Employee-facing screens must not expose manager notes or hidden queues.
- Future exposure requires backend login, permissions, audit, privacy and release review.
- Phase 0 must remain honest, hidden-scope safe and Play Store safe.

— END OF MANAGER CONSOLE HIDDEN ARCHITECTURE —
