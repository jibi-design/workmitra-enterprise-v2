# Supabase Live State Note — Job Mitra / Access Hub boundary

> **Purpose:** Current verified Supabase state. Update this file when anything changes.  
> **Do not** re-audit from zero if this note is current — read this first, then check only deltas.  
> **Companion archive:** `SUPABASE_CONFIGURATION_AUDIT_ACCESS_HUB_JOB_MITRA.md`  
> **Operator UI map (click paths):** `SUPABASE_OPERATOR_UI_NAV_NOTE.md`  
> **Cloudflare note (separate):** `CLOUDFLARE_LIVE_STATE_NOTE.md`  
> **Rule:** `.cursor/rules/infra-live-state-notes.mdc`

**Last verified:** 2026-07-25 (operator: full dashboard 5-checks complete)  
**Overall status:** **CLOSED for homepage/static hosting** — Supabase = backend auth DB only; no homepage resources found  
**Project:** `jobmitra-enterprise-v2-dev` (org: Mitra Labs, FREE)  
**Production deployment:** NOT APPROVED

---

## 0. Runtime availability

| Item                       | Value                                                                                                  | Status                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Project compute/API        | Was paused (7-day free inactivity); now **Healthy**                                                    | VERIFIED (dashboard 2026-07-25)              |
| Region / compute           | West EU (Ireland) · Nano (`t3.nano`)                                                                   | VERIFIED                                     |
| GitHub on Supabase project | No repository connected                                                                                | VERIFIED (expected; not required for checks) |
| Unpause                    | Done (no Pro purchase)                                                                                 | DONE                                         |
| Dashboard 5-checks         | **5/5 complete**                                                                                       | DONE                                         |
| Home metrics note          | Last 60m: some AUTH warnings / POSTGRES errors / STORAGE warnings — **observe only; do not “fix” now** | NOTED                                        |

---

## 1. Current truth (quick read)

| Item                                          | Value                                                                                        | Status                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Intended Supabase role                        | Postgres + Job Mitra auth/session persistence only                                           | LOCKED DIRECTION                                |
| Homepage / static hosting on Supabase         | No Storage buckets; no Edge Functions; no CMS tables; no custom domain                       | **CLOSED — none found**                         |
| Access Hub connected to Supabase              | No evidence                                                                                  | CONFIRMED ABSENT                                |
| Frontend/homepage target                      | Cloudflare (see Cloudflare live note)                                                        | LOCKED DIRECTION                                |
| Auth tables in `public` (keep)                | `auth_users`, `auth_user_roles`, `auth_sessions`, `auth_login_attempts`, `auth_audit_events` | VERIFIED — DO NOT DELETE                        |
| Notification tables                           | Not visible in `public` Table Editor list this session                                       | NOT SEEN — do not create/delete without approve |
| CMS/homepage tables                           | None in `public`                                                                             | VERIFIED ABSENT                                 |
| Storage homepage buckets                      | None                                                                                         | VERIFIED ABSENT                                 |
| Edge Functions for homepage                   | None deployed                                                                                | VERIFIED ABSENT                                 |
| Auth Site URL / Redirect URLs                 | Site URL = `http://localhost:3000`; Redirect URLs = none                                     | RECORDED — do not change now                    |
| Custom domains on Supabase for website        | Pro add-on only; not configured on Free                                                      | VERIFIED ABSENT                                 |
| SQL migrations / DB mods this track           | Operator may apply Shift Ops only when explicitly approved                                   | See Shift Ops note                              |
| `shift_ops` migrations apply                  | **APPLIED** Phase 0+1; schema exposed; pepper ready=true                                     | See Shift Ops note                              |
| Shift Ops OTP Edge (`shift-ops-otp-dispatch`) | Stub **in repo only** (T2-2); **not deployed**                                               | See `SHIFT_OPS_LIVE_STATE_NOTE.md`              |

---

## 2. Dashboard checklist (operator)

| #   | Area                                            | Result                                            | Date       |
| --- | ----------------------------------------------- | ------------------------------------------------- | ---------- |
| 1   | Storage → Buckets (no homepage/static)          | **PASS — no buckets**                             | 2026-07-25 |
| 2   | Edge Functions (no homepage/redirect)           | **PASS — none deployed**                          | 2026-07-25 |
| 3   | Auth → URL Configuration (Site URL + Redirects) | **PASS** — `http://localhost:3000`; no redirects  | 2026-07-25 |
| 4   | Table Editor (no CMS; auth_* intact)            | **PASS** — 5 auth tables only in `public`; no CMS | 2026-07-25 |
| 5   | Project Settings → Custom Domains               | **PASS** — Pro-only; none configured              | 2026-07-25 |

**Homepage-on-Supabase investigation: CLOSED.** No removal/cleanup required.

---

## 3. Hard locks

- Do **not** run SQL migrations or DB modifications until explicitly instructed
- Do **not** delete `auth_*` or notification/audit tables
- Do **not** paste API keys, DB URLs, JWTs, service_role, or passwords into chat or this note
- Do **not** treat Access Hub as a Supabase app
- Do **not** delete Storage/Edge/Custom domain items until Cloudflare live note shows replacement verified **and** founder approves

---

## 4. Change log

| Date       | Who               | What changed                                                                                                                     | Note updated?             |
| ---------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 2026-07-25 | Operator + Cursor | Initial live note from archived Supabase configuration audit + Access Hub boundary                                               | YES — created             |
| 2026-07-25 | Operator + Cursor | Email: free-tier inactivity pause on `jobmitra-enterprise-v2-dev`; unpause within 90 days; Pro optional                          | YES — updated             |
| 2026-07-25 | Operator + Cursor | Project Home: **Healthy** (unpaused); FREE; Nano Ireland; no GitHub repo connected; 5-checks starting                            | YES — updated             |
| 2026-07-25 | Operator + Cursor | Storage Buckets: **empty** — no homepage/static buckets                                                                          | YES — updated             |
| 2026-07-25 | Operator + Cursor | Edge Functions: **none deployed** — no homepage/redirect functions                                                               | YES — updated             |
| 2026-07-25 | Operator + Cursor | Auth URL Configuration: Site URL `http://localhost:3000`; no Redirect URLs; Custom Domains = Pro-only / none                     | YES — updated             |
| 2026-07-25 | Operator + Cursor | Table Editor `public`: auth_* only (5 tables); no CMS/homepage. **5/5 checks CLOSED**                                            | YES — updated             |
| 2026-07-26 | Leader + Cursor   | Cross-link: Shift Ops OTP Edge stub in repo (T2-2), still not deployed; homepage Edge absense unchanged                          | YES — updated             |
| 2026-07-26 | Leader + Cursor   | T2-4 apply approved but BLOCKED: agent `.env` DATABASE_URL=localhost ECONNREFUSED; shift_ops still not confirmed on live project | YES — updated             |
| 2026-07-26 | Operator + Cursor | T2-4 Phase 0+1 applied via SQL Editor (Run and enable RLS). Expose `shift_ops` + pepper still open                               | YES — updated             |
| 2026-07-26 | Operator + Cursor | Created `SUPABASE_OPERATOR_UI_NAV_NOTE.md` from dashboard screenshots (Data API → Settings → Exposed schemas path)               | YES — linked              |
| 2026-07-26 | Operator + Cursor | T2-5 SQL smoke PASS; shift_ops vault privileges locked as designed                                                               | YES — via Shift Ops notes |

---

## 5. How to update this note (every Supabase session)

1. Read this file first.
2. Change only what you actually verified or changed in the dashboard.
3. Update **Current truth** rows and checklist Result/Date.
4. Add one line to **Change log**.
5. Set **Last verified** date.
6. Never store secrets in this file.
