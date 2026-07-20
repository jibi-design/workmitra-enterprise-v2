# 01. Mitra Labs Master Truth

> **LEGACY DOMAIN PLAN:** Some linked hosting documents contain historical domain assumptions (`*.mitralabs.app`, `jobmitra.app`). For current canonical brand and domain decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md).

## 1. Final Decision

### 1.1 Parent Company / Brand

Mitra Labs is the parent company and parent brand.

### 1.2 Product Structure

Job Mitra and HomeFix Mitra are separate products under Mitra Labs.

### 1.3 Master Rule

All products, websites, admin systems, backend modules, data, roles, and permissions must follow the Mitra Labs master architecture.

## 2. Product Structure

### 2.1 Parent Brand

```txt
Mitra Labs
```

### 2.2 Current Products

```txt
Job Mitra
HomeFix Mitra
```

### 2.3 Future Products and Services

Future Mitra Labs products and services may include:

```txt
Future apps
Future websites
Software development services
Website development services
Graphic design services
Video editing services
Digital/creative services
```

### 2.4 Product Separation Rule

Each product must remain separated by:

```txt
data
role
permission
UI flow
backend module
admin control
storage boundary
audit logs
```

## 3. Current Product Priority

### 3.1 Priority Order

Current product priority:

```txt
1. Job Mitra
2. HomeFix Mitra
3. Mitra Labs website
4. Central admin portal
```

### 3.2 Priority Rule

Backend, database, admin, and website planning must first support Job Mitra and HomeFix Mitra correctly before adding future products.

## 4. Backend Direction

### 4.1 Backend Technology

Use:

```txt
Node.js + TypeScript
```

### 4.2 Backend Purpose

The backend must handle:

```txt
authentication
role permissions
API logic
business rules
database access
admin actions
audit logging
product separation
future migration readiness
```

### 4.3 Backend Rule

Business rules must be controlled by the backend, not by frontend-only logic.

## 5. Database Direction

### 5.1 Database Type

Use:

```txt
PostgreSQL
```

### 5.2 Initial Database Provider

Initial provider:

```txt
Supabase PostgreSQL
```

### 5.3 Future Database Provider

Future provider if scale grows:

```txt
Google Cloud SQL PostgreSQL
```

### 5.4 Database Rule

One database can be used at the beginning, but Job Mitra and HomeFix Mitra data must never mix.

## 6. Admin Direction

### 6.1 Central Admin Portal

Admin must not be inside the public mobile apps.

Use one central admin portal:

```txt
admin.mitralabs.app
```

### 6.2 Required Admin Roles

The admin portal must support:

```txt
Super Admin
Product Admin
Website Admin
Support / Moderator
```

### 6.3 Super Admin Rule

Super Admin can manage:

```txt
all Mitra Labs products
all websites
all admins
all permissions
all reports
all audit logs
global settings
```

### 6.4 Product Admin Rule

Product Admin can manage only the assigned product.

Examples:

```txt
Job Mitra Admin = Job Mitra only
HomeFix Mitra Admin = HomeFix Mitra only
```

### 6.5 Website Admin Rule

Website Admin can manage only the assigned website content.

Examples:

```txt
Mitra Labs Website Admin = Mitra Labs website only
Job Mitra Website Admin = Job Mitra website only
HomeFix Mitra Website Admin = HomeFix Mitra website only
```

### 6.6 Future Admin Rule

Future products and future websites must also be added under the same central admin portal with separate permissions.

## 7. Important Separation Rules

### 7.1 Product Data Separation

Never mix:

```txt
Job Mitra and HomeFix Mitra data
```

### 7.2 Role Flow Separation

Never mix:

```txt
Employee and Employer flows
```

### 7.3 Job Domain Separation

Never mix:

```txt
Career Jobs and Shift Jobs
```

### 7.4 Workspace Separation

Never mix:

```txt
Career workspace and HR Management
```

Career workspace means:

```txt
Career Job വഴി hire ചെയ്ത employee-യുടെ ongoing work record area.
```

Career workspace is not:

```txt
HR Management
Payroll
Shift Job group
Admin system
```

### 7.5 Public App and Admin Separation

Never mix:

```txt
Public app and Admin portal
Admin system and user-facing product apps
```

## 8. Security and Implementation Rule

### 8.1 Backend Security Rule

Frontend role state is not security.

Backend must verify:

```txt
user identity
role
permission
product access
admin access
protected API access
```

### 8.2 Admin Security Rule

Admin permissions must be enforced by backend APIs, not only by frontend route hiding.

### 8.3 Future Migration Rule

The system must be built so that future migration is possible:

```txt
Render -> Google Cloud Run
Supabase PostgreSQL -> Google Cloud SQL PostgreSQL
```

## 9. Approval Status

### 9.1 Current Status

```txt
Draft
```

### 9.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 9.3 Lock Rule

This master truth document must be approved before backend, login, database, admin, or product migration implementation starts.
