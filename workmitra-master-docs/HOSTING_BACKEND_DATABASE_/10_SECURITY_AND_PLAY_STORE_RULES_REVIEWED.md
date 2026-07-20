# 10. Security and Play Store Safety Rules

## 1. Final Decision

### 1.1 Security Direction

All Mitra Labs apps must stay security-conscious, privacy-safe, and Play Store safe.

### 1.2 Public Trust Rule

The apps must not show features as real if the backend or real workflow does not exist.

### 1.3 Backend Ownership Rule

Security must be enforced by backend systems, not by frontend-only UI hiding.

## 2. No Fake Claims Rule

### 2.1 Fake Feature Ban

Do not show fake:

```txt
OTP
payment
notification
verification
AI ranking
interview scheduling
offer confirmation
employer confirmation
real-time messaging
cloud sync
admin action
```

unless the backend feature actually exists.

### 2.2 Backend Evidence Rule

A feature can be shown as real only when:

```txt
real backend exists
real data is saved
real permission check exists
real user action exists
failure handling exists
```

### 2.3 UI Wording Rule

If a feature is planned for later, use future-safe wording.

Do not make the user believe a future feature is active now.

## 3. Local / Demo Safety Rule

### 3.1 Local Feature Rule

If a feature is local-only, do not present it as cloud/backend behavior.

### 3.2 Phase-0 Rule

Phase-0/local/demo features must be honest.

Allowed wording:

```txt
saved on this device
local record
demo-safe
available in this app version only
```

Avoid wording like:

```txt
verified
secure cloud synced
real-time
officially approved
payment processed
```

unless the backend/system actually supports it.

## 4. Auth Security

### 4.1 Backend Auth Ownership

Backend must own:

```txt
user identity
roles
permissions
protected access
admin access
session checks
```

### 4.2 Frontend Role Warning

Frontend-only role checks are not enough.

Never trust:

```txt
localStorage
sessionStorage
frontend route guards
hidden buttons
selected role UI
```

### 4.3 Protected API Rule

Every protected API must check:

```txt
logged-in user
role
product access
resource ownership
requested action
```

## 5. Admin Security

### 5.1 Admin Separation Rule

Admin must be separate:

```txt
admin.mitralabs.app
```

### 5.2 Public App Restriction

Do not place admin inside:

```txt
Job Mitra public app
HomeFix Mitra public app
public product websites
normal public website routes
```

### 5.3 Admin Session Rule

Admin access must require stronger backend verification than public app access.

Admin system must support:

```txt
secure login
session expiry
role checks
permission checks
audit logs
blocked/suspended admin handling
future 2FA support if needed
```

## 6. Data Privacy

### 6.1 Protected Data

User data must be separated and protected.

Important data includes:

```txt
profile data
job applications
employer data
employee data
service records
bill records
complaint records
provider records
admin logs
uploaded files
```

### 6.2 Product Data Separation

Never mix:

```txt
Job Mitra data
HomeFix Mitra data
future product data
```

### 6.3 Role Data Separation

Never expose:

```txt
employee private data to unrelated employers
customer service data to unrelated providers
admin data to public users
product data to unassigned product admins
```

## 7. Audit Logs

### 7.1 Mandatory Admin Audit Logs

Every important admin action should be logged.

### 7.2 Audit Log Fields

Audit logs should include:

```txt
admin/user id
role
action type
product/app affected
target record
timestamp
IP/device information if available
old value if needed
new value if needed
```

### 7.3 Required Logged Actions

Log important actions such as:

```txt
admin login
admin logout
role change
permission change
user suspension
user deletion
report action
employer/provider review
data delete
settings change
important product/admin configuration change
```

### 7.4 Audit Protection

Audit logs must not be casually editable or deletable.

## 8. Public App Safety

### 8.1 Hidden / Future Domain Rule

Public apps must not expose:

```txt
Admin controls
Future hidden domains
Full HR system unless approved
Manager Console unless approved
Admin routes/cards/buttons
Unfinished backend-dependent workflows
```

### 8.2 Launch Boundary Rule

Before Play Store upload or production update, run a launch-boundary check.

Check that hidden/future domains are not visible unless explicitly approved.

### 8.3 Misleading UI Rule

Do not display clickable cards or active buttons for unavailable production features unless clearly marked as future/disabled.

## 9. Role Mixing Risk

### 9.1 Job Mitra Role Rule

Never allow:

```txt
Employee to access employer-only data
Employer to access unrelated employee private data
Employee flow and Employer flow to mix
Career Jobs and Shift Jobs to mix
```

### 9.2 Product Admin Rule

Never allow:

```txt
Job Mitra admin to access HomeFix Mitra data unless permission exists
HomeFix Mitra admin to access Job Mitra data unless permission exists
Product admin to access unassigned product data
```

### 9.3 HomeFix Mitra Role Rule

Never mix:

```txt
Customer / Home Owner
Independent Technician
Shop Technician
Shop Owner
```

Each role must have separated permissions and data access.

## 10. Storage and File Security

### 10.1 File Storage Rule

Files and images must be stored in proper storage, not directly inside database rows.

### 10.2 Private File Rule

Private files must not be public by default.

Examples:

```txt
profile images
documents
bill images
service photos
proof files
complaint photos
future attachments
```

### 10.3 Upload Validation Rule

Backend should validate:

```txt
file type
file size
file owner
product/app context
permission to upload
permission to view
```

## 11. API Security

### 11.1 Input Validation Rule

Backend must validate input for all important APIs.

Do not trust frontend validation alone.

### 11.2 Rate Limit Rule

Sensitive APIs should have rate limits.

Important areas:

```txt
login
signup
password reset
OTP later
file upload
search
admin actions
reports/complaints
```

### 11.3 Error Handling Rule

API errors must not expose secrets, database details, stack traces, or internal admin information to public users.

## 12. Play Store Safety

### 12.1 Misleading Claims Rule

Avoid wording that creates misleading claims.

Do not claim:

```txt
verified employer
verified technician
real payment
real notification
secure cloud sync
official approval
AI matching
background checks
```

unless real backend/process exists.

### 12.2 Payment Safety Rule

Do not present payment, wallet, escrow, banking, salary transfer, or money movement features unless the real payment/legal architecture exists.

Payment-related areas should be record-keeping only unless approved.

### 12.3 Communication Safety Rule

Do not claim real messaging/notification unless backend delivery exists.

### 12.4 Review Before Release

Before any Play Store update, review:

```txt
app UI wording
store listing wording
screenshots
privacy policy
permissions
visible hidden/future domains
admin exposure
fake backend-dependent claims
```

## 13. Security Review Checklist

### 13.1 Before Backend Launch

Check:

```txt
auth model
role model
permission middleware
database separation
admin separation
audit logs
storage permissions
API validation
rate limits
environment variables
backup plan
```

### 13.2 Before Production Release

Check:

```txt
no fake claims
no hidden admin access
no mixed roles
no exposed future domains
no public private files
no hardcoded secrets
no frontend-only security
```

## 14. Approval Status

### 14.1 Current Status

```txt
Draft
```

### 14.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 14.3 Lock Rule

This security and Play Store safety document must be approved before backend launch, admin launch, Play Store update, or production deployment.
