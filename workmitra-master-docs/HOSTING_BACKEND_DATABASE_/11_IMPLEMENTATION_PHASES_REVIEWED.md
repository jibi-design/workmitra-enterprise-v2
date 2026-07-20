# 11. Implementation Phases

## 1. Final Decision

### 1.1 Architecture-First Rule

Do not start backend, login, database, admin, or production migration coding randomly.

Architecture documents must be reviewed and approved first.

### 1.2 Implementation Rule

Implementation must follow approved documents only.

### 1.3 No Shortcut Rule

Do not build temporary backend structures that will create rework later.

## 2. Phase 1 — Document Lock

### 2.1 Required Documents

Before backend implementation starts, approve and lock:

```txt
Domain and brand plan
Hosting, backend, and database plan
Admin portal architecture
Auth and role permission plan
Database separation rules
Future Google Cloud migration plan
Cost and scaling plan
Product UI standard
Security and Play Store safety rules
Backend foundation master document
16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md (application layer — chapters after TOC approval)
```

### 2.1.1 Enterprise gates (Job Mitra — must pass before Phase 2 coding)

In addition to this folder’s docs, **all** must be true (per `EXECUTIVE_MASTER_DECISION_DOCUMENT_v1.1.md` §9 + §9A):

```txt
☑ OWN-001..008 approved (Data Ownership v1.1 PASS)
☑ Career V2 Official Hiring Flow approved
☐ Backend Architecture doc 16 — TOC approved, then all chapters approved
☐ Executive Constitution sign-off (Documentation Phase COMPLETE)
☐ Decision Maker sign-off for backend phase start
```

**Phase-0 note:** App today uses `localStorage` + `roleStorage` role pick. Migration to server is **Phase 2+** per doc 16 Chapter 19 — not before gates above.

### 2.2 Document Review Rule

Each document must move through:

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 2.3 Lock Rule

No backend/login/database implementation should start until required documents are approved **and** §2.1.1 enterprise gates are met.

## 3. Phase 2 — Backend Foundation

### 3.1 Backend Stack

Build:

```txt
Node.js
TypeScript
API structure
environment configuration
error handling
logging foundation
health check endpoint
Render deployment setup
```

### 3.2 Backend Structure Rule

Backend must be modular and product-separated.

Suggested high-level modules:

```txt
auth
users
jobmitra
homefix
admin
audit
storage
notifications later
```

### 3.3 Backend Ownership Rule

Backend must own:

```txt
business rules
auth/session checks
role permissions
database access
admin actions
audit logging
```

## 4. Phase 3 — Database Foundation

### 4.1 Database Stack

Build:

```txt
PostgreSQL schema
Prisma setup
database migrations
seed strategy
product-separated tables
admin tables
audit log tables
```

### 4.2 Database Provider

Initial provider:

```txt
Supabase PostgreSQL
```

### 4.3 Database Separation Rule

Database must separate:

```txt
Job Mitra data
HomeFix Mitra data
Admin data
Website/admin content data
Audit logs
```

### 4.4 Backup Rule

Database backup plan must exist before production use.

## 5. Phase 4 — Auth and Login

### 5.1 Starting Auth

Build:

```txt
email + password registration
login
logout
session/token handling
session expiry
secure password storage
blocked/suspended user handling
```

### 5.2 Role Ownership

Build role ownership for:

```txt
Employee
Employer
Customer / Home Owner
Independent Technician
Shop Technician
Shop Owner
Super Admin
Product Admin
Website Admin
Support / Moderator
```

### 5.3 Protected API Middleware

Build backend middleware for:

```txt
logged-in user check
role check
product access check
resource ownership check
admin permission check
```

### 5.4 OTP Rule

Do not start with SMS OTP.

Phone OTP should be added later only when cost, abuse control, and delivery failure handling are ready.

## 6. Phase 5 — Job Mitra Migration

### 6.1 Job Mitra Profile Migration

Migrate:

```txt
employee profile
employer profile
role ownership
user identity connection
```

### 6.2 Career Jobs Migration

Migrate:

```txt
Career Jobs
Career applications
Career applicant review
Career offers
Career hired employee workspaces
Career ratings later
```

### 6.3 Shift Jobs Migration

Migrate:

```txt
Shift Jobs
Shift applications
selection/waiting list
shift groups/workspaces
shift status
temporary work records
```

### 6.4 Job Mitra Boundary Rule

Never mix:

```txt
Employee and Employer flows
Career Jobs and Shift Jobs
Career workspace and HR Management
Admin and public app
```

## 7. Phase 6 — HomeFix Mitra Migration

### 7.1 Customer Side Migration

Migrate:

```txt
customers
properties
appliances
services
bills
complaints
```

### 7.2 Provider Side Migration

Migrate:

```txt
Independent Technician
Shop Technician
Shop Owner
provider/service assignment
provider response flows
```

### 7.3 HomeFix Boundary Rule

Never mix:

```txt
Customer / Home Owner
Independent Technician
Shop Technician
Shop Owner
```

### 7.4 Complaint Link Rule

Complaint records must stay linked to the correct service, bill, and provider context.

## 8. Phase 7 — Storage and File Handling

### 8.1 Storage Setup

Build storage handling for:

```txt
profile images
documents
bill images
service photos
proof files
complaint photos
future attachments
```

### 8.2 Storage Rule

Files must be stored in storage, not directly inside database rows.

Database stores:

```txt
file path
file owner
file type
product/app context
permission reference
metadata
```

### 8.3 Storage Security

Backend must validate:

```txt
file type
file size
file ownership
permission to upload
permission to view
```

## 9. Phase 8 — Admin Portal

### 9.1 Admin Portal Frontend

Build:

```txt
admin.mitralabs.app frontend
Super Admin Dashboard
Mitra Labs Website Admin
Job Mitra Admin
HomeFix Mitra Admin
Future Product Admin structure
```

### 9.2 Admin Backend

Build:

```txt
admin login
admin role permissions
admin user management
product-scoped admin access
website admin access
support/moderator access
```

### 9.3 Admin Audit Logs

Build audit logs for:

```txt
admin login/logout
role changes
permission changes
user suspension
report action
data deletion
settings changes
important admin actions
```

### 9.4 Admin Boundary Rule

Admin must not be inside public mobile apps.

## 10. Phase 9 — API Hardening

### 10.1 API Validation

Add:

```txt
input validation
request body validation
query parameter validation
file upload validation
permission validation
```

### 10.2 API Protection

Add:

```txt
rate limits
safe error handling
no secret leakage
pagination
result limits
search optimization
```

### 10.3 API Performance

Optimize:

```txt
job search
job listing
job details
applications
employer applicant review
HomeFix service/bill/complaint lists
admin reports
```

## 11. Phase 10 — Production Hardening

### 11.1 Monitoring

Add:

```txt
backend logging
API error monitoring
database query monitoring
failed login monitoring
storage upload failure monitoring
```

### 11.2 Alerts

Add alerts for:

```txt
backend downtime
database connection failure
high error rate
unusual traffic spike
unexpected billing increase
```

### 11.3 Backup

Add:

```txt
database backup
audit log preservation
environment configuration backup
migration backup process
```

## 12. Phase 11 — Play Store and Public Release Safety

### 12.1 UI Wording Review

Review:

```txt
no fake OTP claims
no fake payment claims
no fake notification claims
no fake verification claims
no fake AI/interview/offer claims
no unavailable future domain exposure
```

### 12.2 Public App Boundary Review

Check:

```txt
admin not visible
future HR/Manager/Admin routes hidden unless approved
public app role separation correct
Career/Shift boundaries correct
HomeFix role boundaries correct
```

### 12.3 Store Listing Review

Review:

```txt
screenshots
feature descriptions
privacy policy
terms
support links
data safety wording
```

## 13. Phase 12 — Future Google Cloud Migration Preparation

### 13.1 Migration-Ready Build Rule

Build current system so it can later move from:

```txt
Render -> Google Cloud Run
Supabase PostgreSQL -> Google Cloud SQL PostgreSQL
Supabase Storage -> Google Cloud Storage
```

### 13.2 Migration Checklist

Keep ready:

```txt
database backups
Prisma migrations
environment variable documentation
storage export plan
audit log preservation plan
portable backend deployment
```

### 13.3 Migration Timing Rule

Do not migrate to Google Cloud too early.

Migrate only when scale, cost, security, or operations justify it.

## 14. Implementation Order Summary

### 14.1 Recommended Order

Implementation order:

```txt
1. Document lock
2. Backend foundation
3. Database foundation
4. Auth/login
5. Job Mitra migration
6. HomeFix Mitra migration
7. Storage/file handling
8. Admin portal
9. API hardening
10. Production hardening
11. Play Store/public release safety
12. Future Google Cloud migration preparation
```

### 14.2 Stop Rule

Stop implementation if:

```txt
role boundary is unclear
data ownership is unclear
admin permission is unclear
backend security depends only on frontend
feature wording creates fake claims
database schema mixes products
migration risk is not documented
```

## 15. Approval Status

### 15.1 Current Status

```txt
Reviewed — phases aligned with Executive §9 gates (2026-07-04)
```

### 15.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 15.3 Lock Rule

This implementation phase plan must be approved before backend, database, auth, admin, storage, or production implementation begins.
