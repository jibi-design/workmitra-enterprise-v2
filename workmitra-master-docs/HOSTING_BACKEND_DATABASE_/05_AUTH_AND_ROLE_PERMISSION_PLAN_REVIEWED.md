# 05. Auth and Role Permission Plan

## 1. Final Decision

### 1.1 Auth Ownership

Use real backend-owned authentication and role permissions.

### 1.2 Security Rule

Frontend role state is not security.

Backend must verify every protected action.

### 1.3 Implementation Rule

Authentication, sessions, roles, and permissions must be designed before backend/login implementation starts.

## 2. Recommended Login Start

### 2.1 Starting Login Method

Start with:

```txt
Email + password
```

### 2.2 Optional Future Login

Optional later:

```txt
Google login
```

### 2.3 Phone OTP Rule

Phone OTP should be added later only if budget, abuse controls, delivery handling, and fraud protection are ready.

Do not start with SMS OTP first.

### 2.4 Login Safety Rule

Login must not be fake/demo-only after backend starts.

All production login must be backend-verified.

## 3. Role Groups

### 3.1 Job Mitra Public Roles

Job Mitra roles:

```txt
Employee
Employer
```

### 3.2 HomeFix Mitra Public Roles

HomeFix Mitra roles:

```txt
Customer / Home Owner
Independent Technician
Shop Technician
Shop Owner
```

### 3.3 Admin Roles

Admin roles:

```txt
Super Admin
Product Admin
Website Admin
Support / Moderator
```

### 3.4 Future Role Rule

Future products may add new roles, but every role must be assigned to a product and permission boundary.

## 4. RBAC Permission Model

### 4.1 RBAC Meaning

RBAC means role-based access control.

A user can access only the actions and data allowed by their role.

### 4.2 Backend Permission Rule

Backend must check:

```txt
user identity
user role
product access
assigned permissions
requested action
target resource ownership
```

### 4.3 Product Permission Examples

Examples:

```txt
Employee cannot access employer-only APIs.
Employer cannot access admin-only APIs.
Job Mitra Admin cannot access HomeFix Mitra data unless permission exists.
Product Admin cannot change global Super Admin settings.
Website Admin cannot manage product users unless permission exists.
Support / Moderator cannot change roles or global settings.
```

### 4.4 Super Admin Rule

Super Admin can manage all products, websites, admins, permissions, reports, and audit logs.

### 4.5 Product Admin Rule

Product Admin can manage only the assigned product.

Examples:

```txt
Job Mitra Admin = Job Mitra only
HomeFix Mitra Admin = HomeFix Mitra only
```

### 4.6 Website Admin Rule

Website Admin can manage only assigned website content.

Examples:

```txt
Mitra Labs Website Admin = Mitra Labs website only
Job Mitra Website Admin = Job Mitra website only
HomeFix Mitra Website Admin = HomeFix Mitra website only
```

## 5. Token and Session Rule

### 5.1 Backend Session Responsibilities

Backend must handle:

```txt
login
logout
session expiry
role permission checks
secure password storage
admin session security
blocked/suspended user handling
```

### 5.2 Session Expiry

Sessions must expire after a defined time.

Expired sessions must require login again.

### 5.3 Admin Session Rule

Admin sessions must be stricter than normal user sessions.

Admin session rules should include:

```txt
shorter expiry if needed
role check on every admin API
session invalidation after role change
future 2FA support if needed
```

### 5.4 Role Change Rule

If a user's role or permission changes, old sessions should not keep old access forever.

Backend must refresh or re-check permissions.

## 6. Password and Account Security

### 6.1 Password Storage Rule

Passwords must never be stored as plain text.

Use secure password hashing.

### 6.2 Account Protection

Backend should support:

```txt
wrong password handling
blocked/suspended account handling
password reset flow later
email verification later if needed
rate limiting for login attempts
```

### 6.3 Secret Rule

Never hardcode auth secrets in frontend or backend code.

Use environment variables for:

```txt
JWT secret
session secret
database URL
email provider keys
OAuth secrets
admin secrets
```

## 7. Production Rule

### 7.1 Never Trust Frontend State

Never trust:

```txt
localStorage
frontend role selection
hidden buttons
frontend-only route guards
frontend-only admin checks
```

### 7.2 Backend Enforcement

Backend must enforce:

```txt
authentication
authorization
product access
role permissions
resource ownership
admin permissions
```

### 7.3 API Protection

Every protected API must check the logged-in user and permission before returning or changing data.

## 8. Data Access Rules

### 8.1 Job Mitra Access Rule

Employee and Employer data must stay separated.

Examples:

```txt
Employee can manage own profile and applications.
Employer can manage own posts and applicant review.
Employer cannot access unrelated employee private data.
Employee cannot access employer dashboard data.
```

### 8.2 HomeFix Mitra Access Rule

HomeFix roles must stay separated.

Examples:

```txt
Customer can access own properties/services/bills/complaints.
Independent Technician can access assigned service work only.
Shop Technician can access assigned shop work only.
Shop Owner can access own shop/provider records.
```

### 8.3 Admin Access Rule

Admin access must be product-scoped unless Super Admin.

## 9. Audit Logging Rule

### 9.1 Auth Audit Logs

The system should log important auth events:

```txt
login
logout
failed login attempt if needed
password reset request
role change
permission change
account suspension
admin login
admin logout
```

### 9.2 Admin Audit Logs

Admin actions must be logged with:

```txt
admin user
role
action type
product/app affected
target record
timestamp
IP/device information if available
```

### 9.3 Audit Protection

Audit logs must not be casually editable or deletable.

## 10. Play Store and Trust Safety

### 10.1 No Fake Login Claims

Do not show fake login, fake OTP, fake verification, or fake admin access in production.

### 10.2 Phone OTP Safety

Phone OTP must not be added unless:

```txt
SMS cost is planned
abuse control is planned
rate limit is ready
failed delivery handling is ready
privacy wording is ready
```

### 10.3 User Trust Rule

Users must understand clearly whether they are logged in, logged out, or using a local/demo-only flow.

## 11. Future Migration Rule

### 11.1 Provider Independence

Auth and permission logic should be designed so future migration remains possible.

### 11.2 Backend Ownership

Business permissions should live in Node.js backend logic, not only in provider-specific frontend/client behavior.

### 11.3 Future Google Cloud Path

Future migration path must remain possible:

```txt
Render -> Google Cloud Run
Supabase PostgreSQL -> Google Cloud SQL PostgreSQL
```

## 12. Approval Status

### 12.1 Current Status

```txt
Draft
```

### 12.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 12.3 Lock Rule

This auth and role permission plan must be approved before building backend login, admin login, protected APIs, role tables, or permission middleware.
