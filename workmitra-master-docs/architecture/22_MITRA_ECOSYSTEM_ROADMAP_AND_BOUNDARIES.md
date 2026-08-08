<!-- App name: WorkMitra / Job Mitra
File name: 22_MITRA_ECOSYSTEM_ROADMAP_AND_BOUNDARIES.md
Full file path: D:\app\master document\JobMitra_Document_System_v1\22_MITRA_ECOSYSTEM_ROADMAP_AND_BOUNDARIES.md -->

# WORKMITRA / JOB MITRA — MITRA ECOSYSTEM ROADMAP AND BOUNDARIES

## 1. Document Status

Status: Enterprise draft for final lock  
Scope: Mitra ecosystem roadmap, cross-app identity, Trust Profile, Pay Mitra, Learn Mitra, Shop Mitra, implementation-status mapping, and employer identity data-model gap  
Applies to: Job Mitra / WorkMitra_Enterprise_v2 and future Mitra Labs ecosystem planning  
Does not replace: Core Master Truth or any domain architecture document

## 2. Inherits From

This document inherits:

- `00_DOCUMENT_INDEX_AND_SPLIT_MAP.md`
- `01_CORE_MASTER_TRUTH.md`
- `12_CROSS_DOMAIN_SYSTEM_RULES.md`
- `13_UI_DESIGN_SYSTEM_RULES.md`
- `15_BACKEND_LOGIN_MASTER_DOCUMENT.md`
- `16_FEATURE_IMPLEMENTATION_PRIORITY_MAP.md`
- `17_END_TO_END_WORKFLOW_CHECKLIST.md`
- `20_LOCAL_PERSISTENCE_VERIFICATION_MATRIX.md`
- Mitra Labs Universal Working Agreement v3.1.2

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 3. Purpose

This document closes four planning gaps found during the Job Mitra advanced feature document review:

1. Mitra ecosystem roadmap boundary
2. Pay Mitra future boundary
3. Implementation-status mapping requirement
4. Employer identity data-model gap tracking

This document is a planning and boundary-control document.

It must not trigger code implementation by itself.

## 4. Core Principle

Job Mitra must be stabilized first.

Future Mitra Labs ecosystem features must not be added randomly into Job Mitra.

Each ecosystem product or shared system must have:

- clear product purpose
- correct timing
- role-safe architecture
- backend/auth readiness
- Play Store-safe wording
- privacy-safe data handling
- no fake production claims
- no cross-project mixing

## 5. Current Locked Priority Order

The correct priority order is:

1. Stabilize Job Mitra / WorkMitra
2. Stabilize HomeFix Mitra
3. Complete document and feature gap review
4. Prepare backend/login architecture
5. Add backend/auth only after architecture lock
6. Plan Shared Mitra ID / Trust Profile only after both core apps are stable
7. Plan Pay Mitra as payroll/invoice/payment-record manager only
8. Consider Learn Mitra / Shop Mitra only after the core ecosystem is stable

Rule:

Do not start ecosystem implementation before Job Mitra and HomeFix Mitra are stable enough for safe shared identity planning.

## 6. Shared Mitra ID Boundary

### 6.0. UniCard / Public Mitra Labs ID — Option A LOCKED (2026-08-08)

Canonical lock document:

```txt
architecture/UNICARD_MITRA_LABS_ID_OPTION_A_LOCK_v1.0.md
```

Locked public UniCard / Mitra Labs ID format across all Mitra Labs products:

```txt
ML-XXXX-ABC-XXXX
```

Locked provenance rule:

```txt
Product codes (JM / WM / HFM / etc.) NEVER appear inside the public UniCard ID.
Product provenance is stored as source_app (and related membership metadata) in the user DB schema.
```

Locked minting plan:

```txt
ML ID minting moves from client-side to server-side during backend DB migration.
Auth UUID remains the security principal.
```

This Option A lock freezes the **public ID format + provenance model + minting migration plan**.
It does **not** by itself approve the full Shared Mitra ID / Trust Profile product rollout
(see §6.3 and §14.1).

### 6.1. What Shared Mitra ID Is

Shared Mitra ID is the future common identity anchor across Mitra Labs apps.

The public handle for that identity is the UniCard / Mitra Labs ID locked in §6.0.

It may later connect:

- Job Mitra worker/employer identity
- HomeFix Mitra technician/shop/customer-related identity where approved
- Trust Profile signals
- safe cross-app continuity
- future account-level identity

### 6.2. What Shared Mitra ID Is Not

Shared Mitra ID is not:

- current Phase-0 feature
- current localStorage-only login system
- legal identity proof
- government verification
- payment identity
- KYC system
- public universal profile
- replacement for app-specific role profiles
- a product-coded public ID string (JM/WM/etc. inside the UniCard ID)

### 6.3. Implementation Timing

Do not implement the full Shared Mitra ID / Trust Profile product now.

Shared Mitra ID product rollout still requires:

- backend login
- account ownership model
- role profile model
- privacy policy update
- account deletion model
- cross-app data boundary review
- user consent model
- Play Store data safety review

Allowed under Option A without opening the full Shared Mitra ID product:

- keep / enforce public format `ML-XXXX-ABC-XXXX`
- plan and execute client → server minting during backend DB migration
- store `source_app` provenance in user schema

### 6.4. Boundary Rule

Shared Mitra ID must never merge unrelated app data without explicit user permission and product-level approval.

Job Mitra work history must not automatically expose HomeFix Mitra service history.

HomeFix Mitra service records must not automatically expose Job Mitra employment data.

## 7. Trust Profile Boundary

### 7.1. What Trust Profile Is

Trust Profile is the future cross-app trust layer.

It may later include safe, permission-bound signals such as:

- ratings
- completed work history
- service history
- document readiness
- verified profile status where truly implemented
- trust-level movement
- review authenticity indicators
- dispute/correction history where approved

### 7.2. What Trust Profile Is Not

Trust Profile is not:

- legal verification
- fraud-proof guarantee
- public social reputation feed
- employer-controlled badge
- employee-controlled fake trust score
- hidden Admin risk leak
- payment trust score
- automatic cross-app surveillance profile

### 7.3. Implementation Timing

Do not implement Trust Profile now.

Trust Profile requires:

- backend identity
- rating integrity
- review authenticity rules
- user consent
- privacy controls
- appeal/correction process
- Admin governance architecture
- cross-app data-sharing boundary

### 7.4. Boundary Rule

Trust Profile must remain trust-supportive, not legally authoritative.

Use safe wording:

```txt
Trust summary
Work history signal
Profile readiness
Rating history
```

Avoid unsafe wording:

```txt
Officially verified
Legally approved
Fraud-free
Guaranteed safe
Government verified
```

## 8. Pay Mitra Boundary

### 8.1. Final Product Meaning

Pay Mitra must be planned as:

```txt
Payroll, invoice, wage and payment-record manager
```

It must not be planned as:

```txt
Wallet, banking, UPI, payment transfer or money transfer app
```

### 8.2. Correct Pay Mitra Scope

Pay Mitra may later support:

- salary slips
- wage records
- shift payout records
- service payment records
- invoice records
- advance records
- deduction records
- payment proof records
- monthly earning summaries
- employer payout summaries
- worker earning history
- service-provider payment history

### 8.3. What Pay Mitra Must Not Do

Pay Mitra must not become:

- real wallet
- bank account
- UPI/payment-transfer app
- stored-value system
- money transfer system
- lending system
- financial advice system
- tax filing authority
- legal payroll compliance authority without separate review

### 8.4. Implementation Timing

Do not implement Pay Mitra now.

Pay Mitra requires:

- separate product architecture
- backend security
- privacy and financial-data review
- Play Store policy review
- legal/accounting boundary review
- export/download rules
- permission model
- audit model
- separate release decision

### 8.5. Safe Wording

Allowed:

```txt
Payment records
Wage records
Salary slip records
Invoice records
Payout summary
Payment proof
Earning summary
```

Avoid:

```txt
Wallet
Send money
Receive money through app
Bank transfer
UPI payment
Cash transfer
Instant payout
Financial account
```

## 9. Learn Mitra Boundary

### 9.1. Possible Future Meaning

Learn Mitra may later become a learning and skill-development product.

Possible scope:

- work-readiness learning
- basic skill courses
- safety guidance
- job category learning
- certificate metadata where truly supported
- employer-required training readiness

### 9.2. Current Status

Learn Mitra is future-only.

Do not implement inside Job Mitra now.

### 9.3. Boundary Rule

Job Mitra may later show training readiness only if the learning system genuinely exists.

Do not claim completed certificates or verified training unless implemented and verified.

## 10. Shop Mitra Boundary

### 10.1. Possible Future Meaning

Shop Mitra may later support shop/business operations in the Mitra ecosystem.

Possible scope:

- shop profile
- shop staff coordination
- service/product records where approved
- business-side operational tools
- future link with HomeFix Mitra where approved

### 10.2. Current Status

Shop Mitra is future-only.

Do not implement inside Job Mitra now.

### 10.3. Boundary Rule

Shop Mitra must not be mixed into Job Mitra employer flows unless a future cross-product architecture approves it.

## 11. Implementation Status Mapping Requirement

### 11.1. Reason

The master documents define what the product should support.

Before backend/auth or new feature coding, the current app must be mapped against the documents.

### 11.2. Required Status Labels

Every launch-visible feature must be classified as exactly one of:

- UI only
- Local-working partial
- Local-working complete
- Backend-required
- Hidden/future only
- Not launch-ready

### 11.3. Required Verification Checks

For every launch-visible feature, verify:

- screen exists
- user action works
- validation works
- data saves locally
- list reflects saved data
- detail page opens saved data
- detail page shows saved values
- related dashboard/card updates
- app/browser close and reopen keeps data
- wrong-role access is blocked
- hidden/future UI is not exposed
- Play Store wording is safe

### 11.4. No Assumption Rule

Do not mark a feature as complete because the UI exists.

Do not mark close/reopen continuity as verified without direct test evidence or strong code evidence.

### 11.5. Output Requirement

The implementation mapping should later be stored in a separate document, recommended name:

```txt
23_CURRENT_APP_FEATURE_IMPLEMENTATION_STATUS_MAP.md
```

This document should compare current app behavior against the master documents.

## 12. Employer Identity Data-Model Gap

### 12.1. Current Issue

Employer trust visibility depends on stable employer identity.

Current accepted technical debt:

```txt
src/shared/employerProfile/EmployerTrustBadge.tsx
```

still uses employer settings fallback because employee-visible Career/Shift post data does not consistently carry:

```txt
employerWmId
```

### 12.2. Current Lock

Do not remove the fallback now.

Do not guess employer identity from company name.

Do not use current logged-in employer profile as employee-side identity truth.

Do not clean the component by weakening trust accuracy.

### 12.3. Correct Future Fix

The correct future fix is a data-model and sync upgrade:

1. Add `employerWmId` to employer Career post source data.
2. Add `employerWmId` to employer Shift post source data.
3. Ensure employee synced/search post data includes `employerWmId`.
4. Update Career search/display types.
5. Update Shift search/display types.
6. Update parsers and normalizers.
7. Pass `employerWmId` into `EmployerTrustBadge`.
8. Remove fallback only after all call sites are safe.

### 12.4. Backend Relevance

This issue should be solved before or during backend identity migration.

Backend should generate and enforce stable employer identity.

Employee-facing post data should carry safe employer trust identity without exposing private employer data.

## 13. Ecosystem Activation Gates

No future ecosystem feature may start until these gates are passed:

1. Product purpose is clear.
2. Correct project boundary is confirmed.
3. Launch vs hidden status is confirmed.
4. Backend requirement is confirmed.
5. Privacy impact is reviewed.
6. Play Store wording risk is reviewed.
7. Data ownership is defined.
8. Role access is defined.
9. Implementation priority is approved.
10. Rollback/removal risk is understood.

## 14. Current Go / No-Go Decisions

### 14.1. Shared Mitra ID / UniCard

Status:

```txt
Public UniCard format + provenance + mint migration plan: LOCKED (Option A).
Canonical lock: architecture/UNICARD_MITRA_LABS_ID_OPTION_A_LOCK_v1.0.md

Format: ML-XXXX-ABC-XXXX
No product codes inside public ID.
Provenance: source_app metadata.
Minting: client → server during backend DB migration.

Full Shared Mitra ID / Trust Profile product rollout: No-Go for implementation now.
Roadmap only (see §6).
```

### 14.2. Trust Profile

Status:

```txt
No-Go for implementation now.
Roadmap only.
```

### 14.3. Pay Mitra

Status:

```txt
No-Go for real payment transfer.
Future allowed only as payroll/invoice/payment-record manager.
```

### 14.4. Learn Mitra

Status:

```txt
Future-only.
No Job Mitra implementation now.
```

### 14.5. Shop Mitra

Status:

```txt
Future-only.
No Job Mitra implementation now.
```

### 14.6. Current Job Mitra Feature Status Mapping

Status:

```txt
Required next audit step before backend/auth coding.
```

### 14.7. EmployerTrustBadge Fallback

Status:

```txt
Keep accepted debt.
Do not remove until employerWmId data-model upgrade.
```

## 15. Final Boundary Lock

The Mitra ecosystem must grow through controlled architecture, not feature excitement.

Job Mitra must not become:

- Pay Mitra
- Learn Mitra
- Shop Mitra
- HomeFix Mitra
- generic super app
- hidden HR platform
- payment transfer app
- fake backend system

Job Mitra may later connect to the Mitra ecosystem only through approved backend identity, safe permissions, clear user consent and product-specific architecture.

---

— END OF DOCUMENT —
