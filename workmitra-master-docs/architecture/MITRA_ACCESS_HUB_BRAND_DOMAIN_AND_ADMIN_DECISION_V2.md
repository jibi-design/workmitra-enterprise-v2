---
title: Mitra Access Hub — Brand, Domain, and Admin Decision Record
brand: Mitra Labs
projects: Mitra Access Hub, Job Mitra
version: 2.0
status: LOCKED (operator-approved documentation reconciliation)
date: 2026-07-16
owner: Mitra Labs
supersedes_domain_plan: HOSTING_BACKEND_DATABASE_/02_DOMAIN_AND_BRAND_PLAN_REVIEWED.md (domain sections only)
---

# MITRA_ACCESS_HUB_BRAND_DOMAIN_AND_ADMIN_DECISION_V2

## Purpose

This document is the **canonical decision record** for Mitra Labs public brand naming, Mitra Access Hub platform role, product/service classification, and the `mitraaccesshub.com` domain family.

It applies to:

- **Job Mitra** (`WorkMitra_Enterprise_v2`)
- **Mitra Access Hub** (`mithra-access-hub`)

**Authority:** For brand, domain, and admin-hostname questions, this document wins over older hosting documents that reference `*.mitralabs.app`, `jobmitra.app`, or `job.mitralabs.com` unless explicitly marked as historical evidence.

**Preservation rule:** Historical reports, Phase 2/2.1 evidence, command logs, seed identities, and dated records must **not** be silently rewritten. Legacy domain strings in evidence remain as recorded, with a note that they reflect a superseded plan.

---

## A. Brand hierarchy — LOCKED

```text
Mitra Labs                          (parent company)
└── Mitra Access Hub                (umbrella website / platform)
    ├── Job Mitra                   (application / product)
    ├── Smart Tag                   (website / service)
    ├── Mitra Business QR           (website / service)
    ├── Master Admin                (separate admin surface)
    └── Future Mitra Labs offerings (phase-gated)
```

**Public naming — LOCKED:**

| Use              | Do not use as public brand     |
| ---------------- | ------------------------------ |
| Mitra Labs       | Mithra Labs, Mythra, Mitra Lab |
| Mitra Access Hub | Mithra Access Hub              |
| Job Mitra        | WorkMitra (public), Work MITRA |

Internal repository names (e.g. `WorkMitra_Enterprise_v2`, `@mithralabs/access-hub`) are **UNRESOLVED** for rename timing — see §I.

---

## B. Product / service classification — LOCKED

| Entity                       | Classification              | Notes                                                              |
| ---------------------------- | --------------------------- | ------------------------------------------------------------------ |
| **Mitra Labs**               | Parent company              | Owns all offerings below                                           |
| **Mitra Access Hub**         | Umbrella website / platform | Public gateway; not a product app                                  |
| **Job Mitra**                | **Application / product**   | Employee + Employer experiences; separate codebase from Access Hub |
| **Smart Tag**                | **Website / service**       | Not an application; separate website under domain family           |
| **Mitra Business QR**        | **Website / service**       | Not an application; separate website under domain family           |
| **Master Admin**             | Separate admin surface      | Cross-service oversight; not inside public product routes          |
| **Product / service admins** | Scoped admin per offering   | Hostnames **UNRESOLVED** (§I)                                      |

Access Hub **stub routes** (`/smart-tag`, `/business-qr` on the hub scaffold) are introductory shells only — not the final live Smart Tag or Business QR websites.

---

## C. Canonical domain matrix

| Role                                | Hostname                        | Status                                            |
| ----------------------------------- | ------------------------------- | ------------------------------------------------- |
| Primary / umbrella                  | `mitraaccesshub.com`            | **LOCKED**                                        |
| Job Mitra application               | `job.mitraaccesshub.com`        | **FUTURE INTENT**                                 |
| Smart Tag website / service         | `tag.mitraaccesshub.com`        | **FUTURE INTENT**                                 |
| Mitra Business QR website / service | `businessqr.mitraaccesshub.com` | **FUTURE INTENT**                                 |
| Master Admin                        | `admin.mitraaccesshub.com`      | **LOCKED** (hostname intent)                      |
| API (ecosystem)                     | `api.mitraaccesshub.com`        | **FUTURE INTENT** (not deployed from this record) |
| Staging (ecosystem)                 | TBD — see §I                    | **UNRESOLVED**                                    |

### LEGACY / SUPERSEDED hostnames (do not use for new decisions)

| Legacy hostname        | Superseded by                                                                   |
| ---------------------- | ------------------------------------------------------------------------------- |
| `mitralabs.app`        | `mitraaccesshub.com` family                                                     |
| `jobmitra.app`         | `job.mitraaccesshub.com`                                                        |
| `admin.mitralabs.app`  | `admin.mitraaccesshub.com`                                                      |
| `job.mitralabs.com`    | `job.mitraaccesshub.com` (runtime copy may still show legacy until later phase) |
| `api.mitralabs.app`    | `api.mitraaccesshub.com` (when locked)                                          |
| `staging.jobmitra.app` | Staging convention **UNRESOLVED**                                               |

---

## D. Temporary root-domain mode — TEMPORARY

**LOCKED (temporary launch):**

- `mitraaccesshub.com` may present the **Job Mitra landing / entry experience** for launch convenience.
- This is **temporary** and must not destroy, overwrite, or merge the existing **Mitra Access Hub homepage** asset in `mithra-access-hub`.

**Rules:**

- Access Hub homepage source remains in `mithra-access-hub` (route `/`).
- Smart Tag and Business QR hub stubs remain separate paths — not folded into Job Mitra.
- DNS / Cloudflare routing that implements temporary mode is **operator-managed** — not defined in this file.

---

## E. Future Access Hub restoration — FUTURE INTENT

When launch transitions complete:

1. `mitraaccesshub.com` (root) returns to the **full Mitra Access Hub homepage**.
2. Job Mitra application is served from **`job.mitraaccesshub.com`** (or approved equivalent).
3. Smart Tag and Business QR are served from their **own website/service hostnames** — not as “applications” inside Job Mitra.

---

## F. Master Admin model — LOCKED

| Principle                                                                                | Status                                  |
| ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Master Admin hostname                                                                    | `admin.mitraaccesshub.com` — **LOCKED** |
| Technically separate from public websites and applications                               | **LOCKED**                              |
| Must not use public product routes such as `/admin` as **final production architecture** | **LOCKED**                              |
| Scoped oversight across Mitra Labs services                                              | **LOCKED**                              |

Master Admin is **not** the same as in-product operational tools inside Job Mitra employer/employee flows.

---

## G. Product-admin scope rule — LOCKED

- Each product or service may have its **own scoped admin surface**.
- Product admins manage **only** their assigned product or service.
- Master Admin provides **central oversight** — not day-to-day product operations by default.
- **Exact product-admin hostnames are UNRESOLVED** — do not invent or finalise (e.g. no assumed `admin.tag.mitraaccesshub.com` without operator lock).

---

## H. Legacy domain handling — LOCKED

When older documents or evidence contain `mitralabs.app`, `jobmitra.app`, `admin.mitralabs.app`, or `job.mitralabs.com`:

1. **Preserve** the original quoted value in evidence tables, command output, seed examples, and screenshots.
2. **Do not** search-and-replace historical execution records.
3. Add a **LEGACY DOMAIN PLAN** notice at document top where the old plan is still readable as current guidance.
4. Point readers to **this document** for canonical decisions.

Runtime code, config, and public copy that still emit legacy domains are **intentionally unchanged** until a separate **runtime-copy / config phase** — see §I.

---

## I. Unresolved decisions — UNRESOLVED

| Item                                                                                               | Status                                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Canonical `support@` / `contact@` email under `mitraaccesshub.com`                                 | **UNRESOLVED**                         |
| Exact staging hostname (`staging.mitraaccesshub.com` vs `staging.job.mitraaccesshub.com` vs other) | **UNRESOLVED**                         |
| Exact product-admin hostnames per product/service                                                  | **UNRESOLVED**                         |
| Whether internal `@mithralabs` npm package scope will remain                                       | **UNRESOLVED**                         |
| Runtime migration timing for `appConfig`, `site.ts`, seed emails, PWA naming                       | **UNRESOLVED** — later phase           |
| Actual live Cloudflare routing / DNS evidence                                                      | **UNRESOLVED** — operator confirmation |
| Repository / deployment location of separately created Smart Tag and Business QR **live** websites | **UNRESOLVED**                         |
| Corporate marketing site path under `mitraaccesshub.com` vs dedicated company route                | **UNRESOLVED**                         |

---

## J. Superseded-document references

| Document                                                                 | Relationship                                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `HOSTING_BACKEND_DATABASE_/02_DOMAIN_AND_BRAND_PLAN_REVIEWED.md`         | **LEGACY / SUPERSEDED** for domain matrix; retained for history                       |
| `HOSTING_BACKEND_DATABASE_/03_HOSTING_BACKEND_DATABASE_PLAN_REVIEWED.md` | **Partially superseded** — infra stack may remain valid; domain rows superseded       |
| `HOSTING_BACKEND_DATABASE_/04_ADMIN_PORTAL_ARCHITECTURE_REVIEWED.md`     | **LEGACY / SUPERSEDED** for `admin.mitralabs.app`; separation model still informative |
| `HOSTING_BACKEND_DATABASE_/12_DECISION_LOCKS_REVIEWED.md`                | **LEGACY / SUPERSEDED** for domain locks                                              |
| `HOSTING_BACKEND_DATABASE_/13_BACKEND_FOUNDATION_MASTER_REVIEWED.md`     | **LEGACY / SUPERSEDED** for domain tables                                             |
| `HOSTING_BACKEND_DATABASE_/16_JOB_MITRA_BACKEND_ARCHITECTURE_v1.0.md`    | **LEGACY / SUPERSEDED** for admin hostname rows; API structure may remain valid       |
| `architecture/23_PHASE_2_1_PRODUCTION_READINESS_CHECKLIST.md`            | **Historical evidence** — preserve `staging.jobmitra.app` examples                    |
| `EXECUTIVE_MASTER_DECISION_DOCUMENT_v1.1.md`                             | Retained; domain rows superseded by this V2 record                                    |

### Existing Job Mitra in-app admin — deprecated-candidate

| Item                              | Classification                                          |
| --------------------------------- | ------------------------------------------------------- |
| `src/features/admin/**`           | **Existing / deprecated-candidate / later review**      |
| HashRouter `/admin/*` (dev-gated) | **Not final production architecture**                   |
| Action                            | **Do not delete or modify** without a future phase gate |

---

## Document change log

| Date       | Change                                              |
| ---------- | --------------------------------------------------- |
| 2026-07-16 | V2 created — Documentation Reconciliation Packet v1 |
