# 15. Security Incident Response Plan

## 1. Final Decision

### 1.1 Purpose

This document explains what to do if a security issue, hacking attempt, data exposure, suspicious login, admin misuse, or production safety incident happens in Mitra Labs products.

### 1.2 Scope

This document covers:

```txt
Mitra Labs
Job Mitra
HomeFix Mitra
Admin portal
Backend server
Database
Storage/files
User accounts
Employer accounts
Employee accounts
Customer/provider accounts
Future products
```

### 1.3 Core Rule

Do not make random code changes during a security incident.

First:

```txt
Protect users
Collect evidence
Identify affected area
Stop the damage
Fix root cause
Verify
Document the incident
```

## 2. Security Incident Examples

### 2.1 Critical Security Incidents

Treat as critical if:

```txt
User can see another user's private data
Employer can see unrelated employee data
Admin page is visible inside public app
Private files become public
Wrong user role can access protected area
Database data is corrupted
Suspicious admin action happens
App login/session is misused
Large unknown traffic spike happens
Storage files are deleted or exposed
```

### 2.2 High-Risk Incidents

Treat as high-risk if:

```txt
Repeated failed login attempts
Suspicious employer account activity
Suspicious employee account activity
Unexpected database changes
Unexpected cost spike
Too many API requests
Unexpected file uploads
Backend logs show repeated errors
Admin audit logs show unknown action
```

### 2.3 Lower-Risk Incidents

Lower-risk issues include:

```txt
Small UI bug
Wrong wording
Single failed upload
One-time non-sensitive error
Minor page loading issue
```

Lower-risk issues can be handled through normal bug fixing.

## 3. First Response Checklist

### 3.1 Do Immediately

When a serious security issue is suspected:

```txt
1. Stop new feature work.
2. Do not delete data.
3. Do not randomly edit code.
4. Take screenshots if safe.
5. Record the time.
6. Identify affected product.
7. Identify affected user role.
8. Check whether private data is exposed.
9. Check whether admin access is affected.
10. Collect logs.
```

### 3.2 Do Not Do

Do not:

```txt
delete database records without backup
disable security checks to make the app work
share private user data in public chat
ignore repeated failed login attempts
hide the issue without fixing root cause
push untested emergency code
mix product data to fix quickly
```

## 4. Emergency Feature Disable Rule

### 4.1 When To Disable A Feature

Temporarily disable a feature if:

```txt
private data may be exposed
wrong role can access data
file upload is unsafe
admin action is unsafe
database writes are corrupting data
login/session behavior is broken
```

### 4.2 What Can Be Disabled

Depending on the issue, disable:

```txt
login
new registration
job apply
file upload
admin action
specific route
specific API endpoint
specific public button
```

### 4.3 Disable Safely

Disable only the affected feature.

Do not shut down the full app unless the whole system is unsafe.

## 5. Evidence Collection

### 5.1 Basic Evidence To Record

Record:

```txt
Incident date/time
Product affected
Page affected
User role affected
What action caused the issue
What the user saw
Screenshot/video if available
Error message
Affected account/user id if available
```

### 5.2 Technical Evidence To Collect

Collect:

```txt
Render backend logs
Supabase database logs
Supabase storage logs
Cloudflare deployment logs
Admin audit logs
Browser console errors
Network/API errors
Recent deployment details
Recent database migration details
```

### 5.3 Privacy Rule

When sharing evidence for support, remove or hide:

```txt
real phone numbers
email addresses
private documents
private images
passwords
API keys
database credentials
JWT/session tokens
```

## 6. Where To Check

### 6.1 Admin Portal

Check:

```txt
failed logins
admin login history
role changes
permission changes
user suspension logs
report actions
data deletion logs
suspicious activity alerts
```

### 6.2 Render

Check:

```txt
backend service status
server restart loop
API errors
deployment failure
unusual request traffic
environment variable mistakes
```

### 6.3 Supabase Database

Check:

```txt
database connection errors
unexpected table changes
large table growth
slow queries
backup status
row/data issues
```

### 6.4 Supabase Storage

Check:

```txt
file upload errors
public/private bucket settings
large unknown uploads
missing files
wrong file access
```

### 6.5 Cloudflare Pages

Check:

```txt
frontend deployment status
domain issue
SSL/HTTPS issue
wrong build deployed
old version cached
```

## 7. Incident Classification

### 7.1 Critical

Critical means user data, admin access, or core system safety is at risk.

Action:

```txt
disable affected feature
protect data
collect logs
fix immediately
verify before reopening
document incident
```

### 7.2 High

High means serious abuse or failure may happen but no confirmed data exposure yet.

Action:

```txt
investigate same day
check logs
prepare fix
monitor closely
```

### 7.3 Medium

Medium means feature failure, performance issue, or limited workflow issue.

Action:

```txt
fix in next controlled update
verify affected flow
```

### 7.4 Low

Low means minor issue with no security/data risk.

Action:

```txt
record and fix normally
```

## 8. Root Cause Process

### 8.1 Find The Source

Classify the source:

```txt
Frontend UI bug
Backend API bug
Database permission bug
Role/RBAC bug
Admin permission bug
Storage privacy bug
Hosting/deployment bug
User input validation bug
Abuse/rate limit issue
```

### 8.2 Ask These Questions

Ask:

```txt
Which user role triggered it?
Which data was affected?
Was private data visible?
Was data changed/deleted?
Was admin involved?
Was this after a recent deployment?
Was this after a database change?
Can it be repeated?
Does it affect all users or one user?
```

### 8.3 Confirm Before Fix

Do not fix until the likely source is identified.

If uncertain, stop and collect more evidence.

## 9. Fix Rules

### 9.1 Safe Fix Rules

Every fix must:

```txt
fix root cause
preserve user data
preserve product separation
preserve role separation
preserve audit logs
avoid new security holes
be tested before release
```

### 9.2 Unsafe Fixes

Never fix by:

```txt
removing backend permission checks
trusting frontend-only role checks
making private files public
deleting audit logs
hardcoding secrets
bypassing login/session checks
mixing product data
```

### 9.3 Database Fix Rule

Before database fixes:

```txt
take backup
know rollback plan
test query carefully
avoid bulk delete/update without review
document the change
```

## 10. Verification After Fix

### 10.1 Verify Affected Flow

After fix, test:

```txt
same user role
same page
same action
same data condition
related role access
admin audit log
database save/load
file privacy if applicable
```

### 10.2 Verify No New Damage

Check:

```txt
unrelated users cannot access data
unrelated employers cannot access data
admin permissions still correct
private files still private
backend logs clean
database logs clean
```

### 10.3 Reopen Rule

Only reopen the disabled feature after:

```txt
fix applied
tested locally/staging if possible
logs checked
affected flow verified
no new security risk found
```

## 11. Communication Rule

### 11.1 Internal Note

Write a simple internal note:

```txt
Incident:
Date/time:
Affected product:
Affected role:
Affected feature:
Risk level:
What happened:
What was protected:
Fix:
Verification:
Next prevention:
```

### 11.2 User Communication

If users are affected, communication must be:

```txt
honest
short
non-technical
not panic-causing
not blaming users
not revealing sensitive details
```

### 11.3 No Public Technical Details

Do not publicly share:

```txt
exploit details
database structure
admin routes
API secrets
security weakness details
private user evidence
```

## 12. Prevention Checklist

### 12.1 Backend Prevention

Build:

```txt
backend permission middleware
role checks
resource ownership checks
input validation
rate limits
safe error responses
secure sessions
password hashing
environment variables
audit logs
```

### 12.2 Database Prevention

Build:

```txt
product-separated tables
role-safe queries
indexes
backup plan
migration discipline
no direct public database control
```

### 12.3 Storage Prevention

Build:

```txt
private buckets for private files
file type validation
file size validation
owner checks
view permission checks
unused file cleanup later
```

### 12.4 Admin Prevention

Build:

```txt
Super Admin
Product Admin
Website Admin
Support/Moderator
role-specific permissions
admin audit logs
admin session expiry
future 2FA support if needed
```

## 13. Beginner Emergency Routine

### 13.1 If Something Looks Hacked

Do this:

```txt
1. Take screenshot.
2. Note time and page.
3. Do not delete anything.
4. Check Admin logs.
5. Check Render logs.
6. Check Supabase logs.
7. Check if private data is exposed.
8. Disable affected feature if needed.
9. Ask for expert fix with logs.
10. Verify after fix.
```

### 13.2 What To Send For Help

Send:

```txt
what happened
screenshot
page URL
affected role
affected feature
Render log excerpt
Supabase log excerpt
admin audit log excerpt
recent changes
```

Do not send:

```txt
passwords
API keys
database URL
JWT/session tokens
private documents
full private user data
```

## 14. Final Rule

### 14.1 Owner Responsibility

The app owner does not need to personally know all code.

But the owner must know:

```txt
where to check
what evidence to collect
when to stop a feature
when to ask for expert help
what not to touch
```

### 14.2 Expert Responsibility

Developer/security expert must:

```txt
find root cause
create safe fix
protect data
verify system
document incident
prevent repeat issue
```

### 14.3 Approval Status

Current status:

```txt
Draft
```

Review flow:

```txt
Draft -> Reviewed -> Approved -> Locked
```

Lock rule:

```txt
This security incident response plan must be approved before production backend/admin launch.
```
