# 03. Hosting, Backend, and Database Plan

> **LEGACY DOMAIN PLAN:** This document contains historical domain assumptions (including `jobmitra.app`, `mitralabs.app`, and `admin.mitralabs.app` in hosting tables). For current canonical decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md). Infrastructure stack guidance (Cloudflare Pages, Render, Supabase) may remain valid; domain rows are superseded.

## 1. Final Decision

### 1.1 Starting Architecture

Start with a professional but manageable architecture:

```txt
Frontend: Cloudflare Pages
Backend: Node.js + TypeScript
Backend hosting: Render
Database: Supabase PostgreSQL
Storage: Supabase Storage
```

### 1.2 Core Rule

The system must be easy to start now and still allow future migration to Google Cloud.

## 2. Simple Architecture

### 2.1 Request Flow

```txt
User opens website/app
        ↓
Frontend loads from Cloudflare Pages
        ↓
Frontend calls Node.js backend API
        ↓
Node.js backend runs on Render
        ↓
Backend reads/writes PostgreSQL database
        ↓
Database is hosted on Supabase
```

### 2.2 Main Separation Rule

Frontend, backend, database, and storage must stay separated by responsibility.

```txt
Frontend = user interface
Backend = business logic and API
Database = structured data
Storage = files and images
```

## 3. What Each Part Means

### 3.1 Node.js

Node.js is the backend code technology.

It is used to write APIs and backend logic.

Node.js is a free technology.

The backend handles:

```txt
authentication
business rules
role permissions
API logic
database access
admin actions
audit logging
```

### 3.2 Render

Render is backend server hosting.

Render runs the Node.js backend online.

Production use normally needs a paid server plan.

Render can be upgraded as users grow.

### 3.3 Supabase PostgreSQL

Supabase PostgreSQL is database hosting.

It stores structured app data, such as:

```txt
users
profiles
jobs
applications
workspaces
ratings
services
bills
complaints
admin users
audit logs
```

A free plan can be used for early development/testing.

A paid plan is recommended for serious production use.

### 3.4 Supabase Storage

Supabase Storage is used for files and images.

It should be used separately from database tables.

## 4. Recommended Setup

### 4.1 Frontend Hosting

Use Cloudflare Pages for:

```txt
Mitra Labs website frontend
Job Mitra frontend
HomeFix Mitra frontend
Admin portal frontend
```

### 4.1.1 Mobile app (Play Store) vs website

**Important separation:**

| Surface                  | Hosting                  | Notes                                                   |
| ------------------------ | ------------------------ | ------------------------------------------------------- |
| **Public websites**      | Cloudflare Pages         | `jobmitra.app`, `mitralabs.app` landing, help, policies |
| **Play Store / APK app** | **Not** Cloudflare Pages | Built binary (e.g. Capacitor wrapper); calls Render API |
| **Admin portal**         | Cloudflare Pages         | `admin.mitralabs.app` — private, not inside mobile app  |

The mobile app is a **client** that talks to the Node.js API on Render. Website hosting and app distribution are different channels.

### 4.2 Backend Hosting

Use Render for:

```txt
Node.js backend API
```

### 4.3 Database Hosting

Use Supabase PostgreSQL for:

```txt
main PostgreSQL database
```

### 4.4 Storage Hosting

Use Supabase Storage for:

```txt
profile images
documents
bill images
service photos
proof files
future attachments
```

## 5. Storage Plan

### 5.1 Storage Rule

Files and images should not be stored directly inside database rows.

The database should store only:

```txt
file URL/path
file metadata
file owner
file type
created date
permission reference
```

### 5.2 File Types

Use storage for:

```txt
profile images
documents
bill images
service photos
proof files
future attachments
```

### 5.3 Storage Security

Private user files must not be public by default.

Backend must validate:

```txt
file type
file size
user permission
product ownership
upload source
```

## 6. Backup and Secret Rules

### 6.1 Backup Rule

Production setup must include database backup.

Backup is required before:

```txt
major backend migration
database schema change
provider migration
production release update
admin system change
```

### 6.2 Secret Rule

Never hardcode secrets inside frontend or backend code.

Do not hardcode:

```txt
database URL
API keys
JWT secret
admin secret
storage keys
email provider keys
payment keys
```

Use environment variables for secrets.

### 6.3 Environment Rule

Each environment must have separate settings:

```txt
development
staging
production
```

Production credentials must not be used in development.

## 7. Provider Lock Rule

### 7.1 Backend Portability

Backend code should be standard Node.js + TypeScript.

Avoid writing backend code that depends too heavily on Render-specific behavior.

### 7.2 Database Portability

Database design should follow standard PostgreSQL patterns.

Avoid unnecessary provider lock-in.

### 7.3 Migration-Friendly Rule

Use Prisma ORM if possible to keep database schema and migration history clean.

## 8. Future Upgrade Path

### 8.1 Backend Upgrade

Future backend upgrade path:

```txt
Render -> Google Cloud Run
```

### 8.2 Database Upgrade

Future database upgrade path:

```txt
Supabase PostgreSQL -> Google Cloud SQL PostgreSQL
```

### 8.3 Storage Upgrade

Future storage upgrade path:

```txt
Supabase Storage -> Google Cloud Storage
```

### 8.4 Migration Reason

Migration is possible because both Supabase PostgreSQL and Google Cloud SQL PostgreSQL use PostgreSQL.

## 9. Cost Understanding

### 9.1 Node.js Cost

Node.js is free.

### 9.2 Render Cost

Render is backend server hosting.

Production backend hosting can have monthly cost.

### 9.3 Supabase Cost

Supabase PostgreSQL and Storage can start with free/low-cost plans.

Production use may need paid plan.

### 9.4 Early Cost Planning

Early production budget should expect:

```txt
Approx $30-$60/month
```

Actual cost depends on:

```txt
users
API traffic
database usage
file uploads
search activity
storage size
admin activity
```

## 10. Scaling Rule

### 10.1 Highest Usage Risk

For Job Mitra, the highest backend/database load will likely come from:

```txt
employee job search
job list loading
job detail opening
applications
employer applicant review
notifications later
```

### 10.2 Scaling Steps

Start with:

```txt
Cloudflare Pages + Render + Supabase PostgreSQL
```

Then upgrade:

```txt
Render plan
Supabase plan
query performance
pagination
caching
monitoring
```

Later, if needed:

```txt
Google Cloud Run + Google Cloud SQL PostgreSQL
```

## 11. Approval Status

### 11.1 Current Status

```txt
Reviewed — infra locked (2026-07-04)
```

### 11.1.1 Mobile vs web

See §4.1.1 — Play Store app is separate from Cloudflare Pages website hosting.

### 11.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 11.3 Lock Rule

This hosting, backend, and database plan must be approved before backend hosting, database setup, storage setup, or production environment configuration starts.
