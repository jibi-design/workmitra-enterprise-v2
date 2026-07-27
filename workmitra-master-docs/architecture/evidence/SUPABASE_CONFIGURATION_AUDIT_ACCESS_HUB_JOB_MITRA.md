# Supabase Configuration Audit Report

## Mithra Access Hub / Job Mitra

> **Archive note (2026-07-25):** Operator-provided audit. Stored for Phase 2.1 / homepage-decouple readiness.  
> **No SQL migrations or destructive cleanup authorized by this archive alone.**  
> **Awaiting:** Cloudflare Pages verification report (follow-up).

Status: NEEDS DASHBOARD VERIFICATION BEFORE FINAL CLOSURE  
Project: jobmitra-enterprise-v2-dev  
Production deployment: NOT APPROVED  
Supabase intended role going forward: Backend PostgreSQL Database + Auth/session API support only  
Frontend/homepage target: Cloudflare Pages

---

## 1. Static Homepage / HTML / Assets in Supabase Storage

### Current verified finding

No evidence was found that we hosted or uploaded any static homepage files into Supabase Storage.

### Not found in available repo/audit evidence

- No `index.html` homepage file in Supabase Storage
- No `landing.html`
- No Access Hub static build files
- No Job Mitra homepage static build files
- No `dist/` or `build/` uploaded to Supabase Storage
- No runtime usage of `storage.from(...)` for homepage hosting
- No public bucket confirmed for website hosting

### Dashboard verification still required

Check manually:

Supabase Dashboard → Storage → Buckets

Look for bucket/file names like:

- `public`
- `site`
- `homepage`
- `landing`
- `access-hub`
- `job-mitra`
- `static`
- `web`
- `dist`
- `build`
- `index.html`

Decision:

- If none exist: no homepage/static hosting removal needed.
- If any exist: do not delete immediately. First confirm Cloudflare Pages replacement is live.

---

## 2. Site URLs / Redirect URLs / Auth Settings

### Current verified finding

No confirmed evidence that Supabase Auth Site URL or Redirect URLs were used to serve the homepage.

Job Mitra currently uses custom Node/backend auth persistence, not confirmed Supabase Auth frontend SDK flow.

### Known backend/auth direction

Supabase is used as PostgreSQL database infrastructure for Job Mitra auth/session persistence.

### Dashboard verification required

Check manually:

Supabase Dashboard → Authentication → URL Configuration

Record only non-secret values:

- Site URL
- Redirect URLs
- Additional Redirect URLs
- Email confirmation redirect, if configured
- Password reset redirect, if configured

Expected safe future setup when Cloudflare Pages is ready:

Site URL:

- `https://<job-mitra-cloudflare-pages-domain>`

Redirect URLs:

- `https://<job-mitra-cloudflare-pages-domain>/*`
- `http://localhost:5173/*`

Important:

Do not paste API keys, tokens, JWTs, passwords, cookies, or database URLs into chat.

---

## 3. Database Tables / RLS Policies Created

### Confirmed / known Job Mitra auth-related tables

The current known backend/auth database layer includes:

- `auth_users`
- `auth_sessions`
- `auth_audit_events`
- `auth_login_attempts`

Purpose:

- User authentication persistence
- Session tracking
- Login attempt tracking
- Audit/security event recording

Do not delete these.

---

### Confirmed / known notification-related migration tables

One Supabase migration was found for future notification/pulse style backend support:

- `notification_events`
- `notification_recipients`
- `notification_resolutions`
- `audit_logs`

Purpose:

- Notification event tracking
- Notification recipients
- Notification resolution state
- Audit logging

Do not delete these unless separately reviewed and approved.

---

### Not confirmed / not found as homepage CMS tables

No verified evidence found for homepage/CMS tables such as:

- `pages`
- `homepage`
- `landing_page`
- `site_config`
- `cms`
- `cms_pages`
- `products`
- `redirects`
- `hub_content`
- `access_hub_pages`

### RLS policies

No specific RLS policies for homepage/static hosting were confirmed from the available audit evidence.

Dashboard verification required:

Supabase Dashboard → Table Editor / SQL Editor / Authentication Policies

Check whether any RLS policies exist on:

- homepage/CMS tables, if any
- Storage buckets, if any
- public marketing/content tables, if any

Do not change RLS policies until the table/bucket purpose is confirmed.

---

## 4. Mithra Access Hub Supabase Status

### Current verified finding

No evidence that Mithra Access Hub is connected to Supabase.

Access Hub appears to be a separate static/frontend project, not Supabase-hosted.

### Not found

- No Supabase folder/config for Access Hub
- No Supabase Edge Functions for Access Hub homepage
- No Supabase Storage homepage bucket evidence
- No Supabase CMS tables for Access Hub
- No Supabase redirect configuration for Access Hub

Conclusion:

Mithra Access Hub should remain separate from Supabase unless explicitly approved later.

---

## 5. Job Mitra Supabase Status

### Current verified finding

Supabase is being used for Job Mitra backend database/auth infrastructure.

### Confirmed direction

Supabase role:

- PostgreSQL database
- Auth/session persistence backend support
- Audit/security event storage
- Future backend storage only if explicitly approved

Supabase is not currently verified as:

- frontend homepage host
- static website host
- CMS
- redirect service
- public marketing site host

---

## 6. Safe Steps to Decouple / Remove Homepage from Supabase

Important:
Do not delete anything first. Audit → backup → confirm Cloudflare replacement → remove only homepage-specific items.

---

### Step 1 — Confirm Cloudflare Pages target

Before removing anything from Supabase, confirm:

- Cloudflare Pages project exists
- Latest homepage build is deployed
- HTTPS URL works
- Job Mitra landing opens correctly
- Employee/Employer role selection works
- No fake production claims are shown
- Production app/backend is still marked NOT APPROVED unless separately approved

---

### Step 2 — Audit Supabase Storage

Go to:

Supabase Dashboard → Storage → Buckets

Check for homepage/static buckets.

If found:

1. Open bucket.
2. Check whether it contains homepage files like `index.html`, `assets/`, `dist/`, `build/`.
3. Export/download backup first.
4. Confirm Cloudflare Pages serves the same page.
5. Only then mark bucket as removable.
6. Do not delete auth/user/media buckets accidentally.

If not found:

- Mark: “No Supabase Storage homepage hosting found.”

---

### Step 3 — Audit Edge Functions

Go to:

Supabase Dashboard → Edge Functions

Check for functions named like:

- `homepage`
- `landing`
- `access-hub`
- `job-mitra`
- `redirect`
- `site`
- `public`

If found:

1. Copy function name only.
2. Do not expose code if it contains secrets.
3. Check whether any domain/URL points to it.
4. Disable/remove only after Cloudflare replacement is confirmed.
5. Keep a rollback note.

If not found:

- Mark: “No Supabase Edge Function homepage/redirect found.”

---

### Step 4 — Audit Auth URL Configuration

Go to:

Supabase Dashboard → Authentication → URL Configuration

Check:

- Site URL
- Redirect URLs

If they point to an old homepage:

1. Do not remove immediately.
2. Add Cloudflare Pages URL first.
3. Test auth/session flow.
4. Remove obsolete homepage URL only after testing.

Safe future values:

- Cloudflare Pages production URL
- Cloudflare Pages preview URL, if needed
- Local dev URL: `http://localhost:5173/*`

---

### Step 5 — Audit Database Tables

Go to:

Supabase Dashboard → Table Editor

Check for CMS/homepage tables:

- `pages`
- `homepage`
- `landing_page`
- `site_config`
- `cms`
- `cms_pages`
- `products`
- `redirects`
- `hub_content`

If found:

1. Export table backup first.
2. Confirm not used by Job Mitra backend.
3. Confirm not used by Access Hub.
4. Only then archive/remove after approval.

Do not touch:

- `auth_users`
- `auth_sessions`
- `auth_audit_events`
- `auth_login_attempts`
- `notification_events`
- `notification_recipients`
- `notification_resolutions`
- `audit_logs`

---

### Step 6 — Audit Custom Domains

Go to:

Supabase Dashboard → Project Settings → Custom Domains

Check whether any public website domain is attached.

If found:

1. Record domain name only.
2. Confirm whether it serves homepage/static content.
3. Move homepage DNS to Cloudflare Pages.
4. Remove Supabase custom domain only after Cloudflare works.

If not found:

- Mark: “No Supabase custom domain used for homepage.”

---

### Step 7 — Final clean target state

After cleanup, Supabase should be used only for:

- PostgreSQL database
- Backend auth/session persistence
- Audit logs
- Future approved backend storage

Supabase should not be used for:

- static homepage hosting
- Access Hub website hosting
- Job Mitra public marketing page hosting
- redirect service
- CMS unless explicitly approved

---

## 7. Final Verdict

Current evidence does not show any homepage/static hosting configured inside Supabase.

Most likely current Supabase role:

- Job Mitra backend PostgreSQL/auth persistence only

Action required:

- Manually audit Supabase Dashboard areas:
  1. Storage Buckets
  2. Edge Functions
  3. Authentication URL Configuration
  4. Table Editor
  5. Custom Domains

Do not delete anything until:

- Cloudflare Pages homepage is live
- URL works over HTTPS
- Auth redirect behavior is verified
- A rollback plan exists
