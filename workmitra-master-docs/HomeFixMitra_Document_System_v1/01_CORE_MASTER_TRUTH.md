# HOMEFIX MITRA — CORE MASTER TRUTH

## 1. Purpose

This document is the central truth file for HomeFix Mitra.

All domain documents inherit from this file.

If any domain document conflicts with this Core Master Truth, this file wins.

This document must stay short, strict, permanent and lock-safe.

Detailed feature architecture belongs in the separate domain documents.

## 2. Product Identity

**App name:** HomeFix Mitra

**Product type:** Home service memory system, bill vault and trust-preserving service continuity product.

**Core product direction:**

- service-memory-first
- trust-first
- privacy-safe
- role-separated
- complaint-aware
- bill/receipt-linked
- repeat-service-aware
- enterprise-grade
- Phase-0 demo-safe

## 3. What HomeFix Mitra Is

HomeFix Mitra is:

- a home service memory system
- a bill and receipt vault
- a service-history and continuity system
- a complaint and revisit continuity system
- a repeat-service and trust-preserving system
- a provider-context-safe record system
- a customer-controlled service-memory product

## 4. What HomeFix Mitra Is Not

HomeFix Mitra is not:

- a chat app
- a wallet or payment app
- a payment gateway
- an open marketplace
- a price-bidding system
- a provider-surveillance system
- a payroll system
- a legal verification authority in Phase-0
- a random service-directory product

## 5. Core Product Truth

HomeFix Mitra exists to help customers safely remember, organize, review and continue home-service history without losing trust, privacy or provider-context truth.

Product value must remain strongest in:

- bill and receipt continuity
- service history clarity
- complaint and revisit continuity
- provider-context clarity
- repeat-service continuity
- customer vault privacy

## 6. Role Separation Master Rule

The following provider contexts must remain strictly separate:

- Customer
- Independent Technician
- Shop Owner
- Shop Technician under shop context

Rules:

- Independent Technician must not be silently converted into Shop Owner or Shop Technician context
- Shop Owner personally doing service still remains Shop Owner context
- Shop Technician under shop context must not silently become independent provider context
- customer-facing record truth must preserve original provider source

## 7. Trust and Privacy Master Rule

The following truths are central and non-negotiable:

- complaint routing must follow original service source
- bill and receipt truth must preserve provider context
- customer vault remains customer-controlled
- phone number alone must not unlock historical records
- phone number alone must not prove ownership of service history, receipts, complaints or customer vault records
- provider access must remain service-context-bound
- provider access must never become full customer-vault browsing
- admin/governance must stay hidden from normal user flows
- old history must not be erased silently through correction or dispute handling

## 8. Non-App Customer Continuity Master Rule

Customer app installation must not be mandatory for basic service continuity.

A non-app customer may still be supported through safe receipt links, service links, provider-side entry or future support-assisted flows where supported.

Customer app installation may be invited only as optional value for:

- saving records
- finding bills later
- tracking complaint status more easily
- claiming old records safely
- preserving service memory

App installation must not be framed as mandatory pressure for complaint acceptance, service follow-up or receipt continuity.

## 9. Identity Master Rule

HomeFix Mitra must use one permanent person/account identity with multiple role-specific profiles.

`hfmId` is the permanent person/account identity.

Role-specific profiles may exist under the same `hfmId`:

- `customerProfileId`
- `independentTechnicianProfileId`
- `shopOwnerProfileId`
- `shopTechnicianProfileId`

Rules:

- do not create duplicate public permanent identity systems for each role
- one person may use multiple role contexts under the same `hfmId`
- the app must not guess the active role automatically
- user must explicitly enter or switch the active role/workspace where multiple profiles exist
- customer data must stay in customer context
- Independent Technician data must stay in independent technician context
- Shop Owner data must stay in shop-owner / shop context
- Shop Technician data must stay shop-linked and assignment-only
- every important record must preserve role/source context
- phone number is not identity proof
- `hfmId` must remain stable even if phone number changes

Public UI may show `hfmId` as:

- HomeFix Mitra ID
- Your HomeFix Mitra ID

Detailed identity, role-profile, active-context and record-context rules belong in `11_CROSS_DOMAIN_SYSTEM_RULES.md`.

## 10. Phase-0 Demo-Safe Master Rule

Phase-0 must remain demo-safe and honest.

Phase-0 must not pretend to provide:

- legal verification
- payment guarantee
- government verification
- real payroll/attendance authority
- real admin enforcement authority
- background surveillance
- hidden production-grade trust claims

Safe demo wording must always be preferred over fake production authority.

## 11. Non-Mixing Master Rule

HomeFix Mitra must not weaken product truth by mixing unrelated system meanings.

Do not mix:

- customer vault and provider convenience
- shop context and independent context
- complaint routing and random assignment
- receipt truth and payment truth
- attendance labels and payroll/legal attendance
- release status and permanent product architecture
- admin governance and launch-visible role flows
- person identity and role-specific working profiles
- active role context and historical source context

## 12. Global Product Readiness, Neutrality and Execution Safety

### 12.1 Global-Ready Product Rule

HomeFix Mitra must be treated as a globally adaptable product.

Product logic may begin from Indian market understanding, but product presentation must remain globally usable.

### 12.2 Currency Rule Summary

All money-related data must use an `amount + currency_code` model.

Rules:

- no permanent single currency symbol may be hardcoded across the product
- currency display must come from stored currency context
- financial display must remain context-aware and internationally extensible

### 12.3 Global Neutrality Rule

The app must not depend on one country, one religion, one region, one city or one local culture in order to function clearly.

### 12.4 Region and Culture Neutrality Rule

Avoid:

- hardcoded place-specific assumptions in product truth
- religion-specific assumptions
- culturally narrow product wording
- local-only execution assumptions as permanent product truth

### 12.5 International Format Readiness Rule

Phone and address handling must remain globally extensible.

Rules:

- country-code support must remain part of product truth
- address handling must not assume one local-only structure
- data model should remain internationally extensible

### 12.6 Execution Caution Summary

Product must not be weakened by:

- overbuilding
- identity mixing
- UI overload
- implementation shortcuts
- role-boundary leakage
- privacy weakening
- trust-signal inflation
- release-scope confusion

## 13. Inheritance Rule

All domain files inherit from this file first.

That includes:

- product identity
- role separation
- trust/privacy truth
- Phase-0 honesty
- complaint source truth
- provider-context separation
- customer vault protection
- global-ready neutrality rules
- non-app customer continuity rules
- identity master rule

If a lower document conflicts with this file, this file wins.

## 14. Final Boundary Rule

This file must remain:

- short
- strict
- stable
- permanent
- enterprise-grade
- safe as the master inheritance source

Detailed architecture belongs in domain files.

Detailed identity, role-profile and active-context rules belong in `11_CROSS_DOMAIN_SYSTEM_RULES.md`.

Temporary release truth belongs only in `13_RELEASE_CURRENT_STATUS.md`.
