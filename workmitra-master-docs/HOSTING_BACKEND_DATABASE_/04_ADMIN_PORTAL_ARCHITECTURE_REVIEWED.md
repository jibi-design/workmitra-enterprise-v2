# 04. Admin Portal Architecture

> **LEGACY DOMAIN PLAN:** This document contains historical domain assumptions (`admin.mitralabs.app`). For current canonical decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md). Master Admin intended hostname: `admin.mitraaccesshub.com`. Job Mitra HashRouter `/admin/*` is **deprecated-candidate** — not final production architecture.

## 1. Final Decision

### 1.1 Central Admin Portal

Use one central admin portal:

```txt
admin.mitralabs.app
```

### 1.2 Separation Rule

Inside this one admin portal, every product, app, and website admin area must be clearly separated.

### 1.3 Public App Rule

Admin must not be inside any public mobile app.

## 2. Admin Portal Structure

### 2.1 Main Admin Portal

```txt
admin.mitralabs.app
```

### 2.2 Required Admin Areas

The admin portal must support:

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

### 2.3 Future Expansion Rule

Future products and future websites must be added under the same central admin portal with separated permissions.

## 3. Role Types

### 3.1 Super Admin

Super Admin can manage:

```txt
all products
all websites
all admins
all permissions
all reports
all audit logs
global settings
```

### 3.2 Product Admin

Product Admin can manage only the assigned product.

Examples:

```txt
Job Mitra Admin = Job Mitra only
HomeFix Mitra Admin = HomeFix Mitra only
```

### 3.3 Website Admin

Website Admin can manage only the assigned website content.

Examples:

```txt
Mitra Labs Website Admin = Mitra Labs website only
Job Mitra Website Admin = Job Mitra website only
HomeFix Mitra Website Admin = HomeFix Mitra website only
```

### 3.4 Support / Moderator

Support or Moderator can handle only assigned support/moderation tasks.

Examples:

```txt
reports
complaints
user issues
employer/provider review
content moderation
basic support actions
```

## 4. Product Permission Boundary

### 4.1 Assigned Access Rule

Each admin must see only the products and websites assigned to them.

Examples:

```txt
Job Mitra Admin = Job Mitra only
HomeFix Mitra Admin = HomeFix Mitra only
Mitra Labs Website Admin = Mitra Labs website only
Super Admin = all products and websites
```

### 4.2 Cross-Product Restriction

Product admins must not access unrelated product data unless Super Admin grants permission.

### 4.3 Backend Enforcement Rule

Permission boundaries must be enforced by backend APIs, not only by frontend route hiding.

## 5. Admin Login Security

### 5.1 Stronger Admin Login Rule

Admin login must be more secure than normal public app login.

Required rules:

```txt
secure password storage
session expiry
strong role check on every admin API
admin-only route protection
no admin access from public mobile apps
future 2FA support if needed
```

### 5.2 Backend Verification Rule

Admin access must be verified by the backend.

Frontend route guards alone are not enough.

### 5.3 Session Rule

Admin sessions must support:

```txt
login
logout
session expiry
permission refresh
blocked/suspended admin handling
```

## 6. Security Rule

### 6.1 Public App Restriction

Admin must not be inside:

```txt
Job Mitra public app
HomeFix Mitra public app
```

### 6.2 Correct Admin Location

Correct:

```txt
admin.mitralabs.app
```

### 6.3 Incorrect Admin Location

Wrong:

```txt
Job Mitra public app admin tab
HomeFix Mitra public app admin tab
normal public website page without admin security
```

## 7. Audit Rule

### 7.1 Mandatory Audit Logging

Every important admin action must be logged.

Audit logs should include:

```txt
admin user
admin role
action type
product/app affected
target record
timestamp
IP/device information if available
old value if needed
new value if needed
```

### 7.2 Required Logged Actions

The system must log:

```txt
admin login
admin logout
role changes
permission changes
user suspension
user deletion
employer/provider review
report action
data delete
settings change
important product/admin configuration changes
```

## 8. Audit Log Protection

### 8.1 Edit/Delete Restriction

Audit logs must not be casually editable or deletable.

### 8.2 Super Admin Access

Only Super Admin can access full audit logs.

### 8.3 Security Record Rule

Audit logs must be treated as security records, not normal editable content.

## 9. Data and Product Separation

### 9.1 Product Data Separation

Admin portal must preserve product data separation.

Never mix:

```txt
Job Mitra data
HomeFix Mitra data
Future product data
```

### 9.2 Website Admin Separation

Website admin access must stay separate from product app admin access.

Example:

```txt
Mitra Labs Website Admin cannot manage Job Mitra users unless separately granted permission.
```

### 9.3 Super Admin Override Rule

Only Super Admin can view or manage all products, websites, roles, permissions, and audit logs.

## 10. Approval Status

### 10.1 Current Status

```txt
Draft
```

### 10.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 10.3 Lock Rule

This admin portal architecture must be approved before building the admin frontend, admin backend APIs, admin roles, or admin database tables.
