# 02. Domain and Brand Plan

> **LEGACY DOMAIN PLAN:** This document contains historical domain assumptions (`mitralabs.app`, `jobmitra.app`, `admin.mitralabs.app`, and related `.app` family names). For current canonical decisions, refer to [`../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md`](../architecture/MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2.md). Do not alter quoted historical values in downstream evidence that reference this plan.

## 1. Final Decision

### 1.1 Domain Strategy

Use separate public domains for company and product websites.

### 1.2 Admin Domain Strategy

Use one private admin subdomain under Mitra Labs.

### 1.3 Core Rule

Public websites and private admin must stay separated.

## 2. Recommended Domain Structure

### 2.1 Company Website

```txt
mitralabs.app
```

Purpose:

```txt
Mitra Labs company website
```

### 2.2 Job Mitra Website

```txt
jobmitra.app
```

Purpose:

```txt
Job Mitra product website
```

### 2.3 HomeFix Mitra Website

```txt
homefixmitra.app
```

Purpose:

```txt
HomeFix Mitra product website
```

### 2.4 Central Admin Portal

```txt
admin.mitralabs.app
```

Purpose:

```txt
Private central admin portal for Mitra Labs products, websites, users, reports, roles, permissions, and audit logs.
```

## 3. Domain Meaning

### 3.1 `mitralabs.app`

Company website.

Content:

```txt
Company information
Products
Services
Support
Policies
Links to Job Mitra and HomeFix Mitra
```

### 3.2 `jobmitra.app`

Job Mitra product website.

Content:

```txt
App landing page
Download link
Help/support
Privacy policy
Terms
```

### 3.3 `homefixmitra.app`

HomeFix Mitra product website.

Content:

```txt
App landing page
Download link
Help/support
Privacy policy
Terms
```

### 3.4 `admin.mitralabs.app`

Private central admin portal.

Used for:

```txt
Mitra Labs website admin
Job Mitra admin
HomeFix Mitra admin
Future product admin
Future website admin
User/report/moderation controls
Roles and permissions
Audit logs
Settings
```

## 4. Admin Domain Rule

### 4.1 Separate Domain Rule

Do not buy a separate domain for admin.

Correct:

```txt
admin.mitralabs.app
```

Wrong:

```txt
separateadminapp.com
```

### 4.2 Public Page Rule

Admin must not be treated like a normal public website page.

Wrong:

```txt
mitralabs.app/admin as a normal public website page
```

Correct:

```txt
admin.mitralabs.app
```

### 4.3 Future Admin Rule

Future products and future websites can also be managed inside the same central admin portal with separated permissions.

## 5. Premium Domain Rule

### 5.1 `.com` Availability Rule

If `.com` domains such as `mitralabs.com` or `jobmitra.com` are unavailable or listed as premium/resale domains, do not overpay unless the price is practical.

### 5.2 Preferred Alternatives

Preferred clean alternatives:

```txt
mitralabs.app
jobmitra.app
homefixmitra.app
```

### 5.3 Brand Name Rule

The company name should not be changed only because the `.com` domain is expensive.

## 6. Brand Rule

### 6.1 Correct Product Name

Correct product name:

```txt
Job Mitra
```

### 6.2 Incorrect Product Name

Do not use:

```txt
Mitra Jobs
```

### 6.3 Naming Consistency Rule

All documents, UI text, website content, backend modules, admin areas, and Play Store wording must use:

```txt
Job Mitra
```

## 7. Product and Website Separation Rule

### 7.1 Public Website Separation

Each public website should have its own clear purpose.

```txt
mitralabs.app = company
jobmitra.app = Job Mitra
homefixmitra.app = HomeFix Mitra
```

### 7.2 Admin Separation

Admin must be separate from all public websites.

```txt
admin.mitralabs.app = private admin portal
```

### 7.3 Future Product Rule

Future products may get their own public domains or subdomains, but their admin area should still connect to the central admin portal with separated permissions.

## 8. Approval Status

### 8.1 Current Status

```txt
Draft
```

### 8.2 Review Flow

```txt
Draft -> Reviewed -> Approved -> Locked
```

### 8.3 Lock Rule

This domain and brand plan must be approved before buying final domains, connecting hosting, or creating production admin routes.
