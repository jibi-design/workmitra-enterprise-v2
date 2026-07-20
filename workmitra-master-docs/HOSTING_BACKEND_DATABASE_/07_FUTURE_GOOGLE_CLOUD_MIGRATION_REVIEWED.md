# 07. Future Google Cloud Migration Plan

## 1. Final Decision

### 1.1 Starting Platform

Start with:

```txt
Backend: Node.js + TypeScript on Render
Database: Supabase PostgreSQL
Storage: Supabase Storage
Frontend: Cloudflare Pages
```

### 1.2 Future Platform

Future migration to Google Cloud must remain possible.

Future target:

```txt
Backend: Google Cloud Run
Database: Google Cloud SQL PostgreSQL
Storage: Google Cloud Storage
Secrets: Google Secret Manager
```

### 1.3 Core Rule

Build the system now as if future migration will happen later.

## 2. Current Architecture

### 2.1 Backend

Current backend plan:

```txt
Node.js + TypeScript on Render
```

### 2.2 Database

Current database plan:

```txt
Supabase PostgreSQL
```

### 2.3 Storage

Current storage plan:

```txt
Supabase Storage
```

### 2.4 Frontend

Current frontend hosting plan:

```txt
Cloudflare Pages
```

## 3. Future Google Cloud Architecture

### 3.1 Backend

Future backend target:

```txt
Node.js + TypeScript on Google Cloud Run
```

### 3.2 Database

Future database target:

```txt
Google Cloud SQL PostgreSQL
```

### 3.3 Storage

Future storage target:

```txt
Google Cloud Storage
```

### 3.4 Secrets

Future secrets target:

```txt
Google Secret Manager
```

### 3.5 Optional Future Monitoring

Future production monitoring can include:

```txt
Google Cloud Logging
Google Cloud Monitoring
Error reporting
Billing alerts
```

## 4. Why Migration Is Possible

### 4.1 Database Compatibility

Supabase PostgreSQL and Google Cloud SQL PostgreSQL are both PostgreSQL-based.

This makes future database migration possible.

### 4.2 Backend Portability

Node.js + TypeScript backend can run on Render first and Google Cloud Run later if it is written without provider lock-in.

### 4.3 Storage Migration

Supabase Storage files can later be moved to Google Cloud Storage if file paths and metadata are stored cleanly.

## 5. Rules To Keep Migration Easy

### 5.1 Backend Rules

Use:

```txt
standard Node.js
TypeScript
clean API structure
environment variables
portable deployment configuration
```

Avoid:

```txt
Render-specific business logic
provider-specific hardcoded URLs
secrets inside code
frontend-owned business rules
```

### 5.2 Database Rules

Use:

```txt
PostgreSQL standard schema
Prisma ORM if possible
clean migration files
product-separated tables
clear indexes
foreign keys where needed
```

Avoid:

```txt
messy schema
mixed product tables
frontend direct database control
undocumented provider-specific database features
```

### 5.3 Storage Rules

Use proper storage for files and images.

Database should store only:

```txt
file path
file URL if needed
file owner
product/app
permission reference
metadata
```

Do not store actual files directly inside database rows.

### 5.4 Permission Rules

Keep permissions in backend logic.

Backend must verify:

```txt
user identity
role
product access
resource ownership
admin permission
```

## 6. Migration Risks

### 6.1 High-Risk Patterns

Migration becomes harder if:

```txt
frontend directly depends on Supabase database calls
Supabase-specific auth is deeply used without abstraction
Supabase realtime/storage is heavily used without documentation
database schema is messy
product data is mixed
permissions are not designed early
files are stored incorrectly
business logic is in frontend
```

### 6.2 Admin Risk

Migration becomes risky if admin audit logs, permissions, and product boundaries are not clean.

### 6.3 Cost Risk

Google Cloud can become costly if billing alerts, budgets, and resource limits are not configured.

## 7. Migration Readiness Checklist

### 7.1 Before Migration

Before moving to Google Cloud, confirm:

```txt
database backup exists
schema is clean
Prisma migrations are updated
environment variables are documented
admin audit logs are preserved
file storage paths are exportable
backend APIs are portable
role permissions are backend-enforced
```

### 7.2 During Migration

During migration:

```txt
take full backup
export database
move files/storage if needed
deploy backend to Google Cloud Run
connect backend to Google Cloud SQL
test admin portal
test Job Mitra
test HomeFix Mitra
verify permissions
verify audit logs
```

### 7.3 After Migration

After migration:

```txt
monitor errors
monitor cost
verify backups
verify login/session
verify admin permissions
verify product separation
verify performance
```

## 8. When To Migrate

### 8.1 Do Not Migrate Too Early

Do not move to Google Cloud only for branding or prestige.

Move when there is a real reason.

### 8.2 Good Reasons To Migrate

Migrate when:

```txt
user traffic grows heavily
Render/Supabase limits become restrictive
enterprise security needs increase
cost optimization requires stronger control
large database performance tuning is needed
admin/reporting workload grows
Google Cloud services become necessary
```

### 8.3 Current Recommendation

Start with Render + Supabase PostgreSQL.

Move to Google Cloud later only when scale, cost, security, or operations justify it.

## 9. Future Target Architecture

### 9.1 Target Flow

```txt
Frontend on Cloudflare Pages
        ↓
Node.js backend on Google Cloud Run
        ↓
Google Cloud SQL PostgreSQL
        ↓
Google Cloud Storage for files
        ↓
Google Secret Manager for secrets
```

### 9.2 Admin Target

```txt
admin.mitralabs.app
        ↓
Google Cloud Run backend
        ↓
Google Cloud SQL PostgreSQL
        ↓
Audit logs and permissions preserved
```

## 10. Final Migration Rule

### 10.1 Build Now For Later

Build current backend/database as if it may move later.

### 10.2 No Provider Lock-In Rule

Do not depend too deeply on Render, Supabase, or Google-specific behavior unless documented and approved.

### 10.3 Source of Truth Rule

The backend and database architecture documents must be updated before any real migration starts.

## 11. Approval Status

### 11.1 Current Status

```txt
Draft
```

### 11.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 11.3 Lock Rule

This future migration plan must be approved before making production architecture decisions that could block Google Cloud migration later.
