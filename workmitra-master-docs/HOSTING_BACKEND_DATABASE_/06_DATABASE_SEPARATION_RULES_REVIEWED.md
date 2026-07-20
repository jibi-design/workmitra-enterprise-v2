# 06. Database Separation Rules

## 1. Final Decision

### 1.1 Starting Database Strategy

One PostgreSQL database can be used at the beginning.

### 1.2 Master Separation Rule

Product data must never mix.

### 1.3 Future Split Rule

If Job Mitra and HomeFix Mitra both grow large, they can be split into separate databases later.

## 2. Initial Database Strategy

### 2.1 One Database Start

Start with one PostgreSQL database.

Recommended first provider:

```txt
Supabase PostgreSQL
```

### 2.2 Separation Method

Separate data by product-specific tables, modules, API routes, permissions, and audit logs.

### 2.3 Database Ownership Rule

The Node.js backend must control database access.

Frontend must not directly control important database actions.

## 3. Product Table Separation

### 3.1 Job Mitra Tables

Job Mitra tables should be clearly prefixed or grouped.

Example:

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
jobmitra_employment              ← single SoT per hire (OWN-001; Career only)
jobmitra_employment_lifecycle_events
jobmitra_planner_plans           ← Workforce Intelligence domain (not Shift feature)
jobmitra_planner_plan_days
jobmitra_planner_templates
jobmitra_vault_folders
jobmitra_vault_documents
jobmitra_vault_access_grants     ← time-boxed employer OTP access (OWN-004)
jobmitra_ratings
jobmitra_notifications
jobmitra_notification_events     ← server event log per user (OWN-005)
```

### 3.2 HomeFix Mitra Tables

HomeFix Mitra tables should be clearly prefixed or grouped.

Example:

```txt
homefix_customers
homefix_properties
homefix_appliances
homefix_services
homefix_bills
homefix_complaints
homefix_providers
homefix_notifications
```

### 3.3 Admin Tables

Admin tables should be clearly separated from public product tables.

Example:

```txt
admin_users
admin_roles
admin_permissions
admin_audit_logs
admin_reports
admin_settings
```

## 4. Data Boundary Rules

### 4.1 Product Boundary

Never mix:

```txt
Job Mitra users with HomeFix Mitra users
Job Mitra job data with HomeFix service data
Job Mitra ratings with HomeFix ratings
Job Mitra notifications with HomeFix notifications
```

### 4.2 Role Boundary

Never mix:

```txt
Employee data with Employer data
Customer data with Provider/Technician data
Product Admin data with Super Admin data
```

### 4.3 Domain Boundary

Never mix:

```txt
Career Jobs with Shift Jobs
Career workspace with HR Management
Admin data with public user data
Public website data with product app data unless intentionally linked
```

## 5. Job Mitra Data Separation

### 5.1 Employee and Employer Separation

Employee and Employer flows must stay separated.

Examples:

```txt
Employee profile data
Employer company/profile data
Employee applications
Employer job posts
Employer applicant review
```

### 5.2 Career Jobs and Shift Jobs Separation

Career Jobs and Shift Jobs must stay separated.

Examples:

```txt
Career job posts
Career applications
Career workspaces
Career ratings

Shift job posts
Shift applications
Shift groups
Shift attendance/status
```

### 5.3 Cross-Domain Rule

Career Jobs data must not be reused as Shift Jobs data.

Shift Jobs data must not be reused as Career Jobs data.

**Employment rule (OWN-001, locked 2026-07-04):** One `jobmitra_employment` row per hire. Created only on `career.hire.confirmed_by_employer` after `career.offer.accepted_by_employee`. See `second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`.

**Planner rule (locked 2026-07-04):** Planner tables are a **separate domain** — never store planner forecast/scenario data inside shift post tables. See `planner/02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`.

Shared user identity is allowed only through proper user/profile relationships.

### 5.4 Employment (Career hire only)

Employment records are **Career Jobs only**. Shift Jobs must not create employment rows.

| Rule           | Requirement                                          |
| -------------- | ---------------------------------------------------- |
| Single row     | One employment per hire (`employmentId`)             |
| Create trigger | Employer hire confirm after employee offer accept    |
| Shift          | Vault shift history only — no employment table write |

Full contract: `architecture-audits/30_DATA_OWNERSHIP_ENTERPRISE_AUDIT_v1.1.md` (OWN-001).

### 5.5 Demand Planner (Workforce Intelligence domain)

Planner is **not** a Shift Jobs feature. Use dedicated tables:

```txt
jobmitra_planner_plans
jobmitra_planner_plan_days
jobmitra_planner_templates
jobmitra_planner_scenarios        (V2 — second-update/04_...)
jobmitra_planner_forecasts        (V2)
```

Planner may **link** to shift posts via `planId` on child posts — never merge planner state into `jobmitra_shift_posts` columns.

### 5.6 Work Vault

Vault bytes are **employee-owned** (OWN-004). Database stores metadata; files in Supabase Storage.

```txt
jobmitra_vault_folders
jobmitra_vault_documents
jobmitra_vault_access_grants      ← employer time-boxed view via OTP consent
```

Employers must not get a permanent copy of vault document bytes on their account.

## 6. Career Jobs Workspace Meaning

### 6.1 Workspace Definition

Career workspace means:

```txt
Ongoing work record area for an employee hired through Career Jobs.
```

### 6.2 Workspace Is For

Career workspace is for:

```txt
joined status
working status
notice
resignation
completion
rating follow-up later
```

### 6.3 Workspace Is Not For

Career workspace is not:

```txt
HR Management
Payroll
Shift Job group
Admin system
Manager Console
```

### 6.4 Workspace Visibility Rule

Employer side should keep Hired Employee Workspaces visible and understandable.

If there are no hired employees, show an empty workspace message.

After hiring, workspace records should appear there.

## 7. HomeFix Mitra Data Separation

### 7.1 Role Separation

HomeFix Mitra roles must stay separated.

Examples:

```txt
Customer / Home Owner
Independent Technician
Shop Technician
Shop Owner
```

### 7.2 Service Data Separation

Service records, bills, complaints, properties, appliances, and provider records must stay linked correctly.

### 7.3 Complaint Link Rule

Complaint data must stay linked to the original service/bill/provider context.

## 8. Admin Data Separation

### 8.1 Admin User Separation

Admin users must be stored separately from normal public app users unless intentionally linked through a secure account model.

### 8.2 Admin Permission Separation

Admin permissions must be product-scoped.

Examples:

```txt
Job Mitra Admin = Job Mitra only
HomeFix Mitra Admin = HomeFix Mitra only
Super Admin = all products and websites
```

### 8.3 Admin Audit Log Separation

Audit logs must identify which product/app/website was affected.

## 9. Storage Boundary Rules

### 9.1 File Storage Rule

Files and images should not be stored directly inside database rows.

Use storage for:

```txt
profile images
documents
bill images
service photos
proof files
future attachments
```

### 9.2 Database File Reference Rule

Database should store:

```txt
file path or URL
file owner
file type
product/app
permission reference
created date
```

### 9.3 Private File Rule

Private user files must not be public by default.

## 10. API and Permission Boundary

### 10.1 API Product Boundary

API routes must be separated by product/domain.

Examples:

```txt
/jobmitra/...
/homefix/...
/admin/...
```

### 10.2 Permission Check Rule

Backend must verify:

```txt
logged-in user
role
product access
resource ownership
requested action
```

### 10.3 Frontend Rule

Frontend route hiding is not enough.

Database access must be protected by backend permissions.

## 11. Future Split Rule

### 11.1 When To Split

Split into separate databases later if:

```txt
Job Mitra usage grows heavily
HomeFix Mitra usage grows heavily
performance becomes hard to manage
security separation requires it
cost optimization requires it
enterprise customers require stronger separation
```

### 11.2 Future Split Direction

Possible future structure:

```txt
jobmitra_database
homefix_database
admin_database
```

### 11.3 Migration-Friendly Rule

Keep product data clean now so future database split is possible later.

## 12. Backup and Migration Rule

### 12.1 Backup Rule

Database backup must be enabled before production.

### 12.2 Migration Rule

Before major schema changes or provider migration, take full backup.

### 12.3 Audit Preservation Rule

Audit logs must be preserved during backup and migration.

## 13. Approval Status

### 13.1 Current Status

```txt
Reviewed — infra rules locked (2026-07-04)
Application entity detail: HOSTING_BACKEND_DATABASE_/16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md
```

### 13.1.1 July 2026 alignment

This document was supplemented to align with:

- OWN-001..008 (`architecture-audits/30_DATA_OWNERSHIP_ENTERPRISE_AUDIT_v1.1.md`)
- Career V2 hire flow (`second-update/02_CAREER_OFFICIAL_HIRING_FLOW_V2.md`)
- Planner domain scope (`planner/02_PLANNER_DOMAIN_SCOPE_LOCK_v1.0.md`)

### 13.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 13.3 Lock Rule

This database separation document must be approved before creating production database tables, Prisma schema, backend API modules, or admin data access rules.
