<!-- App name: WorkMitra / Job Mitra
File name: 19_ROLE_SESSION_ROUTE_GUARD_WORKFLOW.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\19_ROLE_SESSION_ROUTE_GUARD_WORKFLOW.md -->

# 1. WORKMITRA / JOB MITRA — ROLE SESSION ROUTE GUARD WORKFLOW

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
- `18_NOTIFICATION_IMPLEMENTATION_CONTRACT.md`
- Mitra Labs Universal Working Agreement v3.1.2

## 1.2. Purpose

This document defines the role, session, route guard, navigation and back-stack workflow for Job Mitra.

It exists to protect strict separation between:

- Employer
- Employee
- Shift Jobs
- Career Jobs
- Work Vault
- Employment Lifecycle
- hidden/future domains

This document is required before backend/login code work.

## 1.3. Core Principle

The app must always know:

1. Which role is active.
2. Which routes that role can open.
3. Which actions that role can perform.
4. Which data that role can see.
5. What happens when user presses phone back or uses back gesture.
6. What happens when login/backend is added later.

Role safety must not depend only on hiding buttons.

Route guards must protect the app even when a user reaches a URL/screen directly.

---

# 2. ROLE MODEL

## 2.1. Launch-Visible Roles

Launch-visible roles:

- employer
- employee

Only these roles may appear in the public launch role choice flow.

## 2.2. Hidden/Future Roles

Hidden/future roles:

- admin
- super_admin
- hr_user
- manager
- workforce_ops_user

Rules:

- must not appear on landing page
- must not appear in role picker
- must not appear in bottom navigation
- must not appear as teaser cards
- must not appear as broken routes

## 2.3. Active Role Context

At any time, the app must have one active role context:

```txt
employer
employee
none
```

In Phase-0, role may be stored locally.

In future backend mode, role context must be account/session-bound.

## 2.4. No Mixed Role Screen Rule

A screen must not mix Employer and Employee actions.

Examples:

- Employer dashboard must not show Apply buttons.
- Employee dashboard must not show Create Job buttons.
- Employee Work Vault owner controls must not appear in Employer view.
- Employer applicant management must not appear in Employee view.

---

# 3. SESSION MODEL

## 3.1. Phase-0 Local Session

Phase-0 may use local/device session state.

Allowed local session fields:

- active_role
- last_opened_role_home
- local_profile_id_optional
- local_session_created_at
- local_session_updated_at

Rules:

- local session is not real authentication
- do not call it secure login
- do not claim backend account ownership
- do not treat local role as server permission

Safe wording:

```txt
Saved on this device.
```

## 3.2. Future Backend Session

Future backend session must include:

- authenticated user
- active role context
- role profile ID
- session status
- token/session validity
- permission scope
- expiry/revocation handling

Rules:

- expired session must redirect safely
- logout must clear private navigation stack
- account deletion must revoke active sessions
- wrong-role routes must remain blocked on backend

## 3.3. Session Boundary

Backend session must not redefine product meaning.

Backend enforces:

- role
- ownership
- permissions
- route access
- workflow state

Domain documents define:

- what statuses mean
- what transitions are valid
- what features are launch-visible
- what features are hidden/future

---

# 4. ROUTE GROUPS

## 4.1. Public Routes

Public routes may include:

- landing
- role choice
- basic public app information where approved
- future login/signup pages

Allowed before role selection:

```txt
/
 /role-select
 /login future
 /signup future
```

Rules:

- must not show Admin/HR/Manager/Workforce/Payroll
- must not show private employer or employee data

## 4.2. Employer Routes

Employer routes may include:

- employer home
- employer Shift Jobs
- create/edit Shift Job
- Shift Job draft list
- Shift Job applicants
- selected workers
- employer Career Jobs
- create/edit Career Job
- Career Job draft list
- applicant pipeline
- applicant detail
- employer profile/trust summary
- employer notifications
- employer settings where safe

Rules:

- employee cannot open employer routes
- employer routes must not expose hidden HR/Manager/Workforce/Admin in launch
- employer route must check active_role = employer

## 4.3. Employee Routes

Employee routes may include:

- employee home
- employee Shift Jobs discovery
- employee Shift Job detail
- my Shift applications
- employee Career Jobs discovery
- employee Career Job detail
- my Career applications
- Work Vault
- Employment Lifecycle status
- employer trust view
- employee notifications
- employee profile/settings where safe

Rules:

- employer cannot open employee-only routes in employer context
- employee route must check active_role = employee
- employee cannot see other applicants/workers

## 4.4. Hidden/Future Routes

Hidden/future routes:

- Admin
- HR Section
- Manager Console
- Workforce Ops Hub
- Full Insights full analytics
- Payroll

Rules:

- must not be registered as public launch routes unless protected and intentionally hidden
- must not be reachable from normal navigation
- must not appear in route fallback suggestions
- must not appear in notification routes
- future activation requires explicit versioned approval

---

# 5. ROUTE GUARD RULES

## 5.1. Route Guard Decision Model

Before opening a protected route, app must check:

1. Is there an active role?
2. Does the route belong to that role?
3. Is the route launch-visible?
4. Is the route hidden/future-only?
5. Does the route require a record ID?
6. Does the active role own or have access to the record?
7. Is the record in a valid state for that screen?
8. Is backend/session required?
9. Is fallback route safe?

## 5.2. No Active Role

If no active role exists:

- redirect to Landing / Role Select
- do not open protected pages
- do not show hidden routes
- do not show private data

Safe fallback:

```txt
/
```

## 5.3. Wrong Role Route

If employer opens employee-only route:

- block route
- redirect to Employer Home
- show safe message only if needed

Safe message:

```txt
This page is not available in your current role.
```

If employee opens employer-only route:

- block route
- redirect to Employee Home
- show safe message only if needed

Safe message:

```txt
This page is not available in your current role.
```

## 5.4. Hidden Route Attempt

If hidden/future route is attempted in launch:

- block route
- redirect to safe home
- do not reveal hidden module details
- do not show “coming soon” unless explicitly approved

Safe message:

```txt
This page is not available in the current app version.
```

## 5.5. Missing Record

If route record ID does not exist:

- show safe not-found state
- offer return to correct list
- do not expose whether another user owns it

Safe message:

```txt
This record is not available from your account.
```

## 5.6. Invalid Workflow State

If record state does not allow route/action:

- block action
- show current safe status
- offer correct next action if available

Safe message:

```txt
This action is available only after the current step is complete.
```

---

# 6. ROLE SELECTION FLOW

## 6.1. First App Open

On first open:

1. show premium landing page
2. show only Employer and Employee role choices
3. user selects role
4. active role is stored locally in Phase-0
5. route opens correct home

Allowed choices:

- Continue as Employer
- Continue as Employee

Blocked choices:

- Admin
- HR
- Manager
- Workforce Ops
- Payroll
- Full Insights

## 6.2. Employer Entry

Employer role opens:

```txt
/employer/home
```

Employer home must show only employer-safe launch features.

## 6.3. Employee Entry

Employee role opens:

```txt
/employee/home
```

Employee home must show only employee-safe launch features.

## 6.4. Role Change

If role change is allowed in Phase-0:

1. user explicitly chooses Switch Role
2. current role-specific navigation stack is cleared
3. user returns to role selection
4. new role opens clean home
5. wrong-role pages must not remain in back stack

Rule:

Role switch must be explicit, not accidental.

## 6.5. Future Multi-Role Account

Future backend may allow one account to have both Employer and Employee profiles.

Rules:

- account can contain multiple role profiles
- active role must still be one role at a time
- role switch must be explicit
- backend permissions must enforce role context
- app navigation must reset after switch

---

# 7. BACK BUTTON AND BACK GESTURE WORKFLOW

## 7.1. Core Back Rule

Most mobile users will use phone back button or back gesture.

Therefore, phone/system back must be safe.

Top back button is secondary.

## 7.2. Back Priority Order

When back is triggered, app should handle in this order:

1. close keyboard where applicable
2. close modal
3. close bottom sheet
4. close drawer/filter panel
5. warn about unsaved form changes
6. return to previous safe same-role page
7. return to role home
8. exit only from safe root where appropriate

## 7.3. Unsaved Form Back

Unsaved warning required for:

- create Shift Job
- edit Shift Job
- create Career Job
- edit Career Job
- Work Vault metadata edit
- Work Vault sharing settings
- profile edit
- Career application form
- lifecycle sensitive action
- future account/security forms

Safe message:

```txt
You have unsaved changes. Do you want to leave this page?
```

Actions:

- Stay
- Leave

## 7.4. Wrong-Role Back Stack Prevention

Phone back must not return user to:

- previous employer page after switching to employee
- previous employee page after switching to employer
- hidden future page
- private page after logout
- Work Vault access page after revoke
- account page after deletion/logout

## 7.5. App Exit Behavior

From landing or safe role home:

- accidental exit should be avoided where platform pattern supports it
- do not show aggressive exit prompts everywhere

Safe option:

```txt
Press back again to exit.
```

Use only where appropriate.

---

# 8. LOGOUT AND FUTURE ACCOUNT FLOW

## 8.1. Phase-0 Reset / Clear Local Role

If app provides local reset:

- clear active_role
- clear unsafe route stack
- return to landing
- do not delete local demo records unless user chooses data reset

## 8.2. Future Logout

Future backend logout must:

- invalidate session where possible
- clear private route stack
- clear active role context
- redirect to login/landing
- prevent browser/back return to private pages

## 8.3. Future Session Expiry

If session expires:

- stop private API calls
- clear private route access
- show safe session message
- redirect to login
- preserve unsaved local draft where safe

Safe message:

```txt
Your session has expired. Please sign in again.
```

## 8.4. Account Deletion

After account deletion request or completed deletion:

- block private pages
- clear active session
- stop notification routing
- follow backend/account deletion rules
- do not expose old private pages through back navigation

---

# 9. ROUTE GUARD MATRIX

## 9.1. Employer Route Matrix

| Route group                | Active role required | Launch status  | Guard action             |
| -------------------------- | -------------------- | -------------- | ------------------------ |
| Employer Home              | employer             | launch-visible | allow                    |
| Employer Shift Jobs        | employer             | launch-visible | allow                    |
| Create/Edit Shift Job      | employer             | launch-visible | allow with unsaved guard |
| Shift Drafts               | employer             | launch-visible | allow owner-only         |
| Shift Applicants           | employer             | launch-visible | allow owner-only         |
| Employer Career Jobs       | employer             | launch-visible | allow                    |
| Create/Edit Career Job     | employer             | launch-visible | allow with unsaved guard |
| Career Applicants          | employer             | launch-visible | allow owner-only         |
| Employer Notifications     | employer             | launch-visible | allow                    |
| Admin/HR/Manager/Workforce | hidden role/future   | hidden         | block in launch          |

## 9.2. Employee Route Matrix

| Route group                | Active role required | Launch status  | Guard action                  |
| -------------------------- | -------------------- | -------------- | ----------------------------- |
| Employee Home              | employee             | launch-visible | allow                         |
| Shift Discovery            | employee             | launch-visible | allow                         |
| Shift Detail               | employee             | launch-visible | allow if published/accessible |
| My Shift Applications      | employee             | launch-visible | allow own only                |
| Career Discovery           | employee             | launch-visible | allow                         |
| Career Detail              | employee             | launch-visible | allow if published/accessible |
| My Career Applications     | employee             | launch-visible | allow own only                |
| Work Vault                 | employee             | launch-visible | allow owner-only              |
| Employment Lifecycle       | employee             | launch-visible | allow own only                |
| Employer Trust View        | employee             | launch-visible | allow safe trust view         |
| Employee Notifications     | employee             | launch-visible | allow                         |
| Admin/HR/Manager/Workforce | hidden role/future   | hidden         | block in launch               |

## 9.3. Public Route Matrix

| Route group        | Active role required | Launch status  | Guard action           |
| ------------------ | -------------------- | -------------- | ---------------------- |
| Landing            | none or any          | launch-visible | allow                  |
| Role Select        | none or any          | launch-visible | allow                  |
| Future Login       | none                 | future/backend | allow when implemented |
| Future Signup      | none                 | future/backend | allow when implemented |
| Hidden Admin Login | hidden/future        | hidden         | block in public launch |

---

# 10. NOTIFICATION ROUTE GUARD RULES

Before opening notification action route:

1. read notification target role
2. compare with active role
3. check source domain
4. check source record ID
5. check record accessibility
6. check hidden/launch status
7. open safe route or fallback

If notification target role does not match active role:

- do not open wrong-role page
- redirect to correct role home or role select where safe

If route is hidden/future-only:

- block route
- show safe message
- do not reveal hidden module internals

---

# 11. BACKEND MIGRATION ROUTE PLAN

## 11.1. Before Backend

Use local route/session adapter.

Responsibilities:

- store active role locally
- guard role routes
- prevent hidden routes
- support back behavior
- support local draft/session restore

## 11.2. During Backend Migration

Introduce backend-ready interface:

- auth service
- session service
- role context service
- route guard policy
- record ownership check interface

Do not rewrite all domain logic randomly.

## 11.3. After Backend

Backend becomes source of truth for:

- authenticated user
- active session
- role profile ownership
- record ownership
- permission checks
- hidden route access
- account deletion/session revocation

Frontend still protects UX, but backend enforces security.

---

# 12. IMPLEMENTATION AUDIT FILES TO INSPECT BEFORE CODE

Before backend/login or route guard coding, inspect current app files for:

1. app entry
2. router setup
3. route path constants
4. route guards if any
5. layout components
6. top bar/back button
7. bottom navigation
8. role selection state
9. localStorage/session storage usage
10. notification route handling
11. profile/account placeholder screens
12. Shift Jobs routes
13. Career Jobs routes
14. Work Vault routes
15. Employment Lifecycle routes

Required first code-audit target:

```txt
C:\projects\WorkMitra_Enterprise_v2\src\App.tsx
```

---

# 13. NO-GO CONDITIONS

Do not implement route/session/backend change if:

1. Employer can access employee-only route.
2. Employee can access employer-only route.
3. Hidden Admin/HR/Manager/Workforce route appears in launch UI.
4. Phone back returns to wrong-role private page.
5. Logout does not clear private route stack.
6. Role switch keeps old role pages in back stack.
7. Unsaved form can be lost silently.
8. Work Vault private page can be opened by employer without grant.
9. Draft job becomes public without publish confirmation.
10. Backend route guard is replaced by only frontend hiding.
11. Account deletion/logout allows back navigation to private pages.
12. Notification opens wrong-role route.

---

# 14. FINAL ROLE SESSION ROUTE GUARD LOCK NOTE

This document is approved as the role/session/route guard workflow.

Final locked decisions:

- Launch role choices are Employer and Employee only.
- Active role context must always be clear.
- Employer and Employee routes must remain separate.
- Hidden domains must not appear in launch routing/navigation.
- Phone back and back gesture must be safe.
- Unsaved form warnings are required for long/sensitive forms.
- Role switch must clear unsafe back stack.
- Logout/future session expiry must block private pages.
- Notification routes must be role-safe.
- Backend must enforce permissions; frontend hiding is not security.
- Backend/login coding must start only after current router/session files are audited.

— END OF ROLE SESSION ROUTE GUARD WORKFLOW —
