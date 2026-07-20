# 13. Backend Foundation Master Document

> **LEGACY DOMAIN PLAN:** This document contains historical domain assumptions (`mitralabs.app`, `jobmitra.app`, `admin.mitralabs.app`). For current canonical decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md).

## 1. Final Decision

### 1.1 Document Purpose

This document is the backend foundation source of truth for:

```txt
Mitra Labs
Job Mitra
HomeFix Mitra
future products
product websites
central admin portal
```

### 1.2 Implementation Lock

Backend, login, database, storage, admin, and production implementation must not start until this document is reviewed and approved.

### 1.3 Master Rule

All backend decisions must follow approved Mitra Labs master documents.

## 2. Brand and Product Structure

### 2.1 Parent Brand

Main parent brand:

```txt
Mitra Labs
```

### 2.2 Current Products

Current products:

```txt
Job Mitra
HomeFix Mitra
```

### 2.3 Future Products and Services

Future products and services may also be added under Mitra Labs.

Examples:

```txt
future apps
future websites
software services
digital services
creative services
admin-managed product services
```

### 2.4 Product Structure Rule

One parent brand can manage multiple separated products.

Main rule:

```txt
One parent brand, multiple separated products.
```

## 3. Domain Strategy

### 3.1 Recommended Domain Structure

Recommended domain structure:

```txt
mitralabs.app
jobmitra.app
homefixmitra.app
admin.mitralabs.app
```

### 3.2 Domain Meaning

Domain meaning:

```txt
mitralabs.app = company website
jobmitra.app = Job Mitra product website
homefixmitra.app = HomeFix Mitra product website
admin.mitralabs.app = central admin portal
```

### 3.3 Admin Domain Rule

Admin does not need a separate domain.

Admin must use a private subdomain under Mitra Labs:

```txt
admin.mitralabs.app
```

### 3.4 Public Website Rule

Company and product websites are public.

Admin portal is private and must not be treated like a normal public website page.

## 4. Admin Portal Strategy

### 4.1 Central Admin Portal

Use one central admin portal:

```txt
admin.mitralabs.app
```

### 4.2 Admin Area Separation

Inside this admin portal, every product and website must have separated admin areas.

### 4.3 Required Admin Areas

Required admin areas:

```txt
Super Admin Dashboard
Mitra Labs Website Admin
Job Mitra Admin
HomeFix Mitra Admin
Future App Admin
Future Website Admin
Reports
Users
Roles and Permissions
Audit Logs
Settings
```

### 4.4 Public App Admin Rule

Admin must not be inside public mobile apps.

Do not place admin inside:

```txt
Job Mitra public app
HomeFix Mitra public app
public product websites
```

## 5. Auth Model

### 5.1 Auth Ownership

Backend must own authentication.

### 5.2 Starting Auth Method

Recommended starting auth:

```txt
Email + password
```

### 5.3 Optional Future Auth

Optional later:

```txt
Google login
```

### 5.4 Phone OTP Rule

Phone OTP should be added later only if cost and abuse control are ready.

Do not start with SMS OTP first unless budget, abuse protection, rate limits, and delivery handling are planned.

### 5.5 Production Login Rule

Production login must not be fake/demo-only after backend starts.

All production login must be backend-verified.

## 6. RBAC and Permissions

### 6.1 RBAC Meaning

RBAC means role-based access control.

### 6.2 Required Roles

Required roles:

```txt
Super Admin
Product Admin
Website Admin
Support / Moderator
Employee
Employer
Customer
Provider / Technician roles
```

### 6.3 Permission Rule

Frontend role is not security.

Backend must verify every protected action.

### 6.4 Permission Examples

Examples:

```txt
Job Mitra Admin can manage only Job Mitra.
HomeFix Mitra Admin can manage only HomeFix Mitra.
Super Admin can manage all products.
Employee cannot access employer-only data.
Employer cannot access admin-only data.
Product Admin cannot change Super Admin settings.
```

### 6.5 Backend Permission Checks

Backend must check:

```txt
logged-in user
role
product access
resource ownership
requested action
admin permission
```

## 7. Database Architecture

### 7.1 Database Type

Database type:

```txt
PostgreSQL
```

### 7.2 Recommended First Provider

Recommended first provider:

```txt
Supabase PostgreSQL
```

### 7.3 Backend Technology

Backend:

```txt
Node.js + TypeScript
```

### 7.4 Backend Hosting

Backend hosting:

```txt
Render
```

### 7.5 Database Must Store

Database must store:

```txt
users
roles
profiles
job posts
applications
workspaces
employment records          ← single SoT per Career hire (OWN-001)
planner plans               ← separate domain tables
vault documents + access grants
ratings
services
bills
complaints
admin users
permissions
audit logs
```

### 7.6 ORM Direction

Recommended ORM:

```txt
Prisma
```

Prisma should be used if possible to keep schema, migrations, and future migration clean.

## 8. Data Separation Rules

### 8.1 One Database Rule

One database can be used at the beginning, but product data must never mix.

### 8.2 Example Table Separation

Example table separation:

```txt
jobmitra_users
jobmitra_employee_profiles
jobmitra_employer_profiles
jobmitra_career_posts
jobmitra_career_applications
jobmitra_career_workspaces
jobmitra_shift_posts
jobmitra_shift_applications
jobmitra_shift_workspaces
jobmitra_employment
jobmitra_employment_lifecycle_events
jobmitra_planner_plans
jobmitra_planner_plan_days
jobmitra_vault_folders
jobmitra_vault_documents
jobmitra_vault_access_grants
jobmitra_ratings

homefix_customers
homefix_properties
homefix_appliances
homefix_services
homefix_bills
homefix_complaints
homefix_providers

admin_users
admin_roles
admin_permissions
admin_audit_logs
```

### 8.3 Strict Product Rule

Strict rule:

```txt
Job Mitra data and HomeFix Mitra data must never mix.
```

### 8.4 Admin Data Rule

Admin data must be separated from public user data.

### 8.5 Future Split Rule

If scale requires it, Job Mitra, HomeFix Mitra, and Admin can be split into separate databases later.

## 9. API Architecture

### 9.1 Backend API Rule

All important app actions must go through the Node.js backend API.

Frontend should not directly control business rules.

### 9.2 Required API Groups

Required API groups:

```txt
/auth
/users
/jobmitra/employees
/jobmitra/employers
/jobmitra/career-jobs
/jobmitra/shift-jobs
/jobmitra/employment
/jobmitra/planner
/jobmitra/vault
/jobmitra/workspaces
/homefix/customers
/homefix/services
/homefix/bills
/homefix/complaints
/admin/users
/admin/reports
/admin/audit-logs
/storage
```

### 9.3 API Rules

API rules:

```txt
Validate input on backend.
Check permissions on backend.
Never trust frontend role state.
Use pagination for lists.
Use rate limits for sensitive actions.
Log important admin actions.
Return safe error messages.
Do not expose secrets or stack traces.
```

### 9.4 Global infrastructure abstraction rule (2026-07-04 — expanded)

**Global rule:** Business/Domain layers must never import infrastructure providers directly.

| Port                    | Adapter (initial)                                               |
| ----------------------- | --------------------------------------------------------------- |
| `StorageService`        | `SupabaseStorageAdapter`                                        |
| `EmailService`          | `ProviderAdapter`                                               |
| `NotificationService`   | `PushProviderAdapter`                                           |
| `QueueService`          | `BackgroundJobAdapter`                                          |
| `SearchService`         | `SearchProviderAdapter`                                         |
| `SecretsService`        | `EnvironmentProvider`                                           |
| `CacheService` (future) | `CacheProvider`                                                 |
| Repositories            | Prisma / `DatabaseRepository` — not `supabase.from()` in domain |

```txt
❌ careerHireService.ts → supabase.storage.from('vault').upload(...)
✅ careerHireService.ts → storageService.putObject(...)
✅ infrastructure/adapters/SupabaseStorageAdapter.ts → supabase SDK
```

**Layer stack inside Render deployable:**

```txt
REST controllers → Application layer → Domain layer → Infrastructure adapters → PostgreSQL / Storage
```

### 9.5 Modular monolith rule

One deployable Node.js app on Render with **internal modules** by product/domain:

```txt
modules/auth
modules/jobmitra/shift
modules/jobmitra/career
modules/jobmitra/planner
modules/jobmitra/vault
modules/admin
infrastructure/adapters/
```

Do not split into microservices until DEC-approved scale event.

### 9.6 API Performance Rule

High-usage APIs must be optimized first.

Highest Job Mitra load risk:

```txt
employee job search
job details
applications
employer applicant review
notifications later
```

## 10. Storage Architecture

### 10.1 Storage Rule

Files and images should not be stored directly inside database rows.

### 10.2 Storage Use Cases

Use storage for:

```txt
profile images
documents
service photos
bill images
proof files
complaint photos
future attachments
```

### 10.3 Recommended First Storage

Recommended first storage:

```txt
Supabase Storage
```

### 10.4 Future Storage Option

Future storage option:

```txt
Google Cloud Storage
```

### 10.5 Storage Data Rule

Store in database:

```txt
file URL/path
file owner
file type
product/app context
permission reference
metadata
```

Store actual file in storage.

### 10.6 Storage Security Rule

Storage rules:

```txt
Use access permissions.
Do not make private user files public.
Validate file type.
Validate file size.
Validate upload ownership.
Validate view permission.
```

## 11. Audit Logs

### 11.1 Audit Requirement

Audit logs are mandatory for admin and sensitive actions.

### 11.2 Audit Log Fields

Audit logs should record:

```txt
admin/user id
role
product/app affected
action type
target record
old value if needed
new value if needed
timestamp
IP/device info if available
```

### 11.3 Required Logged Actions

Required logged actions:

```txt
admin login
admin logout
admin role changes
user suspension
employer/provider review
report action
data delete
permission changes
important settings changes
```

### 11.4 Audit Protection

Audit logs must not be casually editable or deletable.

Audit logs must be treated as security records.

## 12. Security Rules

### 12.1 Backend Security Rule

Security must be backend-enforced.

### 12.2 Core Rules

Rules:

```txt
Do not trust localStorage.
Do not trust frontend route guards.
Do not expose admin in public apps.
Do not hardcode secrets in code.
Use environment variables.
Use backend validation.
Use role permissions.
Use password hashing.
Use secure sessions/tokens.
Add rate limits.
Add audit logs.
Use safe error handling.
```

### 12.3 Public App Safety

Public app safety:

```txt
No fake OTP.
No fake payment.
No fake verification.
No fake notification.
No fake interview/offer claim unless real data exists.
No fake cloud sync.
No fake admin action.
```

### 12.4 Secret Rule

Never hardcode:

```txt
database URL
JWT secret
session secret
admin secret
storage keys
API keys
email provider keys
payment keys
```

Use environment variables.

## 13. Hosting Plan

### 13.1 Recommended Starting Setup

Recommended starting setup:

```txt
Frontend websites/apps: Cloudflare Pages
Backend API: Render
Database: Supabase PostgreSQL
Storage: Supabase Storage
Admin frontend: Cloudflare Pages
```

### 13.2 Simple Flow

Simple flow:

```txt
Frontend -> Node.js backend on Render -> Supabase PostgreSQL database
```

### 13.3 Environment Rule

Use separate environments:

```txt
development
staging
production
```

Production credentials must not be used in development.

## 14. Backup and Migration Plan

### 14.1 Backup Rule

Backup is required before production.

### 14.2 Backup Requirements

Backup rules:

```txt
Database backup must be enabled.
Important data must be exportable.
Admin audit logs must be preserved.
Before major migration, full backup is required.
Environment configuration must be documented.
```

### 14.3 Migration-Friendly Rules

Migration-friendly rules:

```txt
Use standard PostgreSQL.
Use Prisma ORM if possible.
Keep business logic in backend.
Avoid provider lock-in.
Do not depend too heavily on provider-specific features without documentation.
Keep product data separated.
Keep storage metadata clean.
```

## 15. Cost Notes

### 15.1 Cost Meaning

Cost understanding:

```txt
Node.js = free technology
Render = backend server hosting cost
Supabase PostgreSQL = database hosting cost
Supabase Storage = file storage cost
Cloudflare Pages = frontend hosting, usually low/free early
```

### 15.2 Early Budget

Expected early production budget:

```txt
Approx $30-$60 per month
```

### 15.3 Cost Increase Risks

Cost can increase with:

```txt
more users
heavy search usage
more database storage
more file uploads
more backend API traffic
more admin/report activity
notifications later
```

### 15.4 Main Load Risk

Job Mitra highest load risk:

```txt
employee job search
job details
applications
employer applicant review
notifications later
```

## 16. Future Google Cloud Migration

### 16.1 Future Migration Path

Future migration path:

```txt
Render -> Google Cloud Run
Supabase PostgreSQL -> Google Cloud SQL PostgreSQL
Supabase Storage -> Google Cloud Storage
```

### 16.2 Migration Reason

Migration is possible because both current and future databases use PostgreSQL.

### 16.3 Keep Migration Easy

Keep migration easy by:

```txt
Using standard Node.js backend.
Using PostgreSQL properly.
Using Prisma ORM.
Avoiding Render-specific code.
Avoiding deep provider lock-in.
Keeping data separated.
Keeping permission logic clean.
Keeping audit logs structured.
Keeping storage metadata exportable.
```

### 16.4 Migration Timing Rule

Do not migrate to Google Cloud too early.

Migrate only when scale, cost, security, or operations justify it.

## 17. Final Locked Decisions

### 17.1 Locked Decisions

Locked decisions:

```txt
Parent brand = Mitra Labs
Product 1 = Job Mitra
Product 2 = HomeFix Mitra
Admin portal = admin.mitralabs.app
Backend = Node.js + TypeScript
Backend hosting first = Render
Database = PostgreSQL
Database provider first = Supabase PostgreSQL
Storage first = Supabase Storage
Frontend hosting = Cloudflare Pages
Future migration = Google Cloud possible
Admin must not be inside public apps
Super Admin must exist
Product admins must be separated
Job Mitra and HomeFix Mitra data must never mix
```

### 17.2 Do Not Change Casually

These locked decisions must not be changed casually.

Any change must be reviewed and documented first.

## 18. Approval Status

### 18.1 Current Status

```txt
Reviewed — tables/API routes supplemented for Employment, Planner, Vault (2026-07-04)
Full application architecture: doc 16 (chapters pending)
```

### 18.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 18.3 Lock Rule

Backend, login, database, storage, admin, and production implementation must not start until this document is approved.
